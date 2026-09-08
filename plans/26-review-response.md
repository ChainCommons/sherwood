# 26 — Response to external plan review (2026-09-09)

Reviewer argued the thinking is strong and the planning-to-code ratio is bad. Adopted changes are now in plans 07, 15, 19, 22, 23, 24 and root LICENSE files. This page is the reply.

## Adopted

**1. Do not freeze all schemas at W2.** Phase 0 still *authors* the full schema set (so lanes share types). What is frozen is only the **inter-lane contract fixtures** in `tests/contracts/` (technical-tx, marketplace overlay, semantic-event, valuation, finding). Internal schemas stay versioned and expected to break through Wave 2. Wave 0 includes a **TzKT/OBJKT/HEN spike**: persist 3–5 real operation JSON blobs so the first freeze is informed.

**2. Add a vertical slice before the §102 waterfall.** Spec P0 (54 items) remains the *release gate*, not the first ship. **P0-alpha** (target ~6 weeks): one real marketplace sale → legs → historical XTZ/EUR or UNKNOWN → France as-of sources → TOOL-003 explainer + TOOL-010 Time Machine. No workspace, no lot engine, no AI, no 13-tool homepage. That is the first thing to put in front of a French accountant. §102 P0 still exists after that.

**3. Elevate France; do not pretend DISCLAIMER.md is legal advice.** France research starts in W1 (not “after schemas”). Recruit a **named** qualified French reviewer as a project task; until then the pack stays `COMMUNITY_DRAFT` and the UI says so. Seek **actual counsel** on whether a “professional review pack” with findings and basis tables is closer to regulated tax advice in France than a public source index — before shipping that export. COMMUNITY_DRAFT is still an honest ship state, not a credibility lie.

**4. Archive coverage is a spike, not an assumption.** New TODO: one-afternoon check of Wayback / official archives for BOFiP (and related) **2021** snapshots. If the years we need are holes, Time Machine must say “no contemporaneous capture” rather than fake a clock. Investigate **Licence Ouverte** on Légifrance/BOFiP: if mirroring the corpus is lawful, prefer that over hash-and-hope URLs. Plan 15’s “short extracts only” is the default until that check lands.

**5. HEN / Teia is P0, not a stretch.** 2021 Tezos artist activity is largely hic et nunc → Teia, not OBJKT. P0 marketplace adapters: OBJKT **and** HEN/Teia historical decode. fxhash and Versum are P1 unless they fall out of the same spike. The primary demo must state which marketplaces it actually covers.

**7 (partial).** LICENSE is decided **now**, not at the first France YAML: Apache-2.0 (code), CC-BY-4.0 (original project prose). Official texts stay third-party; `redistribution` field still applies. `DISCLAIMER.md` added.

## Pushed back

**2 (do not shrink spec P0).** TOOL-003 + TOOL-010 are the *first proof*, not a replacement for lots, workspace, or the other tools. The spec’s P0 is a completeness gate for the commons; an alpha slice is how we learn. We will not redefine §102 down to two tools.

**3 (engines are not “plumbing”).** The temporal rule engine and Tezos marketplace semantics are the other half of the thesis. A sourced France markdown folder without an as-of evaluator is a bibliography. Both tracks stay first-class. A missing named reviewer is a **credibility ceiling**, not a reason to skip engines.

**6 (do not drop GoRunMe).** For *Sherwood delivery*, plan 24 §9 is the default: two providers, code vs sourced-legal-data, directory ownership, cross-provider review. GoRunMe is a **parallel experiment** (donated inference) and must not block Wave 0. We will not delete the campaign YAML; we will not wait on a scheduler to write TypeScript.

**7 (rename / rebrand).** `INITIAL_PROMPT.md` stays the canonical spec filename for now (every plan and GoRunMe pack cites it). Public product name is already **Open Crypto Tax Commons**; Sherwood is the repo/codename. sherwood.news is a weak collision; we will not rename the GitHub repo for it.

## Follow-up (timeline) — adopted

The first reply added scope and left **2027-02-20** / overlapping Phase 1. That was a lying plan. Written down now:

- **P0-alpha is a schedule reset.** Spec §102 date is **TBD** until P0-A-06. We did not cut workspace/AI from the spec gate; we stopped dating the gate.
- **Alpha owns W3–W8.** Phase 1 starts **W9+**, after the slice, so lessons can change the engines.
- **P0-L-01** (W1): recruit named French reviewer. Gates leaving `COMMUNITY_DRAFT`.
- **P0-L-02** (W3): counsel on the professional pack. Gates item 46.

## Next code, not next essay

Ship the slice. [23](23-implementation.md) P0-A-01…06. Do not start Phase 1 beside it.
