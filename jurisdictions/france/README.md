# France (france)

**Maturity: LEVEL 3 — sources indexed, explained, and a narrow set modelled.**
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
- [`rules/`](rules/README.md) — thirteen machine-readable rules, all
  `COMMUNITY_DRAFT`, every one citing an indexed source. Five of them are
  `UNSETTLED`: they record what France had not decided, which is what stops the
  engine reaching for something else.
- [`interpretations/`](interpretations/) — the two competing readings of
  whether an NFT was inside art. 150 VH bis before 2026. Neither is endorsed
  (plan 05 §100).
- [`reporting/`](reporting/) — the foreign digital-asset account declaration.
  Reporting is a separate type from taxation: `REPORTABLE` is not `TAXABLE`.
- [`tests/`](tests/README.md) — 52 cases against the plan 16 §86 matrix. They
  do not run in CI yet; the runner belongs to the QA lane and is carried in
  [`docs/rfc/P0-3-03.md`](../../docs/rfc/P0-3-03.md).
- EU dependencies live in [`../eu/sources/`](../eu/sources/README.md).

## What is deliberately not here

- **No answer where no source exists.** Five rules say `UNSETTLED` and the
  engine returns `REVIEW_REQUIRED` or `UNRESOLVED` for them.
  [`rules/README.md`](rules/README.md) lists what is deliberately not modelled
  and why — rates, the barème option, marketplace fees, disposals after the
  2026 recast, and the portfolio formula itself.
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

Four domains are now listed as supported in
[`jurisdiction.yaml`](jurisdiction.yaml) — capital gains, tax lot accounting,
VAT and foreign asset reporting — because a sourced rule decides something in
each. Everything else stays unsupported, so the UI reports "not modelled"
rather than implying that silence means no tax applies. Supported does not mean
answered, and an explanation is a reading of the sources for a human, not an
executable rule: it does not move a domain on its own.

Adding content means following `CONTRIBUTING.md`: every rule needs a source, a
publication date, an effective period, a certainty level and test cases.
