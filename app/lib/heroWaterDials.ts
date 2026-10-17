/**
 * Tuning panel for the hero's ASCII water (HeroAsciiWater.vue), built on DialKit's
 * framework-free adapter (no React/motion runtime). Loaded lazily, only with
 * `?dials`, and only in builds where __HERO_DIALS__ is true (dev and Netlify
 * deploy previews; never production).
 *
 * "Copy values (JSON)" puts a HeroWaterConfig on the clipboard: paste it over
 * HERO_WATER_DEFAULTS in app/lib/asciiWater.ts to make it the new default.
 */
import { createDialKit, createDialRoot } from 'dialkit/vanilla'
import 'dialkit/vanilla/styles.css'
import { HERO_WATER_DEFAULTS, cloneConfig } from './asciiWater'
import type { HeroWaterConfig, TextOrigin } from './asciiWater'

export function mountHeroWaterDials(
  current: HeroWaterConfig,
  apply: (next: HeroWaterConfig) => void,
  stats: { frameMs: number, cells: number, wakes: number, rocks: number },
): () => void {
  const d = HERO_WATER_DEFAULTS
  const c = current
  const root = createDialRoot({
    position: 'top-right',
    theme: document.documentElement.dataset.theme === 'light' ? 'light' : 'dark',
    productionEnabled: true,
  })

  const kit = createDialKit('Hero water', {
    hover: {
      intensity: [c.hover.intensity, 0, 1.5, 0.01],
      radius: [c.hover.radius, 4, 80, 1],
      spacing: [c.hover.spacing, 2, 60, 1],
      falloff: [c.hover.falloff, 0, 4, 0.1],
    },
    click: {
      intensity: [c.click.intensity, 0, 3, 0.01],
      radius: [c.click.radius, 6, 120, 1],
      rings: [c.click.rings, 1, 8, 1],
    },
    text: {
      intensity: [c.text.intensity, 0, 2, 0.01],
      radius: [c.text.radius, 6, 160, 1],
      origin: { type: 'select', options: ['word', 'centre', 'random'], default: c.text.origin },
    },
    water: {
      speed: [c.water.speed, 1, 14, 0.1],
      damping: [c.water.damping, 0, 0.08, 0.001],
      ambient: [c.water.ambient, 0, 2, 0.01],
    },
    calm: {
      strength: [c.calm.strength, 0, 1, 0.01],
      padding: [c.calm.padding, 0, 120, 1],
      feather: [c.calm.feather, 1, 240, 1],
    },
    render: {
      cellSize: [c.render.cellSize, 8, 32, 1],
      spacing: [c.render.spacing, 1, 3, 0.05],
      ramp: { type: 'text', default: c.render.ramp },
      base: [c.render.base, 0, 0.6, 0.01],
      contrast: [c.render.contrast, 0.1, 4, 0.05],
      gamma: [c.render.gamma, 0.3, 3, 0.05],
      opacityMin: [c.render.opacityMin, 0, 1, 0.01],
      opacityMax: [c.render.opacityMax, 0, 1, 0.01],
      fps: [c.render.fps, 10, 60, 1],
    },
    copyJson: { type: 'action', label: 'Copy values (JSON)' },
    reset: { type: 'action', label: 'Reset to code defaults' },
    perf: { type: 'action', label: 'Log frame cost' },
  }, {
    id: 'hero-water',
    onAction: (action) => {
      if (action === 'copyJson') {
        navigator.clipboard?.writeText(JSON.stringify(toConfig(kit.getValues()), null, 2))
      }
      else if (action === 'reset') {
        kit.setValues(cloneConfig(d))
      }
      else if (action === 'perf') {
        console.info(`[hero water] ${stats.frameMs.toFixed(2)} ms/frame, ${stats.cells} glyphs drawn`)
      }
    },
  })

  const unsubscribe = kit.subscribe(values => apply(toConfig(values)))

  return () => {
    unsubscribe()
    kit.destroy()
    root.destroy()
  }
}

type DialValues = {
  hover: HeroWaterConfig['hover']
  click: HeroWaterConfig['click']
  text: { intensity: number, radius: number, origin: string }
  water: HeroWaterConfig['water']
  calm: HeroWaterConfig['calm']
  render: HeroWaterConfig['render']
}

function toConfig(v: DialValues): HeroWaterConfig {
  return {
    hover: { ...v.hover },
    click: { ...v.click, rings: Math.round(v.click.rings) },
    text: { ...v.text, origin: v.text.origin as TextOrigin },
    water: { ...v.water },
    calm: { ...v.calm },
    render: { ...v.render },
  }
}
