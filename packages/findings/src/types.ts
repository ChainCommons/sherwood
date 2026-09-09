/**
 * Plan 09 §51 finding records and §52 explainability trace steps.
 * Shapes mirror schemas/finding/finding.schema.json.
 * Analysis snapshots mirror schemas/snapshot/snapshot.schema.json (plan 09 §93).
 */
import type {
  Capacity,
  CertaintyLevel,
  FindingPosture,
  FindingStatus,
  LotMethod
} from '../../core/src/enums.ts'
import { ROUNDING_MODES } from '../../core/src/enums.ts'

export type {
  Capacity,
  CertaintyLevel,
  FindingPosture,
  FindingStatus,
  LotMethod
}
export type RoundingMode = (typeof ROUNDING_MODES)[number]
// Re-export for callers that want the const array.
export { ROUNDING_MODES }

/** §52 chain — UI accordion sections; never replaced by AI prose. */
export const TRACE_STEPS = [
  'FACTS',
  'RAW_EVIDENCE',
  'ECONOMIC_EVENT',
  'CAPACITY',
  'VALUATION',
  'LOT_OR_POSITION',
  'RULE',
  'SOURCE',
  'CALCULATION',
  'RESULT_OR_UNCERTAINTY'
] as const
export type TraceStepKind = (typeof TRACE_STEPS)[number]

export interface TraceStep {
  readonly step: TraceStepKind
  readonly refs: readonly string[]
  readonly detail?: string
}

export interface FindingCertainty {
  readonly level: CertaintyLevel
  readonly reason?: string
}

export interface FindingCapacity {
  readonly primary: Capacity
  readonly secondary?: readonly Capacity[]
  readonly as_of?: string
  readonly status: 'USER_CONFIRMED' | 'INFERRED' | 'UNKNOWN'
  readonly candidates?: readonly {
    readonly capacity: Capacity
    readonly reason?: string
  }[]
}

export interface FindingCalculation {
  readonly amount?: string
  readonly currency?: string
  readonly formula?: string
  readonly rounding_mode?: RoundingMode
  readonly inputs?: readonly string[]
}

/** Plan 09 §51 finding. */
export interface Finding {
  readonly finding_id: string
  readonly participant?: string
  readonly capacity?: FindingCapacity
  readonly event_refs?: readonly string[]
  readonly rule_refs?: readonly string[]
  readonly source_refs?: readonly string[]
  readonly jurisdiction: string
  readonly issue: string
  readonly status: FindingStatus
  readonly posture?: FindingPosture
  readonly calculation?: FindingCalculation
  readonly assumptions?: readonly string[]
  readonly missing_facts?: readonly string[]
  readonly valuation_refs?: readonly string[]
  readonly lot_refs?: readonly string[]
  readonly certainty: FindingCertainty
  readonly competing_interpretations?: readonly string[]
  readonly explanation: string
  /** §52 explainability chain when the finding is material. */
  readonly trace?: readonly TraceStep[]
  readonly professional_review_recommended?: boolean
  readonly generated_at: string
  readonly engine_version: string
  readonly rule_pack_version: string
  readonly schema_version: string
}

/** Caller-supplied facts that engines already produced; findings does not recompute them. */
export interface TraceContext {
  readonly facts?: { readonly refs?: readonly string[]; readonly detail?: string }
  readonly evidence?: { readonly refs?: readonly string[]; readonly detail?: string }
  readonly events?: { readonly refs?: readonly string[]; readonly detail?: string }
  readonly capacity?: FindingCapacity & { readonly detail?: string }
  readonly valuations?: { readonly refs?: readonly string[]; readonly detail?: string }
  readonly lots?: { readonly refs?: readonly string[]; readonly detail?: string }
  readonly calculation?: FindingCalculation & { readonly detail?: string }
}

export interface BuildMeta {
  readonly engine_version: string
  readonly rule_pack_version: string
  /** ISO-8601 instant. */
  readonly generated_at: string
  /** Defaults to `0.1.0`. */
  readonly schema_version?: string
  /** Optional stable id; otherwise derived from jurisdiction + issue + rule. */
  readonly finding_id?: string
}

export interface BuildOptions {
  readonly participant?: string
  readonly posture?: FindingPosture
  readonly issue?: string
  readonly assumptions?: readonly string[]
  readonly missing_facts?: readonly string[]
  readonly trace?: TraceContext
}

/** Plan 09 §93 / schema rule_versions entry. */
export interface SnapshotRuleVersion {
  readonly rule_id: string
  readonly version: string
}

/**
 * Analysis snapshot — unit of reproducibility (AC-006).
 * Mirrors schemas/snapshot/snapshot.schema.json.
 */
export interface AnalysisSnapshot {
  readonly snapshot_id: string
  readonly participant_profile_version?: string
  readonly ledger_version?: string
  readonly ownership_mappings_version?: string
  readonly jurisdiction_pack_version?: string
  readonly rule_versions?: readonly SnapshotRuleVersion[]
  readonly pack_git_commit?: string
  readonly valuation_methodology?: string
  readonly price_dataset_refs?: readonly string[]
  readonly lot_method: LotMethod
  readonly rounding_mode?: RoundingMode
  readonly timezone_assumption?: string
  readonly engine_version: string
  /** ISO-8601 instant when the analysis was performed. */
  readonly analysis_date: string
  readonly finding_refs?: readonly string[]
  readonly schema_version: string
}

/** Caller-supplied version/method fields recorded on every saved analysis. */
export interface SnapshotMeta {
  readonly lot_method: LotMethod
  /** ISO-8601 instant. */
  readonly analysis_date: string
  /** Defaults to analyze engine version string. */
  readonly engine_version?: string
  readonly snapshot_id?: string
  readonly participant_profile_version?: string
  readonly ledger_version?: string
  readonly ownership_mappings_version?: string
  readonly jurisdiction_pack_version?: string
  readonly rule_versions?: readonly SnapshotRuleVersion[]
  readonly pack_git_commit?: string
  readonly valuation_methodology?: string
  readonly price_dataset_refs?: readonly string[]
  readonly rounding_mode?: RoundingMode
  readonly timezone_assumption?: string
  /** Defaults to `0.1.0`. */
  readonly schema_version?: string
}

/** Explicit diff when a reproduce pass does not match the saved analysis. */
export interface EngineDiff {
  readonly code:
    | 'ENGINE_VERSION_MISMATCH'
    | 'FINDING_MISMATCH'
    | 'SNAPSHOT_FIELD_MISMATCH'
    | 'FINDING_COUNT_MISMATCH'
  readonly message: string
  readonly expected?: string
  readonly actual?: string
}
