# DESIGN SYSTEM

## Principles

1. **Dutch directness.** Short labels, plain language, no corporate fluff. "Offerte versturen", not "Voorstel ter beoordeling indienen". Assume a busy loodgieter on a scaffolding, one-handed.
2. **Trust signals everywhere.** KvK badge, verified-pro badge, neighbor-trust score, subsidy expertise badge, insurance badge — visible where decisions happen (search card, quote review, chat header).
3. **Energy-transition green accent.** ISDE / BENG / heat-pump flows get a distinct secondary color to signal the subsidy + sustainability narrative that differentiates Challenger from Werkspot.
4. **Accessibility first.** WCAG 2.2 AA baseline on day one, not retrofitted. Dutch screen-reader users are a meaningful slice of the consumer base.
5. **Mobile-first, web-parity.** The mobile app is the primary surface; web mirrors the same components where applicable.

## Color Tokens

Primary palette is teal (trust + water/plumbing association), secondary orange for energy-transition callouts (ISDE, heat-pump, solar).

```
primary/50       #E6F7F7
primary/100      #BFEAEA
primary/300      #66C6C6
primary/500      #0F9B9B   // brand core, teal
primary/700      #0A6F6F
primary/900      #064040

secondary/100    #FFE6D1
secondary/500    #F07A25   // energy-transition orange, accessible on white
secondary/700    #B3541A

neutral/0        #FFFFFF
neutral/50       #F7F8F8
neutral/100      #EBECEC
neutral/300      #C4C7C7
neutral/500      #8A8F90
neutral/700      #4A4F50
neutral/900      #161A1B

success/500      #1F8F4F
warning/500      #C78B14
error/500        #C93232
info/500         #2A6FC5
```

**Dark mode** swaps neutrals and dims primary/secondary by ~10% lightness; contrast is re-verified against AA. `ThemeMode.system` in Flutter, `prefers-color-scheme` on web.

Contrast floor: 4.5:1 for body text, 3:1 for large text + UI components. No primary/500 on neutral/50 for small text (fails AA; use primary/700).

## Typography

**Inter** (variable) for UI, system-ui fallback (`-apple-system, Segoe UI, Roboto`). Monospace only for numeric tables (Inter's tabular-nums feature).

Type scale (mobile; web scales up):

```
display/1   32 / 40   700   -0.01em
display/2   28 / 36   700
h1          24 / 32   600
h2          20 / 28   600
h3          18 / 24   600
body/lg     17 / 26   400
body        15 / 22   400
body/sm     13 / 18   400
caption     12 / 16   500
mono        14 / 20   Inter tabular-nums
```

Dynamic type respected; component layouts tested at 1.3×. Line heights generous because Dutch compound words are long.

## Spacing, Radius, Shadow

```
space/0   0
space/1   4
space/2   8
space/3   12
space/4   16
space/5   20
space/6   24
space/8   32
space/10  40
space/12  48
space/16  64

radius/sm  6
radius/md  10
radius/lg  16
radius/xl  24
radius/pill 999

shadow/sm  0 1 2 rgba(16,24,40,0.06)
shadow/md  0 4 8 rgba(16,24,40,0.08)
shadow/lg  0 12 24 rgba(16,24,40,0.10)
```

## Component Library

- **Buttons** — primary (filled teal), secondary (outlined), tertiary (text), destructive (filled red). Sizes sm/md/lg. Loading state: spinner replaces label, width locked. Min tap target 44×44.
- **Inputs** — text, number, postal code (with KvK-style auto-format `1012 AB`), BTW-nummer (validates `NL######B##` pattern), currency (shows `€` prefix with `nl-NL` formatting), date (Dutch date picker, Monday-first). Error state below field, assistive text in neutral/700.
- **Job cards** — title, trade category chip, status badge, price chip, postal-code pill, photo thumb, time-posted relative ("2 uur geleden"). Tap expands to detail.
- **Price chips** — `€450` for fixed, `€400 – €600` for range. Accent `AI-concept` pill when generated.
- **Status badges** — Dutch labels, color-coded:
  - `Nieuw` — neutral/500 bg, neutral/900 text
  - `Geaccepteerd` — primary/100 bg, primary/700 text
  - `Bezig` — secondary/100 bg, secondary/700 text
  - `Voltooid` — success/500 outline, success/500 text
  - `Geannuleerd` — neutral/300 bg, neutral/700 text, strikethrough title
  - `Afgewezen` — error/500 outline, error/500 text
- **Chat bubbles** — rounded (radius/lg asymmetric), author on right primary, counterpart on left neutral/50. Read receipts, typing indicator. PII stripped visibly before match with lock icon + tooltip "Contactgegevens worden gedeeld na akkoord".
- **Photo grid** — 3-column on mobile; tap opens zoom; each photo has a "markeer probleem" overlay that draws rectangles (used by AI photo-quote).
- **Quote breakdown card** — line items (labor / materials / travel / BTW 21% or 9%) with expandable detail; subsidy line shown as negative `Subsidie ISDE -€2.400` in secondary/700 when applicable; total in h2 typography.
- **Milestone timeline** — vertical stepper: `Offerte` → `Gepland` → `Bezig` → `Afgerond` → `Betaald` with current step highlighted, completed steps checked.
- **Review stars** — 1-5 halfstep, accessible label "4,5 van 5 sterren gebaseerd op 23 beoordelingen" (Dutch uses comma for decimals).
- **Neighbor-trust badge** — "Vertrouwd in jouw buurt" with a count ("12 klussen in 1012 AB"). Pill with house icon.
- **Subsidy badge** — "ISDE-expert" or "BENG-certificaat" in secondary accent.
- **Pro verification badge** — KvK shield icon + "Geverifieerd" label, primary/700 on primary/50.

All components exported in Flutter (`packages/ui`) and web (`packages/ui-web`) with identical prop APIs where feasible.

## Dutch Copy Rules

**Default: informal `je` / `jouw`.** Matches Werkspot + Marktplaats + most Dutch consumer apps. Feels human, not bureaucratic. Pros appreciate it ("zoals praten met een collega").

**Exceptions — formal `u` / `uw`:**
- Legal documents (ToS, privacy policy, DPA)
- Tax-related screens (BTW, facturen, jaaropgave)
- VvE-facing flows (homeowners' associations expect formal register)
- Dispute / complaint escalation flows (de-escalate with formality)

**Tone examples**

- Good: "Je klus staat live. We sturen je een bericht zodra er een offerte binnen is."
- Bad: "Uw aanvraag is gepubliceerd in onze database en u ontvangt een notificatie wanneer een dienstverlener een voorstel heeft ingediend."

**Glossary (partial)**

| Dutch | English (for devs) |
|---|---|
| Klus | Job |
| Offerte | Quote |
| Klant | Customer |
| Vakman / vakvrouw / pro | Professional |
| Loodgieter | Plumber |
| Elektricien | Electrician |
| Schilder | Painter |
| Stukadoor | Plasterer |
| Timmerman | Carpenter |
| Dakdekker | Roofer |
| CV-monteur | Central-heating engineer |
| Warmtepomp-installateur | Heat-pump installer |
| BTW | VAT |
| KvK | Chamber of Commerce |
| VvE | Homeowners' association |
| Buurt | Neighborhood |
| Subsidie | Subsidy (ISDE, BENG, SEEH, etc.) |

**Currency**: `€` prefix, `nl-NL` formatting (`€ 1.234,56` — period thousands, comma decimals). Never round up in the UI; always show exact BTW-inclusive amount. Dates: `ma 21 apr 2026`, short form `21-04-2026`.

## Accessibility

- **WCAG 2.2 AA** minimum on every screen; audited per release.
- **Dynamic type** supported up to 1.3×; tested on iOS Settings → Larger Text and Android font scale.
- **Screen reader labels** on every icon-only button; `Semantics` widgets in Flutter; `aria-*` in web. Dutch VoiceOver + TalkBack tested for key flows.
- **Reduced motion**: respects `MediaQuery.disableAnimations` / `prefers-reduced-motion`; micro-animations replaced with cross-fades.
- **Keyboard navigation** on web: every interactive element reachable via Tab; visible focus ring (2px primary/500 outline with 2px offset).
- **Color is never the sole signal**: status badges include an icon; error states include an exclamation plus text; required fields marked with `*` and the word "verplicht".
- **Hit targets** ≥44×44 on mobile; spacing between adjacent targets ≥8.

## Design Tokens Pipeline

Single source of truth lives in `/packages/ui-tokens/tokens.json` (Style Dictionary-compatible). On build:

- **Dart class** generated at `/packages/ui-tokens/lib/tokens.dart` (used by the Flutter `ThemeData`).
- **TypeScript object** at `/packages/ui-tokens/src/tokens.ts` (consumed by Next.js via Tailwind preset).
- **CSS variables** at `/packages/ui-tokens/dist/tokens.css` (fallback and design-tool sync).

A CI gate ensures the three outputs are in sync with the JSON source; drift fails the build. Figma variables pulled from the same JSON via the Tokens Studio plugin.

## Cross-Links

- `PRD.md` — feature screens that instantiate these components
- `TESTING-STRATEGY.md` — visual regression and accessibility gates
- `SECURITY-COMPLIANCE.md` — PII masking rules that constrain chat UI
- Flutter implementation notes in `/packages/ui/README.md`
- Next.js implementation notes in `/packages/ui-web/README.md`
