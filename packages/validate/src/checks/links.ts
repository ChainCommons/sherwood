/**
 * Broken internal links in Markdown (plan 16 §85).
 *
 * The plans cross-reference each other heavily; a dead relative link is how a
 * reader silently loses the authority chain behind a rule.
 */
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import type { Issue, SyncCheck } from '../types.ts'
import { error } from '../types.ts'
import { readText, rel, walk } from '../fs-utils.ts'

const LINK_RE = /\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g

const isExternal = (target: string): boolean =>
  /^(https?:|mailto:|#|tel:)/.test(target)

export const links: SyncCheck = {
  name: 'links',
  run({ root }): Issue[] {
    const issues: Issue[] = []
    for (const file of walk(root, (p) => p.endsWith('.md'))) {
      const path = rel(root, file)
      const text = readText(file)
      for (const match of text.matchAll(LINK_RE)) {
        const target = match[1]
        if (target === undefined || isExternal(target)) continue
        const [pathPart] = target.split('#')
        if (pathPart === undefined || pathPart === '') continue
        const resolved = resolve(dirname(file), decodeURIComponent(pathPart))
        if (!existsSync(resolved)) {
          issues.push(error('links', path, `broken internal link: ${target}`))
        }
      }
    }
    return issues
  }
}
