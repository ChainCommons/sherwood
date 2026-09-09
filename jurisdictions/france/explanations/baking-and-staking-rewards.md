---
explanation_id: fr-exp-baking-and-staking-rewards
jurisdiction: france
title: Baking, staking and delegation rewards
todo: P0-3-02
tax_domains:
  [personal_income_tax, professional_business_income, capital_gains,
   self_employment_contributions]
capacities: [BAKER, VALIDATOR, STAKER, DELEGATOR]
certainty: UNSETTLED
engine_outcome: REVIEW_REQUIRED
review:
  status: COMMUNITY_DRAFT
maturity_level: 2
sources:
  - fr-bofip-bnc-champ-10-10-20-40-2019
  - fr-bofip-bnc-champ-10-10-20-40-2023
  - fr-cgi-92
  - fr-ce-2018-04-26-417809
  - fr-cgi-150-vh-bis-2019
  - fr-bofip-rppm-pvbmc-30-20-2019
last_source_verification: '2026-09-08'
---

# Baking, staking and delegation rewards

**`COMMUNITY_DRAFT` — not tax advice.** You ran a baker, staked, or delegated,
and tez arrived in your account. **No French source indexed in this pack names
baking, staking or delegation.** That is the whole answer for the
characterisation question, and this page exists mainly to stop the nearest
available doctrine being stretched over the gap.

## What we can say

**There is doctrine on mining, and it is about mining.**
`BOI-BNC-CHAMP-10-10-20-40` (2019-09-02 version, the one a 2021 taxpayer could
read) treats mining consideration as art. 92 income, with a nil acquisition
value where units were allocated for free. It addresses proof-of-work mining.
It does **not** name Tezos baking, delegation rewards or staking, and this pack
records explicitly that it must not be stretched to cover them.

The temptation is obvious and the reason to resist it is concrete. Mining
doctrine is built on a picture of committing hardware and energy to produce
units. A delegator commits neither: they assign rights over a balance they
already hold and keep custody of it. A baker commits capital and infrastructure
but is not solving a proof of work. Whether the doctrine's reasoning reaches
either is a legal question that no French authority indexed here has answered.
Treating it as answered would be exactly the invented certainty this project
exists to avoid.

**Receiving tez is not automatically professional income.** Plan 15 states this
as a design rule and the sources support the caution: art. 92 attaches to
income from an occupation or a source of profits, which is a question about
you, not about the transfer. Capacity is a confirmed fact, never inferred from
the shape of an on-chain event (INV-004/005).

**The disposal question is separate and better sourced.** Whatever the receipt
is, when you later sell the tez, that disposal is governed by
[`collector-disposal.md`](collector-disposal.md) — art. 150 VH bis, the 305 €
proceeds floor, the portfolio-wide computation. What is unsettled is the
receipt, and, following from it, the acquisition value the disposal
computation should carry.

**Categories in play, none confirmed for baking or staking:**

| Reading | Where it comes from | Status |
| --- | --- | --- |
| BNC under art. 92, by analogy to mining | `BOI-BNC-CHAMP-10-10-20-40` | `UNSETTLED` — the doctrine does not name these activities |
| BIC, where the operation is a commercial undertaking | the habitual-activity boundary | `UNSETTLED` |
| Not income on receipt; economics captured at disposal | art. 150 VH bis governs the later sale in any case | `UNSETTLED` |

Two of the three would change what number appears on a return. The pack states
all three and computes none.

## What was published, by year

| Year | On mining | On baking / staking / delegation |
| --- | --- | --- |
| 2018 | `CE, 26 avril 2018, n° 417809` reasons that mining falls under art. 92 | **nothing** |
| 2019 – 2022 | `BOI-BNC-CHAMP-10-10-20-40` (02/09/2019): art. 92, nil acquisition value for freely allocated units | **nothing** |
| 2023 – 2025 | revised version (28/06/2023), after the loi de finances pour 2022 art. 70 moved the habitual-activity test into art. 92 | **nothing** |
| from 2026 | no change indexed | **nothing** |

Every cell in the right-hand column is empty. It was searched for at the
publishers on 2026-09-08 and not found; see
[`../RESEARCH.md`](../RESEARCH.md) §6 for what else remains unindexed.

## What is unsettled

- **Whether mining doctrine reaches baking.** `UNSETTLED`. A baker commits
  capital and runs infrastructure; a proof-of-work miner does something the
  doctrine describes in different terms.
- **Whether it reaches delegation.** `UNSETTLED`, and further from the
  doctrine than baking is: a delegator neither produces blocks nor gives up
  custody.
- **The acquisition value of a reward.** The mining doctrine's nil-value
  treatment for freely allocated units is stated for mining. Whether a baking
  reward is "allocated for free" when it is consideration for validation work
  is not addressed. This flows straight into the later disposal computation,
  so an unexamined assumption here silently changes a gain.
- **When the receipt arises.** Rewards may accrue to a contract or a
  delegation, be claimable but unclaimed, and be withdrawn much later. Nothing
  indexed here addresses on-chain timing, and the pack does not assume accrual,
  claimability and withdrawal are the same date. `UNKNOWN`.
- **Rewards passed on to delegators.** A baker who forwards a share is not
  obviously receiving that share as their own income. The gross, the fee and
  the forwarded amount stay distinct legs; nothing indexed here says how they
  are characterised.
- **Social contributions.** Not addressed by anything indexed here.

## Facts the pack needs from you

- Which role, at the date of each receipt: `BAKER`, `VALIDATOR`, `STAKER`,
  `DELEGATOR` — confirmed by you, not inferred from the chain.
- Whether you ran infrastructure yourself, and at what scale and cost.
- Whether custody of the staked balance left your control.
- Whether you charge a fee to delegators, and whether you forward rewards.
- Whether this is an occupation, a side activity, or incidental to holding.
- For each receipt: accrual date, claimable date, withdrawal date.
- Whether you have been treating these as income, and since when. A change of
  position has its own consequences, and correcting your own error is not the
  same as challenging the administration's view.

Until these are answered the engine emits `REVIEW_REQUIRED`.

## Sources

| `source_id` | What it gives this page |
| --- | --- |
| [`fr-bofip-bnc-champ-10-10-20-40-2019`](../sources/bofip-bnc-champ-10-10-20-40-2019.yaml) | Mining as art. 92 income, nil value for freely allocated units — the 2021-available text, which does **not** name baking or staking |
| [`fr-bofip-bnc-champ-10-10-20-40-2023`](../sources/bofip-bnc-champ-10-10-20-40-2023.yaml) | The post-LF 2022 revision |
| [`fr-cgi-92`](../sources/cgi-92.yaml) | BNC |
| [`fr-ce-2018-04-26-417809`](../sources/ce-2018-04-26-417809.yaml) | The reasoning behind the mining doctrine |
| [`fr-cgi-150-vh-bis-2019`](../sources/cgi-150-vh-bis-2019.yaml) | Governs the later disposal of the tez |
| [`fr-bofip-rppm-pvbmc-30-20-2019`](../sources/bofip-rppm-pvbmc-30-20-2019.yaml) | The portfolio computation the acquisition value feeds |

Nothing here is Tezos-specific French guidance, because none was found.
