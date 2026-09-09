---
explanation_id: fr-exp-nft-artist-primary-sale
jurisdiction: france
title: Minting and selling your own NFT (primary sale)
todo: P0-3-02
tax_domains:
  [personal_income_tax, professional_business_income, capital_gains, vat,
   artist_social_regime, social_security]
capacities: [ARTIST, CREATOR, TOKEN_ISSUER]
certainty: UNSETTLED
engine_outcome: REVIEW_REQUIRED
review:
  status: COMMUNITY_DRAFT
maturity_level: 2
sources:
  - fr-cgi-150-vh-bis-2019
  - fr-cgi-150-vh-bis-2026
  - fr-cgi-150-vh-ter
  - fr-cgi-150-vi
  - fr-cgi-92
  - fr-cgi-93
  - fr-css-l382-1
  - fr-cgi-annexe3-98-a
  - fr-bofip-res-tva-000140-2024
  - fr-bofip-bic-champ-60-50-2019
  - fr-bofip-bnc-champ-10-10-20-40-2019
eu_sources:
  - eu-reg-2023-1114-mica
last_source_verification: '2026-09-08'
---

# Minting and selling your own NFT (primary sale)

**`COMMUNITY_DRAFT` — not tax advice.** This is the question the France pack
exists for, and the honest answer for most years is that France had not
addressed it. That is a finding, not a gap in our research; see
[`../RESEARCH.md`](../RESEARCH.md) §4.4.

## What we can say

You made a digital artwork, minted it, and sold the first edition yourself. In
French terms three separate questions arrive at once, and they have different
answers and different dates.

**Minting is not selling.** Nothing in the indexed sources treats the creation
of a token as a disposal, a supply or a receipt of income. A mint moves nothing
between people; it writes a record. The pack does not model a mint as a taxable
event, and — per plan 15 — an engine must not infer one. What is taxable, if
anything, is the sale that may follow.

**Which income category applies turns on your capacity, and capacity is a
fact.** No indexed source says where a digital artist's primary sale lands.
There is a reading — ours, not a source's — on which CGI art. 150 VH bis is not
the right article at all, because it addresses someone disposing of assets they
hold rather than someone selling what they produced. It is stated here as a
reading and nothing in the pack relies on it.
Candidates visible in the sources are BNC under CGI art. 92 (professional
non-commercial income), BIC where the activity is commercial in nature
(`BOI-BIC-CHAMP-60-50`), and — where the sale is genuinely the exploitation of
a copyright — the droits d'auteur route of CGI art. 93, 1 quater. **The pack
does not pick.** Plan 15 is explicit that artist-author versus BNC versus
salary must not be chosen silently; the engine asks and emits
`REVIEW_REQUIRED`.

**For VAT there is a dated answer, and it starts on 2024-02-14.** On that day
DGFiP published `BOI-RES-TVA-000140`, a rescrit stating that non-fungible
tokens have no specific VAT regime, that the analysis looks *through* the token
to the underlying good or service, and that a JNF is not a payment, utility or
investment token — so NFT operations sit outside the financial exemption of CGI
art. 261 C. Before that date France had published nothing NFT-specific on VAT.
Details are in [`vat-and-digital-art.md`](vat-and-digital-art.md).

**From 2026 there is an income-tax provision, and it is a routing rule.** CGI
art. 150 VH ter, created by the loi n° 2026-534 du 25 juin 2026 (art. 91) for
disposals from 2026-01-01, taxes a unique, non-fungible crypto-asset under the
regime of the good or right it represents, and routes to CGI art. 150 VI where
that good is a listed object of art or collection. It answers "which regime",
not "are you a professional" — the capacity question above survives it intact.

## What was published, by year

| Year of sale | Income tax | VAT | Social |
| --- | --- | --- | --- |
| 2021 | **nothing NFT-specific.** art. 150 VH bis speaks of « actifs numériques » and is silent on fungibility | **nothing** | CSS art. L. 382-1 exists; nothing applies it to digital art |
| 2022 | nothing NFT-specific | nothing | as above |
| 2023 | nothing NFT-specific | nothing | as above |
| 2024 | nothing NFT-specific | `BOI-RES-TVA-000140` from **2024-02-14**: look through to the underlying | as above |
| 2025 | nothing NFT-specific | rescrit available | as above |
| from 2026 | **CGI art. 150 VH ter** — regime of the underlying good or right; art. 150 VH bis recast to the MiCA perimeter on 2026-06-28 | rescrit available | as above |

Read the first three rows literally. For a 2021 primary sale the correct
machine answer on income tax is `UNSETTLED`, and the 2024 rescrit and the 2026
article **must not** be back-projected onto it. A Time Machine that produces a
2021 answer here is lying ([`../RESEARCH.md`](../RESEARCH.md) §5).

## What is unsettled

**Whether your token is "non-fungible" for these purposes.** MiCA does not
settle it. Its recitals treat issuance in a large series or collection as an
*indicator* of fungibility and say a unique identifier alone is not enough. A
1/1 artwork and a 5 000-piece generative drop are not obviously on the same
side of that line, and the answer is specific to the collection. The pack asks;
it does not classify. `AMBIGUOUS`.

**Whether a digital-only work is an "œuvre d'art".** CGI ann. III art. 98 A
defines works of art by a **closed list** of physical media — hand-executed
paintings, limited-run engravings, sculptures, photographs signed and numbered
within 30 copies. Nothing in it addresses a purely digital work. This matters
twice: for the 5,5 % VAT rate (see [`vat-and-digital-art.md`](vat-and-digital-art.md))
and for the art. 150 VI routing that art. 150 VH ter performs from 2026. The
pack does **not** assert that a digital-only NFT is an œuvre d'art.
`UNSETTLED`.

**Whether you are inside the artistes-auteurs regime.** CSS art. L. 382-1 sets
the scheme, collected by URSSAF since 2019-01-01, and affiliation follows the
nature of the work and of the income rather than the medium. No indexed source
applies it to minting and selling digital art, and URSSAF's own guidance on
what counts as an œuvre is not indexed yet. `UNSETTLED`, and it is a social
contributions question with its own answer — it does not follow from the income
tax category.

**Whether art. 93, 1 quater can apply.** It taxes authors' droits d'auteur
under the traitements et salaires rules **when they are fully declared by third
parties**. On the sources held, no NFT marketplace is a "tiers déclarant" in
that sense. See [`nft-royalties.md`](nft-royalties.md).

## Facts the pack needs from you

- Your capacity at the date of sale, confirmed: `ARTIST` / `CREATOR`,
  `TOKEN_ISSUER`, or something else — and whether this is your occupation.
- Whether you created the underlying work yourself.
- Whether the sale transferred or licensed any copyright, and on what terms.
- Edition size and whether the collection is a series. This is the fungibility
  question, and it is yours to answer.
- Whether the work exists in any physical form.
- Whether you are registered for VAT, and where your buyers are.
- Whether you are affiliated to the artistes-auteurs scheme, or to any other.
- The date of sale — which of the six rows above you are in.

Until capacity is confirmed the engine emits `REVIEW_REQUIRED` and computes
nothing. That is the designed outcome, not a failure.

## Sources

| `source_id` | What it gives this page |
| --- | --- |
| [`fr-cgi-150-vh-ter`](../sources/cgi-150-vh-ter.yaml) | The 2026 routing rule for unique non-fungible crypto-assets |
| [`fr-cgi-150-vh-bis-2019`](../sources/cgi-150-vh-bis-2019.yaml) | The « actifs numériques » text that is silent on fungibility |
| [`fr-cgi-150-vh-bis-2026`](../sources/cgi-150-vh-bis-2026.yaml) | The MiCA-perimeter recast |
| [`fr-cgi-150-vi`](../sources/cgi-150-vi.yaml) | Where art. 150 VH ter routes an object of art |
| [`fr-cgi-annexe3-98-a`](../sources/cgi-annexe3-98-a.yaml) | The closed list defining « œuvre d'art » |
| [`fr-cgi-92`](../sources/cgi-92.yaml) | BNC |
| [`fr-cgi-93`](../sources/cgi-93.yaml) | Droits d'auteur, incl. 1 quater |
| [`fr-css-l382-1`](../sources/css-l382-1.yaml) | The artistes-auteurs social scheme |
| [`fr-bofip-res-tva-000140-2024`](../sources/bofip-res-tva-000140-2024.yaml) | The 2024 NFT VAT rescrit — the dated boundary |
| [`fr-bofip-bic-champ-60-50-2019`](../sources/bofip-bic-champ-60-50-2019.yaml) | The commercial-activity boundary as it read in 2021 |
| [`fr-bofip-bnc-champ-10-10-20-40-2019`](../sources/bofip-bnc-champ-10-10-20-40-2019.yaml) | BNC scope for diverse activities |
| [`eu-reg-2023-1114-mica`](../../eu/sources/reg-2023-1114-mica.yaml) | The perimeter French law borrows from 2026, and its fungibility indicators |

Not indexed and needed: URSSAF artistes-auteurs guidance, CGI art. 100 bis
(revenue averaging for artistic BNC income), CGI art. 261 C, and code de la
propriété intellectuelle art. L. 122-8.
