/**
 * Findings builder — maps rules-engine evaluation output into §51 findings
 * with §52 explainability traces. Does not re-run valuation, lots, events,
 * or rule matching; those packages are consumed via caller-supplied context.
 */
import type { EvaluationResult, EvaluatedRule } from '../../rules-engine/src/types.ts'
import { buildExplainabilityTrace, isMaterialFinding } from './trace.ts'
import type {
  BuildMeta,
  BuildOptions,
  Finding,
  FindingCapacity,
  FindingCertainty,
  FindingStatus,
  TraceContext
} from './types.ts'

const DEFAULT_SCHEMA_VERSION = '0.1.0'

export interface ProvenanceIssue {
  readonly code: 'AC-001_MISSING_RULE' | 'AC-001_MISSING_SOURCE'
  readonly message: string
}

/** AC-001: a relevant finding must cite at least one rule and one source. */
export function checkProvenance(
  finding: Pick<Finding, 'status' | 'rule_refs' | 'source_refs'>
): readonly ProvenanceIssue[] {
  if (finding.status !== 'relevant') return []
  const issues: ProvenanceIssue[] = []
  if (!finding.rule_refs || finding.rule_refs.length === 0) {
    issues.push({
      code: 'AC-001_MISSING_RULE',
      message: 'relevant finding requires rule_refs'
    })
  }
  if (!finding.source_refs || finding.source_refs.length === 0) {
    issues.push({
      code: 'AC-001_MISSING_SOURCE',
      message: 'relevant finding requires source_refs'
    })
  }
  return issues
}

function slugPart(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
}

function findingId(
  meta: BuildMeta,
  jurisdiction: string,
  issue: string,
  ruleId: string | undefined
): string {
  if (meta.finding_id) return meta.finding_id
  const parts = ['finding', slugPart(jurisdiction), slugPart(issue)]
  if (ruleId) parts.push(slugPart(ruleId))
  return parts.filter(Boolean).join('-').slice(0, 120)
}

function sourceIds(er: EvaluatedRule): readonly string[] {
  const ids = er.sources.map((s) => s.source.source_id)
  return [...new Set(ids)]
}

function interpretationIds(er: EvaluatedRule): readonly string[] {
  return er.interpretations.map((i) => i.interpretation_id)
}

function statusFromEvaluation(
  evaluation: EvaluationResult,
  ruleRefs: readonly string[],
  sourceRefs: readonly string[]
): FindingStatus {
  switch (evaluation.status) {
    case 'APPLICABLE':
      // AC-001: never emit relevant without provenance.
      if (ruleRefs.length > 0 && sourceRefs.length > 0) return 'relevant'
      return 'unknown'
    case 'REVIEW_REQUIRED':
    case 'UNRESOLVED':
      return 'potentially_relevant'
    case 'UNKNOWN':
      return 'unknown'
  }
}

function certaintyFromEvaluation(
  evaluation: EvaluationResult,
  er?: EvaluatedRule
): FindingCertainty {
  if (er !== undefined) {
    return {
      level: er.rule.certainty.level,
      ...(er.rule.certainty.reason !== undefined
        ? { reason: er.rule.certainty.reason }
        : evaluation.certainty.reason !== undefined
          ? { reason: evaluation.certainty.reason }
          : {})
    }
  }
  return {
    level: evaluation.certainty.level,
    ...(evaluation.certainty.reason !== undefined
      ? { reason: evaluation.certainty.reason }
      : {})
  }
}

function capacityFromTrace(
  trace: TraceContext | undefined
): FindingCapacity | undefined {
  if (!trace?.capacity) return undefined
  const { detail: _detail, ...capacity } = trace.capacity
  return capacity
}

function attachTrace(
  finding: Finding,
  traceCtx: TraceContext | undefined
): Finding {
  if (!isMaterialFinding(finding) && finding.status !== 'unknown') {
    return finding
  }
  const trace = buildExplainabilityTrace(finding, traceCtx ?? {})
  return { ...finding, trace }
}

function baseFinding(args: {
  meta: BuildMeta
  options: BuildOptions
  jurisdiction: string
  issue: string
  status: FindingStatus
  certainty: FindingCertainty
  explanation: string
  rule_refs?: readonly string[]
  source_refs?: readonly string[]
  competing_interpretations?: readonly string[] | undefined
  professional_review_recommended?: boolean | undefined
  ruleId?: string | undefined
}): Finding {
  const capacity = capacityFromTrace(args.options.trace)
  const event_refs = args.options.trace?.events?.refs
  const valuation_refs = args.options.trace?.valuations?.refs
  const lot_refs = args.options.trace?.lots?.refs
  const calculation = args.options.trace?.calculation
    ? (() => {
        const { detail: _d, ...calc } = args.options.trace!.calculation!
        return Object.keys(calc).length > 0 ? calc : undefined
      })()
    : undefined

  const finding: Finding = {
    finding_id: findingId(
      args.meta,
      args.jurisdiction,
      args.issue,
      args.ruleId
    ),
    ...(args.options.participant !== undefined
      ? { participant: args.options.participant }
      : {}),
    ...(capacity !== undefined ? { capacity } : {}),
    ...(event_refs !== undefined && event_refs.length > 0
      ? { event_refs }
      : {}),
    ...(args.rule_refs !== undefined && args.rule_refs.length > 0
      ? { rule_refs: args.rule_refs }
      : {}),
    ...(args.source_refs !== undefined && args.source_refs.length > 0
      ? { source_refs: args.source_refs }
      : {}),
    jurisdiction: args.jurisdiction,
    issue: args.issue,
    status: args.status,
    ...(args.options.posture !== undefined
      ? { posture: args.options.posture }
      : {}),
    ...(calculation !== undefined ? { calculation } : {}),
    ...(args.options.assumptions !== undefined &&
    args.options.assumptions.length > 0
      ? { assumptions: args.options.assumptions }
      : {}),
    ...(args.options.missing_facts !== undefined &&
    args.options.missing_facts.length > 0
      ? { missing_facts: args.options.missing_facts }
      : {}),
    ...(valuation_refs !== undefined && valuation_refs.length > 0
      ? { valuation_refs }
      : {}),
    ...(lot_refs !== undefined && lot_refs.length > 0 ? { lot_refs } : {}),
    certainty: args.certainty,
    ...(args.competing_interpretations !== undefined &&
    args.competing_interpretations.length > 0
      ? { competing_interpretations: args.competing_interpretations }
      : {}),
    explanation: args.explanation,
    ...(args.professional_review_recommended !== undefined
      ? {
          professional_review_recommended:
            args.professional_review_recommended
        }
      : {}),
    generated_at: args.meta.generated_at,
    engine_version: args.meta.engine_version,
    rule_pack_version: args.meta.rule_pack_version,
    schema_version: args.meta.schema_version ?? DEFAULT_SCHEMA_VERSION
  }

  // Demote any relevant finding that somehow lacks provenance (AC-001).
  const issues = checkProvenance(finding)
  if (issues.length > 0) {
    const demoted: Finding = {
      ...finding,
      status: 'unknown',
      certainty: {
        level: 'UNKNOWN',
        reason: issues.map((i) => i.message).join('; ')
      },
      explanation:
        finding.explanation +
        ' [demoted to UNKNOWN: missing rule/source provenance]'
    }
    return attachTrace(demoted, args.options.trace)
  }

  return attachTrace(finding, args.options.trace)
}

function findingFromEvaluatedRule(
  evaluation: EvaluationResult,
  er: EvaluatedRule,
  meta: BuildMeta,
  options: BuildOptions,
  extras?: {
    readonly competing?: readonly string[]
    readonly forceStatus?: FindingStatus
    readonly review?: boolean
  }
): Finding {
  const rule_refs = [er.rule.rule_id]
  const source_refs = sourceIds(er)
  const issue =
    options.issue ?? er.rule.title ?? er.rule.rule_id
  const status =
    extras?.forceStatus ??
    statusFromEvaluation(evaluation, rule_refs, source_refs)
  const competing =
    extras?.competing ??
    (evaluation.status === 'UNRESOLVED' ? interpretationIds(er) : undefined)

  let explanation: string
  if (status === 'unknown' && source_refs.length === 0) {
    explanation = `Rule ${er.rule.rule_id} lacks resolvable sources; treatment is UNKNOWN.`
  } else if (evaluation.status === 'UNRESOLVED') {
    explanation = `Competing interpretations for ${er.rule.rule_id}; no winner selected.`
  } else if (evaluation.status === 'REVIEW_REQUIRED') {
    explanation = `Rule ${er.rule.rule_id} applies but requires professional review.`
  } else {
    explanation = `Rule ${er.rule.rule_id} applies under ${evaluation.jurisdiction_id}.`
  }

  const review =
    extras?.review === true ||
    evaluation.status === 'REVIEW_REQUIRED' ||
    evaluation.status === 'UNRESOLVED'

  return baseFinding({
    meta,
    options,
    jurisdiction: evaluation.jurisdiction_id,
    issue,
    status,
    certainty: certaintyFromEvaluation(evaluation, er),
    explanation,
    rule_refs,
    source_refs,
    ...(competing !== undefined && competing.length > 0
      ? { competing_interpretations: competing }
      : {}),
    ...(review ? { professional_review_recommended: true } : {}),
    ruleId: er.rule.rule_id
  })
}

export interface BuildFindingsInput {
  readonly evaluation: EvaluationResult
  readonly meta: BuildMeta
  readonly options?: BuildOptions
}

/**
 * Build §51 findings from a rules-engine `EvaluationResult`.
 * Unsupported / gap outcomes become `unknown` (AC-003).
 * Material findings always carry a §52 trace.
 */
export function buildFindings(input: BuildFindingsInput): Finding[] {
  const { evaluation, meta } = input
  const options = input.options ?? {}
  const missing = [
    ...(options.missing_facts ?? []),
    ...evaluation.gaps
  ]
  const opts: BuildOptions = {
    ...options,
    ...(missing.length > 0 ? { missing_facts: missing } : {})
  }

  if (evaluation.status === 'UNKNOWN' && evaluation.applicable.length === 0) {
    const later = evaluation.laterGuidance
    const laterIds = later.map((e) => e.rule.rule_id)
    const laterSources = [
      ...new Set(later.flatMap((e) => sourceIds(e)))
    ]
    const issue =
      opts.issue ??
      (laterIds.length > 0
        ? 'Later-published guidance only'
        : 'Unsupported treatment')
    const explanation =
      evaluation.gaps.length > 0
        ? evaluation.gaps.join('; ')
        : laterIds.length > 0
          ? `No contemporaneous rule; later guidance: ${laterIds.join(', ')}.`
          : 'No applicable rule for this event; treatment is UNKNOWN.'

    const finding = baseFinding({
      meta,
      options: opts,
      jurisdiction: evaluation.jurisdiction_id,
      issue,
      status: 'unknown',
      certainty: certaintyFromEvaluation(evaluation),
      explanation,
      // Later guidance may be cited for transparency but must not upgrade status.
      ...(laterIds.length > 0 ? { rule_refs: laterIds } : {}),
      ...(laterSources.length > 0 ? { source_refs: laterSources } : {}),
      professional_review_recommended: laterIds.length > 0
    })
    return [finding]
  }

  if (evaluation.status === 'UNRESOLVED') {
    // One finding that surfaces all competing interpretations together.
    const rules = evaluation.applicable
    if (rules.length === 0) {
      return [
        baseFinding({
          meta,
          options: opts,
          jurisdiction: evaluation.jurisdiction_id,
          issue: opts.issue ?? 'Unresolved conflict',
          status: 'unknown',
          certainty: certaintyFromEvaluation(evaluation),
          explanation:
            'Evaluation marked UNRESOLVED but no applicable rules were attached.'
        })
      ]
    }
    const competing = [
      ...new Set(rules.flatMap((er) => interpretationIds(er)))
    ]
    // Prefer a single finding when one rule carries the conflict; else one per rule.
    if (rules.length === 1) {
      return [
        findingFromEvaluatedRule(evaluation, rules[0]!, meta, opts, {
          competing,
          forceStatus: 'potentially_relevant',
          review: true
        })
      ]
    }
    return rules.map((er) =>
      findingFromEvaluatedRule(evaluation, er, meta, opts, {
        competing: interpretationIds(er),
        forceStatus: 'potentially_relevant',
        review: true
      })
    )
  }

  const targets =
    evaluation.applicable.length > 0
      ? evaluation.applicable
      : evaluation.laterGuidance

  if (targets.length === 0) {
    return [
      baseFinding({
        meta,
        options: opts,
        jurisdiction: evaluation.jurisdiction_id,
        issue: opts.issue ?? 'Unsupported treatment',
        status: 'unknown',
        certainty: {
          level: 'UNKNOWN',
          reason: 'No rules attached to evaluation'
        },
        explanation: 'No applicable or later-guidance rules; treatment is UNKNOWN.'
      })
    ]
  }

  return targets.map((er) =>
    findingFromEvaluatedRule(evaluation, er, meta, opts, {
      review: evaluation.status === 'REVIEW_REQUIRED'
    })
  )
}

/**
 * Build a single finding from an already-assembled record shape, attaching
 * the §52 trace and enforcing AC-001 demotion when needed.
 */
export function finalizeFinding(
  draft: Finding,
  traceCtx?: TraceContext
): Finding {
  const withTrace = attachTrace(draft, traceCtx)
  const issues = checkProvenance(withTrace)
  if (issues.length === 0) return withTrace
  return attachTrace(
    {
      ...withTrace,
      status: 'unknown',
      certainty: {
        level: 'UNKNOWN',
        reason: issues.map((i) => i.message).join('; ')
      },
      explanation:
        withTrace.explanation +
        ' [demoted to UNKNOWN: missing rule/source provenance]'
    },
    traceCtx
  )
}
