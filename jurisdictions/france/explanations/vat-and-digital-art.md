---
explanation_id: fr-exp-vat-and-digital-art
jurisdiction: france
title: VAT on NFTs and digital art
todo: P0-3-02
tax_domains: [vat]
capacities: [ARTIST, CREATOR, TOKEN_ISSUER, MARKETPLACE_OPERATOR, BUSINESS_OWNER]
certainty: UNSETTLED
engine_outcome: REVIEW_REQUIRED
review:
  status: COMMUNITY_DRAFT
maturity_level: 2
sources:
  - fr-bofip-res-tva-000140-2024
  - fr-cgi-annexe3-98-a
eu_sources:
  - eu-dir-2006-112-vat
  - eu-dir-2022-542-vat-rates
  - eu-cjeu-c-264-14-hedqvist
  - eu-reg-2023-1114-mica
last_source_verification: '2026-09-08'
---

# VAT on NFTs and digital art

**`COMMUNITY_DRAFT` — not tax advice.** This page holds the sharpest dated
boundary in the France pack: **2024-02-14**. Before it, France had published no
NFT-specific VAT guidance at all. After it, there is a rescrit — and it is a
method, not an answer.

Plan 15 §79 says national packs should *reference* shared EU rules rather than
duplicate them. This page cites the EU records by `source_id` and does not
restate the directives. The EU VAT / place-of-supply skeleton itself is
[P0-3-04](../../../plans/23-implementation.md).

## What we can say

**`BOI-RES-TVA-000140`, published 2024-02-14, is the first and only French
administrative guidance specific to NFTs.** It states that non-fungible tokens
have no specific VAT regime — « Les JNF ne font l'objet d'aucun dispositif
spécifique en matière de TVA » — that the analysis **looks through** the token
to the underlying good or service, and that a JNF is not a payment, utility or
investment token, so NFT operations sit **outside** the financial exemption of
CGI art. 261 C.

Look-through is a method. It tells you to identify what is actually being
supplied — a digital artwork, a licence, access to something, a physical object
— and apply the ordinary VAT analysis to that. It does not tell you what your
particular token supplies. Two collections with identical contract code can
land in different places.

**The 5,5 % reduced rate cannot be asserted for a digital-only NFT.** The
reduced rate on works of art was generalised to all supplies from 2025-01-01 by
the loi de finances pour 2024 (art. 83), transposing Council Directive (EU)
2022/542. But « œuvre d'art » is defined by the **closed list** at CGI ann. III
art. 98 A, which enumerates physical media: hand-executed paintings, limited-run
engravings, sculptures, photographs signed and numbered within 30 copies.
Nothing in it addresses a purely digital work. On the sources indexed here the
reduced rate therefore **must not** be applied to a digital-only NFT.
`UNSETTLED`, and the tempting answer is the wrong one.

**Hedqvist does not help you.** CJEU C-264/14 (2015-10-22) holds that
exchanging a fungible payment token for currency and back is VAT-exempt. It
says nothing about NFTs, mints or royalties, and the 2024 French rescrit
expressly places NFT operations outside the financial-operations exemption. The
case must not be stretched across that line.

**MiCA is not a VAT instrument.** It is cited in this pack only because French
income-tax law borrows its perimeter from 2026-06-28. No VAT consequence
follows from it.

**DAC8 changes reporting, not treatment.** Directive (EU) 2023/2226 governs
what service providers report about a taxpayer. It does not change how anyone
is taxed and must not be modelled as if it did.

## What was published, by year

| Year of supply | French NFT VAT guidance | What existed |
| --- | --- | --- |
| 2021 | **none** | Directive 2006/112/EC and the ordinary French VAT rules, addressed to neither NFTs nor digital art specifically. `UNSETTLED` |
| 2022 | **none** | as above; Directive (EU) 2022/542 adopted 2022-04-06 but not yet transposed |
| 2023 | **none** | as above. `UNSETTLED` |
| 2024 | **`BOI-RES-TVA-000140` from 2024-02-14** — look-through; outside CGI art. 261 C | the rescrit, from that date and not before |
| 2025 | rescrit available | reduced rate on works of art generalised from 2025-01-01 — but the closed list at CGI ann. III art. 98 A is unchanged |
| from 2026 | rescrit available | no further NFT VAT guidance indexed |

The 2021–2023 rows are the ones that matter. A French artist asking "did I owe
VAT on that 2021 mint" is asking a question their administration had not
addressed, and the pack says so. Back-projecting the 2024 rescrit onto those
years would produce a confident answer nobody could have acted on at the time.

## What is unsettled

- **What the token supplies.** Look-through requires identifying the underlying
  good or service, and no source classifies NFT archetypes for you. Artwork,
  licence, access pass, ticket, membership and physical-redemption token are
  different supplies. `AMBIGUOUS`, resolved by facts.
- **Whether a digital-only work is an « œuvre d'art ».** `UNSETTLED`, on the
  closed list at CGI ann. III art. 98 A. It bears on the rate here and on the
  art. 150 VI routing in [`nft-secondary-sale.md`](nft-secondary-sale.md).
- **Place of supply.** Where the customer is, whether they are a taxable
  person, and whether the supply is an electronically supplied service all
  change the answer. The pack indexes the VAT Directive as the frame and models
  none of it: the skeleton is P0-3-04. `UNKNOWN` here.
- **Whether the mint is a supply.** Nothing indexed here says a mint is a
  taxable transaction. Plan 15 lists "NFT mint is not automatically a
  supply/sale" among the rules to attempt, precisely because the default
  assumption would be wrong.
- **The marketplace's own position.** Who supplies to whom — creator to buyer,
  creator to platform, platform to buyer — is a commissionaire question the
  rescrit does not resolve for on-chain sales. `UNSETTLED`.
- **Royalties.** A resale royalty is not the original supply. See
  [`nft-royalties.md`](nft-royalties.md).
- **Registration and thresholds.** Not indexed in this pack.

## Facts the pack needs from you

- Date of supply — which row of the table you are in.
- What the buyer actually receives: file, licence, access, a physical object,
  or a promise.
- Whether the work exists in a physical form covered by CGI ann. III art. 98 A.
- Whether you act as a taxable person, and whether you are registered.
- Where your customers are, and whether they are businesses or consumers.
- Whether a platform stands between you and the buyer, and on what terms.
- Whether the token was minted before it was sold, and whether the mint itself
  was charged for.

## Sources

| `source_id` | What it gives this page |
| --- | --- |
| [`fr-bofip-res-tva-000140-2024`](../sources/bofip-res-tva-000140-2024.yaml) | The 2024-02-14 rescrit: look-through, and outside CGI art. 261 C |
| [`fr-cgi-annexe3-98-a`](../sources/cgi-annexe3-98-a.yaml) | The closed physical-media definition of « œuvre d'art » |
| [`eu-dir-2006-112-vat`](../../eu/sources/dir-2006-112-vat.yaml) | The frame for supply and place of supply |
| [`eu-dir-2022-542-vat-rates`](../../eu/sources/dir-2022-542-vat-rates.yaml) | Behind the 5,5 % generalisation from 2025-01-01 |
| [`eu-cjeu-c-264-14-hedqvist`](../../eu/sources/cjeu-c-264-14-hedqvist.yaml) | Fungible payment tokens only — not NFTs |
| [`eu-reg-2023-1114-mica`](../../eu/sources/reg-2023-1114-mica.yaml) | Recorded here only to state that no VAT consequence follows from it |

Not indexed and needed: CGI art. 261 C (named by the rescrit), CGI art.
278-0 bis and art. 297 A (rate and margin scheme for works of art), and the loi
n° 2023-1322 art. 83 as a French source.
