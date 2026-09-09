---
explanation_id: fr-exp-crypto-compensation
jurisdiction: france
title: Being paid in crypto for work
todo: P0-3-02
tax_domains:
  [personal_income_tax, professional_business_income, withholding,
   social_security, self_employment_contributions, capital_gains]
capacities: [EMPLOYEE, CONTRACTOR, DAO_CONTRIBUTOR, PROTOCOL_CONTRIBUTOR, FOUNDER]
certainty: UNSETTLED
engine_outcome: REVIEW_REQUIRED
review:
  status: COMMUNITY_DRAFT
maturity_level: 2
sources:
  - fr-cgi-92
  - fr-cgi-93
  - fr-css-l382-1
  - fr-bofip-bic-champ-60-50-2019
  - fr-bofip-bic-champ-60-50-2023
  - fr-bofip-bnc-champ-10-10-20-40-2019
  - fr-cgi-150-vh-bis-2019
  - fr-bofip-rppm-pvbmc-30-20-2019
last_source_verification: '2026-09-08'
---

# Being paid in crypto for work

**`COMMUNITY_DRAFT` — not tax advice.** You did work and were paid in tez, in
a stablecoin, in a governance token, or in an NFT. **No source indexed in this
pack addresses payment in crypto for work.** Not for employees, not for
freelancers, not for DAO contributors, and not for the valuation of a non-cash
professional receipt.

That is a strong statement, so it is worth being precise about its scope. It
does not mean France has no law on this. It means this pack has not indexed a
French source that addresses it, and therefore has nothing to say that would be
grounded rather than recalled. A pack that answered anyway would be inventing
doctrine — the one thing plan 15 forbids outright.

## What we can say

**Payment in kind is not payment in nothing.** Whatever category applies,
receiving value for work is not made non-taxable by arriving as a token. The
pack does not treat an unexplained inbound transfer as tax-free, and it does
not treat it as income either. It records an unresolved receipt and asks.

**The category depends on the relationship, and the relationship is a fact.**
Employment, an independent professional engagement, a commercial undertaking
and an unpaid contribution that later received a grant are four different
things, and the sources indexed here mark out the general categories without
addressing crypto at all:

- **BNC, CGI art. 92** — income from a non-commercial occupation or source of
  profits.
- **BIC** — commercial activity (`BOI-BIC-CHAMP-60-50`).
- **Traitements et salaires** — employment. **No indexed source in this pack**
  sets out the employment category itself; CGI art. 93, 1 quater reaches those
  rules for authors' income but does not define them, and nothing indexed here
  addresses salary paid other than in euro.
- **Droits d'auteur, CGI art. 93, 1 quater** — where the work is authorship
  and the income is fully declared by third parties. See
  [`nft-royalties.md`](nft-royalties.md); the third-party condition rarely
  holds on-chain.

**Receipt of tez is not automatically professional income.** Plan 15 states it
as a design rule. An inbound transfer proves that value moved, not why. A grant,
a gift, a refund, a repayment, a reward and a fee all look alike on-chain, and
the pack must not resolve that ambiguity by defaulting to income.

**Two events, not one.** Being paid in a token is a receipt; selling that token
later is a disposal under [`collector-disposal.md`](collector-disposal.md). The
value attributed on receipt is the acquisition value the later disposal
computation carries. Getting the first wrong moves the second, in the opposite
direction, which is why the pack refuses to guess at either end.

**Valuation is not decided here.** What the tokens were worth on the day is the
valuation package's job — method, source and time are its concern, and the
answer is auditable there. This pack does not supply a rate, a convention, or a
"reasonable" figure.

**Social contributions and withholding are separate questions**, not
consequences of the income-tax category. Nothing indexed here addresses either
for crypto compensation. For artists, CSS art. L. 382-1 sets the
artistes-auteurs scheme; whether it applies is `UNSETTLED`.

## What was published, by year

| Year | On crypto paid as compensation | Nearest indexed material |
| --- | --- | --- |
| 2019 – 2022 | **nothing** | `BOI-BIC-CHAMP-60-50` (02/09/2019) and `BOI-BNC-CHAMP-10-10-20-40` (02/09/2019) mark out BIC and BNC generally; neither addresses payment for work in crypto |
| 2023 – 2025 | **nothing** | the 2023 revisions of both, after the loi de finances pour 2022 art. 70 |
| from 2026 | **nothing** | CGI art. 150 VH ter concerns disposals of unique non-fungible crypto-assets, not compensation |

There is no row where this pack can point at a French source about being paid
in crypto. The correct machine answer for every year is `UNSETTLED`, and the
correct engine outcome is `REVIEW_REQUIRED`.

## What is unsettled

- **Employment paid in crypto.** Whether and how it is taxed and contributed
  on: `UNSETTLED` here, because no source on the employment category is
  indexed at all. This is a gap in the pack, and it is recorded as one.
- **Whether a receipt is compensation.** A DAO grant, an airdrop to
  contributors, a retroactive reward and a fee for services are different
  things with the same on-chain shape. `AMBIGUOUS`, and it is resolved by facts
  about the arrangement, not by the transfer.
- **When the receipt arises.** Vesting, cliffs, streamed payments, claimable
  balances and locked tokens all separate "promised" from "available". Nothing
  indexed here addresses the timing of an on-chain receipt. `UNKNOWN`.
- **Tokens you cannot yet sell.** Being taxed on a value you cannot realise is
  the sharpest version of the timing question, and the pack has no French
  source on it.
- **Payment in an NFT.** Adds the whole of
  [`nft-secondary-sale.md`](nft-secondary-sale.md) on top of this page.
- **Cross-border work.** Where you are resident, where the payer is
  established, and any treaty: entirely outside what this pack indexes.

## Facts the pack needs from you

- The relationship, confirmed: `EMPLOYEE`, `CONTRACTOR`, `DAO_CONTRIBUTOR`,
  `PROTOCOL_CONTRIBUTOR`, `FOUNDER`, or none of these.
- Whether there was a contract, and what it said the consideration was.
- Whether the payer is established in France, and whether they declare anything
  about you to the French administration.
- Whether the payment was for identified work, or a discretionary or
  retroactive grant.
- Vesting, lock-up and claim conditions, with dates.
- Whether the token was transferable and sellable when received.
- Your residence for the period, and whether it changed.
- Whether you have been declaring these receipts, and on what basis.

## Sources

| `source_id` | What it gives this page |
| --- | --- |
| [`fr-cgi-92`](../sources/cgi-92.yaml) | BNC, one of the candidate categories |
| [`fr-cgi-93`](../sources/cgi-93.yaml) | Droits d'auteur, where the work is authorship |
| [`fr-css-l382-1`](../sources/css-l382-1.yaml) | The artistes-auteurs social scheme |
| [`fr-bofip-bic-champ-60-50-2019`](../sources/bofip-bic-champ-60-50-2019.yaml) | The commercial-activity boundary, 2021-available |
| [`fr-bofip-bic-champ-60-50-2023`](../sources/bofip-bic-champ-60-50-2023.yaml) | The post-LF 2022 revision |
| [`fr-bofip-bnc-champ-10-10-20-40-2019`](../sources/bofip-bnc-champ-10-10-20-40-2019.yaml) | BNC scope for diverse activities |
| [`fr-cgi-150-vh-bis-2019`](../sources/cgi-150-vh-bis-2019.yaml) | Governs the later disposal of what you were paid |
| [`fr-bofip-rppm-pvbmc-30-20-2019`](../sources/bofip-rppm-pvbmc-30-20-2019.yaml) | The computation the acquisition value feeds |

None of these is about compensation in crypto. They are listed because they are
what the pack holds, and because a reader is entitled to see that the nearest
material is not close.
