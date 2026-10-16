import { describe, it, expect } from 'vitest'
import {
  HERO_WATER_DEFAULTS,
  WaterSurface,
  calmMask,
  cloneConfig,
  levelFor,
  makeEmitter,
  tickEmitter,
  waveCoefficients,
} from '~/lib/asciiWater'

/**
 * app/lib/asciiWater.ts · the home hero's ASCII water (2026-10-16).
 */
describe('waveCoefficients', () => {
  it('splits fast waves into substeps that stay inside the stability limit', () => {
    for (const speed of [1, 4.5, 14, 40]) {
      const { k, substeps } = waveCoefficients(speed, 8)
      expect(substeps).toBeGreaterThanOrEqual(1)
      expect(k).toBeLessThanOrEqual(0.6 + 1e-9)
      expect(k * substeps * substeps).toBeCloseTo((speed / 8) ** 2)
    }
  })
})

describe('levelFor', () => {
  it('maps troughs to the blank glyph, rest to the low end and crests to the top', () => {
    const r = HERO_WATER_DEFAULTS.render
    const len = r.ramp.length
    expect(levelFor(-1, len, r.base, r.contrast, r.gamma)).toBe(0)
    expect(levelFor(0, len, r.base, r.contrast, r.gamma)).toBeLessThanOrEqual(2)
    expect(levelFor(5, len, r.base, r.contrast, r.gamma)).toBe(len - 1)
  })
})

describe('WaterSurface', () => {
  it('spreads a drop outwards as a ring and stays bounded', () => {
    const s = new WaterSurface(60, 60)
    s.disturb(30, 30, 3, 3, -1)
    const { k, substeps } = waveCoefficients(4.5, 8)
    for (let i = 0; i < 20 * substeps; i++) s.step(k, 0.01 / substeps)
    const centre = Math.abs(s.cur[30 * 60 + 30]!)
    const ring = Math.max(...Array.from({ length: 25 }, (_, d) => Math.abs(s.cur[30 * 60 + 30 + d]!)))
    expect(ring).toBeGreaterThan(centre)
    expect(s.peak()).toBeLessThan(1)
  })

  it('rings stay round: equal reach along the axis and the diagonal', () => {
    const s = new WaterSurface(81, 81)
    s.disturb(40, 40, 3, 3, -1)
    for (let i = 0; i < 30; i++) s.step(0.4, 0)
    const at = (x: number, y: number) => Math.abs(s.cur[y * 81 + x]!)
    const reach = (dx: number, dy: number) => {
      let best = 0
      let bestD = 0
      for (let t = 0; t < 38; t++) {
        const v = at(40 + Math.round(dx * t), 40 + Math.round(dy * t))
        if (v > best) {
          best = v
          bestD = t * Math.hypot(dx, dy)
        }
      }
      return bestD
    }
    expect(Math.abs(reach(1, 0) - reach(Math.SQRT1_2, Math.SQRT1_2))).toBeLessThan(3)
  })

  it('damping brings the surface back to rest', () => {
    const s = new WaterSurface(40, 40)
    s.disturb(20, 20, 3, 3, -1)
    for (let i = 0; i < 2000; i++) s.step(0.4, 0.01)
    expect(s.peak()).toBeLessThan(0.004)
  })
})

describe('emitters', () => {
  it('a rock sends out one ring per cycle, then is spent', () => {
    const s = new WaterSurface(80, 80)
    const e = makeEmitter(320, 320, 30, 1.6, 3, 4.5)
    let ticks = 0
    while (tickEmitter(e, s, 8, 8)) ticks++
    expect(ticks).toBe(3 * e.period)
    expect(s.peak()).toBeGreaterThan(0)
  })
})

describe('HERO_WATER_DEFAULTS', () => {
  it('round-trips through JSON (what the dial panel copies)', () => {
    expect(JSON.parse(JSON.stringify(HERO_WATER_DEFAULTS))).toEqual(cloneConfig(HERO_WATER_DEFAULTS))
  })
})

describe('calmMask', () => {
  it('is 1 inside the padded box and fades to 0 across the feather', () => {
    const m = calmMask(40, 20, 10, 20, [[100, 100, 200, 200]], 10, 40)
    expect(m[7 * 40 + 15]).toBe(1) // (155, 150) inside
    expect(m[7 * 40 + 21]).toBeGreaterThan(0) // (215, 150): 5 px past the padding
    expect(m[7 * 40 + 21]).toBeLessThan(1)
    expect(m[7 * 40 + 30]).toBe(0) // (305, 150): beyond the feather
  })
})
