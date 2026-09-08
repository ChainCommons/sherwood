/**
 * The enums in `packages/core` and the enums in `schemas/` must not drift.
 *
 * They are duplicated on purpose — the schemas have to stand alone as a
 * published contract, and core has to give TypeScript the union types — so
 * this suite is what keeps the duplication honest. Adding an event type in one
 * place and forgetting the other fails here.
 */
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import * as core from '../../packages/core/src/enums.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const common = JSON.parse(readFileSync(join(root, 'schemas/common.schema.json'), 'utf8'))
const readSchema = (p: string): any => JSON.parse(readFileSync(join(root, 'schemas', p), 'utf8'))

const defEnum = (name: string): string[] => common.$defs[name].enum

describe('enum parity between core and schemas', () => {
  const cases: Array<[string, readonly (string | number)[], string[]]> = [
    ['capacity', core.CAPACITIES, defEnum('capacityEnum')],
    ['semantic event type', core.SEMANTIC_EVENT_TYPES, defEnum('semanticEventType')],
    ['economic character', core.ECONOMIC_CHARACTERS, defEnum('economicCharacter')],
    ['fact status', core.FACT_STATUSES, defEnum('factStatus')],
    ['lot method', core.LOT_METHODS, defEnum('lotMethod')],
    ['valuation method', core.VALUATION_METHODS, defEnum('valuationMethod')],
    ['tax domain', core.TAX_DOMAINS, defEnum('taxDomain')],
    ['authority level', core.AUTHORITY_LEVELS, defEnum('authorityLevel')],
    ['certainty level', core.CERTAINTY_LEVELS, common.$defs.certainty.properties.level.enum],
    ['review status', core.REVIEW_STATUSES, defEnum('reviewStatus')],
    ['participant type', core.PARTICIPANT_TYPES, readSchema('participant/participant.schema.json').properties.participant_type.enum],
    ['relationship type', core.RELATIONSHIP_TYPES, readSchema('entity/entity-relationship.schema.json').properties.relationship_type.enum],
    ['ownership class', core.OWNERSHIP_CLASSES, readSchema('entity/wallet-ownership.schema.json').properties.ownership_class.enum],
    ['compensation right type', core.COMPENSATION_RIGHT_TYPES, readSchema('asset/compensation-right.schema.json').properties.right_type.enum],
    ['evidence type', core.EVIDENCE_TYPES, readSchema('evidence/evidence.schema.json').properties.evidence_type.enum],
    ['technical tx status', core.TECHNICAL_TX_STATUSES, readSchema('event/technical-transaction.schema.json').properties.status.enum],
    ['leg direction', core.LEG_DIRECTIONS, readSchema('event/leg.schema.json').properties.direction.enum],
    ['classification source', core.CLASSIFICATION_SOURCES, readSchema('event/semantic-event.schema.json').properties.classification_source.enum],
    ['asset economic category', core.ASSET_ECONOMIC_CATEGORIES, readSchema('asset/asset.schema.json').properties.economic_category.enum],
    ['fungibility', core.FUNGIBILITY, readSchema('asset/asset.schema.json').properties.fungibility.enum],
    ['position type', core.POSITION_TYPES, readSchema('position/position.schema.json').properties.position_type.enum],
    ['jurisdiction type', core.JURISDICTION_TYPES, readSchema('jurisdiction/jurisdiction.schema.json').properties.jurisdiction_type.enum],
    ['source type', core.SOURCE_TYPES, readSchema('source/source.schema.json').properties.source_type.enum],
    ['valuation miss reason', core.VALUATION_MISS_REASONS, readSchema('valuation/valuation-miss.schema.json').properties.reason.enum],
    ['finding status', core.FINDING_STATUSES, readSchema('finding/finding.schema.json').properties.status.enum],
    ['finding posture', core.FINDING_POSTURES, readSchema('finding/finding.schema.json').properties.posture.enum],
    ['precedential status', core.PRECEDENTIAL_STATUSES, readSchema('case/case.schema.json').properties.precedential_status.enum],
    ['domain pack', core.DOMAIN_PACKS, readSchema('scenario/scenario.schema.json').properties.domain_pack.enum],
    ['rounding mode', core.ROUNDING_MODES, readSchema('snapshot/snapshot.schema.json').properties.rounding_mode.enum]
  ]

  it.each(cases)('%s matches', (_name, fromCore, fromSchema) => {
    expect([...fromSchema].sort()).toEqual([...fromCore].sort())
  })
})

describe('event vocabulary completeness', () => {
  it('keeps generic crypto events that do not depend on NFT types (INV-019)', () => {
    // A ledger of plain crypto activity must be expressible without touching
    // the NFT vocabulary at all.
    const generic = ['CRYPTO_RECEIPT', 'CRYPTO_PURCHASE', 'CRYPTO_SALE', 'CRYPTO_SWAP', 'CRYPTO_PAYMENT', 'AIRDROP', 'FORK_RECEIPT']
    for (const t of generic) expect(core.SEMANTIC_EVENT_TYPES).toContain(t)
  })

  it('keeps token compensation stages distinct (plan 02 §19)', () => {
    // Collapsing grant, vest, unlock and delivery into one income event is the
    // failure this separation exists to prevent.
    for (const t of ['TOKEN_GRANT', 'TOKEN_VESTING', 'TOKEN_UNLOCK', 'TOKEN_COMPENSATION']) {
      expect(core.SEMANTIC_EVENT_TYPES).toContain(t)
    }
  })

  it('offers SELF_TRANSFER alongside ASSET_TRANSFER (AC-004)', () => {
    expect(core.SEMANTIC_EVENT_TYPES).toContain('SELF_TRANSFER')
    expect(core.SEMANTIC_EVENT_TYPES).toContain('ASSET_TRANSFER')
  })

  it('lets every vocabulary of consequence say UNKNOWN', () => {
    expect(core.SEMANTIC_EVENT_TYPES).toContain('UNKNOWN')
    expect(core.CAPACITIES).toContain('UNKNOWN')
    expect(core.ECONOMIC_CHARACTERS).toContain('unknown')
    expect(core.CERTAINTY_LEVELS).toContain('UNKNOWN')
    expect(core.FACT_STATUSES).toContain('UNKNOWN')
    expect(core.OWNERSHIP_CLASSES).toContain('UNKNOWN')
  })

  it('does not default to FIFO by ordering (plan 04 §21)', () => {
    // The list is a menu, not a priority order; the method is always chosen.
    expect(core.LOT_METHODS).toContain('SPECIFIC_IDENTIFICATION')
    expect(core.LOT_METHODS).toContain('AVERAGE_COST')
    expect(core.LOT_METHODS.length).toBeGreaterThan(1)
  })

  it('has no duplicate members in any exported vocabulary', () => {
    for (const [name, value] of Object.entries(core)) {
      if (!Array.isArray(value)) continue
      expect(new Set(value).size, `${name} has duplicates`).toBe(value.length)
    }
  })
})
