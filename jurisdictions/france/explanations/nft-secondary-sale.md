---
explanation_id: fr-exp-nft-secondary-sale
jurisdiction: france
title: Selling an NFT on the secondary market
todo: P0-3-02
tax_domains: [capital_gains, personal_income_tax, professional_business_income, vat]
capacities: [COLLECTOR, PRIVATE_INVESTOR, ARTIST, ACTIVE_TRADER]
certainty: UNSETTLED
engine_outcome: REVIEW_REQUIRED
review:
  status: COMMUNITY_DRAFT
maturity_level: 2
sources:
  - fr-cgi-150-vh-bis-2019
  - fr-cgi-150-vh-bis-2026
  - fr-cgi-150-vh-ter
  - fr-cgi-150-ua
  - fr-cgi-150-vi
  - fr-cgi-annexe3-98-a
  - fr-cgi-92
  - fr-ce-2018-04-26-417809
  - fr-bofip-rppm-pvbmc-30-10-2019
  - fr-bofip-rppm-pvbmc-30-20-2019
  - fr-bofip-res-tva-000140-2024
  - fr-bofip-bic-champ-60-50-2019
  - fr-bofip-bic-champ-60-50-2023
eu_sources:
  - eu-reg-2023-1114-mica
last_source_verification: '2026-09-08'
---

# Selling an NFT on the secondary market

**`COMMUNITY_DRAFT` — not tax advice.** You bought an NFT and sold it, or you
made one, kept it, and sold it later. Either way the first question is which
regime applies at all, and for disposals before 2026 France had not answered
it.

## What we can say

**Before 2026 there is no NFT-specific charging provision.** The candidate
regimes were written for other things:

- **CGI art. 150 VH bis** taxes occasional disposals of « actifs numériques »
  by individuals from 2019-01-01. The 2019 text takes its perimeter from CMF
  art. L. 54-10-1 and is **silent on fungibility**. It neither includes nor
  excludes a unique token, and no indexed doctrine resolves the silence.
- **CGI art. 150 UA** taxes gains on movable property. It is the regime the
  Conseil d'État applied to occasional bitcoin disposals before art. 150 VH bis
  existed (`CE, 26 avril 2018, n° 417809`, holding bitcoin units to be biens
  meubles incorporels), and it is where art. 150 VH ter routes some
  non-fungible assets from 2026.
- **BIC or BNC** where the activity is habitual rather than occasional — BIC
  through 2022, BNC under art. 92, 2° from 2023-01-01.

The honest position is that a French individual selling an NFT in 2021 through
2025 faced a genuine `UNSETTLED` question and had to take a position. The pack
records that, and records the competing readings, rather than picking one:
plan 05 §100 forbids manufacturing a consensus.

**From 2026-01-01, CGI art. 150 VH ter answers it.** A unique, non-fungible
crypto-asset is taxed under the regime of the good or right it represents,
routing to CGI art. 150 VI where that good is a listed object of art or
collection. In parallel, art. 150 VH bis was recast on 2026-06-28 to key off
the MiCA perimeter, and MiCA art. 2(3) excludes unique, non-fungible
crypto-assets — so the two articles now divide the field between them.

**Sales through a platform.** If the marketplace is established outside France,
CGI art. 1649 bis C may require you to declare the account on form
3916/3916-bis; see [`collector-disposal.md`](collector-disposal.md).

**If you also receive a royalty on the resale of your own work**, that is a
separate receipt with a separate answer:
[`nft-royalties.md`](nft-royalties.md).

## What was published, by year

| Year of disposal | Income tax | VAT |
| --- | --- | --- |
| 2021 | `UNSETTLED`. art. 150 VH bis (2019 text) is silent on fungibility; art. 150 UA and the BIC route are the visible alternatives | **nothing** |
| 2022 | `UNSETTLED` | **nothing** |
| 2023 | `UNSETTLED`; the habitual-activity route moves from BIC to BNC art. 92, 2° | **nothing** |
| 2024 | `UNSETTLED` | `BOI-RES-TVA-000140` from **2024-02-14** |
| 2025 | `UNSETTLED` | rescrit available |
| from 2026 | **CGI art. 150 VH ter** — regime of the underlying good or right | rescrit available |

The five `UNSETTLED` rows are not placeholders waiting for research. They are
the result: no French source published before 2026-06-25 answers the
income-tax characterisation of an NFT disposal.

## What is unsettled

**Is your token non-fungible?** Same question as on the primary-sale page, and
the same answer: MiCA's recitals treat issuance in a large series or collection
as an *indicator* of fungibility and say a unique identifier alone is not
enough. It is a facts question about the specific collection. `AMBIGUOUS`.

**If art. 150 VH bis applies, does the portfolio computation?** The formula in
`BOI-RPPM-PVBMC-30-20` scales the total acquisition price of the whole
portfolio by the disposal price over the portfolio's global value. Applying it
to a portfolio containing unique items raises a valuation question the doctrine
does not address, because it was not written with unique items in mind.
`UNSETTLED` — and a reason not to force NFTs into that article by default.

**If art. 150 UA applies, what follows.** That article carries its own
computation and its own conditions, and this pack has captured it only as
metadata — the record exists because the Conseil d'État used the article and
because art. 150 VH ter can route back to it, not because we have modelled it.
The pack will not present one regime's arithmetic under the other's name.
`UNKNOWN` until art. 150 UA is read properly.

**From 2026, whether a digital-only work is an object of art.** Art. 150 VH ter
routes to art. 150 VI for listed objects of art or collection, and the list at
CGI ann. III art. 98 A enumerates **physical** media. Whether a digital-only
NFT reaches it is exactly the open question in
[`../RESEARCH.md`](../RESEARCH.md) §4.6. `UNSETTLED`.

**Whether repeated selling makes you habitual.** Volume, frequency and tooling
matter; where the line sits is `AMBIGUOUS` and period-sensitive (BIC through
2022, BNC from 2023).

## Facts the pack needs from you

- Date of disposal — which row of the table you are in.
- Whether you created the token or acquired it.
- Edition size and whether the token is part of a series or collection.
- What the token represents: a licence, a physical object, a right of access,
  or nothing beyond itself.
- What you paid, in what asset, and what you received, in what asset. A swap
  paid in another token is not the same event as a euro sale — see the soulte
  point in [`collector-disposal.md`](collector-disposal.md).
- How many disposals you made in the year, and whether this is your occupation.
- Where the marketplace is established.

## Sources

| `source_id` | What it gives this page |
| --- | --- |
| [`fr-cgi-150-vh-bis-2019`](../sources/cgi-150-vh-bis-2019.yaml) | The « actifs numériques » text, silent on fungibility |
| [`fr-cgi-150-vh-bis-2026`](../sources/cgi-150-vh-bis-2026.yaml) | The MiCA-perimeter recast from 2026-06-28 |
| [`fr-cgi-150-vh-ter`](../sources/cgi-150-vh-ter.yaml) | The 2026 provision and its routing |
| [`fr-cgi-150-ua`](../sources/cgi-150-ua.yaml) | Gains on movable property |
| [`fr-cgi-150-vi`](../sources/cgi-150-vi.yaml) | Where art. 150 VH ter routes objects of art |
| [`fr-cgi-annexe3-98-a`](../sources/cgi-annexe3-98-a.yaml) | The closed physical-media list |
| [`fr-cgi-92`](../sources/cgi-92.yaml) | BNC from 2023 |
| [`fr-ce-2018-04-26-417809`](../sources/ce-2018-04-26-417809.yaml) | Pre-2019 characterisation |
| [`fr-bofip-rppm-pvbmc-30-10-2019`](../sources/bofip-rppm-pvbmc-30-10-2019.yaml) | Scope of art. 150 VH bis |
| [`fr-bofip-rppm-pvbmc-30-20-2019`](../sources/bofip-rppm-pvbmc-30-20-2019.yaml) | The portfolio computation |
| [`fr-bofip-bic-champ-60-50-2019`](../sources/bofip-bic-champ-60-50-2019.yaml) | Habitual activity as BIC, 2021-available |
| [`fr-bofip-bic-champ-60-50-2023`](../sources/bofip-bic-champ-60-50-2023.yaml) | The post-LF 2022 boundary |
| [`fr-bofip-res-tva-000140-2024`](../sources/bofip-res-tva-000140-2024.yaml) | VAT look-through, from 2024-02-14 |
| [`eu-reg-2023-1114-mica`](../../eu/sources/reg-2023-1114-mica.yaml) | art. 2(3) and the fungibility indicators |
