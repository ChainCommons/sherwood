# Contributing

Thank you for helping build the Open Crypto Tax Commons. Two kinds of
contribution have different rules: **code** and **tax knowledge**. Read the
section that applies to yours.

Everything here is subject to [DISCLAIMER.md](DISCLAIMER.md). This project is
not tax advice and contributors are not acting as your tax adviser.

## Before anything else

- Never commit a private key, seed phrase or recovery phrase. CI scans for
  them, but the scan is a backstop, not permission to be careless.
- Never commit real taxpayer data. Test fixtures are synthetic
  ([plan 16 §87](plans/16-repository-ci.md)).
- Prefer a transparent `UNKNOWN` to an invented certainty. That preference is
  the product.

## Getting set up

```sh
corepack enable
pnpm install
pnpm validate   # schemas, IDs, dates, links, secrets, import invariants
pnpm test       # unit and contract tests
```

Both must pass before you open a pull request.

## Contributing code

- One TODO from [plan 23](plans/23-implementation.md) per pull request where
  possible. Name it in the title: `Implements P0-1-04`.
- Branch as `agent/<lane>/<todo-id>` or `<your-handle>/<short-description>`.
- Add tests next to the change. Every bug fix adds a permanent regression test
  ([§88](plans/16-repository-ci.md)).
- Do not reimplement valuation, lot matching, event normalization, rule
  application or source lookup. There is one authoritative implementation of
  each; consume it.
- Money uses `Amount` from `@octc/core`. A `number` for a monetary value or an
  on-chain quantity will not pass review.
- Do not hard-code a chain into a generic engine, or a jurisdiction into the
  rule engine. CI enforces this; see [docs/invariants.md](docs/invariants.md).
- Do not mix jurisdiction YAML and engine TypeScript in one pull request.
- If you need a change to a shared type or schema, open an RFC under
  `docs/rfc/<todo-id>.md` rather than editing another lane's contract.

## Contributing tax knowledge

A rule contribution MUST include all of the following
([§84](plans/16-repository-ci.md)). CI rejects it otherwise:

| Field | Why |
|---|---|
| `jurisdiction_id` | packs are data, never branches in code |
| `tax_domain` | so an unmodelled domain can be shown as unmodelled |
| `applies_to` | event types, capacities, participant types, asset types |
| `effective_from` / `effective_to` | when the rule applies economically |
| `published_from` | when the guidance became public — **not** the same clock |
| `sources[]` | at least one, resolving to a declared source |
| `authority_status` | an official-looking page is not automatically binding |
| `certainty` | legal certainty, with a reason |
| `review` | status, and for `EXPERT_REVIEWED`, reviewer qualification and date |
| `test_cases` | positive, negative, boundary date, missing-fact |

Additional expectations:

- **Cite, do not republish.** Prefer metadata, canonical URLs, content hashes
  and permitted extracts over copying official text. See
  [GOVERNANCE.md](GOVERNANCE.md) and [LICENSE-CONTENT.md](LICENSE-CONTENT.md).
- **Never overwrite history.** A new version of a source is a new record with a
  `predecessor`, not an edit to the old one.
- **Do not manufacture consensus.** Where authorities conflict, add competing
  interpretations and let them coexist as unresolved.
- **Unsourced material never enters a verified pack.** `SOURCE_VERIFIED` and
  `EXPERT_REVIEWED` both require sources.
- Ambiguous rules should have a test asserting `UNKNOWN` or `REVIEW_REQUIRED`.

If you are not sure whether something is settled law, say so in `certainty` and
open the pull request anyway. An honest `AMBIGUOUS` is more useful than silence.

## Review

Code changes need a maintainer of the affected package; knowledge changes need a
maintainer of the affected jurisdiction. See [CODEOWNERS](CODEOWNERS).

Legal content changes require sources and dates in the pull request description,
not only in the YAML.
