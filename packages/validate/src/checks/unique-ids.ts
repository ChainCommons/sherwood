/**
 * IDs must be unique across all YAML/JSON data (plan 16 §85).
 *
 * Two packs claiming the same `rule_id` would make source lookup
 * non-deterministic, so this is an error rather than a warning.
 */
import { join } from 'node:path'
import type { Issue, SyncCheck } from '../types.ts'
import { error } from '../types.ts'
import { isDataFile, readData, rel, walk } from '../fs-utils.ts'

const DATA_ROOTS = ['jurisdictions', 'scenarios', 'cases', 'domain-packs']

const ID_FIELDS = [
  'participant_id', 'relationship_id', 'wallet_id', 'artwork_id',
  'compensation_right_id', 'evidence_id', 'annotation_id', 'technical_tx_id',
  'leg_id', 'event_id', 'overlay_id', 'asset_id', 'classification_id',
  'position_id', 'lot_id', 'jurisdiction_id', 'source_id',
  'source_version_id', 'rule_id', 'interpretation_id', 'reporting_rule_id',
  'valuation_id', 'finding_id', 'snapshot_id', 'scenario_id', 'case_id'
] as const

/**
 * Some ID fields appear far more often as foreign keys than as declarations,
 * and counting a reference as a second declaration makes a legitimate record
 * unrepresentable. `references.ts` already draws these lines; keep them in step.
 *
 * `jurisdiction_id` is a foreign key nearly everywhere, so only treat it as a
 * declaration on the pack's own jurisdiction document.
 *
 * `source_id` on a source version is the foreign key back to the source it is a
 * version of (plan 05 §28) — the mechanism by which historical text survives
 * alongside current text. Without this carve-out a source plus any of its
 * versions is a duplicate, so `source-version.schema.json` could not be used.
 *
 * `rule_id` on an interpretation is likewise the foreign key to the rule being
 * read (plan 05 §100). Competing readings of one rule are the point, so two
 * interpretations naturally share a `rule_id` with it and with each other.
 */
const declaresId = (field: string, doc: Record<string, unknown>): boolean => {
  if (field === 'jurisdiction_id') return typeof doc.jurisdiction_type === 'string'
  if (field === 'source_id') return doc.source_version_id === undefined
  if (field === 'rule_id') return doc.interpretation_id === undefined
  return true
}

export const uniqueIds: SyncCheck = {
  name: 'unique-ids',
  run({ root }): Issue[] {
    const seen = new Map<string, string>()
    const issues: Issue[] = []

    for (const dir of DATA_ROOTS) {
      for (const file of walk(join(root, dir), isDataFile)) {
        const path = rel(root, file)
        let doc: unknown
        try {
          doc = readData(file)
        } catch {
          continue // reported by the schema check
        }
        if (typeof doc !== 'object' || doc === null || Array.isArray(doc)) continue
        const record = doc as Record<string, unknown>

        for (const field of ID_FIELDS) {
          const value = record[field]
          if (typeof value !== 'string' || !declaresId(field, record)) continue
          const key = `${field}:${value}`
          const previous = seen.get(key)
          if (previous !== undefined) {
            issues.push(error('unique-ids', path, `duplicate ${field} "${value}", first seen in ${previous}`))
          } else {
            seen.set(key, path)
          }
        }
      }
    }
    return issues
  }
}
