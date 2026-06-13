// One-off generator: mesh-gradient placeholder art for the experiments grid.
// Writes over public/screenshots/<id>.jpg (924x540 display size, rendered @2x).
// Run: node _process/mesh-gradients.mjs
//
// Technique: per project, a base-color canvas with 5 large radial-gradient
// blobs (palette colors at offset anchor points) under a heavy gaussian blur,
// plus a whisper of feTurbulence noise so the JPEG doesn't band.

import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

// pnpm doesn't hoist transitive deps, so walk the dependency chain to sharp:
// @nuxt/image (direct devDep) -> ipx -> sharp.
const require = createRequire(import.meta.url)
const nuxtImagePath = require.resolve('@nuxt/image', { paths: [path.join(process.cwd(), 'node_modules')] })
const ipxPath = createRequire(nuxtImagePath).resolve('ipx')
const sharp = createRequire(ipxPath)('sharp')

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = path.join(ROOT, 'public', 'screenshots')

const W = 1848
const H = 1080

// One palette per project: [base, ...blobColors]. Hues chosen to read as
// distinct cards at a glance while sharing one saturated-but-soft register.
// Blob order maps onto the anchors array below: slots 0-3 are corners, slot 4
// is center — keep the dark accent in a corner slot and a bright hue at center
// or the card reads as a dark smudge.
//
// PRO-112: these are now consumed on the DARK redesign (page bg --ink #08080a).
// The original saturated palettes (authored for a light card frame on white)
// measured a mean luminance of ~70-88 vs the page's ~8 — they glowed as bright
// tiles. The bases are dropped to deep tones, the blob sets keep ONE bright
// hero hue for identity but the rest are muted, and a dark overlay wash (DIM
// below) is composited last so each card reads as a deep lit surface on ink
// rather than a luminous rectangle. Hue identity per card is preserved.
const projects = {
  cutthecrap: { base: '#3a0e1d', blobs: ['#d93a2e', '#2a0712', '#8f1638', '#b3461f', '#5c1320'] },
  edge: { base: '#0a173f', blobs: ['#3360e6', '#070d2e', '#4a37b3', '#127a72', '#0a3a66'] },
  squoosh: { base: '#2c1040', blobs: ['#c22e88', '#1b0828', '#3d1c99', '#7a2b9e', '#4d1d6b'] },
  varro: { base: '#06301f', blobs: ['#14a35a', '#031c11', '#0a6644', '#3a8f63', '#0c4a30'] },
  feedback: { base: '#3d2306', blobs: ['#e0961a', '#241402', '#a84a1c', '#8f6620', '#5c3a0d'] },
}

// Final dark overlay wash (PRO-112): composited above the blobs (below the
// grain) at this opacity so the whole card drops in value toward --ink while
// keeping its hue. Tuned so the regenerated art lands well under the original
// ~70-88 mean luminance.
const DIM = { color: '#08080a', opacity: 0.42 }

// Fixed anchor layout shared across cards: corners-ish + center drift, blobs
// oversized and pushed past the canvas edges so color bleeds to the borders
// (no dark vignette). Deterministic (no Math.random) so reruns reproduce.
const anchors = [
  { cx: -0.05, cy: 0.1, r: 0.55 },
  { cx: 1.05, cy: -0.1, r: 0.5 },
  { cx: 0.9, cy: 1.1, r: 0.55 },
  { cx: 0.1, cy: 1.05, r: 0.5 },
  { cx: 0.55, cy: 0.5, r: 0.45 },
]

function meshSvg({ base, blobs }) {
  const defs = blobs
    .map(
      (color, i) => `
    <radialGradient id="g${i}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${color}" stop-opacity="1"/>
      <stop offset="55%" stop-color="${color}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
    </radialGradient>`,
    )
    .join('')

  const circles = blobs
    .map((_, i) => {
      const a = anchors[i % anchors.length]
      const r = a.r * W
      return `<circle cx="${a.cx * W}" cy="${a.cy * H}" r="${r}" fill="url(#g${i})"/>`
    })
    .join('\n      ')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>${defs}
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.05"/></feComponentTransfer>
      <feComposite operator="over" in2="SourceGraphic"/>
    </filter>
  </defs>
  <rect width="${W}" height="${H}" fill="${base}"/>
  <g>
      ${circles}
  </g>
  <rect width="${W}" height="${H}" fill="${DIM.color}" opacity="${DIM.opacity}"/>
  <rect width="${W}" height="${H}" filter="url(#grain)" opacity="0.5"/>
</svg>`
}

for (const [id, palette] of Object.entries(projects)) {
  const svg = meshSvg(palette)
  const out = path.join(OUT_DIR, `${id}.jpg`)
  await sharp(Buffer.from(svg))
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(out)
  console.log('wrote', out)
}
