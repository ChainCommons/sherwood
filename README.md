# Open Crypto Tax Commons (Project Sherwood)

Open-source infrastructure to reconstruct, document, and navigate the tax consequences of crypto-economic activity. Tezos is the first proving ground; France is the first jurisdiction pack. The root domain object is a participant, not an artist.

**Sherwood** is the repository / internal codename. The public product name is Open Crypto Tax Commons.

This project is not a tax adviser and does not guarantee legal correctness. Prefer a transparent unknown over unsupported certainty.

## Status

Phase 0. The repository holds the specification, the P0 planning set, and the
foundation the rest is built on: JSON Schemas for the domain model, the shared
`core` primitives, the validator that CI runs, contract fixtures for each lane,
and LEVEL 0 jurisdiction skeletons. The engines and applications are not written
yet.

The first code goal is **P0-alpha**: one real marketplace sale through explainer
and guidance time machine ([plans/23-implementation.md](plans/23-implementation.md)).

## What is here

```text
schemas/         JSON Schema (2020-12) for every record that crosses a boundary
packages/core    Decimal money, zoned time, ULIDs, content hashing, enums
packages/validate The checks behind `pnpm validate`, used by CI and the CLI
jurisdictions/   Jurisdiction packs — data directories, never branches in code
tests/contracts  Synthetic examples of every inter-lane record
tests/invariants Tests that the architectural guards actually fire
docs/invariants.md  INV-001–020 and AC-001–015 mapped to the tests that enforce them
apps/            web and cli stubs
plans/           the planning set; INITIAL_PROMPT.md is canonical
```

## Getting started

```sh
corepack enable
pnpm install
pnpm validate    # schemas, unique IDs, dates, references, links, secrets, invariants
pnpm test        # unit and contract tests
```

## The ideas the code is built around

- **Reconstruct economics before tax.** Raw evidence becomes economic legs,
  which become semantic events. Tax treatment comes last, from the rules engine
  alone — never from an adapter.
- **A blockchain operation is not a taxable event.** One operation may produce
  zero, one or several economic events, and an unrecognised contract call
  produces `UNKNOWN` rather than an invented sale.
- **Three clocks, kept apart.** When a rule applies, when the guidance was
  published, and when this project captured it are different dates. Guidance
  published in 2025 was not available to a taxpayer in 2021.
- **Jurisdictions are data.** Adding a country means adding YAML, not editing an
  engine. CI rejects an engine that imports a jurisdiction or a chain adapter.
- **Uncertainty is a result.** `UNKNOWN`, `AMBIGUOUS` and
  `CONFLICTING_AUTHORITIES` are outcomes the system is designed to produce.
- **Your data stays local.** No account is needed for analysis, and no ledger is
  uploaded by default. The project never asks for a private key or seed phrase.

## Documents

- [Product & engineering specification](INITIAL_PROMPT.md) (canonical filename; cite by section number)
- [Planning set](plans/README.md)
- [Invariants and acceptance tests](docs/invariants.md)
- [CONTRIBUTING.md](CONTRIBUTING.md) · [GOVERNANCE.md](GOVERNANCE.md) · [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- [SECURITY.md](SECURITY.md) · [PRIVACY.md](PRIVACY.md)
- [LICENSE](LICENSE) (Apache-2.0, code) · [LICENSE-CONTENT.md](LICENSE-CONTENT.md) (CC-BY-4.0, original prose) · [DISCLAIMER.md](DISCLAIMER.md)
