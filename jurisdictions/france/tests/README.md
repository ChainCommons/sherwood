# France — rule tests

**TODO:** P0-3-03 · plan 16 §86.

Each file here is a suite of cases for the rules in [`../rules/`](../rules/).
A case is an `evaluate()` input and the result it must produce. Nothing here is
a source, a rule or an answer: these files exist so that a change to the rules
that quietly widens what France says about a year is caught by a test rather
than by a taxpayer.

> **These tests do not run in CI yet.** They are data, and the runner that
> executes them belongs to the QA lane (`tests/` and `vitest.config.ts` are not
> this lane's to edit — plan agents `lane-qa.md` says France provides the data).
> [`docs/rfc/P0-3-03.md`](../../../docs/rfc/P0-3-03.md) carries the runner ready
> to adopt, and the two engine bugs that stop it passing today. Every case below
> was executed against `evaluate()` while authoring: **52 pass.**

## The shape of a case

```yaml
- test_id: fr-t-swap-without-soulte-2021   # unique across the pack
  matrix: [positive]                       # which §86 slots this case fills
  covers:                                  # the rules it constrains
    - fr-exchange-without-soulte-outside-charge
  why: >-
    Prose. What a reader should understand from this case passing, and what
    would be wrong about the world if it failed.
  input:
    event: { event_type: CRYPTO_SWAP, asset_category: fungible_digital_asset }
    participant: { capacity: COLLECTOR }
    jurisdiction_facts: { french_tax_resident: true, soulte_paid: false }
    as_of: { transaction_date: '2021-06-15', analysis_date: '2026-09-09' }
  expect:
    status: APPLICABLE
    applicable_rule_ids: [fr-exchange-without-soulte-outside-charge]
```

`input` maps onto `EvaluateInput`; `expect` onto `EvaluationResult`.

| `expect` key | Checked how |
| --- | --- |
| `status` | Required. `APPLICABLE`, `UNKNOWN`, `REVIEW_REQUIRED` or `UNRESOLVED`. |
| `applicable_rule_ids` | Required. Exact set, order-independent. |
| `later_guidance_rule_ids` | Exact set; defaults to empty, so a rule leaking into later guidance fails a case that did not mention it. |
| `not_applicable_rule_ids` | None of these may be applicable. Use it to pin a rule *out*. |
| `certainty_level` | Optional; the result's overall certainty. |
| `effects` | Optional, keyed by rule id: the effect fields that rule must carry. |
| `interpretations` | Optional, keyed by rule id: exact set of attached interpretation ids. |
| `published_after_transaction` | Optional, keyed by rule id: the AC-002 flag. |
| `contemporaneous_source_count` | Optional, keyed by rule id: how many cited sources were published by the transaction date. |
| `gaps_include` | Optional: substrings the `gaps` list must contain. |

The runner also asserts AC-001 on every case for free: any rule that comes back
applicable or as later guidance must carry at least one *resolved* source.

## The suites

| File | Rules | Cases |
| --- | --- | --- |
| [`self-transfer.yaml`](self-transfer.yaml) | the 2019/2026 self-transfer pair | 8 |
| [`exchange-without-soulte.yaml`](exchange-without-soulte.yaml) | crypto-to-crypto without a balancing payment | 5 |
| [`individual-disposal.yaml`](individual-disposal.yaml) | the charge, the 305 € floor, the portfolio basis | 11 |
| [`nft-disposal.yaml`](nft-disposal.yaml) | the 2019–2025 income-tax gap and its 2026 successor | 8 |
| [`nft-mint-and-vat.yaml`](nft-mint-and-vat.yaml) | minting, and the NFT VAT pair | 10 |
| [`rewards-and-royalties.yaml`](rewards-and-royalties.yaml) | token receipts and on-chain royalties | 10 |

## §86 matrix coverage

Plan 16 §86 asks each deterministic rule for a positive case, a negative case,
a boundary date, a threshold boundary, a missing-fact case, a historical
version and a successor version. All thirteen rules carry positive, negative
and boundary-date cases. The rest are filled where the rule has the thing being
tested:

- **threshold boundary** — only the 305 € floor has a threshold. The three
  disposal rules carry it; the other ten have no number to sit either side of.
- **historical / successor version** — only three rules have a versioned
  counterpart: the self-transfer pair, the NFT income-tax pair (the 2019–2025
  gap and art. 150 VH ter), and the NFT VAT pair (the gap and the 2024
  rescrit). Those six carry both slots.
- **missing fact** — every rule with a `jurisdiction_facts` guard carries one.
  The rules that guard on nothing but the event cannot fail this way.
- **ambiguous** — §86 also asks that ambiguous rules be tested for `UNKNOWN` or
  `REVIEW_REQUIRED`. The five `UNSETTLED` rules each have such a case.

## Two conventions worth knowing before adding a case

**Isolating a rule is done with capacity.** The NFT VAT rules list
`MARKETPLACE_OPERATOR` and the income-tax rules do not; the income-tax rules
list `PRIVATE_INVESTOR` and the VAT rules do not. Picking one of those two
capacities gives a result containing one domain's answer and nothing else,
which makes a failure readable. Where the realistic actor is an artist, the
case uses `ARTIST` and expects both answers — that is the honest result, and
the pack should be tested as it will be used.

**`UNKNOWN` with an empty `applicable_rule_ids` is a real expectation, not an
absent one.** Most of the negative and missing-fact cases assert exactly that,
because the failure this pack most needs to prevent is a rule that answers a
question France had not answered.

## No schema

These files declare no `$schema`, so `pnpm validate` parses them and moves on.
There is no rule-test schema in `schemas/`, and `schemas/` is not this lane's
to write; defining one is requested in
[`docs/rfc/P0-3-03.md`](../../../docs/rfc/P0-3-03.md). Until then the format
above is the contract, and the runner in that RFC is what enforces it.
