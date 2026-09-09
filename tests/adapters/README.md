# Recorded TzKT operations

P0-0-12 freezes four real Tezos mainnet operation groups for future adapter work.
`tzkt/*.json` (except `manifest.json`) contains the exact response bytes from
`GET https://api.tzkt.io/v1/operations/{hash}`. These are TzKT indexer records with
decoded parameters, not node RPC responses or normalized Sherwood records.
The manifest records the fetch time, source and explorer URLs, SHA-256, block,
selected transaction ID, contract, entrypoint, and record/internal counts.

| File | Historical call | Observed coverage |
| --- | --- | --- |
| `objkt-fulfill-ask.json` | OBJKT v1 `fulfill_ask`, 2021-07-01 | 10 tez input, three separate native payouts, one FA2 transfer |
| `objkt-fulfill-bid.json` | OBJKT v1 `fulfill_bid`, 2021-07-01 | Zero tez input, 2.5 tez total payouts, FA2 transfer, surrounding operator add/remove calls |
| `hen.json` | HEN v2 `collect`, 2021-07-07 | 15 tez input, three payouts to the caller, one FA2 transfer |
| `teia.json` | Teia v1 `collect`, 2022-01-28 | 0.1 tez input, three separate native payouts, one FA2 transfer |

Each file includes the whole operation-group response, including internal
transactions. An operation hash can cover multiple external calls: use the
manifest's `transaction_id` to locate the selected call, then its counter to
associate internal transactions. Internal nonces need not start at zero.
Native amounts are integer mutez (1 tez = 1,000,000 mutez); FA2 amounts and token
IDs remain the strings returned by TzKT. Preserve separate payouts even when
their recipient addresses match.

These are public chain records, not taxpayer scenarios. Addresses and indexer
aliases are unchanged evidence, not confirmed identities or wallet ownership.
No primary/secondary sale, royalty, fee, self-transfer, or tax classification is
asserted here. Such interpretations require additional marketplace state and
caller ownership context. The bid fulfillment's zero input also must not be
mistaken for zero consideration. Listing state, prior bid funding, token
metadata and contract storage are outside these operation-response fixtures.

Contract provenance:

- [OBJKT's legacy contract directory](https://docs.objkt.com/product/legacy/faq) identifies marketplace v1 as `KT1FvqJwEDWb1Gwc55Jd1jjTHRVWbYKUUpyq`.
- [TzKT's token indexing example](https://baking-bad.org/blog/2022/01/11/tzkt-v17-with-generic-token-indexing-released/) identifies HEN marketplace `KT1HbQepzV1nVGg8QVznG7z4RcHseD5kwqBn`.
- [Teia's contract repository](https://github.com/teia-community/teia-smart-contracts) identifies marketplace v1 as `KT1PHubm9HtyQEJ4BBpMTVomq6mhbfNZ9z5w`.

Selection used `/v1/operations/transactions` with `target`, `status=applied`,
`sort.asc=id`, and `limit=2` for each OBJKT fulfillment entrypoint; HEN and Teia
used `amount.gt=0&limit=3`. The first result from each query was selected, then
the complete group was fetched by hash. Hashes in the manifest are the fixed
reproduction identifiers; do not rerun discovery to replace these records.

Run the offline checks from the repository root:

```sh
pnpm exec vitest run tests/adapters/tzkt-fixtures.test.ts
```

To inspect a fresh response, fetch a manifest `source_url` into a temporary file
with `curl --fail --silent --show-error "$source_url" --output /tmp/tzkt-operation.json`.
Compare with the frozen file before considering any update. TzKT aliases or
response fields can change even for historical operations; normal tests never
fetch the network or overwrite evidence. Intentional additions/updates require
review of provenance, checksums, and the pinned observed facts together.
