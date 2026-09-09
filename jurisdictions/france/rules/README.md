# France — machine-readable rules

**TODO:** P0-3-03 · **Maturity: LEVEL 3 — machine-readable rules.**
**Review status: `COMMUNITY_DRAFT`** on every record. No qualified French
reviewer is recorded (P0-L-01), and the UI MUST say expert review is absent.

Nothing here is tax advice. Thirteen rules, two competing interpretations and
one reporting rule. Every one of them cites a source indexed in
[`../sources/`](../sources/README.md) or [`../../eu/sources/`](../../eu/sources/README.md),
and none is labelled `SOURCE_VERIFIED` or `EXPERT_REVIEWED`.

## What is modelled

| Rule | Domain | Period | Certainty |
| --- | --- | --- | --- |
| [`self-transfer-not-a-disposal-2019`](self-transfer-not-a-disposal-2019.yaml) | capital gains | 2019-01-01 → 2026-06-27 | `AUTHORITATIVE_INTERPRETIVE` |
| [`self-transfer-not-a-disposal-2026`](self-transfer-not-a-disposal-2026.yaml) | capital gains | from 2026-06-28 | `AUTHORITATIVE_INTERPRETIVE` |
| [`exchange-without-soulte-outside-charge`](exchange-without-soulte-outside-charge.yaml) | capital gains | 2019-01-01 → 2026-06-27 | `AUTHORITATIVE_CLEAR` |
| [`individual-occasional-disposal-in-charge`](individual-occasional-disposal-in-charge.yaml) | capital gains | 2019-01-01 → 2026-06-27 | `AUTHORITATIVE_CLEAR` |
| [`individual-occasional-disposal-below-floor`](individual-occasional-disposal-below-floor.yaml) | capital gains | 2019-01-01 → 2026-06-27 | `AUTHORITATIVE_CLEAR` |
| [`individual-disposal-basis-is-portfolio-wide`](individual-disposal-basis-is-portfolio-wide.yaml) | tax lot accounting | 2019-01-01 → 2026-06-27 | `AUTHORITATIVE_INTERPRETIVE` |
| [`nft-disposal-perimeter-unsettled-2019-2025`](nft-disposal-perimeter-unsettled-2019-2025.yaml) | capital gains | 2019-01-01 → 2025-12-31 | `UNSETTLED` |
| [`nft-disposal-regime-of-underlying-from-2026`](nft-disposal-regime-of-underlying-from-2026.yaml) | capital gains | from 2026-01-01 | `AUTHORITATIVE_INTERPRETIVE` |
| [`nft-mint-not-a-disposal`](nft-mint-not-a-disposal.yaml) | capital gains | from 2019-01-01 | `AUTHORITATIVE_INTERPRETIVE` |
| [`nft-vat-unsettled-before-2024`](nft-vat-unsettled-before-2024.yaml) | VAT | 2019-01-01 → 2024-02-13 | `UNSETTLED` |
| [`nft-vat-look-through-to-underlying-2024`](nft-vat-look-through-to-underlying-2024.yaml) | VAT | from 2024-02-14 | `AUTHORITATIVE_INTERPRETIVE` |
| [`crypto-reward-receipt-not-automatically-income`](crypto-reward-receipt-not-automatically-income.yaml) | professional income | from 2019-01-01 | `UNSETTLED` |
| [`nft-royalty-characterisation-unsettled`](nft-royalty-characterisation-unsettled.yaml) | personal income tax | from 2019-01-01 | `UNSETTLED` |

Five of the thirteen are `UNSETTLED`. That is not a shortfall — those are the
questions France had not answered, and a rule that records the absence is what
stops the engine reaching for something else. The engine returns
`REVIEW_REQUIRED` for them, and `UNRESOLVED` where two readings are attached.

Alongside:

- [`../interpretations/`](../interpretations/) — the two competing readings of
  whether an NFT was inside art. 150 VH bis before 2026 (plan 05 §100,
  AC-011). Neither is endorsed and neither is attributed; recording them is how
  the pack avoids manufacturing a consensus.
- [`../reporting/`](../reporting/) — the foreign digital-asset account
  declaration (CGI art. 1649 bis C). Information reporting is a separate type
  from taxation: `REPORTABLE` is not `TAXABLE` (INV-018), so no rule here
  points at it as a tax-base rule.
- [`../tests/`](../tests/README.md) — 52 cases against the §86 matrix.

## What is deliberately not modelled

Plan 15 lists rules to *attempt* "if sources exist". Where they do not, nothing
ships, and the reason is recorded rather than approximated:

- **Gross vs fee vs royalty legs.** Plan 15 asks for a rule keeping them
  distinct. Nothing indexed says whether a marketplace fee is deductible from
  art. 150 VH bis proceeds, so there is no French rule to write. Keeping the
  legs distinct is an economics invariant the event engine owes, not a
  jurisdiction rule.
- **The portfolio formula itself.** `fr-150-vh-bis-portfolio-formula` is named
  by two rules and implemented by nothing. Expressing it needs the portfolio's
  global value at the moment of disposal, which the pack cannot yet describe. A
  consumer that cannot resolve the name MUST stop rather than fall back to a
  lot method.
- **Rates.** CGI art. 200 C sets 12,8 %, but the 17,2 % prélèvements sociaux
  rest on a code de la sécurité sociale source this pack has not indexed
  (RESEARCH.md §6), so no combined rate exists here to state.
- **The barème progressif option.** Available for disposals from 2023-01-01;
  the doctrine explaining it appeared 2024-04-23. Indexed, not modelled.
- **Disposals after the 2026-06-28 recast.** The disposal rules close on
  2026-06-27 because nobody has read the recast article for those points. A
  disposal on 2026-06-28 returns `UNKNOWN`, which is the pack admitting a gap
  rather than running an unverified rule past its evidence.
- **Penalties at CGI art. 1736.** RESEARCH.md §6 records that the paragraph
  numbering was not transcribed. No penalty rule may be built on that record
  without re-reading the article.
- **Anything before 2019-01-01.** The modelled window opens where the current
  digital-asset regime does. Art. 150 UA and `CE, 26 avril 2018, n° 417809` are
  indexed for the earlier period but not modelled.

## The fact vocabulary

DSL v0 compares a small fixed set of fields. Two of them carry the pack's
vocabulary, and a caller that supplies neither gets `UNKNOWN` — which is the
intended answer, not a failure.

`asset_category` — supplied on the event:

| Value | Meaning |
| --- | --- |
| `fungible_digital_asset` | Interchangeable digital asset: the art. 150 VH bis case. |
| `non_fungible_token` | Unique, non-interchangeable. MiCA treats issuance in a large series as an indicator of fungibility and says a unique identifier alone is not enough, so this is a **user-confirmed fact about a specific collection**, never an inference from a token standard. |

`jurisdiction_facts.*` — booleans the caller confirms, never the engine:

| Fact | Question it answers |
| --- | --- |
| `french_tax_resident` | Is the person fiscally domiciled in France within the meaning of CGI art. 4 B? |
| `same_beneficial_owner_confirmed` | Has the user confirmed both addresses are theirs? Not observable on-chain (INV-004/005). |
| `soulte_paid` | Was a cash balancing payment made on the exchange? |
| `annual_disposal_proceeds_over_305_eur` | Do the year's **total disposal proceeds** exceed 305 €? Annual and measured on proceeds, so a single event never settles it. |
| `consideration_received` | Was anything received for the mint? |

Capacity is a fact too, and comes from the participant rather than these
booleans. It is never inferred: a participant whose capacity is `UNKNOWN`
matches only the rules that deliberately carry no capacity filter — which is
the token-receipt rule, because that participant is the one who most needs to
be told the question is open.

## Adding a rule

The bar is `CONTRIBUTING.md` plus the pack's own: open the document at the
publisher, index it in [`../sources/`](../sources/) first, and cite it. If you
cannot cite it, the rule does not exist — write `UNSETTLED`, say what you
looked for, and add the case to [`../tests/`](../tests/README.md) that proves
the engine stays quiet. Nothing moves to `SOURCE_VERIFIED` while the pack has
no named qualified French reviewer.
