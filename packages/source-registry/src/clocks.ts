/**
 * Three-clock helpers (plan 05 §27).
 *
 * Do not collapse these: a source can be economically effective for 2021 while
 * only published in 2025, and the repository may have retrieved it even later.
 */
import { rangeContains } from '@octc/core'
import type {
  AsOfBuckets,
  IsoDate,
  Source,
  SourceAsOfView,
  SourceAvailability,
  SourceVersion
} from './types.ts'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export function assertIsoDate(value: string, label = 'date'): IsoDate {
  if (!DATE_RE.test(value)) {
    throw new TypeError(`${label} must be YYYY-MM-DD, got ${JSON.stringify(value)}`)
  }
  return value
}

/** Publication clock: publication_date, else published_from. */
export function publicationDateOf(s: Source | SourceVersion): IsoDate | undefined {
  return s.publication_date ?? s.published_from
}

export function isEffectiveOn(s: Source | SourceVersion, date: IsoDate): boolean {
  const from = s.effective_from
  if (from === undefined) return false
  const repealed = 'repealed_at' in s ? s.repealed_at : undefined
  if (repealed !== undefined && date >= repealed) return false
  return rangeContains({ from, to: s.effective_to }, date)
}

export function isPublishedBy(s: Source | SourceVersion, date: IsoDate): boolean {
  const published = publicationDateOf(s)
  if (published === undefined) return false
  return published <= date
}

export function isRetrievedBy(s: Source | SourceVersion, date: IsoDate): boolean {
  if (s.retrieved_at === undefined) return false
  return s.retrieved_at <= date
}

export function classifyAvailability(s: Source, date: IsoDate): SourceAvailability {
  const effective = isEffectiveOn(s, date)
  const published = isPublishedBy(s, date)
  const publishedAt = publicationDateOf(s)

  if (s.effective_from !== undefined && date < s.effective_from) return 'not_yet_effective'
  if (s.effective_to !== undefined && date > s.effective_to) return 'expired'
  if (s.repealed_at !== undefined && date >= s.repealed_at) return 'expired'
  if (publishedAt === undefined) return 'unpublished'
  if (effective && published) return 'contemporaneous'
  if (effective && !published) return 'later_publication'
  if (!effective && published) return 'not_yet_effective'
  return 'unpublished'
}

export function viewAsOf(s: Source, date: IsoDate): SourceAsOfView {
  return {
    source: s,
    effective: isEffectiveOn(s, date),
    published: isPublishedBy(s, date),
    retrieved: isRetrievedBy(s, date),
    availability: classifyAvailability(s, date)
  }
}

export function bucketAsOf(sources: readonly Source[], date: IsoDate): AsOfBuckets {
  const contemporaneous: SourceAsOfView[] = []
  const laterPublications: SourceAsOfView[] = []
  const notYetEffective: SourceAsOfView[] = []
  const expired: SourceAsOfView[] = []
  const other: SourceAsOfView[] = []

  for (const s of sources) {
    const view = viewAsOf(s, date)
    switch (view.availability) {
      case 'contemporaneous':
        contemporaneous.push(view)
        break
      case 'later_publication':
        laterPublications.push(view)
        break
      case 'not_yet_effective':
        notYetEffective.push(view)
        break
      case 'expired':
        expired.push(view)
        break
      default:
        other.push(view)
    }
  }

  return { asOf: date, contemporaneous, laterPublications, notYetEffective, expired, other }
}
