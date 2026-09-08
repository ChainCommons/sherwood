import { describe, expect, it } from 'vitest'
import { UTC, instant, isValidRange, localDateIn, rangeContains, taxYear, timeZone, zoned } from '../src/time.ts'

const PARIS = timeZone('Europe/Paris')

describe('time', () => {
  it('keeps the chain timestamp in UTC', () => {
    expect(instant('2021-06-15T21:40:00Z')).toBe('2021-06-15T21:40:00.000Z')
  })

  it('rejects an unknown zone rather than falling back to UTC', () => {
    expect(() => timeZone('Europe/Nowhere')).toThrow(/unknown IANA time zone/)
  })

  it('files a late UTC evening under the next Paris day (§88 regression)', () => {
    // 22:30 UTC on 31 December is already 1 January in Paris: the classic
    // "wrong timezone" bug puts this in the wrong tax year.
    const i = instant('2021-12-31T23:30:00Z')
    expect(localDateIn(i, UTC)).toBe('2021-12-31')
    expect(localDateIn(i, PARIS)).toBe('2022-01-01')
    expect(taxYear(i, UTC)).toBe(2021)
    expect(taxYear(i, PARIS)).toBe(2022)
  })

  it('records the zone that produced the local date', () => {
    const z = zoned(instant('2021-06-15T21:40:00Z'), PARIS)
    expect(z).toMatchObject({
      utc: '2021-06-15T21:40:00.000Z',
      timezone: 'Europe/Paris',
      localDate: '2021-06-15',
      localDateTime: '2021-06-15T23:40:00'
    })
  })

  it('handles midnight without reporting hour 24', () => {
    expect(zoned(instant('2021-06-15T22:00:00Z'), PARIS).localDateTime).toBe('2021-06-16T00:00:00')
  })

  it('refuses a tax year convention it does not implement', () => {
    // Assuming a calendar year for a jurisdiction that uses another convention
    // would be a silent wrong answer, so this throws instead.
    expect(() => taxYear(instant('2021-06-15T00:00:00Z'), PARIS, 'FISCAL_APRIL' as never)).toThrow(
      /unsupported tax year convention/
    )
  })

  it('treats an open-ended range as still in force', () => {
    expect(rangeContains({ from: '2019-01-01' }, '2026-01-01')).toBe(true)
    expect(rangeContains({ from: '2019-01-01', to: '2021-12-31' }, '2022-01-01')).toBe(false)
    expect(rangeContains({ from: '2019-01-01', to: '2021-12-31' }, '2021-12-31')).toBe(true)
    expect(isValidRange({ from: '2021-01-01', to: '2020-01-01' })).toBe(false)
  })
})
