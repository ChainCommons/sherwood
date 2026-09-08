/**
 * The engine-purity guard (INV-013, INV-011).
 *
 * `packages/event-engine` and `packages/rules-engine` do not exist yet, so a
 * check that merely passes today proves nothing. These tests build throwaway
 * package trees and assert the check actually rejects the imports it is
 * supposed to reject — the guard is verified before the code it guards is
 * written.
 */
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { imports, IMPORT_RULES } from '../../packages/validate/src/checks/imports.ts'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

let sandbox: string

const write = (relPath: string, contents: string): void => {
  const full = join(sandbox, relPath)
  mkdirSync(dirname(full), { recursive: true })
  writeFileSync(full, contents)
}

const run = (): string[] => imports.run({ root: sandbox }).map((i) => i.message)

beforeEach(() => {
  sandbox = mkdtempSync(join(tmpdir(), 'octc-imports-'))
})
afterEach(() => {
  rmSync(sandbox, { recursive: true, force: true })
})

describe('engine purity', () => {
  it('rejects the event engine importing a Tezos adapter', () => {
    write(
      'packages/event-engine/src/normalize.ts',
      "import { decode } from '@octc/adapter-tezos'\nexport const normalize = decode\n"
    )
    const messages = run()
    expect(messages.length).toBe(1)
    expect(messages[0]).toMatch(/event-engine must not import "@octc\/adapter-tezos"/)
    expect(messages[0]).toMatch(/chain- and jurisdiction-neutral/)
  })

  it('rejects the rules engine importing a France pack', () => {
    write(
      'packages/rules-engine/src/evaluate.ts',
      "import rules from '../../../jurisdictions/france/rules/index.ts'\nexport default rules\n"
    )
    expect(run()[0]).toMatch(/rules-engine must not import/)
  })

  it('catches a relative path into an adapter, not just a package name', () => {
    write(
      'packages/event-engine/src/decode.ts',
      "import { tz } from '../../adapters/tezos/src/index.ts'\nexport default tz\n"
    )
    expect(run()[0]).toMatch(/must not import/)
  })

  it('catches require() and dynamic import()', () => {
    write('packages/rules-engine/src/a.ts', "const f = require('@octc/adapter-tezos')\nexport default f\n")
    write('packages/rules-engine/src/b.ts', "export const load = () => import('jurisdictions/france')\n")
    expect(run().length).toBe(2)
  })

  it('rejects a forbidden dependency declared in package.json alone', () => {
    // Declaring the dependency is already a boundary violation, even before
    // any file imports it.
    write(
      'packages/event-engine/package.json',
      JSON.stringify({ name: '@octc/event-engine', dependencies: { '@octc/adapter-tezos': 'workspace:*' } })
    )
    expect(run()[0]).toMatch(/must not depend on "@octc\/adapter-tezos"/)
  })

  it('stops the AI package writing into the approved rule set (INV-011)', () => {
    write('packages/ai/src/explain.ts', "import { approve } from '@octc/rules-engine'\nexport default approve\n")
    expect(run()[0]).toMatch(/must not import "@octc\/rules-engine"/)
  })

  it('keeps chain HTTP out of core', () => {
    write('packages/core/src/fetcher.ts', "import https from 'node:https'\nexport default https\n")
    expect(run()[0]).toMatch(/core must not import "node:https"/)
  })

  it('allows the imports an engine legitimately needs', () => {
    write(
      'packages/event-engine/src/normalize.ts',
      "import { amount } from '@octc/core'\nimport { group } from './group.ts'\nexport { amount, group }\n"
    )
    write('packages/event-engine/src/group.ts', 'export const group = () => []\n')
    expect(run()).toEqual([])
  })

  it('names both forbidden targets for each engine', () => {
    // A rule that quietly lost one of its targets would still pass every test
    // above, so the rule table itself is asserted.
    for (const pkg of ['packages/event-engine', 'packages/rules-engine']) {
      const rule = IMPORT_RULES.find((r) => r.pkg === pkg)
      expect(rule, `${pkg} has no import rule`).toBeDefined()
      expect(rule!.forbidden.some((f) => f.includes('tezos'))).toBe(true)
      expect(rule!.forbidden.some((f) => f.includes('france'))).toBe(true)
    }
  })
})

describe('the repository as it stands', () => {
  it('has no import violations', () => {
    expect(imports.run({ root: repoRoot })).toEqual([])
  })
})
