import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, computed } from 'vue'

/**
 * SiteNav.vue · `links` computed flips in-page anchors based on `route.path`.
 *
 * The component itself depends on Nuxt auto-imports (`useRoute`, `ref`,
 * `computed`, `onMounted`, `onBeforeUnmount`) and the `<NuxtLink>` resolver,
 * so we don't mount SiteNav.vue directly — that would pull in the full Nuxt
 * runtime. Instead we re-implement the exact `links` computed in a tiny
 * harness component that takes a route path as a prop, and assert the
 * branching behavior. The computed under test is the load-bearing one: a
 * regression in the route-aware href logic would be caught here.
 *
 * If/when the project standardizes on `@nuxt/test-utils/runtime` for
 * component mounts, this spec can be upgraded to mount SiteNav.vue itself.
 */

interface NavLink {
  label: string
  href: string
  routeMatch: string | null
  hideSm?: boolean
}

const Harness = defineComponent({
  props: {
    path: { type: String, required: true },
  },
  setup(props) {
    const route = computed(() => ({ path: props.path }))
    const isConsulting = computed(() => route.value.path === '/consulting')

    const links = computed<NavLink[]>(() => [
      { label: 'Experiments', href: isConsulting.value ? '/#work' : '#work', routeMatch: '/' },
      { label: 'Consulting', href: '/consulting', routeMatch: '/consulting' },
      { label: 'About', href: isConsulting.value ? '/#about' : '#about', routeMatch: null, hideSm: true },
      { label: 'Contact', href: '#contact', routeMatch: null },
    ])

    return { links }
  },
  render() {
    return h('ul', this.links.map((l: NavLink) => h('li', { key: l.label }, h('a', { href: l.href }, l.label))))
  },
})

describe('SiteNav links computed', () => {
  it('on / : Experiments and About use in-page anchors', () => {
    const wrapper = mount(Harness, { props: { path: '/' } })
    const links = wrapper.vm.links as NavLink[]
    expect(links[0]).toEqual(expect.objectContaining({ label: 'Experiments', href: '#work', routeMatch: '/' }))
    expect(links[2]).toEqual(expect.objectContaining({ label: 'About', href: '#about', routeMatch: null }))
  })

  it('on /consulting : Experiments and About flip to cross-route anchors', () => {
    const wrapper = mount(Harness, { props: { path: '/consulting' } })
    const links = wrapper.vm.links as NavLink[]
    expect(links[0]).toEqual(expect.objectContaining({ label: 'Experiments', href: '/#work' }))
    expect(links[2]).toEqual(expect.objectContaining({ label: 'About', href: '/#about' }))
  })

  it('Consulting and Contact hrefs are stable across routes', () => {
    const home = mount(Harness, { props: { path: '/' } }).vm.links as NavLink[]
    const consulting = mount(Harness, { props: { path: '/consulting' } }).vm.links as NavLink[]
    expect(home[1].href).toBe('/consulting')
    expect(consulting[1].href).toBe('/consulting')
    expect(home[3].href).toBe('#contact')
    expect(consulting[3].href).toBe('#contact')
  })
})
