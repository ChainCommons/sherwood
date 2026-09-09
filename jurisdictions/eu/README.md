# European Union (eu)

**Maturity: LEVEL 3 — sources indexed, and a narrow set modelled.**
**Review status: `COMMUNITY_DRAFT`.** No EU-qualified reviewer is recorded. The
UI MUST say expert review is absent.

This pack exists to hold the EU instruments the **France** pack depends on, so
France can reference them instead of duplicating them (plan 15 §79). It is not
an EU tax pack and does not model any member state.

Nothing in this directory is tax advice.

## What is here

- [`RESEARCH.md`](RESEARCH.md) — what was indexed, what is modelled, and the
  gaps that stop more being modelled. **Read this first.**
- [`sources/`](sources/README.md) — five indexed instruments: MiCA, the VAT
  Directive, the 2022 VAT-rates amendment, DAC8, and CJEU *Hedqvist*.
  Metadata, links and dates — not a mirror.
- [`rules/`](rules/README.md) — seven machine-readable rules: the
  taxable-person scope gate, the three place-of-supply rules (arts. 44, 45,
  58), *Hedqvist*, the absence of any EU authority on NFTs, and that DAC8
  reporting changes no treatment.
- [`tests/`](tests/README.md) — 25 cases against the plan 16 §86 matrix. They
  do not run in CI yet; the runner belongs to the QA lane
  ([`docs/rfc/P0-3-03.md`](../../docs/rfc/P0-3-03.md)).
- [`unsupported.yaml`](unsupported.yaml) — every EU question a national pack
  might ask that this pack does *not* answer, with what would have to be
  indexed first.

## What this pack will not do

- **No rate, and no amount.** The rate is fixed by each Member State. Directive
  (EU) 2022/542 is indexed because it changed which supplies *may* be taxed at
  a reduced rate; the rate and the definition of a work of art stay national.
- **No direct taxation.** Income tax, capital gains and corporation tax are
  Member State competences. There is no EU rule to reference, so none is
  invented.
- **No NFT answer.** Nothing at EU level addresses non-fungible tokens.
  `eu-vat-no-eu-authority-on-nft-supplies` records that as a finding rather
  than leaving a silence for someone to fill with *Hedqvist*, which decided a
  different transaction.
- **No answer before 2019-01-01.** The place-of-supply articles took their
  current form from amending instruments not indexed here. RESEARCH.md §3.1.
- **No guessing at facts.** Six of the seven rules turn on something a
  transaction record cannot carry — whether the customer is a taxable person,
  whether the supply is electronically supplied — and stay silent without it.

Two domains are listed as supported in [`jurisdiction.yaml`](jurisdiction.yaml)
— VAT and crypto reporting — because a sourced rule decides something in each.
Everything else stays unsupported, so the UI reports "not modelled" rather than
implying that silence means no tax applies.

## Using this pack from a national pack

France cites these instruments by `source_id` today and does not restate them —
see [`../france/explanations/vat-and-digital-art.md`](../france/explanations/vat-and-digital-art.md).
A France *evaluation* cannot yet run the rules here: the engine loads one pack
at a time and filters rules by `jurisdiction_id`, so cross-pack composition is
an open engine gap written up in [`docs/rfc/P0-3-04.md`](../../docs/rfc/P0-3-04.md).
Do not work around it by copying these rules into a national pack.

Adding content means following `CONTRIBUTING.md`: every rule needs a source, a
publication date, an effective period, a certainty level and test cases.
