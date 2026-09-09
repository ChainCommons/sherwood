import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { instant } from '../../core/src/index.ts'
import { loadSchemas } from '../../validate/src/schema-registry.ts'
import { matchDisposals, moveLots, openLots } from '../src/index.ts'

const root = fileURLToPath(new URL('../../../', import.meta.url))
const validate = loadSchemas(root).byPath.get('schemas/lot/lot.schema.json')!
const policy = { basis_decimals: 8, rounding_mode: 'HALF_EVEN' } as const
const timestamp = instant('2021-01-01T00:00:00Z')
const asset = { asset_id: 'example-token' }
const opened = openLots([{
  lot_id: 'lot-1', event_id: 'purchase-1', asset, quantity: '2', occurred_at_utc: timestamp
}], [], 'participant-1')

describe('existing lot schema compatibility', () => {
  it.each(['lot-1', '01ARZ3NDEKTSV4RRFFQ69G5FAV'])('persists opened, consumed and partially moved lot records: %s', (lot_id) => {
    const known = opened.map((lot) => ({ ...lot, lot_id, cost_basis: '3', cost_basis_currency: 'EUR', cost_basis_status: 'IMPORTED' as const }))
    const matched = matchDisposals(known, {
      event_id: 'disposal-1', owner: 'participant-1', asset, quantity: '1',
      occurred_at_utc: timestamp, cost_basis_currency: 'EUR'
    }, 'AVERAGE_COST', policy)
    const moved = moveLots(known.map((lot) => ({ lot, wallet_id: 'wallet-a' })), {
      event_id: 'transfer-1', asset, occurred_at_utc: timestamp,
      from: { wallet_id: 'wallet-a', owner: 'participant-1', confirmed: true },
      to: { wallet_id: 'wallet-b', owner: 'participant-1', confirmed: true },
      selections: [{ lot_id, quantity: '1' }]
    }, policy)
    for (const lot of [...opened, ...matched.remainder, ...moved.holdings.map((holding) => holding.lot)]) {
      expect(validate(lot), JSON.stringify(validate.errors)).toBe(true)
    }
  })
})
