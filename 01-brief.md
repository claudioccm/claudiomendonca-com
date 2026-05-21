# 01 — Project Brief

## What

A **one-page website** for `claudiomendonca.com`.

## Who it's for

Claudio Mendonça's personal site. It is the public home for his **AI products
and explorations** — a curated showcase, not a blog and not a résumé. Visitors
land, understand what Claudio builds, and click through to the individual
products.

## Goal

- Communicate, at a glance, that Claudio builds AI products and explorations.
- Present each product cleanly with a name, a one-line positioning, a short
  blurb, and a link out.
- Feel considered, sharp, and confident — the design itself is part of the
  pitch. (See `02-design-system-motto.md`.)

## Scope

- **Two routes:**
  - `/` — the home one-pager (showcase of products/explorations). Scroll +
    anchor nav.
  - `/services` — client-facing services page. See `04-services-page.md`.
- Both routes share the Motto® design system, nav, and footer.
- No CMS, no auth, no backend. Static content is acceptable.
- Content is hand-maintained in the codebase (small product list, edited rarely).

## Products — launch set

Feature these four. Order is not yet final; treat as equal weight unless told
otherwise.

| Key | Name | Link | Notes |
|-----|------|------|-------|
| `cutthecrap` | Cut The Crap | (confirm URL) | Existing project; repo lives in Claudio's GitHub. |
| `edge` | Edge | (confirm URL) | Details TBD. |
| `squoosh.ccmdesign` | Squoosh (ccmdesign) | https://squoosh.ccmdesign.com (confirm) | Image-compression tool, hosted under ccmdesign. |
| `varro` | Varro | (confirm URL) | Details TBD. |

The product list **will grow** over time. Build the Work section as a simple
repeating data structure (array of products) so new entries are a one-line
addition, not a layout rebuild.

## Copy

Draft plausible positioning + blurbs for each product from name/context. Mark
anything uncertain clearly so Claudio can correct it after first preview. Do not
invent specific metrics, dates, or claims.

Voice: terse, confident, no marketing fluff. Matches the Motto® aesthetic —
content-forward, no filler. (Reference Claudio's voice/tone guide if available.)

## Out of scope (for v1)

- Contact form (a `mailto:` link is enough).
- Analytics, cookie banners, newsletter capture.
- Dark mode (Motto® is a light theme by design).
- Per-product detail pages.
