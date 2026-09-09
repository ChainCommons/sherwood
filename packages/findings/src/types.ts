/**
 * Plan 09 §51 finding records and §52 explainability trace steps.
 * Shapes mirror schemas/finding/finding.schema.json.
 */
import type {
  Capacity,
  CertaintyLevel,
  FindingPosture,
  FindingStatus
} from '../../core/src/enums.ts'
import { ROUNDING_MODES } from '../../core/src/enums.ts'

export type {
  Capacity,
  CertaintyLevel,
  FindingPosture,
  FindingStatus
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
