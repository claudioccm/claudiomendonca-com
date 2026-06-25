---
title: "feat: Editorial design tokens (Instrument Serif + JetBrains Mono, monochrome)"
type: feat
status: active
date: 2026-06-25
ticket: PRO-175
---

# feat: Editorial design tokens — Instrument Serif + JetBrains Mono, monochrome

## Summary

Replace the redesign-v1 type + color system (Inter / Oswald / electric-violet on
near-black) with the editorial monochrome language: **Instrument Serif** display
type over a **JetBrains Mono** body, on a warm-black (`#0E0D0B`) page with a warm
cream (`#EDEAE3`) ink. All chromatic accents (violet, purple, green) are
neutralized to monochrome so no color renders anywhere. Work is scoped to the
token layer and the global type/chrome (`tokens.css`, `nuxt.config.ts`,
`base.css`, `chrome.css`) — section restyles (hero internals, cards, entries)
land in sibling tickets PRO-176/177. The 4-file CSS cascade
(tokens → base → chrome → sections) means redefining the CSS custom properties
in `tokens.css` cascades the new palette and fonts through `sections.css`
automatically, so most of the monochrome conversion is achieved at the token
layer without editing section styles.

## Problem Frame

The site currently ships the PRO-109 "redesign 1" foundation: Inter 500 body,
Oswald 500 uppercase display, and an electric-violet / vivid-purple / grass-green
accent set on a `#08080a` near-black canvas. The v2 direction (PRO-173 epic) is
an editorial, fully-monochrome look — serif headlines, monospace body, warm-black
paper, zero chroma — matching the committed design reference at
`_process/design-exploration-unzipped/Consulting.dc.html` and
`screenshots/01-consulting.png`. This ticket converts the foundation
(tokens + global type/chrome) so chrome + both pages adopt the new language;
section-level polish follows in later epic items.

**Dependency:** PRO-174 (retire motion stack) — merged to `dev`. ✓

## Requirements

- **R1** — `--font-disp` → `'Instrument Serif', Georgia, serif`; body / `--font-sans`
  base → `'JetBrains Mono', ui-monospace, monospace`; `--font-mono` stays JetBrains
  Mono. Inter + Oswald removed from tokens.
- **R2** — Palette: `--ink: #0E0D0B`, `--paper: #EDEAE3`, warm `--raised`, low-alpha
  cream `--hairline` + a solid equivalent (`--hairline-solid`).
- **R3** — Neutralize `--accent` / `--accent-alt` / `--accent-rare` to monochrome
  (paper / dim) so **no color renders** anywhere on the site.
- **R4** — Keep the legacy `--color-*` remap valid so unstyled chrome + sections
  still build and render legibly.
- **R5** — `nuxt.config.ts` `@nuxt/fonts` families → Instrument Serif (weight 400,
  normal + italic), JetBrains Mono (400, 500). Inter + Oswald removed.
- **R6** — Global type: body → mono; headings → Instrument Serif, weight 400,
  line-height ~0.9, negative letter-spacing, **mixed case** (not uppercase).
- **R7** — Chrome: nav links mono 12px, `letter-spacing: .04em`, hover opacity,
  active underline; wordmark in serif; buttons filled = paper bg / ink text,
  ghost = hairline border; eyebrows / labels mono uppercase 11px,
  `letter-spacing: .16em`, dim.
- **R8 (Acceptance)** — Chrome + home + consulting render Instrument Serif headlines
  over a mono body, fully monochrome (no violet / green), warm-black bg — visually
  matching the design reference. No Inter / Oswald requested in the network panel.

## Key Technical Decisions

- **Token layer is the lever (KTD1).** `sections.css` consumes `--font-disp`,
  `--font-sans`, `--accent`, `--accent-alt`, `--accent-rare`, `--ink`, `--paper`,
  `--dim` etc. via `var()`. Redefining those properties in `tokens.css` cascades
  the new fonts + monochrome palette through every section rule without touching
  `sections.css`. Neutralizing `--accent*` to `var(--paper)` / `var(--dim)` is what
  satisfies R3 site-wide. This keeps the ticket scoped to tokens + global
  type/chrome per the brief.

- **Heading case is handled globally, not per-section (KTD2).** The reference
  headlines are **mixed case** Instrument Serif (e.g. "Your recurring work, done by
  a system."), but the current `.disp` utility in `base.css` carries
  `text-transform: uppercase`, and `sections.css` repeats `text-transform: uppercase`
  on individual heading classes (`.hero h1`, `.section-head h2`, `.entry h3`, etc.).
  Setting `--font-disp` to a serif while leaving uppercase in place would render
  ALL-CAPS serif headlines, failing R8. Resolution within scope: drop
  `text-transform: uppercase` and the tight `-0.015em` tracking from the **global
  `.disp` utility in base.css**, and apply the editorial heading treatment
  (serif 400, line-height ~0.9, `letter-spacing: -0.02em`, none) at the global
  `h1–h6` / `.disp` level. The per-section `text-transform: uppercase` rules in
  `sections.css` that target *headings* (hero h1, section h2, entry h3) are the
  acceptance-blocking ones; because they are not reachable from the token layer,
  the global heading rule in base.css must win. **Approach:** add a global
  `h1, h2, h3, h4, h5, h6` rule in base.css with the editorial serif treatment and
  `text-transform: none`, placed so it overrides — see U3 for the cascade note. The
  eyebrow/label uppercase rules (`.hero-eyebrow`, `.label`, `.section-head .label`)
  are *intended* to stay uppercase (R7), so they are left alone.

- **Legacy `--color-*` remap stays structurally identical (KTD3).** The existing
  remap (`--color-pitch-black → --paper`, `--color-canvas-white → --ink`,
  `--color-charcoal-surface → --paper`, accent maps → accent vars) already produces
  the correct button polarity (filled = paper bg / ink text, ghost = paper border).
  Only the *values* of the underlying semantic tokens change; the remap wiring is
  preserved so `chrome.css` + `sections.css` keep building. The three decorative
  `--color-*-purple/violet/green` maps now point at the neutralized accents, so they
  too render monochrome.

- **Hairline alphas taken from the reference (KTD4).** Reference uses `#EDEAE314`
  (~8% cream) for separators → `--hairline: rgba(237, 234, 227, .08)`;
  `--hairline-solid` → a warm solid (`#2A2823`) so borders that can't take rgba
  layering still read. Dim text uses `#EDEAE36e` (~43%) / `#EDEAE3cc` (~80%) in the
  reference → keep `--dim` / `--faint` as warm-cream-derived greys.

- **Eyebrow tracking: brief says .16em, reference shows .18em (KTD5).** The brief is
  canonical → use `.16em` where this ticket sets eyebrow/label tracking. The
  existing `.hero-eyebrow` (.18em) and `.label` (.12em) live in `sections.css`
  (section scope, later tickets); not retouched here. Noted so the later section
  pass can align.

## Implementation Units

### U1. Rewrite the token palette + fonts (tokens.css)

- **Goal:** Swap the semantic palette to warm-black/cream monochrome and the font
  stacks to Instrument Serif + JetBrains Mono, keeping the legacy `--color-*` remap
  valid. Satisfies R1, R2, R3, R4.
- **Requirements:** R1, R2, R3, R4.
- **Dependencies:** none.
- **Files:** `app/assets/css/tokens.css`.
- **Approach:**
  - Semantic palette: `--ink: #0E0D0B`; `--paper: #EDEAE3`; `--raised: #17150F`
    (warm raised surface); `--dim` / `--faint` → warm-cream-derived greys
    (`--dim: #A8A39A`, `--faint: #6F6A60`); `--hairline: rgba(237, 234, 227, .08)`;
    `--hairline-solid: #2A2823`.
  - Neutralize accents: `--accent: var(--paper)`, `--accent-alt: var(--dim)`,
    `--accent-rare: var(--dim)` (no chroma).
  - Fonts: `--font-disp: 'Instrument Serif', Georgia, serif`;
    `--font-sans: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
    `--font-mono` unchanged (JetBrains Mono). Remove the Inter + Oswald references.
  - Leave the legacy `--color-*` remap block, the type scale, spacing, layout,
    radius, and page vars untouched (KTD3) — only the values they point at change.
  - Update the file header comment to describe the editorial monochrome system
    (currently describes the PRO-109 dark system).
- **Patterns to follow:** existing `:root` structure + the "two token sets" comment
  block; all colors hex/rgba (never oklch/hsl) per project convention.
- **Test scenarios:** Test expectation: none — pure CSS custom-property values; no
  behavioral change. Verified visually in U5 browser pass.
- **Verification:** `tokens.css` defines no `Inter` / `Oswald`; `--ink`/`--paper`
  equal the reference hexes; `--accent*` resolve to paper/dim; build succeeds.

### U2. Update @nuxt/fonts families (nuxt.config.ts)

- **Goal:** Make Nuxt fetch Instrument Serif (400 normal + italic) and JetBrains
  Mono (400, 500), and stop fetching Inter + Oswald. Satisfies R5.
- **Requirements:** R5.
- **Dependencies:** none (independent of U1).
- **Files:** `nuxt.config.ts`.
- **Approach:** Replace the `fonts.families` array:
  `{ name: 'Instrument Serif', weights: [400], styles: ['normal', 'italic'] }`,
  `{ name: 'JetBrains Mono', weights: [400, 500], styles: ['normal'] }`. Remove the
  Inter and Oswald entries. Update the adjacent typography comment (lines ~47-49) to
  reflect the editorial families.
- **Patterns to follow:** existing `fonts.families` shape; fallback stacks remain in
  `tokens.css` (`--font-disp` / `--font-sans` / `--font-mono`).
- **Test scenarios:** Test expectation: none — build config. Network-panel check that
  no Inter/Oswald is requested is the U5 acceptance scenario.
- **Verification:** `pnpm build` succeeds; generated `<head>` references Instrument
  Serif + JetBrains Mono only; no Inter / Oswald font requests.

### U3. Global type — body mono + editorial serif headings (base.css)

- **Goal:** Body renders JetBrains Mono; all headings render mixed-case Instrument
  Serif weight 400, line-height ~0.9, `letter-spacing: -0.02em`. Satisfies R6 and
  unblocks the R8 hero acceptance (KTD2).
- **Requirements:** R6, R8.
- **Dependencies:** U1 (consumes `--font-disp` / `--font-sans`).
- **Files:** `app/assets/css/base.css`.
- **Approach:**
  - `html, body` already use `var(--font-sans)` → now resolves to mono via U1; keep,
    but reconsider `--font-weight-medium` (500) on body — mono body in the reference
    reads at 400. Set body to weight 400 (the `--font-weight-medium` token is 500 and
    used elsewhere; set `font-weight: 400` directly on body rather than changing the
    token, to avoid side-effects on `.sans`/`.mono` utilities).
  - Update the `.disp` utility: keep `font-family: var(--font-disp)`; change to
    `font-weight: 400`, `letter-spacing: -0.02em`, **remove `text-transform: uppercase`**,
    add `line-height: 0.9`.
  - Add a global heading rule
    `h1, h2, h3, h4, h5, h6 { font-family: var(--font-disp); font-weight: 400; line-height: 0.9; letter-spacing: -0.02em; text-transform: none; }`.
    **Cascade note:** `sections.css` loads after `base.css` and sets
    `text-transform: uppercase` on specific heading selectors (`.hero h1`,
    `.section-head h2`, `.entry h3`, etc.) with equal-or-higher specificity, so a
    plain element rule in base.css will NOT win against them. To keep the acceptance
    target (mixed-case serif headlines) within this ticket's scope, the global
    heading rule must override those section rules. Use a low-risk override that does
    not edit `sections.css`: scope the rule to the document and rely on it being a
    `!important`-free win where possible, but where `sections.css` class selectors
    out-specify it (hero h1, section h2, entry h3), add `text-transform: none` to the
    matching element+context selector in base.css won't suffice — instead apply
    `text-transform: none !important` **only** to the global `h1, h2, h3` heading rule
    in base.css. This is a deliberate, single, well-commented use of `!important` to
    flip case at the foundation layer; the later section tickets (PRO-176/177) will
    remove the section-level `uppercase` rules and the `!important` can then be
    dropped. Document this in a comment.
  - Keep `::selection` (paper-on-ink still correct). Vignette `body::before` rgba
    whites still read on warm-black; leave unless visually wrong in U5.
- **Patterns to follow:** existing `.disp` / `.sans` / `.mono` utility block; the
  reduced-motion guards stay untouched.
- **Test scenarios:** Test expectation: none — global type CSS. Verified visually in
  U5 (hero h1 serif + mixed case + tight leading; body mono).
- **Verification:** Hero h1 on `/` and `/consulting` renders serif, mixed case,
  tight leading; body copy renders mono; build succeeds.

### U4. Chrome — nav, wordmark, buttons, focus (chrome.css)

- **Goal:** Nav links mono 12px tracked .04em with hover opacity + active underline;
  wordmark serif; ensure buttons read filled = paper / ink, ghost = hairline border;
  accent-derived focus rings now resolve to monochrome. Satisfies R7.
- **Requirements:** R7.
- **Dependencies:** U1.
- **Files:** `app/assets/css/chrome.css`.
- **Approach:**
  - `.wordmark`: change `font-family` to `var(--font-disp)` (serif), drop
    `text-transform: uppercase` and the `letter-spacing: 0.005em`, set size ~21px to
    match the reference; the `.ast` asterisk color already maps to `--accent`
    (now paper) so it renders monochrome — keep.
  - `.nav-links a`: set `font-family: var(--font-mono)`, `font-size: 12px`,
    `letter-spacing: 0.04em`; replace the `color`-based hover
    (`:hover { color: var(--accent) }`) with an **opacity** hover
    (`:hover { opacity: 0.55 }`) per the reference; keep the active underline
    (`[aria-current="page"]::after`) but ensure its `background` is `var(--paper)`
    (it currently uses `var(--accent)` → now paper, so monochrome — keep, no change
    needed). Keep the 44px hit-area flex.
  - `.nav-overlay__item a`: currently `var(--font-disp)` uppercase — for the mobile
    overlay, switch to serif mixed-case to match the new heading vocabulary
    (drop `text-transform: uppercase`); hover via opacity. (In-scope: chrome.)
  - Focus rings: `.skip-link:focus`, `.nav-toggle:focus-visible` use
    `outline: 2px solid var(--accent)` → now paper; legible on ink — keep.
  - Footer: `.footer a:hover`, `.footer-meta .glyph`, `.footer h2` reference
    `--accent` / `--dim` → resolve monochrome via U1; no edits needed, but verify in
    U5.
  - Buttons: `.btn-*` live in `sections.css` and already map filled = paper bg / ink
    text, ghost = paper border via the legacy `--color-*` remap (KTD3). No chrome.css
    button rules exist. Confirm in U5 that the hero CTA row matches the reference
    (filled cream / ink, ghost hairline border). If the ghost border needs to be the
    softer hairline rather than solid paper, that is a `sections.css` change deferred
    to the section ticket — note only.
- **Patterns to follow:** existing nav/footer block structure; `var()`-driven colors.
- **Test scenarios:** Test expectation: none — chrome CSS. Verified visually in U5
  (nav mono tracked, active underline on current page, hover opacity; wordmark serif).
- **Verification:** Nav renders mono 12px with the Consulting link underlined on
  `/consulting`; wordmark serif; hover dims; build succeeds.

### U5. Acceptance verification — build + browser (both pages)

- **Goal:** Prove R8 end-to-end: chrome + home + consulting render serif headlines
  over mono body, fully monochrome, warm-black bg, and no Inter/Oswald is requested.
- **Requirements:** R8.
- **Dependencies:** U1, U2, U3, U4.
- **Files:** none (verification only).
- **Approach:**
  - `pnpm install && pnpm build` green (the pipeline gate — no CI).
  - Browser pass on `/` and `/consulting`: confirm Instrument Serif headlines
    (mixed case, tight leading), JetBrains Mono body + nav + eyebrows, warm-black
    `#0E0D0B` bg, warm cream text, **no violet / purple / green** anywhere, filled
    CTA (cream/ink) + ghost CTA (hairline border), nav active underline.
  - Network panel / generated `<head>`: assert no `Inter` or `Oswald` font request;
    Instrument Serif + JetBrains Mono present.
  - Reduced-motion: confirm no regressions (page transition + `[data-reveal]` already
    guarded; this ticket changes no motion).
- **Test scenarios:**
  - Covers AE/R8. Home `/`: hero headline computed `font-family` contains
    "Instrument Serif"; body computed `font-family` contains "JetBrains Mono".
  - Covers R8. Consulting `/consulting`: same as above; Consulting nav link shows the
    active underline.
  - Covers R3/R8. No element on either page resolves a violet/green/purple accent —
    grep served HTML/CSS for the old hexes (`#6980ff`, `#9c98ef`, `#beee98`) → absent
    from rendered styles.
  - Covers R5. No `Inter` / `Oswald` in the prerendered `<head>` or font requests.
- **Verification:** All four scenarios pass; build green; screenshots match
  `screenshots/01-consulting.png` in type + tone.

## Scope Boundaries

**In scope:** `tokens.css` (palette + fonts + remap values), `nuxt.config.ts`
(`@nuxt/fonts` families), `base.css` (body mono + global serif headings),
`chrome.css` (nav, wordmark, overlay, focus). Verification on home + consulting.

**Out of scope / non-goals:**
- Section-level restyles — hero internals, experiment cards, consulting entries,
  CTA banners, stat figures, the `.btn` rules in `sections.css`, the section-level
  `text-transform: uppercase` heading overrides. These belong to PRO-176 / PRO-177.
- Copy, layout, or component-markup changes.
- Motion / reveal behavior (owned by PRO-174, already merged).

### Deferred to Follow-Up Work
- Remove the per-section `text-transform: uppercase` heading rules in `sections.css`
  and drop the foundation `!important` case-flip introduced in U3, once the section
  tickets restyle those headings (PRO-176/177).
- Align `.hero-eyebrow` (.18em) / `.label` (.12em) tracking to the brief's .16em in
  the section pass (KTD5).
- Soften ghost-button border to the cream hairline if the section pass calls for it.

## Risks & Dependencies

- **R-risk1 — `!important` case-flip (U3).** A single, well-commented foundation
  `!important` is needed to beat the `sections.css` uppercase heading rules without
  editing section files. Mitigation: scope it to the global `h1–h6`/`.disp` rule
  only, comment its removal condition, and verify no heading that *should* stay
  uppercase exists (eyebrows/labels are class-scoped, unaffected).
- **R-risk2 — legacy remap legibility.** Flipping palette values could make a remap
  pairing illegible. Mitigation: the remap polarity is unchanged (paper-on-ink /
  ink-on-paper); U5 browser pass confirms footer, buttons, focus rings.
- **Dependency:** PRO-174 merged to `dev` (motion stack retired) — satisfied.
