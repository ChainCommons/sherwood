---
explanation_id: fr-exp-nft-royalties
jurisdiction: france
title: On-chain royalties on the resale of your work
todo: P0-3-02
tax_domains:
  [personal_income_tax, professional_business_income, artist_social_regime,
   social_security, vat]
capacities: [ARTIST, CREATOR]
certainty: UNSETTLED
engine_outcome: REVIEW_REQUIRED
review:
  status: COMMUNITY_DRAFT
maturity_level: 2
sources:
  - fr-cgi-93
  - fr-css-l382-1
  - fr-cgi-92
  - fr-cgi-150-vh-ter
  - fr-bofip-res-tva-000140-2024
  - fr-bofip-bnc-champ-10-10-20-40-2019
  - fr-bofip-bnc-champ-10-10-20-40-2023
last_source_verification: '2026-09-08'
---

# On-chain royalties on the resale of your work

**`COMMUNITY_DRAFT` — not tax advice.** Someone resold your NFT and the
contract paid you a percentage. French tax law has not been applied to this by
any source this pack holds. Everything below is about *why* that is the
position and what would have to be established to move off it.

## What we can say

**This is a receipt, and it is not the sale.** The resale is the reseller's
disposal ([`nft-secondary-sale.md`](nft-secondary-sale.md)). Your royalty is a
separate leg with a separate character, and the two must not be netted or
collapsed. A tool that models a marketplace payout as one gross amount and
attributes it all to the seller is producing a false picture of both parties.

**Three characterisations are visible in the sources, and none is confirmed.**

- **Droits d'auteur, CGI art. 93, 1 quater.** Authors' copyright income is
  taxed under the traitements et salaires rules **when it is fully declared by
  third parties**. That condition is doing real work: on the sources indexed
  here, no NFT marketplace is a « tiers déclarant » in the sense of the
  article. A smart contract that routes value to an address is not, on
  anything we hold, a third party declaring your income to the tax
  administration.
- **BNC under CGI art. 92** as income from a non-commercial occupation, the
  ordinary route for an author's income outside art. 93, 1 quater.
- **Not copyright income at all.** An on-chain royalty enforced by a smart
  contract may be a contractual resale share rather than the exploitation of a
  droit d'auteur — a term of the original sale, not a right in the work. This
  reading is available on the facts of most collections, where the buyer never
  received a copyright licence and the "royalty" is a marketplace convention
  the contract can waive.

The pack does not choose between them. Plan 15 is explicit: artist-author
versus BNC versus salary must not be picked silently. The engine asks for facts
and emits `REVIEW_REQUIRED`.

**The closest legal analogue is not a tax rule.** The droit de suite (code de
la propriété intellectuelle art. L. 122-8) gives an author a share of certain
resales. It is the nearest thing in French law to what an on-chain royalty
imitates, and it is **not indexed here** — it is on the gap list in
[`../RESEARCH.md`](../RESEARCH.md) §6. Nobody should assume its scope carries
over.

**Social contributions are a separate question with a separate answer.** CSS
art. L. 382-1 sets the artistes-auteurs scheme, contributions collected by
URSSAF since 2019-01-01, and affiliation follows the nature of the work and of
the income rather than the medium. Whether royalty receipts from NFT resales
fall inside it is answered by nothing indexed here. The income-tax category
does not settle it, and neither settles the other.

**VAT.** From 2024-02-14 `BOI-RES-TVA-000140` says the analysis looks through
the token to the underlying good or service. Applied to a royalty the
underlying is a service or a right rather than the token, which raises place of
supply — see [`vat-and-digital-art.md`](vat-and-digital-art.md). Before that
date, nothing.

## What was published, by year

| Year of receipt | Income tax | Social | VAT |
| --- | --- | --- | --- |
| 2021 | **nothing on on-chain royalties.** CGI art. 93 and art. 92 exist; neither has been applied to them | CSS art. L. 382-1 exists; not applied | **nothing** |
| 2022 | nothing | not applied | nothing |
| 2023 | nothing | not applied | nothing |
| 2024 | nothing | not applied | `BOI-RES-TVA-000140` from 2024-02-14, on the look-through principle only |
| 2025 | nothing | not applied | rescrit available |
| from 2026 | CGI art. 150 VH ter addresses **disposals** of unique non-fungible crypto-assets. It does not address a royalty receipt by the creator | not applied | rescrit available |

Every row of the income-tax column is empty for a reason. The absence has been
looked for, at the publishers, and recorded — it is not an untried search.

## What is unsettled

- **Whether the royalty is a droit d'auteur.** `UNSETTLED`, and the pivot for
  everything else on this page.
- **Whether any marketplace is a « tiers déclarant ».** `UNSETTLED`, and the
  express condition of art. 93, 1 quater. Without it the article does not
  engage even if the receipt *is* copyright income.
- **Whether the royalty is your professional income or an occasional one.**
  `AMBIGUOUS`, and it turns on your capacity and your activity, not on the
  amount.
- **Whether the artistes-auteurs scheme applies.** `UNSETTLED`.
- **When the receipt arises.** A royalty may accrue to a contract, be claimable
  but unclaimed, and be withdrawn much later. Nothing indexed here addresses
  the timing of an on-chain receipt, and the pack does not assume that
  accrual, claimability and withdrawal are the same date. `UNKNOWN`.
- **Royalties denominated in a token.** The receipt is not in euro. Valuation
  is the valuation package's job, not this pack's, and the pack does not assume
  a rate.

## Facts the pack needs from you

- Did you create the underlying work?
- Did the original sale grant or licence any copyright? What did the buyer
  actually receive?
- Is the royalty a term of a contract, a marketplace policy, or enforced by the
  token contract itself — and can it be waived?
- Does anyone declare this income to the French administration on your behalf?
- Your capacity at the date of receipt, confirmed: `ARTIST`, `CREATOR`, or
  otherwise; and whether creation is your occupation.
- Are you affiliated to the artistes-auteurs scheme?
- When did the value become yours — accrual, claim, or withdrawal?
- Where is the marketplace established, and where is the buyer?

## Sources

| `source_id` | What it gives this page |
| --- | --- |
| [`fr-cgi-93`](../sources/cgi-93.yaml) | Droits d'auteur, and the « tiers déclarant » condition in 1 quater |
| [`fr-cgi-92`](../sources/cgi-92.yaml) | BNC, the alternative route |
| [`fr-css-l382-1`](../sources/css-l382-1.yaml) | The artistes-auteurs social scheme |
| [`fr-cgi-150-vh-ter`](../sources/cgi-150-vh-ter.yaml) | Shown here to record that it addresses disposals, not royalty receipts |
| [`fr-bofip-res-tva-000140-2024`](../sources/bofip-res-tva-000140-2024.yaml) | The VAT look-through, from 2024-02-14 |
| [`fr-bofip-bnc-champ-10-10-20-40-2019`](../sources/bofip-bnc-champ-10-10-20-40-2019.yaml) | BNC scope, 2021-available text |
| [`fr-bofip-bnc-champ-10-10-20-40-2023`](../sources/bofip-bnc-champ-10-10-20-40-2023.yaml) | The post-LF 2022 revision |

Not indexed and needed: CPI art. L. 122-8 (droit de suite), URSSAF
artistes-auteurs guidance, CGI art. 100 bis.
