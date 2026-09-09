# Lots

Implements P0-1-07: pure acquisition-lot matching and confirmed self-wallet
movements. Uses core decimal arithmetic, UTC normalization and the shared
`LotMethod` vocabulary; consumes valuation records without fetching prices or
classifying receipts, transfers or tax treatment.

```ts
import { instant } from '../core/src/index.ts'
import { matchDisposals, openLots } from './src/index.ts'

const lots = openLots([{
  lot_id: 'lot-1', event_id: 'purchase-1', asset: { asset_id: 'example-token' },
  quantity: '10', occurred_at_utc: instant('2021-01-01T00:00:00Z'),
  valuation_ref: 'valuation-1'
}], savedValuations, 'participant-1')

const result = matchDisposals(lots, {
  event_id: 'disposal-1', owner: 'participant-1', asset: { asset_id: 'example-token' },
  quantity: '3', occurred_at_utc: instant('2021-06-01T00:00:00Z'),
  cost_basis_currency: 'EUR'
}, 'FIFO', { basis_decimals: 8, rounding_mode: 'HALF_EVEN' })
// Persist result.remainder for the next operation, and retain the full result
// and original inputs in the analysis trace. Expose result.gaps as UNKNOWN.
```

The caller resolves normalized event legs into `Acquisition` and `Disposal`
inputs. Choosing which events require lot opening or matching belongs upstream.
`openLots` requires an explicit valuation reference with matching asset,
quantity and instant. A missing reference, valuation miss or unrelated valuation
opens a lot with absent basis and `cost_basis_status: UNKNOWN`. Zero basis is
accepted only when explicitly supplied by a successful valuation. The acquisition
and valuation references remain inspectable; a holding-period start is recorded
only when supplied. The engine does not determine legal holding periods.

`Lot` matches the existing lot schema. Decimal fields are strings. **`cost_basis`
is the total basis of `quantity_remaining`**, so partial matching reduces both.
Keep the original lot and acquisition valuation in the snapshot for historical
basis. Method outputs are analysis state; rerunning with a different method starts
from the original acquisitions, not from another method's remainder. Runtime
checks cover calculation boundaries; importers should schema-validate records.

`matchDisposals(lots, disposal, method, policy, specIds?)` requires an explicit
method and rounding policy, returned with the result for snapshot recording.
Only matching owner/asset lots acquired at or before the disposal are eligible.
Registry `asset_id` is canonical when present; otherwise chain, contract and token
ID identify tokens, and chain plus symbol identify native assets. Resolve aliases
upstream. A registry ID and a chain-only reference are deliberately distinct.

- `FIFO` and `LIFO`: chronological matching, deterministic lot-ID ties.
- `HIFO`: descending remaining unit basis, then acquisition time and lot ID.
  Any unknown basis/currency in eligible lots prevents a reliable ordering and
  returns an unchanged remainder with an `UNKNOWN` gap.
- `SPECIFIC_IDENTIFICATION`: consumes only the supplied lot IDs, in their explicit
  order. Missing/ineligible IDs produce an unchanged remainder and a gap;
  duplicate IDs are invalid. No fallback to other lots. NFT references include
  the token ID, so another token cannot fill a shortage.
- `AVERAGE_COST` and `POOLING`: weighted aggregate basis over eligible lots of
  the requested owner and asset. Quantity is drawn chronologically for a stable
  physical record; basis depends on every eligible lot, listed in
  `basis_lot_ids`. Residual aggregate basis is redistributed across remaining
  physical lots. `POOLING` implements this arithmetic pool only; jurisdiction
  rules for matching windows or special pool membership are not implemented.
- `OTHER`: explicitly unsupported, returning an unchanged remainder and an
  `UNKNOWN` gap. There is no default method.

Insufficient quantities emit an `insufficient_lots` gap for the unmatched amount.
Missing basis and currency mismatch also emit `UNKNOWN` gaps; no implicit FX or
zero basis is supplied. Known portions can still be consumed by ordered methods.
An unknown member makes the entire weighted pool's basis unknown, including its
remaining state. Gaps describe calculation uncertainty for the findings layer;
they are not legal conclusions.

All arithmetic uses core's 40-significant-digit decimals. Quantities are never
rounded to fiat precision. The caller chooses basis decimal places and rounding
mode; the engine rounds total pooled disposal basis once before distributing it.
The final consumption/allocation receives the residual, preserving total basis
through repeated partial disposals, including repeating fractions. Basis shares
are capped at the available basis. Currency display or legal rounding policy is
not inferred here.

`moveLots(holdings, transfer, policy)` takes `Holding { wallet_id, lot }` wrappers
so wallet location stays separate from the shared lot schema. Both wallets must
have confirmed, identical owners. Explicit `{ lot_id, quantity }` selections
identify physical lots without selecting a tax method. The move is atomic: an
unconfirmed owner or unavailable selection yields unchanged holdings and gaps.
A whole-lot move retains its ID; a partial move creates a deterministic ID from
the source lot and transfer event, splits quantities and basis, and preserves
acquisition event, timestamp, valuation reference and holding-period start.
Movement records link the split back to its source. No consumption or disposal
is emitted. Unknown basis stays unknown even when wallet movement is known.
Validate ownership evidence upstream and retain it with the transfer event.

Use a chronologically reconstructed snapshot: lots do not reconstruct historical
wallet locations from current holdings. For wallet-scoped disposal, pass the lots
from that wallet; for owner-wide pooling, pass all eligible owner holdings.
Callers retain pre-operation state and result traces for replay and should not
apply the same event twice. This package does not persist data or edit snapshots.

Run from the repository root:

```sh
corepack pnpm exec vitest run packages/lots/test
corepack pnpm --filter @octc/lots typecheck
```

Source-relative imports follow the valuation package convention and add no
external dependencies or lockfile changes.
