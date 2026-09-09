# France — human explanations

**Maturity: LEVEL 2 — human-readable explanation.**
**Review status: `COMMUNITY_DRAFT`.** No qualified French reviewer is recorded;
recruiting one is [P0-L-01](../../../plans/23-implementation.md). The UI MUST
say expert review is absent.

**Nothing here is tax advice.** These pages explain what the indexed sources
say and, more often, what they do not say. They are written for a person
trying to understand their own position, not for a machine: no rule reads
them, and none of them is a substitute for the machine-readable rules that
arrive in [P0-3-03](../../../plans/23-implementation.md).

## The pages

| Page | Question it answers | Headline status |
| --- | --- | --- |
| [`nft-artist-primary-sale.md`](nft-artist-primary-sale.md) | I minted an artwork and sold it myself. What is it? | `UNSETTLED` before 2026 · `REVIEW_REQUIRED` on capacity |
| [`nft-secondary-sale.md`](nft-secondary-sale.md) | I sold an NFT I had bought, or one I made and kept. | `UNSETTLED` before 2026 |
| [`nft-royalties.md`](nft-royalties.md) | A resale paid me an on-chain royalty. | `UNSETTLED` · `REVIEW_REQUIRED` |
| [`collector-disposal.md`](collector-disposal.md) | I sold digital assets as a private individual. | Best sourced page in the pack |
| [`baking-and-staking-rewards.md`](baking-and-staking-rewards.md) | I baked, staked or delegated and received tez. | `UNSETTLED` — no source names baking |
| [`crypto-compensation.md`](crypto-compensation.md) | I was paid in crypto for work. | `UNSETTLED` — no indexed source |
| [`vat-and-digital-art.md`](vat-and-digital-art.md) | Do I charge VAT? At what rate? | `UNSETTLED` before 2024-02-14 |

## How to read a page

Every page has the same five parts, in the same order.

1. **What we can say** — only what an indexed source actually states.
2. **What was published, by year** — a dated table. This is the point of the
   pack. A row that says *nothing* means France had published nothing on the
   question in that year, and an answer offered for that year would be
   invented. See [`../RESEARCH.md`](../RESEARCH.md) §5.
3. **What is unsettled** — named, not smoothed over. Where authorities
   compete, both are stated; plan 05 §100 forbids manufacturing a consensus.
4. **Facts the pack needs from you** — the questions the situation explorer
   must ask before anything can be said. Capacity is a fact, never an
   inference (INV-004/005).
5. **Sources** — every `source_id` this page relies on, linked to its record.

## The vocabulary

The status words are the certainty levels in
[`schemas/common.schema.json`](../../../schemas/common.schema.json), used here
with exactly their schema meaning. They describe **legal** certainty, never
model confidence.

| Word | Means |
| --- | --- |
| `AUTHORITATIVE_CLEAR` | A binding source answers the question directly. |
| `AUTHORITATIVE_INTERPRETIVE` | A binding source answers it by construction. |
| `AMBIGUOUS` | The source can be read more than one way. |
| `CONFLICTING_AUTHORITIES` | Two sources point in different directions. |
| `UNSETTLED` | **No source answers it.** The commonest word in this pack. |
| `UNKNOWN` | We have not looked, or we do not know what we hold. |

`REVIEW_REQUIRED` is not a certainty level; it is what the engine emits when
the answer turns on a fact about you that only a human can settle.

## Three dates that shape everything here

| Date | What changed |
| --- | --- |
| **2019-01-01** | CGI art. 150 VH bis begins to govern individual disposals of digital assets. BOFiP explains it only from **2019-09-02**. |
| **2024-02-14** | `BOI-RES-TVA-000140`, the first French administrative guidance specific to NFTs, and it is about VAT only. |
| **2026-01-01** | CGI art. 150 VH ter begins to govern disposals of unique, non-fungible crypto-assets. It was enacted **2026-06-25**, six months into the period it governs. |

Between them sit the gaps. For income tax, an NFT disposed of in 2021, 2022,
2023, 2024 or 2025 has **no** NFT-specific French provision — only the general
digital-asset regime, whose text is silent on fungibility. The pack says
`UNSETTLED` for those years and must not back-project the 2024 rescrit or the
2026 article onto them.

## What these pages are not

- **Not rules.** No engine consumes them. Machine-readable rules are
  [P0-3-03](../../../plans/23-implementation.md) and ship only where citable.
- **Not reviewed.** `COMMUNITY_DRAFT` is an honest ship state, not a badge.
- **Not a mirror.** Extracts stay short and stay in French; the reasoning
  around them is in English (plan 18: legal extracts are not translated in
  place).
- **Not complete.** [`../RESEARCH.md`](../RESEARCH.md) §6 lists what is not
  indexed yet. A question that depends on an unindexed source gets no answer
  here.

## The front matter

Each page opens with YAML front matter so the knowledge API
([P0-3-08](../../../plans/23-implementation.md)) and the UI can index these
without parsing prose: `explanation_id`, `jurisdiction`, `tax_domains`,
`capacities`, `certainty`, `engine_outcome`, `review.status`, `maturity_level`,
`sources[]` and `eu_sources[]`.

The vocabularies are the ones in
[`schemas/common.schema.json`](../../../schemas/common.schema.json) —
`taxDomain`, `capacityEnum`, `certainty.level`, `reviewStatus` — used with
their schema meaning. There is no `explanation` schema yet, so **`pnpm
validate` does not check these fields**: it validates YAML and JSON, and these
pages are Markdown. Two things follow. Every `source_id` in the front matter is
also linked to its record in the page's Sources table, where the link checker
does catch a typo; and defining the schema, so the front matter is validated
like everything else, belongs with P0-3-08.

## Adding a page

Same bar as a source record. Open the document at the publisher, record its
publication date, and if you cannot cite it, write `UNSETTLED` and say what you
looked for. A page that reads well and cites nothing is worse than no page.
