// Source of truth for the home-page experiments grid.
// Adding a fifth product is one new entry here + one image file in
// public/screenshots/. The page iterates this array and does not assume
// length, so no layout edits are required.
//
// `idx` is intentionally not stored — the page renders it from the array
// position (index + 1), zero-padded inside ExperimentCard.vue.
//
// Real product URLs and real screenshots for Cut The Crap, Edge, and Varro
// are owner-deferred and tracked in todos/PRO-80-residual.md. Until they
// land, those three entries use `#` URL stubs and several point at the same
// prototype placeholder bitmap (squoosh.jpg and varro.jpg are currently
// byte-identical). Squoosh already links to its live URL.

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
    // stub — real URL pending (see todos/PRO-80-residual.md)
    url: '#',
    image: '/screenshots/cutthecrap.jpg',
    alt: 'Cut The Crap — YouTube videos as tweets',
  },
  {
    id: 'edge',
    title: 'Edge',
    tag: 'AUTO GENERATED BLOG ABOUT AI NEWS & RESEARCH',
    // stub — real URL pending (see todos/PRO-80-residual.md)
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
    // stub — real URL pending (see todos/PRO-80-residual.md)
    url: '#',
    image: '/screenshots/varro.jpg',
    alt: 'Varro — fully AI generated blog and social content',
  },
]
