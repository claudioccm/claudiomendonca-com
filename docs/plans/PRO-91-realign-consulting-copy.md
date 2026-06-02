---
title: "content: Realign /consulting + home copy to the AI Services Studio strategy"
type: content
status: active
date: 2026-06-02
ticket: PRO-91
origin: docs/plans/PRO-91-source-brief.md
---

# PRO-91 — Realign /consulting + home copy to the AI Services Studio strategy

## Summary

The `/consulting` page and the home page's consulting pointer were built from the
prototype copy, before the AI Services Studio strategy was finalized. The live copy
speaks to dev peers ("builders, founders, engineers") and hides pricing — both of
which contradict the decided strategy (sell outcomes to non-technical,
publication-producing orgs; publish the prices). This is a **copy + data** change
across four files under `app/`. No new components, no architecture, no routing.

The offerings data array (`app/data/consulting.ts`) is already data-driven, so
re-shaping the offerings needs zero markup edits to `ConsultingEntry`. The only
genuinely new surface is a **pricing-card section** added to `app/pages/consulting.vue`,
which needs a small amount of new CSS in `app/assets/css/sections.css` (a price-row
grid primitive) — everything else reuses existing section primitives.

All draft copy is author-ready in the origin brief (Draft 1/2/3). This plan sequences
that copy into the four files and pins down the decisions the brief left open.

---

## Problem Frame

The site was built from `_process/prototype/` copy. The strategy spine
(`ai-consulting/strategy/`) was decided later and inverts the page's two biggest
moves:

- **ICP is inverted (G1).** Page hero "Ship AI that actually works." talks to engineers.
  Strategy sells outcomes to research nonprofits, foundations, think tanks, and small
  expert teams who rebuild recurring reports/briefs/newsletters by hand.
- **Pricing is hidden (G4).** `HowItWorks.vue` ends "Pricing intentionally not shown on
  the page." Strategy §6 names *published pricing* as a deliberate differentiator
  ("nobody in the direct set shows numbers").
- **Offering taxonomy is wrong (G3).** Page lists Agent Architecture / AI Automation /
  AI Training with dev-flavored outcomes. Strategy splits work into Automate (the wedge)
  + Empower (the moat), entered through a paid Opportunity Audit, with Care & R&D as the
  ongoing product.
- **No DIY counter (G5)** and **no accountability framing (G7).**

This ticket realigns the website copy + data to that spine. It does **not** touch the
strategy repo (`ai-consulting/` is a loose, un-versioned folder; pure strategy → site
copy flow).

---

## Requirements Traceability

Mapped to the origin brief's gap IDs (G1–G12). Each is addressed by one or more
implementation units below.

| Gap | What it requires | Unit |
|---|---|---|
| G1 | Rewrite hero + "The brief" to publication/report-producing ICP | U2, U3 |
| G2 | Lead with outcome + tagline + capability descriptor | U2 |
| G3 | Restructure offerings to Audit / Automate / Empower (+ optional Care & R&D) | U1 |
| G4 | Publish a price card; remove "pricing not shown" line | U4, U5 |
| G5 | Add DIY-counter block with MIT stat callout | U3 |
| G6 | Proof / case-study slot — **DEFERRED**, no fabricated metric (see Scope) | — |
| G7 | Add human-in-the-loop / accountable framing | U1, U3, U5 |
| G8 | Foreground design-craft / publication-quality ("output you'd put your name on") | U1, U2 |
| G9 | Reframe Care & R&D as the ongoing product, not optional support | U1, U5 |
| G10 | Replace dev-peer hero voice with outcome copy | U2 |
| G11 | Realign home About → consulting pointer | U6 |
| G12 | Keep "enablement" out of brand copy | U1 (verify) |

Origin pre-publish checklist items (Motto display-type check at mobile, publish-pricing
go, swap real prices, voice gut-check) are carried into Open Questions and Verification.

---

## Key Technical / Content Decisions

**KTD-1 — Three offering cards, not four (Care & R&D folded into How-it-works).**
The brief recommends running **3 cards** (Audit / Automate / Empower) and folding
Care & R&D into How-it-works step 03 ("Run it"). This plan adopts the 3-card path as
primary because: (a) Care & R&D is the *ongoing product*, which reads more naturally as
the terminal step of the engagement flow than as a peer offering; (b) it keeps the
"Offerings" count label stable as "Offerings — 03"; (c) the brief's Draft 2 card 04 is
explicitly marked optional. The 4th-card variant is documented in U1 as a conditional —
if the owner wants Care & R&D as a peer card, add Draft 2 §04 verbatim **and** change the
`consulting.vue` label from "Offerings — 03" to "Offerings — 04" (the count is the source
of inconsistency risk; see KTD-2).

**KTD-2 — The offerings array is the source of truth; the "Offerings — NN" label is
hand-maintained and must match the rendered card count.** `app/pages/consulting.vue`
hardcodes `<span class="label">Offerings — 03</span>` while the list iterates
`consultingOfferings`. These two must agree. This plan keeps both at 3. Deriving the
label from `consultingOfferings.length` is a known latent improvement (noted in the data
file's own header comment as deferred to "U6") — **out of scope here**; the plan keeps
the hardcoded label and pins it to the card count by hand. Flagged in Verification.

**KTD-3 — Prices are placeholder `9999,00` on every line.** Do not invent real numbers.
The brief's working figures (Audit ~$5k · Build from ~$12k · Empower ~$3–8k · Care
from ~$2k/mo USD) are recorded here for the owner only and must **not** appear on the
page. Every price token renders literally as `9999,00` (comma decimal, matching the
brief's Draft 3 table). Swapping in real numbers is a separate, owner-gated follow-up.

**KTD-4 — Proof / case-study slot is deferred; lead on the MIT stat.** Shorenstein has
no numbers before launch. Do not fabricate a client metric. The page leads credibility
on the verified MIT stat callout (G5/G6). No empty proof markup is added in this pass —
the "slot" is conceptual; the MIT callout occupies the credibility position. A real
"X hrs → Y min" case study lands post-launch as its own ticket.

**KTD-5 — Reuse existing section primitives; add one new CSS block for price rows.**
The hero, "The brief", DIY-counter, and How-it-works all reuse existing primitives
(`.shell`, `.section-head`, `.label`, `.bio-grid`, `.bio-body`, `.steps`/`.step`,
`.section-trail`, `.secondary`, `.t-caption`, `.btn*`). The pricing card is the only
section with no existing layout primitive — it needs a new `.price-list` / `.price-row`
grid in `sections.css` (offer label left, price + qualifier right, hairline rule between
rows, single-column collapse at the existing 800px breakpoint, matching `.steps` and
`.cta-banner` responsive conventions). This is the only genuinely new CSS. The DIY-counter
stat callout reuses `.bio-grid` + `.secondary` and a blockquote/`.t-caption`-style
treatment rather than introducing a bespoke component.

**KTD-6 — Preserve the `ConsultingEntry` contract.** `title` carries an embedded `<br />`
and is rendered via `v-html` (static, repo-controlled — no XSS surface). New offering
titles in `consulting.ts` keep the same shape: e.g. `'Automate the<br />repetitive.'`
(brief Draft 2). `id` slugs change to match the new offerings (`opportunity-audit`,
`automate`, `empower`). No edit to `ConsultingEntry.vue` is required.

**KTD-7 — Voice: terse, no hype, straight quotes.** All copy uses straight quotes/
apostrophes (`'` not `’`, `"` not `“`), matching the existing files. Avoid the word
"enablement" in brand copy (G12). The brief's drafts are already humanized — apply
verbatim, only normalizing quotes if any smart quotes slipped in.

---

## Implementation Units

Ordered by dependency: data first (it defines the offering taxonomy every other unit
references), then the page sections, then How-it-works, then the home pointer. U1–U6 are
mostly independent edits but share the taxonomy established in U1, so U1 lands first.

### U1. Restructure the offerings data (`app/data/consulting.ts`)

**Goal:** Replace the three prototype offerings (Agent Architecture / AI Automation /
AI Training) with the strategy taxonomy: Opportunity Audit / Automate the repetitive /
Empower your team. Apply the brief's Draft 2 copy verbatim.

**Requirements:** G3, G7, G8, G9, G12, KTD-1, KTD-6.

**Dependencies:** none.

**Files:**
- `app/data/consulting.ts` (modify — replace the three array entries; keep the
  `ConsultingOffering` interface and export name unchanged)

**Approach:**
- Replace the three objects in `consultingOfferings` with the three from Draft 2:
  - `01 — Opportunity Audit.` (id `opportunity-audit`) — tagline, blurb, and 3-item
    `outcomes` (the brief's "What you walk away with" bullets) per Draft 2 §01.
  - `02 — Automate the<br />repetitive.` (id `automate`) — per Draft 2 §02. Note the
    embedded `<br />` in the title (KTD-6).
  - `03 — Empower<br />your team.` (id `empower`) — per Draft 2 §03.
- Keep titles as the source of the display-font line break via `<br />` (the existing
  `Agent<br />Architecture.` pattern). Match the brief's exact break points.
- Update the file header comment: the current comment says copy is "lifted verbatim from
  `_process/prototype/consulting.html`". Replace that provenance note with a pointer to
  this ticket / the strategy brief (`PRO-91`, Draft 2). Keep the `<br />` / `v-html`
  safety note and the deferred-`length`-derivation note.
- **4th-card variant (optional, owner decision — see KTD-1):** if Care & R&D should be a
  peer card, append a fourth object `04 — Care & R&D.` (id `care-and-rd`) using Draft 2
  §04 verbatim, **and** update the `consulting.vue` label in U2 to "Offerings — 04".
  Default is to NOT add it (folded into How-it-works at U5).
- Verify no instance of the word "enablement" in the new copy (G12).
- Verify straight quotes/apostrophes throughout (KTD-7).

**Patterns to follow:** existing `consultingOfferings` array shape; existing `<br />`-in-
title convention; `ConsultingEntry.vue` prop contract (`title/tagline/blurb/outcomes`).

**Test expectation:** none — this is static content data with no behavioral change. The
data is consumed by an existing, tested component. Correctness is verified visually and
by the consistency checks in Verification (TypeScript compile, card count vs label).

**Verification:** `consultingOfferings` has the intended number of entries (3 default);
each has `id`, `title`, `tagline`, `blurb`, and a non-empty `outcomes[]`; TypeScript
still compiles against the `ConsultingOffering` interface; titles render with the
intended line breaks; no "enablement"; all straight quotes.

---

### U2. Rewrite the consulting hero + "Offerings" label (`app/pages/consulting.vue`)

**Goal:** Replace the dev-peer hero (eyebrow / headline / sub / CTAs) with the outcome
hero from Draft 1, and keep the "Offerings — NN" label consistent with U1's card count.

**Requirements:** G1, G2, G8, G10, KTD-1, KTD-2.

**Dependencies:** U1 (card count determines the label value).

**Files:**
- `app/pages/consulting.vue` (modify — `HeroSection` slots + the offerings
  `section-head` label)

**Approach:**
- **Eyebrow:** "Consulting — automated, on-brand, accountable" (replaces "Consulting —
  Independent practice").
- **Headline:** `Your recurring work,<br>done by a system.` (replaces "Ship AI that<br>
  actually works."). Keep the `<br>` so the Motto display type breaks where the brief
  intends.
- **Sub:** the Draft 1 sub paragraph ("Every week your team rebuilds the same reports,
  briefs, and newsletters by hand. I build systems that produce that work for you, on
  schedule and on-brand. For the parts that don't repeat, I teach your team to work with
  AI so they move faster there too.").
- **Optional kicker:** the brief offers "Automate the repetitive. Empower your team for
  the rest." as an optional line. Decision: include it as a short trailing line in the
  sub slot only if it fits the existing hero layout without new markup; otherwise omit
  (it restates the sub). Default: omit to keep the hero terse (KTD-7). Flag in Open
  Questions.
- **CTAs:** keep the existing two-button pattern. Update the ghost button label/anchor
  to match the new section flow: `Start a conversation` (mailto, unchanged) and
  `See how it works` → `#how`, **or** keep `See offerings` → `#consulting`. Note: the
  How-it-works section has no `id="how"` today (see U5). Decision: keep the ghost CTA
  pointing at `#consulting` ("See offerings") to avoid adding/relying on an anchor that
  doesn't exist, unless U5 adds `id="how"`. If U5 adds `id="how"`, switch the label to
  "See how it works" and the href to `#how` per Draft 1. Flag in Open Questions.
- **Offerings label:** keep `<span class="label">Offerings — 03</span>` when U1 ships 3
  cards. If the 4th card variant is taken, change to "Offerings — 04" (KTD-2). The
  `<h2>What I do.</h2>` heading stays.
- The `v-for` over `consultingOfferings` and `ConsultingEntry` usage are unchanged.

**Patterns to follow:** existing `HeroSection` slot usage on this page and in
`app/pages/index.vue`; existing `.btn`/`.btn-filled`/`.btn-ghost` atoms; the
`down-arrow-href="#consulting"` prop (leave as-is or update only if section IDs change).

**Test expectation:** none — static template copy, no behavioral change. Verified
visually and by the build.

**Verification:** hero renders the new eyebrow/headline/sub; headline line break holds at
mobile widths in Motto display type (origin pre-publish item); CTAs resolve to valid
targets (no dangling `#how` unless U5 added it); "Offerings — NN" label matches the
rendered card count exactly (KTD-2).

---

### U3. Rewrite "The brief" + add the DIY-counter block (`app/pages/consulting.vue`)

**Goal:** Re-aim the "The brief" positioning section at the publication/report-producing
ICP (Draft 1), and add a new "This isn't 'just use ChatGPT'" block with the verified MIT
stat callout.

**Requirements:** G1, G5, G7, KTD-4, KTD-5.

**Dependencies:** U2 (same file; sequence after the hero edit to keep diffs clean).

**Files:**
- `app/pages/consulting.vue` (modify — the "Consulting — Positioning" section; add a new
  DIY-counter section after it)

**Approach:**
- **"The brief" section (existing `.bio-grid`):** keep the `Who this is for` label and
  `<h2>The brief.</h2>`. Replace the two body paragraphs with Draft 1's P1 and P2
  (P2 uses the `class="secondary"` paragraph already present). New copy names research
  nonprofits, foundations, think tanks, and small expert teams, and frames "a person
  accountable for what goes out the door" (G7).
- **New DIY-counter block:** add a new `<section>` after "The brief" (and before the
  `#consulting` offerings section). Reuse the `.shell` + `.bio-grid` + `.bio-body`
  pattern so it visually matches "The brief":
  - Label / H3: "The honest version" (brief's H3/label).
  - Body paragraph: Draft 1's "Anyone can get a draft out of a chatbot…" paragraph.
  - Stat callout: the MIT line as a visually distinct callout — "95% of company AI
    pilots never deliver a measurable return. The ones run with an outside specialist
    succeed about twice as often as in-house builds. — MIT, *State of AI in Business
    2025*". Render as a `<blockquote>` or a `.t-caption`-styled emphasis block; cite
    MIT inline. No new CSS required if it reuses existing type primitives; if a callout
    rule is wanted, fold it into the U4 CSS block rather than adding a second new block.
  - Add a `data-screen-label` consistent with the page's other sections (e.g.
    "Consulting — DIY counter").
- **Proof slot (KTD-4):** do **not** add proof markup. The MIT callout is the credibility
  anchor for launch. No fabricated metric.

**Patterns to follow:** the existing "Consulting — Positioning" `.bio-grid` block in this
file; `app/pages/index.vue` About `.bio-grid` for the label + body shape; existing
`data-screen-label` naming.

**Test expectation:** none — static template copy. Verified visually and by the build.

**Verification:** "The brief" shows the new ICP copy; the DIY-counter block renders with
the MIT stat correctly attributed; the stat text matches the brief verbatim (it is a
cited external claim — no paraphrasing of the numbers); section ordering is
hero → The brief → DIY counter → offerings → how-it-works → CTA.

---

### U4. Add the published pricing-card section (`app/pages/consulting.vue` + `app/assets/css/sections.css`)

**Goal:** Add a new "No mystery pricing." section to the consulting page with the four
price lines as placeholder `9999,00`, replacing the strategy's "hidden pricing" stance.

**Requirements:** G4, KTD-3, KTD-5.

**Dependencies:** U1 (offer names), U3 (section ordering). Pairs with U5 (which removes
the old "pricing not shown" line).

**Files:**
- `app/pages/consulting.vue` (modify — add a new pricing `<section>`)
- `app/assets/css/sections.css` (modify — add the `.price-list` / `.price-row` primitive)

**Approach:**
- Add a new `<section data-screen-label="Consulting — Pricing">` placed after the
  offerings list and before (or after) How-it-works — decision: place it **after**
  How-it-works so the flow reads offerings → how it works → what it costs, which mirrors
  the brief's Draft 3 ordering (How-it-works ends on "the build is the start", pricing
  answers "so what does it cost"). Flag placement in Open Questions if the owner prefers
  pricing immediately after offerings.
- Section structure: `.shell` > `.section-head` (`<span class="label">What it costs</span>`
  + `<h2>No mystery pricing.</h2>`) > a lead line ("Transparent and fixed. You know the
  number before we start.") > the price list.
- Price rows (brief Draft 3 table), each row = offer label + price + qualifier:
  - **Opportunity Audit** — `9999,00` · 2–3 weeks · credited toward your build
  - **Build** (automate) — from `9999,00` · fixed, set against the value it creates
  - **Empower** (training + setup) — `9999,00`
  - **Care & R&D** — `9999,00 / month`
- Every price literal is exactly `9999,00` (KTD-3). Do not substitute the working
  figures.
- **New CSS (`.price-list` / `.price-row`):** a grid with the offer label on the left and
  price + qualifier on the right, a 1px hairline (`var(--color-pitch-black)`) top border
  per row matching `.step`/`.cta-banner` borders, gap clamps consistent with `.steps`,
  and a single-column stack at `@media (max-width: 800px)` (the breakpoint used by
  `.steps` and `.cta-banner`). Type sizes reuse existing tokens (`--text-body`,
  `--text-caption`, display font for the price if a larger treatment is wanted). Keep it
  minimal — this is the only new CSS in the ticket (KTD-5). Add the block under a clearly
  commented `/* ---------- Pricing card (PRO-91) ---------- */` header, consistent with
  the file's existing sectioned-comment style.
- The `_process/prototype` provenance comments elsewhere in `sections.css` should not be
  edited; just append the new block.

**Patterns to follow:** `.steps` grid + `@media (max-width: 800px)` single-column rule;
`.cta-banner` border + responsive collapse; `.section-head` label + h2; the file's
`/* ---------- Name (TICKET) ---------- */` comment convention.

**Test expectation:** none — presentational. Verified visually (light + dark per the
project's theme rule) and by the build. If the project has any visual-regression or
lint-CSS step, it should pass.

**Verification:** pricing section renders four rows; every price reads `9999,00` (grep the
rendered template for any non-`9999,00` price to catch accidental real numbers); layout
holds at mobile (single column) and desktop; hairline rules and spacing match the Motto
look of `.steps`/`.cta-banner`; no regression to existing sections from the new CSS;
light and dark modes both correct.

---

### U5. Reframe "How it works" (`app/components/HowItWorks.vue`)

**Goal:** Reframe the three steps to Audit / Build / Run it, fold Care & R&D into step 03
as the ongoing product, drop "operating it without me", and remove the trailing "Pricing
intentionally not shown" line (now replaced by U4's pricing section).

**Requirements:** G4, G7, G9, KTD-1, KTD-3.

**Dependencies:** U4 (the pricing section must exist before the "pricing not shown" line
is removed, so the page never has a state with neither). U1 (Care & R&D naming).

**Files:**
- `app/components/HowItWorks.vue` (modify — three step bodies, the trailing caption, and
  optionally add `id="how"`)

**Approach:**
- Keep the `Engagement` label and `<h2>How it works.</h2>`.
- **Step 01 — Audit.** (rename from "Scope.") Body: Draft 3's "A short, paid audit. We
  agree on the problem, the one outcome that matters, and a fixed price, before any build
  starts."
- **Step 02 — Build.** Body: Draft 3's "Hands-on delivery in your repo and tools. Short
  cycles, weekly checkpoints, no surprises at the final review. A human signs off on what
  ships." (adds the accountability line, G7).
- **Step 03 — Run it.** (rename from "Handover.") Body: Draft 3's "Your team owns the
  system and the docs. Most keep me on a Care & R&D retainer to maintain it, handle the
  edge cases, and automate the next thing. The build is the start, not the finish."
  This folds Care & R&D in as the ongoing product (G9) and removes "the goal is your team
  operating it without me."
- **Remove** the trailing `<p class="t-caption faint section-trail">Pricing intentionally
  not shown on the page.</p>` entirely (replaced by U4).
- **Optional:** add `id="how"` to the section's root `<section>` so the hero ghost CTA can
  deep-link to it (see U2). Decision: add `id="how"` here so U2 can use the brief's
  intended "See how it works" → `#how` CTA. Low risk, enables the brief's CTA copy.
- Update the component's header comment: the current comment describes a fixed
  "Scope → Build → Handover" shape; update it to "Audit → Build → Run it" and note the
  Care & R&D framing. Keep the note that this is markup-driven (no props) — still true.

**Patterns to follow:** existing `.steps`/`.step`/`.num`/`h4`/`p` markup in this file;
do not introduce props or data — the three-step shape stays static (matches the file's
existing rationale).

**Test expectation:** none — static template copy. Verified visually and by the build.

**Verification:** three steps read Audit / Build / Run it; no "operating it without me";
no "Pricing intentionally not shown" line anywhere on the page; if `id="how"` was added,
it is unique on the page and the hero CTA (if pointed at `#how`) resolves to it; step 03
frames Care & R&D as ongoing, not "optional support".

---

### U6. Realign the home About → consulting pointer (`app/pages/index.vue`)

**Goal:** Update the single sentence in the home About section that describes the
consulting offer, replacing the dev-centric taxonomy with the new framing.

**Requirements:** G11, KTD-7.

**Dependencies:** U1 (taxonomy must be settled so the pointer matches the consulting
page). Otherwise independent.

**Files:**
- `app/pages/index.vue` (modify — one sentence in the About `.bio-body`)

**Approach:**
- Replace: "…The consulting page is what I do for clients: agent architecture, AI
  automation, and hands-on training for teams."
- With (Draft 3): "…The consulting page is what I do for clients: systems that produce
  their recurring documents and reports, plus training so their team works with AI on
  everything else."
- Keep the surrounding paragraph, the `<NuxtLink … to="/consulting">consulting page
  </NuxtLink>` markup, and the rest of the About section unchanged. **Only** the offer-
  description clause changes.
- Do not touch the hero, experiments grid, or the "Based in beautiful British Columbia"
  paragraph.

**Patterns to follow:** the existing About `.bio-body` paragraph structure; preserve the
existing `NuxtLink` and `class="link-underline"`.

**Test expectation:** none — single-sentence static copy. Verified visually and by the
build.

**Verification:** the About paragraph reads the new sentence; the consulting `NuxtLink`
is intact and still routes to `/consulting`; no other home copy changed (diff is one
sentence).

---

## Scope Boundaries

**In scope:** copy + data edits to the four named files (`app/data/consulting.ts`,
`app/pages/consulting.vue`, `app/components/HowItWorks.vue`, `app/pages/index.vue`) and
one new CSS block in `app/assets/css/sections.css` for the pricing rows.

**Out of scope / deferred:**

### Deferred to Follow-Up Work
- **Real prices.** Swap placeholder `9999,00` for confirmed numbers — owner-gated,
  separate change (KTD-3).
- **Proof / case-study (G6).** No fabricated client metric. Instrument a real
  "X hrs → Y min" number (e.g. Shorenstein) post-launch and add a proof slot then
  (KTD-4).
- **Derive "Offerings — NN" from `consultingOfferings.length`.** The data file's own
  header notes this as deferred. This plan keeps the hardcoded label pinned by hand
  (KTD-2). A tiny follow-up could compute it.
- **4th offering card (Care & R&D as a peer card).** Owner decision; default is folded
  into How-it-works (KTD-1). If taken later, it's one array entry + the label bump.

### Not in this product's identity / explicitly not doing
- No new components, no routing changes, no restyle/theme work — copy + data only.
- No edits to the strategy repo (`ai-consulting/`) — one-way strategy → site flow.
- No changes to SEO/meta, the CTA banner copy, or the experiments data.

---

## Open Questions

These are decisions the implementer should confirm with the owner; this plan picks a
sensible default for each so work is not blocked.

1. **3 cards vs 4 (Care & R&D).** Default: 3 cards, Care folded into How-it-works step 03
   (KTD-1). If owner wants 4, add Draft 2 §04 and bump the label to "Offerings — 04".
2. **Publish-pricing go.** The strategy strongly recommends it; the site currently opts
   out by design. This plan assumes **go** (that is the ticket's intent). Confirm before
   merge. The whole U4/U5 pairing reverses the "pricing not shown" stance.
3. **Pricing section placement.** Default: after How-it-works (Draft 3 reading order).
   Owner may prefer it immediately after the offerings list.
4. **Hero kicker line.** Default: omit "Automate the repetitive. Empower your team for the
   rest." to keep the hero terse; the brief marks it optional.
5. **Hero ghost CTA target.** Default: add `id="how"` in U5 and use "See how it works" →
   `#how` (brief Draft 1). Fallback: keep "See offerings" → `#consulting`.
6. **Beachhead sub-niche / how-narrow-to-go** (origin open decisions #1–2). The drafts
   lead on the broad "documents and reports" descriptor while naming the ICP segments;
   this plan applies the drafts as written. If the owner wants the page to lead on ONE
   sub-niche, that's a copy tweak within U2/U3, not a structural change.

---

## Verification (whole-ticket)

Run after all units land:

- **Build / type check passes.** Nuxt build succeeds; `consulting.ts` compiles against
  `ConsultingOffering`.
- **Card count = label.** Number of `consultingOfferings` entries equals the
  "Offerings — NN" label in `consulting.vue` (KTD-2).
- **Every price is `9999,00`.** Grep the consulting page render/template for price tokens;
  confirm no real numbers leaked (KTD-3).
- **No stale strings.** "Pricing intentionally not shown" is gone; "operating it without
  me" is gone; "agent architecture, AI automation, and hands-on training" is gone from
  `index.vue`; "Ship AI that actually works" is gone from the hero.
- **No "enablement"** in any brand copy (G12).
- **Straight quotes** everywhere (no smart quotes introduced).
- **MIT stat verbatim** and correctly attributed (cited external claim — exact numbers).
- **Visual / responsive.** Hero headline break holds at mobile in Motto display type
  (origin pre-publish item); pricing rows stack to single column at ≤800px; light and
  dark modes both correct (project theme rule); the new CSS doesn't regress
  `.steps`/`.cta-banner`/`.bio-grid` sections.
- **Section order** on `/consulting`: hero → The brief → DIY counter → offerings (3) →
  how it works → pricing → CTA banner (or pricing before/after per Open Q #3).
- **Voice gut-check** (origin pre-publish item): reads right to a non-technical buyer.

---

## Patterns & References

- Origin brief (authoritative draft copy): `docs/plans/PRO-91-source-brief.md`
  (Draft 1 = hero/brief/DIY; Draft 2 = offerings; Draft 3 = pricing/how-it-works/home).
- Data shape + `<br />`/`v-html` convention: `app/data/consulting.ts` header comment.
- Component contract: `app/components/ConsultingEntry.vue` (props
  `title/tagline/blurb/outcomes`; `title` via `v-html`).
- Section primitives to reuse: `app/assets/css/sections.css`
  (`.shell`, `.section-head`, `.label`, `.bio-grid`, `.bio-body`, `.secondary`,
  `.steps`/`.step`, `.cta-banner`, `.section-trail`, `.btn*`; 800px breakpoint).
- Existing hero/About slot usage: `app/pages/consulting.vue`, `app/pages/index.vue`.
