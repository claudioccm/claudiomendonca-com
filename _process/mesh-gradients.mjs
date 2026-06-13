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
const projects = {
  cutthecrap: { base: '#a82742', blobs: ['#ff4d3d', '#6b1430', '#d92662', '#ffb347', '#ff8a5c'] },
  edge: { base: '#1d3fa8', blobs: ['#2f6bff', '#101b59', '#7b5cff', '#19e3d1', '#00c2ff'] },
  squoosh: { base: '#7a2b9e', blobs: ['#ff3da6', '#36104f', '#5c2bff', '#ff7ad9', '#b14dff'] },
  varro: { base: '#10704a', blobs: ['#19ba66', '#073d24', '#0f8f5f', '#b8f5d0', '#5ee6a8'] },
  feedback: { base: '#b86a16', blobs: ['#ffb01f', '#73400d', '#e85d26', '#ffd966', '#ff7a1f'] },
}

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
