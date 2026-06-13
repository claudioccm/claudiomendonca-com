# PRO-114 — QA results (6/6 of the dark redesign epic)

Verification cycle. Branch `feature/PRO-114-qa-a11y-perf-preview` off `dev`.

## Console — PASS

Home (`/`) and `/consulting` both load **error- and warning-free** in
chrome-devtools (dev server, port 3100).

## Responsive screenshots — captured (8)

`docs/qa/screenshots/` — home + /consulting at 375 / 768 / 1280 / 1440 (full
page). Plus two reduced-motion captures (`*-reduced-motion.png`).

Note: home full-page screenshots are taken after programmatically scrolling so
the scroll-reveal (`useScrollReveal`) has fired — otherwise the experiment grid
captures in its `opacity:0` pre-reveal start state (verified to be reveal-state,
not missing content: all 5 cards exist in the DOM with full text).

## Lighthouse — PASS (a11y target ≥95 exceeded)

Desktop, navigation mode.

| Page        | a11y | Perf | Best-practices | SEO |
|-------------|------|------|----------------|-----|
| Home        | 100  | 73   | 100            | 100 |
| /consulting | 100  | 100  | 100            | 100 |

- a11y/BP/SEO via chrome-devtools `lighthouse_audit`.
- Perf via `npx lighthouse --preset=desktop` against the **production build**
  (`.output/public` served on :4180).

### Perf detail — the WebGL trade (reported, not hidden)

| Metric | Home | /consulting |
|--------|------|-------------|
| FCP    | 0.6s | 0.5s |
| LCP    | 0.8s | 0.6s |
| TBT    | **750ms** | 0ms |
| CLS    | 0.001 | 0.001 |
| SI     | 1.0s | 0.5s |

The home perf number (73) is driven by **Total Blocking Time (750ms)** — the
WebGL hero (`HeroScene`) plus the GSAP/Lenis smooth-scroll JS. `/consulting`
has no WebGL hero and scores a clean 100 with 0ms TBT. This is the explicit
WebGL ↔ perf trade the ticket calls out: paint metrics are excellent (FCP/LCP
< 1s, CLS ~0), the cost is main-thread blocking from the 3D scene init. No
layout shift, no slow paint — the number reflects JS execution, not a broken
page.

## a11y fix applied — heading order (cheap win)

Both pages failed only `heading-order` (a11y 98 each). Fixed by making heading
levels sequential — no visual change (tag-only swaps, with the matching
tag-scoped CSS selectors updated so styling is preserved):

- `ExperimentCard` title `h3 → h2` (cards sit directly under the hero `h1`; now
  siblings of the About `h2`). CSS `.experiment-caption h3 → h2`.
- `HowItWorks` step `h4 → h3` (steps sit under the "How it works" `h2`).
  CSS `.step h4 → h3`.
- `SiteFooter` column heads `h4 → h2` (×3). CSS `.footer h4 → h2`.
- `ExperimentCard.spec.ts` harness mock + assertion updated `h3 → h2`.

After: both pages a11y **100**, 0 failed audits. Final heading trees verified in
the live DOM **and** in the generated static HTML.

## Reduced-motion — PASS

Emulated `prefers-reduced-motion: reduce` (matchMedia override init script):

- **No WebGL canvas** on either page (HeroScene bails).
- Experiment cards render at `opacity:1` immediately (no hidden reveal state).
- StatCounter shows the final **95%** statically (no count-up).
- Kinetic hero headline renders a static word; marquee present, static.
- All copy intact on both pages.

## No-JS — PASS

`pnpm generate` → 12 routes prerendered. Greps over `.output/public/index.html`
and `.output/public/consulting/index.html`:

- Home: hero eyebrow/headline words + sub copy; all 5 experiment titles
  (Cut The Crap, Edge, BATCH SQUOOSH, Varro, Feedback); About copy; nav +
  footer links (Experiments/Consulting/About/Contact, /consulting, /#work,
  /#about, ccmdesign, Batch Squoosh, Built with Claude). **All present.**
- Consulting: hero headline + sub; 3 offerings (Opportunity Audit, Automate the
  repetitive, Empower your team); the **95%** stat + MIT citation; CTA mailto;
  "How it works"; "Got something to build". **All present.**
- `.output/public/_redirects` exists and contains `/about  /#about  301`.
