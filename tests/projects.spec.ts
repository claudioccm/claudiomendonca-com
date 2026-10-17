import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'
import { projectContentPath, projectRoute } from '~/utils/projects'

/**
 * Project pages (/refs, 2026-10-17): route mapping and the install prompt's
 * must-haves (spec-ccmlabs-refs-item.md). AGENTS.md in the refs repo stays the
 * source of truth; the prompt only has to point at it without guessing.
 */
describe('project routes', () => {
  it('serves content/projects/<slug>.md at /<slug>', () => {
    expect(projectRoute('/projects/refs')).toBe('/refs')
    expect(projectContentPath('/refs')).toBe('/projects/refs')
    expect(projectContentPath('/refs/')).toBe('/projects/refs')
  })
})

describe('_refs install prompt', () => {
  const file = readFileSync('content/projects/refs.md', 'utf8')
  const text = file.split(/\n {2}text: \|-\n/)[1]!.split(/\ncta:/)[0]!

  it('names the repo and defers to AGENTS.md', () => {
    expect(text).toContain('https://github.com/ccmdesign/refs')
    expect(text).toContain('AGENTS.md')
  })

  it('covers prerequisites, the folder question, doctor and the URL', () => {
    expect(text).toContain('Node 22.18')
    expect(text).toContain('corepack enable')
    expect(text).toMatch(/Ask me which folder/)
    expect(text).toContain('pnpm refs doctor')
    expect(text).toContain('http://localhost:3210')
  })

  it('asks before optional steps and never invents keys', () => {
    expect(text).toMatch(/Ask me before anything optional/)
    expect(text).toMatch(/Never invent an API key/)
  })
})
