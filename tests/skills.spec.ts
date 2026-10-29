import { inflateRawSync } from 'node:zlib'
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { crc32, createZip } from '../modules/skill-downloads/zip'
import { buildSkillDownloads } from '../modules/skill-downloads/build'
import { skillFiles, trackSkillDownload } from '~/utils/skills'

/**
 * Skill downloads (2026-10-29): the build-time zip and the GA4 event.
 */

// Read entries back through the central directory, the way unzip tools do.
function readZip(zip: Buffer): { name: string, data: Buffer, crc: number }[] {
  const end = zip.lastIndexOf(Buffer.from([0x50, 0x4B, 0x05, 0x06]))
  const count = zip.readUInt16LE(end + 10)
  let ptr = zip.readUInt32LE(end + 16)
  const out = []
  for (let i = 0; i < count; i++) {
    expect(zip.readUInt32LE(ptr)).toBe(0x02014B50)
    const method = zip.readUInt16LE(ptr + 10)
    const crc = zip.readUInt32LE(ptr + 16)
    const size = zip.readUInt32LE(ptr + 20)
    const nameLen = zip.readUInt16LE(ptr + 28)
    const local = zip.readUInt32LE(ptr + 42)
    const name = zip.subarray(ptr + 46, ptr + 46 + nameLen).toString('utf8')
    const localNameLen = zip.readUInt16LE(local + 26)
    const body = zip.subarray(local + 30 + localNameLen, local + 30 + localNameLen + size)
    out.push({ name, crc, data: method === 8 ? inflateRawSync(body) : Buffer.from(body) })
    ptr += 46 + nameLen
  }
  return out
}

describe('crc32', () => {
  it('matches the standard check value', () => {
    expect(crc32(Buffer.from('123456789'))).toBe(0xCBF43926)
  })
})

describe('createZip', () => {
  it('round-trips a folder with SKILL.md', () => {
    const text = Buffer.from('---\nname: demo\n---\n\n# Demo — “quotes” included\n'.repeat(20))
    const zip = createZip([{ name: 'demo/' }, { name: 'demo/SKILL.md', data: text }])
    const entries = readZip(zip)
    expect(entries.map(e => e.name)).toEqual(['demo/', 'demo/SKILL.md'])
    expect(entries[1]!.data.equals(text)).toBe(true)
    expect(entries[1]!.crc).toBe(crc32(text))
  })

  it('is byte-for-byte stable across builds', () => {
    const entries = [{ name: 'a/' }, { name: 'a/SKILL.md', data: Buffer.from('hello') }]
    expect(createZip(entries).equals(createZip(entries))).toBe(true)
  })
})

describe('buildSkillDownloads', () => {
  it('writes <name>.zip and the raw files for each skill folder', () => {
    const root = mkdtempSync(join(tmpdir(), 'skills-'))
    mkdirSync(join(root, 'in', 'demo'), { recursive: true })
    writeFileSync(join(root, 'in', 'demo', 'SKILL.md'), '# Demo\n')
    expect(buildSkillDownloads(join(root, 'in'), join(root, 'out'))).toEqual(['demo'])
    expect(readFileSync(join(root, 'out', 'skills', 'demo', 'SKILL.md'), 'utf8')).toBe('# Demo\n')
    const entries = readZip(readFileSync(join(root, 'out', 'skills', 'demo.zip')))
    expect(entries.map(e => e.name)).toEqual(['demo/', 'demo/SKILL.md'])
  })

  it('ships the repo copy of thinking-partner unchanged', () => {
    const out = mkdtempSync(join(tmpdir(), 'skills-out-'))
    buildSkillDownloads(join(__dirname, '..', 'skills'), out)
    const source = readFileSync(join(__dirname, '..', 'skills', 'thinking-partner', 'SKILL.md'))
    const zip = readZip(readFileSync(join(out, 'skills', 'thinking-partner.zip')))
    expect(zip.find(e => e.name === 'thinking-partner/SKILL.md')!.data.equals(source)).toBe(true)
  })

  it('returns nothing when there is no skills folder', () => {
    const root = mkdtempSync(join(tmpdir(), 'skills-none-'))
    expect(buildSkillDownloads(join(root, 'missing'), join(root, 'out'))).toEqual([])
    expect(existsSync(join(root, 'out', 'skills'))).toBe(false)
  })
})

describe('skillFiles', () => {
  it('points at the files the module writes', () => {
    expect(skillFiles('thinking-partner')).toEqual({
      zip: '/skills/thinking-partner.zip',
      md: '/skills/thinking-partner/SKILL.md',
    })
  })
})

describe('trackSkillDownload', () => {
  afterEach(() => {
    delete (window as unknown as { gtag?: unknown }).gtag
  })

  it('sends skill_download with the skill and format', () => {
    const gtag = vi.fn()
    ;(window as unknown as { gtag: typeof gtag }).gtag = gtag
    trackSkillDownload('thinking-partner', 'zip')
    expect(gtag).toHaveBeenCalledWith('event', 'skill_download', { skill: 'thinking-partner', format: 'zip' })
  })

  it('does nothing when gtag is blocked', () => {
    expect(() => trackSkillDownload('thinking-partner', 'md')).not.toThrow()
  })

  it('swallows a gtag that throws', () => {
    ;(window as unknown as { gtag: () => void }).gtag = () => {
      throw new Error('broken')
    }
    expect(() => trackSkillDownload('thinking-partner', 'view')).not.toThrow()
  })
})
