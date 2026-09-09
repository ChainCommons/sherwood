/**
 * Analysis snapshot serialize / deserialize (plan 09 §93, AC-006).
 * Canonical JSON so saved analyses round-trip byte-for-byte.
 */
import {
  canonicalJson,
  hashJson,
  LOT_METHODS,
  ROUNDING_MODES
} from '../../core/src/index.ts'
import type { JsonValue, LotMethod } from '../../core/src/index.ts'
import type {
  AnalysisSnapshot,
  RoundingMode,
  SnapshotMeta,
  SnapshotRuleVersion
} from './types.ts'

export const SNAPSHOT_SCHEMA_VERSION = '0.1.0'

const LOT_METHOD_SET = new Set<string>(LOT_METHODS)
const ROUNDING_SET = new Set<string>(ROUNDING_MODES)

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new TypeError(`AnalysisSnapshot.${field} must be a non-empty string`)
  }
  return value
}

function optionalString(value: unknown, field: string): string | undefined {
  if (value === undefined) return undefined
  return requireString(value, field)
}

function parseRuleVersions(value: unknown): readonly SnapshotRuleVersion[] | undefined {
  if (value === undefined) return undefined
  if (!Array.isArray(value)) {
    throw new TypeError('AnalysisSnapshot.rule_versions must be an array')
  }
  return value.map((entry, i) => {
    if (!isRecord(entry)) {
      throw new TypeError(`AnalysisSnapshot.rule_versions[${i}] must be an object`)
    }
    return {
      rule_id: requireString(entry.rule_id, `rule_versions[${i}].rule_id`),
      version: requireString(entry.version, `rule_versions[${i}].version`)
    }
  })
}

function parseStringArray(value: unknown, field: string): readonly string[] | undefined {
  if (value === undefined) return undefined
  if (!Array.isArray(value) || value.some((v) => typeof v !== 'string')) {
    throw new TypeError(`AnalysisSnapshot.${field} must be an array of strings`)
  }
  return value as string[]
}

function parseLotMethod(value: unknown): LotMethod {
  const v = requireString(value, 'lot_method')
  if (!LOT_METHOD_SET.has(v)) {
    throw new TypeError(`AnalysisSnapshot.lot_method is not a known lot method: ${v}`)
  }
  return v as LotMethod
}

function parseRounding(value: unknown): RoundingMode | undefined {
  if (value === undefined) return undefined
  const v = requireString(value, 'rounding_mode')
  if (!ROUNDING_SET.has(v)) {
    throw new TypeError(`AnalysisSnapshot.rounding_mode is invalid: ${v}`)
  }
  return v as RoundingMode
}

function assignOptional(
  target: Record<string, unknown>,
  key: string,
  value: unknown
): void {
  if (value !== undefined) target[key] = value
}

/** Stable id from snapshot body (excluding snapshot_id). */
export function deriveSnapshotId(
  body: Omit<AnalysisSnapshot, 'snapshot_id'>
): string {
  return `snap-${hashJson(JSON.parse(canonicalJson(body as unknown as JsonValue)) as JsonValue).slice(7, 33)}`
}

/**
 * Build a §93 snapshot from caller-supplied versions/methods and finding ids.
 * Lot method is required — never a hidden global default.
 */
export function buildSnapshot(
  meta: SnapshotMeta,
  findingRefs: readonly string[]
): AnalysisSnapshot {
  const engine_version = meta.engine_version
  if (engine_version === undefined || engine_version.length === 0) {
    throw new TypeError('SnapshotMeta.engine_version is required')
  }
  const body: Omit<AnalysisSnapshot, 'snapshot_id'> = {
    lot_method: meta.lot_method,
    engine_version,
    analysis_date: meta.analysis_date,
    schema_version: meta.schema_version ?? SNAPSHOT_SCHEMA_VERSION
  }
  const mutable = body as Record<string, unknown>
  assignOptional(mutable, 'participant_profile_version', meta.participant_profile_version)
  assignOptional(mutable, 'ledger_version', meta.ledger_version)
  assignOptional(mutable, 'ownership_mappings_version', meta.ownership_mappings_version)
  assignOptional(mutable, 'jurisdiction_pack_version', meta.jurisdiction_pack_version)
  if (meta.rule_versions !== undefined && meta.rule_versions.length > 0) {
    mutable.rule_versions = meta.rule_versions
  }
  assignOptional(mutable, 'pack_git_commit', meta.pack_git_commit)
  assignOptional(mutable, 'valuation_methodology', meta.valuation_methodology)
  if (meta.price_dataset_refs !== undefined && meta.price_dataset_refs.length > 0) {
    mutable.price_dataset_refs = meta.price_dataset_refs
  }
  assignOptional(mutable, 'rounding_mode', meta.rounding_mode)
  assignOptional(mutable, 'timezone_assumption', meta.timezone_assumption)
  if (findingRefs.length > 0) mutable.finding_refs = findingRefs

  return {
    snapshot_id: meta.snapshot_id ?? deriveSnapshotId(body),
    ...body
  }
}

/** Canonical JSON serialization (sorted keys). */
export function serializeSnapshot(snapshot: AnalysisSnapshot): string {
  return canonicalJson(
    JSON.parse(JSON.stringify(snapshot)) as JsonValue
  )
}

/** Parse and validate a snapshot from JSON text or a plain object. */
export function deserializeSnapshot(
  input: string | unknown
): AnalysisSnapshot {
  const raw: unknown =
    typeof input === 'string' ? (JSON.parse(input) as unknown) : input
  if (!isRecord(raw)) {
    throw new TypeError('AnalysisSnapshot must be a JSON object')
  }

  const out: Record<string, unknown> = {
    snapshot_id: requireString(raw.snapshot_id, 'snapshot_id'),
    lot_method: parseLotMethod(raw.lot_method),
    engine_version: requireString(raw.engine_version, 'engine_version'),
    analysis_date: requireString(raw.analysis_date, 'analysis_date'),
    schema_version: requireString(raw.schema_version, 'schema_version')
  }
  assignOptional(
    out,
    'participant_profile_version',
    optionalString(raw.participant_profile_version, 'participant_profile_version')
  )
  assignOptional(out, 'ledger_version', optionalString(raw.ledger_version, 'ledger_version'))
  assignOptional(
    out,
    'ownership_mappings_version',
    optionalString(raw.ownership_mappings_version, 'ownership_mappings_version')
  )
  assignOptional(
    out,
    'jurisdiction_pack_version',
    optionalString(raw.jurisdiction_pack_version, 'jurisdiction_pack_version')
  )
  assignOptional(out, 'rule_versions', parseRuleVersions(raw.rule_versions))
  assignOptional(
    out,
    'pack_git_commit',
    optionalString(raw.pack_git_commit, 'pack_git_commit')
  )
  assignOptional(
    out,
    'valuation_methodology',
    optionalString(raw.valuation_methodology, 'valuation_methodology')
  )
  assignOptional(
    out,
    'price_dataset_refs',
    parseStringArray(raw.price_dataset_refs, 'price_dataset_refs')
  )
  assignOptional(out, 'rounding_mode', parseRounding(raw.rounding_mode))
  assignOptional(
    out,
    'timezone_assumption',
    optionalString(raw.timezone_assumption, 'timezone_assumption')
  )
  assignOptional(
    out,
    'finding_refs',
    parseStringArray(raw.finding_refs, 'finding_refs')
  )

  return out as unknown as AnalysisSnapshot
}

export function snapshotsEqual(
  a: AnalysisSnapshot,
  b: AnalysisSnapshot
): boolean {
  return serializeSnapshot(a) === serializeSnapshot(b)
}
