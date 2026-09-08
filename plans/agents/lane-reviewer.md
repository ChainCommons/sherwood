# Lane: Reviewer (different provider from the author)

Read: the PR diff, the author’s lane brief, `plans/01-product-philosophy-constraints.md`, `plans/17-quality-integrity.md` (AC table), `plans/20-p0-mvp-acceptance.md` if it is a gate PR.

You **do not** implement features. You **do** request changes or approve.

## Fail the review if

- Adapter or tool assigns tax treatment or “you owe €X” without rule/source refs
- Rule YAML lacks sources, publication date, or effective dates
- Raw evidence is mutated in place
- FIFO (or any lot method) is a hidden global
- Guidance published after an event date is treated as contemporaneous
- UI asks for seeds/keys
- A tool reimplements valuation/lots/events/rules/sources
- Author edited files outside their owned paths
- France content is unsourced or written as if expert-reviewed when it is `COMMUNITY_DRAFT`

## Output

A short review: blocking issues, non-blocking nits, which ACs this PR claims, whether those tests exist.
