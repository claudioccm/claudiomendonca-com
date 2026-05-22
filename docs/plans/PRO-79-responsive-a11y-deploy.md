---
ticket: PRO-79
title: "chore: Responsive + a11y QA + static deploy config"
type: chore
status: active
created: 2026-05-22
plan_depth: standard
branch: feature/PRO-79-responsive-a11y-deploy
integration_branch: dev
---

# PRO-79 — Responsive + a11y QA + static deploy config

## Summary

Two-part ticket: (1) **QA pass** — verify the existing two-route site (`/` home,
`/consulting`) renders correctly at 375 / 768 / 1280 / 1440 px and meets a set of
accessibility bars (AAA contrast, semantic landmarks, reduced-motion, external-link
hardening, ≥44px tap targets), fixing what the audit surfaces; (2) **Deploy config** —
add a `netlify.toml` and any `nuxt.config` change needed for reliable static
generation (`nuxt generate` → `.output/public`), and document the domain-wiring +
branch-model runbook as **manual steps** (no DNS/registrar actions in code).

This is a **QA + config** ticket, not a feature ticket. The bias is: change the
minimum needed to pass each bar, preserve the Motto design system, and keep every
fix verifiable at the four breakpoints. The build already has substantial a11y
groundwork from PRO-76/77/78 (gated reduced-motion blocks, `role="list"` grids,
`aria-current`, `:focus-visible` ring on cards) — so several audit units are
**verify-and-confirm** rather than **fix**.

**Scope guard — main branch:** All work targets the `dev` integration branch.
This plan does **not** propose merging or pushing to `main`. Production promotion
is a separate, explicitly-confirmed step the user owns.

---

## Audit Baseline (from code read — confirm against live pages)

What the static read of the codebase already shows. The implementer should treat
this as the starting hypothesis and confirm/refute each item against the running
dev server before changing anything.

**Already in place (likely verify-only):**
- Landmarks: `app/layouts/default.vue` renders `<header>` (via `SiteNav`, which
  also wraps `<nav aria-label="Primary">`), `<main>`, and `<footer>` (via
  `SiteFooter`). `<section>` elements present on both pages. Home `<h1>` is "AI
  EXPERIMENTS"; consulting `<h1>` is "Ship AI that actually works."
- Reduced-motion: gated in `app/assets/css/base.css` (`scroll-behavior`) and
  `app/assets/css/sections.css` (card image scale + arrow translate).
- External links with `target="_blank"`: `ExperimentCard.vue` and the footer
  "Elsewhere" links (`ccmdesign.com`, `squoosh.ccmdesign.com`) already carry
  `rel="noopener"`.
- Focus ring: `.experiment:focus-visible` ring exists in `sections.css`.

**Likely needs work (audit-driven — confirm first):**
- **AAA contrast:** `--color-faint-gray: #717476` on white is ≈4.9:1 — passes WCAG
  AA but **fails AAA (≥7:1)** for normal-size text. Consumers: footer `h4`
  (`chrome.css`), `.entry .meta` (`sections.css`), and `.t-caption faint` trailing
  TODO captions. `--color-silver-text: #848484` (≈3.5:1) fails both AA and AAA but
  has **no live consumer** (`.silver` class is defined, never used in markup —
  confirm via grep). `--color-ash-text: #4d5153` (≈7.6:1) **passes AAA** and is the
  workhorse secondary color.
- **Tap targets ≥44px (mobile):** no `min-height`/min-size anywhere. Nav links
  (`.nav-links a`, `padding: 0`), footer links (`.footer a`), and the hero
  `.down-arrow` are below 44px touch height at 375px. Pill buttons (`.btn`,
  `padding: 16px …`) are ≈49px tall — already pass.
- **Reduced-motion completeness:** `.nav` `border-color` transition (`chrome.css`)
  and `.btn` `background/color/transform` transitions (`sections.css`) are **not**
  inside a `prefers-reduced-motion` block. Minor; decide whether to gate.
- **Skip link:** none present. Optional AAA/keyboard nicety; decide in U2.
- **Footer placeholder links:** GitHub / X rows are `href="#"` with a TODO. They
  carry `rel="noopener"` but no `target`. Not real external links yet — leave as
  TODO scaffolding, do not invent URLs.

---

## Requirements Traceability

| ID | Requirement (from ticket) | Covered by |
|----|---------------------------|------------|
| R1 | Both routes render correctly at 375 / 768 / 1280 / 1440 px | U1 (all units verified at these widths) |
| R2 | AAA contrast on functional text | U3 |
| R3 | Semantic landmarks: header / nav / main / section / footer | U2 |
| R4 | `prefers-reduced-motion` honored | U4 |
| R5 | External links: `rel="noopener"` + `target="_blank"` | U5 |
| R6 | Tap targets ≥44px on mobile | U6 |
| R7 | `nuxt generate` static output to `.output/public` | U7 |
| R8 | `netlify.toml`: build command + publish dir | U8 |
| R9 | Branch model dev=preview / main=prod; no auto-push to main | U8, Deploy Runbook |
| R10 | Domain (claudiomendonca.com) wiring documented, not executed | Deploy Runbook |

---

## Scope Boundaries

**In scope**
- Cross-viewport visual QA of `/` and `/consulting` at the four widths.
- A11y fixes the audit confirms: contrast, landmarks, reduced-motion, external
  links, tap targets.
- `netlify.toml` + minimal `nuxt.config` changes for reliable static output.
- A written deploy runbook (branch model + domain wiring) with manual steps marked.

**Deferred to Follow-Up Work**
- Real GitHub / X URLs in the footer (currently `href="#"` TODOs).
- Real product screenshots / URLs in `app/data/experiments.ts` (existing TODOs).
- Resolving the `TODO(claudio)` copy markers in hero/positioning/engagement sections.
- A `lighthouse` CI gate or automated a11y test harness (this ticket is manual QA).
- Open Graph / social meta, sitemap, robots.txt, analytics.

**Outside this ticket's identity**
- Dark mode (Motto is light-only by design — `02-design-system-motto.md`).
- New pages, new components, new sections, copy rewrites.
- Any DNS, registrar, or Netlify-dashboard action performed from code.
- Any merge, push, or promotion to `main`.

---

## Verification Method (applies to every QA unit)

The implementer should run the dev server (`pnpm dev`) and/or a production preview
(`pnpm generate && pnpm preview`) and inspect each route at **375, 768, 1280, 1440 px**.
Use the `/browse` skill or browser devtools device emulation. For contrast and tap
targets, devtools' accessibility/inspector panels (or Lighthouse) give measured
values — record the measured number, not an eyeball estimate. A unit is "done" only
when its bar is confirmed at all four widths (where viewport-dependent) and the
build still type-checks, lints, and generates.

**Global gates (run after the last code-touching unit):**
- `pnpm lint` clean
- `pnpm typecheck` clean
- `pnpm generate` succeeds and emits `.output/public/index.html` +
  `.output/public/consulting/index.html`

---

## Implementation Units

### U1. Cross-viewport visual QA sweep (baseline)

**Goal:** Establish the responsive baseline — load both routes at all four widths,
record what renders correctly and what breaks, before any fix. This unit produces
the punch-list that confirms or refutes the Audit Baseline above and scopes U2–U6.

**Requirements:** R1.

**Dependencies:** none (first unit).

**Files:** none modified — this is an observation/record unit. Findings feed U2–U6.
(Screenshots, if captured, go to a scratch dir, not committed.)

**Approach:** Run `pnpm dev`. For each of `/` and `/consulting` at 375 / 768 /
1280 / 1440 px, check: no horizontal scroll/overflow; oversized `disp` headlines
(`clamp(72px,16.5vw,200px)` hero, `clamp(56px,9vw,138px)` section heads) clamp
sanely and don't clip; grid breakpoints fire as authored (`experiments-grid`
collapses to 1col ≤760px; `footer-grid` 4→2→1col at 800/480px; `entry-rich`
3→1col ≤900px; `steps` / `cta-banner` ≤800px; `bio-grid` ≤800px; nav `.hide-sm`
hides "About" ≤640px). Note any text clipping, overlap, or container overflow.

**Patterns to follow:** breakpoints are authored in `app/assets/css/chrome.css`
and `sections.css` — read them as the source of expected behavior.

**Test scenarios:** Test expectation: none — observation unit, no behavioral
change. Output is the punch-list, not code.

**Verification:** A written list of confirmed-good and confirmed-broken items per
route per width. If nothing is broken beyond the Audit Baseline items, that is a
valid (and likely) outcome — note it and proceed.

---

### U2. Semantic landmarks confirm + optional skip link

**Goal:** Confirm the document landmark structure (header / nav / main / section /
footer) is complete and correctly nested on both routes; add a skip-to-content
link if the audit deems it warranted.

**Requirements:** R3.

**Dependencies:** U1.

**Files:**
- `app/layouts/default.vue` (skip link target / markup, only if added)
- `app/components/SiteNav.vue` (skip link anchor, only if added)
- `app/assets/css/chrome.css` or `base.css` (skip-link visually-hidden + focus
  styles, only if added)

**Approach:** Verify each route exposes exactly one `<main>`, a `<header>` with a
labelled `<nav>`, multiple `<section>`s, and one `<footer>`. Confirm there are no
nested or duplicate landmarks and that `<h1>` is unique per route. The layout
already wires `SiteNav` (`<header><nav aria-label="Primary">`), `<main><slot/></main>`,
and `SiteFooter` (`<footer id="contact">`). If the only gap is the skip link,
add a single visually-hidden-until-focused `<a href="#main">Skip to content</a>`
as the first focusable element and give `<main>` an `id="main"`. Keep the skip
link styling Motto-consistent (black on white, sharp corners, `sans` 500). If the
audit shows landmarks already complete and the team does not want a skip link,
record "verified, no change" and close the unit.

**Patterns to follow:** `aria-label="Primary"` on the nav already sets the pattern
for labelled landmarks; mirror Motto button/focus treatment for the skip link
focus state (`:focus-visible` ring style from `.experiment`).

**Test scenarios:**
- Landmark count: each route has exactly one `<main>`, one `<header>`, one
  `<footer>`, one `<nav>` (confirm via accessibility tree / devtools).
- Heading: each route has exactly one `<h1>` (`/` = "AI EXPERIMENTS";
  `/consulting` = "Ship AI that actually works").
- If skip link added: it is the first item in tab order, is visually hidden until
  focused, becomes visible on keyboard focus, and moves focus to `<main>` on activation.
- Skip link (if added) does not appear for mouse users / does not disturb layout.

**Verification:** Devtools accessibility tree shows the expected landmark map on
both routes at all widths; if a skip link was added, keyboard-tab from page load
reveals it first and Enter jumps to main content.

---

### U3. AAA contrast pass on functional text

**Goal:** Bring all **functional** text (not dev-scaffold TODO markers) to WCAG
AAA contrast (≥7:1 normal, ≥4.5:1 large) against its background, per the Motto
"no gray-on-gray below AAA" rule, while preserving the visual hierarchy.

**Requirements:** R2.

**Dependencies:** U1.

**Files:**
- `app/assets/css/tokens.css` (only if a token value is adjusted)
- `app/assets/css/chrome.css` (footer `h4` color)
- `app/assets/css/sections.css` (`.entry .meta`, `.label`, `.t-caption faint` consumers)

**Approach:** Measure each gray-text consumer against its background:
- `--color-ash-text #4d5153` (~7.6:1) — passes AAA, **leave as-is**. This is the
  primary secondary-text color (blurbs, `.bio-body p.secondary`, steps, outcomes).
- `--color-faint-gray #717476` (~4.9:1) — **fails AAA**. Live functional consumers:
  footer section headings `h4` (`chrome.css`), `.entry .meta` (`sections.css`).
  Decide the fix: either (a) re-point these consumers to `--color-ash-text`
  (simplest, stays AAA, minimal hierarchy loss since they're already small
  uppercase labels), or (b) darken `--color-faint-gray` itself to ≥7:1 (e.g.
  toward `#595c5e`-ish — measure, don't guess) which also lifts the TODO markers.
  Prefer (a) — surgical, leaves the dev-scaffold TODO look untouched. **Confirm the
  choice against the design intent before editing.**
- `--color-silver-text #848484` (~3.5:1) — fails everything, but confirm via grep
  it has **no live functional consumer** (only the `.silver` utility class exists).
  If unused, no change needed; note it as a token that must not be used on
  functional text. If a consumer is found, treat it like faint-gray.
- The `.todo` marker (`base.css`, `--color-faint-gray`) and `.t-caption faint`
  trailing captions are **dev scaffolding** flagged for removal in follow-up work
  — these are explicitly out of the AAA-functional bar. Note them but do not
  re-color them as if production copy (re-coloring is harmless if you fold them
  into option (b), but don't add work solely for TODO text).

Re-verify nothing dropped below AAA after the change, and that the Motto hierarchy
(black headlines, ash secondary, faint tertiary) still reads.

**Patterns to follow:** All colors flow through tokens in `tokens.css`; never
hardcode a hex in a component. Keep the neutral-only palette (no chromatic color
on text — `02-design-system-motto.md` Don't list).

**Test scenarios:**
- Footer `h4` ("Site"/"Contact"/"Elsewhere") measures ≥7:1 against the white footer
  background after the change.
- `.entry .meta` text (if rendered — confirm consulting offerings actually emit a
  `.meta` row; current `ConsultingEntry.vue` markup may not) measures ≥7:1.
- Primary body, `.bio-body p.secondary`, `.blurb`, `.outcomes li`, `.step p`
  (all `--color-ash-text`) re-confirmed ≥7:1 — should be unchanged.
- No functional text element measures below 7:1 on either route at any width
  (font-size doesn't change with viewport for these, but confirm once).
- Hierarchy spot-check: headlines still clearly dominant; secondary text still
  reads as secondary, not promoted to primary black.

**Verification:** Devtools/Lighthouse contrast check reports no AAA failures on
functional text across both routes; visual hierarchy intact.

---

### U4. Reduced-motion completeness

**Goal:** Ensure every CSS transition/animation that produces motion is either
already gated or newly gated behind `prefers-reduced-motion: reduce`, so a user
with the OS setting sees no non-essential motion.

**Requirements:** R4.

**Dependencies:** U1.

**Files:**
- `app/assets/css/sections.css` (extend the existing reduced-motion block)
- `app/assets/css/chrome.css` (nav border transition — gate if kept)

**Approach:** Inventory all `transition`/`animation` declarations:
- Already gated (`sections.css` reduced-motion block): card `.shot img` scale,
  `.experiment-caption .arrow` translate, `.btn .btn-arrow` translate. **Confirm
  these still match the live transitions** (selectors haven't drifted).
- Not gated: `.nav` `transition: border-color 200ms` (`chrome.css`); `.btn`
  `transition: background-color, color, transform 160ms` + `.btn:active`
  `transform: translateY(1px)` (`sections.css`). The nav border and button
  color/background changes are arguably non-motion (color fades) and low-risk, but
  the `.btn` `transform` and `:active` translate **are** motion. Decision: extend
  the existing `prefers-reduced-motion` block to also neutralize `.btn` transform
  transitions and the `:active` translate, and optionally the nav border-color
  transition. Keep it surgical — add to the existing media block, don't create a
  second one. `scroll-behavior` is already handled in `base.css`.

**Patterns to follow:** the existing
`@media (prefers-reduced-motion: reduce) { … transition: none !important; transform: none !important; }`
block at the bottom of `sections.css` (R14 from PRO-77) is the established pattern
— extend it, mirror its `!important` approach and comment style.

**Test scenarios:**
- With OS "reduce motion" on (or devtools emulation), hovering an experiment card
  produces no image scale and no arrow translate (regression-confirm existing gate).
- With reduce-motion on, pressing/hovering a `.btn` produces no transform/translate
  motion (new gate).
- With reduce-motion **off**, all the above motions still play (no regression to
  default experience).
- Anchor-jump (`#work`, `#consulting`, `#about`, `#contact`) is instant (no smooth
  scroll) with reduce-motion on — confirm `base.css` rule.

**Verification:** Toggling the OS / emulated reduce-motion setting flips motion on
and off as specified on both routes; no console errors; lint clean.

---

### U5. External-link hardening confirm

**Goal:** Every link that navigates to an external origin opens with both
`target="_blank"` and `rel="noopener"` (add `noreferrer` only if the team wants
it — `noopener` is the security-relevant token and is what the ticket asks for).

**Requirements:** R5.

**Dependencies:** U1.

**Files:**
- `app/components/SiteFooter.vue` (only if a gap is found)
- `app/components/ExperimentCard.vue` (verify; the data drives which cards are external)

**Approach:** Enumerate every external `<a>`:
- Footer "Elsewhere": `https://ccmdesign.com`, `https://squoosh.ccmdesign.com` —
  already `target="_blank" rel="noopener"`. **Verify only.**
- `ExperimentCard.vue` link: hardcoded `target="_blank" rel="noopener"` on the
  card anchor. The Squoosh card resolves to a real external URL
  (`https://squoosh.ccmdesign.com`); other cards currently point at `#` (TODO).
  Cards are uniformly `target="_blank"` regardless — confirm that's acceptable for
  the `#`-placeholder cards (opening `#` in a new tab is harmless but odd; leave
  as-is since real URLs are deferred work, just note it). **Verify.**
- Footer GitHub / X: `href="#"` placeholders with `rel="noopener"` but no `target`.
  These are **not external yet** — do not add `target="_blank"` to a `#` href and
  do not invent URLs. Leave as TODO scaffolding.
- `mailto:` links (hero CTA, CtaBanner, footer email): `mailto:` is not a new-tab
  external nav — must **not** get `target="_blank"`. Confirm none were added.

If U1 or this enumeration finds any real external link missing `rel="noopener"`,
add it. Expectation based on the code read: **no changes needed** — this is a
confirm unit.

**Patterns to follow:** existing `target="_blank" rel="noopener"` pairing in
`SiteFooter.vue` and `ExperimentCard.vue`.

**Test scenarios:**
- Every `<a href="https://…">` on both routes has `target="_blank"` AND
  `rel="noopener"` (grep + DOM inspect).
- No `mailto:` link carries `target="_blank"`.
- Placeholder `href="#"` footer links are unchanged (still no `target`).

**Verification:** `grep -rn 'href="https' app/` cross-checked against `target`/`rel`
attributes; DOM inspection on both rendered routes confirms the pairing.

---

### U6. Tap targets ≥44px on mobile

**Goal:** Every interactive element (links, buttons) presents a touch target of at
least 44×44px at the 375px mobile viewport, without breaking the Motto layout at
desktop widths.

**Requirements:** R6.

**Dependencies:** U1.

**Files:**
- `app/assets/css/chrome.css` (nav links, footer links)
- `app/assets/css/sections.css` (hero `.down-arrow`; confirm `.btn` already passes)

**Approach:** Measure rendered touch height/width at 375px:
- `.btn` (`padding: 16px 28.8px`, line-height 1, 17px font) ≈49px tall — **passes**,
  no change.
- `.nav-links a` (`padding: 0`, 17px font) ≈24px tall — **fails**. Add vertical
  hit area. Because the nav row is a fixed 72px flex bar, prefer adding
  `padding-block` (e.g. ~12px) and/or `min-height: 44px` with
  `display: inline-flex; align-items: center` so the target grows without shifting
  the 72px bar height or the underline position (`::after { bottom: -6px }` is
  measured from the link box — re-verify the underline still sits correctly).
  Scope the enlargement to mobile (`@media (max-width: 640px)`) if a desktop change
  would disturb the tight nav rhythm; confirm desktop spacing is still acceptable
  either way.
- `.footer a` (17px, `display` default inline, grid gap 12px) — line box ≈24px,
  vertical gap gives ~36px center-to-center — **fails 44px**. Add `min-height: 44px`
  + `inline-flex`/`align-items` or sufficient `padding-block` on footer list
  links so each row is ≥44px tappable. Footer is already single-column ≤480px so
  this won't fight a multi-column layout at mobile.
- Hero `.down-arrow` (34px disp glyph, `display: inline-block`) — glyph box may be
  <44px wide. Add `min-width/min-height: 44px` + centering, or padding, so the
  scroll affordance is tappable. Keep it visually a bare arrow (don't add a
  visible box) — pad the hit area only.
- `.wordmark` (logo link, `inline-flex`, 20px disp + ast) — measure; likely ~24px
  tall, enlarge hit area the same way if it fails.

Keep all enlargements as hit-area only (padding / min-size / flex centering) — no
new borders, backgrounds, or radius that would violate Motto. Re-run U1's sweep at
375px after the change to confirm nothing reflowed badly, and re-check 1280/1440
to confirm desktop is untouched.

**Patterns to follow:** Motto pill buttons already demonstrate the
"generous padding, no layout shift" approach; reuse `inline-flex` +
`align-items: center` (already used by `.wordmark` and `.nav-links`).

**Test scenarios:**
- At 375px: `.nav-links a`, `.footer a`, `.down-arrow`, `.wordmark` each measure
  ≥44px in the touch dimension(s) (devtools box model / "inspect tap target").
- `.btn` re-confirmed ≥44px (regression check — should be unchanged).
- At 1280 / 1440px: nav bar height still 72px, nav underline still positioned
  correctly, footer rows not visually over-spaced, hero arrow visually unchanged.
- No horizontal overflow introduced at 375px by the enlarged targets.

**Verification:** Tap-target measurements ≥44px at 375px across all interactive
elements on both routes; desktop layout visually unchanged; lint clean.

---

### U7. Static-generation config (nuxt.config)

**Goal:** Ensure `pnpm generate` reliably produces a fully static, pre-rendered
site under `.output/public` suitable for Netlify static hosting.

**Requirements:** R7.

**Dependencies:** none (config; can run in parallel with QA units, but verify
**after** any markup/CSS change so the generated output reflects fixes).

**Files:**
- `nuxt.config.ts` (only if a change proves necessary)

**Approach:** Nuxt 4 `nuxt generate` defaults to full static pre-rendering
(crawler-based) and emits `.output/public`. Both routes are static (no dynamic
params, no runtime data) so the default crawler should discover `/` and
`/consulting` via the in-app `<NuxtLink to="/consulting">` and footer/nav links.
First, run `pnpm generate` **as-is** and inspect output:
- Confirm `.output/public/index.html` and `.output/public/consulting/index.html`
  exist and contain pre-rendered markup (not an empty SPA shell).
- Confirm hashed assets and fonts (`@nuxt/fonts`) and images (`@nuxt/image`) are
  emitted under `.output/public/_nuxt` / `_ipx` as appropriate.

Only if the crawler misses `/consulting` (it shouldn't — it's linked), add an
explicit prerender hint:
`nitro: { prerender: { routes: ['/', '/consulting'], crawlLinks: true } }`.
Avoid setting `ssr: false` (that produces a client-only SPA shell with empty HTML,
which fails the pre-rendered-markup check and hurts a11y/SEO). Keep `ssr` at its
default (true) so generate pre-renders real HTML. Do **not** add a Netlify-specific
Nitro preset in `nuxt.config` — `netlify.toml` (U8) points Netlify at the static
`.output/public` dir, which is preset-agnostic and the simplest reliable path for a
two-page static site. Document whichever path is taken in a config comment, mirroring
the existing heavily-commented `nuxt.config.ts` style.

**Patterns to follow:** the existing `nuxt.config.ts` uses block comments to
explain non-obvious config (CSS order, fonts) — any addition should carry the same
explanatory comment.

**Test scenarios:** Test expectation: none (pure build config) — verification is
the build output, not a unit test.

**Verification:** `pnpm generate` exits 0; `.output/public/index.html` and
`.output/public/consulting/index.html` both contain real pre-rendered content
(visible headline text in the HTML source); `pnpm preview` (or a static file
server on `.output/public`) serves both routes with working links, fonts, and
images.

---

### U8. netlify.toml + branch-model config

**Goal:** Add a `netlify.toml` at the repo root that tells Netlify how to build and
where to publish, and that encodes the dev=preview / main=prod branch model without
enabling any auto-promotion to main.

**Requirements:** R8, R9.

**Dependencies:** U7 (publish dir + build command must match what generate emits).

**Files:**
- `netlify.toml` (new, repo root)

**Approach:** Create `netlify.toml` with at minimum:
- `[build]` `command = "pnpm generate"`, `publish = ".output/public"`.
- A pinned Node version via `[build.environment]` `NODE_VERSION` (match the repo's
  toolchain — confirm the version the lockfile / local env expects; pick a current
  LTS that satisfies Nuxt 4) so CI builds are reproducible.
- Ensure pnpm is used: Netlify auto-detects `pnpm-lock.yaml`; optionally pin
  `PNPM_VERSION` in `[build.environment]` for determinism.
- A SPA-style catch-all redirect is **not** appropriate for a pre-rendered static
  multi-page site (it would mask real 404s); only add redirects if a specific need
  surfaces. A trailing-slash/`pretty-urls` note can be left to Netlify defaults.

Branch model (configured in the **Netlify dashboard**, documented in the runbook,
not enforceable from `netlify.toml` alone): production branch = `main`; branch
deploys / deploy previews enabled for `dev` (and PRs). The `netlify.toml` build
settings apply to all contexts; if a context-specific build is ever needed, use
`[context.production]` / `[context.deploy-preview]` blocks — not needed now since
the build is identical across contexts. **Do not** add anything that pushes or
promotes to `main`.

Add a short comment block at the top of `netlify.toml` pointing to the Deploy
Runbook section of this plan for the manual dashboard + DNS steps.

**Patterns to follow:** none in-repo (first deploy config); keep it minimal and
commented, consistent with the repo's commented-config convention.

**Test scenarios:** Test expectation: none (deploy config) — validated by the
generate/preview output (U7) and, ultimately, by a Netlify dev-branch deploy
(manual, in the runbook).

**Verification:** `netlify.toml` parses (valid TOML); `command` and `publish`
match U7's output exactly (`.output/public`); committed to the `dev`-targeted
feature branch only. A real Netlify build verification is a manual runbook step,
not part of this code change.

---

## Deploy Runbook (manual steps — performed by Claudio, not by code)

> Everything in this section is **manual / external**. The plan and the PR add
> `netlify.toml` and config only. DNS, registrar, and Netlify-dashboard actions are
> done by hand and are intentionally **not** scripted or executed by the implementer.

### Branch model
- **`main` → production.** Set as the Netlify "Production branch". Deploys to the
  primary site URL (and, once wired, `claudiomendonca.com`).
- **`dev` → preview.** Enable branch deploys (or use as the deploy-preview source)
  so every push to `dev` produces a preview URL for review.
- **`staging`** (Douglas's env), if/when created, can be added as an additional
  branch deploy.
- **No auto-push to `main`.** Promotion from `dev` to `main` is a deliberate,
  explicitly-confirmed action the user takes — never automated by this ticket.

### Netlify site setup (dashboard — manual)
1. Connect the GitHub repo to a Netlify site (if not already connected).
2. Build command: `pnpm generate`. Publish directory: `.output/public`
   (these come from `netlify.toml`; confirm the dashboard reflects them).
3. Set Production branch = `main`. Enable branch deploys for `dev`.
4. Confirm the first `dev` deploy renders both routes and assets correctly using
   the Netlify-provided preview URL.

### Domain wiring — claudiomendonca.com (manual, external)
> DNS / registrar steps are **external and manual** — do not attempt in code.
1. In Netlify: Site → Domain management → add custom domain `claudiomendonca.com`
   (and `www.claudiomendonca.com`).
2. At the domain registrar / DNS provider, point the domain at Netlify — either:
   - Netlify DNS (change nameservers to Netlify's), or
   - External DNS: add the `A`/`ALIAS`/`CNAME` records Netlify specifies (apex
     `A`/`ALIAS` to Netlify load balancer; `www` `CNAME` to the Netlify subdomain).
3. Let Netlify provision the Let's Encrypt TLS certificate (automatic once DNS
   resolves).
4. Set the primary domain and configure the `www`↔apex redirect in Netlify.
5. Verify HTTPS resolves for both apex and `www` and that both routes load.

### Production promotion (manual, explicitly-confirmed)
- Only after dev preview is verified: open/merge a PR from the feature branch into
  `dev`. Production (`main`) promotion happens **separately** with explicit
  confirmation from Claudio. This ticket does not perform it.

---

## Sequencing

```
U1 (QA sweep, baseline punch-list)
 ├─ U2 (landmarks confirm / skip link)
 ├─ U3 (AAA contrast)
 ├─ U4 (reduced-motion completeness)
 ├─ U5 (external-link confirm)
 └─ U6 (tap targets ≥44px)
U7 (static generate config) ──> U8 (netlify.toml)   [verify U7/U8 AFTER U2–U6 land]
Global gates: pnpm lint • pnpm typecheck • pnpm generate
```

U1 first (it scopes the fixes). U2–U6 are independent of each other and can land in
any order or be batched. U7 then U8 (U8's publish dir depends on U7's confirmed
output). Re-run the global gates after all code-touching units. Everything stays on
`feature/PRO-79-responsive-a11y-deploy`, targeting `dev`.

---

## Risks & Notes

- **Risk: contrast fix flattens hierarchy.** Re-pointing `--color-faint-gray`
  consumers to `--color-ash-text` could make tertiary labels read as secondary.
  Mitigation: the affected consumers are small uppercase labels (footer `h4`,
  `.meta`) where the size/case already differentiates them; verify visually.
- **Risk: tap-target padding shifts the 72px nav bar or footer rhythm.** Mitigation:
  use `min-height` + flex centering inside the existing bar height, scope to mobile
  if needed, re-check desktop at 1280/1440.
- **Risk: `nuxt generate` SPA-shell trap.** If anyone sets `ssr: false`, output
  HTML goes empty and fails a11y/SEO. Mitigation: U7 explicitly keeps `ssr` default
  and checks for real pre-rendered markup.
- **Note:** the `.todo` / `TODO(claudio)` markers are intentional dev scaffolding
  from prior tickets, not production copy — excluded from the AAA-functional bar and
  flagged for separate removal.
- **Note:** several experiment cards and footer GitHub/X links are `#` placeholders;
  real URLs are deferred follow-up, not this ticket.
- **Note:** Motto is light-only by design — no dark-mode testing applies, despite
  the general project guidance to test both modes.

---

## Open Questions (for the implementer / Claudio)

1. **Contrast fix approach (U3):** re-point faint-gray consumers to ash-text
   (surgical, preferred) **or** darken the `--color-faint-gray` token globally
   (also lifts TODO markers)? Recommend the former.
2. **Skip link (U2):** add a skip-to-content link, or accept landmarks-only since
   the site is two short pages with a small nav? Recommend adding it (cheap, AAA-friendly).
3. **Reduced-motion on `.btn` (U4):** gate the button transform/`:active` translate,
   or treat color-only transitions as non-motion and leave them? Recommend gating
   the transform/translate, leaving color fades.
4. **Node/pnpm pin (U8):** confirm the exact `NODE_VERSION` / `PNPM_VERSION` to pin
   in `netlify.toml` against the local toolchain.
