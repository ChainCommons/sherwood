import type { Finding, TraceContext, TraceStep, TraceStepKind } from './types.ts'
import { TRACE_STEPS } from './types.ts'

function step(
  kind: TraceStepKind,
  refs: readonly string[] | undefined,
  detail: string | undefined
): TraceStep {
  const out: TraceStep = { step: kind, refs: refs ?? [] }
  if (detail !== undefined) return { ...out, detail }
  return out
}

/**
 * Build the §52 explainability chain for a finding.
 * Empty sections stay present so the UI can show gaps rather than hide them.
 * Detail strings are structured notes from upstream engines — not AI prose.
 */
export function buildExplainabilityTrace(
  finding: Pick<
    Finding,
    | 'rule_refs'
    | 'source_refs'
    | 'event_refs'
    | 'valuation_refs'
    | 'lot_refs'
    | 'capacity'
    | 'calculation'
    | 'status'
    | 'certainty'
    | 'missing_facts'
    | 'explanation'
  >,
  context: TraceContext = {}
): readonly TraceStep[] {
  const capacityRefs =
    finding.capacity !== undefined ? [finding.capacity.primary] : undefined
  const capacityDetail =
    context.capacity?.detail ??
    (finding.capacity !== undefined
      ? `primary=${finding.capacity.primary}; status=${finding.capacity.status}`
      : 'Capacity not declared')

  const calcDetail =
    context.calculation?.detail ??
    (finding.calculation?.formula !== undefined
      ? finding.calculation.formula
      : finding.calculation !== undefined
        ? 'Calculation inputs recorded'
        : undefined)

  const resultDetail =
    finding.status === 'unknown'
      ? finding.certainty.reason ??
        finding.missing_facts?.join('; ') ??
        finding.explanation
      : finding.explanation

  return TRACE_STEPS.map((kind) => {
    switch (kind) {
      case 'FACTS':
        return step(kind, context.facts?.refs, context.facts?.detail)
      case 'RAW_EVIDENCE':
        return step(kind, context.evidence?.refs, context.evidence?.detail)
      case 'ECONOMIC_EVENT':
        return step(
          kind,
          context.events?.refs ?? finding.event_refs,
          context.events?.detail
        )
      case 'CAPACITY':
        return step(kind, capacityRefs, capacityDetail)
      case 'VALUATION':
        return step(
          kind,
          context.valuations?.refs ?? finding.valuation_refs,
          context.valuations?.detail
        )
      case 'LOT_OR_POSITION':
        return step(
          kind,
          context.lots?.refs ?? finding.lot_refs,
          context.lots?.detail
        )
      case 'RULE':
        return step(
          kind,
          finding.rule_refs,
          finding.rule_refs && finding.rule_refs.length > 0
            ? undefined
            : 'No applicable rule cited'
        )
      case 'SOURCE':
        return step(
          kind,
          finding.source_refs,
          finding.source_refs && finding.source_refs.length > 0
            ? undefined
            : 'No source cited'
        )
      case 'CALCULATION':
        return step(
          kind,
          finding.calculation?.inputs,
          calcDetail ??
            (finding.calculation === undefined ? 'No calculation' : undefined)
        )
      case 'RESULT_OR_UNCERTAINTY':
        return step(
          kind,
          finding.missing_facts,
          `status=${finding.status}; certainty=${finding.certainty.level}` +
            (resultDetail ? `; ${resultDetail}` : '')
        )
    }
  })
}

/** Material findings are those that could display a legal treatment conclusion. */
export function isMaterialFinding(
  finding: Pick<Finding, 'status'>
): boolean {
  return finding.status === 'relevant' || finding.status === 'potentially_relevant'
}
