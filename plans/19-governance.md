# 19 — Governance, legal disagreement, licensing

**Spec:** §§98–101, 84, 99  
**Workstream:** maintainers  
**P0:** documents + review fields in data; not a full foundation yet

## Roles (§98)

```text
core maintainers
technical maintainers
jurisdiction maintainers
source researchers
qualified professional reviewers
tool maintainers
community contributors
```

Encode in `GOVERNANCE.md` and CODEOWNERS. P0 may have overlapping humans; roles still exist so France content is not merged like CSS.

## Jurisdiction governance (§99)

Mature jurisdiction SHOULD have: primary maintainer; backup maintainer; qualified local reviewer.

Where expert review is absent, UI MUST say so (`COMMUNITY_DRAFT`, no fake “verified” badge).

## Legal disagreement (§100)

Competing interpretations MUST be representable:

```text
INTERPRETATION A
  sources...
  reviewer...
INTERPRETATION B
  sources...
  reviewer...
STATUS: UNRESOLVED
```

The project MUST NOT manufacture consensus. Rules engine emits both (AC-011). UI lists both; no averaged “most likely tax”.

## Licensing (§101)

Code and knowledge content MAY use different open licenses.

Third-party source redistribution rights MUST be respected.

Prefer: structured metadata; source links; hashes; permitted extracts — over unnecessary republishing.

P0 proposal (implementation choice):

- Code: Apache-2.0
- Original project prose (explanations): CC-BY-4.0
- Official source texts: not re-licensed; store metadata + hash + URL + archive link + short quotation where fair dealing/quotation rights allow; `redistribution: forbidden | extract | full` field on sources

`DISCLAIMER.md`: not a tax adviser; no guarantee; UNKNOWN is expected.

## Implementation tasks

1. Write the seven root markdown docs from spec §83.
2. `source.redistribution` enum + CI that fails if `full` body committed for `forbidden` sources.
3. Interpretation schema + UI.
4. Reviewer qualification fields on expert reviews.
5. CONTRIBUTING.md aligned with §84.
