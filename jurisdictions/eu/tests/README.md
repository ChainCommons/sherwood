# EU — rule tests

**TODO:** P0-3-04 · plan 16 §86.

25 cases over the seven rules in [`../rules/`](../rules/README.md). Same format
as the France suites, and the same caveat:

> **These tests do not run in CI yet.** They are data. The runner belongs to the
> QA lane, and the engine cannot load a real pack until the YAML chomping bug in
> [`docs/rfc/P0-3-03.md`](../../../docs/rfc/P0-3-03.md) §1 is fixed. Every case
> below was executed against `evaluate()` while authoring, with the pack
> assembled through the `yaml` library: **25 pass.**

The format is documented once, in
[`../../france/tests/README.md`](../../france/tests/README.md). `input` maps
onto `EvaluateInput`, `expect` onto `EvaluationResult`.

## The suites

| File | Rules | Cases |
| --- | --- | --- |
| [`vat-scope.yaml`](vat-scope.yaml) | the taxable-person gate | 5 |
| [`vat-place-of-supply.yaml`](vat-place-of-supply.yaml) | arts. 44, 45 and 58 | 8 |
| [`vat-crypto-and-nft.yaml`](vat-crypto-and-nft.yaml) | *Hedqvist* and the NFT gap | 8 |
| [`crypto-reporting.yaml`](crypto-reporting.yaml) | DAC8 | 4 |

## §86 matrix coverage

Positive, negative and boundary-date cases exist for every rule. The remaining
slots are filled where the rule has the thing being tested:

- **missing fact** — six of the seven rules guard on a fact that no transaction
  record carries, and each has a case proving the rule stays silent without it.
  The seventh guards on `asset_category`, which the event supplies.
- **threshold boundary** — none. No rule in this pack has a number in it; the
  one threshold that matters at EU level, the small-business turnover limit, is
  in [`../unsupported.yaml`](../unsupported.yaml) precisely because it is not
  modelled.
- **historical / successor version** — none, and this is worth stating plainly.
  No rule here has a versioned counterpart, because nothing at EU level has
  changed *within the modelled window*. The changes that matter — arts. 44, 45
  and 58 reaching their current form — happened before 2019-01-01, which is why
  the window opens there and why the boundary cases sit on 2018-12-31.
  `eu-t-nft-2021-sees-no-later-eu-guidance` is the closest thing: it asserts an
  empty later-guidance list, so the day an EU NFT instrument is indexed, that
  case fails and someone has to look.
- **ambiguous** — `eu-vat-no-eu-authority-on-nft-supplies` is the only
  `UNSETTLED` rule and carries two cases returning `REVIEW_REQUIRED`.

## Two conventions worth knowing

**Isolation is done with the event type, not the capacity.** This pack is
small, so the place-of-supply rules simply do not list `CRYPTO_SALE` and the
NFT marker requires `asset_category: non_fungible_token`. A case using
`CRYPTO_SALE` on a fungible asset gets the scope or exemption answer alone; one
using `ART_PRIMARY_SALE` with no `asset_category` gets the location answer
alone. `eu-t-nft-place-of-supply-still-answered` deliberately breaks the
isolation, because that combination — location settled, characterisation not —
is what an NFT question honestly looks like.

**`UNKNOWN` with an empty `applicable_rule_ids` is the most common expectation
here, and it is an assertion, not an absence.** Eleven of the 25 cases expect
exactly that. In a dependency pack the failure that matters is not a missing
answer; it is an EU-level rule that fires on facts nobody supplied and hands a
national pack a country, an exemption or a scope finding that no instrument
supports.
