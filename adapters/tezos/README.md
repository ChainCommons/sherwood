# Tezos public wallet import

P0-2-02 preserves exact source response bytes through `EvidenceStore` and emits
the shared `TechnicalTx` type. Supply a local store, public address, explicit
network, import timestamp, history source, and mapper to `importPublicWallet`.
`InMemoryEvidenceStore` is available for ephemeral use; durable persistence is
the responsibility of the supplied store. Nothing uploads a ledger or asserts
wallet ownership.

```ts
const result = await importPublicWallet({
  address,
  chain: 'tezos:mainnet',
  importedAt: new Date().toISOString(),
  source, // { id, fetchOperations(address): AsyncIterable<string | Uint8Array> }
  store,
  map: mapTzktOperation,
})
```

The source yields exact JSON response bytes, either individual operations or
arrays. It must include internal transactions and all pages required for the
requested wallet. The importer consumes this history capability without tying
it to a particular HTTP client. P0-2-01's transport, paging and rate limits are
not implemented here; its prior PR supplied an RFC, not a runtime client.
A different provider supplies its own mapper using the same import pipeline.

The TzKT mapper supports decoded transaction records, tez amounts and fees in
XTZ, FA1.2 `transfer` records, and FA2 `transfer` batches. Token quantities stay
in base units; no decimals or valuations are guessed. Its decoded parameter
input follows the [TzKT API](https://api.tzkt.io/) and the frozen repository
responses under `tests/adapters/tzkt`. Flat internal records become separate
transactions with distinct IDs; TzKT's record ID is not mislabelled as an
operation index. All records retain the operation hash and UTC block time.

Failed, skipped and backtracked operations retain evidence, status, fees and
parameters but emit no transfers. Unknown entrypoints remain opaque. Other
operation types, malformed transfer shapes, unsafe numeric amounts and invalid
timestamps produce explicit issues referencing retained evidence. The importer
does not infer token movements from arbitrary mint/burn entrypoints, decode
marketplace semantics, recognize baking rewards or generate tax types.

Evidence IDs include source, network and byte hash. Identical imports reuse the
original timestamp; changed bytes create new evidence. The shared store owns
hashing, immutable storage and conflict enforcement. Transaction IDs depend on
network, operation hash and TzKT record ID, not import time. Different source
responses can describe the same transaction; reconciliation remains downstream.
Source/store errors propagate; evidence already appended remains available for
a retry. Address validation checks public account syntax, not the checksum.

Run `pnpm exec vitest run adapters/tezos/test` and
`pnpm exec tsc -p adapters/tezos/tsconfig.json --noEmit`.
