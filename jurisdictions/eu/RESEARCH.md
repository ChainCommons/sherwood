# EU — research log

**TODO:** P0-3-04 · plan 15 §79 · **as of 2026-09-08.**

This is a **dependency pack**, not an EU tax pack. It holds the supranational
instruments a national pack needs to reference, and the narrowest set of rules
those instruments actually support. Nothing here is tax advice, and nothing
here decides anything for a Member State.

Read [`unsupported.yaml`](unsupported.yaml) alongside this file. It is the
machine-readable half of the same statement: what is not modelled, and what
would have to be indexed before it could be.

## 1. What was indexed, and by whom

The five instruments in [`sources/`](sources/README.md) were indexed under
**P0-3-01** while researching France, because France needed them: MiCA for the
perimeter CGI art. 150 VH bis borrows from 2026-06-28, the VAT Directive as the
frame for the 2024 NFT rescrit, Directive (EU) 2022/542 behind the 2025 rate
change, DAC8 for reporting, and *Hedqvist* for fungible payment tokens.

**P0-3-04 added no sources.** It models rules against what was already indexed.
That is a deliberate limit, and §3 explains it.

## 2. What is modelled

Seven rules in [`rules/`](rules/README.md), all `COMMUNITY_DRAFT`, each citing
an indexed source. In outline:

| Question a national pack asks | Answered by |
| --- | --- |
| Is this within VAT at all? | `eu-vat-outside-scope-without-taxable-person` — only ever answers *no* |
| Where is a service supplied, B2B? | `eu-vat-place-of-supply-services-b2b` (art. 44) |
| Where is a service supplied, B2C? | `eu-vat-place-of-supply-services-b2c` (art. 45) |
| …and if it is electronically supplied? | `eu-vat-place-of-supply-electronic-services-b2c` (art. 58) |
| Is a token/currency exchange exempt? | `eu-vat-payment-token-currency-exchange-exempt` (*Hedqvist*) |
| What does the EU say about NFTs? | `eu-vat-no-eu-authority-on-nft-supplies` — nothing, and that is the finding |
| Does DAC8 change treatment? | `eu-crypto-reporting-dac8-changes-no-treatment` — no |

Six of the seven turn on facts a transaction record cannot supply — whether the
supplier acts as a taxable person, whether the customer is one, whether the
supply is electronically supplied, whether a traditional currency stood on the
other side. When a fact is absent the rule does not fire and the engine answers
`UNKNOWN`. That is the intended behaviour, and four cases in
[`tests/`](tests/README.md) are marked `missing_fact` to hold it: the pack asks
rather than assuming, because every one of these defaults is wrong for someone.

## 3. Gaps — read this before adding a rule

**3.1 No consolidated version is pinned, and it matters most here.** The
place-of-supply articles are the amended part of the VAT Directive. Art. 44 and
art. 45 took their current form from Council Directive 2008/8/EC, and art. 58
took its current form later still; before that, B2C electronic supplies inside
the EU were located with the supplier rather than the customer. **None of those
amending instruments is indexed in this pack.**

Two consequences, both deliberate:

- The modelled window opens at **2019-01-01**, following the France pack, and
  the rules say nothing about earlier years. `eu-t-place-of-supply-boundary-2018-12-31`
  is the test that keeps them from reaching back.
- `published_from` on the place-of-supply rules records the publication of
  Directive 2006/112/EC itself (2006-12-11), because that is the source cited.
  It **must not** be read as a claim about when the current wording appeared.

Pinning consolidated text per period is what
[`schemas/source/source-version.schema.json`](../../schemas/source/source-version.schema.json)
exists for, and no `versions/` directory has been written for this pack yet.

**3.2 Publication dates were not re-verified.** EUR-Lex was not reachable from
the authoring environment for P0-3-04, so no new source was indexed and no
existing `publication_date` was re-checked. The caution already recorded in
[`sources/README.md`](sources/README.md) — that the OJ dates for the 2022 and
2023 directives were taken from EUR-Lex search results and not read off the
documents — still stands and was **not** cleared by this task.

The rule this pack follows: if a date could not be verified, no rule turns on
it. That is why `eu-crypto-reporting-dac8-changes-no-treatment` asserts
something time-independent, and why the DAC8 reporting timetable is listed as
not modelled.

**3.3 The instruments most worth indexing next**, in the order a France
question tends to need them:

1. Council Implementing Regulation (EU) No 282/2011 — the definition of an
   electronically supplied service, and the customer-location presumptions.
   Without it the art. 58 rule is a conclusion waiting for a classification.
2. Council Directive 2008/8/EC — the amending instrument behind arts. 44/45,
   which would let the window open earlier than 2019 honestly.
3. Consolidated versions of Directive 2006/112/EC, pinned per period.
4. Directive 2006/112/EC arts. 46–59a, for the exceptions the general rules
   yield to.

**3.4 What is out of scope rather than missing.** Rates, direct taxation and
MiCA-as-tax are not gaps to be filled. See `unsupported.yaml`.

## 4. How a national pack should use this

Plan 15 §79: national packs SHOULD reference shared EU rules rather than
duplicate them. In practice, today, that means citing the EU `source_id`s —
which France already does, in `fr-nft-vat-look-through-to-underlying-2024` and
`fr-nft-vat-unsettled-before-2024`.

It does **not** yet mean a France evaluation can run the rules in this
directory. The engine loads one pack at a time, filters rules by
`jurisdiction_id`, and resolves a cited `source_id` only against the pack's own
`sources/` — so a France rule citing `eu-dir-2006-112-vat` today resolves one
of its two sources and reports no error. That is an engine gap, not a data gap,
and it is written up in [`docs/rfc/P0-3-04.md`](../../docs/rfc/P0-3-04.md) with
a reproduction. Until it is closed, this pack is referenced by humans and by
`source_id`, and its rules are exercised in its own tests.

## 5. Licence and redistribution

© European Union. Reuse authorised under Commission Decision 2011/833/EU with
acknowledgement of source. Redistribution posture in this repository:
`extract` — metadata, links and short permitted extracts, never a mirror. No
rule in this pack quotes a directive at length, and none should.

## 6. Review status

`COMMUNITY_DRAFT`, everywhere, with no exceptions and no path to anything else
in P0. No rule is `SOURCE_VERIFIED`; no EU-qualified reviewer is recorded. The
UI MUST say expert review is absent. The France pack's reviewer recruitment is
P0-L-01; this pack has no equivalent yet, and a France reviewer is not
automatically qualified to sign off EU VAT.
