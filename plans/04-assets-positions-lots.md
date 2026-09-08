# 04 — Assets, positions, tax lots

**Spec:** §§17–21  
**Workstream:** A + F  
**Depends on:** 02, 03  
**Unblocks:** valuation (06), tools (cost-basis related), workspace findings  
**Packages:** `packages/core` (asset types), `packages/positions`, `packages/lots`

## Asset model (§17)

```yaml
asset_id:
asset_type:
native_chain:
contract:
token_id:
fungibility: fungible | nonfungible | semi_fungible
economic_category:
  fiat | cryptocurrency | stablecoin | governance_token | utility_token
  | nft | wrapped_asset | staking_receipt | liquidity_position
  | derivative | tokenized_real_world_asset | physical_asset
  | intellectual_property | other
underlying_assets: []
issuer:
decimals:
price_sources: []
classification_status: unknown | user_set | inferred
```

Rules:

- Legal classification MUST remain jurisdiction-specific (INV-014). Store `legal_classifications: [{ jurisdiction_id, class, as_of, sources, certainty }]` separately — not a single global “security vs commodity” flag.
- Identify Tezos assets as `chain + contract + token_id` (FA2) or native `XTZ`.
- Artwork (plan 02) links via `token_contract/token_id` without collapsing IP into the token.

Asset registry in workspace is local. Public tools may resolve FA2 metadata ephemerally (treat metadata as untrusted — plan 11/12).

## Position model (§20)

For DeFi, vesting, similar:

```yaml
position_id:
participant:
protocol:
position_type: liquidity | lending | borrowing | staking | collateral | derivative | vesting | other
assets_deposited: []
assets_received: []
opened_at:
closed_at:
source_events: []
```

P0: implement schema + engine hooks. Materialize **staking/baking** as reward events; optional simple “baker delegation” position. Do not build full LP/lending/derivative accounting in P0 (schema must allow; UI may show `UNSUPPORTED` / `UNKNOWN`).

Vesting positions: open on `TOKEN_GRANT` / vest schedule evidence; remain open across vest/unlock/delivery events (plan 02 — do not collapse).

## Tax-lot engine (§21)

Lots ≠ transactions (INV-017).

```yaml
lot_id:
asset:
quantity_original:
quantity_remaining:
acquired_at:
acquisition_event:
cost_basis:
cost_basis_currency:
valuation_ref:
holding_period_start:
owner:                  # participant or entity
method_context:         # which method created/consumed this matching
```

Jurisdiction-selectable methods (MUST include where appropriate; MUST NOT assume FIFO globally):

`FIFO LIFO HIFO SPECIFIC_IDENTIFICATION AVERAGE_COST POOLING OTHER`

### API

```ts
openLots(acquisitions: Event[], valuations: Valuation[], owner: PartyId): Lot[]
matchDisposals(lots: Lot[], disposal: Event, method: LotMethod, specIds?: LotId[]): {
  consumptions: LotConsumption[]
  remainder: Lot[]
  gaps: QuantityGap[]  # missing basis → UNKNOWN not invented
}
```

Rules:

- Decimal quantity matching; never float.
- If remaining lots insufficient, emit gap + finding `UNKNOWN` / missing records — do not invent basis.
- Self-transfers: move lots to the destination wallet **without** a disposal when ownership confirmed.
- NFT: generally 1:1 lots (token_id). Fungible XTZ: pool by method.
- Method is an analysis input recorded on the snapshot (plan 17), not a hidden global.
- Holding period start is a fact with status; some jurisdictions may differ — jurisdiction packs consume it, lots engine only records it.

P0 methods to implement fully: FIFO, SPECIFIC_IDENTIFICATION, AVERAGE_COST. LIFO/HIFO/POOLING: implement or explicitly mark unsupported in UI with honest maturity — spec says MUST support where appropriate; implement all matching algorithms as pure functions if small (they are).

## Implementation tasks

1. Asset JSON Schema + Tezos FA1.2/FA2/XTZ constructors.
2. Jurisdiction-specific legal classification table.
3. Position schema + staking/vesting minimal state machine.
4. Lot engine with golden tests: FIFO XTZ partial disposal; NFT specific ID; self-transfer lot migration; insufficient lots; average cost two lots.
5. Snapshot records `lot_method`.
6. Regression: “cost basis matched incorrectly” (§88).

## P1 (do not block P0)

- Tax-Lot Visualizer tool
- Portfolio Cost Basis Explorer
- Complex LP share lots
