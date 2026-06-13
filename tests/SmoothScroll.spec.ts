import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'

/**
 * SmoothScroll.vue · layout provider seam (PRO-109, R10/R13).
 *
 * The SFC calls the Nuxt auto-import `useNuxtApp()` in <script setup>. In the
 * pure-Vue test harness that global doesn't exist, so we stub it to return a
 * fake app exposing `$lenis`. We then assert the component renders its default
 * slot (content present with/without JS) and passes the lenis instance through
 * as a slot prop.
 */

const fakeLenis = { scrollTo: vi.fn() }

beforeEach(() => {
  vi.stubGlobal('useNuxtApp', () => ({ $lenis: fakeLenis }))
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.resetModules()
})

describe('SmoothScroll', () => {
  it('renders its default slot content', async () => {
    const SmoothScroll = (await import('~/components/SmoothScroll.vue')).default
    const wrapper = mount(SmoothScroll, {
      slots: { default: '<p>page content</p>' },
    })
    expect(wrapper.text()).toContain('page content')
  })

  it('exposes the provided lenis instance as a slot prop', async () => {
    const SmoothScroll = (await import('~/components/SmoothScroll.vue')).default
    let received: unknown
    mount(SmoothScroll, {
      slots: {
        default: (props: { lenis: unknown }) => {
          received = props.lenis
          return 'x'
        },
      },
    })
    expect(received).toBe(fakeLenis)
  })
})
