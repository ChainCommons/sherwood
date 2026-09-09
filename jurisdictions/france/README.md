# France (france)

**Maturity: LEVEL 2 — sources indexed and explained, no rules modelled.**
**Review status: `COMMUNITY_DRAFT`.** No qualified French reviewer is recorded.
The UI MUST say expert review is absent. Recruiting one is P0-L-01.

Nothing in this directory is tax advice.

## What is here

- [`RESEARCH.md`](RESEARCH.md) — the research log: how the sources were
  gathered, what the hashes cover, what each one establishes, the Time Machine
  anchors, and an explicit list of gaps. **Read this first.**
- [`sources/`](sources/README.md) — 32 indexed official documents: statute,
  décret, Conseil d'État, BOFiP doctrine, forms and FAQ. Metadata, links,
  dates, short permitted extracts and content hashes — not a mirror.
- [`explanations/`](explanations/README.md) — seven human-readable pages, all
  `COMMUNITY_DRAFT`: NFT primary sale, secondary sale and royalties, collector
  disposal, baking and staking, crypto compensation, and VAT on digital art.
  Each one carries a *what was published, by year* table, so a gap in the
  guidance is visible as a gap rather than as silence.
- EU dependencies live in [`../eu/sources/`](../eu/sources/README.md).

## What is deliberately not here

- **No rules.** Machine-readable rules are P0-3-03, and only where citable.
- **No NFT answer for 2021–2023.** France published no NFT-specific VAT
  guidance until 2024-02-14 and no NFT income-tax provision until CGI art.
  150 VH ter (2026). For earlier years the correct answer is `UNSETTLED`, and
  later guidance must not be back-projected. RESEARCH.md §4.4, and the year
  tables in [`explanations/`](explanations/README.md).
- **No FIFO.** The art. 150 VH bis computation is portfolio-wide, not a lot
  method. RESEARCH.md §4.1.
- **No silent artist-author classification.** Whether an on-chain royalty is a
  droit d'auteur under CGI art. 93, 1 quater is unresolved on every source
  indexed here; the pack asks for facts and emits `REVIEW_REQUIRED`.
  RESEARCH.md §4.5.

Every tax domain is listed as unsupported in
[`jurisdiction.yaml`](jurisdiction.yaml) until a sourced rule exists, so the UI
reports "not modelled" rather than implying that silence means no tax applies.
An explanation is a reading of the sources for a human, not an executable rule,
and it does not move a domain into `supported_tax_domains`.

Adding content means following `CONTRIBUTING.md`: every rule needs a source, a
publication date, an effective period, a certainty level and test cases.
