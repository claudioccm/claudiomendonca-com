// Source of truth for the home-page experiments grid.
// Adding a fifth product is one new entry here + one image file in
// public/screenshots/. The page iterates this array and does not assume
// length, so no layout edits are required.
//
// `idx` is intentionally not stored — the page renders it from the array
// position (index + 1), zero-padded inside ExperimentCard.vue.
//
// `TODO(claudio)`: replace `#` URLs with real product URLs when available.
// `TODO(claudio)`: replace placeholder `image` paths with real product
// screenshots. Until then, several entries point at the same prototype
// placeholder bitmap (e.g. squoosh.jpg and varro.jpg are byte-identical) —
// this is intentional for PRO-77 and is tracked for a future content pass
// (PRO-78 or a dedicated screenshots ticket).

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
    // TODO(claudio): real URL
    url: '#',
    image: '/screenshots/cutthecrap.jpg',
    alt: 'Cut The Crap — YouTube videos as tweets',
  },
  {
    id: 'edge',
    title: 'Edge',
    tag: 'AUTO GENERATED BLOG ABOUT AI NEWS & RESEARCH',
    // TODO(claudio): real URL
    url: '#',
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
    // TODO(claudio): real URL
    url: '#',
    image: '/screenshots/varro.jpg',
    alt: 'Varro — fully AI generated blog and social content',
  },
]
