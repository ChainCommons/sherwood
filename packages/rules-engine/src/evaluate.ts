import { rangeContains } from '@octc/core'
import { assertIsoDate } from '@octc/source-registry'
import { isSupportedDslVersion, matchConditions } from './dsl.ts'
import type { JurisdictionPack } from './pack.ts'
import type {
  AsOfDates,
  EvaluatedRule,
  EvaluationEvent,
  EvaluationParticipant,
  EvaluationResult,
  Interpretation,
  Rule
} from './types.ts'

export interface EvaluateInput {
  readonly event: EvaluationEvent
  readonly participant: EvaluationParticipant
  readonly asOf: AsOfDates
  readonly pack: JurisdictionPack
  /** Optional boolean facts for DSL `jurisdiction_facts.*` fields. */
  readonly jurisdiction_facts?: Readonly<Record<string, boolean>>
}

function ruleEffectiveOn(rule: Rule, date: string): boolean {
  return rangeContains({ from: rule.effective_from, to: rule.effective_to }, date)
}

function matchesAppliesTo(
  rule: Rule,
  event: EvaluationEvent,
  participant: EvaluationParticipant
): boolean {
  const a = rule.applies_to
  if (!a) return true

  if (a.event_types && a.event_types.length > 0) {
    if (event.event_type === undefined) return false
    if (!a.event_types.includes(event.event_type)) return false
  }
  if (a.capacities && a.capacities.length > 0) {
    if (participant.capacity === undefined) return false
    if (!a.capacities.includes(participant.capacity)) return false
  }
  if (a.participant_types && a.participant_types.length > 0) {
    if (participant.participant_type === undefined) return false
    if (!a.participant_types.includes(participant.participant_type)) return false
  }
  if (a.asset_types && a.asset_types.length > 0) {
    if (event.asset_type === undefined) return false
    if (!a.asset_types.includes(event.asset_type)) return false
  }
  return true
}

function interpretationsFor(
  rule: Rule,
  pack: JurisdictionPack
): readonly Interpretation[] {
  const ids = new Set(rule.interpretations ?? [])
  return pack.interpretations.filter(
    (i) => ids.has(i.interpretation_id) || i.rule_id === rule.rule_id
  )
}

function attachSources(rule: Rule, pack: JurisdictionPack, transactionDate: string): EvaluatedRule {
  if (rule.sources.length === 0) {
    throw new Error(`rule ${rule.rule_id} has empty sources[] (AC-001)`)
  }
  const sources = pack.sources.resolveAsOf(rule.sources, transactionDate)
  const contemporaneousSources = sources.filter((s) => s.published)
  const laterSources = sources.filter((s) => !s.published)
  return {
    rule,
    sources,
    contemporaneousSources,
    laterSources,
    publishedAfterTransaction: rule.published_from > transactionDate,
    interpretations: interpretationsFor(rule, pack)
  }
}

/**
 * Evaluate a pack at a transaction date without applying anachronistic
 * guidance as if it were contemporaneous (AC-002).
 */
export function evaluate(input: EvaluateInput): EvaluationResult {
  const transactionDate = assertIsoDate(input.asOf.transactionDate, 'transactionDate')
  const analysisDate = assertIsoDate(input.asOf.analysisDate, 'analysisDate')
  const asOf: AsOfDates = { transactionDate, analysisDate }
  const { pack, event, participant } = input
  const dslCtx = {
    event,
    participant,
    ...(input.jurisdiction_facts !== undefined
      ? { jurisdiction_facts: input.jurisdiction_facts }
      : {})
  }

  const candidates = pack.rules.filter(
    (r) =>
      r.jurisdiction_id === pack.jurisdiction_id &&
      ruleEffectiveOn(r, transactionDate) &&
      matchesAppliesTo(r, event, participant) &&
      matchConditions(r.conditions, r.dsl_version, dslCtx)
  )

  const applicable: EvaluatedRule[] = []
  const laterGuidance: EvaluatedRule[] = []
  const gaps: string[] = []

  for (const rule of pack.rules) {
    if (rule.jurisdiction_id !== pack.jurisdiction_id) continue
    if (!ruleEffectiveOn(rule, transactionDate)) continue
    if (!matchesAppliesTo(rule, event, participant)) continue
    if (rule.conditions !== undefined && !isSupportedDslVersion(rule.dsl_version)) {
      gaps.push(
        `rule ${rule.rule_id} declares unsupported dsl_version ${String(rule.dsl_version)}`
      )
    }
  }

  for (const rule of candidates) {
    const evaluated = attachSources(rule, pack, transactionDate)
    if (evaluated.publishedAfterTransaction) {
      laterGuidance.push(evaluated)
    } else {
      applicable.push(evaluated)
    }
  }

  if (applicable.length === 0 && laterGuidance.length === 0) {
    gaps.push('no rule matches event/capacity for this transaction date')
  } else if (applicable.length === 0 && laterGuidance.length > 0) {
    gaps.push(
      'only later-published guidance covers this period; contemporaneous sources are absent'
    )
  }

  const dual = applicable.filter((e) => e.interpretations.length >= 2)
  const needsReview = applicable.some(
    (e) =>
      e.rule.certainty.level === 'AMBIGUOUS' ||
      e.rule.certainty.level === 'UNSETTLED' ||
      e.rule.review.status === 'DISPUTED'
  )
  const unsupportedDsl = gaps.some((g) => g.includes('unsupported dsl_version'))

  let status: EvaluationResult['status']
  if (dual.length > 0) {
    status = 'UNRESOLVED'
  } else if (applicable.length === 0) {
    status = unsupportedDsl ? 'REVIEW_REQUIRED' : 'UNKNOWN'
  } else if (needsReview) {
    status = 'REVIEW_REQUIRED'
  } else {
    status = 'APPLICABLE'
  }

  const certainty =
    status === 'UNKNOWN'
      ? { level: 'UNKNOWN' as const, reason: gaps[0] ?? 'unsupported treatment' }
      : status === 'UNRESOLVED'
        ? {
            level: 'CONFLICTING_AUTHORITIES' as const,
            reason: 'competing interpretations coexist; no consensus manufactured'
          }
        : { level: applicable[0]?.rule.certainty.level ?? ('UNKNOWN' as const) }

  return {
    status,
    asOf,
    jurisdiction_id: pack.jurisdiction_id,
    applicable,
    laterGuidance,
    gaps,
    certainty
  }
}
