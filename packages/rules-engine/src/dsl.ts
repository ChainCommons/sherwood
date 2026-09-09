import { amount } from '@octc/core'
import type { EvaluationEvent, EvaluationParticipant } from './types.ts'

/** Supported predicate DSL versions (plan 05). */
export const DSL_V0 = '0'
export const SUPPORTED_DSL_VERSIONS = new Set([DSL_V0, 'v0'])

export type CompareOp =
  | 'in'
  | 'not_in'
  | 'eq'
  | 'ne'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'exists'
  | 'missing'

export type Predicate =
  | { readonly all: readonly Predicate[] }
  | { readonly any: readonly Predicate[] }
  | { readonly not: Predicate }
  | { readonly field: string; readonly op: CompareOp; readonly value?: unknown }

export interface DslContext {
  readonly event: EvaluationEvent
  readonly participant: EvaluationParticipant
  /** Caller-supplied boolean jurisdiction facts (not invented by the engine). */
  readonly jurisdiction_facts?: Readonly<Record<string, boolean>>
}

const COMPARE_OPS = new Set<CompareOp>([
  'in',
  'not_in',
  'eq',
  'ne',
  'gt',
  'gte',
  'lt',
  'lte',
  'exists',
  'missing'
])

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function asCompareOp(v: unknown, path: string): CompareOp {
  if (typeof v !== 'string' || !COMPARE_OPS.has(v as CompareOp)) {
    throw new TypeError(`${path}: unsupported op ${String(v)}`)
  }
  return v as CompareOp
}

/** Parse and validate a DSL v0 predicate tree (schema `$defs/predicate`). */
export function parsePredicate(doc: unknown, path = 'conditions'): Predicate {
  if (!isRecord(doc)) throw new TypeError(`${path}: predicate must be an object`)

  const keys = Object.keys(doc)
  if (keys.length === 1 && keys[0] === 'all') {
    if (!Array.isArray(doc.all)) throw new TypeError(`${path}.all must be an array`)
    return { all: doc.all.map((p, i) => parsePredicate(p, `${path}.all[${i}]`)) }
  }
  if (keys.length === 1 && keys[0] === 'any') {
    if (!Array.isArray(doc.any)) throw new TypeError(`${path}.any must be an array`)
    return { any: doc.any.map((p, i) => parsePredicate(p, `${path}.any[${i}]`)) }
  }
  if (keys.length === 1 && keys[0] === 'not') {
    return { not: parsePredicate(doc.not, `${path}.not`) }
  }
  if (typeof doc.field === 'string' && doc.field.length > 0 && doc.op !== undefined) {
    const op = asCompareOp(doc.op, path)
    if (op === 'exists' || op === 'missing') {
      if (doc.value !== undefined) {
        throw new TypeError(`${path}: ${op} must not carry value`)
      }
      return { field: doc.field, op }
    }
    if (!('value' in doc)) {
      throw new TypeError(`${path}: op ${op} requires value`)
    }
    return { field: doc.field, op, value: doc.value }
  }
  throw new TypeError(`${path}: expected all | any | not | {field,op}`)
}

export function isSupportedDslVersion(version: string | undefined): boolean {
  if (version === undefined) return true
  return SUPPORTED_DSL_VERSIONS.has(version)
}

function readField(ctx: DslContext, field: string): unknown {
  switch (field) {
    case 'event_type':
      return ctx.event.event_type
    case 'asset_type':
      return ctx.event.asset_type
    case 'asset_category':
      return ctx.event.asset_category
    case 'amount':
      return ctx.event.amount
    case 'capacity':
      return ctx.participant.capacity
    case 'participant_type':
      return ctx.participant.participant_type
    default: {
      const prefix = 'jurisdiction_facts.'
      if (field.startsWith(prefix)) {
        const key = field.slice(prefix.length)
        return ctx.jurisdiction_facts?.[key]
      }
      return undefined
    }
  }
}

function asComparableNumber(v: unknown): ReturnType<typeof amount> | undefined {
  if (v === undefined || v === null) return undefined
  if (typeof v === 'number' && Number.isSafeInteger(v)) return amount(v)
  if (typeof v === 'string' && v.length > 0) {
    try {
      return amount(v)
    } catch {
      return undefined
    }
  }
  return undefined
}

function compareOrdered(left: unknown, right: unknown, op: 'gt' | 'gte' | 'lt' | 'lte'): boolean {
  const a = asComparableNumber(left)
  const b = asComparableNumber(right)
  if (a === undefined || b === undefined) return false
  switch (op) {
    case 'gt':
      return a.gt(b)
    case 'gte':
      return a.gte(b)
    case 'lt':
      return a.lt(b)
    case 'lte':
      return a.lte(b)
  }
}

function valuesEqual(left: unknown, right: unknown): boolean {
  const a = asComparableNumber(left)
  const b = asComparableNumber(right)
  if (a !== undefined && b !== undefined) return a.eq(b)
  return left === right
}

function evalCompare(fieldValue: unknown, op: CompareOp, expected: unknown): boolean {
  switch (op) {
    case 'exists':
      return fieldValue !== undefined && fieldValue !== null
    case 'missing':
      return fieldValue === undefined || fieldValue === null
    case 'eq':
      return valuesEqual(fieldValue, expected)
    case 'ne':
      return !valuesEqual(fieldValue, expected)
    case 'in':
      return Array.isArray(expected) && expected.some((x) => valuesEqual(fieldValue, x))
    case 'not_in':
      return Array.isArray(expected) && !expected.some((x) => valuesEqual(fieldValue, x))
    case 'gt':
    case 'gte':
    case 'lt':
    case 'lte':
      return compareOrdered(fieldValue, expected, op)
  }
}

/** Deterministic evaluation of a parsed predicate against the event context. */
export function evaluatePredicate(predicate: Predicate, ctx: DslContext): boolean {
  if ('all' in predicate) {
    return predicate.all.every((p) => evaluatePredicate(p, ctx))
  }
  if ('any' in predicate) {
    return predicate.any.some((p) => evaluatePredicate(p, ctx))
  }
  if ('not' in predicate) {
    return !evaluatePredicate(predicate.not, ctx)
  }
  return evalCompare(readField(ctx, predicate.field), predicate.op, predicate.value)
}

/**
 * Whether a rule's `conditions` match. Missing conditions → true.
 * Unsupported `dsl_version` → false (never silently apply foreign DSL).
 */
export function matchConditions(
  conditions: Predicate | undefined,
  dslVersion: string | undefined,
  ctx: DslContext
): boolean {
  if (conditions === undefined) return true
  if (!isSupportedDslVersion(dslVersion)) return false
  return evaluatePredicate(conditions, ctx)
}
