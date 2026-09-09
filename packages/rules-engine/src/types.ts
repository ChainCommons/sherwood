import type { AuthorityLevel, CertaintyLevel, ReviewStatus } from '@octc/core'
import type { IsoDate, SourceAsOfView } from '@octc/source-registry'
import type { Predicate } from './dsl.ts'

export type { IsoDate }
export type { CompareOp, Predicate } from './dsl.ts'

export interface Certainty {
  readonly level: CertaintyLevel
  readonly reason?: string
}

export interface Review {
  readonly status: ReviewStatus
  readonly reviewer?: string
  readonly reviewer_qualification?: string
  readonly reviewed_at?: IsoDate
  readonly scope?: string
}

export interface RuleAppliesTo {
  readonly participant_types?: readonly string[]
  /** Capacity / event enums as strings so YAML loaders stay schema-light. */
  readonly capacities?: readonly string[]
  readonly event_types?: readonly string[]
  readonly asset_types?: readonly string[]
}

export interface RuleEffects {
  readonly classification?: string
  readonly valuation_rule?: string
  readonly reporting_rule?: string
  readonly tax_base_rule?: string
  readonly calculation_rule?: string
  readonly rounding_mode?: string
}

/** Plan 05 §29 — machine-readable rule with versioned predicate DSL v0. */
export interface Rule {
  readonly rule_id: string
  readonly jurisdiction_id: string
  readonly tax_domain: string
  readonly title: string
  readonly applies_to?: RuleAppliesTo
  /** DSL version for `conditions` (`0` / `v0`). */
  readonly dsl_version?: string
  readonly conditions?: Predicate
  readonly effects?: RuleEffects
  readonly effective_from: IsoDate
  readonly effective_to?: IsoDate
  readonly published_from: IsoDate
  readonly sources: readonly string[]
  readonly authority_status: AuthorityLevel
  readonly certainty: Certainty
  readonly supersedes?: readonly string[]
  readonly superseded_by?: readonly string[]
  readonly review: Review
  readonly test_cases?: readonly string[]
  readonly interpretations?: readonly string[]
  readonly notes?: string
  readonly schema_version: string
}

/** Plan 05 §100 / AC-011 — competing readings coexist. */
export interface Interpretation {
  readonly interpretation_id: string
  readonly jurisdiction_id: string
  readonly rule_id?: string
  readonly summary: string
  readonly reasoning?: string
  readonly sources: readonly string[]
  readonly certainty: Certainty
  readonly held_by?: string
  readonly conflicts_with?: readonly string[]
  readonly review: Review
  readonly schema_version: string
}

/** Minimal event shape for as-of + DSL selection (no Tezos types). */
export interface EvaluationEvent {
  readonly event_id?: string
  readonly event_type?: string
  readonly asset_type?: string
  /** Broad category for DSL `asset_category` comparisons. */
  readonly asset_category?: string
  /** Decimal string or safe integer — never a float (plan 17). */
  readonly amount?: string | number
}

export interface EvaluationParticipant {
  readonly participant_id?: string
  readonly participant_type?: string
  readonly capacity?: string
}

export interface AsOfDates {
  /** Economic / transaction calendar date. */
  readonly transactionDate: IsoDate
  /** When the analysis is being performed (analysis clock). */
  readonly analysisDate: IsoDate
}

export type EvaluationStatus =
  | 'APPLICABLE'
  | 'UNKNOWN'
  | 'REVIEW_REQUIRED'
  | 'UNRESOLVED'

export interface EvaluatedRule {
  readonly rule: Rule
  /** Always present — AC-001 provenance. */
  readonly sources: readonly SourceAsOfView[]
  readonly contemporaneousSources: readonly SourceAsOfView[]
  readonly laterSources: readonly SourceAsOfView[]
  /** True when published_from > transactionDate (anachronistic if used alone). */
  readonly publishedAfterTransaction: boolean
  readonly interpretations: readonly Interpretation[]
}

export interface EvaluationResult {
  readonly status: EvaluationStatus
  readonly asOf: AsOfDates
  readonly jurisdiction_id: string
  readonly applicable: readonly EvaluatedRule[]
  /** Rules effective for the period whose guidance was not yet public. */
  readonly laterGuidance: readonly EvaluatedRule[]
  readonly gaps: readonly string[]
  readonly certainty: Certainty
}
