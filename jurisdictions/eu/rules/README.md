# EU — rules

**TODO:** P0-3-04 · plan 15 §79. All `COMMUNITY_DRAFT`. Not tax advice.

Seven rules. Every one cites an instrument indexed in
[`../sources/`](../sources/README.md), and every one is drawn to stop at the
edge of what that instrument decides. The pack answers *where* and *whether it
is in scope*; it never answers *how much*.

## The rules

| `rule_id` | Domain | Says | Certainty |
| --- | --- | --- | --- |
| [`eu-vat-outside-scope-without-taxable-person`](vat-outside-scope-without-taxable-person.yaml) | vat | A supply made otherwise than by a taxable person acting as such is outside VAT | `AUTHORITATIVE_CLEAR` |
| [`eu-vat-place-of-supply-services-b2b`](vat-place-of-supply-services-b2b.yaml) | vat | Services to a taxable person are supplied where the customer is established (art. 44) | `AUTHORITATIVE_CLEAR` |
| [`eu-vat-place-of-supply-services-b2c`](vat-place-of-supply-services-b2c.yaml) | vat | Services to a consumer are supplied where the supplier is established (art. 45) | `AUTHORITATIVE_CLEAR` |
| [`eu-vat-place-of-supply-electronic-services-b2c`](vat-place-of-supply-electronic-services-b2c.yaml) | vat | Electronically supplied services to a consumer follow the customer (art. 58) | `AUTHORITATIVE_CLEAR` |
| [`eu-vat-payment-token-currency-exchange-exempt`](vat-payment-token-currency-exchange-exempt.yaml) | vat | Exchanging a fungible payment token against a traditional currency is exempt (*Hedqvist*) | `AUTHORITATIVE_CLEAR` |
| [`eu-vat-no-eu-authority-on-nft-supplies`](vat-no-eu-authority-on-nft-supplies.yaml) | vat | Nothing at EU level addresses NFTs | `UNSETTLED` |
| [`eu-crypto-reporting-dac8-changes-no-treatment`](crypto-reporting-dac8-changes-no-treatment.yaml) | crypto_reporting | Being reported is not being taxed | `AUTHORITATIVE_CLEAR` |

`AUTHORITATIVE_CLEAR` here means the *cited article says this*. It does not
mean the taxpayer's position is clear — for most of these, the hard part is the
fact the rule takes as given, not the consequence it draws.

## Three shapes, on purpose

**Rules that only ever say no.** `eu-vat-outside-scope-without-taxable-person`
fires when it has been told the supplier was not acting as a taxable person and
in no other state. Knowing someone *is* a taxable person is not a finding about
their VAT position, and a rule that treated it as one would turn a missing fact
into a charge.

**Rules that partition.** Arts. 44, 45 and 58 must cover a supply exactly once.
The art. 45 rule therefore carries an explicit negative condition — the supply
must be known *not* to be electronically supplied — rather than relying on
ordering. `eu-t-b2c-electronic-service-customer-member-state` and
`eu-t-electronic-service-b2b-not-reached` pin both directions of that boundary.

**A rule that records an absence.** `eu-vat-no-eu-authority-on-nft-supplies`
exists so an NFT question returns `REVIEW_REQUIRED` with a reason, rather than
silence that reads as "no tax" or *Hedqvist* stretched to cover something the
Court never saw. It has no end date: it describes the sources as of
`last_source_verification` and must be re-checked, not assumed still true.

## The window opens at 2019-01-01

Every VAT rule here starts on 2019-01-01, matching the France pack. Nothing
happened to EU VAT on that date. It is where this pack has looked, and the
place-of-supply articles in particular reached their current form through
amending instruments that are **not indexed here** — so reaching back would
mean applying today's connecting factors to years that had different ones.
[`../RESEARCH.md`](../RESEARCH.md) §3.1.

The DAC8 rule starts on its own source's publication date instead, because what
it asserts is about the nature of the instrument rather than about a period.

## Facts these rules ask for

None of these can be recovered from a transaction, and none is guessed:

| Fact | Used by |
| --- | --- |
| `supplier_acts_as_taxable_person` | the scope rule, *Hedqvist* |
| `customer_is_taxable_person` | all three place-of-supply rules |
| `supply_is_of_services` | arts. 44 and 45 |
| `supply_is_electronically_supplied_service` | arts. 45 and 58 |
| `exchange_against_traditional_currency` | *Hedqvist* |
| `reported_by_crypto_asset_service_provider` | DAC8 |

When one is missing the rule stays silent and the engine answers `UNKNOWN`.
Four cases in [`../tests/`](../tests/README.md) are marked `missing_fact` and
hold that line directly; seven more are negatives, where the fact is present
and excludes the rule.

## Deliberately not modelled

Rates, the place-of-supply exceptions in arts. 46 et seq., what counts as an
electronically supplied service, customer-location presumptions, the
small-business threshold, registration and returns, token-for-token exchanges,
the taxable amount of an exchange service, staking rewards, the DAC8 timetable,
and all direct taxation. Each is listed with its reason and with what would
have to be indexed first in [`../unsupported.yaml`](../unsupported.yaml).

## Using these from a national pack

France cites the EU **sources** today; it cannot yet run the EU **rules**,
because the engine loads one pack at a time and filters by `jurisdiction_id`.
[`docs/rfc/P0-3-04.md`](../../../docs/rfc/P0-3-04.md) sets out the gap and a
reproduction. Nothing in this directory should be copied into a national pack
to work around it — duplication is the thing plan 15 §79 asks packs to avoid.
