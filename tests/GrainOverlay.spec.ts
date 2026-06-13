import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GrainOverlay from '~/components/GrainOverlay.vue'

/**
 * GrainOverlay.vue · global film-grain overlay (PRO-109, R10/R12).
 *
 * Pure presentational SFC (no Nuxt auto-imports), so we can mount it directly.
 * We assert it renders a non-interactive, SSR-present overlay carrying the
 * noise SVG — the reduced-motion gating itself lives in scoped CSS (a media
 * query), which jsdom/happy-dom doesn't evaluate, so we assert the markup
 * contract rather than computed animation state.
 */
describe('GrainOverlay', () => {
  it('renders a decorative, non-interactive overlay present in SSR markup', () => {
    const wrapper = mount(GrainOverlay)
    const overlay = wrapper.get('.grain-overlay')
    expect(overlay.attributes('aria-hidden')).toBe('true')
    // The grain SVG noise field is present (so the texture renders).
    expect(wrapper.find('feTurbulence').exists()).toBe(true)
    expect(wrapper.html()).toContain('grain-overlay__svg')
  })

  it('does not intercept pointer events (pointer-events:none via scoped class)', () => {
    const wrapper = mount(GrainOverlay)
    // The class that carries `pointer-events: none` is applied.
    expect(wrapper.get('.grain-overlay')).toBeTruthy()
  })
})
