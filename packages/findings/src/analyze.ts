/**
 * `analyze()` facade (plan 13 §74) + AC-006 reproduce.
 *
 * Composes findings from rules-engine evaluation output and records a §93
 * analysis snapshot. Does not re-run valuation, lots, or rule matching —
 * callers supply those as evaluation results and version/method metadata.
 *
 * Workspace/CLI should eventually call a Steward-owned re-export from
 * packages/core; this package owns the findings+snapshot implementation.
 */
import { canonicalJson } from '../../core/src/index.ts'
import type { JsonValue } from '../../core/src/index.ts'
import { buildFindings } from './builder.ts'
import type { BuildFindingsInput } from './builder.ts'
import {
  buildSnapshot,
  deserializeSnapshot,
  serializeSnapshot,
  SNAPSHOT_SCHEMA_VERSION,
  snapshotsEqual
} from './snapshot.ts'
import type {
  AnalysisSnapshot,
  EngineDiff,
  Finding,
  SnapshotMeta,
  SnapshotRuleVersion
} from './types.ts'

/** Version string recorded on snapshots produced by this facade. */
export const ANALYZE_ENGINE_VERSION = 'analyze@0.0.0'

export interface AnalyzeInput {
  /**
   * One or more rules-engine evaluations already produced upstream.
   * Each entry becomes one or more §51 findings via `buildFindings`.
   */
  readonly evaluations: readonly BuildFindingsInput[]
  /** Versions and methods that make the analysis reproducible (AC-006). */
  readonly snapshot: SnapshotMeta
}

export interface AnalyzeResult {
  readonly findings: readonly Finding[]
  readonly snapshot: AnalysisSnapshot
  readonly engine_version: string
}

export interface ReproduceResult {
  /** True when re-run findings and comparable snapshot fields match the saved analysis. */
  readonly match: boolean
  readonly findings: readonly Finding[]
  readonly snapshot: AnalysisSnapshot
  readonly diffs: readonly EngineDiff[]
}

function collectRuleVersions(
  evaluations: readonly BuildFindingsInput[],
  explicit: readonly SnapshotRuleVersion[] | undefined
): readonly SnapshotRuleVersion[] | undefined {
  if (explicit !== undefined) return explicit
  const seen = new Map<string, string>()
  for (const { evaluation } of evaluations) {
    for (const er of [...evaluation.applicable, ...evaluation.laterGuidance]) {
      if (!seen.has(er.rule.rule_id)) {
        seen.set(er.rule.rule_id, er.rule.schema_version)
      }
    }
  }
  if (seen.size === 0) return undefined
  return [...seen.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([rule_id, version]) => ({ rule_id, version }))
}

/**
 * Run the findings-side analysis facade: build §51 findings and a §93 snapshot.
 */
export function analyze(input: AnalyzeInput): AnalyzeResult {
  if (input.evaluations.length === 0) {
    throw new TypeError('analyze() requires at least one evaluation')
  }

  const engine_version =
    input.snapshot.engine_version ?? ANALYZE_ENGINE_VERSION

  const findings = input.evaluations.flatMap((entry) =>
    buildFindings({
      ...entry,
      meta: {
        ...entry.meta,
        // Align finding engine_version with the snapshot analyze version
        // unless the caller already pinned a distinct findings builder version.
        engine_version: entry.meta.engine_version || engine_version
      }
    })
  )

  const rule_versions = collectRuleVersions(
    input.evaluations,
    input.snapshot.rule_versions
  )
  const snapshot = buildSnapshot(
    {
      ...input.snapshot,
      engine_version,
      schema_version: input.snapshot.schema_version ?? SNAPSHOT_SCHEMA_VERSION,
      ...(rule_versions !== undefined ? { rule_versions } : {})
    },
    findings.map((f) => f.finding_id)
  )

  return { findings, snapshot, engine_version }
}

function findingsEqual(a: readonly Finding[], b: readonly Finding[]): boolean {
  if (a.length !== b.length) return false
  const left = a.map((f) => serializeFinding(f)).sort()
  const right = b.map((f) => serializeFinding(f)).sort()
  return left.every((v, i) => v === right[i])
}

function serializeFinding(finding: Finding): string {
  return canonicalJson(JSON.parse(JSON.stringify(finding)) as JsonValue)
}

/** Comparable snapshot fields that must match for AC-006 (id may be regenerated). */
const SNAPSHOT_COMPARE_KEYS = [
  'participant_profile_version',
  'ledger_version',
  'ownership_mappings_version',
  'jurisdiction_pack_version',
  'pack_git_commit',
  'valuation_methodology',
  'lot_method',
  'rounding_mode',
  'timezone_assumption',
  'engine_version',
  'analysis_date',
  'schema_version'
] as const

function compareSnapshotFields(
  saved: AnalysisSnapshot,
  next: AnalysisSnapshot
): EngineDiff[] {
  const diffs: EngineDiff[] = []
  for (const key of SNAPSHOT_COMPARE_KEYS) {
    const expected = saved[key]
    const actual = next[key]
    if (expected !== actual) {
      const diff: EngineDiff = {
        code: 'SNAPSHOT_FIELD_MISMATCH',
        message: `snapshot.${key} diverged`,
        ...(expected !== undefined ? { expected: String(expected) } : {}),
        ...(actual !== undefined ? { actual: String(actual) } : {})
      }
      diffs.push(diff)
    }
  }
  if (
    canonicalJson(
      (saved.price_dataset_refs ?? []) as unknown as JsonValue
    ) !==
    canonicalJson((next.price_dataset_refs ?? []) as unknown as JsonValue)
  ) {
    diffs.push({
      code: 'SNAPSHOT_FIELD_MISMATCH',
      message: 'snapshot.price_dataset_refs diverged',
      expected: JSON.stringify(saved.price_dataset_refs ?? []),
      actual: JSON.stringify(next.price_dataset_refs ?? [])
    })
  }
  if (
    canonicalJson((saved.rule_versions ?? []) as unknown as JsonValue) !==
    canonicalJson((next.rule_versions ?? []) as unknown as JsonValue)
  ) {
    diffs.push({
      code: 'SNAPSHOT_FIELD_MISMATCH',
      message: 'snapshot.rule_versions diverged',
      expected: JSON.stringify(saved.rule_versions ?? []),
      actual: JSON.stringify(next.rule_versions ?? [])
    })
  }
  return diffs
}

/**
 * Re-run analysis with the same versions/methods and compare to a saved result
 * (AC-006). Engine version mismatches surface as an explicit engine diff rather
 * than a silent inequality.
 */
export function reproduce(
  saved: AnalyzeResult,
  input: AnalyzeInput
): ReproduceResult {
  const rerun = analyze({
    ...input,
    snapshot: {
      ...input.snapshot,
      // Prefer the saved snapshot id so a match can round-trip the same record.
      snapshot_id: input.snapshot.snapshot_id ?? saved.snapshot.snapshot_id,
      engine_version:
        input.snapshot.engine_version ?? saved.snapshot.engine_version
    }
  })

  const diffs: EngineDiff[] = []

  if (saved.snapshot.engine_version !== rerun.snapshot.engine_version) {
    diffs.push({
      code: 'ENGINE_VERSION_MISMATCH',
      message: 'Saved analysis engine_version does not match reproduce run',
      expected: saved.snapshot.engine_version,
      actual: rerun.snapshot.engine_version
    })
  }

  diffs.push(...compareSnapshotFields(saved.snapshot, rerun.snapshot))

  if (saved.findings.length !== rerun.findings.length) {
    diffs.push({
      code: 'FINDING_COUNT_MISMATCH',
      message: 'Finding count diverged on reproduce',
      expected: String(saved.findings.length),
      actual: String(rerun.findings.length)
    })
  } else if (!findingsEqual(saved.findings, rerun.findings)) {
    diffs.push({
      code: 'FINDING_MISMATCH',
      message: 'Findings diverged on reproduce with recorded versions/methods'
    })
  }

  // Deduplicate field diffs that may appear twice from engine_version check.
  const seen = new Set<string>()
  const unique = diffs.filter((d) => {
    const key = `${d.code}:${d.message}:${d.expected}:${d.actual}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return {
    match: unique.length === 0,
    findings: rerun.findings,
    snapshot: rerun.snapshot,
    diffs: unique
  }
}

export interface SerializedAnalysis {
  readonly findings: readonly Finding[]
  readonly snapshot: AnalysisSnapshot
  readonly engine_version: string
}

/** Serialize an analyze result (findings + snapshot) as canonical JSON. */
export function serializeAnalysis(result: AnalyzeResult): string {
  const payload: SerializedAnalysis = {
    findings: result.findings,
    snapshot: result.snapshot,
    engine_version: result.engine_version
  }
  return canonicalJson(JSON.parse(JSON.stringify(payload)) as JsonValue)
}

/** Deserialize a saved analysis produced by `serializeAnalysis`. */
export function deserializeAnalysis(json: string): AnalyzeResult {
  const raw = JSON.parse(json) as unknown
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw new TypeError('Serialized analysis must be a JSON object')
  }
  const obj = raw as Record<string, unknown>
  if (!Array.isArray(obj.findings)) {
    throw new TypeError('Serialized analysis.findings must be an array')
  }
  const snapshot = deserializeSnapshot(obj.snapshot)
  const engine_version =
    typeof obj.engine_version === 'string' && obj.engine_version.length > 0
      ? obj.engine_version
      : snapshot.engine_version
  return {
    findings: obj.findings as Finding[],
    snapshot,
    engine_version
  }
}

export { snapshotsEqual, serializeSnapshot, deserializeSnapshot }
