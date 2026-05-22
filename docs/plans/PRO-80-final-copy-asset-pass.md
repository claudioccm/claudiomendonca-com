---
ticket: PRO-80
title: "chore: Final copy + asset pass (Claudio inputs)"
type: chore
status: active
created: 2026-05-22
branch: feature/PRO-80-final-copy-asset-pass
depth: standard
---

# PRO-80 — Final copy + asset pass (Claudio inputs)

## Summary

Resolve every `TODO(claudio):` dev-scaffold marker across the Nuxt site by promoting the
Claude Design prototype copy (`_process/prototype/index.html`, `_process/prototype/consulting.html`)
to confirmed final wording, stripping the visitor-facing marker spans, and cleanly stubbing the
handful of items the owner has explicitly deferred (social handles, three placeholder experiment
URLs, product screenshots).

This is a **copy + config finalization pass, not new features**. No new components, no new
offerings, no fabricated imagery, no behavioral changes. The site already renders the confirmed
copy verbatim alongside the markers — in most cases the only edit is deleting a marker span; the
underlying prose is unchanged.

Three categories of deferred-but-not-yet-available content (social URLs, three experiment URLs,
real screenshots) move from inline `TODO(claudio)` clutter to a single tracked residual file
(`todos/PRO-80-residual.md`) so the rendered site carries zero visitor-facing TODO text while the
open items remain visible to the owner.

---

## Problem Frame

The site was scaffolded (PRO-75 → PRO-79) with `TODO(claudio):` markers placed next to copy that
needed the owner's sign-off, plus a few genuinely-pending content items (social handles, real
product URLs, screenshots). Those markers render as visible monospace pills (`.todo` class) in the
shipped HTML — acceptable during scaffolding, not acceptable for a production site at
`https://claudiomendonca.com`.

The owner has now made every outstanding decision (see Authoritative Decisions below). This pass
bakes those decisions in: confirmed copy loses its marker and stays; the consulting "should we add
more offerings?" caption is deleted (decision = keep 3); social/URL/screenshot stubs become clean
and move to a tracked residual file. The site also still lacks a canonical URL / SEO base config,
which this pass adds since it is the natural "finalization" home for it.

### Authoritative Decisions (pre-collected from owner — do not re-ask)

1. **Prototype is source of truth.** Where a `TODO(claudio)` marker sits next to prototype copy,
   the adjacent copy is CONFIRMED. Remove the marker, keep the wording.
2. **Canonical URL = `https://claudiomendonca.com`** for any canonical / og / site base config.
3. **Social handles (GitHub, X/Twitter) not yet available** → keep as clean stubs (no
   visitor-facing "TODO(claudio)" text), single residual todo. Owner supplies later.
4. **Consulting offerings = keep current 3** (Agent Architecture, AI Automation, AI Training). Do
   NOT add AI Strategy / Custom Product Dev / Prototype Sprints. Remove the "decide whether to
   add..." caption — decision is "no, keep 3 for v1."

### Verified current state (orchestrator + planning research)

- **Copy already matches the prototype verbatim.** The hero-sub, positioning paragraph, offerings,
  and HowItWorks caption in the Nuxt components are byte-for-byte the prototype copy. The only
  drift from "final" is the presence of the marker spans. No prose rewrites are needed — this is a
  marker-strip pass, not a copy-edit pass.
- **`.faint` is NOT dead after the pass.** `--color-faint-gray` (`app/assets/css/tokens.css:12`)
  is consumed by both `.todo` (`base.css:126-138`) AND `.faint` (`base.css:105`). `.faint` stays
  in use on the HowItWorks trailing caption after the marker is stripped, so the token stays live.
  Only the `.todo` **class** becomes a removal candidate.
- **`.todo` class consumers after strip = zero.** Real consumers today are the 4 marker spans
  being removed (HowItWorks.vue:49, SiteFooter.vue:36-37, consulting.vue:31/54/84). The
  `chrome.css:149` mention of `.todo` is prose inside a comment, not a selector, and the
  `nuxt.config.ts` css-ordering comment also only references it in prose. After the strip the
  `.todo` rule has no template consumer → safe to delete.
- **Screenshots:** `public/screenshots/squoosh.jpg` and `varro.jpg` are byte-identical
  (MD5 `28459df8…`). `cutthecrap.jpg` and `edge.jpg` are distinct. The prototype itself uses empty
  `<image-slot>` placeholders — there is no real imagery to adopt. Real screenshots are NOT
  available → residual todo. Optional: make the duplicated placeholders visually distinct, but
  must NOT fabricate product imagery.
- **Experiment URLs:** even the prototype only has a real URL for Squoosh
  (`https://squoosh.ccmdesign.com`, already set in `experiments.ts:53`). Cut The Crap, Edge, Varro
  are `#` placeholders in the prototype too → stay stubbed with a residual todo.
- **No SEO base config exists.** `nuxt.config.ts app.head` sets `lang`, `title`, `description`
  only — no canonical link, no og tags, no site URL. Sitemap module is not installed (not in
  scope to add; canonical via head config is sufficient).

---

## Scope Boundaries

### In scope

- Strip the 4 visitor-facing `TODO(claudio)` marker spans (HowItWorks, SiteFooter ×2, consulting ×3).
- Keep the confirmed prototype copy that sat next to those markers.
- Delete the consulting "decide whether to add offerings" caption entirely (decision = keep 3).
- Reduce the HowItWorks trailing caption to its confirmed sentence ("Pricing intentionally not
  shown on the page."), dropping the "Confirm engagement model." dev instruction along with the marker.
- Clean social-handle stubs in SiteFooter (no visitor TODO text; `href` stub kept).
- Confirm Squoosh real URL is set; leave Cut The Crap / Edge / Varro as clean `#` stubs.
- Rewrite the `experiments.ts` header comment so it no longer carries `TODO(claudio)` strings
  inline; point to the residual file instead. Keep the inline `// real URL` code comments OR
  consolidate them — see U4.
- Add canonical / site-base SEO config for `https://claudiomendonca.com`.
- Optionally make the two byte-identical placeholder screenshots visually distinct (no fabrication).
- Create `todos/PRO-80-residual.md` capturing the deferred items (socials, 3 URLs, screenshots).
- Remove the now-dead `.todo` CSS rule (`base.css:126-138`) IF verified unreferenced; keep
  `--color-faint-gray` and `.faint`.

### Out of scope (non-goals)

- New components, new offerings, new pages, or any layout change.
- Real social handles, real experiment URLs, real screenshots (none are available — they are
  tracked, not invented).
- Installing a sitemap module or building a sitemap.xml (canonical via head config is sufficient
  for this pass; the prerender list in `nuxt.config.ts` already enumerates both routes).
- og:image asset creation.
- Touching the `.faint` class or `--color-faint-gray` token (both stay in use).
- Editing prototype source files under `_process/`.

### Deferred to Follow-Up Work

- Owner-supplied GitHub + X/Twitter URLs → swap stubs when available (tracked in
  `todos/PRO-80-residual.md`).
- Real product URLs for Cut The Crap, Edge, Varro (tracked).
- Real product screenshots for the experiments grid (tracked; supersedes the existing
  `todos/PRO-77-review-residual.md` note about the duplicate bitmap).
- `og:image` / social-card artwork.
- Deriving the "Offerings — 03" count from array length (already an existing open item from
  PRO-78 U6 — untouched here).

---

## High-Level Technical Design

This illustrates the intended approach and is directional guidance for review, not implementation
specification. The implementing agent should treat it as context, not code to reproduce.

```
Each TODO(claudio) marker is one of three dispositions:

  marker + confirmed copy adjacent     →  DELETE marker span, KEEP copy
      (HowItWorks caption, consulting hero-sub, consulting positioning)

  marker on a "should we add X?" caption →  DELETE entire caption block
      (consulting offerings caption — decision = keep 3)

  marker on a genuinely-pending stub     →  CLEAN the stub (no visitor TODO text),
      (footer socials, 3 experiment URLs,    record ONE residual todo entry
       screenshots)                          in todos/PRO-80-residual.md

Config addition (orthogonal):
  nuxt.config app.head  →  add canonical link + og:url base for claudiomendonca.com

Dead-code sweep (last, after strips land):
  grep .todo  →  if zero template consumers, delete base.css .todo rule
  (--color-faint-gray + .faint stay — still used by HowItWorks caption)

Verification gate (final):
  pnpm lint && pnpm typecheck && pnpm generate  →  green
  grep "TODO(claudio)" in .output/public         →  zero visitor-facing hits
```

---

## Marker Inventory (the unit of work)

Each row: file:line · disposition · confirmed copy to keep · exact marker text to remove.
All copy below is verified identical between the Nuxt source and the prototype.

| # | File:line | Disposition | Keep | Remove |
|---|-----------|-------------|------|--------|
| M1 | `app/components/HowItWorks.vue:48-51` | Trim caption | `Pricing intentionally not shown on the page.` | `<span class="todo">TODO(claudio):</span>` span **and** the leading `Confirm engagement model.` dev-instruction sentence |
| M2 | `app/components/SiteFooter.vue:36` | Clean stub | `GitHub` link, `href="#"` stub | `<span class="todo">TODO(claudio)</span>` |
| M3 | `app/components/SiteFooter.vue:37` | Clean stub | `X / Twitter` link, `href="#"` stub | `<span class="todo">TODO(claudio)</span>` |
| M4 | `app/pages/consulting.vue:31` | Delete marker | hero-sub copy (lines 29-30) unchanged | `<span class="todo">TODO(claudio): confirm hero line</span>` |
| M5 | `app/pages/consulting.vue:54` | Delete marker | positioning copy (lines 51-53) unchanged | `<span class="todo">TODO(claudio): confirm positioning</span>` |
| M6 | `app/pages/consulting.vue:83-88` | Delete whole caption | nothing (caption removed) | entire `<p class="t-caption faint section-trail">…</p>` block incl. marker + "decide whether to add…" text |
| M7 | `app/data/experiments.ts:9-14` | Rewrite comment | a clean explanatory comment | the two `` `TODO(claudio)` `` strings in the header comment |
| M8 | `app/data/experiments.ts:35,44,63` | Clean stub | `url: '#'` for cutthecrap/edge/varro | the `// TODO(claudio): real URL` inline comments (consolidate per U4) |

Note on M1: the prototype caption reads `TODO(claudio): Confirm engagement model. Pricing
intentionally not shown on the page.` The marker and the "Confirm engagement model." clause are
both dev-scaffold instruction (an ask to the owner, now answered per Decision 1). "Pricing
intentionally not shown on the page." is genuine visitor-facing copy and stays. Result caption:
`Pricing intentionally not shown on the page.`

---

## Key Technical Decisions

- **K1 — Marker strip is the dominant edit; no prose rewrite.** Research confirmed the Nuxt copy is
  byte-identical to the prototype. Treating this as a copy-edit pass would risk introducing drift;
  it is a marker-strip pass. Only M1 (caption trim) and M6 (caption delete) change rendered text;
  M4/M5 leave the prose untouched and only remove an inline span.

- **K2 — Social handles stay as `href="#"` stubs, not removed.** Removing the `<li>` rows would
  change the footer layout and lose the owner's intended structure. A `#` href with clean visible
  text ("GitHub", "X / Twitter") preserves the layout and is a no-op link until real URLs land.
  No `aria-disabled` / visual "coming soon" treatment — keep it invisible-pending per Decision 3
  (clean stub, no visitor-facing pending text). Tracked in residual file.

- **K3 — Canonical via `nuxt.config.ts app.head`, not a new module.** The site is a 2-route static
  generate. A full `@nuxtjs/sitemap` install is unjustified surface for this finalization pass.
  Add a `link: [{ rel: 'canonical', href: 'https://claudiomendonca.com' + route }]` is **not**
  trivially route-aware in static `app.head` — so the pragmatic choice is a site-wide canonical/
  og:url base set in `app.head` (homepage canonical) plus a per-page `useHead`/`useSeoMeta`
  canonical on `consulting.vue` if per-route canonical is desired. Implementer picks the minimal
  approach that yields a correct canonical on both routes (see U3 for the decision the implementer
  must make at code time). Base URL constant = `https://claudiomendonca.com`.

- **K4 — `.todo` CSS rule removed; `--color-faint-gray` + `.faint` retained.** Verified: `.faint`
  is still consumed by the HowItWorks caption after the strip, so the token must stay. The `.todo`
  rule has no template consumer post-strip → delete it to avoid dead scaffold CSS. This is gated on
  a re-grep at implementation time (U6) — if any consumer remains, leave the rule.

- **K5 — Single residual file, supersedes scattered inline TODOs.** `todos/PRO-80-residual.md`
  follows the existing `todos/PRO-NN-…residual.md` convention. It is the single home for the three
  deferred categories (socials, 3 URLs, screenshots) so the codebase carries no
  visitor-facing `TODO(claudio)` and only a minimal, tracked set of code comments.

- **K6 — Placeholder screenshot de-duplication is optional and non-fabricating.** If done, make
  `varro.jpg` visually distinct from `squoosh.jpg` (e.g., a labelled/tinted placeholder) so they
  are not confusingly identical — but do NOT generate or imply real product UI. Skipping this is
  acceptable; the duplicate is tracked in the residual file either way.

---

## Implementation Units

### U1. Strip consulting page markers (M4, M5, M6)

**Goal:** Remove the three `TODO(claudio)` spans on `app/pages/consulting.vue`: confirm hero line
(M4), confirm positioning (M5), and delete the entire "decide whether to add offerings" caption (M6).

**Requirements:** Decisions 1 & 4. Marker inventory M4, M5, M6.

**Dependencies:** none.

**Files:**
- `app/pages/consulting.vue` (modify)

**Approach:**
- M4: delete the `<span class="todo">TODO(claudio): confirm hero line</span>` (line 31). Leave the
  `#sub` slot prose (lines 29-30) exactly as-is.
- M5: delete the `<span class="todo">TODO(claudio): confirm positioning</span>` (line 54). Leave the
  positioning paragraph (lines 51-53) exactly as-is.
- M6: delete the entire trailing `<p class="t-caption faint section-trail">…</p>` block (lines
  83-88), including the marker and the "Decide whether to add…" text. The offerings list and its
  `<section>` wrapper stay. Confirm no other element depends on that `<p>` for spacing (it is the
  last child of `.shell` before `</section>`; the `section` padding handles bottom spacing).
- After M6, the `consulting.vue` template no longer references `.faint` — that is fine; `.faint`
  remains used by HowItWorks (verified).

**Patterns to follow:** none — pure deletion preserving surrounding markup.

**Test scenarios:** Test expectation: none — copy/markup-only change, no behavioral logic. Coverage
is the build/grep verification in U7.

**Verification:** `consulting.vue` contains zero `TODO(claudio)` and zero `class="todo"`; the
offerings `<ol>` still renders 3 entries; the page still type-checks and the route still prerenders.

---

### U2. Strip footer + HowItWorks markers (M1, M2, M3)

**Goal:** Clean the two social-link stubs in `app/components/SiteFooter.vue` (M2, M3) and trim the
HowItWorks trailing caption (M1).

**Requirements:** Decisions 1 & 3. Marker inventory M1, M2, M3.

**Dependencies:** none.

**Files:**
- `app/components/SiteFooter.vue` (modify)
- `app/components/HowItWorks.vue` (modify)

**Approach:**
- M2/M3 (`SiteFooter.vue:36-37`): remove the trailing `<span class="todo">TODO(claudio)</span>`
  from each social `<li>`. Keep the `<a href="#" rel="noopener">GitHub</a>` and
  `<a href="#" rel="noopener">X / Twitter</a>` exactly (clean stub, `#` href retained per K2). Do
  not add "coming soon" text or `aria-disabled`.
- M1 (`HowItWorks.vue:48-51`): reduce the trailing caption to its confirmed sentence. Remove the
  `<span class="todo">TODO(claudio):</span>` AND the leading "Confirm engagement model." sentence.
  Resulting paragraph text: `Pricing intentionally not shown on the page.` Keep the
  `<p class="t-caption faint section-trail">` wrapper (this is what keeps `.faint` live).

**Patterns to follow:** existing `Elsewhere` footer links (`SiteFooter.vue:45-46`) show the clean
external-link shape; the social stubs mirror the same `<a>` structure minus `target="_blank"`.

**Test scenarios:** Test expectation: none — copy/markup-only change. Verified via U7 build + grep.

**Verification:** `SiteFooter.vue` and `HowItWorks.vue` contain zero `TODO(claudio)` and zero
`class="todo"`; the footer still renders 4 columns with GitHub + X/Twitter rows present; the
HowItWorks caption renders `Pricing intentionally not shown on the page.`

---

### U3. Add canonical / SEO base config for claudiomendonca.com

**Goal:** Configure the canonical URL (`https://claudiomendonca.com`) so both routes emit a correct
canonical link in the prerendered HTML.

**Requirements:** Decision 2.

**Dependencies:** none.

**Files:**
- `nuxt.config.ts` (modify)
- `app/pages/index.vue` (possibly modify — only if per-route canonical chosen)
- `app/pages/consulting.vue` (possibly modify — only if per-route canonical chosen; coordinate with U1)

**Approach:**
- Define the site base URL once: `https://claudiomendonca.com`.
- Implementer chooses the minimal correct mechanism (decision deferred to code time, K3):
  - **Option A (simplest):** site-wide `app.head.link` canonical pointing at the homepage, plus a
    per-page `useSeoMeta({ ogUrl })` / `useHead({ link: [{ rel: 'canonical', href }] })` override on
    `consulting.vue` so `/consulting` gets its own canonical. Recommended.
  - **Option B:** add a small composable / runtime config base and set per-route canonical in each
    page via `useHead`.
- Add `og:url` (and reuse existing title/description for `og:title`/`og:description`) at the same
  time since it shares the base URL — keep it minimal, no `og:image` (out of scope).
- Do NOT install a sitemap module. The existing `nitro.prerender.routes` list already enumerates
  `/` and `/consulting`.

**Patterns to follow:** existing `app.head` block in `nuxt.config.ts` (meta array shape). If using
`useSeoMeta`, follow standard Nuxt SEO composable usage (auto-imported).

**Test scenarios:**
- After `pnpm generate`, `.output/public/index.html` contains
  `<link rel="canonical" href="https://claudiomendonca.com/">` (or the chosen homepage form).
- `.output/public/consulting/index.html` contains a canonical resolving to
  `https://claudiomendonca.com/consulting`.
- `og:url` present on both pages and points at the correct absolute URL.

**Verification:** grep the two generated HTML files for `rel="canonical"` and confirm the absolute
`claudiomendonca.com` host on both routes; `pnpm typecheck` green (composable usage type-checks).

---

### U4. Clean experiments.ts header comment + URL stub comments (M7, M8)

**Goal:** Remove the inline `TODO(claudio)` strings from `app/data/experiments.ts` while keeping
the three `#` URL stubs and the duplicate-screenshot reality documented — pointing to the residual
file as the tracked home.

**Requirements:** Decisions 1 & 3; supersedes the stale `experiments.ts` header note.

**Dependencies:** U5 (residual file must exist to reference it) — or write both in the same change.

**Files:**
- `app/data/experiments.ts` (modify)

**Approach:**
- M7 (header comment, lines 9-14): rewrite so it no longer contains the literal `` `TODO(claudio)` ``
  strings. Replace with a plain-English note: real URLs and real screenshots for Cut The Crap, Edge,
  and Varro are pending and tracked in `todos/PRO-80-residual.md`; squoosh.jpg and varro.jpg are
  currently the same placeholder bitmap. Keep it factual, no marker syntax.
- M8 (lines 35, 44, 63): the `// TODO(claudio): real URL` comments. Two acceptable resolutions —
  implementer picks one:
  - **Preferred:** replace each with a neutral `// stub — real URL pending (see todos/PRO-80-residual.md)`.
  - Or: drop them entirely and rely on the header comment + residual file.
  Either way, no `TODO(claudio)` token remains. The `url: '#'` values stay.
- Confirm `squoosh` entry already has `url: 'https://squoosh.ccmdesign.com'` (it does, line 53) — no
  change needed; just verify.

**Patterns to follow:** existing comment style in the file header.

**Test scenarios:** Test expectation: none — comments + data, no behavioral change. The `experiments`
array shape and values (except comment text) are unchanged; the home grid still iterates 4 entries.

**Verification:** `experiments.ts` contains zero `TODO(claudio)` strings; `pnpm typecheck` green;
home page still renders 4 cards with squoosh linking to the real URL and the other three to `#`.

---

### U5. Create todos/PRO-80-residual.md (deferred-items tracker)

**Goal:** Single tracked home for the owner-deferred items so the codebase carries no visitor-facing
TODO and the open items stay visible.

**Requirements:** Decisions 3; K5. Captures the three deferred categories.

**Dependencies:** none (referenced by U4).

**Files:**
- `todos/PRO-80-residual.md` (create)

**Approach:**
- Follow the existing `todos/PRO-NN-…residual.md` structure (see `todos/PRO-77-review-residual.md`,
  `todos/PRO-78-review-residual.md`): header with ticket/branch/date, then per-item sections with
  file references, owner, and resolution status.
- Items to record:
  1. **Social handles** — GitHub + X/Twitter URLs pending. Files: `app/components/SiteFooter.vue`
     (the two `href="#"` stubs). Owner supplies real URLs.
  2. **Experiment URLs** — Cut The Crap, Edge, Varro real URLs pending. File:
     `app/data/experiments.ts` (3 `url: '#'` stubs). Squoosh already live.
  3. **Product screenshots** — real imagery pending; `squoosh.jpg`/`varro.jpg` currently identical
     placeholder bitmaps. Files: `public/screenshots/*.jpg`. Note this supersedes the
     `todos/PRO-77-review-residual.md` duplicate-bitmap note.
- State explicitly that these are owner-deferred (not in scope to invent) and that no
  visitor-facing TODO text remains in the rendered site.

**Patterns to follow:** `todos/PRO-77-review-residual.md` and `todos/PRO-78-review-residual.md` format.

**Test scenarios:** Test expectation: none — documentation file.

**Verification:** file exists, references all three deferred categories with correct file paths,
follows the existing residual-file format.

---

### U6. Remove dead `.todo` CSS rule (gated)

**Goal:** Delete the now-unreferenced `.todo` scaffold rule, keeping `--color-faint-gray` and
`.faint` (both still in use).

**Requirements:** K4. Dead-code cleanup.

**Dependencies:** U1, U2 (the template consumers must be removed first).

**Files:**
- `app/assets/css/base.css` (modify — remove the `.todo` rule, lines ~125-138)
- `nuxt.config.ts` (modify — only the css-ordering prose comment that mentions `.todo`, lines
  ~28-31, to avoid a stale reference; the css array itself is unchanged)
- `app/assets/css/chrome.css` (verify only — the `.todo` mention there is incidental prose in a
  PRO-79 contrast comment; leave it or lightly correct, no functional change)

**Approach:**
- **Gate first:** after U1+U2 land, run `grep -rn 'class="todo"\|\.todo\b' app/` (templates) — must
  return zero template/selector consumers. If any remain, do NOT delete; report and stop.
- If clear: remove the `/* ---------- TODO marker ---------- */ .todo { … }` block in `base.css`.
- Keep `.faint` (`base.css:105`) and `--color-faint-gray` (`tokens.css:12`) — both still consumed by
  the HowItWorks caption.
- Update the `nuxt.config.ts` css-ordering comment that says chrome.css "consumes the .shell,
  section, and .todo primitives" so it no longer claims a `.todo` primitive exists.

**Patterns to follow:** none — scoped deletion.

**Test scenarios:** Test expectation: none — CSS removal of an unused rule, no behavioral change.
Visual check: no element loses styling (nothing references `.todo` anymore).

**Verification:** `grep .todo` across `app/` returns only incidental comment text (or nothing);
`pnpm generate` succeeds; the rendered pages look identical to pre-change minus the marker pills;
`.faint` text (HowItWorks caption) still renders in the faint-gray color.

---

### U7. Verification sweep (lint, typecheck, generate, zero-marker grep)

**Goal:** Prove the pass is complete and the build stays green.

**Requirements:** All. Final gate.

**Dependencies:** U1–U6.

**Files:** none (verification only).

**Approach / commands (outcomes, not a script):**
- `pnpm lint` → no new errors.
- `pnpm typecheck` → green (catches any `useHead`/`useSeoMeta` misuse from U3).
- `pnpm generate` → succeeds; both routes prerender.
- **Zero visitor-facing marker grep:** confirm `TODO(claudio)` appears ZERO times in the generated
  output (`.output/public/**/*.html`) and zero times in `app/` source **except** allowed locations.
  After this pass the only allowed `TODO(claudio)` occurrences are: none in `app/` source at all
  (markers stripped, comments rewritten); the string may legitimately appear only in
  `docs/plans/` and `todos/` markdown (this plan + prior plans), which are not shipped.
  - Practical check: `grep -rn "TODO(claudio)" app/ nuxt.config.ts` → expect **zero** hits.
  - `grep -rn "TODO(claudio)" .output/public` → expect **zero** hits.
- Canonical check (from U3): `grep -rn 'rel="canonical"' .output/public` → present on both routes
  with the `claudiomendonca.com` host.

**Test scenarios:**
- Lint passes with no new violations.
- Typecheck passes.
- Generate completes and emits `.output/public/index.html` + `.output/public/consulting/index.html`.
- Zero `TODO(claudio)` in generated HTML.
- Zero `TODO(claudio)` in `app/` + `nuxt.config.ts`.
- Canonical link present and correct on both routes.

**Verification:** all five checks above pass. This unit is the definition of done.

---

## System-Wide Impact

- **Rendered HTML:** marker pills disappear from `/` (footer) and `/consulting` (hero, positioning,
  offerings caption, how-it-works caption). The offerings caption block is fully gone; the
  how-it-works caption shrinks to one sentence. No layout reflow expected beyond the removed caption.
- **SEO:** new canonical (+ og:url) on both routes — net positive, no regression risk since none
  existed before.
- **CSS:** one dead rule removed; no token or in-use class touched.
- **No runtime/JS behavior changes**, no new dependencies, no route changes.

---

## Verification Strategy

Done = U7 passes in full:
1. `pnpm lint` green.
2. `pnpm typecheck` green.
3. `pnpm generate` succeeds, both routes prerendered.
4. `grep "TODO(claudio)" app/ nuxt.config.ts` → zero.
5. `grep "TODO(claudio)" .output/public` → zero.
6. Canonical present + correct (`claudiomendonca.com`) on `/` and `/consulting`.
7. Footer still shows GitHub + X/Twitter rows (clean stubs); consulting shows 3 offerings; bodies
   of confirmed copy unchanged.
8. `todos/PRO-80-residual.md` exists and tracks socials + 3 URLs + screenshots.

---

## Open Questions / Decisions Left to Implementer

Very few — by design most decisions are pre-made:

- **OQ1 (U3, K3):** exact canonical mechanism — site-wide `app.head` homepage canonical + per-page
  `useSeoMeta` override on consulting (recommended Option A), vs a runtime-config base. Either is
  fine as long as both routes emit a correct absolute canonical. Implementer picks at code time.
- **OQ2 (U4, M8):** whether to replace the three `// TODO(claudio): real URL` inline comments with a
  neutral stub comment (preferred) or drop them entirely. Either satisfies the zero-marker rule.
- **OQ3 (U6, K6 / optional):** whether to also de-duplicate the byte-identical `squoosh.jpg` /
  `varro.jpg` placeholder so they are visually distinct. Optional, must not fabricate real product
  imagery. Skipping is acceptable (tracked in residual file regardless).
