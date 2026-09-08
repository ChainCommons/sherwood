# 14 — Scenario library and demonstration narratives

**Spec:** §§76, 87, 113–114  
**Depends on:** event types (03), capacities (02), France pack (15)  
**P0:** scenario YAML schema + P0 demo scenarios + synthetic fixtures  
**Data:** `scenarios/`, `tests/synthetic-ledgers/`

Scenarios MUST be separate from jurisdiction rules. A scenario is a **factual pattern** plus questions needed for analysis — not a tax answer.

Each scenario MUST define factual questions needed for analysis.

## Artist scenarios

- direct physical sale
- gallery sale
- commission
- licensing
- royalty
- grant
- collaboration
- NFT primary sale
- NFT secondary royalty
- crypto payment
- international buyer

## Collector scenarios

- NFT purchase
- NFT sale
- art purchase with crypto
- gift
- donation
- frequent trading

## Builder scenarios

- salary paid in tokens
- contractor compensation
- founder allocation
- token vesting
- token unlock
- bounty
- DAO compensation

## Crypto scenarios

- fiat purchase
- crypto sale
- crypto swap
- self-transfer
- staking
- baking
- airdrop
- bridge
- wrap
- lending

## Scenario schema (implement)

```yaml
scenario_id:
title:
domain_pack: artists | collectors | builders | crypto
event_pattern: []
factual_questions: []
typical_capacities: []
typical_missing_facts: []
example_fixture: path
```

## Synthetic fixtures (§87)

Public tests MUST use synthetic taxpayers (never real people):

- traditional artist
- Tezos generative artist
- NFT collector
- gallery-represented artist
- Tezos builder
- founder receiving tokens
- baker/staker
- active trader
- international freelancer
- small platform/business

## Primary P0 demonstration (§113) — MUST be runnable

French-resident Tezos artist, several wallets, 2021–2024:

Creates NFTs; receives XTZ from primary sales and secondary royalties; buys other artists’ NFTs; transfers between own wallets; receives staking/baking rewards; later disposes of some XTZ.

System MUST:

1. fetch/import activity
2. preserve raw chain evidence
3. identify marketplace semantics
4. identify candidate economic events
5. let the user confirm wallet ownership
6. remove self-transfers from economic interpretation
7. distinguish artist income from collector activity
8. value relevant events historically
9. build acquisition lots
10. identify subsequent disposals
11. load France rules applicable to each period
12. identify guidance that existed at each date
13. separate later guidance
14. flag ambiguity
15. show relevant findings
16. explain every finding
17. identify missing records
18. generate an accountant-ready evidence pack

Implement as: synthetic ledger fixture **plus** optional live-wallet recipe. CI runs synthetic. Document live demo separately.

## Secondary P0 demonstration (§114)

French-based builder/platform participant:

- operates through an entity
- receives marketplace/platform fees
- receives or holds XTZ
- pays contributors
- has treasury transfers
- has personal wallets and company wallets

MUST demonstrate:

- entity ownership separable
- company and personal wallets separable
- platform fees distinguishable from raw transfers
- tax treatment not inferred solely from chain activity
- unresolved corporate questions can remain unknown

Full corporate tax automation is NOT required for P0.

## Implementation tasks

1. Scenario YAML for all bullets above (questions only; many without France rule coverage → UNKNOWN expected).
2. Synthetic ledgers for primary + secondary demos with OBJKT-like ops, self-transfers, bake rewards, later XTZ sale.
3. `docs/demos/primary.md` and `secondary.md` click-through aligned with workspace UI.
4. CI: primary demo fixture → pack export with self-transfers not sold, dual capacity, as-of sources.
