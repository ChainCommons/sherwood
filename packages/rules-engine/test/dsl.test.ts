import { describe, expect, it } from 'vitest'
import {
  evaluatePredicate,
  matchConditions,
  parsePredicate,
  type DslContext
} from '../src/index.ts'

const baseCtx: DslContext = {
  event: {
    event_type: 'DISPOSAL',
    asset_category: 'nft',
    amount: '15000'
  },
  participant: { capacity: 'COLLECTOR' },
  jurisdiction_facts: { reporting_threshold_applies: true }
}

describe('predicate DSL v0', () => {
  it('parses all / any / not / field ops', () => {
    const p = parsePredicate({
      all: [
        { field: 'amount', op: 'gte', value: '10000' },
        {
          any: [
            { field: 'asset_category', op: 'eq', value: 'nft' },
            { field: 'asset_category', op: 'eq', value: 'crypto' }
          ]
        },
        { not: { field: 'capacity', op: 'eq', value: 'ARTIST' } }
      ]
    })
    expect(evaluatePredicate(p, baseCtx)).toBe(true)
  })

  it('rejects unknown ops and malformed trees', () => {
    expect(() => parsePredicate({ field: 'amount', op: 'regex', value: 'x' })).toThrow(
      /unsupported op/
    )
    expect(() => parsePredicate({ field: 'amount', op: 'exists', value: true })).toThrow(
      /must not carry value/
    )
    expect(() => parsePredicate({ weird: true })).toThrow(/expected all/)
  })

  it('compares amounts as decimals, not floats', () => {
    const p = parsePredicate({ field: 'amount', op: 'gt', value: '14999.99' })
    expect(evaluatePredicate(p, baseCtx)).toBe(true)
    expect(
      evaluatePredicate(p, {
        ...baseCtx,
        event: { ...baseCtx.event, amount: '14999.99' }
      })
    ).toBe(false)
  })

  it('reads jurisdiction_facts.* fields', () => {
    const p = parsePredicate({
      field: 'jurisdiction_facts.reporting_threshold_applies',
      op: 'eq',
      value: true
    })
    expect(evaluatePredicate(p, baseCtx)).toBe(true)
    expect(
      evaluatePredicate(p, { ...baseCtx, jurisdiction_facts: { reporting_threshold_applies: false } })
    ).toBe(false)
  })

  it('matchConditions is true when absent; false for unsupported dsl_version', () => {
    expect(matchConditions(undefined, undefined, baseCtx)).toBe(true)
    const cond = parsePredicate({ field: 'capacity', op: 'eq', value: 'COLLECTOR' })
    expect(matchConditions(cond, '0', baseCtx)).toBe(true)
    expect(matchConditions(cond, '99', baseCtx)).toBe(false)
  })
})
