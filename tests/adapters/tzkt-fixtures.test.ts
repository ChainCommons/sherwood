import { createHash } from 'node:crypto'
import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const directory = new URL('./tzkt/', import.meta.url)
const read = (file: string) => readFileSync(new URL(file, directory))
const manifest = JSON.parse(read('manifest.json').toString('utf8'))

describe('frozen mainnet TzKT evidence (P0-0-12)', () => {
  it('ships four distinct operation groups across OBJKT, HEN and Teia', () => {
    expect(manifest.fixtures).toHaveLength(4)
    expect(new Set(manifest.fixtures.map((f: any) => f.operation_hash)).size).toBe(4)
    expect([...new Set(manifest.fixtures.map((f: any) => f.marketplace))].sort())
      .toEqual(['hen-v2', 'objkt-v1', 'teia-v1'])
    expect(readdirSync(directory).sort()).toEqual(
      ['manifest.json', ...manifest.fixtures.map((f: any) => f.file)].sort(),
    )
  })

  for (const fixture of manifest.fixtures) {
    it(`${fixture.file} preserves evidence bytes, identity and internal operations`, () => {
      const bytes = read(fixture.file)
      expect(createHash('sha256').update(bytes).digest('hex')).toBe(fixture.sha256)
      expect(fixture.source_url).toBe(`https://api.tzkt.io/v1/operations/${fixture.operation_hash}`)
      expect(fixture.network).toBe('mainnet')
      expect(Number.isFinite(Date.parse(fixture.recorded_at))).toBe(true)
      const operations = JSON.parse(bytes.toString('utf8'))
      expect(operations).toHaveLength(fixture.record_count)
      expect(new Set(operations.map((op: any) => op.id)).size).toBe(operations.length)
      for (const op of operations) {
        expect(op.hash).toBe(fixture.operation_hash)
        expect(op.level).toBe(fixture.level)
        expect(op.timestamp).toBe(fixture.timestamp)
        expect(op.status).toBe('applied')
        expect(op.type).toBe('transaction')
      }
      const selected = operations.find((op: any) => op.id === fixture.transaction_id)
      expect(selected.target.address).toBe(fixture.marketplace_contract)
      expect(selected.parameter.entrypoint).toBe(fixture.entrypoint)
      expect(selected.nonce).toBeUndefined()
      expect(selected.hasInternals).toBe(true)
      const internals = operations.filter((op: any) => op.nonce != null)
      expect(internals).toHaveLength(fixture.internal_count)
      expect(internals).toHaveLength(4)
      for (const internal of internals) {
        expect(internal.counter).toBe(selected.counter)
        expect(internal.sender.address).toBe(fixture.marketplace_contract)
      }
      expect(internals.filter((op: any) => op.parameter?.entrypoint === 'transfer')).toHaveLength(1)
    })
  }

  it.each([
    ['objkt-fulfill-ask.json', 10000000, [250000, 1000000, 8750000], '97683'],
    ['objkt-fulfill-bid.json', 0, [62500, 500000, 1937500], '157150'],
    ['hen.json', 15000000, [2250000, 375000, 12375000], '127648'],
    ['teia.json', 100000, [20000, 2500, 77500], '531011'],
  ])('%s retains separate native payouts and FA2 quantities', (file, incoming, payouts, tokenId) => {
    const operations = JSON.parse(read(file as string).toString('utf8'))
    const selected = operations.find((op: any) => op.hasInternals)
    expect(selected.amount).toBe(incoming)
    const internals = operations.filter((op: any) => op.nonce != null)
    expect(internals.filter((op: any) => op.amount > 0).map((op: any) => op.amount)).toEqual(payouts)
    const transfer = internals.find((op: any) => op.parameter?.entrypoint === 'transfer')
    expect(transfer.target.address).toBe('KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton')
    expect(transfer.parameter.value[0].txs[0]).toMatchObject({ amount: '1', token_id: tokenId })
  })

  it('keeps operator changes surrounding the zero-tez OBJKT bid fulfillment', () => {
    const operations = JSON.parse(read('objkt-fulfill-bid.json').toString('utf8'))
    const external = operations.filter((op: any) => op.nonce == null)
    expect(external.map((op: any) => op.parameter.entrypoint))
      .toEqual(['update_operators', 'fulfill_bid', 'update_operators'])
    expect(external[0].parameter.value[0]).toHaveProperty('add_operator')
    expect(external[2].parameter.value[0]).toHaveProperty('remove_operator')
  })
})
