// Source of truth for the home-page experiments grid.
// Adding a fifth product is one new entry here + one image file in
// public/screenshots/. The page iterates this array and does not assume
// length, so no layout edits are required.
//
// `idx` is intentionally not stored — the page renders it from the array
// position (index + 1), zero-padded inside ExperimentCard.vue.
//
// `TODO(claudio)`: replace `#` URLs with real product URLs when available.

export interface Experiment {
  id: string
  title: string
  tag: string
  url: string
  image: string
  alt: string
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
