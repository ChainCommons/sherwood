import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  SourceRegistry,
  isEffectiveOn,
  isPublishedBy,
  isRetrievedBy,
  publicationDateOf
} from '../src/index.ts'

const fixtures = join(dirname(fileURLToPath(import.meta.url)), 'fixtures')

describe('three clocks', () => {
  const registry = SourceRegistry.fromDirectory(fixtures)
  const statute = registry.require('fixture-cgi-150-0')
  const late = registry.require('fixture-bofip-nft-2025')
  const faq = registry.require('fixture-faq-2022')

  it('keeps publication, effective and retrieved distinct on the late guidance', () => {
    expect(publicationDateOf(late)).toBe('2025-03-15')
    expect(late.effective_from).toBe('2021-01-01')
    expect(late.retrieved_at).toBe('2025-04-01')

    expect(isEffectiveOn(late, '2021-06-15')).toBe(true)
    expect(isPublishedBy(late, '2021-06-15')).toBe(false)
    expect(isRetrievedBy(late, '2021-06-15')).toBe(false)

    expect(isPublishedBy(late, '2025-03-15')).toBe(true)
    expect(isRetrievedBy(late, '2025-03-20')).toBe(false)
    expect(isRetrievedBy(late, '2025-04-01')).toBe(true)
  })

  it('asOf(publication) excludes 2025 guidance from a 2021 query (AC-002)', () => {
    const published = registry.publishedBy('2021-06-15').map((s) => s.source_id)
    expect(published).toContain('fixture-cgi-150-0')
    expect(published).not.toContain('fixture-bofip-nft-2025')
    expect(published).not.toContain('fixture-faq-2022')
  })

  it('asOf(effective) includes retrospective guidance for 2021', () => {
    const effective = registry.effectiveAt('2021-06-15').map((s) => s.source_id)
    expect(effective).toContain('fixture-cgi-150-0')
    expect(effective).toContain('fixture-bofip-nft-2025')
    expect(effective).not.toContain('fixture-faq-2022')
  })

  it('classifyAsOf buckets later publications separately', () => {
    const buckets = registry.classifyAsOf('2021-06-15')
    expect(buckets.contemporaneous.map((v) => v.source.source_id)).toEqual([
      'fixture-cgi-150-0'
    ])
    expect(buckets.laterPublications.map((v) => v.source.source_id)).toEqual([
      'fixture-bofip-nft-2025'
    ])
    expect(buckets.notYetEffective.map((v) => v.source.source_id)).toContain(
      'fixture-faq-2022'
    )
  })

  it('asOf(retrieved) reflects repository capture, not publication', () => {
    expect(registry.retrievedBy('2024-12-31').map((s) => s.source_id).sort()).toEqual([
      'fixture-cgi-150-0',
      'fixture-faq-2022'
    ])
    expect(registry.retrievedBy('2025-04-01').map((s) => s.source_id)).toContain(
      'fixture-bofip-nft-2025'
    )
  })

  it('loads chained source versions without overwriting the source', () => {
    const versions = registry.versionsOf('fixture-bofip-nft-2025')
    expect(versions).toHaveLength(1)
    expect(versions[0]!.retrieved_at).toBe('2025-04-01')
    expect(statute.title).toMatch(/contemporaneous/)
    expect(faq.authority_level).toBe('OFFICIAL_FAQ')
  })
})
