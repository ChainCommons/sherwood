import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import type { AuthorityLevel, CertaintyLevel, ReviewStatus } from '@octc/core'
import {
  SourceRegistry,
  loadSourcesFromDir,
  loadSourceVersionsFromDir,
  readDataFile
} from '@octc/source-registry'
import type { Certainty, Interpretation, Review, Rule, RuleAppliesTo, RuleEffects } from './types.ts'

const DATA_EXT = /\.(ya?ml|json)$/

function walkFiles(dir: string): string[] {
  const out: string[] = []
  let entries: string[]
  try {
    entries = readdirSync(dir)
  } catch {
    return out
  }
  for (const name of entries) {
    if (name.startsWith('.')) continue
    const full = join(dir, name)
    const st = statSync(full)
    if (st.isDirectory()) out.push(...walkFiles(full))
    else if (DATA_EXT.test(name)) out.push(full)
  }
  return out.sort()
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function asString(v: unknown, field: string): string {
  if (typeof v !== 'string' || v.length === 0) {
    throw new TypeError(`${field} must be a non-empty string`)
  }
  return v
}

function asOptionalString(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined
}

function asStringArray(v: unknown, field: string): string[] {
  if (!Array.isArray(v) || v.length === 0 || !v.every((x) => typeof x === 'string')) {
    throw new TypeError(`${field} must be a non-empty string array`)
  }
  return v as string[]
}

function asOptionalStringArray(v: unknown): string[] | undefined {
  if (v === undefined) return undefined
  if (!Array.isArray(v) || !v.every((x) => typeof x === 'string')) {
    throw new TypeError('expected string array')
  }
  return v as string[]
}

function opt<T extends string>(key: T, value: string | undefined): { [K in T]: string } | object {
  return value !== undefined ? ({ [key]: value } as { [K in T]: string }) : {}
}

function optArr<T extends string>(
  key: T,
  value: readonly string[] | undefined
): { [K in T]: readonly string[] } | object {
  return value !== undefined ? ({ [key]: value } as { [K in T]: readonly string[] }) : {}
}

function parseCertainty(v: unknown): Certainty {
  if (!isRecord(v) || typeof v.level !== 'string') {
    throw new TypeError('certainty.level is required')
  }
  return {
    level: v.level as CertaintyLevel,
    ...opt('reason', asOptionalString(v.reason))
  }
}

function parseReview(v: unknown): Review {
  if (!isRecord(v) || typeof v.status !== 'string') {
    throw new TypeError('review.status is required')
  }
  return {
    status: v.status as ReviewStatus,
    ...opt('reviewer', asOptionalString(v.reviewer)),
    ...opt('reviewer_qualification', asOptionalString(v.reviewer_qualification)),
    ...opt('reviewed_at', asOptionalString(v.reviewed_at)),
    ...opt('scope', asOptionalString(v.scope))
  }
}

function parseAppliesTo(v: unknown): RuleAppliesTo | undefined {
  if (v === undefined) return undefined
  if (!isRecord(v)) throw new TypeError('applies_to must be an object')
  const participant_types = asOptionalStringArray(v.participant_types)
  const capacities = asOptionalStringArray(v.capacities)
  const event_types = asOptionalStringArray(v.event_types)
  const asset_types = asOptionalStringArray(v.asset_types)
  const out: RuleAppliesTo = {
    ...(participant_types !== undefined ? { participant_types } : {}),
    ...(capacities !== undefined ? { capacities } : {}),
    ...(event_types !== undefined ? { event_types } : {}),
    ...(asset_types !== undefined ? { asset_types } : {})
  }
  return out
}

function parseEffects(v: unknown): RuleEffects | undefined {
  if (v === undefined) return undefined
  if (!isRecord(v)) throw new TypeError('effects must be an object')
  return {
    ...opt('classification', asOptionalString(v.classification)),
    ...opt('valuation_rule', asOptionalString(v.valuation_rule)),
    ...opt('reporting_rule', asOptionalString(v.reporting_rule)),
    ...opt('tax_base_rule', asOptionalString(v.tax_base_rule)),
    ...opt('calculation_rule', asOptionalString(v.calculation_rule)),
    ...opt('rounding_mode', asOptionalString(v.rounding_mode))
  }
}

export function parseRule(doc: unknown, path = '<rule>'): Rule {
  if (!isRecord(doc)) throw new TypeError(`${path}: rule must be an object`)
  const applies = parseAppliesTo(doc.applies_to)
  const effects = parseEffects(doc.effects)
  return {
    rule_id: asString(doc.rule_id, 'rule_id'),
    jurisdiction_id: asString(doc.jurisdiction_id, 'jurisdiction_id'),
    tax_domain: asString(doc.tax_domain, 'tax_domain'),
    title: asString(doc.title, 'title'),
    effective_from: asString(doc.effective_from, 'effective_from'),
    published_from: asString(doc.published_from, 'published_from'),
    sources: asStringArray(doc.sources, 'sources'),
    authority_status: asString(doc.authority_status, 'authority_status') as AuthorityLevel,
    certainty: parseCertainty(doc.certainty),
    review: parseReview(doc.review),
    schema_version: asString(doc.schema_version, 'schema_version'),
    ...(applies !== undefined ? { applies_to: applies } : {}),
    ...opt('dsl_version', asOptionalString(doc.dsl_version)),
    ...(doc.conditions !== undefined ? { conditions: doc.conditions } : {}),
    ...(effects !== undefined ? { effects } : {}),
    ...opt('effective_to', asOptionalString(doc.effective_to)),
    ...optArr('supersedes', asOptionalStringArray(doc.supersedes)),
    ...optArr('superseded_by', asOptionalStringArray(doc.superseded_by)),
    ...optArr('test_cases', asOptionalStringArray(doc.test_cases)),
    ...optArr('interpretations', asOptionalStringArray(doc.interpretations)),
    ...opt('notes', asOptionalString(doc.notes))
  }
}

export function parseInterpretation(doc: unknown, path = '<interpretation>'): Interpretation {
  if (!isRecord(doc)) throw new TypeError(`${path}: interpretation must be an object`)
  return {
    interpretation_id: asString(doc.interpretation_id, 'interpretation_id'),
    jurisdiction_id: asString(doc.jurisdiction_id, 'jurisdiction_id'),
    summary: asString(doc.summary, 'summary'),
    sources: asStringArray(doc.sources, 'sources'),
    certainty: parseCertainty(doc.certainty),
    review: parseReview(doc.review),
    schema_version: asString(doc.schema_version, 'schema_version'),
    ...opt('rule_id', asOptionalString(doc.rule_id)),
    ...opt('reasoning', asOptionalString(doc.reasoning)),
    ...opt('held_by', asOptionalString(doc.held_by)),
    ...optArr('conflicts_with', asOptionalStringArray(doc.conflicts_with))
  }
}

export function loadRulesFromDir(dir: string): Rule[] {
  const rules: Rule[] = []
  for (const file of walkFiles(dir)) {
    const doc = readDataFile(file)
    if (!isRecord(doc) || typeof doc.rule_id !== 'string') continue
    rules.push(parseRule(doc, file))
  }
  return rules
}

export function loadInterpretationsFromDir(dir: string): Interpretation[] {
  const out: Interpretation[] = []
  for (const file of walkFiles(dir)) {
    const doc = readDataFile(file)
    if (!isRecord(doc) || typeof doc.interpretation_id !== 'string') continue
    out.push(parseInterpretation(doc, file))
  }
  return out
}

export interface JurisdictionPack {
  readonly jurisdiction_id: string
  readonly sources: SourceRegistry
  readonly rules: readonly Rule[]
  readonly interpretations: readonly Interpretation[]
}

export interface LoadPackOptions {
  readonly jurisdiction_id?: string
  readonly sourcesDir?: string
  readonly rulesDir?: string
  readonly interpretationsDir?: string
}

/** Load a fixture or on-disk pack. Paths are directories of YAML/JSON docs. */
export function loadPack(root: string, options: LoadPackOptions = {}): JurisdictionPack {
  const sourcesRoot = options.sourcesDir ?? join(root, 'sources')
  const rulesRoot = options.rulesDir ?? join(root, 'rules')
  const interpretationsRoot = options.interpretationsDir ?? join(root, 'interpretations')

  const sources = new SourceRegistry({
    sources: loadSourcesFromDir(sourcesRoot),
    versions: loadSourceVersionsFromDir(join(root, 'versions'))
  })
  for (const v of loadSourceVersionsFromDir(sourcesRoot)) {
    if (sources.versionsOf(v.source_id).some((x) => x.source_version_id === v.source_version_id)) {
      continue
    }
    sources.addVersion(v)
  }

  const rules = loadRulesFromDir(rulesRoot)
  const interpretations = loadInterpretationsFromDir(interpretationsRoot)

  const jurisdiction_id =
    options.jurisdiction_id ??
    rules[0]?.jurisdiction_id ??
    sources.list()[0]?.jurisdiction_id ??
    'unknown'

  return { jurisdiction_id, sources, rules, interpretations }
}
