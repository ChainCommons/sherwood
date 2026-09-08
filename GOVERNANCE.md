# Governance

## What this project is

A public commons of crypto tax **knowledge** — sources, their history, and
machine-readable rules — plus the open engines that reconstruct economic facts
from raw evidence. It is infrastructure, not an advisory service.

## Principles

1. **Sources over assertions.** Every material legal statement traces to an
   identified source with a publication date. No source, no claim.
2. **History is preserved.** Current text never overwrites historical text.
   What a taxpayer could have known in 2021 is a different question from what
   is published now, and the model keeps them apart.
3. **Uncertainty is a first-class result.** `UNKNOWN`, `AMBIGUOUS` and
   `CONFLICTING_AUTHORITIES` are outcomes the system is designed to produce.
   Manufacturing consensus is a defect.
4. **Jurisdictions are data.** A pack is a directory of YAML. Adding a country
   must never mean editing an engine.
5. **Private data stays private.** Taxpayer data is local by default. There is
   no default cloud upload of a ledger.
6. **No keys, ever.** The project never requests or stores private keys, seed
   phrases or recovery phrases. There is no feature that would need them.

## Roles

| Role | Scope |
|---|---|
| **Maintainer** | Merges in one or more packages or jurisdictions; owns the tests there |
| **Jurisdiction maintainer** | Owns a pack under `jurisdictions/`; accountable for sourcing and review status |
| **Reviewer** | Reviews changes; a legal-content review requires stated qualification |
| **Contributor** | Anyone opening a pull request |

Maintainers are listed in [CODEOWNERS](CODEOWNERS). Jurisdiction packs also
name their maintainers in the pack manifest.

## Review status and who may set it

| Status | Meaning | Who may set it |
|---|---|---|
| `COMMUNITY_DRAFT` | Contributed, sourced, not independently checked | any maintainer |
| `SOURCE_VERIFIED` | Sources checked to exist, be correctly cited and correctly dated | a maintainer of the jurisdiction |
| `EXPERT_REVIEWED` | Reviewed by someone with a stated professional qualification, recorded with date and scope | a jurisdiction maintainer, recording the reviewer |
| `DISPUTED` | A credible objection is open | any maintainer |
| `STALE` | Sources have not been re-verified within the review window | set by maintenance, or by CI warning |

A rule cannot be promoted to `SOURCE_VERIFIED` or `EXPERT_REVIEWED` without
sources. This is enforced in CI, not by convention alone.

**Expert review is not an opinion addressed to any reader.** It records that a
qualified person checked this material at a date, for a stated scope. It does
not create an adviser relationship with anyone.

## Maturity levels

Packs publish their maturity (plan 05 §77) and the UI shows it. Levels are
claims about completeness, not about correctness:

```text
LEVEL 0  Skeleton — the identifier exists
LEVEL 1  Sources indexed
LEVEL 2  Human-readable explanation
LEVEL 3  Machine-readable rules
LEVEL 4  Deterministic analysis
LEVEL 5  Expert reviewed
LEVEL 6  Continuous monitoring
```

Claiming a level the pack has not reached is a governance failure, and a
reviewer should treat it as one.

## Handling disagreement about the law

Where authorities genuinely conflict, the answer is **both interpretations,
recorded as unresolved**, each with its own sources and certainty. Maintainers
do not vote on what the law is. If a dispute cannot be resolved by better
sourcing, the material stays `DISPUTED` and the UI says so.

## Source licensing

Official legal texts carry their own terms, which vary by jurisdiction. The
default posture is to store metadata, canonical links, content hashes and
permitted extracts rather than to republish. Where a licence clearly allows
redistribution, a mirror may be added with the licence recorded on the source.
See [LICENSE-CONTENT.md](LICENSE-CONTENT.md).

## Changing this document

Governance changes go through a pull request like anything else, and need
agreement from more than one maintainer.
