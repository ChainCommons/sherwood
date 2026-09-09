---
explanation_id: fr-exp-collector-disposal
jurisdiction: france
title: Selling digital assets as a private individual
todo: P0-3-02
tax_domains: [capital_gains, personal_income_tax, filing, tax_lot_accounting]
capacities: [COLLECTOR, PRIVATE_INVESTOR]
certainty: AUTHORITATIVE_INTERPRETIVE
review:
  status: COMMUNITY_DRAFT
maturity_level: 2
sources:
  - fr-cgi-150-vh-bis-2019
  - fr-cgi-150-vh-bis-2026
  - fr-cgi-200-c
  - fr-cgi-150-ua
  - fr-ce-2018-04-26-417809
  - fr-bofip-rppm-pvbmc-30-10-2019
  - fr-bofip-rppm-pvbmc-30-20-2019
  - fr-bofip-rppm-pvbmc-30-30-2019
  - fr-bofip-rppm-pvbmc-30-30-2024
  - fr-bofip-bic-champ-60-50-2019
  - fr-bofip-bic-champ-60-50-2023
  - fr-cgi-92
  - fr-impots-form-2086
  - fr-bofip-actu-2024-00078
last_source_verification: '2026-09-08'
---

# Selling digital assets as a private individual

**`COMMUNITY_DRAFT` — not tax advice, and not reviewed by a French
practitioner.** This is the best-sourced page in the France pack: the
individual disposal regime is written in statute and explained by dated
administrative doctrine. Even here, the pack models nothing yet — rules are
[P0-3-03](../../../plans/23-implementation.md).

## What we can say

You sold bitcoin, tez or some other **fungible** digital asset, occasionally,
as a private person. Four things about the French regime are clearly sourced,
and three of them routinely surprise people who have used a tax tool built for
another country.

**The regime is CGI art. 150 VH bis.** It was created by the loi de finances
pour 2019 (art. 41) and governs occasional disposals of digital assets by
individuals from 2019-01-01. Administrative doctrine explaining it
(`BOI-RPPM-PVBMC-30-10`, `-20`, `-30`) appeared on **2019-09-02** — more than
eight months after the regime began to govern.

**There is a 305 € floor, and it is measured on proceeds.** Where your total
disposal *proceeds* for the year do not exceed 305 €, the gains are exempt. It
is not a gains threshold and not an allowance deducted from a larger figure. A
year of 400 € of proceeds producing a 20 € gain is inside the charge; a year of
300 € of proceeds producing a 250 € gain is not.

**Crypto-to-crypto without a soulte is outside the charge.** An exchange of one
digital asset for another, with no cash balancing payment, is not a taxable
disposal under this article. This is the point where a foreign default is most
likely to be wrong: an engine that treats every swap as a realisation event
will produce a French answer that the statute does not support.

**The computation is portfolio-wide, and it is not FIFO.**
`BOI-RPPM-PVBMC-30-20` sets the gain by reference to the *total* acquisition
price of the whole portfolio, scaled by the disposal price over the portfolio's
global value at the moment of disposal. There are no lots. There is no first-in
ordering to choose. Any engine that applies FIFO — or LIFO, or average cost, or
any other lot method — to France is not approximating the French rule, it is
computing a different one. This is why plan 15 forbids hardcoding FIFO and why
the pack will not ship a France cost-basis rule until it can express the
portfolio formula exactly.

**On rate**, CGI art. 200 C sets a 12,8 % flat charge; the 17,2 % prélèvements
sociaux are levied under the code de la sécurité sociale, **which this pack has
not indexed** ([`../RESEARCH.md`](../RESEARCH.md) §6). We therefore do not state
a combined rate. The option for the barème progressif comes from the loi de
finances pour 2022 (art. 79) and applies to disposals from 2023-01-01 — but the
BOFiP commentary on it arrived only on **2024-04-23**.

**The declaration** is form 2086 alongside the annual return. Only the landing
page is indexed; the per-year CERFA PDFs are the real as-of artefacts and are
not captured yet.

## What was published, by year

| Year of disposal | What governed it | What you could read at the time |
| --- | --- | --- |
| before 2019 | CGI art. 150 UA for occasional disposals, on the reasoning of `CE, 26 avril 2018, n° 417809` (bitcoin units are biens meubles incorporels) | The decision itself, from 2018-04-26 |
| 2019 | art. 150 VH bis | The statute from 2018-12-28; **no BOFiP until 2019-09-02** |
| 2020 – 2022 | art. 150 VH bis | Statute + the 2019 BOFiP trio |
| 2023 – 2025 | art. 150 VH bis, with the barème option available from 2023-01-01 | Statute. **The doctrine on the option did not exist until 2024-04-23** — a taxpayer filing for 2023 had the law and no commentary |
| from 2026 | art. 150 VH bis as recast on **2026-06-28** to key off the MiCA perimeter | The recast text, published 2026-06-25 |

The 2026 recast matters beyond wording. Art. 150 VH bis now takes its perimeter
from Regulation (EU) 2023/1114 (MiCA), whose art. 2(3) excludes unique,
non-fungible crypto-assets — which is how NFTs left this article and arrived at
[art. 150 VH ter](nft-secondary-sale.md).

## What is unsettled

**Where the line to professional activity sits.** Habitual buying and selling
is not occasional disposal, and the category has moved:

| Period | Occasional | Habitual buying and selling |
| --- | --- | --- |
| before 2019 | art. 150 UA | BIC |
| 2019 – 2022 | art. 150 VH bis | BIC (`BOI-BIC-CHAMP-60-50`, 2019 version) |
| from 2023 | art. 150 VH bis | BNC, art. 92, 2° (loi de finances pour 2022, art. 70) |

An as-of query for a 2021 trader **must** return the 2019 BIC text, not the
2023 revision. What makes trading "habitual" — volume, frequency, tooling,
leverage, whether it is your living — is a facts question the doctrine
addresses in general terms and this pack does not model. `AMBIGUOUS`.

**Whether the asset you sold is inside art. 150 VH bis at all.** For a fungible
token the answer is straightforward. For an NFT it is not, and it is not
answered by silence: see [`nft-secondary-sale.md`](nft-secondary-sale.md).

**Foreign accounts.** If you disposed through a platform established outside
France, CGI art. 1649 bis C requires you to declare the account on form
3916/3916-bis, with penalties at CGI art. 1736. Doctrine `BOI-CF-CPF-30-20` is
available from **2021-05-26**. Whether a self-custodied wallet is a "compte
ouvert auprès d'une entreprise, personne morale, institution ou organisme" is
answered by nothing indexed here and stays `UNSETTLED` — for on-chain users it
is the most consequential open question in the reporting domain.

## Facts the pack needs from you

- Your capacity for the year, confirmed not inferred: `COLLECTOR` /
  `PRIVATE_INVESTOR` versus `ACTIVE_TRADER` / `PROFESSIONAL_TRADER`.
- Total disposal **proceeds** for the calendar year, to test the 305 € floor
  before anything else is computed.
- For each disposal: whether a soulte was paid, and in what currency the
  consideration arrived.
- The global value of your portfolio at each disposal — the portfolio formula
  cannot run without it, and a tool that silently substitutes a lot method is
  answering a different question.
- Whether any platform you used is established outside France.
- Whether the asset is fungible. If it is not, this page is the wrong one.

## Sources

| `source_id` | What it gives this page |
| --- | --- |
| [`fr-cgi-150-vh-bis-2019`](../sources/cgi-150-vh-bis-2019.yaml) | The regime as it stood 2019-01-01 → 2026-06-27 |
| [`fr-cgi-150-vh-bis-2026`](../sources/cgi-150-vh-bis-2026.yaml) | The MiCA-perimeter recast from 2026-06-28 |
| [`fr-cgi-200-c`](../sources/cgi-200-c.yaml) | The 12,8 % charge and the barème option |
| [`fr-cgi-150-ua`](../sources/cgi-150-ua.yaml) | The pre-2019 regime |
| [`fr-ce-2018-04-26-417809`](../sources/ce-2018-04-26-417809.yaml) | Pre-2019 characterisation of bitcoin units |
| [`fr-bofip-rppm-pvbmc-30-10-2019`](../sources/bofip-rppm-pvbmc-30-10-2019.yaml) | Scope, incl. the 305 € floor and the soulte point |
| [`fr-bofip-rppm-pvbmc-30-20-2019`](../sources/bofip-rppm-pvbmc-30-20-2019.yaml) | The portfolio-wide computation |
| [`fr-bofip-rppm-pvbmc-30-30-2019`](../sources/bofip-rppm-pvbmc-30-30-2019.yaml) | Modalités and filing obligations, 2019 text |
| [`fr-bofip-rppm-pvbmc-30-30-2024`](../sources/bofip-rppm-pvbmc-30-30-2024.yaml) | The 2024 revision covering the barème option |
| [`fr-bofip-actu-2024-00078`](../sources/bofip-actu-2024-00078.yaml) | Dates the arrival of that commentary |
| [`fr-bofip-bic-champ-60-50-2019`](../sources/bofip-bic-champ-60-50-2019.yaml) | Habitual trading as BIC, the 2021-available text |
| [`fr-bofip-bic-champ-60-50-2023`](../sources/bofip-bic-champ-60-50-2023.yaml) | The post-LF 2022 boundary |
| [`fr-cgi-92`](../sources/cgi-92.yaml) | BNC, incl. the 2° that takes over from 2023 |
| [`fr-impots-form-2086`](../sources/impots-form-2086.yaml) | The declaration |

Not indexed and needed for a complete answer: the CSS provisions behind the
17,2 % prélèvements sociaux, and the per-year form 2086 PDFs.
