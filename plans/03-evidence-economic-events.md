# 03 — Raw evidence, economic legs, semantic events

**Spec:** §§12–16  
**Workstream:** A + event-engine  
**Depends on:** 02  
**Unblocks:** adapters (07), tools (08), workspace (09), lots (04)  
**Packages:** `packages/evidence`, `packages/event-engine`

## Layering (MUST)

```text
RAW / TECHNICAL TRANSACTION     # chain/csv/marketplace bytes + normalized technical tx
          ↓
     ECONOMIC LEGS              # asset movements with economic_character
          ↓
     SEMANTIC EVENT             # typed business/economic event
          ↓
     tax classification later   # rules engine, not here
```

INV-001, INV-002, INV-003, INV-015, INV-016.

## Raw evidence (§12)

Supported types (schema enums from day one; importers P0 vs later):

P0 importers: `blockchain_operation`, `marketplace_transaction`, `generic_csv`, `manual_user_record`

Schema-ready for: `exchange_export`, `bank_record`, `payment_processor_record`, `invoice`, `gallery_statement`, `contract`, `grant_document`, `token_allocation_agreement`, `vesting_schedule`, `accounting_csv`

```yaml
evidence_id:
evidence_type:
source_system:          # e.g. tzkt, objkt, user_csv
source_identifier:      # op hash, filename, etc.
timestamp:
raw_payload_ref:        # blob store key / opfs path
content_hash:           # sha-256 of raw payload
imported_at:
schema_version:
```

Rules:

- Imported raw evidence is **immutable**
- Corrections via annotations or derived records (AC-009)
- Never create tax outcomes in importers

Blob store: local OPFS/SQLite for private data; public tools may hold ephemeral raw JSON in memory keyed by hash.

## Technical transaction (chain-neutral)

Adapters emit this, not semantic NFT sales:

```yaml
technical_tx_id:
chain:
block_height:
block_time_utc:
operation_hash:
op_index:
from_address:
to_address:
entrypoint?:
parameter?:
token_transfers: [{ contract, token_id, amount, from, to }]
native_transfers: [{ amount, from, to }]
internal_operations: []
status: applied | failed | backtracked | skipped
source_evidence: [evidence_id]
```

Failed ops are evidence, not economic events, unless a rule/user says otherwise.

## Economic legs (§14)

```yaml
leg_id:
event_id:               # filled when grouped
from_party:
to_party:
asset:
quantity:
direction: inbound | outbound
economic_character:
  consideration | transfer | fee | royalty | reward
  | collateral | loan_principal | repayment | interest
  | compensation | distribution | grant | gift | unknown
timestamp:
source_evidence: []
valuation_ref: nullable
```

A semantic event MAY contain multiple legs (gross, fee, royalty, net).

## Semantic events (§15)

Implement the **full enum** in schema in P0 so later protocol support does not migrate data. Runtime completeness may be partial.

### General acquisition/disposal

`ASSET_PURCHASE ASSET_SALE ASSET_EXCHANGE ASSET_TRANSFER SELF_TRANSFER GIFT DONATION BARTER LOSS THEFT BURN REFUND`

### Artistic activity

`ART_PRIMARY_SALE ART_SECONDARY_SALE COMMISSION_INCOME ROYALTY_RECEIPT LICENCE_INCOME COPYRIGHT_ASSIGNMENT GALLERY_CONSIGNMENT GALLERY_SETTLEMENT GRANT PRIZE PATRONAGE COLLABORATION_SPLIT`

### NFT activity

`NFT_MINT NFT_PURCHASE NFT_SALE NFT_TRANSFER NFT_ROYALTY NFT_GIFT NFT_DONATION NFT_BURN NFT_REDEMPTION`

### Compensation/builders

`SALARY_PAYMENT CONTRACTOR_PAYMENT FOUNDER_COMPENSATION TOKEN_COMPENSATION TOKEN_GRANT TOKEN_VESTING TOKEN_UNLOCK BOUNTY DAO_COMPENSATION FOUNDER_ALLOCATION TEAM_ALLOCATION`

### Basic crypto

`CRYPTO_RECEIPT CRYPTO_PURCHASE CRYPTO_SALE CRYPTO_SWAP CRYPTO_PAYMENT AIRDROP FORK_RECEIPT`

### Protocol activity (schema P0, decode MAY be incomplete)

`MINING_REWARD VALIDATOR_REWARD BAKING_REWARD STAKING_REWARD DELEGATION_REWARD LIQUIDITY_DEPOSIT LIQUIDITY_WITHDRAWAL LIQUIDITY_REWARD LENDING_DEPOSIT LOAN_ADVANCE LOAN_REPAYMENT INTEREST_RECEIPT INTEREST_PAYMENT COLLATERAL_DEPOSIT COLLATERAL_RELEASE LIQUIDATION WRAP UNWRAP BRIDGE_DEPOSIT BRIDGE_WITHDRAWAL`

### Trading (schema P0, engine MAY stub)

`SPOT_TRADE DERIVATIVE_OPEN DERIVATIVE_CLOSE OPTION_EXERCISE OPTION_EXPIRY PERPETUAL_FUNDING`

P0 decode priority (Tezos): mint, primary/secondary NFT sale, royalty, marketplace fee, transfers, self-transfer, baking/staking reward, generic tez/FA12/FA2 transfer, unknown contract call → `UNKNOWN` character legs rather than fake sales.

## Normalized event record (§16)

```yaml
event_id:
event_type:
occurred_at_utc:
occurred_at_local:
timezone:
participant:
capacity:
counterparties: []
assets_given: []
assets_received: []
gross_amount:
fees:
royalties:
commissions:
net_amount:
jurisdiction_facts: {}
source_evidence: []
user_annotations: []
classification:
classification_source: user | adapter | heuristic | ai_candidate
classification_confidence:   # factual, not legal
created_at:
schema_version:
legs: [leg_id]
```

Every derived fact SHOULD carry:

`OBSERVED | IMPORTED | USER_CONFIRMED | INFERRED | ESTIMATED | UNKNOWN`

## Event engine API

```ts
normalize(technicalTxs: TechnicalTx[], ctx: {
  ownership: WalletOwnershipMap
  marketplaceDecodes: MarketplaceDecode[]
  userTags: Annotation[]
}): { legs: Leg[]; events: SemanticEvent[]; unresolved: Unresolved[] }
```

Rules:

- One technical tx → zero or more events (INV-015)
- Marketplace decode is an input overlay, not a replacement of chain evidence
- If ownership of both sides confirmed same participant → `SELF_TRANSFER`, not sale
- Unknown contract interactions → unresolved, not `ASSET_SALE`
- Do not set tax classification here

## Implementation tasks

1. JSON Schema for evidence, technical tx, leg, semantic event, annotation, fact-status.
2. Immutable evidence store (append + get-by-hash).
3. Event engine with unit tests for: OBJKT-like split (gross/fee/royalty/net), self-transfer, mint without sale, baking reward, failed op ignored, one op / two events (e.g. NFT transfer + tez payment).
4. Annotation API: add tag without mutating evidence (TOOL-008).
5. Regression fixtures from spec §88: self-transfer as sale; royalty as primary; duplicated marketplace fee.

## Tests

- AC-009 correction never destroys evidence
- AC-012 chain op not automatically taxable
- AC-015 Tezos primary, secondary, royalty, fees, self-transfers decoded as such
