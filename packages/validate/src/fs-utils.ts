import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { parse as parseYaml } from 'yaml'

const IGNORED_DIRS = new Set(['node_modules', '.git', 'dist', '.turbo', 'coverage', '.next'])

/** Walk the tree, skipping build output and VCS metadata. */
export function walk(dir: string, keep: (path: string) => boolean): string[] {
  const out: string[] = []
  const visit = (current: string): void => {
    let entries: string[]
    try {
      entries = readdirSync(current)
    } catch {
      return
    }
    for (const name of entries) {
      if (IGNORED_DIRS.has(name)) continue
      const full = join(current, name)
      const st = statSync(full)
      if (st.isDirectory()) visit(full)
      else if (keep(full)) out.push(full)
    }
  }
  visit(dir)
  return out.sort()
}

export const rel = (root: string, path: string): string =>
  relative(root, path).split(sep).join('/')

export const readText = (path: string): string => readFileSync(path, 'utf8')

export const readJson = (path: string): unknown => JSON.parse(readText(path))

/** Data files may be YAML or JSON; knowledge packs are authored as YAML. */
export function readData(path: string): unknown {
  return path.endsWith('.json') ? readJson(path) : parseYaml(readText(path))
}

export const isDataFile = (path: string): boolean =>
  /\.(ya?ml|json)$/.test(path) && !path.endsWith('.schema.json')
