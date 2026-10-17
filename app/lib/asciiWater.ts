/**
 * ASCII water surface for the home hero (HeroAsciiWater.vue).
 *
 * A damped 2D wave equation on a grid of square cells, one glyph wide; a glyph
 * is about two cells tall, so each character averages the cells under it and its
 * height picks a character from the ramp (troughs blank, crests dense). Three
 * sources disturb the one surface: a text change (medium), the pointer as a
 * stick dragged through the water (low), and a click as a rock dropped in a lake
 * (high). Pure TS with no DOM, so the simulation is unit-testable.
 *
 * Tuning: open the homepage with `?dials` on dev or a deploy preview, tune, press
 * "Copy values (JSON)" and paste the result over HERO_WATER_DEFAULTS below.
 */

export type TextOrigin = 'word' | 'centre' | 'random'

export interface HeroWaterConfig {
  /** Pointer move: a stick dragged across the surface. */
  hover: {
    /** Push per emission (0 = no wake). */
    intensity: number
    /** Radius of the stick's footprint, px. */
    radius: number
    /** Distance the pointer travels between emissions, px (lower = denser wake). */
    spacing: number
    /** Footprint edge: 0 = flat disc, higher = sharper centre. */
    falloff: number
  }
  /** Click / tap: a rock dropped in a lake. */
  click: {
    intensity: number
    /** Radius of the splash, px. */
    radius: number
    /** How many rings the splash sends out. */
    rings: number
  }
  /** The typewriter swapping its word. */
  text: {
    intensity: number
    radius: number
    /** Where the ripple starts: the changing word, the headline centre, or a random point in the headline. */
    origin: TextOrigin
  }
  water: {
    /** Wave speed, px per 60 Hz tick. */
    speed: number
    /** Energy lost per tick (0 = rings never fade). */
    damping: number
    /** Raindrops at rest (0 = still water). */
    ambient: number
  }
  /** Quieter water behind the hero copy so the text stays readable. */
  calm: {
    /** 0 = no change, 1 = flat and faint behind the text. */
    strength: number
    /** Extra room around the text, px. */
    padding: number
    /** Soft edge width, px. */
    feather: number
  }
  render: {
    /** Font size of the glyphs, px. */
    cellSize: number
    /** Grid pitch as a multiple of the glyph box (1 = tight, 2 = twice the room). */
    spacing: number
    /** Characters from flat/low to high. A leading space keeps troughs blank. */
    ramp: string
    /** Surface level at rest, 0..1 along the ramp. */
    base: number
    /** How far one unit of height moves along the ramp. */
    contrast: number
    /** Ramp curve: <1 lifts the low end, >1 keeps only crests dense. */
    gamma: number
    /** Glyph opacity at the bottom and top of the ramp. Equal values leave all contrast to the characters. */
    opacityMin: number
    opacityMax: number
    /** Frame cap (the simulation itself always ticks at 60 Hz). */
    fps: number
  }
}

export const HERO_WATER_DEFAULTS: HeroWaterConfig = {
  hover: { intensity: 0.45, radius: 18, spacing: 9, falloff: 1.5 },
  click: { intensity: 2.2, radius: 36, rings: 3 },
  text: { intensity: 1.44, radius: 34, origin: 'word' },
  water: { speed: 3.6, damping: 0.01, ambient: 0.15 },
  calm: { strength: 0.75, padding: 12, feather: 56 },
  render: {
    cellSize: 13,
    spacing: 1.9,
    ramp: ' .,:;~=+*xoX#%&@',
    base: 0.12,
    contrast: 1.4,
    gamma: 1.15,
    opacityMin: 0.3,
    opacityMax: 0.5,
    fps: 60,
  },
}

export function cloneConfig(c: HeroWaterConfig): HeroWaterConfig {
  return JSON.parse(JSON.stringify(c)) as HeroWaterConfig
}

/**
 * Wave coefficient k = (c·dt/h)² for one tick on square cells of `cell` px,
 * split into substeps so the explicit scheme stays stable (the 9-point stencil
 * below holds while k <= 0.75; keep a margin).
 */
export function waveCoefficients(speed: number, cell: number) {
  const k = (speed / cell) ** 2
  const substeps = Math.max(1, Math.ceil(Math.sqrt(k / 0.6)))
  return { k: k / (substeps * substeps), substeps }
}

/** Ramp index for a surface height. */
export function levelFor(h: number, rampLen: number, base: number, contrast: number, gamma: number): number {
  let t = base + contrast * h
  if (t <= 0) return 0
  if (t > 1) t = 1
  if (gamma !== 1) t = t ** gamma
  return Math.round(t * (rampLen - 1))
}

/** Cells along each edge that soak up waves instead of reflecting them (a lake, not a pool). */
const SPONGE = 6

export class WaterSurface {
  cols = 0
  rows = 0
  cur = new Float32Array(0)
  prev = new Float32Array(0)
  private sponge = new Float32Array(0)

  constructor(cols: number, rows: number) {
    this.resize(cols, rows)
  }

  resize(cols: number, rows: number) {
    this.cols = Math.max(3, cols | 0)
    this.rows = Math.max(3, rows | 0)
    const n = this.cols * this.rows
    this.cur = new Float32Array(n)
    this.prev = new Float32Array(n)
    this.sponge = new Float32Array(n)
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const edge = Math.min(x, y, this.cols - 1 - x, this.rows - 1 - y)
        const s = edge < SPONGE ? (SPONGE - edge) / SPONGE : 0
        this.sponge[y * this.cols + x] = s * s * 0.12
      }
    }
  }

  clear() {
    this.cur.fill(0)
    this.prev.fill(0)
  }

  /**
   * Advance one substep of the damped wave equation. The isotropic 9-point
   * Laplacian keeps rings round (the 5-point one squares them off). `next`
   * overwrites `prev` in place, then the buffers swap. Border cells stay at 0.
   */
  step(k: number, damping: number) {
    const { cols, rows, cur, prev, sponge } = this
    const k6 = k / 6
    for (let y = 1; y < rows - 1; y++) {
      const row = y * cols
      for (let x = 1; x < cols - 1; x++) {
        const i = row + x
        const up = i - cols
        const dn = i + cols
        const lap = 4 * (cur[i - 1]! + cur[i + 1]! + cur[up]! + cur[dn]!)
          + cur[up - 1]! + cur[up + 1]! + cur[dn - 1]! + cur[dn + 1]!
          - 20 * cur[i]!
        const next = 2 * cur[i]! - prev[i]! + k6 * lap
        prev[i] = next * (1 - damping - sponge[i]!)
      }
    }
    this.prev = cur
    this.cur = prev
  }

  /**
   * Add `amount` over an elliptical footprint centred on cell (cx, cy) with
   * radii (rx, ry) in cells. Profile: (½ + ½·cos(πd))^falloff.
   */
  disturb(cx: number, cy: number, rx: number, ry: number, amount: number, falloff = 1) {
    const { cols, rows, cur } = this
    rx = Math.max(rx, 0.75)
    ry = Math.max(ry, 0.75)
    const x0 = Math.max(1, Math.floor(cx - rx))
    const x1 = Math.min(cols - 2, Math.ceil(cx + rx))
    const y0 = Math.max(1, Math.floor(cy - ry))
    const y1 = Math.min(rows - 2, Math.ceil(cy + ry))
    for (let y = y0; y <= y1; y++) {
      const dy = (y - cy) / ry
      for (let x = x0; x <= x1; x++) {
        const dx = (x - cx) / rx
        const d = Math.sqrt(dx * dx + dy * dy)
        if (d >= 1) continue
        let w = 0.5 + 0.5 * Math.cos(Math.PI * d)
        if (falloff !== 1) w = falloff <= 0 ? 1 : w ** falloff
        cur[y * cols + x]! += amount * w
      }
    }
  }

  /** Largest |height|; the render loop sleeps when this is ~0 and nothing else moves. */
  peak(): number {
    let m = 0
    const a = this.cur
    for (let i = 0; i < a.length; i++) {
      const v = a[i]!
      if (v > m) m = v
      else if (-v > m) m = -v
    }
    return m
  }
}

/**
 * A source that keeps pushing for a few cycles (a rock, a text change): each
 * cycle sends out one ring. Ticks at 60 Hz.
 */
export interface Emitter {
  x: number
  y: number
  radius: number
  amp: number
  rings: number
  period: number
  age: number
}

export function makeEmitter(x: number, y: number, radius: number, amp: number, rings: number, speed: number): Emitter {
  // One ring per cycle; its wavelength is about twice the splash radius.
  const period = Math.max(6, Math.round((2 * radius) / Math.max(speed, 0.5)))
  return { x, y, radius, amp, rings: Math.max(1, Math.round(rings)), period, age: 0 }
}

/** Push this tick's contribution into the surface (cells of sx × sy px). Returns false once spent. */
export function tickEmitter(e: Emitter, surface: WaterSurface, sx: number, sy: number): boolean {
  const total = e.rings * e.period
  if (e.age >= total) return false
  // Rock goes in first (a dip), then the surface rebounds; the envelope fades
  // so the first ring is the strongest.
  const phase = (2 * Math.PI * e.age) / e.period
  const env = 1 - e.age / total
  const push = -Math.sin(phase) * env * e.amp * (0.9 / e.period) * 6
  surface.disturb(e.x / sx, e.y / sy, e.radius / sx, e.radius / sy, push, 1)
  e.age++
  return true
}

/** A box in canvas px (left, top, right, bottom). */
export type Box = [number, number, number, number]

/**
 * Calm-zone weight per glyph: 1 inside any (padded) box, easing to 0 across
 * `feather` px outside it.
 */
export function calmMask(
  cols: number, rows: number, cellW: number, cellH: number,
  boxes: Box[], padding: number, feather: number,
): Float32Array {
  const m = new Float32Array(cols * rows)
  if (!boxes.length) return m
  const f = Math.max(1, feather)
  for (let y = 0; y < rows; y++) {
    const py = (y + 0.5) * cellH
    for (let x = 0; x < cols; x++) {
      const px = (x + 0.5) * cellW
      let best = 0
      for (const [l, t, r, b] of boxes) {
        const dx = Math.max(l - padding - px, 0, px - r - padding)
        const dy = Math.max(t - padding - py, 0, py - b - padding)
        const d = Math.hypot(dx, dy)
        if (d >= f) continue
        const u = 1 - d / f
        const w = u * u * (3 - 2 * u)
        if (w > best) best = w
      }
      m[y * cols + x] = best
    }
  }
  return m
}
