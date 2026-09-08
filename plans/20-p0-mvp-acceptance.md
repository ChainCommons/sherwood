# 20 — P0 MVP definition of done

**Spec:** §§102, 105, 113–115  
**This is the release gate.** Detailed how-to is in plans 02–19.

P0 is complete **only when** all of the following exist.

## Foundation

1. repository governance
2. contributor model
3. schemas
4. source registry
5. temporal source model
6. temporal rule model
7. deterministic rule engine
8. valuation engine
9. participant/entity model
10. evidence model
11. economic-event engine
12. lot engine
13. local workspace storage

## Tezos

14. Tezos adapter
15. public wallet import
16. NFT semantic decoding
17. marketplace decoding for at least one major ecosystem path
18. staking/baking recognition
19. self-transfer handling
20. historical XTZ valuation

## Knowledge

21. France jurisdiction pack v0.1
22. required EU dependencies
23. historical-source querying
24. source/rule search
25. review/maturity labels

## Tax Tools

26. Wallet Tax Timeline
27. Historical Asset Valuator
28. Tezos Transaction Explainer
29. NFT Sale/Purchase Reconstructor
30. Artist Revenue Explorer
31. Collector Activity Explorer
32. Linked Wallet Mapper
33. Transaction Tagger
34. Tax Data Health Check
35. Guidance Time Machine
36. Rule Diff
37. Evidence Pack Generator
38. generic tax-software export

## Workspace

39. participant profile
40. wallet ownership
41. event correction
42. valuation review
43. structured findings
44. explainability
45. analysis snapshot
46. professional export

## AI

47. source-grounded explanation
48. candidate event classification
49. missing-fact detection
50. red-team prototype

## Quality

51. synthetic corpus
52. regression tests
53. CI validation
54. privacy/security controls

## Also required (spec elsewhere, not numbered in §102)

- AC-001–AC-015 passing (plan 17)
- Primary demo §113 and secondary demo §114 (plan 14)
- Invariants INV-001–020 structurally enforced (plan 01)
- Tool homepage discoverability (plan 18)
- Honest unsupported-domain labels

## Suggested build order (do not shuffle casually)

```text
Phase 0     items 1–3, 53
P0-alpha    TOOL-003, TOOL-010, one real decode (not a §102 substitute)
            then re-date the rest
Phase 1     items 4–13, 51–52          (after alpha)
Phase 2     items 14–20
Phase 3     items 21–38
Phase 4     items 39–50, 54            (item 46 gated on P0-L-02 counsel)
Demos       §113–114 after the above
```

§102 ship date is **TBD** until P0-A-06. Do not keep a calendar that assumes Phase 1 overlaps alpha.

## Product success condition (§115)

Can the system reply in substance to someone who created art, collected, received tokens, used multiple wallets, and is unsure:

We reconstructed your activity; here is what happened economically; from evidence vs confirmed vs inferred vs unknown; historical values; lots; rules potentially applicable then; guidance actually available then; later guidance separately; conflicts; missing records; calculations; sources; professional-judgment questions; every conclusion inspectable.

If the UI only prints a liability, P0 has failed even if engines exist.

## Honest incompleteness

Complex protocol support MAY remain incomplete during P0, but schemas MUST allow the concepts (§15). Full corporate tax automation is NOT required (§114). France v0.1 will have large `UNKNOWN` regions — that is success if labeled.
