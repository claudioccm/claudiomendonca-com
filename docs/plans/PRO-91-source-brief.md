## Summary

The site's `/consulting` page (and the home page's consulting framing) was built from the **prototype copy**, before the AI Services Studio strategy was finalized. It now **contradicts the decided strategy** on audience, positioning, offering taxonomy, and pricing. This ticket realigns the website copy + data to the strategy spine.

**Source of truth:** `ai-consulting/strategy/` — `strategy.md` (the spine), `offer-one-pager.md` (client voice copy), `README.md` (one-screen summary). Name decided 2026-06-01: author-fronted, studio = Claudio Mendonça, home `claudiomendonca.com`.

**Site files in scope:** `app/data/consulting.ts`, `app/pages/consulting.vue`, `app/components/HowItWorks.vue`, `app/pages/index.vue` (About + consulting pointer).

## The core mismatch (one line)

Site speaks to **dev peers** ("builders, founders, engineers" who want "real agentic systems in production") and **hides pricing**. Strategy sells **outcomes to non-technical publication-producing orgs** (research nonprofits, think tanks, foundations, NGO/IR comms teams) rebuilding recurring **documents & reports** by hand — and explicitly says **publish the prices**.

## Gaps (site → strategy)

### G1 — ICP / audience is inverted (highest impact)
- **Site:** "small teams of builders — founders, product leads, and engineers… a real agentic system in production." Hero "Ship AI that actually works."
- **Strategy:** ICP = research-nonprofit / think-tank / foundation publication production (cold wedge); warm = IR, architecture, law, NGOs. All rebuild **recurring high-stakes documents** by hand. Buyers are non-technical, on LinkedIn — "X is peers."
- **Fix:** rewrite hero + "The brief" to address publication/report-producing orgs, not engineers.

### G2 — Positioning frame missing
- Strategy: **"Service-as-a-Software"** — sell the outcome, hide the how. Capability descriptor: *"Document & reporting systems for expert teams — automated, on-brand, accountable."* Tagline: *"Automate the repetitive. Empower your team for the rest."*
- Site leads with tech capability (agent architecture). None of the above copy is present.
- **Fix:** lead with the outcome + tagline + descriptor.

### G3 — Offering taxonomy is wrong
- **Site (`consulting.ts`):** Agent Architecture / AI Automation / AI Training — outcomes are dev-flavored ("in your repo", "eval loop wired to CI").
- **Strategy:** work-type split → **Automate** (repetitive = the wedge) + **Empower** (the rest = the moat), delivered via **Opportunity Audit → Build → Empower → Care & R&D**. "Agent Architecture" isn't in the strategy. The **paid Audit as entry / risk-control** is missing entirely.
- **Fix:** restructure offerings to the strategy's automate/empower model; add the paid Audit as the entry offer.

### G4 — Pricing is hidden; strategy says PUBLISH it
- **Site (`HowItWorks.vue`):** "Pricing intentionally not shown on the page."
- **Strategy §6 (a named differentiator):** "**Publish pricing** (audit $X, builds from $Y) → pattern-break for the opaque-consultant-fearing ICP. **Nobody in the direct set shows numbers.**"
- **Fix:** show the price card — Audit **$5k** · Build **from $12k** · Empower **$3–8k** · Care & R&D **from $2k/mo** (USD). Direct contradiction; this is a deliberate weapon left on the table.

### G5 — No DIY counter
- Strategy: #1 objection is "we'll just use ChatGPT ourselves." Counter = MIT 2025 (external AI ~67% vs in-house ~33%) + depth/integration/accountability/taste. `offer-one-pager.md` already has the on-page paragraph.
- Site addresses none of it. **Fix:** add a short "this isn't just use ChatGPT" block.

### G6 — No proof / case study
- Strategy: proof is **the** credibility bottleneck. Instrument Shorenstein, put a hard number ("cut the weekly newsletter build from 6 hours to 20 minutes").
- Site has zero proof, outcomes, or client reference. **Fix:** add a proof slot (even one instrumented number) once available; design the slot now.

### G7 — Human-in-the-loop / accountable framing absent
- Strategy: sell *"AI-assisted, on-brand, accountable — a human guarantees the output,"* never "AI writes it unsupervised."
- Site says "real agentic systems, not AI theatre" — a dev-quality claim, not the trust/accountability claim non-technical buyers need. **Fix:** add the accountability framing.

### G8 — Design-craft differentiation unused
- Strategy §6: second discipline = **design + process craft → publication-quality artifact** ("taste is the new bottleneck"); the most AI-resistant layer.
- Consulting page never leverages it — outcomes are CI/repo/eval (engineering). Home mentions "design engineer" but the consulting page drops the moat. **Fix:** foreground "output you'd put your name on," not just "it works."

### G9 — "Independence/handover" vs "the retainer is the product"
- **Site:** How-it-works ends "the goal is your team operating it without me," retainer = "optional ongoing support."
- **Strategy §6:** "**The retainer is the product, not the build**" — Care & R&D / fractional-AI-lead is the durable moat + recurring revenue (earned, not led-with, but central).
- **Fix:** reframe Care & R&D as the ongoing product, not an afterthought.

### G10 — Hero/outcome copy voice
- Replace "Ship AI that actually works." (dev-peer voice) with outcome copy, e.g. one-pager's *"Your recurring work, done by a system — not by hand."*

### G11 — Home page alignment
- `index.vue` About + consulting pointer describe the offer as "agent architecture, AI automation, and hands-on training" — same dev-centric taxonomy. Realign after the consulting page changes.

### G12 — Guardrail: don't brand "enablement"
- Strategy §6: "enablement" is taken twice in the direct set → me-too. When rewording "AI Training" → "Empower," keep avoiding the word "enablement."

## Proposed changes (checklist)

- [ ] Rewrite `consulting.vue` hero (headline, eyebrow, sub) to outcome + tagline + non-technical ICP (G1, G2, G10)
- [ ] Rewrite "The brief" section to the document-/report-producing ICP (G1, G7)
- [ ] Restructure `consulting.ts` offerings to the automate / empower model; add the paid **Opportunity Audit** entry offer (G3)
- [ ] Add a **published price card** (Audit / Build / Empower / Care & R&D, USD) (G4)
- [ ] Add a **DIY-counter** block (MIT 67/33 + accountability), lifting copy from `offer-one-pager.md` (G5)
- [ ] Add a **proof / case-study** slot; populate with the Shorenstein number when available (G6)
- [ ] Add **human-in-the-loop / accountable** framing (G7)
- [ ] Foreground **design-craft / publication-quality** differentiation in offering copy (G8)
- [ ] Reframe **Care & R&D retainer** as the ongoing product, not optional support (G9)
- [ ] Realign `index.vue` About + consulting pointer to the new taxonomy (G11)
- [ ] Keep "enablement" out of brand copy (G12)

## Open decisions for owner (block full copy)

1. **Beachhead sub-niche** still open in strategy (foundations/impact reports vs policy briefs vs research-comms newsletters). The page leads on ONE — which? (`strategy.md` open thread #3.)
2. **How loud to go on the wedge vs broad capability.** Strategy: "serve broad, market narrow." Does the public page lead narrow (publications) or stay on the broad docs/reporting descriptor?
3. **Publish pricing — confirm go.** Strategy strongly recommends it; site currently opts out by design. Owner sign-off needed.
4. **Proof number availability** — is a Shorenstein metric ready to quote, or design the slot empty for now?

## Notes
- Strategy repo `ai-consulting/` is **not** under git (loose strategy folder). Website repo is the Nuxt project on branch `dev`. No code/asset sharing between them — pure strategy → site copy flow.
- This is a **copy + data** change (`consulting.ts`, page templates), not an architecture change — the data-driven offerings array already supports re-shaping without markup edits.
---

# Draft copy (full)

Author-ready drafts for every section. **Voice:** design-engineer `voice.md` ("Builder Who Shares What Works"), pitched at the non-technical buyer. **Humanizer** applied (straight quotes, trimmed em-dashes, no rule-of-three padding, varied rhythm). Stats/pricing status noted inline. Same drafts also live as ticket comments.

## Draft 1 — Hero + "The brief" + DIY counter (`consulting.vue`)

### Hero

- **Eyebrow:** Consulting — automated, on-brand, accountable
- **Headline:** Your recurring work,<br>done by a system.
- **Sub:** Every week your team rebuilds the same reports, briefs, and newsletters by hand. I build systems that produce that work for you, on schedule and on-brand. For the parts that don't repeat, I teach your team to work with AI so they move faster there too.
- **Kicker (optional):** Automate the repetitive. Empower your team for the rest.
- **CTAs:** `Start a conversation` (mailto) · `See how it works` (#how)

> Replaces "Ship AI that actually works." / "real agentic systems, not AI theatre." — that talks to engineers; this talks to the buyer who owns the reports.

### "The brief" section

- **Label:** Who this is for · **H2:** The brief.
- **P1:** Most "AI strategy" is a slide deck. This is the opposite: working systems that produce your recurring documents and reports, built to your brand, with a person accountable for what goes out the door.
- **P2:** I work with research nonprofits, foundations, think tanks, and small expert teams — the ones who publish to make their case and rebuild the same reports, briefs, and newsletters from scratch every cycle. The work is valuable. Doing it by hand, over and over, is not.

### Block — "This isn't 'just use ChatGPT'"

- **H3 / label:** The honest version
- **Body:** Anyone can get a draft out of a chatbot. The hard part is the system that runs every cycle, stays on-brand, and has someone accountable when it matters. That is the part you are paying for, and it is the part a generic chatbot won't do.
- **Stat callout (verified, use):**
  > 95% of company AI pilots never deliver a measurable return. The ones run with an outside specialist succeed about twice as often as in-house builds. — MIT, *State of AI in Business 2025*

> Stat confirmed: MIT NANDA, *The GenAI Divide: State of AI in Business 2025* — external AI ~67% vs ~33% internal; 95% of pilots show no P&L impact. One citation covers both.

### Proof / case-study slot — DEFERRED

Shorenstein has no numbers before launch. No fabricated client metric. Design the slot, leave it empty for launch, lead on the MIT stat above; drop a real "X hrs → Y min" case study in post-launch.

## Draft 2 — Offerings (`consulting.ts`)

Restructured to the work-type model, entered through a paid audit. Same data shape (`title`/`tagline`/`blurb`/`outcomes[]`). Run **3 cards** (Audit / Automate / Empower); card 04 optional, else fold into "How it works". "enablement" kept out on purpose (strategy §6).

### 01 — Opportunity Audit.
- **Tagline:** Two to three weeks. A plain plan and a fixed price before you commit to a build.
- **Blurb:** I sort your team's recurring work into three buckets: what to automate, what to upskill your people on, and what to leave to humans. You walk away with one measurable target and a fixed quote for the build. No obligation to go further.
- **What you walk away with:** Your work mapped: automate, empower, or leave alone. · One measurable outcome the build will be held to. · A fixed build price, credited back if you proceed.

### 02 — Automate the<br>repetitive.
- **Tagline:** The reports and newsletters you rebuild every cycle, produced by a system instead.
- **Blurb:** I build the system that produces your recurring documents on schedule and on-brand, in your tools, yours to keep. A human stays in the loop and signs off before anything ships.
- **What you walk away with:** A working system that produces the work, every cycle. · Hours back for the people who were doing it by hand. · Output that looks like you, not a template.

### 03 — Empower<br>your team.
- **Tagline:** For the judgment calls and one-offs: your team working with AI, not depending on me.
- **Blurb:** Hands-on training and setup for the work that doesn't repeat — how to think with AI, where it helps, where it doesn't, and how to keep quality and brand intact. Role-specific, on your actual workflows, not a generic deck.
- **What you walk away with:** A team that works with AI on the messy middle. · A playbook and setup your team keeps. · Less dependence on any one specialist, me included.

### 04 — Care & R&D. *(optional 4th card)*
- **Tagline:** I keep it running, keep it on-brand, and find the next thing worth automating.
- **Blurb:** An ongoing engagement, not "support." I maintain the systems as you grow, handle the edge cases, and look for the next high-leverage workflow. Closer to a fractional AI lead than a help desk.
- **What you walk away with:** Systems that stay reliable as you change. · A standing person accountable for output quality. · A steady read on the next thing to automate.

## Draft 3 — Pricing + "How it works" + Home

### Pricing card *(numbers are PLACEHOLDERS)*

- **Label:** What it costs · **H2:** No mystery pricing.
- **Lead:** Transparent and fixed. You know the number before we start.

| Offer | Price |
|---|---|
| **Opportunity Audit** | **9999,00** · 2–3 weeks · credited toward your build |
| **Build** (automate) | **from 9999,00** · fixed, set against the value it creates |
| **Empower** (training + setup) | **9999,00** |
| **Care & R&D** | **9999,00 / month** |

> Placeholder `9999,00` until real numbers confirmed. Strategy working figures: Audit ~$5k · Build from ~$12k · Empower ~$3–8k · Care from ~$2k/mo (USD). Replaces the current "Pricing intentionally not shown" line (strategy §6 differentiator).

### "How it works" (`HowItWorks.vue`) — reframed

- **01 — Audit.** A short, paid audit. We agree on the problem, the one outcome that matters, and a fixed price, before any build starts.
- **02 — Build.** Hands-on delivery in your repo and tools. Short cycles, weekly checkpoints, no surprises at the final review. A human signs off on what ships.
- **03 — Run it.** Your team owns the system and the docs. Most keep me on a Care & R&D retainer to maintain it, handle the edge cases, and automate the next thing. The build is the start, not the finish.

> Drops "the goal is your team operating it without me." Strategy §6: the retainer is the product, not the build.

### Home page (`index.vue`) — one change

About → consulting pointer.

- **Current:** "...The consulting page is what I do for clients: agent architecture, AI automation, and hands-on training for teams."
- **New:** "...The consulting page is what I do for clients: systems that produce their recurring documents and reports, plus training so their team works with AI on everything else."

## Pre-publish checklist (copy-specific)

- [ ] Headlines checked in Motto display type at mobile widths (PRO-79 responsive work)
- [ ] Confirm publish-pricing go (section replaces "pricing intentionally not shown")
- [ ] Swap `9999,00` for real prices
- [ ] Voice gut-check: does the design-engineer voice read right to a non-technical buyer?
