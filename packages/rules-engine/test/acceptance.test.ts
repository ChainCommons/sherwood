import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { evaluate, loadPack } from '../src/index.ts'

const packRoot = join(dirname(fileURLToPath(import.meta.url)), 'fixtures/pack')

describe('acceptance AC-001 / AC-002 / AC-003 / AC-011', () => {
  const pack = loadPack(packRoot)

  it('AC-001: every evaluated rule carries sources[]', () => {
    const result = evaluate({
      pack,
      event: { event_type: 'SELF_TRANSFER' },
      participant: { capacity: 'ARTIST' },
      asOf: { transactionDate: '2021-06-15', analysisDate: '2026-01-01' }
    })
    expect(result.status).toBe('APPLICABLE')
    expect(result.applicable.length).toBeGreaterThan(0)
    for (const er of result.applicable) {
      expect(er.rule.sources.length).toBeGreaterThanOrEqual(1)
      expect(er.sources.length).toBeGreaterThanOrEqual(1)
      expect(er.sources.every((s) => s.source.source_id)).toBe(true)
    }
  })

  it('AC-002: 2021 tx does not treat 2025-published guidance as contemporaneous', () => {
    const result = evaluate({
      pack,
      event: { event_type: 'NFT_SALE' },
      participant: { capacity: 'ARTIST' },
      asOf: { transactionDate: '2021-06-15', analysisDate: '2026-01-01' }
    })
    expect(result.applicable.map((e) => e.rule.rule_id)).not.toContain(
      'fixture-nft-vat-retrospective'
    )
    expect(result.laterGuidance.map((e) => e.rule.rule_id)).toContain(
      'fixture-nft-vat-retrospective'
    )
    const late = result.laterGuidance.find(
      (e) => e.rule.rule_id === 'fixture-nft-vat-retrospective'
    )!
    expect(late.publishedAfterTransaction).toBe(true)
    expect(late.contemporaneousSources).toHaveLength(0)
    expect(late.laterSources.map((s) => s.source.source_id)).toContain(
      'fixture-bofip-nft-2025'
    )
    // Without contemporaneous coverage, status is UNKNOWN rather than silently applying 2025 text.
    expect(result.status).toBe('UNKNOWN')
    expect(result.gaps[0]).toMatch(/later-published/)
  })

  it('AC-003: unsupported treatment resolves UNKNOWN', () => {
    const result = evaluate({
      pack,
      event: { event_type: 'PERPETUAL_FUNDING' },
      participant: { capacity: 'ACTIVE_TRADER' },
      asOf: { transactionDate: '2021-06-15', analysisDate: '2026-01-01' }
    })
    expect(result.status).toBe('UNKNOWN')
    expect(result.applicable).toHaveLength(0)
    expect(result.certainty.level).toBe('UNKNOWN')
    expect(result.gaps.length).toBeGreaterThan(0)
  })

  it('AC-011: competing interpretations coexist as UNRESOLVED', () => {
    const result = evaluate({
      pack,
      event: { event_type: 'ART_PRIMARY_SALE' },
      participant: { capacity: 'ARTIST' },
      asOf: { transactionDate: '2021-06-15', analysisDate: '2026-01-01' }
    })
    expect(result.status).toBe('UNRESOLVED')
    expect(result.certainty.level).toBe('CONFLICTING_AUTHORITIES')
    const er = result.applicable.find((e) => e.rule.rule_id === 'fixture-nft-sale-ambiguous')
    expect(er).toBeDefined()
    expect(er!.interpretations.map((i) => i.interpretation_id).sort()).toEqual([
      'fixture-interp-capital',
      'fixture-interp-income'
    ])
    expect(er!.sources.map((s) => s.source.source_id).sort()).toEqual([
      'fixture-commentary-a',
      'fixture-commentary-b'
    ])
  })

  it('REVIEW_REQUIRED when certainty is AMBIGUOUS without dual interpretations', () => {
    const result = evaluate({
      pack,
      event: { event_type: 'AIRDROP' },
      participant: { capacity: 'COLLECTOR' },
      asOf: { transactionDate: '2021-06-15', analysisDate: '2026-01-01' }
    })
    expect(result.status).toBe('REVIEW_REQUIRED')
    expect(result.applicable.map((e) => e.rule.rule_id)).toContain('fixture-ambiguous-review')
  })

  it('DSL v0 amount / asset_category / jurisdiction_facts gate applicability', () => {
    const asOf = { transactionDate: '2021-06-15', analysisDate: '2026-01-01' }
    const hit = evaluate({
      pack,
      event: { event_type: 'DISPOSAL', asset_category: 'nft', amount: '10000' },
      participant: { capacity: 'COLLECTOR' },
      jurisdiction_facts: { reporting_threshold_applies: true },
      asOf
    })
    expect(hit.status).toBe('APPLICABLE')
    expect(hit.applicable.map((e) => e.rule.rule_id)).toContain('fixture-amount-threshold')

    const miss = evaluate({
      pack,
      event: { event_type: 'DISPOSAL', asset_category: 'nft', amount: '9999.99' },
      participant: { capacity: 'COLLECTOR' },
      jurisdiction_facts: { reporting_threshold_applies: true },
      asOf
    })
    expect(miss.applicable.map((e) => e.rule.rule_id)).not.toContain('fixture-amount-threshold')
    expect(miss.status).toBe('UNKNOWN')
  })

  it('analysis after publication can still surface later guidance separately', () => {
    const result = evaluate({
      pack,
      event: { event_type: 'NFT_SALE' },
      participant: { capacity: 'ARTIST' },
      asOf: { transactionDate: '2021-06-15', analysisDate: '2025-06-01' }
    })
    expect(result.laterGuidance.length).toBe(1)
    expect(result.applicable.length).toBe(0)
  })
})
