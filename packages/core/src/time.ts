/**
 * Time handling (plan 17 §90).
 *
 * The chain timestamp is the fact; every derived calendar date carries the
 * zone that produced it so a UTC evening op is never silently filed under the
 * wrong Europe/Paris day.
 */

/** ISO-8601 instant, always stored in UTC. */
export type Instant = string & { readonly __brand: 'Instant' }

/** IANA zone name, e.g. `Europe/Paris`. */
export type TimeZone = string & { readonly __brand: 'TimeZone' }

/** A UTC instant plus the zone used to derive a local calendar date. */
export interface ZonedInstant {
  readonly utc: Instant
  readonly timezone: TimeZone
  /** `YYYY-MM-DD` in `timezone`. */
  readonly localDate: string
  /** ISO-8601 local wall-clock time, without offset. */
  readonly localDateTime: string
}

export function instant(value: string | Date): Instant {
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) throw new TypeError(`invalid instant: ${String(value)}`)
  return d.toISOString() as Instant
}

export function timeZone(name: string): TimeZone {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: name })
  } catch {
    throw new TypeError(`unknown IANA time zone: ${name}`)
  }
  return name as TimeZone
}

export const UTC = 'UTC' as TimeZone

const partsIn = (i: Instant, tz: TimeZone): Record<string, string> => {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
  const out: Record<string, string> = {}
  for (const p of fmt.formatToParts(new Date(i))) {
    if (p.type !== 'literal') out[p.type] = p.value
  }
  // Intl renders midnight as hour 24 in some ICU versions.
  if (out.hour === '24') out.hour = '00'
  return out
}

export function zoned(utcInstant: Instant, tz: TimeZone): ZonedInstant {
  const p = partsIn(utcInstant, tz)
  const localDate = `${p.year}-${p.month}-${p.day}`
  return {
    utc: utcInstant,
    timezone: tz,
    localDate,
    localDateTime: `${localDate}T${p.hour}:${p.minute}:${p.second}`
  }
}

/** Calendar date in a jurisdiction's reference zone. */
export const localDateIn = (utcInstant: Instant, tz: TimeZone): string =>
  zoned(utcInstant, tz).localDate

/**
 * Tax year under a jurisdiction convention. Only `CALENDAR_YEAR` is
 * implemented in P0; other conventions are declared by the pack and must be
 * added here rather than assumed, so an unsupported convention throws instead
 * of quietly returning a calendar year.
 */
export type TaxYearConvention = 'CALENDAR_YEAR'

export function taxYear(
  utcInstant: Instant,
  tz: TimeZone,
  convention: TaxYearConvention = 'CALENDAR_YEAR'
): number {
  if (convention !== 'CALENDAR_YEAR') {
    throw new RangeError(`unsupported tax year convention: ${String(convention)}`)
  }
  return Number(localDateIn(utcInstant, tz).slice(0, 4))
}

/** Inclusive-start, inclusive-end date range as used by `effective_from`/`_to`. */
export interface DateRange {
  readonly from: string
  readonly to?: string | undefined
}

export function rangeContains(range: DateRange, date: string): boolean {
  if (date < range.from) return false
  if (range.to !== undefined && date > range.to) return false
  return true
}

export function isValidRange(range: DateRange): boolean {
  return range.to === undefined || range.from <= range.to
}
