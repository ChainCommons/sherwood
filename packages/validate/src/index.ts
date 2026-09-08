import { schemaCheck } from './checks/schema-check.ts'
import { uniqueIds } from './checks/unique-ids.ts'
import { temporal } from './checks/temporal.ts'
import { links } from './checks/links.ts'
import { secrets } from './checks/secrets.ts'
import { imports } from './checks/imports.ts'
import { knowledge } from './checks/knowledge.ts'
import { references } from './checks/references.ts'
import type { Check, CheckContext, Issue } from './types.ts'

export const ALL_CHECKS: readonly Check[] = [
  schemaCheck,
  uniqueIds,
  references,
  temporal,
  knowledge,
  links,
  secrets,
  imports
]

export interface ValidationResult {
  readonly issues: readonly Issue[]
  readonly errors: readonly Issue[]
  readonly warnings: readonly Issue[]
  readonly ok: boolean
}

export async function validateRepo(
  ctx: CheckContext,
  checks: readonly Check[] = ALL_CHECKS
): Promise<ValidationResult> {
  const issues: Issue[] = []
  for (const check of checks) {
    issues.push(...(await check.run(ctx)))
  }
  const errors = issues.filter((i) => i.severity === 'error')
  const warnings = issues.filter((i) => i.severity === 'warning')
  return { issues, errors, warnings, ok: errors.length === 0 }
}

export { schemaCheck, uniqueIds, temporal, links, secrets, imports, knowledge, references }
export { loadSchemas } from './schema-registry.ts'
export * from './types.ts'
