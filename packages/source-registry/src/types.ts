import type { AuthorityLevel, SourceType } from '@octc/core'

/** Calendar date `YYYY-MM-DD` as used on sources and rules. */
export type IsoDate = string

/** Plan 05 §25 — a stable legal source record. */
export interface Source {
  readonly source_id: string
  readonly jurisdiction_id: string
  readonly issuing_authority?: string
  readonly source_type: SourceType
  readonly authority_level: AuthorityLevel
  readonly title: string
  readonly canonical_reference?: string
  readonly original_language?: string
  /** When the guidance became public (publication clock). */
  readonly publication_date?: IsoDate
  /** Alias some packs use for publication_date on versions. */
  readonly published_from?: IsoDate
  /** When the source applies economically (effective clock). */
  readonly effective_from?: IsoDate
  readonly effective_to?: IsoDate
  readonly repealed_at?: IsoDate
  /** When this project captured the source (retrieved clock). */
  readonly retrieved_at?: IsoDate
  readonly canonical_url?: string
  readonly archive_reference?: string
  readonly content_hash?: string
  readonly supersedes?: readonly string[]
  readonly superseded_by?: readonly string[]
  readonly licence?: string
  readonly permitted_extract?: string
  readonly notes?: string
  readonly schema_version: string
}

/** Plan 05 §28 — one capture; current text must not overwrite history. */
export interface SourceVersion {
  readonly source_version_id: string
  readonly source_id: string
  readonly version_label?: string
  readonly publication_date?: IsoDate
  readonly published_from?: IsoDate
  readonly effective_from?: IsoDate
  readonly effective_to?: IsoDate
  readonly retrieved_at: IsoDate
  readonly archive_url?: string
  readonly content_hash?: string
  readonly predecessor?: string | null
  readonly successor?: string | null
  readonly permitted_extract?: string
  readonly extracted_facts?: Readonly<Record<string, unknown>>
  readonly schema_version: string
}

/** Which of the three clocks a query is filtering on. */
export type ClockKind = 'effective' | 'publication' | 'retrieved'

/**
 * How a source sits relative to an as-of date across the three clocks.
 * UI copy: “applies to period” / “published” / “captured”.
 */
export type SourceAvailability =
  | 'contemporaneous'
  | 'later_publication'
  | 'not_yet_effective'
  | 'expired'
  | 'unpublished'
  | 'not_retrieved'

export interface SourceAsOfView {
  readonly source: Source
  /** effective_from ≤ date ≤ effective_to (missing bound = open). */
  readonly effective: boolean
  /** publication_date / published_from ≤ date. */
  readonly published: boolean
  /** retrieved_at ≤ date (missing retrieved_at → false). */
  readonly retrieved: boolean
  readonly availability: SourceAvailability
}

export interface AsOfBuckets {
  readonly asOf: IsoDate
  /** Published by the date and effective for the period. */
  readonly contemporaneous: readonly SourceAsOfView[]
  /** Effective for the period, but published after the date (AC-002). */
  readonly laterPublications: readonly SourceAsOfView[]
  /** Not yet in force on the date. */
  readonly notYetEffective: readonly SourceAsOfView[]
  /** Past effective_to / repealed. */
  readonly expired: readonly SourceAsOfView[]
  /** No publication date recorded, or otherwise unclassified. */
  readonly other: readonly SourceAsOfView[]
}
