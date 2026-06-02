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
// Copy realigned to the AI Services Studio strategy (PRO-91, Draft 2):
// Opportunity Audit → Automate → Empower. Care & R&D is the ongoing product
// and is folded into HowItWorks step 03 ("Run it"), not run as a peer card
// (PRO-91 KTD-1), so the "Offerings — 03" label stays in sync with three
// entries here.

export interface ConsultingOffering {
  id: string
  title: string
  tagline: string
  blurb: string
  outcomes: string[]
}

export const consultingOfferings: ConsultingOffering[] = [
  {
    id: 'opportunity-audit',
    title: 'Opportunity<br />Audit.',
    tagline: 'Two to three weeks. A plain plan and a fixed price before you commit to a build.',
    blurb:
      'I sort your team\'s recurring work into three buckets: what to automate, what to upskill your people on, and what to leave to humans. You walk away with one measurable target and a fixed quote for the build. No obligation to go further.',
    outcomes: [
      'Your work mapped: automate, empower, or leave alone.',
      'One measurable outcome the build will be held to.',
      'A fixed build price, credited back if you proceed.',
    ],
  },
  {
    id: 'automate',
    title: 'Automate the<br />repetitive.',
    tagline: 'The reports and newsletters you rebuild every cycle, produced by a system instead.',
    blurb:
      'I build the system that produces your recurring documents on schedule and on-brand, in your tools, yours to keep. A human stays in the loop and signs off before anything ships.',
    outcomes: [
      'A working system that produces the work, every cycle.',
      'Hours back for the people who were doing it by hand.',
      'Output that looks like you, not a template.',
    ],
  },
  {
    id: 'empower',
    title: 'Empower<br />your team.',
    tagline: 'For the judgment calls and one-offs: your team working with AI, not depending on me.',
    blurb:
      'Hands-on training and setup for the work that doesn\'t repeat — how to think with AI, where it helps, where it doesn\'t, and how to keep quality and brand intact. Role-specific, on your actual workflows, not a generic deck.',
    outcomes: [
      'A team that works with AI on the messy middle.',
      'A playbook and setup your team keeps.',
      'Less dependence on any one specialist, me included.',
    ],
  },
]
