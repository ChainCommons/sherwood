/**
 * Temporal sanity for sources and rules (plan 16 §85, plan 05 §27).
 *
 * The three clocks must stay coherent: a rule cannot end before it starts, and
 * it cannot be *published* after the period it governs without that being
 * visible — a rule whose guidance appeared after `effective_from` is legitimate
 * (retrospective guidance) but is exactly the case AC-002 exists to surface, so
 * it is reported as a warning rather than silently accepted.
 */
import { join } from 'node:path'
import type { Issue, SyncCheck } from '../types.ts'
import { error, warning } from '../types.ts'
import { isDataFile, readData, rel, walk } from '../fs-utils.ts'

const DATA_ROOTS = ['jurisdictions', 'cases']

interface Dated {
  effective_from?: unknown
  effective_to?: unknown
  published_from?: unknown
  publication_date?: unknown
  retrieved_at?: unknown
  repealed_at?: unknown
  rule_id?: unknown
  source_id?: unknown
}

const asDate = (v: unknown): string | undefined => (typeof v === 'string' ? v : undefined)

export const temporal: SyncCheck = {
  name: 'temporal',
  run({ root }): Issue[] {
    const issues: Issue[] = []

    for (const dir of DATA_ROOTS) {
      for (const file of walk(join(root, dir), isDataFile)) {
        const path = rel(root, file)
        let doc: unknown
        try {
          doc = readData(file)
        } catch {
          continue
        }
        if (typeof doc !== 'object' || doc === null) continue
        const d = doc as Dated

        const from = asDate(d.effective_from)
        const to = asDate(d.effective_to)
        if (from !== undefined && to !== undefined && from > to) {
          issues.push(error('temporal', path, `effective_from ${from} is after effective_to ${to}`))
        }

        const published = asDate(d.published_from) ?? asDate(d.publication_date)
        const isRule = typeof d.rule_id === 'string'
        if (isRule && published === undefined) {
          issues.push(error('temporal', path, 'rule is missing published_from (AC-002 needs it)'))
        }
        if (published !== undefined && from !== undefined && published > from) {
          issues.push(
            warning(
              'temporal',
              path,
              `published ${published} after effective_from ${from}: guidance was not available for the whole period it governs`
            )
          )
        }

        const retrieved = asDate(d.retrieved_at)
        if (retrieved !== undefined && published !== undefined && retrieved < published) {
          issues.push(error('temporal', path, `retrieved_at ${retrieved} precedes publication ${published}`))
        }

        const repealed = asDate(d.repealed_at)
        if (repealed !== undefined && from !== undefined && repealed < from) {
          issues.push(error('temporal', path, `repealed_at ${repealed} precedes effective_from ${from}`))
        }
      }
    }
    return issues
  }
}
