# Inter-lane contract fixtures

Synthetic examples of every record type that crosses a lane boundary. They are
the shared reference for what a producer must emit and what a consumer may
rely on — an adapter author can build against `technical-transaction.json`
without waiting for the event engine, and vice versa.

Every file validates against its `$schema` under `pnpm validate`, and
`contracts.test.ts` asserts the same thing plus the layering invariants, so a
schema change that breaks a downstream lane fails here first.

The scenario deliberately runs end to end through one worked example: an
OBJKT-style secondary sale of a Tezos NFT for 100 XTZ, split into a 2.5%
marketplace fee and a 10% creator royalty. It shows the split reaching the
event as separate legs rather than a single net number.

**All fixtures are synthetic.** Addresses and hashes are invented; no real
taxpayer appears here (§87).
