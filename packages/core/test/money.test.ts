import { describe, expect, it } from 'vitest'
import {
  ZERO, add, amount, cmp, div, fromBaseUnits, mul, round, sub, sum, toBaseUnits, toJSON
} from '../src/money.ts'

describe('money', () => {
  it('adds without binary floating point error', () => {
    // 0.1 + 0.2 === 0.30000000000000004 under IEEE 754. It must not here.
    expect(toJSON(add(amount('0.1'), amount('0.2')))).toBe('0.3')
  })

  it('refuses a non-integer number so precision cannot be lost silently', () => {
    expect(() => amount(0.1)).toThrow(/decimal string/)
    expect(toJSON(amount(42))).toBe('42')
  })

  it('rejects non-finite input', () => {
    expect(() => amount('nope')).toThrow()
    expect(() => amount(Number.POSITIVE_INFINITY)).toThrow()
  })

  it('does the arithmetic exactly', () => {
    expect(toJSON(sub(amount('100'), amount('12.5')))).toBe('87.5')
    expect(toJSON(mul(amount('100'), amount('2.41')))).toBe('241')
    expect(toJSON(div(amount('1'), amount('8')))).toBe('0.125')
    expect(() => div(amount('1'), ZERO)).toThrow(/division by zero/)
  })

  it('sums an empty list to zero', () => {
    expect(toJSON(sum([]))).toBe('0')
    expect(toJSON(sum([amount('2.5'), amount('10'), amount('87.5')]))).toBe('100')
  })

  it('rounds only when told which way', () => {
    expect(toJSON(round(amount('2.5'), 0, 'HALF_UP'))).toBe('3')
    expect(toJSON(round(amount('2.5'), 0, 'HALF_EVEN'))).toBe('2')
    expect(toJSON(round(amount('2.345'), 2, 'FLOOR'))).toBe('2.34')
  })

  it('preserves native chain precision through base units', () => {
    // 1 mutez is the smallest XTZ unit; it must survive the round trip.
    expect(toJSON(fromBaseUnits('1', 6))).toBe('0.000001')
    expect(toJSON(fromBaseUnits(100_000_000n, 6))).toBe('100')
    expect(toBaseUnits(amount('87.5'), 6)).toBe(87_500_000n)
    expect(() => toBaseUnits(amount('0.0000001'), 6)).toThrow(/not representable/)
  })

  it('handles token decimals well beyond double precision', () => {
    const wei = '123456789012345678901'
    expect(toJSON(fromBaseUnits(wei, 18))).toBe('123.456789012345678901')
  })

  it('compares without coercion', () => {
    expect(cmp(amount('10'), amount('9.999'))).toBe(1)
    expect(cmp(amount('10'), amount('10.0'))).toBe(0)
  })
})
