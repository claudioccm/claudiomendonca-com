// Source of truth for the home-page experiments grid.
// Adding a fifth product is one new entry here + one image file in
// public/screenshots/. The page iterates this array and does not assume
// length, so no layout edits are required.
//
// `idx` is intentionally not stored — the page renders it from the array
// position (index + 1), zero-padded inside ExperimentCard.vue.
//
// Real product URLs are now wired for all entries. Real product screenshots
// remain owner-deferred and tracked in todos/PRO-80-residual.md — every entry
// still points at a placeholder bitmap (squoosh.jpg / varro.jpg / feedback.jpg
// are byte-identical placeholders) until real captures land.

export interface Experiment {
  id: string
  title: string
  tag: string
  url: string
  image: string
  alt: string
  // Optional terser accessible name for the card link. When unset, the
  // ExperimentCard falls back to `title`. Used to match the prototype's
  // terser aria-label for entries whose visible title is more verbose
  // than the spoken name (e.g. "BATCH SQUOOSH" → "Squoosh").
  ariaLabel?: string
}

export const experiments: Experiment[] = [
  {
    id: 'cutthecrap',
    title: 'Cut The Crap',
    tag: 'YOUTUBE VIDEOS AS TWEETS',
    url: 'https://cutthecrap.claudiomendonca.com',
    image: '/screenshots/cutthecrap.jpg',
    alt: 'Cut The Crap — YouTube videos as tweets',
  },
  {
    id: 'edge',
    title: 'Edge',
    tag: 'AUTO GENERATED BLOG ABOUT AI NEWS & RESEARCH',
    url: 'https://edge.ccmdesign.ca',
    image: '/screenshots/edge.jpg',
    alt: 'Edge — auto-generated AI news blog',
  },
  {
    id: 'squoosh',
    title: 'BATCH SQUOOSH',
    tag: 'Tool · Self-hosted',
    url: 'https://squoosh.ccmdesign.com',
    image: '/screenshots/squoosh.jpg',
    alt: 'Batch Squoosh — self-hosted image compression',
    // Prototype used the terser spoken name here; visible title stays loud.
    ariaLabel: 'Squoosh',
  },
  {
    id: 'varro',
    title: 'Varro',
    tag: 'FULLY AI GENERATED BLOG & SOCIAL MEDIA CONTENT',
    url: 'https://varro.me',
    image: '/screenshots/varro.jpg',
    alt: 'Varro — fully AI generated blog and social content',
  },
  {
    id: 'feedback',
    title: 'Feedback',
    tag: 'AI-POWERED FEEDBACK COLLECTION',
    url: 'https://feedback.ccmdesign.ca',
    image: '/screenshots/feedback.jpg',
    alt: 'Feedback — AI-powered feedback collection',
  },
]
