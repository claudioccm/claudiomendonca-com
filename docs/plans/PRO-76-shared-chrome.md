---
id: PRO-76
title: "feat: Shared chrome — default layout, SiteNav, SiteFooter"
type: feat
status: active
created: 2026-05-21
plan_depth: standard
worktree: experiments/claudiomendonca.com-wt/PRO-76
branch: feature/PRO-76-shared-chrome
depends_on: PRO-75
origin_docs:
  - 01-brief.md
  - 02-design-system-motto.md
  - 03-directions.md
  - 04-services-page.md
  - _process/prototype/index.html
  - _process/prototype/consulting.html
  - _process/prototype/styles.css
---

# feat: Shared chrome — default layout, SiteNav, SiteFooter

## Summary

Stand up the global chrome that wraps every route on `claudiomendonca.com`: a Nuxt 4 `default` layout that composes a sticky `SiteNav` (Oswald wordmark, four primary links, scroll-aware bottom border, route-aware anchor hrefs, `aria-current` on the active route) and a four-column `SiteFooter` (wordmark + blurb, Site links, Contact, Elsewhere) topped with a `footer-meta` row carrying the ✱ glyph and "Built with Motto®." Convert the current `app/app.vue` demo to a `<NuxtLayout><NuxtPage /></NuxtLayout>` shell and add minimal placeholder pages for `/` and `/consulting` so the chrome can be verified on both routes.

This ticket delivers chrome only. Real hero/work/about/services section content is deferred to PRO-77+.

---

## Problem Frame

PRO-75 ported the Motto foundation (`tokens.css` + `base.css`) and left a placeholder demo in `app/app.vue`. The prototype's nav and footer markup live in `_process/prototype/index.html` (lines 16–31, 161–207) and `_process/prototype/consulting.html` (lines 15–30, 255–301), with all chrome styling in `_process/prototype/styles.css` (lines 108–169 for nav, 171–225 for buttons referenced by chrome, 228–273 for footer + footer-meta).

PRO-76 needs to:

1. Lift that chrome out of the prototype and into reusable Vue components under Nuxt 4 conventions (`app/components/`, `app/layouts/`).
2. Honor the route-aware behavior already present in the prototype: on `/consulting`, the nav's "Experiments" and "About" links jump cross-route to `/#work` and `/#about` respectively, with `aria-current="page"` painted on the Consulting link. On `/`, the same two links are in-page anchors and `aria-current` lands on Experiments-via-Home.
3. Reimplement the prototype's vanilla-JS scroll listener (adds `.is-scrolled` past `scrollY > 0`) as an SSR-safe Nuxt composable pattern that mounts only on the client and tears down on unmount.
4. Keep `prefers-reduced-motion` honored — the relevant rule already lives in `base.css` (lines 60–62); the chrome must not reintroduce JS-driven smooth scroll that bypasses it.
5. Mark out-of-scope chrome content (real GitHub / X URLs) explicitly so it's tracked but not silently invented.

---

## Requirements

Traced from the PRO-76 ticket scope and `02-design-system-motto.md`:

- **R1.** A `default` Nuxt 4 layout at `app/layouts/default.vue` renders `<SiteNav />` + `<main><slot /></main>` + `<SiteFooter />`.
- **R2.** `app/app.vue` is reduced to a `<NuxtLayout><NuxtPage /></NuxtLayout>` shell so every page goes through the chrome unless it opts out.
- **R3.** `SiteNav.vue` lives at `app/components/SiteNav.vue` and renders: the wordmark (`<NuxtLink>` to `/`, ✱ glyph + "Claudio Mendonça", Oswald, uppercased) and a `<nav aria-label="Primary">` with four links — Experiments, Consulting, About, Contact — in that order.
- **R4.** SiteNav is `position: sticky; top: 0` with a transparent bottom border that becomes Stone Accent (`--color-stone-accent`) when the class `is-scrolled` is present.
- **R5.** SiteNav adds `is-scrolled` when `window.scrollY > 0` and removes it otherwise. The listener is registered on `mount` (client-only) and removed on `beforeUnmount`. No reference to `window` may occur during SSR.
- **R6.** Route-aware anchor hrefs:
  - On `/`: Experiments → `#work`, About → `#about` (in-page anchors).
  - On `/consulting`: Experiments → `/#work`, About → `/#about` (cross-route anchors).
  - Consulting → `/consulting` always. Contact → `#contact` always (footer anchor).
- **R7.** `aria-current="page"` is set on the link matching the current top-level route — on `/` the Experiments link carries it (Experiments is the home/work index), on `/consulting` the Consulting link carries it. (Matches prototype `consulting.html` line 24.)
- **R8.** Wordmark uses the literal `✱` character (U+2731) in the template, not the HTML entity `&#x2731;`. Glyph sits inside a `<span class="ast" aria-hidden="true">`.
- **R9.** `SiteFooter.vue` lives at `app/components/SiteFooter.vue` and renders a `<footer class="footer" id="contact">` containing:
  - A `.footer-grid` of four columns: (1) wordmark + blurb "AI experiments, and a small consulting practice.", (2) "Site" links (Experiments → home `#work`, Consulting → `/consulting`, About → home `#about`), (3) "Contact" links (`mailto:claudioccm@gmail.com`, GitHub TODO, X / Twitter TODO), (4) "Elsewhere" links (ccmdesign, Squoosh).
  - A `.footer-meta` row with three children: copyright "© 2026 Claudio Mendonça. All rights reserved.", the ✱ glyph (aria-hidden), and the text "Built with Motto®."
- **R10.** GitHub and X / Twitter handles render placeholder `href="#"` plus an inline `<span class="todo">TODO(claudio)</span>` marker that consumes the existing `.todo` style from `base.css` (lines 113–126). The `TODO(claudio)` literal is required (not just `TODO`) so a grep across the repo finds it.
- **R11.** Chrome styling lives in a new `app/assets/css/chrome.css` registered in `nuxt.config.ts`'s `css` array **after** `base.css`. Scoped component styles are not used in this ticket. (See Key Technical Decision K1 for the rationale.)
- **R12.** Both `/` and `/consulting` placeholder pages render the default layout. Placeholder body is a single `<h1>` per page (`Home` and `Consulting`) wrapped in `<section><div class="shell">` so the existing `section` and `.shell` rules from `base.css` apply.
- **R13.** Smooth scroll behavior is gated by the existing CSS rule in `base.css` (lines 60–62: `@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }`). The chrome must not reintroduce JS-based smooth scrolling that bypasses this rule.
- **R14.** SiteNav and SiteFooter must render correctly under SSR — no direct `window`, `document`, or `localStorage` access during the setup phase or first render. All client-only behavior is gated with `onMounted` (which already runs only on the client) or `if (import.meta.client)`.

Out-of-scope items are listed under Scope Boundaries.

---

## Scope Boundaries

### In scope

- `app/layouts/default.vue`, `app/components/SiteNav.vue`, `app/components/SiteFooter.vue`, `app/assets/css/chrome.css`, `app/pages/index.vue`, `app/pages/consulting.vue`, updates to `app/app.vue` and `nuxt.config.ts`.
- Chrome behavior listed in R1–R14 above.

### Out of scope (deferred to follow-up tickets)

- **Real page section content** — hero, experiments grid, about copy, services list, CTA banner, footer brand blurb refinement. Belongs to PRO-77 (Home content) and PRO-78 (Consulting content) or whatever the next tickets in the sequence are named. The placeholder pages created here are explicitly that — placeholders — and must be replaced by the page-content tickets, not extended.
- **Real GitHub and X / Twitter URLs.** Stay as `href="#"` + `TODO(claudio)` markers until Claudio supplies them.
- **Dark mode / theming.** Motto is light-only by design (`02-design-system-motto.md`).
- **Mobile drawer or hamburger menu.** Mobile responsive behavior is bounded by the existing CSS in the prototype (lines 166–169: `@media (max-width: 640px) { .nav-links { gap: 18px; } .nav-links .hide-sm { display: none; } }`). The `About` link receives `class="hide-sm"` to match.
- **Real `<title>` and meta differentiation per route.** Per-page `definePageMeta` / `useHead` is a separate concern; PRO-76 keeps the global `app.head` from PRO-75 untouched.
- **`image-slot` web component** and any prototype JS beyond the scroll listener.

---

## Key Technical Decisions

### K1. Chrome styles live in `app/assets/css/chrome.css`, not scoped to components

**Decision.** Lift the prototype's `.nav`, `.nav-inner`, `.wordmark`, `.nav-links`, `.btn*` (only the bits SiteNav consumes — see K3), `.footer`, `.footer-grid`, `.footer-meta` rules verbatim into a new `app/assets/css/chrome.css` registered in `nuxt.config.ts` after `base.css`.

**Why.**
- The selectors already exist as unscoped class names in the prototype CSS, and `base.css` already references them (line 58: `.nav, main, .footer { position: relative; z-index: 1; }`). Re-scoping them inside Vue components would force a rename or a `:deep()` dance for no benefit.
- The Motto design language treats nav and footer as part of the global system rather than encapsulated widgets. Future tickets may want to consume `.btn`, `.btn-filled`, `.btn-ghost`, `.wordmark` from page content (hero CTAs do this in the prototype, lines 44–50). Keeping the class names global preserves that contract.
- A single `chrome.css` mirrors how the prototype was authored, which keeps the line-range references in this plan easy to verify against the source-of-truth file.

**Alternative considered.** Scoped `<style scoped>` blocks in each component. Rejected for the reasons above. (Lightweight `<style>` blocks in the components are also fine when only the component owns the selector — but for PRO-76 every chrome selector also appears in the prototype, so unifying them in `chrome.css` keeps the slice obvious.)

### K2. SSR-safe scroll listener via `onMounted` + `onBeforeUnmount`

**Decision.** Inside `SiteNav.vue`'s `<script setup>`, declare a `const isScrolled = ref(false)`. Register a `handleScroll` function in `onMounted` (which Nuxt guarantees runs client-only) that sets `isScrolled.value = window.scrollY > 0`. Bind `:class="{ 'is-scrolled': isScrolled }"` on the root `<header class="nav">`. Tear down in `onBeforeUnmount` to avoid leaking the listener during HMR / route navigation.

**Why.**
- `onMounted` already gates client-only execution in Vue/Nuxt, so an extra `if (import.meta.client)` is unnecessary inside the hook body. Mention `import.meta.client` only if the team wants belt-and-braces — not required for correctness.
- The prototype uses `scrollY > 8`. PRO-76's ticket says "> 0". Honor the ticket — flip on `is-scrolled` at the very first pixel. If the visual result feels jittery at exactly 0, that's a follow-up tuning decision, not a planning decision.
- `{ passive: true }` is preserved from the prototype to keep the scroll path off the main thread.

**Pattern reference.** Mirror the structure of the prototype IIFE at `_process/prototype/index.html` lines 209–221, but transposed to Vue ref + lifecycle.

### K3. Only nav-consumed button styles ride along; other `.btn*` variants stay deferred

**Decision.** The nav itself does not render any `.btn`. The wordmark and links are plain anchors. So `chrome.css` does **not** need to include the `.btn`, `.btn-filled`, `.btn-ghost`, `.btn-arrow`, `.btn-text` block from prototype lines 171–225 in this ticket. Those land with the hero CTA work in PRO-77.

**Why.** Don't pull in styles the chrome itself doesn't use. Scope discipline.

### K4. Route-aware hrefs computed from `useRoute().path`

**Decision.** In `SiteNav.vue`, derive each link's `href` from a single `computed`:

```ts
// directional sketch only — implementer chooses final shape
const route = useRoute()
const isConsulting = computed(() => route.path === '/consulting')
const links = computed(() => [
  { label: 'Experiments', href: isConsulting.value ? '/#work'  : '#work',  routeMatch: '/' },
  { label: 'Consulting', href: '/consulting',                              routeMatch: '/consulting' },
  { label: 'About',      href: isConsulting.value ? '/#about' : '#about', routeMatch: '/',          hideSm: true },
  { label: 'Contact',    href: '#contact',                                 routeMatch: null },
])
```

`aria-current="page"` is applied when `route.path === link.routeMatch` and `routeMatch` is truthy. The Contact link never carries `aria-current` because it's an in-page anchor, not a route. (This illustrates the intended approach and is directional guidance for review, not implementation specification.)

**Why.** Single source of truth for the nav, easy to extend, no nested `v-if`s in the template. `useRoute()` is reactive in Nuxt, so this updates automatically on client-side navigation.

### K5. Wordmark uses `<NuxtLink>`, nav links use plain anchors

**Decision.** The wordmark is a route navigation (`/`), so it uses `<NuxtLink to="/">`. The four nav links are a mix of in-page anchors (`#work`, `#about`, `#contact`) and cross-route anchors (`/#work`, `/#about`, `/consulting`). Use plain `<a :href="...">` for all four so anchor-jump behavior stays native and the implementer doesn't have to teach `<NuxtLink>` to handle hash navigation.

**Why.** `<NuxtLink>`'s default scroll-behavior intercepts anchor clicks in ways that can fight with our `prefers-reduced-motion` rule. Plain `<a>` keeps it simple and lets the browser + CSS do the work.

**Trade-off accepted.** Clicking the Consulting link will do a full route navigation (which is what we want), but it goes through a plain `<a href="/consulting">` rather than `<NuxtLink>`. That's a marginal hit on perceived speed (Nuxt won't prefetch). For a two-page site this is fine; if it becomes a concern, the Consulting entry can switch to `<NuxtLink>` later without changing the rest.

### K6. Placeholder pages: option (A) — both `/` and `/consulting`

**Decision.** Create both `app/pages/index.vue` and `app/pages/consulting.vue` as minimal placeholders so the route-aware nav behavior on `/consulting` is actually verifiable.

**Why option A over option B.**
- The ticket says "Layout renders on both routes" as the first acceptance criterion. With only `app/pages/index.vue`, hitting `/consulting` would 404 and we couldn't visually confirm `aria-current="page"` lands on the Consulting link or that "Experiments" / "About" rewrite to cross-route hrefs.
- The cost of creating a second placeholder is one file with three lines of template. The cost of *not* creating it is shipping nav code we can't verify until PRO-78.
- Both placeholders are explicitly marked as PRO-77/78 territory so a future ticket doesn't recreate them.

---

## Output Structure

```
app/
├── app.vue                          # reduced to NuxtLayout shell
├── assets/
│   └── css/
│       ├── tokens.css               # unchanged (PRO-75)
│       ├── base.css                 # unchanged (PRO-75)
│       └── chrome.css               # NEW — nav + footer slices from prototype
├── components/
│   ├── SiteNav.vue                  # NEW
│   └── SiteFooter.vue               # NEW
├── layouts/
│   └── default.vue                  # NEW
└── pages/
    ├── index.vue                    # NEW — placeholder, replaced by PRO-77
    └── consulting.vue               # NEW — placeholder, replaced by PRO-78
nuxt.config.ts                       # MODIFIED — append chrome.css to css[]
```

The per-unit `**Files:**` sections remain authoritative; the tree above is the at-a-glance shape.

---

## High-Level Technical Design

**Component hierarchy at runtime**

```
NuxtLayout (resolves to layouts/default.vue)
└── default.vue
    ├── <SiteNav />          ← sticky header, scroll listener owner
    ├── <main>
    │   └── <slot />         ← NuxtPage renders here
    │       └── pages/index.vue OR pages/consulting.vue
    └── <SiteFooter />       ← static, id="contact"
```

**Route-aware href resolution (decision matrix)**

| Link        | On `/`    | On `/consulting` | aria-current target |
|-------------|-----------|------------------|---------------------|
| Experiments | `#work`   | `/#work`         | `/`                 |
| Consulting  | `/consulting` | `/consulting` | `/consulting`      |
| About       | `#about`  | `/#about`        | `/`                 |
| Contact     | `#contact`| `#contact`       | (never)             |

**Scroll-state lifecycle**

`SiteNav` mounts → `onMounted` registers `scroll` listener → user scrolls → `isScrolled.value = window.scrollY > 0` → `:class="{ 'is-scrolled': isScrolled }"` flips on the `<header>` → CSS swaps `border-bottom-color` from `transparent` to `var(--color-stone-accent)` over a 200ms transition (existing rule from prototype lines 109–117). On unmount, `onBeforeUnmount` removes the listener.

*This illustrates the intended approach and is directional guidance for review, not implementation specification.*

---

## Implementation Units

### U1. Add `app/assets/css/chrome.css` and register it in `nuxt.config.ts`

**Goal.** Establish the global chrome stylesheet so SiteNav and SiteFooter can reference unscoped class names from the moment they're authored.

**Requirements.** R11.

**Dependencies.** None (PRO-75 foundation is already on disk).

**Files.**
- Create: `app/assets/css/chrome.css`
- Modify: `nuxt.config.ts`

**Approach.**
- Port the following slices verbatim from `_process/prototype/styles.css` into `chrome.css`, preserving order and comments where they exist:
  - **Nav block** — lines 108–169 (`.nav`, `.nav.is-scrolled`, `.nav-inner`, `.wordmark`, `.wordmark .ast`, `.nav-links`, `.nav-links a`, `.nav-links a[aria-current="page"]::after`, `.nav-links a:hover::after`, the `@media (max-width: 640px)` block for `.nav-links` + `.hide-sm`).
  - **Footer block** — lines 228–273 (`.footer`, `.footer-grid`, the two `@media` breakpoints for `.footer-grid`, `.footer h4`, `.footer ul`, `.footer a`, `.footer a:hover`, `.footer-meta`, `.footer-meta .glyph`).
- **Do not** port `.btn*` rules (prototype lines 171–225). Those land with hero work in PRO-77.
- Append `'~/assets/css/chrome.css'` to the `css` array in `nuxt.config.ts` **after** `'~/assets/css/base.css'`. Order matters because `chrome.css` consumes tokens from `tokens.css` and the `.shell`, `section`, `.todo` primitives from `base.css`.

**Patterns to follow.** Mirror the slice-extraction discipline used in PRO-75's `base.css` — comment headers like `/* ---------- Nav ---------- */` and `/* ---------- Footer ---------- */` make the file scannable.

**Test scenarios.**
- Test expectation: none — pure CSS port with no behavioral change. Verification happens via the visual checks in U6 and the layout rendering test in U5.

**Verification.**
- File exists at `app/assets/css/chrome.css`.
- `nuxt.config.ts`'s `css` array has exactly three entries in order: `tokens.css`, `base.css`, `chrome.css`.
- Grep for `.btn-filled` in `chrome.css` returns zero matches (button styles deferred).

---

### U2. Create `SiteNav.vue` component

**Goal.** Sticky primary navigation with scroll-aware border, route-aware hrefs, `aria-current` on the active route, and the Oswald wordmark.

**Requirements.** R3, R4, R5, R6, R7, R8, R14.

**Dependencies.** U1 (chrome.css must exist so the component's class names render correctly).

**Files.**
- Create: `app/components/SiteNav.vue`

**Approach.**
- `<script setup>` block:
  - `const route = useRoute()`
  - `const isScrolled = ref(false)`
  - `const isConsulting = computed(() => route.path === '/consulting')`
  - `const links` computed returning the four-link config from K4 (label, href, routeMatch, hideSm). Hrefs flip based on `isConsulting.value`.
  - `onMounted`: define `handleScroll = () => { isScrolled.value = window.scrollY > 0 }`, call it once to set initial state, then `window.addEventListener('scroll', handleScroll, { passive: true })`.
  - `onBeforeUnmount`: `window.removeEventListener('scroll', handleScroll)`.
- `<template>` shape:
  - Root `<header class="nav" id="top" :class="{ 'is-scrolled': isScrolled }">`.
  - Inner `<div class="shell nav-inner">`.
  - Wordmark: `<NuxtLink to="/" class="wordmark" aria-label="Claudio Mendonça — home">` with a `<span class="ast" aria-hidden="true">✱</span>` and the text "Claudio Mendonça". Use the literal ✱ character.
  - `<nav aria-label="Primary">` containing `<ul class="nav-links">` and one `<li>` per entry in `links`. Each `<li>` renders `<a :href="link.href" :class="{ 'hide-sm': link.hideSm }" :aria-current="route.path === link.routeMatch ? 'page' : undefined">{{ link.label }}</a>`.
- No `<style>` block — styles come from `chrome.css`.

**Patterns to follow.**
- Prototype markup at `_process/prototype/index.html` lines 16–31 and `_process/prototype/consulting.html` lines 15–30 — copy structure, not content verbatim, and replace `href="index.html#..."` / `href="consulting.html"` with the route-aware computed values.
- Prototype JS at `_process/prototype/index.html` lines 209–221 — same logic, Vue-ified.

**Test scenarios.**
- **Render — home route.** Mount the layout on `/`. Assert: `<header class="nav">` exists; wordmark text contains "Claudio Mendonça"; four nav links present in order Experiments → Consulting → About → Contact; Experiments link `href` is `#work`; About link `href` is `#about`; Consulting link has `aria-current="page"` is **false** (Experiments is the active route on `/`); the Experiments anchor matches `routeMatch: '/'` and so carries `aria-current="page"`.
- **Render — consulting route.** Mount on `/consulting`. Assert: Experiments link `href` is `/#work`; About link `href` is `/#about`; Consulting link has `aria-current="page"`; Experiments link does **not** have `aria-current`.
- **Scroll listener — adds is-scrolled past 0.** With component mounted, simulate `window.scrollY = 50`, dispatch a `scroll` event, await tick, assert root header has class `is-scrolled`.
- **Scroll listener — removes is-scrolled at 0.** From scrolled state, simulate `window.scrollY = 0`, dispatch `scroll`, await tick, assert `is-scrolled` is absent.
- **Scroll listener — SSR safety.** Render the component via Nuxt's SSR pipeline (or unit test by setting `process.server = true` in a Vitest setup); assert no `window`-access errors thrown. (May be covered indirectly by U6's `pnpm build` succeeding.)
- **Scroll listener — cleanup.** Unmount the component, then dispatch a `scroll` event; assert `isScrolled` does not change (listener was removed).
- **Wordmark glyph.** Assert the rendered HTML contains the literal `✱` character (`String.fromCharCode(0x2731)`), not the entity `&#x2731;` or `&#10033;`.
- **Hide-sm class on About.** Assert the About link has `class` containing `hide-sm`. (Mobile drawer behavior is CSS-only and covered by U6 visual check.)

**Verification.**
- `pnpm dev` on `/` shows the nav, wordmark and four links visible, Experiments underlined (aria-current), scrolling the page makes the 1px bottom border appear, scrolling back to top removes it.
- `pnpm dev` on `/consulting` shows Consulting underlined; clicking About navigates to `/` and jumps to `#about`.
- `pnpm build` completes without `window is not defined` or similar SSR errors.

---

### U3. Create `SiteFooter.vue` component

**Goal.** Four-column footer with wordmark + blurb, three link lists, mailto, and the footer-meta row carrying ✱ and "Built with Motto®."

**Requirements.** R9, R10.

**Dependencies.** U1 (chrome.css owns `.footer`, `.footer-grid`, `.footer-meta`, `.footer h4`, etc.).

**Files.**
- Create: `app/components/SiteFooter.vue`

**Approach.**
- `<script setup>` is empty (no state, no lifecycle).
- `<template>` shape:
  - Root `<footer class="footer" id="contact">`.
  - Inner `<div class="shell">`.
  - `<div class="footer-grid">` with four child `<div>`s:
    1. **Brand.** `<NuxtLink to="/" class="wordmark" style="font-size: var(--text-subheading);">` containing `<span class="ast" aria-hidden="true" style="font-size: 28px;">✱</span>` + "Claudio Mendonça". Followed by `<p class="t-body ash" style="max-width: 34ch; margin-top: 24px;">AI experiments, and a small consulting practice.</p>`. (Inline styles are preserved verbatim from the prototype to avoid a churn-y "should this be a class?" detour — these are one-offs.)
    2. **Site.** `<h4>Site</h4>` + `<ul>` with three `<li><a>`s: Experiments → `/#work`, Consulting → `/consulting`, About → `/#about`. (Footer hrefs are absolute even from `/` since they round-trip to the home anchors; matches prototype `index.html` lines 175–181 which use `#work` / `#about` because they're already on `/`. For simplicity and to avoid replicating the route-aware logic in the footer, use `/#work` and `/#about` everywhere — the browser handles same-page anchor jumps correctly.)
    3. **Contact.** `<h4>Contact</h4>` + `<ul>` with three `<li><a>`s: `<a href="mailto:claudioccm@gmail.com">claudioccm@gmail.com</a>`, `<a href="#" rel="noopener">GitHub <span class="todo">TODO(claudio)</span></a>`, `<a href="#" rel="noopener">X / Twitter <span class="todo">TODO(claudio)</span></a>`.
    4. **Elsewhere.** `<h4>Elsewhere</h4>` + `<ul>` with two `<li><a target="_blank" rel="noopener">`s: ccmdesign → `https://ccmdesign.com`, Squoosh → `https://squoosh.ccmdesign.com`. Each anchor's text ends with a literal `↗` (U+2197) glyph to match the prototype.
  - `<div class="footer-meta">` with three children: `<div>© 2026 Claudio Mendonça. All rights reserved.</div>`, `<div class="glyph" aria-hidden="true">✱</div>`, `<div>Built with Motto®.</div>`.
- No `<style>` block.

**Patterns to follow.**
- Prototype markup at `_process/prototype/consulting.html` lines 255–301 is the cleaner of the two prototype footers (the `index.html` version at lines 161–207 has empty `<a>` text on lines 186 and 196 that we should **not** replicate).
- The `TODO(claudio)` literal (not just `TODO`) is required by R10. Existing prototype uses bare `TODO` inside `<span class="todo">`; PRO-76 upgrades to the namespaced form so a project-wide grep distinguishes Claudio-owned content TODOs from generic markers.

**Test scenarios.**
- **Render structure.** Mount the layout on any route. Assert: `<footer id="contact" class="footer">` exists; exactly four `<div>` children inside `.footer-grid`; first column contains the wordmark text "Claudio Mendonça"; "Site", "Contact", "Elsewhere" `<h4>`s present in that order.
- **Mailto present.** Assert at least one `<a>` has `href="mailto:claudioccm@gmail.com"` and visible text `claudioccm@gmail.com`.
- **TODO markers.** Assert the rendered HTML contains exactly two `TODO(claudio)` literals (GitHub + X / Twitter). Their parent `<a>` elements have `href="#"` (not real URLs).
- **External links rel/target.** Assert `<a href="https://ccmdesign.com">` and `<a href="https://squoosh.ccmdesign.com">` both carry `target="_blank"` and `rel="noopener"`.
- **Footer-meta row.** Assert `.footer-meta` exists with three direct children; middle child has class `glyph` and contains the literal `✱` character; third child text is exactly `Built with Motto®.`.
- **Wordmark glyph.** Assert the brand-column wordmark contains the literal `✱` character.

**Verification.**
- `pnpm dev` on either route shows the four columns on desktop, two columns at ≤ 800px, one column at ≤ 480px (these breakpoints come from prototype lines 239–243).
- `Built with Motto®.` is visible at the bottom centre/end of the meta row.
- Clicking the mailto link opens the mail client; clicking GitHub / X does nothing (href `#`).

---

### U4. Create `app/layouts/default.vue` and reduce `app/app.vue` to a layout shell

**Goal.** Wire the components together so every page goes through the default layout.

**Requirements.** R1, R2.

**Dependencies.** U2 (SiteNav), U3 (SiteFooter). Auto-imports mean we don't need explicit imports inside the layout, but the components must exist first.

**Files.**
- Create: `app/layouts/default.vue`
- Modify: `app/app.vue`

**Approach.**
- `app/layouts/default.vue`:
  - `<template>` with `<SiteNav />` then `<main><slot /></main>` then `<SiteFooter />`. No surrounding wrapper element.
  - No `<script>`, no `<style>`. Components auto-import; layout has no state.
- `app/app.vue`:
  - Replace the current placeholder content with `<NuxtLayout><NuxtPage /></NuxtLayout>`.
  - Nuxt 4 will resolve `<NuxtLayout>` to `app/layouts/default.vue` automatically because no `name` prop is passed.
- The previous demo `<main class="shell"><section>…</section></main>` content is **not** preserved. Its message ("Foundation scaffold — PRO-75") was specific to PRO-75 verification and is now obsolete. PRO-76's placeholder pages (U5) take its place as the visible body.

**Patterns to follow.** Standard Nuxt 4 layout convention — see https://nuxt.com/docs/getting-started/views#layouts. Layout files live in `app/layouts/` (Nuxt 4) rather than the Nuxt 3 default of `/layouts/`; this repo's `app/` directory structure is already set up that way (confirmed by `app/assets/css/` in PRO-75).

**Test scenarios.**
- Test expectation: none for the layout itself — pure composition with no behavior. Behavior is covered by U2 and U3 component tests and U5 page-level smoke tests.

**Verification.**
- `app/layouts/default.vue` exists.
- `app/app.vue` contains `<NuxtLayout>` and `<NuxtPage />` and no `.shell` / `.t-body` content from the PRO-75 demo.
- `pnpm dev` on `/` renders SiteNav at the top, the placeholder page body in the middle, SiteFooter at the bottom — in that visual order.

---

### U5. Add placeholder pages `app/pages/index.vue` and `app/pages/consulting.vue`

**Goal.** Make both routes resolvable so the chrome's route-aware behavior is verifiable end-to-end.

**Requirements.** R12.

**Dependencies.** U4 (layout shell must exist; Nuxt creates routes from `app/pages/` only once a `pages/` directory is present).

**Files.**
- Create: `app/pages/index.vue`
- Create: `app/pages/consulting.vue`

**Approach.**
- Each page is a minimal `<template>` with a single `<section><div class="shell"><h1>...</h1></div></section>` body — enough to confirm the layout renders, the `.shell` and `section` rules from `base.css` apply, and the nav/footer wrap correctly.
  - `index.vue`: `<h1 class="disp t-h-lg">Home — placeholder</h1>` plus a one-line caption: `<p class="t-body ash">PRO-77 will replace this with hero + experiments + about content.</p>`
  - `consulting.vue`: `<h1 class="disp t-h-lg">Consulting — placeholder</h1>` plus `<p class="t-body ash">PRO-78 will replace this with the consulting page content.</p>`
- Both pages explicitly call out their successor ticket so a future agent doesn't try to flesh them out as part of PRO-76 scope.
- No `definePageMeta`, no `useHead` — global meta from `nuxt.config.ts` (PRO-75) is sufficient for placeholder content.

**Patterns to follow.** Type utilities (`disp`, `t-h-lg`, `t-body`, `ash`) come from `base.css` (PRO-75 lines 81–93). Use them rather than inventing one-off styles.

**Test scenarios.**
- **Home route resolves.** Visit `/`, assert response status 200 (when running via `pnpm dev` or `pnpm build && pnpm preview`), assert page body contains "Home — placeholder".
- **Consulting route resolves.** Visit `/consulting`, assert 200, assert body contains "Consulting — placeholder".
- **PRO-77/78 deferral markers visible.** Assert each page body contains the corresponding "PRO-77 will replace…" / "PRO-78 will replace…" caption so anyone reading the rendered output sees the placeholder is intentional.

**Verification.**
- Both routes render in `pnpm dev` without 404.
- Chrome (nav + footer) wraps each placeholder body.
- The `aria-current="page"` underline lands on Experiments on `/` and on Consulting on `/consulting` (visual check of the 1px underline via the existing `.nav-links a[aria-current="page"]::after` rule).

---

### U6. End-to-end visual + behavior verification

**Goal.** Confirm every line of the "Done when" section maps to observable behavior on the running app.

**Requirements.** All R1–R14 in aggregate; specifically R4, R5, R13.

**Dependencies.** U1–U5.

**Files.** None (verification only — no code changes). If issues surface, fix in the originating unit and re-run.

**Approach.**
- Run `pnpm dev`. Visit `/` and `/consulting` in a browser.
- Use the `/browse` skill (or manual browser) to:
  1. Take a screenshot of `/` at scroll position 0 — confirm nav has **no** bottom border. Scroll 100px. Take a second screenshot — confirm 1px Stone Accent bottom border now visible.
  2. Repeat on `/consulting`.
  3. Inspect the DOM — confirm `aria-current="page"` is on the Experiments link on `/` and on the Consulting link on `/consulting`.
  4. Click the About link on `/consulting` — confirm browser navigates to `/` and lands at `#about` (URL ends with `/#about`).
  5. In DevTools, toggle Emulate CSS Media Feature `prefers-reduced-motion: reduce`. Click an in-page anchor — confirm the jump is instant, not smooth-scrolled. (This is gated by base.css lines 60–62, not by chrome code, but the test verifies the chrome didn't accidentally regress it.)
  6. Resize the viewport to 640px wide. Confirm the About link disappears (`.hide-sm` rule from prototype line 168).
  7. Resize to 480px. Confirm the footer grid collapses to a single column.
- Run `pnpm build` and `pnpm preview` — confirm the production build succeeds with no SSR errors mentioning `window`, `document`, or `localStorage`.

**Test scenarios.** (These map 1:1 to the ticket's "Done when" clauses.)
- **Done-when 1: Layout renders on both routes.** Verified by U5 plus visual check that nav + footer wrap each route's body.
- **Done-when 2: Nav border appears on scroll.** Verified by scroll-position screenshots above.
- **Done-when 3: prefers-reduced-motion disables smooth scroll.** Verified by DevTools media-feature emulation above.

**Verification.**
- All three Done-when checks pass observable behavior.
- A short Markdown note at `docs/solutions/PRO-76-browser-test/` (mirroring PRO-75's solution-doc pattern) captures the screenshots and the resize observations — optional, but recommended so PRO-77/78 reviewers have a baseline to compare against.

---

## Source-of-Truth Line Ranges

For the implementer, here is the canonical mapping from prototype CSS to PRO-76's `chrome.css`. All references are to `_process/prototype/styles.css` unless noted.

| Selector group                            | Source lines | Lands in                                |
|-------------------------------------------|--------------|-----------------------------------------|
| `.nav`, `.nav.is-scrolled`                | 109–117      | `chrome.css` — Nav block                |
| `.nav-inner`                              | 119–124      | `chrome.css` — Nav block                |
| `.wordmark`, `.wordmark .ast`             | 126–141      | `chrome.css` — Nav block                |
| `.nav-links`, `.nav-links a`              | 143–156      | `chrome.css` — Nav block                |
| `.nav-links a[aria-current="page"]::after`, `.nav-links a:hover::after` | 157–164 | `chrome.css` — Nav block |
| `@media (max-width: 640px) { .nav-links, .hide-sm }` | 166–169 | `chrome.css` — Nav block |
| `.footer`                                 | 228–233      | `chrome.css` — Footer block             |
| `.footer-grid` + two breakpoints          | 234–244      | `chrome.css` — Footer block             |
| `.footer h4`                              | 245–253      | `chrome.css` — Footer block             |
| `.footer ul`, `.footer a`, `.footer a:hover` | 254–256   | `chrome.css` — Footer block             |
| `.footer-meta`, `.footer-meta .glyph`     | 257–273      | `chrome.css` — Footer block             |
| `.btn*` variants                          | 171–225      | **Deferred** to PRO-77 (hero CTAs)      |

Markup source-of-truth:

- SiteNav markup pattern: `_process/prototype/index.html` lines 16–31, `_process/prototype/consulting.html` lines 15–30.
- SiteFooter markup pattern: `_process/prototype/consulting.html` lines 255–301 (preferred — `index.html`'s footer has two empty `<a>` elements at lines 186 and 196 that should **not** be replicated).
- Scroll-listener pattern: `_process/prototype/index.html` lines 209–221 (Vue-ified — see K2).

---

## System-Wide Impact

- **`app/app.vue`** changes from a self-contained demo to a `<NuxtLayout><NuxtPage /></NuxtLayout>` shell. Any page added after PRO-76 inherits the chrome by default; no page needs to import the layout.
- **`nuxt.config.ts`** gains one entry in the `css` array (`chrome.css`). Order is critical — chrome must load after `base.css` so `.shell`, `section`, and `.todo` primitives are in place.
- **Future pages** (PRO-77 home content, PRO-78 consulting content) will replace the placeholder bodies in `app/pages/index.vue` and `app/pages/consulting.vue`. They should not edit the layout, SiteNav, or SiteFooter unless the chrome itself needs to change.
- **No tokens.css changes** — every value the chrome consumes is already in PRO-75's tokens.

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Scroll listener leaks during HMR | low | low | Explicit `onBeforeUnmount` removal (K2). |
| `<NuxtLink>` intercepts hash navigation and fights `prefers-reduced-motion` | medium | low | Plain `<a>` for all four nav links (K5). |
| SSR crash from `window` reference | low | high | Confined to `onMounted`, which is client-only. `pnpm build` is the gate. |
| `aria-current` lands on the wrong link | medium | medium | `routeMatch` per link, exact-path comparison, covered by U2 test scenarios. |
| `chrome.css` selectors collide with future component styles | low | low | Class names are namespaced by visual intent (`.nav`, `.footer`, `.wordmark`) and match the prototype 1:1; future components should compose with them, not redefine them. |
| Placeholder pages get extended instead of replaced in PRO-77/78 | low | low | Explicit "PRO-77 will replace this" / "PRO-78 will replace this" captions in the page body itself. |

---

## Acceptance Checks (mapped to Done-when)

The PRO-76 ticket lists three Done-when clauses. Each maps to one or more units above:

1. **"Layout renders on both routes."** Covered by U4 (layout) + U5 (placeholder pages). Verified in U6 step 1.
2. **"Nav border appears on scroll."** Covered by U2 scroll listener implementation + the `.nav.is-scrolled` CSS rule ported in U1. Verified in U6 step 1 (screenshot diff at scroll position 0 vs. 100px) and the U2 scroll-listener test scenarios.
3. **"prefers-reduced-motion disables smooth scroll."** Covered by the existing rule in `base.css` (lines 60–62) plus the deliberate decision in K5 to use plain `<a>` so the browser respects the CSS media query. Verified in U6 step 5.

Additional implicit ticket clauses:

- **"Sticky"** — covered by `position: sticky; top: 0; z-index: 50` from prototype line 110, ported in U1.
- **"✱ Claudio Mendonça wordmark (Oswald uppercase)"** — `.wordmark` rule (prototype lines 126–141) + U2's literal-✱ assertion.
- **"Links Experiments / Consulting / About / Contact"** — exact order enforced in U2's `links` computed and asserted in U2 test scenarios.
- **"Scroll-listener adds `.is-scrolled` for 1px border"** — K2 + U2 test scenarios.
- **"Route-aware anchors: on /consulting, About/Experiments point to /#about, /#work"** — K4 decision matrix + U2 consulting-route test scenarios.
- **"`aria-current="page"` on active route"** — `aria-current` binding in U2 + U2 test scenarios for both routes.
- **"4-col grid (wordmark+blurb / Site / Contact / Elsewhere)"** — U3 four-column structure + U3 render-structure test scenario.
- **"`mailto:claudioccm@gmail.com`"** — U3 mailto test scenario.
- **"footer-meta row with ✱ glyph + 'Built with Motto®.'"** — U3 footer-meta test scenario, asserts the literal string and the ✱ glyph element.
- **"Mark GitHub / X handles as TODO(claudio)"** — R10 + U3 TODO-markers test scenario.

---

## Open Questions / Decisions for the Implementer

These are items the planner deliberately did not pin down. None block implementation.

1. **Scroll-listener throttle.** The prototype does not throttle; the listener is `{ passive: true }` and the work is a single `scrollY > 0` comparison plus a class toggle, which is cheap. If profiling on low-end devices later shows jank, `requestAnimationFrame` coalescing is the natural follow-up — leave it out for now.
2. **Inline styles in the footer brand column.** R9's brand column uses two inline `style="..."` attributes (`font-size`, `max-width`, `margin-top`) lifted verbatim from the prototype. Token-izing them is bikeshed-territory for PRO-76 — defer until PRO-77/78 if it becomes a pattern.
3. **Test runner.** The plan enumerates test scenarios but does not pick a runner. The repo currently has no test infrastructure (PRO-75 verified visually via `/browse`). If the implementer wants component-level tests, Vitest + `@vue/test-utils` is the natural fit for Nuxt; otherwise, U6's manual + `/browse`-driven verification is acceptable for this ticket given the narrow surface area. The PRO-75 ticket's solution-doc note at `docs/solutions/PRO-75-browser-test/` is the precedent.
4. **`aria-current="page"` on Experiments-via-Home.** This plan assigns `aria-current` to Experiments on `/` (matching the spirit of "active route" + the prototype's intent to highlight the work section). If product preference is "no link is active on the home page" or "the wordmark itself is the active state", flip the `routeMatch` from `/` to `null` on the Experiments entry in K4's `links` array — single-line change, no other code affected.
5. **Consulting placeholder copy.** "Consulting — placeholder" is filler. If the implementer prefers a more on-brand placeholder (e.g., the prototype's "The brief." H2 alone), feel free to substitute — the only requirement is that the page resolves and the chrome wraps it.
