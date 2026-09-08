/**
 * Contribution requirements for knowledge packs (plan 16 §84, plan 05).
 *
 * The central promise is that nothing unsourced gets promoted into a verified
 * pack, so a rule marked SOURCE_VERIFIED or EXPERT_REVIEWED with no sources is
 * a hard failure. Staleness is a warning: an old verification date is a
 * maintenance signal, not a correctness bug.
 */
import { join } from 'node:path'
import type { Issue, SyncCheck } from '../types.ts'
import { error, warning } from '../types.ts'
import { isDataFile, readData, rel, walk } from '../fs-utils.ts'

const VERIFIED = new Set(['SOURCE_VERIFIED', 'EXPERT_REVIEWED'])

/** Plan 16: P0 warns when a pack has not been re-checked in this many months. */
const STALE_AFTER_MONTHS = 12

const monthsBetween = (isoDate: string, now: Date): number => {
  const then = new Date(isoDate + 'T00:00:00Z')
  if (Number.isNaN(then.getTime())) return 0
  return (now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
}

export const knowledge: SyncCheck = {
  name: 'knowledge',
  run({ root }): Issue[] {
    const issues: Issue[] = []
    const now = new Date()

    for (const file of walk(join(root, 'jurisdictions'), isDataFile)) {
      const path = rel(root, file)
      let doc: unknown
      try {
        doc = readData(file)
      } catch {
        continue
      }
      if (typeof doc !== 'object' || doc === null) continue
      const d = doc as Record<string, unknown>

      const isRule = typeof d.rule_id === 'string'
      const review = d.review as { status?: unknown } | undefined
      const status = typeof review?.status === 'string' ? review.status : undefined
      const sources = Array.isArray(d.sources) ? d.sources : []

      if (isRule) {
        if (sources.length === 0) {
          issues.push(error('knowledge', path, 'rule has no sources[] (INV-006)'))
        }
        if (status !== undefined && VERIFIED.has(status) && sources.length === 0) {
          issues.push(error('knowledge', path, `rule marked ${status} without a source (§84)`))
        }
        if (d.certainty === undefined) {
          issues.push(error('knowledge', path, 'rule has no certainty (INV-009)'))
        }
        if (status === 'EXPERT_REVIEWED') {
          const r = review as Record<string, unknown>
          if (typeof r.reviewer_qualification !== 'string' || typeof r.reviewed_at !== 'string') {
            issues.push(
              error('knowledge', path, 'EXPERT_REVIEWED requires reviewer_qualification and reviewed_at (§99)')
            )
          }
        }
      }

      // Jurisdiction pack manifests.
      if (typeof d.jurisdiction_type === 'string') {
        if (!Array.isArray(d.unsupported_tax_domains)) {
          issues.push(
            error('knowledge', path, 'jurisdiction must list unsupported_tax_domains explicitly (§24)')
          )
        }
        const verified = typeof d.last_source_verification === 'string' ? d.last_source_verification : undefined
        if (verified !== undefined && monthsBetween(verified, now) > STALE_AFTER_MONTHS) {
          issues.push(
            warning('knowledge', path, `last_source_verification ${verified} is over ${STALE_AFTER_MONTHS} months old`)
          )
        }
      }
    }
    return issues
  }
}
