# PRO-179 — Newsletter signup (Resend Netlify Function)

Redesign v2 · item 6. A working email-capture for the Writing index "Edge — the
newsletter" band (and later the home band). Provider: **Resend** (Audiences /
Contacts API). The site is a static `nuxt generate` → Netlify deploy, so the
backend is a **Netlify Function**, NOT a Nuxt server route.

## Brief (from Plane PRO-179)

- `app/components/NewsletterBand.vue` — functional, editorial restyle of edge's
  `SubscribeBand.vue`: mono eyebrow, serif "Edge — the newsletter.", email input
  + "Subscribe →", idle / submitting / success / error states, hidden honeypot.
- Replace `<NewsletterStub />` on `app/pages/writing/index.vue` (carries the
  `<!-- PRO-179: replace with functional NewsletterBand -->` marker).
- Port `edge/app/netlify/functions/newsletter-subscribe.ts` (honeypot,
  body-size cap, Resend SDK, "already exists" → success, never echoes upstream
  errors) into this repo's `netlify/functions/`.
- Add the `resend` dependency. Configure the functions dir in `netlify.toml`.
- `$fetch` posts to `/.netlify/functions/newsletter-subscribe`.
- Env: `RESEND_API_KEY` + `RESEND_SEGMENT_ID` (audience UUID) — document in
  `.env.example`. NOT set locally → end-to-end send is not testable here.

## Key decisions (autonomous defaults, recorded)

1. **Monochrome, NO color.** The edge component leans on `--accent` (a chromatic
   violet). This site is fully monochrome — `--accent` is remapped to `--paper`,
   so even a literal port would render mono. To be safe and intentional, the new
   component uses `--paper` / `--ink` / `--dim` / `--faint` / `--hairline-solid`
   directly and never references `--accent`. Filled button = paper-on-ink,
   matching the stub and `.btn-filled`.
2. **Reuse the stub's editorial layout + class names.** The stub already nails
   the band layout (`.newsletter-stub*` classes in `sections.css`, grid, serif
   title, mono eyebrow). The new component keeps the same DOM shape / class
   names so the existing global CSS continues to style it; only the **behavior**
   (live form, states) is added, plus a few new state-specific classes scoped to
   the component. This avoids a parallel duplicate style system.
3. **Env var name = `RESEND_SEGMENT_ID`** (per this ticket), not edge's
   `NEWSLETTER_AUDIENCE_ID`. The function reads `RESEND_SEGMENT_ID` and passes it
   to `resend.contacts.create({ audienceId })`.
4. **Honeypot field name = `website`** (matches edge). Hidden via inline
   off-screen styles + `tabindex="-1"` + `autocomplete="off"` + `aria-hidden`.
5. **Client-side validation** mirrors the server regex
   (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`, max 254) so the obvious-invalid case is
   caught before the network round-trip; the server re-validates regardless.
6. **Error copy never leaks upstream detail.** Generic "Something went wrong —
   try again." for any non-2xx / thrown error. Invalid-email maps to a specific
   inline validation message client-side.
7. **`netlify.toml`**: add `[functions] directory = "netlify/functions"` and
   `node_bundler = "esbuild"` so the TS function bundles. Build command / publish
   dir are unchanged.

## Files touched

| File | Change |
| --- | --- |
| `package.json` | add `resend` to dependencies |
| `netlify.toml` | add `[functions]` block (dir + esbuild bundler) |
| `netlify/functions/newsletter-subscribe.ts` | NEW — ported handler |
| `app/components/NewsletterBand.vue` | NEW — functional editorial band |
| `app/pages/writing/index.vue` | swap `<NewsletterStub />` → `<NewsletterBand />` |
| `.env.example` | NEW — document `RESEND_API_KEY` + `RESEND_SEGMENT_ID` |
| `app/components/NewsletterStub.vue` | leave in place (no longer referenced); removal optional |

## Acceptance

- Client-side email validation works (empty / malformed rejected before fetch).
- Submit POSTs JSON to `/.netlify/functions/newsletter-subscribe`.
- Success + error UI render; submitting state disables controls.
- Honeypot non-empty → server rejects silently as `bad_request`.
- Env documented in `.env.example`.
- `pnpm build` (and `pnpm generate`) green.
- Monochrome only — no chromatic accent.

## Out of scope / handoff

- Real end-to-end send (needs `RESEND_API_KEY` + a real audience) — verified on a
  Netlify deploy preview, not locally. **Manual Netlify setup is a handoff item:**
  create a Resend audience for claudiomendonca.com and set both env vars in the
  Netlify site config (dev + prod contexts).
- Home-page consumption of the band is PRO-#7's job; this ticket only wires the
  Writing index.
- Compact rail/teaser variant is explicitly optional — not built.

## Verification plan

1. `pnpm build` green.
2. `pnpm dev`, load `/writing`, confirm: band renders editorial + monochrome;
   empty/invalid email blocked client-side; submit (env absent) surfaces the
   graceful error state, not a crash; reduced-motion respected.
3. Inspect the function file is a faithful port (honeypot, body cap, dup→success,
   no upstream leak), reading `RESEND_SEGMENT_ID`.
