// Writes the skill downloads; see index.ts. Kept apart from the module so the
// tests can import it without Nuxt.
import { mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { createZip, type ZipEntry } from './zip'

function listFiles(dir: string): string[] {
  return readdirSync(dir)
    .filter(name => !name.startsWith('.'))
    .sort()
    .flatMap((name) => {
      const path = join(dir, name)
      return statSync(path).isDirectory() ? listFiles(path) : [path]
    })
}

export function buildSkillDownloads(skillsDir: string, outDir: string): string[] {
  rmSync(outDir, { recursive: true, force: true })
  let names: string[] = []
  try {
    names = readdirSync(skillsDir).filter(n => statSync(join(skillsDir, n)).isDirectory()).sort()
  }
  catch {
    return []
  }

  for (const name of names) {
    const root = join(skillsDir, name)
    const files = listFiles(root)
    const entries: ZipEntry[] = [{ name: `${name}/` }]
    for (const file of files) {
      const rel = relative(root, file).split('\\').join('/')
      const data = readFileSync(file)
      entries.push({ name: `${name}/${rel}`, data })
      const target = join(outDir, 'skills', name, rel)
      mkdirSync(dirname(target), { recursive: true })
      writeFileSync(target, data)
    }
    mkdirSync(join(outDir, 'skills'), { recursive: true })
    writeFileSync(join(outDir, 'skills', `${name}.zip`), createZip(entries))
  }
  return names
}
