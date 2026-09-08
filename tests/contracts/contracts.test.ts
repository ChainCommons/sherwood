/**
 * The inter-lane contract.
 *
 * These fixtures are what downstream lanes build against, so this suite checks
 * more than "the JSON matches the schema": it asserts the layering rules that
 * make the schemas worth having. If one of these fails, a lane boundary moved.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { loadSchemas } from '../../packages/validate/src/schema-registry.ts'
import { amount, sub, sum, toJSON } from '../../packages/core/src/money.ts'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '../..')

const read = (name: string): any => JSON.parse(readFileSync(join(here, name), 'utf8'))

const registry = loadSchemas(root)

const schemaPathOf = (declared: string): string =>
  'schemas/' + declared.split('schemas.opencryptotaxcommons.org/')[1]

const validateRecord = (record: Record<string, unknown>): void => {
  const declared = record.$schema
  expect(typeof declared).toBe('string')
  const validate = registry.byPath.get(schemaPathOf(declared as string))
  expect(validate, `no compiled schema for ${String(declared)}`).toBeDefined()
  const { $schema: _ignored, ...payload } = record
  const ok = validate!(payload)
  expect(validate!.errors ?? [], JSON.stringify(validate!.errors, null, 2)).toEqual([])
  expect(ok).toBe(true)
}

const fixtureFiles = readdirSync(here).filter((f) => f.endsWith('.json'))

describe('contract fixtures', () => {
  it('ships an example for every record that crosses a lane boundary', () => {
    // Downstream lanes are blocked without these, so their absence is a failure
    // rather than something to discover later.
    const required = [
      'evidence.json', 'technical-transaction.json', 'marketplace-overlay.json',
      'legs.json', 'semantic-event.json', 'valuation.json', 'valuation-miss.json',
      'finding.json', 'participant.json', 'wallet-ownership.json', 'lot.json',
      'snapshot.json'
    ]
    expect(fixtureFiles.sort()).toEqual(expect.arrayContaining(required))
  })

  it.each(fixtureFiles)('%s validates against the schema it declares', (name) => {
    const doc = read(name)
    for (const record of Array.isArray(doc) ? doc : [doc]) validateRecord(record)
  })
})

describe('layering invariants', () => {
  const technicalTx = read('technical-transaction.json')
  const overlay = read('marketplace-overlay.json')
  const legs = read('legs.json')
  const event = read('semantic-event.json')
  const finding = read('finding.json')

  it('keeps technical transactions free of semantic event types (INV-002)', () => {
    // An adapter emits chain facts. If a technical tx could carry NFT_SALE,
    // the adapter would be deciding economics.
    const serialized = JSON.stringify(technicalTx)
    expect(serialized).not.toMatch(/"event_type"/)
    expect(technicalTx.status).toBe('applied')
  })

  it('carries source_evidence as an array everywhere (INV-016)', () => {
    expect(Array.isArray(technicalTx.source_evidence)).toBe(true)
    expect(Array.isArray(event.source_evidence)).toBe(true)
    for (const leg of legs) expect(Array.isArray(leg.source_evidence)).toBe(true)
  })

  it('treats the marketplace decode as an overlay, not a replacement', () => {
    // The overlay points back at the technical tx and shares its evidence: it
    // adds an interpretation without displacing the chain record.
    expect(overlay.technical_tx_id).toBe(technicalTx.technical_tx_id)
    expect(overlay.source_evidence).toEqual(technicalTx.source_evidence)
    expect(overlay.status).toBe('INFERRED')
  })

  it('splits the deal into legs instead of one net number', () => {
    // The "marketplace fee duplicated" and "royalty treated as primary sale"
    // regressions (§88) both come from collapsing this split.
    const byCharacter = Object.fromEntries(
      legs.map((l: any) => [l.economic_character, l.quantity])
    )
    expect(byCharacter.consideration).toBe('100')
    expect(byCharacter.fee).toBe('2.5')
    expect(byCharacter.royalty).toBe('10')
    expect(byCharacter.transfer).toBe('1')
  })

  it('reconciles net = gross - fees - royalties exactly', () => {
    const net = sub(sub(amount(event.gross_amount), amount(event.fees)), amount(event.royalties))
    expect(toJSON(net)).toBe(toJSON(amount(event.net_amount)))

    const outflows = legs
      .filter((l: any) => ['fee', 'royalty'].includes(l.economic_character))
      .map((l: any) => amount(l.quantity))
    expect(toJSON(sum(outflows))).toBe('12.5')
  })

  it('links every leg to the event and every event leg to a leg', () => {
    const legIds = legs.map((l: any) => l.leg_id).sort()
    expect([...event.legs].sort()).toEqual(legIds)
    for (const leg of legs) expect(leg.event_id).toBe(event.event_id)
  })

  it('separates classification from event_type (INV-003)', () => {
    // event_type is the economic shape; classification is a factual label.
    // Neither is a tax outcome — that comes only from the rules engine.
    expect(event.event_type).toBe('NFT_SALE')
    expect(event.classification).not.toBe(event.event_type)
    expect(event.classification_source).toBe('adapter')
  })

  it('records the timezone used to derive the local date', () => {
    expect(event.timezone).toBe('Europe/Paris')
    expect(event.occurred_at_utc.endsWith('Z')).toBe(true)
  })

  it('keeps a competing capacity candidate rather than picking one', () => {
    expect(event.capacity.status).toBe('USER_CONFIRMED')
    expect(event.capacity.candidates?.length).toBeGreaterThan(0)
  })

  it('resolves to UNKNOWN rather than inventing a treatment (AC-003)', () => {
    // The France pack is LEVEL 0. A finding with no sourced rule must say so.
    expect(finding.status).toBe('unknown')
    expect(finding.certainty.level).toBe('UNKNOWN')
    expect(finding.rule_refs).toEqual([])
    expect(finding.missing_facts.length).toBeGreaterThan(0)
    expect(finding.professional_review_recommended).toBe(true)
  })

  it('carries an explainability trace before anything is displayed (INV-020)', () => {
    const steps = finding.trace.map((t: any) => t.step)
    expect(steps).toContain('RAW_EVIDENCE')
    expect(steps).toContain('ECONOMIC_EVENT')
    expect(steps).toContain('RESULT_OR_UNCERTAINTY')
    expect(finding.event_refs).toContain(event.event_id)
  })

  it('does not invent a price when no market exists (AC-005)', () => {
    const miss = read('valuation-miss.json')
    const valuation = read('valuation.json')
    expect(miss.reason).toBe('no_market')
    expect(miss.providers_tried.length).toBeGreaterThan(0)
    // The valuation that did resolve still exposes provider, method and time.
    for (const field of ['provider', 'method', 'timestamp', 'target_currency']) {
      expect(valuation[field]).toBeTruthy()
    }
    expect(valuation.fallback_used).toBe(true)
    expect(valuation.fallback_chain.length).toBeGreaterThan(0)
  })

  it('records the lot method on the snapshot, not as a hidden global', () => {
    const snapshot = read('snapshot.json')
    expect(snapshot.lot_method).toBe('SPECIFIC_IDENTIFICATION')
    expect(snapshot.rounding_mode).toBeTruthy()
    expect(snapshot.timezone_assumption).toBeTruthy()
    expect(snapshot.engine_version).toBeTruthy()
  })

  it('leaves cost basis UNKNOWN instead of fabricating one', () => {
    const lot = read('lot.json')
    expect(lot.cost_basis).toBeUndefined()
    expect(lot.cost_basis_status).toBe('UNKNOWN')
  })

  it('marks confirmed self-owned wallets so transfers are not disposals (AC-004)', () => {
    const wallets = read('wallet-ownership.json')
    const owned = wallets.filter(
      (w: any) => w.confirmation === 'USER_CONFIRMED' && w.owner_participant_id !== null
    )
    expect(owned.length).toBeGreaterThanOrEqual(2)
    expect(new Set(owned.map((w: any) => w.owner_participant_id)).size).toBe(1)
    // An unconfirmed wallet has no owner: a guess is not ownership.
    const marketplace = wallets.find((w: any) => w.ownership_class === 'MARKETPLACE')
    expect(marketplace.owner_participant_id).toBeNull()
  })
})
