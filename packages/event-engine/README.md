# Economic event engine

`normalize(technicalTxs, context)` reconstructs one participant's economic view
from schema-validated technical transactions, marketplace overlays, confirmed
wallet ownership, and user annotations. It returns `{ legs, events, unresolved }`.
It performs no network requests, valuation, lot matching, or tax classification.

```ts
import { normalize } from './src/index.ts'

const result = normalize(transactions, {
  participant: 'participant-id',
  ownership: wallets,
  marketplaceDecodes: overlays,
  userTags: annotations,
  nativeAssets: { tezos: { chain: 'tezos', symbol: 'XTZ' } },
})
```

The caller supplies native asset identities; chain names and token symbols have
no built-in meaning. Ownership is scoped by chain and requires `USER_CONFIRMED`
plus an owner ID. Only movements involving the selected participant's confirmed
wallets produce events. Conflicting confirmed ownership produces an unresolved
record. Personal and company owner IDs remain distinct.

The package consumes the existing schemas and shared core enums, decimal
arithmetic, and hashing. Structural input types mirror the technical transaction,
marketplace overlay, wallet ownership, and annotation contracts. All persisted
amounts are decimal strings. No upstream schema changes are required.

## Supported reconstruction

- A single-token sale with a `gross_sale_price` component reconciles against
  exact buyer-to-beneficiary payments: seller net, marketplace fees, and royalties.
  The seller's event contains gross consideration, deduction legs, and token
  delivery. Net is a summary, not another movement. Reconstructed gross and
  deduction legs are marked `INFERRED`; observed chain records remain unchanged.
- Buyers receive `NFT_PURCHASE` with the actual payment split and token receipt.
  Royalty recipients receive `NFT_ROYALTY`; marketplace recipients retain fee
  character. Explicit primary/secondary art-sale hints are preserved when
  consistent. Capacity and copyright ownership are never inferred.
- Network fees are separate fee-character events, outside sale proceeds. Failed,
  backtracked, and skipped operations produce no legs or events, including fees.
- Confirmed same-owner movements become `SELF_TRANSFER`, taking precedence over
  sale proposals. Other plain movements become `ASSET_TRANSFER`.
- Confirmed transaction/evidence annotations can identify incoming `NFT_MINT`,
  `BAKING_REWARD`, `STAKING_REWARD`, `VALIDATOR_REWARD`, or `DELEGATION_REWARD`.
  Entrypoint names alone never establish mint or reward semantics. Other tags
  remain annotation references; unsupported/conflicting confirmed event assertions
  are reported as unresolved.

## Boundaries and reproducibility

Unknown contract interactions retain observed quantities with `unknown` character
and `UNKNOWN` event type. Missing native configuration, unreconciled or conflicting
overlays, and invalid amounts produce explicit unresolved records. Batch sales,
escrow routing, aggregated payments, and token-denominated sale payments are not
decoded in this initial implementation. Adapters must flatten applied internal
movements into transfer arrays; opaque internal operations are reported unresolved
and are not recursively interpreted or counted again.

Inputs must satisfy the published schemas before normalization. Quantities receive
an additional nonnegative/finite check. Exact duplicate transaction records and
overlays are idempotent; differing records with the same transaction ID are
unresolved. Distinct overlays are conservatively treated as conflicting.

Event/leg IDs are stable slugs derived from participant, transaction ID, and
movement/group identity using core hashing. `created_at` uses the transaction
instant for deterministic replay; consumers may record execution time separately
in an analysis snapshot. Output timestamps remain UTC; no local timezone is
assumed. IDs identify the derived group, so a revised interpretation can retain its
ID while an analysis snapshot records its version. Outputs are detached copies.
Every leg and event retains evidence IDs, and reconciled sale interpretations
include both chain and overlay evidence. Original inputs are never mutated.

Run `corepack pnpm exec vitest run packages/event-engine/test` and
`corepack pnpm exec tsc -p packages/event-engine/tsconfig.json --noEmit`.
