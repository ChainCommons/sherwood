import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { evaluate, loadPack } from '../../rules-engine/src/index.ts'
import {
  buildExplainabilityTrace,
  buildFindings,
  checkProvenance,
  finalizeFinding,
  isMaterialFinding,
  TRACE_STEPS
} from '../src/index.ts'
import type { Finding } from '../src/index.ts'

const packRoot = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../rules-engine/test/fixtures/pack'
)

const meta = {
  engine_version: '0.0.0-test',
  rule_pack_version: 'fixture-0',
  generated_at: '2026-09-09T12:00:00.000Z'
}

const traceCtx = {
  facts: { refs: ['profile-1'], detail: 'Resident FR; tax year 2021' },
  evidence: { refs: ['ev-raw-1'], detail: 'Imported ledger row' },
  events: { refs: ['evt-1'], detail: 'Normalized economic event' },
  capacity: {
    primary: 'ARTIST' as const,
    status: 'USER_CONFIRMED' as const,
    detail: 'User-declared artist'
  },
  valuations: { refs: ['val-1'] },
  lots: { refs: ['lot-1'] },
  calculation: {
    formula: 'proceeds - basis',
    inputs: ['proceeds', 'basis'],
    amount: '100.00',
    currency: 'EUR',
    rounding_mode: 'HALF_EVEN' as const
  }
}

describe('findings builder (§51) + explainability (§52)', () => {
  const pack = loadPack(packRoot)

  it('builds a relevant finding with rule/source refs and full §52 trace (AC-001)', () => {
    const evaluation = evaluate({
      pack,
      event: { event_type: 'SELF_TRANSFER' },
      participant: { capacity: 'ARTIST' },
      asOf: { transactionDate: '2021-06-15', analysisDate: '2026-01-01' }
    })
    expect(evaluation.status).toBe('APPLICABLE')

    const findings = buildFindings({
      evaluation,
      meta,
      options: {
        participant: 'participant-1',
        trace: traceCtx
      }
    })
    expect(findings.length).toBeGreaterThan(0)
    const finding = findings[0]!
    expect(finding.status).toBe('relevant')
    expect(finding.rule_refs!.length).toBeGreaterThanOrEqual(1)
    expect(finding.source_refs!.length).toBeGreaterThanOrEqual(1)
    expect(checkProvenance(finding)).toEqual([])
    expect(isMaterialFinding(finding)).toBe(true)
    expect(finding.trace).toBeDefined()
    expect(finding.trace!.map((s) => s.step)).toEqual([...TRACE_STEPS])
    expect(finding.trace!.find((s) => s.step === 'RULE')!.refs).toEqual(
      finding.rule_refs
    )
    expect(finding.trace!.find((s) => s.step === 'SOURCE')!.refs).toEqual(
      finding.source_refs
    )
    expect(finding.trace!.find((s) => s.step === 'FACTS')!.refs).toContain(
      'profile-1'
    )
    expect(finding.capacity?.primary).toBe('ARTIST')
    expect(finding.event_refs).toEqual(['evt-1'])
    expect(finding.valuation_refs).toEqual(['val-1'])
    expect(finding.lot_refs).toEqual(['lot-1'])
  })

  it('AC-003: unsupported treatment resolves to unknown with uncertainty step', () => {
    const evaluation = evaluate({
      pack,
      event: { event_type: 'PERPETUAL_FUNDING' },
      participant: { capacity: 'ACTIVE_TRADER' },
      asOf: { transactionDate: '2021-06-15', analysisDate: '2026-01-01' }
    })
    expect(evaluation.status).toBe('UNKNOWN')

    const [finding] = buildFindings({ evaluation, meta, options: { trace: traceCtx } })
    expect(finding).toBeDefined()
    expect(finding!.status).toBe('unknown')
    expect(finding!.certainty.level).toBe('UNKNOWN')
    expect(finding!.missing_facts!.length).toBeGreaterThan(0)
    expect(finding!.trace).toBeDefined()
    const result = finding!.trace!.find((s) => s.step === 'RESULT_OR_UNCERTAINTY')!
    expect(result.detail).toMatch(/status=unknown/)
    expect(result.detail).toMatch(/certainty=UNKNOWN/)
  })

  it('AC-002 path: later-published guidance stays unknown, not relevant', () => {
    const evaluation = evaluate({
      pack,
      event: { event_type: 'NFT_SALE' },
      participant: { capacity: 'ARTIST' },
      asOf: { transactionDate: '2021-06-15', analysisDate: '2026-01-01' }
    })
    expect(evaluation.status).toBe('UNKNOWN')

    const [finding] = buildFindings({ evaluation, meta })
    expect(finding!.status).toBe('unknown')
    expect(finding!.rule_refs).toContain('fixture-nft-vat-retrospective')
    expect(finding!.professional_review_recommended).toBe(true)
  })

  it('AC-011: competing interpretations surface without picking a winner', () => {
    const evaluation = evaluate({
      pack,
      event: { event_type: 'ART_PRIMARY_SALE' },
      participant: { capacity: 'ARTIST' },
      asOf: { transactionDate: '2021-06-15', analysisDate: '2026-01-01' }
    })
    expect(evaluation.status).toBe('UNRESOLVED')

    const findings = buildFindings({ evaluation, meta })
    expect(findings).toHaveLength(1)
    const finding = findings[0]!
    expect(finding.status).toBe('potentially_relevant')
    expect([...finding.competing_interpretations!].sort()).toEqual([
      'fixture-interp-capital',
      'fixture-interp-income'
    ])
    expect(finding.professional_review_recommended).toBe(true)
    expect(finding.trace!.map((s) => s.step)).toEqual([...TRACE_STEPS])
  })

  it('demotes a relevant draft missing sources to unknown (AC-001)', () => {
    const draft: Finding = {
      finding_id: 'finding-bad',
      jurisdiction: 'fixture',
      issue: 'Unsourced claim',
      status: 'relevant',
      rule_refs: ['some-rule'],
      certainty: { level: 'AUTHORITATIVE_CLEAR' },
      explanation: 'Would claim a material conclusion',
      generated_at: meta.generated_at,
      engine_version: meta.engine_version,
      rule_pack_version: meta.rule_pack_version,
      schema_version: '0.1.0'
    }
    expect(checkProvenance(draft)).toHaveLength(1)
    const fixed = finalizeFinding(draft)
    expect(fixed.status).toBe('unknown')
    expect(fixed.certainty.level).toBe('UNKNOWN')
    expect(fixed.explanation).toMatch(/demoted to UNKNOWN/)
  })

  it('buildExplainabilityTrace keeps every §52 step even when refs are empty', () => {
    const steps = buildExplainabilityTrace({
      status: 'unknown',
      certainty: { level: 'UNKNOWN', reason: 'gap' },
      explanation: 'Unsupported',
      missing_facts: ['need-more-facts']
    })
    expect(steps).toHaveLength(TRACE_STEPS.length)
    expect(steps.every((s) => Array.isArray(s.refs))).toBe(true)
    expect(steps.at(-1)!.refs).toContain('need-more-facts')
  })
})
