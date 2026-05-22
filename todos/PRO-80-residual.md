# PRO-80 — Residual deferred items (owner-supplied content)

Plan: `docs/plans/PRO-80-final-copy-asset-pass.md`
Branch: `feature/PRO-80-final-copy-asset-pass`
Date: 2026-05-22

PRO-80 promoted the Claude Design prototype copy to confirmed final wording and
stripped every visitor-facing `TODO(claudio)` marker from the rendered site. The
categories below are genuinely-pending content the owner has explicitly
deferred — they are NOT to be invented. They are tracked here so the codebase
carries zero visitor-facing TODO text while the open items stay visible.

Update 2026-05-22: experiment URLs (#2) RESOLVED — owner supplied real URLs and a
new 5th experiment (Feedback). Remaining open: social handles (#1) and product
screenshots (#3).

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

## 2. [RESOLVED 2026-05-22] Experiment URLs (all entries)

**Files / lines.**
- `app/data/experiments.ts` — `url` field on every entry.

**Resolution.** Owner supplied the real product URLs; all entries now link live:
- Cut The Crap → `https://cutthecrap.claudiomendonca.com`
- Edge → `https://edge.ccmdesign.ca`
- Squoosh → `https://squoosh.ccmdesign.com` (already live)
- Varro → `https://varro.me`
- Feedback (new 5th entry) → `https://feedback.ccmdesign.ca`

No `url: '#'` stubs remain.

---

## 3. [DEFERRED] Product screenshots

**Files / lines.**
- `public/screenshots/*.jpg` — `squoosh.jpg`, `varro.jpg`, and `feedback.jpg`
  are currently byte-identical placeholder bitmaps (`feedback.jpg` was copied
  from `varro.jpg` when the 5th entry was added). `cutthecrap.jpg` / `edge.jpg`
  are also placeholders. The prototype itself uses empty `<image-slot>`
  placeholders, so there is no real imagery to adopt.

**Status.** Real product screenshots not yet available for ANY of the five
entries (Cut The Crap, Edge, Squoosh, Varro, Feedback). This supersedes the
duplicate-bitmap note in `todos/PRO-77-review-residual.md` (P2, "won't fix in
this ticket") as the single tracked home for the issue.

**Owner.** Claudio — supplies real product screenshots for all five experiments
(must not fabricate product UI).

**Resolution.** Replace the placeholder bitmaps under `public/screenshots/`
with real product screenshots. No `experiments.ts` edit needed unless filenames
change.

---

## Out of scope (not tracked here, noted for clarity)

- `og:image` / social-card artwork — not created in PRO-80 (canonical + og base
  config only).
- Deriving the consulting "Offerings — 03" count from array length — pre-existing
  open item from PRO-78 U6, untouched here.
