import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { evaluate, loadPack } from '../../rules-engine/src/index.ts'
import {
  ANALYZE_ENGINE_VERSION,
  analyze,
  deserializeAnalysis,
  deserializeSnapshot,
  reproduce,
  serializeAnalysis,
  serializeSnapshot,
  snapshotsEqual
} from '../src/index.ts'

const packRoot = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../rules-engine/test/fixtures/pack'
)

const meta = {
  engine_version: '0.0.0-test',
  rule_pack_version: 'fixture-0',
  generated_at: '2026-09-09T12:00:00.000Z'
}

const snapshotMeta = {
  snapshot_id: '01J8Z3QKQ0SNAPSHT010000000',
  participant_profile_version: '1',
  ledger_version: '1',
  ownership_mappings_version: '1',
  jurisdiction_pack_version: 'fixture@0.0.0',
  pack_git_commit: '0000000000000000000000000000000000000000',
  valuation_methodology: 'nearest_trade with recorded fallback chain',
  price_dataset_refs: [
    'sha256:9b1a0d3c2e5f4a7b8c9d0e1f2a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d'
  ],
  lot_method: 'SPECIFIC_IDENTIFICATION' as const,
  rounding_mode: 'HALF_EVEN' as const,
  timezone_assumption: 'Europe/Paris',
  analysis_date: '2026-01-10T09:00:12.000Z'
}

describe('analyze() facade + snapshot serialize/reproduce (AC-006)', () => {
  const pack = loadPack(packRoot)

  function runAnalyze() {
    const evaluation = evaluate({
      pack,
      event: { event_type: 'SELF_TRANSFER' },
      participant: { capacity: 'ARTIST' },
      asOf: { transactionDate: '2021-06-15', analysisDate: '2026-01-01' }
    })
    return analyze({
      evaluations: [
        {
          evaluation,
          meta,
          options: {
            participant: 'participant-1',
            trace: {
              facts: { refs: ['profile-1'] },
              evidence: { refs: ['ev-1'] },
              events: { refs: ['evt-1'] },
              capacity: { primary: 'ARTIST', status: 'USER_CONFIRMED' },
              valuations: { refs: ['val-1'] },
              lots: { refs: ['lot-1'] }
            }
          }
        }
      ],
      snapshot: snapshotMeta
    })
  }

  it('builds findings and a §93 snapshot with recorded versions/methods', () => {
    const result = runAnalyze()
    expect(result.findings.length).toBeGreaterThan(0)
    expect(result.snapshot.lot_method).toBe('SPECIFIC_IDENTIFICATION')
    expect(result.snapshot.engine_version).toBe(ANALYZE_ENGINE_VERSION)
    expect(result.snapshot.analysis_date).toBe(snapshotMeta.analysis_date)
    expect(result.snapshot.participant_profile_version).toBe('1')
    expect(result.snapshot.ledger_version).toBe('1')
    expect(result.snapshot.jurisdiction_pack_version).toBe('fixture@0.0.0')
    expect(result.snapshot.valuation_methodology).toContain('nearest_trade')
    expect(result.snapshot.price_dataset_refs).toEqual(
      snapshotMeta.price_dataset_refs
    )
    expect(result.snapshot.finding_refs).toEqual(
      result.findings.map((f) => f.finding_id)
    )
    expect(result.snapshot.rule_versions!.length).toBeGreaterThan(0)
    expect(result.engine_version).toBe(ANALYZE_ENGINE_VERSION)
  })

  it('round-trips snapshot and full analysis via canonical JSON', () => {
    const result = runAnalyze()
    const snapJson = serializeSnapshot(result.snapshot)
    const restoredSnap = deserializeSnapshot(snapJson)
    expect(snapshotsEqual(restoredSnap, result.snapshot)).toBe(true)
    expect(serializeSnapshot(restoredSnap)).toBe(snapJson)

    const analysisJson = serializeAnalysis(result)
    const restored = deserializeAnalysis(analysisJson)
    expect(serializeAnalysis(restored)).toBe(analysisJson)
    expect(restored.findings).toEqual(result.findings)
    expect(snapshotsEqual(restored.snapshot, result.snapshot)).toBe(true)
  })

  it('AC-006: reproduce matches saved findings given the same versions/methods', () => {
    const saved = runAnalyze()
    const evaluation = evaluate({
      pack,
      event: { event_type: 'SELF_TRANSFER' },
      participant: { capacity: 'ARTIST' },
      asOf: { transactionDate: '2021-06-15', analysisDate: '2026-01-01' }
    })
    const again = reproduce(saved, {
      evaluations: [
        {
          evaluation,
          meta,
          options: {
            participant: 'participant-1',
            trace: {
              facts: { refs: ['profile-1'] },
              evidence: { refs: ['ev-1'] },
              events: { refs: ['evt-1'] },
              capacity: { primary: 'ARTIST', status: 'USER_CONFIRMED' },
              valuations: { refs: ['val-1'] },
              lots: { refs: ['lot-1'] }
            }
          }
        }
      ],
      snapshot: snapshotMeta
    })
    expect(again.match).toBe(true)
    expect(again.diffs).toEqual([])
    expect(again.findings).toEqual(saved.findings)
    expect(snapshotsEqual(again.snapshot, saved.snapshot)).toBe(true)
  })

  it('AC-006: engine version mismatch yields an explicit engine diff', () => {
    const saved = runAnalyze()
    const evaluation = evaluate({
      pack,
      event: { event_type: 'SELF_TRANSFER' },
      participant: { capacity: 'ARTIST' },
      asOf: { transactionDate: '2021-06-15', analysisDate: '2026-01-01' }
    })
    const again = reproduce(saved, {
      evaluations: [{ evaluation, meta }],
      snapshot: {
        ...snapshotMeta,
        engine_version: 'analyze@9.9.9'
      }
    })
    expect(again.match).toBe(false)
    expect(again.diffs.some((d) => d.code === 'ENGINE_VERSION_MISMATCH')).toBe(
      true
    )
  })

  it('rejects analyze() with no evaluations', () => {
    expect(() =>
      analyze({ evaluations: [], snapshot: snapshotMeta })
    ).toThrow(/at least one evaluation/)
  })
})
