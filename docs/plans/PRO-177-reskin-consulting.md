# PRO-177 — Redesign v2 · 4 · Reskin Consulting (editorial)

Branch: `feature/PRO-177-reskin-consulting` · Base: `dev` · Worktree: `…/PRO-177`

## Brief

Recompose `/consulting` to the editorial design. Spec = the committed reference
`_process/design-exploration-unzipped/Consulting.dc.html` + screenshots
`screenshots/01-consulting.png` + `02-consulting.png`. All copy from the `site`
content collection via `useSiteContent()` (PRO-176). Apply `[data-reveal]` CSS
reveals (utility from PRO-174). Static stat (StatCounter removed PRO-174). Keep
the `9999,00` price stubs.

## State of the page on arrival (important)

The bulk of the editorial reskin already landed in the chain PRO-174 → 175 → 176.
`app/pages/consulting.vue` already:

- Uses `HeroSection` (slot-driven) with the mono eyebrow, serif H1
  "Your recurring work, done by a system.", mono sub, filled + ghost CTAs.
- Renders the deliverables (`.tag-strip`), the brief + differentiator two-column
  with a **static** `.stat-figure` ("95%"), the A1/A2/A3 offerings via
  `ConsultingEntry` (each with a "What you walk away with" `→` list),
  `HowItWorks` (static `.steps`), pricing (`9999,00` stubs), and a static
  `CtaBanner`.
- Pulls **all** copy from `content/site.json` → `consulting` via
  `useSiteContent()`. No hardcoded strings.
- No marquee, no count-up, no GSAP/Lenis (all retired in PRO-174).

`pnpm build` is green on arrival. So PRO-177 is a **gap-closing + verification**
pass, not a from-scratch rebuild.

## Gaps vs. the reference (measured against the live render at 1280)

1. **No `[data-reveal]` on the page** — `document.querySelectorAll('[data-reveal]').length === 0`.
   The brief explicitly requires applying the reveal utility. Home (`index.vue`)
   already tags `.section-head` / `.bio-body`; consulting tags nothing.
   → **Fix (in scope).**

2. **Deliverable chips** — the reference renders them as a *wrap of bordered mono
   chip boxes inside the hero*, directly under the CTAs. The live page renders a
   full-width bullet-separated `.tag-strip` band *below* the hero. The brief lists
   "a wrap of bordered mono chips for deliverables" as a **hero** element.
   → **Fix (in scope):** move the deliverables into the hero as bordered chip
   boxes (`.hero-chips`), matching the reference. Remove the separate `.tag-strip`
   band from the page. Keep `consulting.deliverables` as the single data source.

3. **Hero CTA button shape** — reference uses sharp rectangular buttons; the live
   system uses pill buttons (`--radius-buttons: 9999px`). **Deliberately NOT
   changed.** `--radius-buttons` is a global token shared with the home hero
   (which shipped with pills in PRO-174/175). Flipping it is a cross-page theme
   change, out of `/consulting` scope, and would desync the two heroes. The
   shipped editorial system is the source of truth for shared chrome; the
   `.dc.html` deck is an exploration. Recorded as a known deviation.

4. **Hero down-arrow (`↓`)** — present on the live consulting hero (and home),
   absent in the deck. **Deliberately kept** for the same reason: it is shared
   `HeroSection` chrome shipped in PRO-174. Out of scope to special-case off for
   one page.

## Changes (small, page-scoped, committed in steps)

### C1 — Move deliverables into the hero as bordered chips
- `consulting.vue`: render the deliverables wrap **inside** the `HeroSection`
  `#ctas`-adjacent area is not a slot, so add the chips as the last hero child.
  Cleanest path: extend `HeroSection` with an optional `#after` slot rendered
  after the CTA row, inside `.shell`, before the down-arrow. `index.vue` does not
  use it → no home change. Move the chips markup there, swap `.tag-strip` →
  `.hero-chips` bordered-box styling.
- Remove the standalone `.tag-strip` `<ul>` from `consulting.vue`.
- `sections.css`: add `.hero-chips` (flex wrap, gap 8px) + `.hero-chips__item`
  (1px hairline border, mono 11–12px, `--faint`/`--dim`, padding ~7px 13px,
  uppercase tracking) mirroring the reference chip. Leave `.tag-strip` rules in
  place (still used nowhere else — safe to keep or drop; drop only if no other
  reference). Verify no other page references `.tag-strip` before removing CSS.

### C2 — Apply `[data-reveal]`
- Tag the consulting section heads / blocks with `data-reveal`, matching how
  `index.vue` and the deck do it: hero eyebrow/headline/sub/cta/chips groups,
  brief column, differentiator column, offerings head + each entry, process head
  + steps, pricing head, CTA. Keep it tasteful (block-level, not every node).
  The utility is pure-CSS, double-guarded (`prefers-reduced-motion: no-preference`
  + `@supports view()`), so reduced-motion / no-JS / unsupported browsers render
  fully visible — no extra work for the reduced-motion AC.
- `HeroSection` / `ConsultingEntry` need a way to carry `data-reveal`. Attributes
  fall through to the root element by default (Vue inheritAttrs), so adding
  `data-reveal` on `<ConsultingEntry data-reveal …>` lands on the `<li>`. For the
  hero inner blocks, add `data-reveal` inside the slotted markup the page already
  owns.

### C3 — Verify, not change
- Stat is static, copy is from content, prices are `9999,00`: confirm, don't touch.

## Acceptance

- Matches `01/02-consulting.png` at 1280 (modulo the recorded button/arrow
  deviation, which follows the shipped system).
- Copy entirely from `content/site.json`.
- Responsive at 375 / 768 / 1280.
- Reduced-motion safe (reveal is opt-in + guarded; verify `prefers-reduced-motion`
  shows full static content).
- `pnpm build` green.

## Verification

1. `pnpm build` green.
2. `browse` screenshots of `/consulting` at 375 / 768 / 1280; eyeball vs refs.
3. `prefers-reduced-motion: reduce` → page fully visible, no hidden start state.
4. No console errors; all copy present in SSR HTML.
