import {
  assertIsoDate,
  bucketAsOf,
  isEffectiveOn,
  isPublishedBy,
  isRetrievedBy,
  viewAsOf
} from './clocks.ts'
import { loadSourcesFromDir, loadSourceVersionsFromDir } from './load.ts'
import type {
  AsOfBuckets,
  ClockKind,
  IsoDate,
  Source,
  SourceAsOfView,
  SourceVersion
} from './types.ts'

export interface SourceRegistryOptions {
  readonly sources?: readonly Source[]
  readonly versions?: readonly SourceVersion[]
}

/**
 * In-memory source index with as-of queries on the three clocks.
 *
 * Packs are passed in (or loaded from a directory). The registry never imports
 * a jurisdiction package — France YAML stays outside this engine.
 */
export class SourceRegistry {
  private readonly byId = new Map<string, Source>()
  private readonly versionsBySource = new Map<string, SourceVersion[]>()

  constructor(options: SourceRegistryOptions = {}) {
    for (const s of options.sources ?? []) this.addSource(s)
    for (const v of options.versions ?? []) this.addVersion(v)
  }

  static fromDirectory(root: string): SourceRegistry {
    return new SourceRegistry({
      sources: loadSourcesFromDir(root),
      versions: loadSourceVersionsFromDir(root)
    })
  }

  addSource(source: Source): void {
    if (this.byId.has(source.source_id)) {
      throw new Error(`duplicate source_id: ${source.source_id}`)
    }
    this.byId.set(source.source_id, source)
  }

  addVersion(version: SourceVersion): void {
    const list = this.versionsBySource.get(version.source_id) ?? []
    list.push(version)
    list.sort((a, b) => a.retrieved_at.localeCompare(b.retrieved_at))
    this.versionsBySource.set(version.source_id, list)
  }

  get(sourceId: string): Source | undefined {
    return this.byId.get(sourceId)
  }

  require(sourceId: string): Source {
    const s = this.byId.get(sourceId)
    if (!s) throw new Error(`unknown source_id: ${sourceId}`)
    return s
  }

  list(): readonly Source[] {
    return [...this.byId.values()]
  }

  versionsOf(sourceId: string): readonly SourceVersion[] {
    return this.versionsBySource.get(sourceId) ?? []
  }

  /** Filter by one clock. */
  asOf(clock: ClockKind, date: IsoDate): readonly Source[] {
    const d = assertIsoDate(date, 'asOf')
    return this.list().filter((s) => {
      switch (clock) {
        case 'effective':
          return isEffectiveOn(s, d)
        case 'publication':
          return isPublishedBy(s, d)
        case 'retrieved':
          return isRetrievedBy(s, d)
      }
    })
  }

  effectiveAt(date: IsoDate): readonly Source[] {
    return this.asOf('effective', date)
  }

  publishedBy(date: IsoDate): readonly Source[] {
    return this.asOf('publication', date)
  }

  retrievedBy(date: IsoDate): readonly Source[] {
    return this.asOf('retrieved', date)
  }

  /** Full three-clock classification for every source (Time Machine buckets). */
  classifyAsOf(date: IsoDate): AsOfBuckets {
    return bucketAsOf(this.list(), assertIsoDate(date, 'asOf'))
  }

  view(sourceId: string, date: IsoDate): SourceAsOfView {
    return viewAsOf(this.require(sourceId), assertIsoDate(date, 'asOf'))
  }

  /** Resolve source ids and attach as-of flags; unknown ids are omitted. */
  resolveAsOf(sourceIds: readonly string[], date: IsoDate): readonly SourceAsOfView[] {
    const d = assertIsoDate(date, 'asOf')
    const out: SourceAsOfView[] = []
    for (const id of sourceIds) {
      const s = this.byId.get(id)
      if (s) out.push(viewAsOf(s, d))
    }
    return out
  }
}
