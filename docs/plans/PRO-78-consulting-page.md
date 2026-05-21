---
id: PRO-78
title: "feat: Consulting page — entries, how-it-works, CTA"
type: feat
status: active
created: 2026-05-21
plan_depth: standard
worktree: experiments/claudiomendonca.com-wt/PRO-78
branch: feature/PRO-78-consulting-page
depends_on: PRO-77
origin_docs:
  - 01-brief.md
  - 02-design-system-motto.md
  - 04-services-page.md
  - _process/prototype/consulting.html
  - _process/prototype/styles.css
  - docs/plans/PRO-77-home-page.md
---

# feat: Consulting page — entries, how-it-works, CTA

## Summary

Replace the placeholder `app/pages/consulting.vue` with the real consulting one-pager built from `_process/prototype/consulting.html`: a reused `<HeroSection>` carrying consulting copy ("Ship AI that actually works."), a positioning block (`bio-grid` pattern, "The brief."), a three-entry offerings list rendered through a new `ConsultingEntry.vue` leaf component, a "How it works" 3-step grid rendered through a new `HowItWorks.vue` component, and a `CtaBanner.vue` banner with mailto CTA. Offering data lives in a typed `app/data/consulting.ts` array seeded with three offerings (Agent Architecture, AI Automation, AI Training) so adding a fourth is one new entry + zero markup changes — same pattern PRO-77 K4 established for experiments.

Chrome (nav + footer + tokens + base) and home-page section primitives (`.hero*`, `.section-head*`, `.bio-grid*`, `.btn*`, button atoms) are already in place from PRO-75 → PRO-77 and are not touched. New page-section CSS slices (`.entry*`, `.entry-rich`, `.outcomes`, `.steps`, `.step*`, `.cta-banner*`) are appended to `app/assets/css/sections.css`, lifted verbatim from `_process/prototype/styles.css` and explicitly deferred there in PRO-77 (see [PRO-77 plan](PRO-77-home-page.md) Scope Boundaries — `.entry*`/`.entry-list`/steps/outcomes/CTA banner all marked "deferred to PRO-78").

SiteNav and the home page already cooperate with this route: the nav from PRO-76 paints `aria-current="page"` on Consulting when `route.path === '/consulting'` (verified in `app/components/SiteNav.vue` line 15), and home anchors flip to cross-route (`/#work`, `/#about`) when on `/consulting` (lines 14, 18). No chrome changes are required.

---

## Problem Frame

PRO-77 shipped the home one-pager and the shared `HeroSection` slot API explicitly engineered to be reused on `/consulting` (PRO-77 K2). The placeholder at `app/pages/consulting.vue` (10 lines, "PRO-78 will replace this") is the entry point that ticket left.

The prototype source for this page lives at:

- `_process/prototype/consulting.html` lines 33–58 (Hero), 60–86 (Positioning / "The brief."), 88–187 (Offerings list with three `.entry.entry-rich` entries), 189–230 (How it works — three `.step` blocks), 232–251 (CTA banner), and 254–301 (Footer — already covered by `SiteFooter.vue`).
- `_process/prototype/styles.css` lines 360–363 (`.entry-list`), 474–539 (`.entry*` base, `.entry h3`, `.entry .tagline`, `.entry .blurb`, mobile collapse), 582–616 (`.steps`, `.step*`), 619–644 (`.cta-banner*`), 647–667 (`.outcomes*`), 669–676 (`.entry.entry-rich` index-column variant + mobile collapse).
- `04-services-page.md` — design brief for this page (named `/services` in the brief, shipped as `/consulting`). The three lead offerings, their copy direction, the optional "How it works", and the mailto CTA all come from there. Candidate offerings 4–6 (AI Strategy & Advisory, Custom AI Product Development, Exploration / Prototype Sprints) are explicitly out of scope per the prototype's `<span class="todo">` marker on lines 181–185.

PRO-78 needs to:

1. Lift the deferred CSS slices (`.entry*`, `.entry-rich`, `.outcomes`, `.steps`, `.step*`, `.cta-banner*`) out of `_process/prototype/styles.css` and append them to `app/assets/css/sections.css`, preserving the prototype's class names verbatim so the lifted CSS works without renames (precedent K1, PRO-76 / PRO-77).
2. Build `ConsultingEntry.vue` as a leaf prop-driven component that renders one `<li class="entry entry-rich">` with the 3-column layout: 96px `.idx` | 1.1fr body (h3, tagline, blurb) | 1fr outcomes panel with `stone-accent` left border and arrow-prefixed list.
3. Build `HowItWorks.vue` as a self-contained section (numbered 3-step grid: Scope · Build · Handover, top-border per step, disp numerals, disp h4s). Content is internal to the component — there is only one engagement model, and it is identical across consulting offerings; making it data-driven adds API surface for no win.
4. Build `CtaBanner.vue` as a leaf prop-driven component with top+bottom border, oversized headline, mailto CTA, and secondary copy. Props let `/` reuse it later if needed; for PRO-78 the only consumer is `/consulting`.
5. Centralize the three offerings in `app/data/consulting.ts` behind a TypeScript interface, copied verbatim from the prototype with `TODO(claudio)` markers preserved on hero/positioning lines (the prototype carries three `<span class="todo">` markers — they survive PRO-78 unchanged).
6. Compose the full page in `app/pages/consulting.vue`: `<HeroSection>` (consulting variant) → positioning section → offerings list section → `<HowItWorks />` → `<CtaBanner />`. The `<SiteFooter>` from the default layout already supplies the contact / footer.
7. Verify (without changing code) that SiteNav highlights Consulting active and that anchor links from this page route correctly back to home sections (`/#work`, `/#about`).

---

## Requirements

Traced from the PRO-78 Plane ticket, `_process/prototype/consulting.html`, `04-services-page.md`, and PRO-77 K2 (the slot contract this page consumes).

- **R1.** `app/pages/consulting.vue` renders, in this order: a `<HeroSection>`, a `<section data-screen-label="Consulting — Positioning">` with the "The brief." bio-grid block, a `<section id="consulting" data-screen-label="Consulting — List">` with `.section-head` ("Offerings — 03" / "What I do.") and an `<ol class="entry-list">` iterating the consulting data array through `<ConsultingEntry>`, a `<HowItWorks />` section, and a `<CtaBanner />` section.
- **R2.** `HeroSection` is reused via its slot API (defined in PRO-77 K2 — `eyebrow`, `headline`, `sub`, `ctas`, plus `downArrow` / `downArrowHref` props). The component is not modified. Slot content for this page:
  - `eyebrow` = dot span + "Consulting — Independent practice"
  - `headline` = `<h1>Ship AI that<br />actually works.</h1>`
  - `sub` = "For builders and teams who want real agentic systems — not AI theatre. Architecture, automation, and training, run hands-on." with the prototype's `<span class="todo">TODO(claudio): confirm hero line</span>` marker preserved
  - `ctas` = `.btn-filled` "Start a conversation" → `mailto:claudioccm@gmail.com` (with `.btn-arrow → `), plus `.btn-ghost` "See offerings" → `#consulting`
  - `downArrow = true` (default) with `downArrowHref="#consulting"` (overridden from the `#work` default since this page has no `#work` anchor)
- **R3.** The hero H1 sentence-cased "Ship AI that actually works." is rendered as-is (no `text-transform: uppercase` override; the existing `.hero h1` style from PRO-77's lifted CSS applies `text-transform: uppercase` and that is the intended behavior here too — see K1 of this plan). The `<br />` between "that" and "actually" is preserved as authored content, not encoded as a separate prop.
- **R4.** Positioning block ("The brief."). A `<section>` containing the `.bio-grid` pattern (lifted in PRO-77 — `grid-template-columns: 1fr 1.4fr`, collapses to 1 column below 800px). Left column holds a `.label`-styled span ("Who this is for") and an `<h2>The brief.</h2>`; right column (`.bio-body`) holds two paragraphs lifted verbatim from the prototype (lines 72–82), preserving the `<span class="todo">TODO(claudio): confirm positioning</span>` marker. The prototype's inline-styled `<span class="label">` (lines 65–68 — inline color/spacing because no global `.label` rule exists) is replaced with a `<span class="label">` styled by a new global `.label` rule (see K2).
- **R5.** Offerings list. A `<section id="consulting">` with a `.section-head` (label "Offerings — 03", h2 "What I do."), followed by `<ol class="entry-list" aria-label="Consulting offerings">` iterating `app/data/consulting.ts` and rendering one `<ConsultingEntry>` per offering. After the list, a `<p class="t-caption faint">` carries the prototype's `<span class="todo">` candidate-offerings note (prototype lines 180–185) verbatim — this stays on the page as an authoring-time reminder, matching the prototype.
- **R6.** `ConsultingEntry.vue` is prop-driven. Props: `idx: number`, `title: string`, `tagline: string`, `blurb: string`, `outcomes: string[]`. The component renders one `<li class="entry entry-rich">` with three columns lifted from the prototype (HTML lines 98–123, CSS lines 670–676):
  1. `<span class="idx">{{ idxLabel }}</span>` where `idxLabel = String(idx).padStart(2, '0')` (same pattern as `ExperimentCard.vue` from PRO-77 K3).
  2. `<div class="entry-body">` containing `<h3>{{ title }}</h3>`, `<p class="tagline">{{ tagline }}</p>`, `<p class="blurb">{{ blurb }}</p>`. The `<h3>` may contain a `<br />` from the data layer to control line breaks (see K3 — the data file stores `title` as a string with an embedded `<br />` rendered via `v-html`, or alternatively split into `titleLine1` / `titleLine2`).
  3. `<div class="entry-body entry-body--outcomes">` containing a `<span class="label">What you walk away with</span>` and a `<ul class="outcomes">` iterating `outcomes` to render `<li><span>{{ outcome }}</span></li>` per entry.
- **R7.** Outcomes column visual treatment. The third column gets `border-left: 1px solid var(--color-stone-accent)` and `padding-left: clamp(20px, 3vw, 48px)`. The prototype inlines these as `style="border-left:…; padding-left:…"` on the third `.entry-body` div (HTML lines 113, 140, 167). PRO-78 lifts them into a class selector — `.entry-rich .entry-body--outcomes` (see K2) — so the markup stays clean and the rule lives with the rest of `.entry-rich` CSS. The corresponding `<span class="label">` inline styles (HTML lines 114–116, 141–143, 168–170) are also lifted into the new global `.label` rule.
- **R8.** `HowItWorks.vue` renders an entire `<section>` with `.section-head` (label "Engagement", h2 "How it works.") and a `.steps` grid containing three `.step` blocks. Steps are: `01 Scope.`, `02 Build.`, `03 Handover.` with the prototype's blurbs (HTML lines 197–223). After the grid, a `<p class="t-caption faint">` carries the prototype's `<span class="todo">` pricing note (lines 226–228) verbatim.
- **R9.** `CtaBanner.vue` is prop-driven. Props: `heading: string`, `body: string`, `ctaLabel: string`, `ctaHref: string`. Renders a `<section>` with a `.cta-banner` grid (top+bottom border, two columns collapsing to one below 800px). Left side: `<h2>{{ heading }}</h2>` and `<p>{{ body }}</p>`. Right side: a `.btn-filled` anchor with `.btn-arrow → ` glyph. The component handles only the banner; the wrapping `<section>` with `<div class="shell">` is part of the component so consumers don't have to repeat the shell.
- **R10.** `app/data/consulting.ts` exports a typed array. The TypeScript shape is:
  ```ts
  export interface ConsultingOffering {
    id: string             // 'agent-architecture'
    title: string          // 'Agent<br />Architecture.'  (HTML — see K3)
    tagline: string        // one confident line
    blurb: string          // 2–4 sentences
    outcomes: string[]     // 3 arrow-prefixed bullets
  }
  export const consultingOfferings: ConsultingOffering[]
  ```
  Seeded with three offerings copied verbatim from the prototype (HTML lines 96–177):
  - `agent-architecture` — title `Agent<br />Architecture.`, tagline "Multi-agent systems that aren't held together with hope and duct tape.", blurb "Design and build agentic systems end-to-end: agent roles and boundaries, tool design, orchestration patterns, hand-offs, and the evaluation loops that keep them honest. From architecture diagram to working, testable system.", outcomes: ["Working agent system, in your repo, on your stack.", "Architecture doc + tool catalogue your team owns.", "Eval loop wired to CI so quality doesn't drift."]
  - `ai-automation` — title `AI<br />Automation.`, tagline "Remove the repetitive work without losing control or quality.", blurb "Identify the high-leverage workflows hiding in your team's week, then automate them with LLMs and agents — pipelines, internal tools, and human-in-the-loop processes that fit how you already work.", outcomes: ["Audit of where AI moves the needle for your team.", "One or more deployed automations — not prototypes.", "Playbook your team can extend without me."]
  - `ai-training` — title `AI<br />Training.`, tagline "Practical AI for the people who actually have to use it.", blurb "Upskill teams on the things that matter: agentic workflows, prompt and context engineering, tool and agent design, and the day-to-day craft of modern AI dev tooling. Hands-on, role-specific — not a generic slide deck.", outcomes: ["Tailored curriculum for your roles and stack.", "Workshop materials your team keeps.", "Measurable lift on the workflows that matter."]
- **R11.** Nav active state. With this page mounted at `/consulting`, `SiteNav.vue` (PRO-76) must paint `aria-current="page"` on the Consulting link. This already works — PRO-76 `links` array has `{ label: 'Consulting', href: '/consulting', routeMatch: '/consulting' }` (`app/components/SiteNav.vue` line 15). No nav code change is required. PRO-78 verifies this in U7.
- **R12.** Anchor links route correctly. Three navigation/anchor flows must work from this page:
  1. The hero's `#consulting` anchor and the down-arrow's `#consulting` href scroll to the offerings section on the same page.
  2. SiteNav's "Experiments" link points to `/#work` when on `/consulting` (PRO-76 `SiteNav.vue` line 14 — `isConsulting ? '/#work' : '#work'`). Clicking it navigates to `/` and scrolls to `#work`. Same logic for "About" → `/#about`.
  3. SiteFooter's static `/#work` and `/#about` anchors (PRO-76 `SiteFooter.vue` lines 25, 27) navigate cross-route. The footer's `/consulting` link is on the current route — no special handling required.
- **R13.** Page-section styles for this page (`.entry*`, `.entry-rich`, `.outcomes`, `.steps`, `.step*`, `.cta-banner*`, plus a new global `.label` rule) are appended to `app/assets/css/sections.css`. Component styles (`<style scoped>`) are not used. (K1, mirroring PRO-77 K1.)
- **R14.** No new animations or transitions are introduced. The prototype consulting page has none beyond the chrome's existing button/nav transitions. The page is static beyond the hero/nav classes inherited from PRO-77.
- **R15.** SSR safety. No `window`, `document`, `localStorage`, or browser-only API is referenced from the consulting page or any new component during setup or first render. All components are static / prop-driven; only `SiteNav.vue` (existing, unchanged) has a scroll listener, and it is already SSR-safe (PRO-76 K3).
- **R16.** Acceptance from the ticket:
  - **AE1.** Consulting route renders the full prototype layout — hero, positioning, three offerings, how-it-works, CTA — in order.
  - **AE2.** Nav highlights Consulting as active.
  - **AE3.** Anchor links route back to home sections correctly (Experiments → `/#work`, About → `/#about`).

---

## Scope Boundaries

### In scope

- New files: `app/components/ConsultingEntry.vue`, `app/components/HowItWorks.vue`, `app/components/CtaBanner.vue`, `app/data/consulting.ts`.
- Replaced files: `app/pages/consulting.vue` (placeholder → real consulting page).
- Modified files: `app/assets/css/sections.css` (append `.entry*`, `.entry-rich`, `.outcomes`, `.steps`, `.step*`, `.cta-banner*`, and a new global `.label` rule).
- Behaviors listed in R1–R16 above.
- Browser verification under `docs/solutions/PRO-78-browser-test/` (mirroring the PRO-75/76/77 pattern).

### Outside this product's identity

- Pricing or engagement-fee disclosure on the page. The prototype explicitly notes "Pricing intentionally not shown on the page" (line 227) — this is a stated product decision, not a deferral.
- Contact form. Per `04-services-page.md` line 94: "No contact form in v1." The mailto CTA is the only contact affordance.
- Logos, case studies, testimonials. `04-services-page.md` line 111 lists these as open questions but the Motto® design system (`02-design-system-motto.md` lines 138–142) explicitly stipulates "Stark, text-dominant. No photography." for the visual language.

### Deferred to follow-up work

- **Candidate offerings 4–6** — AI Strategy & Advisory, Custom AI Product Development, Exploration / Prototype Sprints. The prototype carries a `<span class="todo">` marker (HTML lines 180–185) noting they're held off for v1. PRO-78 preserves that marker on the page and ships with three offerings only. Adding any of them is a one-line append to `app/data/consulting.ts` once Claudio confirms — no markup change.
- **Hero/positioning copy confirmation.** The prototype carries `TODO(claudio)` markers on the hero sub line (line 47), the positioning paragraph (line 76), and the how-it-works pricing note (line 227). PRO-78 preserves all three markers in the rendered output as authoring-time reminders — the visible `<span class="todo">` styling already exists in `base.css` (line 114) so they render correctly.
- **Real `mailto:` body / subject pre-fill.** The prototype's CTAs link to bare `mailto:claudioccm@gmail.com`. Pre-filling subject/body for the two CTAs (hero and CTA banner) is a content polish for a later ticket.
- **Per-page `<title>` / meta differentiation.** The global `app.head` (nuxt.config.ts line 37) carries "Claudio Mendonça — AI Experiments" — fine for v1. Adding `useHead({ title: 'Consulting — Claudio Mendonça' })` and a consulting-specific description is a separate small ticket.
- **Down-arrow `aria-label` per-page override.** The PRO-77 hero's down-arrow has a hard-coded `aria-label="Scroll to work"` (`app/components/HeroSection.vue` line 36). On `/consulting` it points at `#consulting` but the label still says "Scroll to work". A `downArrowLabel` prop is the obvious fix; flagged in PRO-77 K5 as deferred to PRO-78, but pulling it into this ticket would change the `HeroSection` API for a strictly cosmetic accessibility improvement — keeping it deferred until a future cleanup ticket lets PRO-78 stay focused on the consulting page itself. (See Open Questions — if the implementer prefers, the prop addition is a 3-line patch.)

### Out of scope (explicit non-goals)

- **No `/services` route.** `04-services-page.md` proposed `/services`; the prototype and the PRO-77 chrome both use `/consulting`. PRO-78 ships `/consulting` only.
- **No data-driven engagement model.** `HowItWorks.vue` embeds its three steps as static markup (R8). The brief (`04-services-page.md` line 87) notes this is optional and small — making it data-driven is unjustified API surface.
- **No dark mode / no theme toggle.** The Motto® system is explicitly light-only (`02-design-system-motto.md` line 6).

---

## Key Technical Decisions

### K1. Append to `app/assets/css/sections.css`, do not create a new stylesheet

**Decision.** Lift the deferred CSS slices (`.entry*`, `.entry-rich`, `.outcomes`, `.steps`, `.step*`, `.cta-banner*`) verbatim from `_process/prototype/styles.css` and append them to the existing `app/assets/css/sections.css`. Do not register a new stylesheet in `nuxt.config.ts`. Update the top-of-file comment to remove the "PRO-78 deferred" markers (currently sections.css line 14–15) and add a new comment block describing the appended slices.

**Why.**
- The PRO-77 K1 precedent established that page-section styles live globally, layered after `chrome.css`. The cascade `tokens.css → base.css → chrome.css → sections.css` is the right shape; adding a fifth file would muddle ordering for no win.
- The deferred slices are explicitly called out at the top of `app/assets/css/sections.css` (lines 14–15) as PRO-78's territory. Appending here keeps the lift contiguous with the rest of the prototype's CSS — easier to diff against `_process/prototype/styles.css` since all the section styles live together.
- Component-scoped styles would force renames or `:deep()` workarounds since the prototype's class names (`.entry-rich`, `.outcomes`, `.steps`, `.cta-banner`) are intentionally globally addressable.

**Trade-off.** `sections.css` grows by ~125 lines. That's acceptable — the prototype is small (676 total CSS lines) and the lifted slices stay below 350 lines after PRO-78, well within reading-distance of a single file.

### K2. Introduce a new global `.label` rule, deduplicating the prototype's inline styles

**Decision.** Lift the inline `<span class="label" style="…">` styling block (used in `consulting.html` lines 65–68 for the positioning eyebrow, lines 114–116 / 141–143 / 168–170 for each offering's "What you walk away with" label) into a new global `.label` rule in `sections.css`:

```
.label {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-family: var(--font-sans);
  font-size: var(--text-caption);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-ash-text);
}
.label::before {
  content: "";
  display: inline-block;
  width: 24px;
  height: 1px;
  background: var(--color-pitch-black);
}
```

Existing `.section-head .label` (sections.css lines 121–129) already implements the same rule scoped inside `.section-head`. Extracting the shared body into `.label` and keeping `.section-head .label` for any nested overrides keeps both consumers DRY without changing existing rendered behavior.

**Why.**
- The prototype repeats the same `style="…"` payload four times across consulting.html (lines 65, 114, 141, 168) and once on the home page (`index.html` uses class `.label` inside `.section-head` which is already covered). Promoting it to a class is one rule, removes 24 lines of inline-style noise from the new markup, and keeps the prototype-to-Vue diff trivially auditable.
- The home page (`app/pages/index.vue` line 61, 67) already uses `<span class="label">— About</span>` outside `.section-head` — but it currently picks up no CSS (the existing rule is scoped to `.section-head .label`). Introducing global `.label` will start styling that span as an eyebrow with a leading rule, which **does** change the home-page rendering. This is the surgical detail that requires the implementer's attention: the new rule produces the prototype-correct look (a leading 1px rule before the caption) but the home page's prior "— About" prefix dash + caption format will now be rendered as `[24px rule] — About` with the dash inline. The implementer must either (a) drop the leading `— ` from the home's `.label` text since the `::before` now provides the rule, or (b) accept the visual change as the intended Motto® eyebrow look. Recommendation: drop the leading `— `; the prototype's home page (`_process/prototype/index.html` line 137) uses `style="…"` inline + `<span style="display:inline-block;width:24px;height:1px;…"></span>` followed by `About`, i.e. the `::before` rule is the dash. Aligning home with the new class is one-line fix in `app/pages/index.vue`. Flagged in Risks.

**Trade-off.** Tiny home-page render change. Mitigated by adjusting the about block's label text in the same PR (or, if the implementer prefers to keep PRO-78 strictly out of `app/pages/index.vue`, introduce `.label--bare` for the home consumer and keep `.label` for the eyebrow look — though that's API surface for a single line of text).

Additionally lifts the `.entry-rich .entry-body--outcomes` rule (R7):

```
.entry-rich .entry-body--outcomes {
  border-left: 1px solid var(--color-stone-accent);
  padding-left: clamp(20px, 3vw, 48px);
}
@media (max-width: 900px) {
  .entry-rich .entry-body--outcomes {
    border-left: 0;
    padding-left: 0;
    border-top: 1px solid var(--color-stone-accent);
    padding-top: clamp(20px, 3vw, 32px);
  }
}
```

The mobile rule above is a small addition not present in the prototype (the prototype's 900px collapse moves all three columns to 1fr but leaves the inline-styled `border-left` painting a left border on a stacked column, which looks wrong). This is a deliberate small improvement on the prototype, not a feature deviation.

### K3. `<br />` in offering titles travels through the data file as authored HTML; the component renders via `v-html` on a controlled string

**Decision.** `ConsultingOffering.title` is typed as `string` and stores the literal `'Agent<br />Architecture.'`. `ConsultingEntry.vue` renders it with `v-html="title"` inside the `<h3>`.

**Why.**
- The prototype uses `<h3>Agent<br />Architecture.</h3>` (three times — lines 101, 129, 155) to control the line break visually. The `<br />` is content, not layout, so doing it in CSS (`word-break: …` plus a fixed `width: 7ch`) would be brittle across font-loading.
- The alternative — splitting `title` into `titleLine1` / `titleLine2` — encodes a layout assumption into the type and breaks future offerings whose names are one word or three.
- `v-html` is safe here because the data source is a static module under the repo, not user-supplied input. No XSS surface.
- A `v-html` directive on a hard-coded string is idiomatic Vue when the string contains authoring markup. ESLint's `vue/no-v-html` is a warning by default for exactly the "untrusted input" case that doesn't apply here; if the project's lint config flags it, suppress with an inline `// eslint-disable-next-line vue/no-v-html` and a one-line comment explaining the static-source guarantee.

**Trade-off.** Slightly less type-safe than a discriminated union. Acceptable given the static, repo-controlled data source.

### K4. `HowItWorks.vue` is markup-driven, not data-driven

**Decision.** `HowItWorks.vue` embeds the three Scope/Build/Handover steps as static markup. No props, no data file.

**Why.**
- The engagement model is one fixed thing — Scope → Build → Handover — that applies across all offerings. There is no plausible future where the consulting page renders a different engagement model per offering or in a different order.
- The data file pattern in PRO-77 K4 was chosen because experiments grow (the brief says "The product list **will grow** over time"). Offerings will grow too (R5, "Offerings — 03" is a number, not a constant). But the engagement steps are fundamentally a single-instance constant.
- A markup-driven component is a strictly smaller surface than a data-driven one; if a future iteration wants to vary the steps, the conversion to props/data is a 5-minute refactor.

**Trade-off.** If Claudio adds a fourth step later, it's a `HowItWorks.vue` edit instead of a data-file edit. Negligible cost.

### K5. `CtaBanner.vue` is prop-driven (heading, body, ctaLabel, ctaHref) — not slot-driven

**Decision.** Props rather than slots. Single consumer in PRO-78. The component wraps its own `<section>` and `<div class="shell">`.

**Why.**
- The CTA banner has one shape: oversized headline + secondary copy + single filled-pill mailto CTA. No headline-level variations, no compound CTAs, no embedded forms. Slots add API surface for variability that doesn't exist.
- Future reuse (if `/` ever grows a closing CTA) is supported by the same prop API.
- The wrapping `<section>` lives inside the component so consumers say `<CtaBanner …/>` instead of `<section><div class="shell"><CtaBanner …/></div></section>`. The `.cta-banner` rule already supplies its own borders and padding — keeping the section wrapper inside the component prevents accidental nesting bugs.

**Trade-off.** Less flexible than slots. Acceptable; this is a leaf component, not a chrome primitive.

### K6. Hero down-arrow targets `#consulting`, not the page's first section

**Decision.** Pass `down-arrow-href="#consulting"` on the consulting hero. The default (`#work`, from `HeroSection.vue` line 13) is a home-page-specific default.

**Why.**
- The positioning section ("The brief.") sits between the hero and the offerings list. Scrolling there from the hero CTA bypasses the more important offerings, but the prototype's down-arrow goes to `#consulting` (the offerings list) — confirmed in `_process/prototype/consulting.html` line 56. Match the prototype's intent.
- The down-arrow's hard-coded `aria-label="Scroll to work"` (from `HeroSection.vue` line 36) is technically wrong on this page (it scrolls to consulting, not work). Per Scope Boundaries → Deferred, this is left as a known minor a11y issue for a future cleanup ticket so PRO-78 stays bounded.

---

## Output Structure

The plan creates the following new files (everything outside `_process/prototype/`):

```
app/
  components/
    ConsultingEntry.vue        (new — prop-driven entry-rich row)
    HowItWorks.vue             (new — static 3-step section)
    CtaBanner.vue              (new — prop-driven CTA banner)
  data/
    consulting.ts              (new — typed array, 3 offerings)
  pages/
    consulting.vue             (replaced — placeholder → real page)
  assets/
    css/
      sections.css             (modified — append entry*, entry-rich, outcomes, steps, step*, cta-banner*, and global .label)
```

`app/data/consulting.ts` reuses the directory created by PRO-77 (`app/data/experiments.ts`). No `nuxt.config.ts` changes.

---

## Implementation Units

### U1. Append page-section CSS slices for entries, steps, CTA banner, outcomes, and global `.label`

**Goal.** Land all the CSS this page needs in `app/assets/css/sections.css` so subsequent units (components and page) can consume verified class names. No components yet — just CSS in place.

**Requirements.** R7, R13, R14, plus the visual rendering for R5, R6, R8, R9.

**Dependencies.** None.

**Files.**
- `app/assets/css/sections.css` (modified — append; do not rewrite the existing top section)
- `app/pages/index.vue` (modified — see K2 trade-off; strip leading `— ` from the `.label` text in the about block to align with the new global `.label` rule's `::before` 24px rule)

**Approach.**

Append the following slices to the end of `app/assets/css/sections.css`, in this order, each preceded by a `/* ---------- <slice> ---------- */` divider matching the existing style:

| Slice | Prototype lines | Notes |
| --- | --- | --- |
| Entry list (`.entry-list`) | 360–363 | `display: grid; gap: 0;` — base wrapper for the offerings ordered list. |
| Entry base (`.entry`, `.entry:last-child`, `.entry .idx`, `.entry-body`, `.entry h3`, `.entry .tagline`, `.entry .blurb`, `.entry .meta`, `.entry .meta .dot`, `.entry-actions`, mobile collapse) | 474–539 | Take as-is. `.meta` and `.entry-actions` aren't used in PRO-78 but the prototype includes them and the lift stays verbatim per the lifting precedent. |
| Entry-rich variant (`.entry.entry-rich`, mobile collapse) | 669–676 | Take as-is — three-column layout `96px 1.1fr 1fr`. |
| Entry-body outcomes column (`.entry-rich .entry-body--outcomes`, mobile rule) | n/a (new) | See K2 — replaces the prototype's inline-styled border-left. Includes a small mobile improvement (border-top instead of border-left at <900px). |
| Outcomes list (`.outcomes`, `.outcomes li`, `.outcomes li::before`) | 647–667 | Take as-is — arrow-prefixed bullets. |
| Steps grid (`.steps`, mobile rule, `.step`, `.step .num`, `.step h4`, `.step p`) | 583–616 | Take as-is. |
| CTA banner (`.cta-banner`, mobile rule, `.cta-banner h2`, `.cta-banner p`) | 619–644 | Take as-is. |
| Global `.label` rule (`.label`, `.label::before`) | n/a (new — extracted from prototype inline styles) | See K2. |

Then update the comment block at the top of `app/assets/css/sections.css` (current lines 14–15) to:
- Remove "deferred to PRO-78" mentions for the appended slices.
- Add a new commentary block (mirroring the existing format) describing what PRO-78 appended, with prototype line ranges.

After lifting, hand-verify three small things:
1. The cascade still works — `.entry h3` is `clamp(54px, 9.5vw, 138px)` and uses `font-disp` 500 uppercase. The base `text-transform: uppercase` is on `.entry h3`, so the prototype's authored `Agent<br />Architecture.` will render as `AGENT` + line break + `ARCHITECTURE.` — matching the prototype.
2. The `@media (max-width: 700px)` collapse on `.entry` (line 537–539) and the `@media (max-width: 900px)` collapse on `.entry.entry-rich` (line 674–676) coexist correctly — the prototype carries both rules and they're not in conflict.
3. The new global `.label` rule does not visually break the existing `.section-head .label` rule. They have identical declared values; `.section-head .label` is left in place as the more-specific selector (no overrides needed).

For `app/pages/index.vue` (about block): change `<span class="label">— About</span>` to `<span class="label">About</span>`. The new `.label::before` rule supplies the leading 24px rule (matching the prototype's home about block, where the dash was the `::before` rule, not text content).

**Patterns to follow.** PRO-77 `app/assets/css/sections.css` — same lifting style, same line-range commentary at the top of each appended slice, same handling of `@media (max-width: …)` collapses.

**Test scenarios.**
- Test expectation: none — pure stylesheet additions plus a one-token text change. Verified visually by U6 and by the U8 browser-test pass. The CSS slices are lifted verbatim from a known-good prototype; correctness is established by the prototype.

**Verification.** `pnpm dev` boots without console errors. `view-source` of `/consulting` shows `sections.css` linked exactly once with all expected slices present (`grep -c 'cta-banner'` returns at least 4). `/` still renders the about label without a visible leading dash duplication.

---

### U2. Create `app/data/consulting.ts`

**Goal.** Stand up `app/data/consulting.ts` with the `ConsultingOffering` interface and the three seeded offerings. Source of truth for the offerings list.

**Requirements.** R10.

**Dependencies.** None — independent of U1.

**Files.**
- `app/data/consulting.ts` (new)

**Approach.**

Export an `ConsultingOffering` interface and a `consultingOfferings: ConsultingOffering[]` constant. Field order in each object matches the interface declaration so the file diffs cleanly when new entries are added. Title strings carry the embedded `<br />` per K3. Outcomes arrays carry the prototype's literal copy verbatim.

Sketch (directional, not literal):

```
export interface ConsultingOffering {
  id: string
  title: string
  tagline: string
  blurb: string
  outcomes: string[]
}

export const consultingOfferings: ConsultingOffering[] = [
  {
    id: 'agent-architecture',
    title: 'Agent<br />Architecture.',
    tagline: 'Multi-agent systems that …',
    blurb: 'Design and build agentic systems end-to-end: …',
    outcomes: [
      'Working agent system, in your repo, on your stack.',
      'Architecture doc + tool catalogue your team owns.',
      'Eval loop wired to CI so quality doesn\'t drift.',
    ],
  },
  // ai-automation, ai-training analogous
]
```

Copy strings verbatim from the prototype (`_process/prototype/consulting.html` lines 96–177). Preserve punctuation, casing, and the embedded `<br />` exactly.

**Patterns to follow.** `app/data/experiments.ts` from PRO-77 (PRO-77 K4). Same export style (`export interface` + `export const`), same file-level commentary at the top describing the data shape and TODO conventions, same TypeScript style (single quotes, no semicolons inside object literals, trailing commas, 2-space indent — matching `nuxt.config.ts`).

**Test scenarios.**
- Test expectation: none — pure data file. Correctness is proven by U6 asserting 3 entries render with the expected titles and tagline / blurb / outcomes content, and by U8's visual check against the prototype.

**Verification.** `pnpm dev` boots without TS errors when U6's `consulting.vue` imports the array. The array has length 3, each entry has a non-empty `title`, `tagline`, `blurb`, and `outcomes` of length 3.

---

### U3. `ConsultingEntry.vue` — prop-driven entry-rich row

**Goal.** A reusable, prop-driven row component that renders one `<li class="entry entry-rich">` with the 3-column layout (idx | body | outcomes). SSR-safe.

**Requirements.** R6, R7, R15.

**Dependencies.** U1 (consumes `.entry*`, `.entry-rich`, `.outcomes`, `.entry-body--outcomes`, and `.label`).

**Files.**
- `app/components/ConsultingEntry.vue` (new)

**Approach.**

Single-file component with `<script setup lang="ts">`. Define `Props` interface with `idx: number; title: string; tagline: string; blurb: string; outcomes: string[]`. Compute `idxLabel = computed(() => String(props.idx).padStart(2, '0'))`.

Template sketch — *directional guidance, not implementation specification*:

```
<li class="entry entry-rich">
  <span class="idx">{{ idxLabel }}</span>
  <div class="entry-body">
    <!-- v-html: see K3. Static repo-controlled source. -->
    <h3 v-html="title" />
    <p class="tagline">{{ tagline }}</p>
    <p class="blurb">{{ blurb }}</p>
  </div>
  <div class="entry-body entry-body--outcomes">
    <span class="label">What you walk away with</span>
    <ul class="outcomes">
      <li v-for="o in outcomes" :key="o"><span>{{ o }}</span></li>
    </ul>
  </div>
</li>
```

No `<style>` block — all styles come from `sections.css`. The `<h3>` uses `v-html` because the title carries authoring `<br />` markup (K3). If the project's ESLint config is configured to error on `vue/no-v-html` (default is a warning), suppress with an inline disable plus a one-line comment.

The component renders an `<li>` because its consumer wraps the iteration in an `<ol class="entry-list">` (R5). Rendering an `<li>` outside an `<ol>` / `<ul>` is invalid HTML — the contract is that this component is only used inside an entry-list. Document this in a top-of-file comment.

**Patterns to follow.** `app/components/ExperimentCard.vue` — same `<script setup lang="ts">` shape, same `idxLabel` computed pattern (PRO-77 K3), same no-style-block convention.

**Test scenarios.**
- Happy path: given `idx=1, title='Agent<br />Architecture.', tagline='Multi-agent systems …', blurb='Design and build …', outcomes=['a', 'b', 'c']`, the component renders one `<li class="entry entry-rich">`, the `.idx` element contains the literal `"01"`, the `<h3>` innerHTML is `Agent<br>Architecture.` (browser-normalized form of the `<br />` self-close), the `.tagline` contains the tagline string, the `.blurb` contains the blurb string, the `.outcomes` has exactly 3 `<li>` children each containing a `<span>` with the outcome text.
- Edge case — idx padding: `idx=10` renders `"10"` (no over-padding); `idx=1` renders `"01"`.
- Edge case — single outcome: `outcomes=['only one']` renders one `<li>` in `.outcomes`. The grid layout still applies.
- Edge case — empty outcomes array: `outcomes=[]` renders zero `<li>` in `.outcomes` but the `<ul class="outcomes">` and the "What you walk away with" label still render. (Acceptable; PRO-78 ships all three entries with 3 outcomes each, but defensive.)
- Edge case — outcomes with duplicate values: `outcomes=['x', 'x']` would warn on `:key="o"`. Acceptable because the seeded data has no duplicates; if this becomes a concern, change to `:key="(_, i) => i"` later. Note in a top-of-file comment.
- Covers AE1 (R16): rendering three consecutive `<ConsultingEntry>` components inside an `<ol class="entry-list">` produces a contiguous block of three rows with the prototype's vertical rhythm (top border on each, bottom border on the last via `:last-child`).
- SSR: server render produces complete HTML including the `v-html` content; no `window` or `document` reference appears in setup.

**Verification.** Component renders inside the page in U6 with no Vue warnings. The 3 rows on `/consulting` each show: 96px index, body with h3 / tagline / blurb in display & body type, outcomes column with stone-accent left border (or top border below 900px) and three arrow-prefixed bullets.

---

### U4. `HowItWorks.vue` — static three-step engagement section

**Goal.** A self-contained `<section>` with `.section-head` and a 3-step grid (Scope · Build · Handover). No props.

**Requirements.** R8, R14, R15.

**Dependencies.** U1 (consumes `.section-head*`, `.steps`, `.step*`, `.label`, `.t-caption faint`, `.todo`).

**Files.**
- `app/components/HowItWorks.vue` (new)

**Approach.**

Single-file component. No `<script setup>` block needed (no props, no state). Template renders the entire section verbatim from `_process/prototype/consulting.html` lines 189–230, with the prototype's inline-styled `<span class="label">` replaced by the bare `<span class="label">` per K2.

Sketch — *directional guidance, not implementation specification*:

```
<section data-screen-label="Consulting — How it works">
  <div class="shell">
    <div class="section-head">
      <span class="label">Engagement</span>
      <h2>How it works.</h2>
    </div>
    <div class="steps">
      <div class="step"><span class="num">01</span><h4>Scope.</h4><p>…</p></div>
      <div class="step"><span class="num">02</span><h4>Build.</h4><p>…</p></div>
      <div class="step"><span class="num">03</span><h4>Handover.</h4><p>…</p></div>
    </div>
    <p class="t-caption faint" style="margin-top:48px;">
      <span class="todo">TODO(claudio):</span>
      Confirm engagement model. Pricing intentionally not shown on the page.
    </p>
  </div>
</section>
```

Step paragraphs are copied verbatim from the prototype (lines 200–204, 209–213, 218–222). The trailing `<span class="todo">` block on line 226–228 is preserved.

**Patterns to follow.** `app/components/SiteFooter.vue` — same static-template + no-state structure, same convention of carrying inline styles for one-off layout adjustments via class-based replacement.

The `style="margin-top:48px;"` on the trailing paragraph is a single one-off margin that's not worth promoting to a class. The prototype carries it inline and PRO-78 follows. If a second consumer ever appears, it can be promoted to a `.section-trail` or similar.

**Test scenarios.**
- Happy path — render: the component produces one `<section>` containing exactly one `.section-head`, one `.steps` grid with exactly 3 `.step` children, each containing exactly one `.num`, one `<h4>`, and one `<p>`. The three `.num` elements contain `"01"`, `"02"`, `"03"` in order. The three `<h4>` elements contain `"Scope."`, `"Build."`, `"Handover."` in order.
- Edge case — viewport collapse: at width < 800px the `.steps` grid collapses to 1 column (verified via the existing media rule at lifted line 589).
- SSR: server render produces complete HTML; no client API referenced.

**Verification.** The component renders inside `consulting.vue` in U6 with the prototype-matching 3-column step grid above 800px and stacked below.

---

### U5. `CtaBanner.vue` — prop-driven CTA banner

**Goal.** A prop-driven `<section>` containing the `.cta-banner` block (top+bottom border, oversized headline, secondary copy, single filled-pill CTA).

**Requirements.** R9, R14, R15.

**Dependencies.** U1 (consumes `.cta-banner*`, `.btn*`).

**Files.**
- `app/components/CtaBanner.vue` (new)

**Approach.**

Single-file component with `<script setup lang="ts">`. Define `Props` interface with `heading: string; body: string; ctaLabel: string; ctaHref: string`.

Template sketch — *directional guidance, not implementation specification*:

```
<section data-screen-label="Consulting — CTA">
  <div class="shell">
    <div class="cta-banner">
      <div>
        <h2>{{ heading }}</h2>
        <p>{{ body }}</p>
      </div>
      <div>
        <a class="btn btn-filled" :href="ctaHref">
          {{ ctaLabel }}
          <span class="btn-arrow" aria-hidden="true">→</span>
        </a>
      </div>
    </div>
  </div>
</section>
```

For PRO-78, the page calls:

```
<CtaBanner
  heading="Got something to build?"
  body="A short note about what you're working on is enough to start. No deck required."
  cta-label="Start a conversation"
  cta-href="mailto:claudioccm@gmail.com"
/>
```

The component handles the wrapping `<section>` and `.shell` so the page stays declarative.

**Patterns to follow.** `app/components/ExperimentCard.vue` — same prop-typing convention, same single-file no-style-block layout, same `<a>` + arrow glyph pattern (matching `.btn-arrow` translate on hover from PRO-77).

**Test scenarios.**
- Happy path: given `heading='Got something to build?', body='A short note …', ctaLabel='Start a conversation', ctaHref='mailto:claudioccm@gmail.com'`, the component renders one `<section>` containing one `.cta-banner`, one `<h2>` with the heading text, one `<p>` with the body text, and one `<a class="btn btn-filled">` whose `href` attribute equals `ctaHref` and whose first text node is `ctaLabel`.
- Edge case — `mailto:` href: the `<a>`'s `href` starts with `mailto:` and the link is clickable. (Verified visually in U8 by clicking the link in the browser.)
- Edge case — empty body: passing `body=''` produces an empty `<p>` element. (Defensive, not exercised by PRO-78's call site.)
- SSR: server render produces complete HTML; the `<a>` has all attributes set; no client API referenced.

**Verification.** The component renders inside `consulting.vue` in U6 with the prototype-matching banner (heavy black borders top and bottom, oversized headline, secondary copy below at body-size, filled pill button on the right collapsing under the headline below 800px).

---

### U6. Compose the consulting page in `app/pages/consulting.vue`

**Goal.** Replace the placeholder page with the real consulting content. Hero + positioning + offerings list + how-it-works + CTA. The DOM contains exactly three `.entry.entry-rich` elements sourced from `consultingOfferings`.

**Requirements.** R1, R2, R3, R4, R5, R11, R12, R15, R16.

**Dependencies.** U1, U2, U3, U4, U5.

**Files.**
- `app/pages/consulting.vue` (replaced)

**Approach.**

`<script setup lang="ts">` imports the array via explicit relative path (`import { consultingOfferings } from '~/data/consulting'`) matching the convention from `app/pages/index.vue` (PRO-77 U6 — `app/data/` is not in Nuxt's auto-import dirs; explicit import keeps the dependency readable).

Template sketch — *directional guidance, not implementation specification* — mirrors `_process/prototype/consulting.html` lines 33–251:

```
<div>
  <HeroSection :down-arrow-href="'#consulting'">
    <template #eyebrow>
      <span class="dot" aria-hidden="true" />
      <span>Consulting — Independent practice</span>
    </template>
    <template #headline>
      <h1>Ship AI that<br />actually works.</h1>
    </template>
    <template #sub>
      For builders and teams who want real agentic systems — not AI
      theatre. Architecture, automation, and training, run hands-on.
      <span class="todo">TODO(claudio): confirm hero line</span>
    </template>
    <template #ctas>
      <a class="btn btn-filled" href="mailto:claudioccm@gmail.com">
        Start a conversation
        <span class="btn-arrow" aria-hidden="true">→</span>
      </a>
      <a class="btn btn-ghost" href="#consulting">See offerings</a>
    </template>
  </HeroSection>

  <section data-screen-label="Consulting — Positioning">
    <div class="shell">
      <div class="bio-grid">
        <div>
          <span class="label">Who this is for</span>
          <h2>The brief.</h2>
        </div>
        <div class="bio-body">
          <p>
            Most "AI strategy" is a slide deck. … working systems your team can run after I leave.
            <span class="todo">TODO(claudio): confirm positioning</span>
          </p>
          <p class="secondary">
            I work with small teams of builders — founders, product leads, and engineers — who already know what they want, but want a faster, cleaner path to a real agentic system in production.
          </p>
        </div>
      </div>
    </div>
  </section>

  <section id="consulting" data-screen-label="Consulting — List">
    <div class="shell">
      <div class="section-head">
        <span class="label">Offerings — 03</span>
        <h2>What I do.</h2>
      </div>
      <ol class="entry-list" aria-label="Consulting offerings">
        <ConsultingEntry
          v-for="(offering, i) in consultingOfferings"
          :key="offering.id"
          :idx="i + 1"
          :title="offering.title"
          :tagline="offering.tagline"
          :blurb="offering.blurb"
          :outcomes="offering.outcomes"
        />
      </ol>
      <p class="t-caption faint" style="margin-top:48px;">
        <span class="todo">TODO(claudio):</span>
        Decide whether to add <em>AI Strategy &amp; Advisory</em>,
        <em>Custom AI Product Development</em>, and
        <em>Exploration / Prototype Sprints</em> — kept off the page for v1.
      </p>
    </div>
  </section>

  <HowItWorks />

  <CtaBanner
    heading="Got something to build?"
    body="A short note about what you're working on is enough to start. No deck required."
    cta-label="Start a conversation"
    cta-href="mailto:claudioccm@gmail.com"
  />
</div>
```

Notes:
- Template root is a single `<div>` because Nuxt's eslint preset enforces a single template root on pages (same pattern as `app/pages/index.vue` from PRO-77 — see comment on lines 6–8 of that file).
- The bio-grid's left-column label uses the new global `.label` class introduced in U1.
- The hero's `down-arrow-href="#consulting"` overrides the `HeroSection` default (`#work`) per K6.
- "Offerings — 03" is hand-authored. If a fourth offering is added later, this string becomes wrong; flagged in Open Questions. A 5-minute follow-up could derive it from `consultingOfferings.length.toString().padStart(2, '0')`.

**Patterns to follow.** `app/pages/index.vue` (PRO-77 U6) — same single-`<div>` template root, same explicit-import pattern for the data array, same prop-passing style with `v-for`+`:key`.

**Test scenarios.**
- Happy path — render: `/consulting` returns 200 and the response HTML contains exactly one `<section class="hero">`, one positioning section (no id), one `<section id="consulting">`, one `<section data-screen-label="Consulting — How it works">`, one `<section data-screen-label="Consulting — CTA">`, and exactly three `<li class="entry entry-rich">` elements inside `.entry-list`.
- Covers AE1 (R16): the three offerings render `01–03` in their `.idx` elements with titles "AGENT ARCHITECTURE.", "AI AUTOMATION.", "AI TRAINING." (uppercased via `.entry h3 { text-transform: uppercase }`) in that order. Each row has a tagline and blurb. Each row's outcomes column has exactly 3 `<li>` items.
- Covers AE2 (R11): on `/consulting`, the document's `<nav>` contains exactly one `<a aria-current="page">` and its text content is "Consulting".
- Covers AE3 (R12): the document's nav has an "Experiments" link with `href="/#work"` (not `#work`) and an "About" link with `href="/#about"` (not `#about`). The footer's "Experiments" link has `href="/#work"` and "About" has `href="/#about"`.
- Anchors: clicking the hero's `#consulting` button (or the down-arrow) scrolls the page to the offerings section (verified in U8 by scroll position).
- Mailto CTAs: both CTA `<a>` elements (one in the hero, one in `<CtaBanner>`) have `href` starting with `mailto:claudioccm@gmail.com`.
- SSR: the page renders fully on the server; view-source contains all three offering titles and the "How it works" / CTA headlines before any JS runs.
- TODO markers: the three `<span class="todo">` elements from the prototype are present in the rendered DOM (hero sub, positioning paragraph, candidate-offerings note); the `HowItWorks` component contributes a fourth (the engagement-model TODO).

**Verification.** Open `/consulting` in the dev server; visually compare against `_process/prototype/consulting.html`. The DOM assertions above are satisfied. No console errors, no Vue warnings.

---

### U7. Cross-route navigation smoke check

**Goal.** Verify (without code changes) that the chrome correctly handles `/consulting` as a route — the nav highlights Consulting, the home-pointing links flip to `/#work` / `/#about`, and the footer's static cross-route anchors still work. This unit is a verification gate, not a code-write.

**Requirements.** R11, R12, R16 (AE2, AE3).

**Dependencies.** U6.

**Files.**
- None — verification only. (If a chrome bug surfaces, file a follow-up ticket rather than expanding PRO-78's scope.)

**Approach.**

Use the `/browse` skill against the running dev server to walk three flows:

1. Load `/consulting`. Assert: the nav's "Consulting" link carries `aria-current="page"`. Inspect `view-source` to confirm the underline-on-active styling (chrome.css line 56) is painted.
2. From `/consulting`, click "Experiments" in the nav. Assert: the browser navigates to `/#work` and the page scrolls to the experiments grid. Repeat for "About" → `/#about`.
3. From `/consulting`, scroll to the footer. Click "Experiments" in the footer's Site column. Assert: same as above, navigates to `/#work` and scrolls.

If any flow fails, the issue is in `SiteNav.vue` or `SiteFooter.vue` from PRO-76. PRO-78 does not modify either; file the failure as a separate PRO-76-bug ticket and proceed.

**Patterns to follow.** PRO-76's browser test (`docs/solutions/PRO-76-browser-test/`) and PRO-77's (`docs/solutions/PRO-77-browser-test/`).

**Test scenarios.**
- All three nav/footer flows above succeed.
- The nav's "Consulting" link is visually underlined on the page (chrome.css `.nav-links a[aria-current="page"]::after` rule from PRO-76).
- The nav doesn't paint `aria-current` on any other link when on `/consulting`.

**Verification.** All assertions pass. Screenshots from the three flows saved alongside U8's artifacts under `docs/solutions/PRO-78-browser-test/`.

---

### U8. Browser verification of the consulting page itself

**Goal.** Confirm the page actually renders and behaves correctly against the prototype across viewports.

**Requirements.** R1, R3, R4, R5, R7, R8, R9, R14, R16 (AE1).

**Dependencies.** U1–U6 (and U7 in parallel).

**Files.**
- None — verification only.

**Approach.**

Use the `/browse` skill against the running dev server. Assert:

1. `/consulting` returns 200 with no console errors.
2. Hero: H1 reads "SHIP AI THAT ACTUALLY WORKS." (uppercased by the `.hero h1` rule, with the line break preserved from the `<br />`). Eyebrow row shows dot + "Consulting — Independent practice". Two CTAs visible: filled "Start a conversation" → `mailto:` and ghost "See offerings" → `#consulting`. Down-arrow visible, href `#consulting`.
3. Clicking the down-arrow or "See offerings" scrolls to the offerings section (the H2 "WHAT I DO." enters viewport).
4. Positioning block: bio-grid renders 2 columns at 1280px (1fr 1.4fr) and 1 column at 600px. Left column shows the "Who this is for" eyebrow with leading 24px rule + "THE BRIEF." H2. Right column shows two paragraphs, the second styled `.secondary` (Ash Text).
5. Offerings list: exactly three `.entry.entry-rich` elements. Each shows the 3-column layout at 1280px (96px idx | 1.1fr body | 1fr outcomes with left stone-accent border), and stacks to a single column below 900px (with the outcomes border flipping from left to top per K2's mobile rule). Each `.idx` shows `01`, `02`, `03`. Each `<h3>` is uppercased and broken across two lines per the `<br />`. Each outcomes column has exactly 3 arrow-prefixed bullets.
6. How it works: `.section-head` shows "ENGAGEMENT" + "HOW IT WORKS." H2. Three steps render in a 3-column grid at 1280px, stacked below 800px. Each `.num` is `01`/`02`/`03` in disp font; each `<h4>` is `SCOPE.` / `BUILD.` / `HANDOVER.` uppercased.
7. CTA banner: top and bottom 1px black borders. Oversized headline "GOT SOMETHING TO BUILD?" on the left, filled pill CTA "Start a conversation →" on the right above 800px, stacked vertically below. Clicking the CTA opens the OS's default mail client to `claudioccm@gmail.com` (verified by inspecting `href`; not actually opening Mail.app in the browser test).
8. SiteFooter: renders the existing 4-column grid (from PRO-76) at the bottom. Already-tested in PRO-76; just confirm it's present.

**Patterns to follow.** PRO-77's browser-test process and artifact convention. Create `docs/solutions/PRO-78-browser-test/` with screenshots:
- `consulting-desktop-full.png` (1280px viewport, full page)
- `consulting-mobile-full.png` (600px viewport, full page)
- `consulting-offering-row.png` (close-up of one `.entry.entry-rich` showing all three columns)
- `consulting-cta-banner.png` (close-up of the CTA banner)
- `consulting-nav-active.png` (close-up of the nav showing the underlined "Consulting" link)

**Test scenarios.**
- All eight assertions above pass.
- No layout regression on `/` (the K2 home-page text fix in U1 is verified — about block still renders the eyebrow + "About" caption with the prototype's leading 24px rule, not a duplicate dash).
- View-source HTML on `/consulting` contains all three offering titles, the engagement model headlines, and the CTA banner text — proving SSR.

**Verification.** All eight assertions checked off. Five screenshots saved under `docs/solutions/PRO-78-browser-test/`.

---

## Sequencing

```
U1 (styles) ──┐
              ├──> U3 (ConsultingEntry) ──┐
U2 (data) ────┤                            │
              ├──> U4 (HowItWorks) ───────┤
              │                            ├──> U6 (page) ──> U7 + U8 (verify, parallel)
              └──> U5 (CtaBanner) ────────┘
```

U1 and U2 are independent and can land in any order or in parallel. U3, U4, U5 each depend on U1 (CSS). U3 also depends on U2 (data shape — but only at consumption time in U6). U6 depends on U1–U5. U7 and U8 both depend on U6 and can run in parallel.

---

## Risks and Mitigations

- **Risk — `v-html` ESLint rule (K3) fails the lint gate.** The default `eslint-plugin-vue` warns on `vue/no-v-html`; the project's `eslint.config.mjs` may have it as an error. *Mitigation:* check `eslint.config.mjs` during U3; if it errors, add an inline `// eslint-disable-next-line vue/no-v-html` comment plus a one-line explanation referencing K3 and the static-source guarantee. If the rule is project-wide error-only with no inline-disable allowance, fall back to splitting `title` into `titleLine1` / `titleLine2` props (mentioned in K3 trade-off) — a 10-line change isolated to `ConsultingEntry.vue` and `consulting.ts`.
- **Risk — The new global `.label` rule breaks the home page's about-block label visually.** *Mitigation:* U1 explicitly modifies `app/pages/index.vue` to align with the new rule. U8 verifies no regression on `/`. The mitigation is part of U1's scope, not a separate ticket.
- **Risk — `.entry h3 { text-transform: uppercase }` plus an embedded `<br />` produces awkward letter-break behavior across font-loading.** Specifically: between FOUT (Inter loaded, Oswald not) and FOIT, the H3 may briefly render with different break points. *Mitigation:* the `@nuxt/fonts` module from PRO-75 handles preloading via `font-display: swap`. Spot-check during U8 by throttling network and reloading; if visible, file a font-loading polish ticket rather than reworking the H3 markup.
- **Risk — Hero "Offerings — 03" string drifts from `consultingOfferings.length`.** Adding a fourth offering means editing both the data file and `consulting.vue`. *Mitigation:* flagged in Open Questions; a 5-minute follow-up can derive it from the array. Not blocking for PRO-78.
- **Risk — The hero's down-arrow `aria-label="Scroll to work"` (from PRO-77 `HeroSection.vue` line 36) is technically wrong on `/consulting`.** *Mitigation:* explicitly deferred (Scope Boundaries). A `downArrowLabel` prop is a 3-line patch when it's appropriate to do.
- **Risk — The placeholder mailto-without-subject CTAs land in spam filters that treat bare `mailto:` as suspicious.** *Mitigation:* deferred — flagged as a content polish for a later ticket. The prototype matches.
- **Risk — `<NuxtLink>` is used inconsistently across the page** (the page uses raw `<a href="mailto:…">` for CTAs and the inline `<a href="#consulting">` for the in-page anchor; the home's about block uses `<NuxtLink to="/consulting">` for cross-route). PRO-78 follows the prototype: in-page anchors and mailto use `<a>`; cross-route uses `<NuxtLink>` only where the home page already does. *Mitigation:* none needed; pattern is consistent with PRO-77.

---

## Open Questions (deferred to implementer)

- **Whether to derive the "Offerings — 03" label from `consultingOfferings.length`** rather than hand-authoring it. Cleanest answer: yes, change `<span class="label">Offerings — {{ offeringsCount }}</span>` with `const offeringsCount = computed(() => String(consultingOfferings.length).padStart(2, '0'))`. Defer the decision to U6's implementation pass.
- **Whether to suppress `vue/no-v-html` inline or to split `title` into two props.** Decide at U3 implementation time after checking `eslint.config.mjs`. Recommended: inline-suppress with a one-line comment.
- **Whether to lift the trailing `<p class="t-caption faint" style="margin-top:48px;">` margin into a `.section-trail` class** rather than carrying the prototype's inline style. Both consumers (offerings list, how-it-works) use the same inline margin. Acceptable as inline for PRO-78; a 5-minute follow-up could promote it.
- **Whether to add a `downArrowLabel` prop to `HeroSection.vue` and pass `"Scroll to offerings"` on `/consulting`.** A 3-line patch to PRO-77's component. Listed as deferred per Scope Boundaries; the implementer may pull it in if it feels lighter than a separate ticket.
- **Whether the empty `<h2></h2>` from `_process/prototype/consulting.html` pattern (used on the home page's work section per PRO-77 U6) is present on the consulting page's offerings section.** Answer: no, the consulting offerings section has a non-empty `<h2>What I do.</h2>` per the prototype (line 94). No change required; flagging for U6 sanity.

---

## Acceptance Criteria (from ticket)

- **AC1 (AE1).** Consulting route (`/consulting`) renders the full prototype layout: Hero → positioning ("The brief.") → three offerings (Agent Architecture, AI Automation, AI Training) in the `.entry.entry-rich` 3-column shape → How it works (3 steps) → CTA banner. Verified visually and via DOM assertions in U8.
- **AC2 (AE2).** SiteNav highlights "Consulting" as active on `/consulting` — `aria-current="page"` is set on that link and the underline-on-active rule paints. Verified in U7.
- **AC3 (AE3).** Anchor links route back to home sections correctly. From `/consulting`, the nav's "Experiments" link points at `/#work` and "About" at `/#about`; clicking either navigates to `/` and scrolls to the named section. Footer's Site column behaves the same. Verified in U7.
- **AC4.** Adding a fourth offering is one new entry in `app/data/consulting.ts`. No edit to `consulting.vue`, `ConsultingEntry.vue`, or `sections.css` is required (modulo the open question about deriving "Offerings — 03" from the array length). Proved by inspection during code review; the array length is not assumed anywhere in markup or styles.
- **AC5.** Below 900px the offerings rows stack to a single column with the outcomes border flipping from left to top; below 800px the steps grid and CTA banner each stack to one column. Below 800px the bio-grid stacks. All transitions happen via CSS lifted from the prototype (plus the small K2 mobile improvement on the outcomes column), not new media queries.
- **AC6.** Hero, positioning, offerings, how-it-works, and CTA all consume globally-styled class names; no `<style scoped>` block is added anywhere. Verified by `grep -r "<style" app/components/ app/pages/` returning no matches in the new files.
