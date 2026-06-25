# content.json

A single source of truth for **every user-facing string** on claudiomendonca.com,
stripped of all design and layout information.

This file does **not** drive the live Nuxt app — it's a content-focused extract.
The app still renders from its Vue pages, components, and `app/data/*.ts`. This is
the readable inventory of *what the site says*, free of *how it looks*.

## Why it's organized this way

The source is page-focused (a home page and a consulting page, each mixing copy
with markup). This JSON is **content-focused**: grouped by subject matter, not by
which page a string happens to land on.

| Key | What lives here |
|-----|-----------------|
| `meta` | Site title, description, canonical URL — the SEO basics. |
| `identity` | Who Claudio is + every contact/brand string: name, roles, tagline, location, email, social, copyright. |
| `intro` | The homepage pitch (eyebrow, rotating headline, subhead, CTAs). |
| `about` | The about/bio paragraphs. |
| `experiments` | The product list. Each item: `name`, `description`, `url`. |
| `consulting` | The whole service offer, split by sub-topic: `brief`, `differentiator` (+ stat), `offerings`, `process`, `pricing`, `cta`, plus the `deliverables` strip. |
| `navigation` | Primary nav labels. |

## What was dropped (design / layout / plumbing)

- All CSS, animation, and component structure.
- Image paths, `alt` text, and `aria-label`s (presentation/a11y, not content).
- Decorative glyphs (`✱`, dots, arrows) and section counters (`Offerings — 03`).
- The Google Analytics tag and route-redirect config.

## Normalization notes

- **Stylistic ALL-CAPS → natural case.** The source types eyebrows, the homepage
  headline words, and experiment tags in all-caps as a *visual* treatment
  (`EXPERIMENTS`, `YOUTUBE VIDEOS AS TWEETS`). Casing is design, so strings are
  stored in natural case. Re-apply caps in the view layer if desired.
- **Inline `<br />` removed.** Two offering titles carried a hard line break for
  the display font (`Automate the<br />repetitive.`). The break is layout, so the
  title is stored as one clean string.
- **`target` instead of `href`.** Link destinations are kept as logical targets
  (`experiments`, `consulting`, `process`, `contact`) or real URLs/`mailto:`.
  In-page anchors (`#work`, `#about`, `#how`, `#consulting`) are dropped in favor
  of the content key they point at — the anchor names are layout, the destination
  is content.

## Known placeholders (carried over verbatim from source)

- **Prices are `9999,00`** — placeholder figures, not real pricing.
- **`identity.social` URLs are empty** — GitHub / X links are `href="#"` stubs in
  the live footer.
- Product screenshots in the source are byte-identical placeholders; no image data
  is represented here by design.
