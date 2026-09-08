/**
 * Decimal money and asset quantities (plan 17 §89).
 *
 * IEEE floats are banned for amounts. Everything that represents a monetary
 * value or an on-chain quantity flows through `Amount`, which is a branded
 * wrapper around decimal.js so a bare `number` cannot be passed by mistake.
 */
import Decimal from 'decimal.js'

// 40 significant digits comfortably covers mutez (6dp) through 18-decimal
// ERC-20-style tokens multiplied by a fiat unit price.
Decimal.set({ precision: 40, toExpNeg: -40, toExpPos: 40 })

declare const amountBrand: unique symbol

export type Amount = Decimal & { readonly [amountBrand]: 'Amount' }

/** Rounding is jurisdiction/rule configurable — never a hidden global half-up. */
export type RoundingMode =
  | 'HALF_UP'
  | 'HALF_EVEN'
  | 'HALF_DOWN'
  | 'UP'
  | 'DOWN'
  | 'CEILING'
  | 'FLOOR'

const ROUNDING: Record<RoundingMode, Decimal.Rounding> = {
  HALF_UP: Decimal.ROUND_HALF_UP,
  HALF_EVEN: Decimal.ROUND_HALF_EVEN,
  HALF_DOWN: Decimal.ROUND_HALF_DOWN,
  UP: Decimal.ROUND_UP,
  DOWN: Decimal.ROUND_DOWN,
  CEILING: Decimal.ROUND_CEIL,
  FLOOR: Decimal.ROUND_FLOOR
}

/**
 * Build an Amount from a decimal string or integer. Floats are rejected at
 * runtime as well as at the type level: a `number` that is not a safe integer
 * has already lost precision by the time it reaches us.
 */
export function amount(value: string | number | Decimal): Amount {
  if (typeof value === 'number') {
    if (!Number.isSafeInteger(value)) {
      throw new TypeError(
        `amount() refuses non-integer number ${value}: pass a decimal string to preserve precision`
      )
    }
    return new Decimal(value) as Amount
  }
  const d = value instanceof Decimal ? value : new Decimal(value)
  if (!d.isFinite()) throw new TypeError(`amount() requires a finite value, got ${String(value)}`)
  return d as Amount
}

export const ZERO: Amount = amount('0')

export const add = (a: Amount, b: Amount): Amount => a.plus(b) as Amount
export const sub = (a: Amount, b: Amount): Amount => a.minus(b) as Amount
export const mul = (a: Amount, b: Amount): Amount => a.times(b) as Amount

export function div(a: Amount, b: Amount): Amount {
  if (b.isZero()) throw new RangeError('division by zero')
  return a.dividedBy(b) as Amount
}

export const sum = (xs: readonly Amount[]): Amount =>
  xs.reduce<Amount>((acc, x) => add(acc, x), ZERO)

export const isZero = (a: Amount): boolean => a.isZero()
export const cmp = (a: Amount, b: Amount): -1 | 0 | 1 => a.comparedTo(b) as -1 | 0 | 1
export const eq = (a: Amount, b: Amount): boolean => a.equals(b)

/** Explicit rounding. The caller records the mode on the finding/snapshot. */
export function round(a: Amount, decimals: number, mode: RoundingMode): Amount {
  return a.toDecimalPlaces(decimals, ROUNDING[mode]) as Amount
}

/** Serialize without exponent notation so JSON fixtures stay diff-friendly. */
export const toJSON = (a: Amount): string => a.toFixed()

/**
 * Convert a chain base unit (mutez, wei, FA2 smallest unit) to a display
 * quantity. Native precision is preserved: this is exact decimal shifting.
 */
export function fromBaseUnits(base: string | bigint, decimals: number): Amount {
  if (!Number.isInteger(decimals) || decimals < 0) {
    throw new RangeError(`decimals must be a non-negative integer, got ${decimals}`)
  }
  return new Decimal(base.toString()).dividedBy(new Decimal(10).pow(decimals)) as Amount
}

export function toBaseUnits(a: Amount, decimals: number): bigint {
  const shifted = a.times(new Decimal(10).pow(decimals))
  if (!shifted.isInteger()) {
    throw new RangeError(`${a.toFixed()} is not representable in ${decimals} decimals`)
  }
  return BigInt(shifted.toFixed())
}

export { Decimal }
