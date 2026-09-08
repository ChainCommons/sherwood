/**
 * Architectural import invariants (plan 01 INV-013, plan 22).
 *
 * The generic engines must stay generic. If `event-engine` may import
 * `adapters/tezos`, Tezos assumptions leak into chain-neutral normalization;
 * if `rules-engine` may import `jurisdictions/france`, French doctrine becomes
 * `if (france)` instead of pack data. Both are the failure mode this project
 * exists to avoid, so they are checked mechanically rather than by review.
 *
 * INV-011 is enforced the same way: `ai` must not import `rules-engine` as a
 * writer into the approved rule set.
 */
import { join } from 'node:path'
import type { Issue, SyncCheck } from '../types.ts'
import { error } from '../types.ts'
import { readText, rel, walk } from '../fs-utils.ts'

interface Rule {
  /** Package directory under `packages/` or `adapters/`. */
  readonly pkg: string
  /** Import specifiers this package must never reach for. */
  readonly forbidden: readonly string[]
  readonly why: string
}

export const IMPORT_RULES: readonly Rule[] = [
  {
    pkg: 'packages/event-engine',
    forbidden: ['adapters/tezos', '@octc/adapter-tezos', 'jurisdictions/france', '@octc/jurisdiction-france'],
    why: 'the event engine is chain- and jurisdiction-neutral (INV-013)'
  },
  {
    pkg: 'packages/rules-engine',
    forbidden: ['adapters/tezos', '@octc/adapter-tezos', 'jurisdictions/france', '@octc/jurisdiction-france'],
    why: 'jurisdiction packs are data directories, not branches in the engine (INV-013)'
  },
  {
    pkg: 'packages/valuation',
    forbidden: ['jurisdictions/france', '@octc/jurisdiction-france', '@octc/lots'],
    why: 'valuation is standalone and knows nothing about lots or law'
  },
  {
    pkg: 'packages/lots',
    forbidden: ['jurisdictions/france', '@octc/jurisdiction-france'],
    why: 'lot matching records facts; jurisdictions decide what they mean'
  },
  {
    pkg: 'packages/core',
    forbidden: ['adapters/', '@octc/adapter-', 'jurisdictions/', 'node:http', 'node:https'],
    why: 'core holds primitives only — no chain HTTP, no jurisdiction knowledge'
  },
  {
    pkg: 'packages/ai',
    forbidden: ['@octc/rules-engine', 'packages/rules-engine'],
    why: 'the AI package must not write into the approved rule set (INV-011)'
  }
]

const IMPORT_RE = /(?:^|\n)\s*(?:import|export)[^'"\n]*?from\s*['"]([^'"]+)['"]|require\(\s*['"]([^'"]+)['"]\s*\)|import\(\s*['"]([^'"]+)['"]\s*\)/g

const specifiersIn = (source: string): string[] => {
  const out: string[] = []
  for (const m of source.matchAll(IMPORT_RE)) {
    const spec = m[1] ?? m[2] ?? m[3]
    if (spec !== undefined) out.push(spec)
  }
  return out
}

export const imports: SyncCheck = {
  name: 'imports',
  run({ root }): Issue[] {
    const issues: Issue[] = []

    for (const rule of IMPORT_RULES) {
      const dir = join(root, rule.pkg)
      const files = walk(dir, (p) => /\.(ts|tsx|mts|js|mjs)$/.test(p) && !p.endsWith('.d.ts'))
      for (const file of files) {
        const path = rel(root, file)
        for (const spec of specifiersIn(readText(file))) {
          const hit = rule.forbidden.find((f) => spec === f || spec.startsWith(f) || spec.includes('/' + f))
          if (hit !== undefined) {
            issues.push(
              error('imports', path, `${rule.pkg} must not import "${spec}" (${hit}): ${rule.why}`)
            )
          }
        }
      }

      // A dependency declared in package.json is a violation even before any
      // source file uses it.
      const manifest = join(dir, 'package.json')
      try {
        const pkg = JSON.parse(readText(manifest)) as {
          dependencies?: Record<string, string>
          peerDependencies?: Record<string, string>
        }
        const declared = { ...pkg.dependencies, ...pkg.peerDependencies }
        for (const name of Object.keys(declared)) {
          const hit = rule.forbidden.find((f) => name === f || name.startsWith(f))
          if (hit !== undefined) {
            issues.push(
              error('imports', rel(root, manifest), `${rule.pkg} must not depend on "${name}": ${rule.why}`)
            )
          }
        }
      } catch {
        // Package not scaffolded yet: nothing to check.
      }
    }
    return issues
  }
}
