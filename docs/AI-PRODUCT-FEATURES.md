# AI Product Features — Werkspot Challenger

## Shared conventions

- **Primary vendor:** Anthropic Claude. Sonnet 4.5 for vision/reasoning/structured output. Haiku 4.5 for translation + classification. OpenAI Whisper-v3 only for speech-to-text.
- **Prompt caching:** every repeated system prompt (pricing tables, subsidy rules, glossary) uses `anthropic-beta: prompt-caching-2024-07-31` with 5-minute TTL. Cache-key helper lives in `packages/ai-prompts/cache-keys.ts`. **Target >70% cache hit rate.**
- **Prompt versioning:** semver per prompt, stored in `packages/ai-prompts/{feature}/v{n}.ts`. Outputs are written to `job_events` with `event_type='ai_output'` + `model_version` + `prompt_version` for replay + eval.
- **Token budget per feature:** enforced client-side before dispatch; hard-cap in Edge Functions via `max_tokens`.
- **Evals:** datasets + rubrics in `packages/ai-evals/{feature}/`. CI runs sampled subset per PR; nightly full suite. Regression above threshold blocks merge.
- **Cost cap:** global alert at 4% of rolling 7-day commission revenue; hard-pause non-critical AI features (voice, photo-quote, blurbs) at 5%. Translation and dispute mediation are critical and exempt.
- **Guardrails:** every output has a `confidence` field; below threshold the UI says *"ask a pro to confirm"*. User text is always treated as untrusted input; system prompts are pinned and never interpolate raw user input without schema boundaries. PII scrubbers run on all AI inputs.
- **Kill switches:** each feature has a flag in `feature_flags` + PostHog, toggleable without deploy.
- **Telemetry:** PostHog events `ai.<feature>.started`, `ai.<feature>.completed`, `ai.<feature>.failed`, with `cost_cents`, `cache_hit`, `latency_ms`, `confidence`.

---

## 1. Voice job-posting (Dutch)

**UX:** Homeowner taps the mic, says *"Mijn CV-ketel lekt in de meterkast, het druppelt al een dag"*. Waveform animates. On release, transcript appears editable. Below, a structured preview card shows `{category: Loodgieter, urgency: high, needs_photos: yes, postal_code: auto-from-device}`. Tap Post.

- **Runs in:** Next.js API route `/api/ai/voice-intake` (streaming). Whisper handled via Edge Function `whisper-proxy` to keep OpenAI key out of client.
- **Model:** Whisper-v3 (transcription) → Claude Sonnet 4.5 with function-call schema.
- **Cached system prompt (~2k tokens):** Dutch categories list, urgency heuristics, regional slang, postal-code parsing rules.
- **Schema:** `{ category: enum, description: string, urgency: enum, needs_photos: bool, postal_code: string|null, confidence: number }`.
- **Cost:** Whisper ~€0.006/minute + Sonnet ~€0.02/call → **~€0.03/post**. At Y1 40k jobs × 35% voice = 14k × €0.03 = **€420/yr**.
- **Guardrails:** confidence <0.6 → fall back to editable form prefilled with transcript.
- **Kill switch:** `ai_voice_post`.
- **Evals:** 150 recorded Dutch voice samples across accents/dialects; category accuracy target ≥92%; urgency accuracy ≥85%.

## 2. Photo-to-quote-range

**UX:** Homeowner uploads 2–5 photos (damage close-ups + room context). Streaming UI shows "Analyzing photos..." → reveals `€180–€320` chip with confidence bar + "We'll verify onsite: water damage extent, pipe type, tile matching."

- **Runs in:** Next.js API route `/api/ai/photo-quote` (SSE streaming).
- **Model:** Claude Sonnet 4.5 Vision. Inputs: photos (base64 or signed URL), category, postal_code, `postal_code_stats` snippet (p25/p50/p75 for that category + buurt).
- **Cached system prompt (~3k tokens):** regional pricing rules, materials cost heuristics, image-assessment rubric.
- **Cache key:** `{category, postal_prefix_4}`.
- **Schema:** `{ min_cents, max_cents, confidence, verify_onsite: string[], materials_hint?: string[] }`.
- **Cost:** ~€0.08/quote (vision is the expensive part). Y1: 40k × 35% = 14k × €0.08 = **€1,120/yr**. Smart-quote fee 1.5% recovers far more.
- **Guardrails:** confidence <0.5 → show range but label "rough estimate"; no range output if the photos don't match the category (refuse + ask for better photos).
- **Kill switch:** `ai_photo_quote`.
- **Evals:** 200 labeled photo-sets with real transaction outcomes; range must contain actual final price ≥75% of the time.

## 3. ISDE/SEEH/BTW subsidy co-pilot

**UX:** After a customer creates a heat-pump or solar job, a green banner appears: *"Je komt mogelijk in aanmerking voor €4.200 ISDE-subsidie. Laat ons het aanvragen?"* Tap → wizard collects kadaster data + device type → generated RVO form PDF + e-sign link. €49 success fee on approved subsidy.

- **Runs in:** Next.js Server Action, fallback Edge Function for async polling.
- **Model:** Claude Sonnet 4.5 with tool calls `calc_isde(device, power_kw, build_year)`, `calc_btw_reduced(line_items[])`, `list_eligible_devices(category)`.
- **Cached system prompt (~8k tokens):** full RVO ISDE/SEEH rule base, BTW-laag rules, document-requirement matrix. **Huge cache win — we call this a lot with the same prompt.**
- **Schema:** `{ scheme, estimated_amount_cents, eligibility_reasons: string[], required_documents: string[], confidence }`.
- **Cost:** ~€0.04/job (cached system prompt reduces cost dramatically). Y1: 5k eligible × €0.04 = **€200/yr**.
- **Revenue:** €49 × 30% approval rate × 5k eligible = **€73,500/yr** net at <0.4% AI cost ratio.
- **Guardrails:** never file without explicit user consent + e-sign; always show source rule; human review queue on edge cases.
- **Kill switch:** `subsidy_copilot`.

## 4. Multilingual chat bridge

**UX:** Pro types in Polish. Message appears to pro as-sent (Polish bubble). Customer sees Dutch translation bubble + a tiny "View original" toggle. Round-trip latency <2s.

- **Runs in:** Supabase Edge Function `translate-message`, triggered by DB `AFTER INSERT ON messages` trigger via `pg_net` HTTP call.
- **Model:** Claude Haiku 4.5 (fast + cheap). Fallback: queue + retry.
- **Cached system prompt (~1.5k tokens):** trade glossary (Loodgieter, Elektricien, CV-ketel, warmtepomp, BTW, kwitantie, offerte, etc.) + tone guidance + "preserve numbers/dates/addresses verbatim".
- **Schema:** translated jsonb `{ nl, en, pl, tr, ar, uk }` — only the target locale is generated; the rest are hydrated on-demand.
- **Cost:** ~€0.002/message. Y1 at 2M messages = **€4,000/yr**.
- **Guardrails:** detect PII patterns (NL phone numbers, IBAN) → preserve verbatim; never "interpret" contractual terms.
- **Kill switch:** `chat_translation` — when off, UI shows original language with a browser-translate prompt.
- **Evals:** 500 human-graded translations across 6 languages; BLEU target + adequacy grade ≥4/5.

## 5. AI quote-drafter (ChallengerPRO perk)

**UX:** Pro opens a job → taps "Draft quote". Claude reads the job + the pro's last 10 accepted quotes + category averages → drafts a line-item quote with pro's voice. Pro edits + sends.

- **Runs in:** Next.js API route `/api/ai/quote-draft` (streaming).
- **Model:** Claude Sonnet 4.5, few-shot on pro's past quotes (stored in Supabase).
- **Cached system prompt (~2k tokens):** Dutch quote conventions, BTW handling, line-item best practices.
- **Schema:** `{ line_items: [{label, qty, unit_price_cents}], valid_days: int, notes, confidence }`.
- **Cost:** ~€0.05/draft. Gated behind ChallengerPRO subscription.

## 6. Neighbor-trust blurbs

**UX:** On pro profile, a small card: *"5 buren in 1056AB hebben Jan aangenomen voor warmtepomp installatie, gemiddeld 4.8★."* Also surfaced on search results sort: "Populair in jouw buurt".

- **Runs in:** Edge Function `neighbor-blurb` triggered nightly by `pg_cron`.
- **Model:** Claude Haiku 4.5 with batch calls.
- **Inputs:** aggregated `postal_code_stats` rows + anonymized completed-job counts per pro per buurt.
- **Cost:** amortized <€0.01/blurb. ~50k blurbs/night = €500/night at most, but we only refresh changed cells → actual ~€50/night.
- **Guardrails:** minimum 3 completed jobs to generate a blurb (k-anonymity). No individual names shown without opt-in.
- **Kill switch:** `neighbor_blurb`.

## 7. AI dispute mediator (Phase 5, human-in-loop)

**UX:** Either party hits "Dispute" → wizard collects: evidence photos, chat excerpt, what they want. Within 2h, both see a proposed split with rationale. Above €500 a human mediator reviews before the proposal is shown; below €500 it's auto-proposed with a "human review" opt-out.

- **Runs in:** Next.js Server Action, with ~1h think-time queue.
- **Model:** Claude Sonnet 4.5, full job timeline + evidence as context.
- **Schema:** `{ proposed_customer_refund_cents, proposed_pro_payout_cents, rationale, confidence, precedent_job_ids?: string[] }`.
- **Guardrails:** always surface the model's rationale; humans can override; every override becomes training data for future evals.

---

## Cost roll-up — Y1 at forecast volume

| Feature | Annual AI cost | Revenue attribution |
|---|---|---|
| Voice posting | €420 | Conversion lift |
| Photo-to-quote | €1,120 | 1.5% smart-quote fee on ~40% of quotes |
| Subsidy co-pilot | €200 | €49 × 1,500 approvals = €73,500 |
| Chat translation | €4,000 | Supply expansion |
| Quote drafter | €3,000 | ChallengerPRO subscription moat |
| Neighbor blurbs | €18,000 | Conversion lift |
| Dispute mediator | €5,000 | Trust + retention |
| **Total** | **~€32k** | **<1% of commission revenue Y1** |
