# RUNBOOKS

Incident playbooks for the ten scenarios most likely to page the on-call. Every playbook follows the same shape: **detection signals, severity, first 5 minutes, communication, rollback, postmortem trigger**. On-call has 15 minutes to respond to P0/P1 pages.

Global rules:

- Always create an incident channel `#inc-YYYYMMDD-<slug>` in Slack and invoke the `/incident` bot.
- Assign one Incident Commander (IC) — usually the primary on-call.
- IC does not fix; IC coordinates. A separate Tech Lead drives the fix.
- Every P0/P1 triggers a postmortem within 5 business days; P2 at IC's discretion.
- Status page is updated within 15 minutes of confirming customer-visible impact.

---

## 1. Stripe Webhook Outage / Payment Intent Creation Failing

**Detection signals**
- Sentry `stripe.webhook.failed` rate >5/min for 5 min
- Better Stack probe on `/api/webhooks/stripe` failing
- PagerDuty alert from `payment_intents_failed` metric: failure rate >2% over 5 min
- Pro complaints in support: "betaling blijft hangen"

**Severity**: P0 if payment creation is broken; P1 if webhook backlog is growing but creation still works.

**First 5 minutes**
1. Check https://status.stripe.com — is this upstream?
2. Query `SELECT count(*), status FROM stripe_events WHERE received_at > now() - interval '15 min' GROUP BY status;`
3. If Stripe is up but we're failing: check Vercel function logs for 500s on `/api/webhooks/stripe`
4. Verify webhook secret rotation hasn't been deployed in the last hour (`git log --oneline` on infra repo)
5. Flip feature flag `payments.force_manual_confirm` to true — bypasses webhook dependency for immediate captures

**Communication**
- Status page: "Degraded — Betalingen"
- In-app banner for active checkouts: "Betaling wordt verwerkt, dit kan enkele minuten duren."
- Slack #ops + #support within 10 min
- CEO + CFO paged if outage >30 min (revenue impact)

**Rollback**
- Revert the most recent deploy touching `/api/webhooks/stripe` or `packages/payments`
- If Stripe-side: hold; retries are automatic. Our webhook queue drains once Stripe resumes.

**Postmortem trigger**: any P0, or P1 lasting >30 min.

---

## 2. Supabase DB Down / Connection Pool Exhausted

**Detection signals**
- Supabase dashboard reports degraded or down
- `pgbouncer` pool saturation alert at >85% for 3 min
- 503s spiking across the API
- `could not acquire connection` errors in Sentry

**Severity**: P0 if the whole DB is unreachable; P1 if pool saturation without DB-level outage.

**First 5 minutes**
1. Check Supabase status page and support channel
2. Query `SELECT count(*) FROM pg_stat_activity;` via direct connection (bypass PgBouncer) — is it real load or a leak?
3. `SELECT pid, state, query_start, query FROM pg_stat_activity WHERE state != 'idle' ORDER BY query_start;` — are there long-running queries to kill?
4. Check recent deploys for new N+1 patterns or missing indices
5. If pool exhaustion: temporarily raise pool size in Supabase dashboard and restart PgBouncer

**Communication**
- Status page: "Incident — platform" (broad, since DB affects everything)
- In-app fallback: show "We werken aan een verbinding" retry UI
- Slack #ops #eng #support

**Rollback**
- If a recent deploy caused the pattern: revert immediately
- If load-driven: raise pool size, consider compute upgrade with Supabase support

**Postmortem trigger**: any P0.

---

## 3. Claude API Rate-Limited or Failing

**Detection signals**
- `ai.claude.errors` rate >5% over 5 min (Sentry + Better Stack)
- 429s on `/v1/messages`
- Quote generation latency p95 >15s (baseline ~4s)
- Pro-facing "AI-concept kon niet worden gegenereerd" error rate climbing

**Severity**: P1 (AI features degrade but core marketplace works).

**First 5 minutes**
1. Check Anthropic status page
2. Flip `ai.quote.fallback` flag to true — routes to the rule-based quote template (no AI) with banner "Snel handmatig invullen"
3. Verify organization-level rate-limit dashboard in Anthropic console
4. If rate-limited: confirm whether a recent code change is making extra calls (check traces)
5. If we're hitting cost spike thresholds too, see playbook #10

**Communication**
- Status page: "Beperkt — AI-offerte tijdelijk uit"
- In-app banner only on affected screens
- Slack #ops #ai

**Rollback**
- Revert any prompt or model-routing change deployed in the last 6 hours
- Consider temporary fallback to Haiku for cheaper/faster fallback tier

**Postmortem trigger**: outage >1h or customer-visible for >30 min.

---

## 4. Whisper / OpenAI Unreachable

**Detection signals**
- Voice-quote upload failing; `openai.whisper.errors` >10%
- Sentry: `OpenAIError: The server is overloaded`

**Severity**: P2 (voice feature degrades; users can still type their description).

**First 5 minutes**
1. Check OpenAI status page
2. Flip `ai.voice_quote.enabled` to false; UI falls back to text input with banner "Spraak-naar-tekst tijdelijk uit"
3. Queued voice files held in `voice_transcription_queue` for retry when service returns
4. Consider routing to self-hosted `faster-whisper` on a Fly.io fallback if outage >2h

**Communication**
- Status page note only
- In-app banner
- Slack #ops

**Rollback**: feature flag only; no code rollback needed.

**Postmortem trigger**: outage >4h.

---

## 5. KvK API Down During Pro Onboarding

**Detection signals**
- `kvk.verify.errors` spiking
- Pro onboarding funnel drop at verification step (PostHog funnel alert)
- Pros in support: "mijn KvK wordt niet gevonden"

**Severity**: P1 (blocks new pro activation; existing pros unaffected).

**First 5 minutes**
1. Check KvK developer portal for incident notices (they're not great at status pages — Slack our KvK contact)
2. Flip `kvk.queue_for_manual_review` flag to true — pros proceed past verification, land in manual queue with kvk_verified_at null and a "Verificatie in behandeling" state; they can post but can't yet receive payouts until verified
3. Staff the manual review queue; T&S has a lookup tool that uses the public KvK web search as a fallback
4. Monitor queue size; ensure no pro is stuck >24h

**Communication**
- Status page: "Beperkt — professional verificatie"
- Email to in-flight onboarding pros: "We ronden je verificatie handmatig af, je hoort binnen 24 uur van ons"
- Slack #ops #t-and-s

**Rollback**: flag only.

**Postmortem trigger**: outage >4h or >50 pros queued.

---

## 6. FCM Push Delivery Broken

**Detection signals**
- FCM console error rate spike
- `notifications.delivered` / `notifications.sent` ratio drops >20% over 30 min
- Pros on iOS complaining about missed job notifications

**Severity**: P1 for payment + job-accept notifications (time-sensitive); P2 for everything else.

**First 5 minutes**
1. Check Firebase status
2. Confirm APNs certificate hasn't expired (monitored separately but double-check)
3. Verify FCM server key rotation didn't break anything in the last 24h
4. Flip `notifications.email_fallback` to true — critical notifications (job accepted, payment received, dispute opened) also go via email
5. For P0-class messages (payment failed, account suspended), SMS fallback via MessageBird

**Communication**
- No status page note unless >30% users affected
- In-app banner: "Controleer je email voor belangrijke updates"
- Slack #ops

**Rollback**: feature flag; no code rollback.

**Postmortem trigger**: outage >2h affecting >10% of notifications.

---

## 7. Next.js Deploy Rolled Back / Partial Outage on Vercel

**Detection signals**
- Vercel dashboard: deployment error / edge function crash loop
- Better Stack: web probe fails
- Sentry error rate spike immediately after a deploy

**Severity**: P1 (web affected; mobile likely still works against the same backend).

**First 5 minutes**
1. In Vercel: **Instant Rollback** to the previous production deployment (one-click)
2. Confirm rollback success via Better Stack synthetic probe green
3. Capture the failing deployment ID + logs for postmortem
4. If rollback also fails (rare): promote `last-known-good` preview deployment manually
5. Lock `main` branch merges until cause identified

**Communication**
- Status page if customer-visible impact lasted >5 min
- Slack #ops #eng
- Notify author of the offending PR to lead the fix

**Rollback**: Vercel one-click.

**Postmortem trigger**: any rollback reaching production.

---

## 8. RLS Regression Exposing Data

**Detection signals**
- Security researcher report
- Bug bounty submission
- Internal QA catches data leakage in staging (ideal case)
- Audit log shows unusual cross-tenant queries

**Severity**: **P0 always.** Credential-impact.

**First 5 minutes**
1. IC assigned; Tech Lead is a security engineer
2. Identify the table + policy involved
3. **Immediately re-enable the most restrictive policy** via SQL hotfix (e.g., `ALTER TABLE x FORCE ROW LEVEL SECURITY; CREATE POLICY deny_all ON x FOR ALL USING (false);`) — this is a deliberate break-glass
4. Enumerate the exposure window: when did the bad policy deploy, how many queries ran against it, which user IDs were affected
5. Prepare the `audit_log` + Postgres query-log extract for forensic review

**Communication**
- Status page: "Onderhoud — gegevensbescherming" (vague while forensics run)
- DPO paged within 15 min — AVG Art. 33 72h clock may have started
- Slack #sec-audit, CEO, Legal

**Rollback**: revert the policy migration via a compensating migration; never `git revert` alone — must also be applied to the live DB.

**Postmortem trigger**: always. Includes AVG breach-notification decision with DPO.

---

## 9. Security Incident (Credential Leak, Unauthorized Access)

**Detection signals**
- gitleaks alert on public GitHub
- Anomalous admin login (geo-velocity, new ASN)
- Audit log shows unexpected admin action
- External report (security@)

**Severity**: **P0.**

**First 5 minutes**
1. Assume breach. Rotate **every** credential reachable from the affected surface:
   - Supabase service role key
   - Stripe restricted keys
   - OpenAI + Anthropic API keys
   - KvK API key
   - FCM server key
2. Force-logout every admin + pro account (`DELETE FROM auth.sessions`)
3. Disable affected admin user pending review
4. Preserve logs: export `audit_log`, PagerDuty timeline, Slack channel to `/inc/<id>/` immutable bucket
5. Page DPO + CEO + outside counsel

**Communication**
- Do NOT update status page yet — coordinate with legal first
- Internal Slack limited to invited #sec-ir channel
- External disclosure timed with legal after forensics

**Rollback**: not applicable; this is a forward-only response.

**Postmortem trigger**: always. Public postmortem if user data confirmed exposed.

---

## 10. AI Cost Spike (>2× Budget in 1 Hour)

**Detection signals**
- Finance dashboard: hourly AI spend >2× rolling 7-day hourly average
- Anthropic / OpenAI bill-to-date pacing alert
- Per-user AI call rate-limit alert (one user making 1000+ calls)

**Severity**: P1 (revenue-margin threat; not user-visible yet).

**First 5 minutes**
1. Identify source: `SELECT user_id, endpoint, count(*), sum(tokens_in + tokens_out) FROM ai_calls WHERE created_at > now() - interval '1 hour' GROUP BY 1,2 ORDER BY 3 DESC LIMIT 20;`
2. If a single user: rate-limit that user (rare legit case, likely abuse or a bug in their retry logic); notify via email
3. If a broad spike: check for a prompt regression (new prompt using more tokens unnecessarily) or a runaway loop (client calling on every keystroke)
4. Flip `ai.quote.cache_ttl_hours` from 24 → 168 to force more cache hits
5. If still climbing: flip `ai.quote.enabled` off entirely and fall back to rule-based quotes

**Communication**
- No user-facing comms unless fallback engaged
- Slack #ops #ai #finance

**Rollback**: revert the offending prompt/model change; restore cache config.

**Postmortem trigger**: any single hour >3× budget, or cumulative daily >50% over budget.

---

## Cross-Links

- `SECURITY-COMPLIANCE.md` — breach notification, DPO responsibilities
- `TESTING-STRATEGY.md` — chaos tests that rehearse these playbooks
- `LAUNCH-CHECKLIST.md` — rehearsal gate before production launch
- `MONETIZATION.md` — AI cost ceiling referenced in playbook #10
