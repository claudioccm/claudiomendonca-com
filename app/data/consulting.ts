// Source of truth for the /consulting offerings list (PRO-78 K4, R10).
// Adding a fourth offering is one new entry here — the page iterates this
// array, ConsultingEntry renders one row per item, and no markup edit is
// required. (Open question deferred to U6: derive "Offerings — 03" from
// array length.)
//
// Title strings carry an embedded `<br />` to control the display-font line
// break (PRO-78 K3). The string is rendered via `v-html` inside
// ConsultingEntry.vue — safe because the source is this static module, not
// user input.
//
// Copy lifted verbatim from _process/prototype/consulting.html lines 96–177
// (titles, taglines, blurbs, outcomes). Casing/punctuation preserved.

export interface ConsultingOffering {
  id: string
  title: string
  tagline: string
  blurb: string
  outcomes: string[]
}

export const consultingOfferings: ConsultingOffering[] = [
  {
    id: 'agent-architecture',
    title: 'Agent<br />Architecture.',
    tagline: 'Multi-agent systems that aren\'t held together with hope and duct tape.',
    blurb:
      'Design and build agentic systems end-to-end: agent roles and boundaries, tool design, orchestration patterns, hand-offs, and the evaluation loops that keep them honest. From architecture diagram to working, testable system.',
    outcomes: [
      'Working agent system, in your repo, on your stack.',
      'Architecture doc + tool catalogue your team owns.',
      'Eval loop wired to CI so quality doesn\'t drift.',
    ],
  },
  {
    id: 'ai-automation',
    title: 'AI<br />Automation.',
    tagline: 'Remove the repetitive work without losing control or quality.',
    blurb:
      'Identify the high-leverage workflows hiding in your team\'s week, then automate them with LLMs and agents — pipelines, internal tools, and human-in-the-loop processes that fit how you already work.',
    outcomes: [
      'Audit of where AI moves the needle for your team.',
      'One or more deployed automations — not prototypes.',
      'Playbook your team can extend without me.',
    ],
  },
  {
    id: 'ai-training',
    title: 'AI<br />Training.',
    tagline: 'Practical AI for the people who actually have to use it.',
    blurb:
      'Upskill teams on the things that matter: agentic workflows, prompt and context engineering, tool and agent design, and the day-to-day craft of modern AI dev tooling. Hands-on, role-specific — not a generic slide deck.',
    outcomes: [
      'Tailored curriculum for your roles and stack.',
      'Workshop materials your team keeps.',
      'Measurable lift on the workflows that matter.',
    ],
  },
]
