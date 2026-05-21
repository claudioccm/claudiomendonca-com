# 04 — Services Page (`/services`)

> Status: **initial draft for discussion.** Offerings + copy below are a
> starting point. Claudio will refine after seeing the first build.
> Same Motto® design system as the rest of the site (`02-design-system-motto.md`).

## Purpose

Client-facing page. Communicates what Claudio offers as services (distinct from
his own products on `/`). A visitor here is a potential client evaluating
whether to engage him.

## Route & shared chrome

- Route: `/services`. Shares the global layout — same sticky nav, same footer.
- Nav highlights `Services` as active. `Work`/`About`/`Contact` point back to
  home anchors (`/#work`, `/#about`, etc.).

## Offerings (draft)

Lead set. Treat as a **data array** like products — adding/reordering a service
is a one-line change, not a layout rebuild.

### 1. Agent Architecture & Orchestration
Design and build multi-agent systems: agent roles and boundaries, tool design,
orchestration patterns, hand-offs, and evaluation loops. From architecture
diagrams to a working, testable system.

### 2. AI Automation
Identify high-leverage workflows and automate them with LLMs and agents —
pipelines, internal tooling, and human-in-the-loop processes that remove
repetitive work without losing control or quality.

### 3. AI Training
Upskill teams on practical AI: agentic workflows, prompt and context
engineering, tool/agent design, and day-to-day use of modern AI dev tooling.
Hands-on, role-specific, not a generic slide deck.

### 4. `TODO(claudio):` further offerings — candidates to confirm/cut
- **AI Strategy & Advisory** — where AI actually moves the needle for a given
  business; roadmap and prioritization.
- **Custom AI Product Development** — end-to-end build of a bespoke AI product
  or internal tool.
- **Exploration / Prototype Sprints** — time-boxed proof-of-concept to
  de-risk an AI idea before committing.

> Decide which of the above are in, what their final names are, and the final
> order. The "etc" in the request is parked here until that conversation.

## Service data shape

```ts
interface Service {
  key: string        // 'agent-architecture'
  name: string       // 'Agent Architecture & Orchestration'
  summary: string    // one confident line
  detail: string     // 2–4 sentences
  outcomes?: string[] // optional: what the client walks away with
}
```

## Page structure (top → bottom)

### 1. Hero
- `disp` headline, weight 500 — working line: **"Services."** or a value
  statement like **"Ship AI that actually works."** (`TODO(claudio):` choose.)
- One `sans` body subline framing the practice in one sentence.
- Motto® spacing — generous, vertically prominent.

### 2. Positioning line (optional)
- One short paragraph: who this is for and the angle (e.g. builders/teams who
  want working agentic systems, not AI theater). `sans` body. `TODO(claudio):`
  confirm positioning.

### 3. Services list
- Section heading (`heading`/`disp` scale).
- Render from the Service array. Each service = an **isolated content block**
  (Motto® Info Card rules: 0 radius, no shadow, transparent bg):
  - Name — `disp` (clamped) or `heading`.
  - Summary — `sans` 500, Pitch Black.
  - Detail — `sans` body; Ash Text acceptable.
  - Optional `outcomes` — short list, `sans`, Silver/Ash for secondary.
- Stacked single-column (simple two-column on wide). ≥48px gaps. **No card
  grid, no bordered boxes.** Isolated entities, one message each.

### 4. How it works (optional — `TODO(claudio):` keep or drop)
- 2–4 step engagement model (e.g. Scope → Build → Handover). Plain numbered
  blocks, Motto® type, no decorative timeline graphics.

### 5. CTA
- Single primary action: **Filled pill button** (`#1b1b1c` bg, white text,
  9999px) — "Start a conversation" → `mailto:` (claudioccm@gmail.com unless
  told otherwise).
- No contact form in v1.

### 6. Footer
- Shared global footer (same as home).

## Copy guidance

- Terse, confident, concrete. No agency buzzwords ("synergy", "transformative",
  "cutting-edge"). Match Motto®'s cut-the-fluff tone and Claudio's voice/tone
  guide.
- No invented client names, metrics, case studies, or pricing.
- Flag every assumption with inline `TODO(claudio):`.

## Open questions for the follow-up discussion

1. Final list of services — keep the 3 leads only, or add from the candidates?
2. Pricing/engagement model shown on the page, or "contact" only?
3. Any proof elements (logos, case studies, testimonials) later, or stay pure
   Motto® text-only?
4. Hero headline + positioning line — Claudio's exact words.
