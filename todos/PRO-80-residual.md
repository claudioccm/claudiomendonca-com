# PRO-80 — Residual deferred items (owner-supplied content)

Plan: `docs/plans/PRO-80-final-copy-asset-pass.md`
Branch: `feature/PRO-80-final-copy-asset-pass`
Date: 2026-05-22

PRO-80 promoted the Claude Design prototype copy to confirmed final wording and
stripped every visitor-facing `TODO(claudio)` marker from the rendered site. The
three categories below are genuinely-pending content the owner has explicitly
deferred — they are NOT to be invented. They are tracked here so the codebase
carries zero visitor-facing TODO text while the open items stay visible.

The site now renders no `TODO(claudio)` text in any route. The stubs below are
clean (no "coming soon" / pending labels) and swap to real values when the owner
supplies them.

---

## 1. [DEFERRED] Social handles (GitHub, X / Twitter)

**Files / lines.**
- `app/components/SiteFooter.vue` — the two Contact-column rows
  (`<a href="#" rel="noopener">GitHub</a>` and
  `<a href="#" rel="noopener">X / Twitter</a>`).

**Status.** Real URLs not yet available. The links are clean `href="#"` stubs:
visible text only, no visitor-facing TODO marker, no `aria-disabled` or pending
treatment (kept invisible-pending per the plan's K2 / Decision 3). Layout is
preserved so swapping in real URLs is a one-line edit per row.

**Owner.** Claudio — supplies real GitHub + X/Twitter profile URLs.

**Resolution.** Replace each `href="#"` with the real profile URL (add
`target="_blank"` if opening in a new tab, mirroring the Elsewhere column).

---

## 2. [DEFERRED] Experiment URLs (Cut The Crap, Edge, Varro)

**Files / lines.**
- `app/data/experiments.ts` — three `url: '#'` stubs for `cutthecrap`,
  `edge`, and `varro`.

**Status.** Real product URLs not yet available — even the Claude Design
prototype only carried a real URL for Squoosh. Squoosh already links to its
live URL (`https://squoosh.ccmdesign.com`). The other three stay as `#` stubs
with a neutral inline comment pointing here.

**Owner.** Claudio — supplies real product URLs for Cut The Crap, Edge, Varro.

**Resolution.** Replace each `url: '#'` with the real product URL.

---

## 3. [DEFERRED] Product screenshots

**Files / lines.**
- `public/screenshots/*.jpg` — notably `squoosh.jpg` and `varro.jpg`, which are
  currently byte-identical placeholder bitmaps. The prototype itself uses empty
  `<image-slot>` placeholders, so there is no real imagery to adopt.

**Status.** Real product screenshots not yet available. The duplicate
`squoosh.jpg` / `varro.jpg` placeholder is intentional-but-temporary. This
supersedes the duplicate-bitmap note in `todos/PRO-77-review-residual.md`
(P2, "won't fix in this ticket") as the single tracked home for the issue.

**Owner.** Claudio — supplies real product screenshots (and, if desired, a
distinct placeholder for Varro until then; must not fabricate product UI).

**Resolution.** Replace the placeholder bitmaps under `public/screenshots/`
with real product screenshots. No `experiments.ts` edit needed unless filenames
change.

---

## Out of scope (not tracked here, noted for clarity)

- `og:image` / social-card artwork — not created in PRO-80 (canonical + og base
  config only).
- Deriving the consulting "Offerings — 03" count from array length — pre-existing
  open item from PRO-78 U6, untouched here.
