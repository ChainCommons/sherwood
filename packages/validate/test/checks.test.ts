/**
 * The validator's own tests.
 *
 * Each check is exercised against a sandbox repository so a passing `pnpm
 * validate` on a nearly empty tree cannot be mistaken for a working gate.
 */
import { mkdirSync, mkdtempSync, rmSync, writeFileSync, cpSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { knowledge } from '../src/checks/knowledge.ts'
import { links } from '../src/checks/links.ts'
import { secrets } from '../src/checks/secrets.ts'
import { temporal } from '../src/checks/temporal.ts'
import { uniqueIds } from '../src/checks/unique-ids.ts'
import { references } from '../src/checks/references.ts'
import { validateRepo } from '../src/index.ts'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')

let sandbox: string
const write = (relPath: string, contents: string): void => {
  const full = join(sandbox, relPath)
  mkdirSync(dirname(full), { recursive: true })
  writeFileSync(full, contents)
}

beforeEach(() => {
  sandbox = mkdtempSync(join(tmpdir(), 'octc-validate-'))
})
afterEach(() => {
  rmSync(sandbox, { recursive: true, force: true })
})

describe('unique-ids', () => {
  it('flags the same rule_id declared in two packs', () => {
    const rule = 'rule_id: dup-rule\njurisdiction_id: france\n'
    write('jurisdictions/france/rules/a.yaml', rule)
    write('jurisdictions/france/rules/b.yaml', rule)
    const issues = uniqueIds.run({ root: sandbox })
    expect(issues.length).toBe(1)
    expect(issues[0]!.message).toMatch(/duplicate rule_id "dup-rule"/)
  })

  it('does not mistake a jurisdiction_id foreign key for a second declaration', () => {
    // Nearly every record carries jurisdiction_id; only the pack manifest
    // declares it.
    write('jurisdictions/france/jurisdiction.yaml', 'jurisdiction_id: france\njurisdiction_type: national\n')
    write('jurisdictions/france/rules/a.yaml', 'rule_id: r1\njurisdiction_id: france\n')
    write('jurisdictions/france/rules/b.yaml', 'rule_id: r2\njurisdiction_id: france\n')
    expect(uniqueIds.run({ root: sandbox })).toEqual([])
  })

  it('does not mistake the source_id foreign key on a version for a declaration', () => {
    // Plan 05 §28: historical text survives as dated versions of one source.
    // Counting the back-reference as a declaration made that unrepresentable.
    write('jurisdictions/france/sources/s.yaml', 'source_id: fr-bofip-x\njurisdiction_id: france\n')
    write(
      'jurisdictions/france/versions/v1.yaml',
      'source_version_id: fr-bofip-x-2019\nsource_id: fr-bofip-x\nretrieved_at: "2019-09-02"\n'
    )
    write(
      'jurisdictions/france/versions/v2.yaml',
      'source_version_id: fr-bofip-x-2024\nsource_id: fr-bofip-x\nretrieved_at: "2024-04-23"\n'
    )
    expect(uniqueIds.run({ root: sandbox })).toEqual([])
  })

  it('still flags two sources claiming one source_id', () => {
    const source = 'source_id: dup-src\njurisdiction_id: france\n'
    write('jurisdictions/france/sources/a.yaml', source)
    write('jurisdictions/france/sources/b.yaml', source)
    const issues = uniqueIds.run({ root: sandbox })
    expect(issues.length).toBe(1)
    expect(issues[0]!.message).toMatch(/duplicate source_id "dup-src"/)
  })

  it('still flags two versions claiming one source_version_id', () => {
    write(
      'jurisdictions/france/versions/a.yaml',
      'source_version_id: dup-v\nsource_id: fr-bofip-x\nretrieved_at: "2020-01-01"\n'
    )
    write(
      'jurisdictions/france/versions/b.yaml',
      'source_version_id: dup-v\nsource_id: fr-bofip-x\nretrieved_at: "2021-01-01"\n'
    )
    const issues = uniqueIds.run({ root: sandbox })
    expect(issues.length).toBe(1)
    expect(issues[0]!.message).toMatch(/duplicate source_version_id "dup-v"/)
  })

  it('does not mistake the rule_id foreign key on an interpretation for a declaration', () => {
    // Plan 05 §100: competing readings of one rule are the point, so a rule and
    // its interpretations legitimately share a rule_id.
    write('jurisdictions/france/rules/r.yaml', 'rule_id: fr-rule\njurisdiction_id: france\n')
    write(
      'jurisdictions/france/interpretations/a.yaml',
      'interpretation_id: fr-interp-a\nrule_id: fr-rule\n'
    )
    write(
      'jurisdictions/france/interpretations/b.yaml',
      'interpretation_id: fr-interp-b\nrule_id: fr-rule\n'
    )
    expect(uniqueIds.run({ root: sandbox })).toEqual([])
  })

  it('still flags two interpretations claiming one interpretation_id', () => {
    const doc = 'interpretation_id: dup-i\nrule_id: fr-rule\n'
    write('jurisdictions/france/interpretations/a.yaml', doc)
    write('jurisdictions/france/interpretations/b.yaml', doc)
    const issues = uniqueIds.run({ root: sandbox })
    expect(issues.length).toBe(1)
    expect(issues[0]!.message).toMatch(/duplicate interpretation_id "dup-i"/)
  })
})

describe('temporal', () => {
  const base = 'rule_id: r1\njurisdiction_id: france\n'

  it('does not demand published_from from an interpretation of a rule', () => {
    // The interpretation schema has no published_from and forbids extra
    // properties, so demanding it made the rule_id field unusable.
    write('jurisdictions/france/interpretations/a.yaml', base + 'interpretation_id: fr-interp-a\n')
    expect(temporal.run({ root: sandbox })).toEqual([])
  })

  it('still demands published_from from an actual rule', () => {
    write('jurisdictions/france/rules/r.yaml', base)
    const issues = temporal.run({ root: sandbox })
    expect(issues.length).toBe(1)
    expect(issues[0]!.message).toMatch(/missing published_from/)
  })

  it('rejects an effective range that ends before it starts', () => {
    write('jurisdictions/france/rules/r.yaml', base + 'effective_from: 2021-01-01\neffective_to: 2020-01-01\npublished_from: 2020-12-01\n')
    expect(temporal.run({ root: sandbox }).some((i) => /after effective_to/.test(i.message))).toBe(true)
  })

  it('requires published_from on a rule (AC-002)', () => {
    write('jurisdictions/france/rules/r.yaml', base + 'effective_from: 2021-01-01\n')
    expect(temporal.run({ root: sandbox }).some((i) => /missing published_from/.test(i.message))).toBe(true)
  })

  it('warns, without failing, when guidance was published after the period it governs', () => {
    // Retrospective guidance is legitimate but is exactly what AC-002 exists
    // to surface, so it is reported rather than accepted silently.
    write('jurisdictions/france/rules/r.yaml', base + 'effective_from: 2021-01-01\npublished_from: 2025-03-01\n')
    const issues = temporal.run({ root: sandbox })
    const warn = issues.find((i) => /not available for the whole period/.test(i.message))
    expect(warn?.severity).toBe('warning')
    expect(issues.filter((i) => i.severity === 'error')).toEqual([])
  })

  it('rejects a capture dated before publication', () => {
    write('jurisdictions/france/rules/r.yaml', base + 'effective_from: 2021-01-01\npublished_from: 2021-01-01\nretrieved_at: 2020-01-01\n')
    expect(temporal.run({ root: sandbox }).some((i) => /precedes publication/.test(i.message))).toBe(true)
  })
})

describe('knowledge', () => {
  it('rejects an unsourced rule promoted to a verified status (§84)', () => {
    write(
      'jurisdictions/france/rules/r.yaml',
      'rule_id: r1\njurisdiction_id: france\nsources: []\ncertainty:\n  level: AUTHORITATIVE_CLEAR\nreview:\n  status: SOURCE_VERIFIED\n'
    )
    const messages = knowledge.run({ root: sandbox }).map((i) => i.message)
    expect(messages.some((m) => /no sources/.test(m))).toBe(true)
    expect(messages.some((m) => /marked SOURCE_VERIFIED without a source/.test(m))).toBe(true)
  })

  it('requires reviewer qualification for EXPERT_REVIEWED (§99)', () => {
    write(
      'jurisdictions/france/rules/r.yaml',
      'rule_id: r1\njurisdiction_id: france\nsources:\n  - src-1\ncertainty:\n  level: EXPERT_INTERPRETATION\nreview:\n  status: EXPERT_REVIEWED\n'
    )
    expect(knowledge.run({ root: sandbox }).some((i) => /reviewer_qualification/.test(i.message))).toBe(true)
  })

  it('requires a rule to state its certainty (INV-009)', () => {
    write('jurisdictions/france/rules/r.yaml', 'rule_id: r1\njurisdiction_id: france\nsources:\n  - src-1\n')
    expect(knowledge.run({ root: sandbox }).some((i) => /no certainty/.test(i.message))).toBe(true)
  })

  it('requires a pack to list its unsupported domains explicitly (§24)', () => {
    write('jurisdictions/france/jurisdiction.yaml', 'jurisdiction_id: france\njurisdiction_type: national\n')
    expect(knowledge.run({ root: sandbox }).some((i) => /unsupported_tax_domains/.test(i.message))).toBe(true)
  })
})

describe('references', () => {
  it('flags a rule citing a source nobody declares', () => {
    write('jurisdictions/france/jurisdiction.yaml', 'jurisdiction_id: france\njurisdiction_type: national\nunsupported_tax_domains: []\n')
    write('jurisdictions/france/rules/r.yaml', 'rule_id: r1\njurisdiction_id: france\nsources:\n  - ghost-source\n')
    expect(references.run({ root: sandbox }).some((i) => /unknown source_id "ghost-source"/.test(i.message))).toBe(true)
  })

  it('accepts a citation that resolves', () => {
    write('jurisdictions/france/jurisdiction.yaml', 'jurisdiction_id: france\njurisdiction_type: national\nunsupported_tax_domains: []\n')
    write('jurisdictions/france/sources/s.yaml', 'source_id: real-source\njurisdiction_id: france\n')
    write('jurisdictions/france/rules/r.yaml', 'rule_id: r1\njurisdiction_id: france\nsources:\n  - real-source\n')
    expect(references.run({ root: sandbox })).toEqual([])
  })
})

describe('secrets', () => {
  it('catches a Tezos secret key', () => {
    write('packages/x/src/a.ts', "const k = 'edsk" + '3gUfUPyBSfrS9CCgmCiQsTCHGkviBDusMxDJstFtojtc1zcpsh' + "'\n")
    expect(secrets.run({ root: sandbox }).some((i) => /tezos secret key/.test(i.message))).toBe(true)
  })

  it('catches a seed phrase assignment', () => {
    write('config/x.yaml', 'mnemonic: "' + Array(12).fill('abandon').join(' ') + '"\n')
    expect(secrets.run({ root: sandbox }).some((i) => /seed phrase/.test(i.message))).toBe(true)
  })

  it('leaves ordinary prose alone', () => {
    write('docs/a.md', 'Never store a seed phrase in this repository.\n')
    expect(secrets.run({ root: sandbox })).toEqual([])
  })
})

describe('links', () => {
  it('flags a broken relative link', () => {
    write('docs/a.md', 'See [the plan](./missing.md).\n')
    expect(links.run({ root: sandbox }).some((i) => /broken internal link/.test(i.message))).toBe(true)
  })

  it('follows a link that resolves, and ignores external ones', () => {
    write('docs/a.md', 'See [b](./b.md) and [site](https://example.org) and [anchor](#x).\n')
    write('docs/b.md', '# B\n')
    expect(links.run({ root: sandbox })).toEqual([])
  })
})

describe('the repository as it stands', () => {
  it('passes every check', async () => {
    const result = await validateRepo({ root: repoRoot })
    expect(result.errors).toEqual([])
    expect(result.ok).toBe(true)
  })

  it('fails loudly when a fixture stops matching its schema', async () => {
    // Copy the real repo, break one fixture, and confirm validation fails:
    // proof that a green run means the checks ran, not that they found nothing.
    cpSync(join(repoRoot, 'schemas'), join(sandbox, 'schemas'), { recursive: true })
    write(
      'tests/contracts/broken.json',
      JSON.stringify({
        $schema: 'https://schemas.opencryptotaxcommons.org/finding/finding.schema.json',
        finding_id: 'not-a-valid-id-at-all!',
        jurisdiction: 'france'
      })
    )
    const result = await validateRepo({ root: sandbox })
    expect(result.ok).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })
})
