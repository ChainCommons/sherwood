# 02 — Domain model: participant, capacity, entities, wallets, artwork, compensation rights

**Spec:** §§9–11, 18–19, 43  
**Workstream:** A  
**Depends on:** plan 01  
**Unblocks:** evidence/events (03), lots (04), workspace (09), France scenarios (14, 15)  
**Package:** `packages/core` types; schemas under `schemas/participant`, `schemas/entity`, `schemas/asset` (artwork extension)

Root domain object is **`Participant`**, not Artist.

## Participant schema (MUST)

```yaml
participant_id: ulid
participant_type: individual | company | partnership | association | foundation | trust | DAO | other
tax_residencies: [{ jurisdiction_id, from, to, status: declared | unknown }]
citizenships_if_relevant: []
business_activities: []
professional_statuses: []
tax_registrations: [{ type, jurisdiction_id, identifier_ref? }]  # identifiers stay local
accounting_methods: [{ jurisdiction_id, method, from, to }]
functional_currencies: [{ currency, from, to }]
wallet_ownership: [wallet_ownership_id]
exchange_accounts: []
related_entities: [relationship_id]
schema_version: string
```

Residency is never inferred from IP. Missing residency → findings that need it resolve `UNKNOWN` / `REVIEW_REQUIRED`.

## Capacity (MUST be first-class on activity)

Supported initial capacities:

`ARTIST CREATOR COLLECTOR PRIVATE_INVESTOR ACTIVE_TRADER PROFESSIONAL_TRADER FOUNDER EMPLOYEE CONTRACTOR PROTOCOL_CONTRIBUTOR DAO_CONTRIBUTOR MARKETPLACE_OPERATOR TOKEN_ISSUER VALIDATOR BAKER MINER STAKER DELEGATOR LIQUIDITY_PROVIDER LENDER BORROWER BUSINESS_OWNER DONOR RECIPIENT UNKNOWN`

Shape:

```yaml
capacity:
  primary: ARTIST
  secondary: [SELF_EMPLOYED]
  as_of: date
  status: USER_CONFIRMED | INFERRED | UNKNOWN
  candidates: []  # competing interpretations
```

Rules:

- User-correctable
- Date-sensitive (INV-005)
- May remain `UNKNOWN`
- Multiple candidates allowed
- Same participant can be ARTIST on one event and COLLECTOR on another (AC-010)

Default inference MAY suggest capacity from event type (e.g. OBJKT primary sale → ARTIST candidate) but MUST NOT become authoritative without confirmation.

## Entity relationship graph

Relationship types: `OWNS CONTROLS EMPLOYED_BY CONTRACTS_FOR FOUNDED DIRECTOR_OF MEMBER_OF CONTRIBUTES_TO BENEFICIARY_OF WALLET_OWNED_BY ACCOUNT_OWNED_BY`

Example the model must represent:

```text
Individual
├── owns Company A
├── founded Project B
├── controls Wallet 1
└── personally controls Wallet 2
Company A
└── controls Wallet 3
```

Secondary P0 demo (§114) depends on this: personal vs company wallets, treasury vs personal, unresolved corporate questions stay unknown.

## Wallet ownership (§43)

```yaml
wallet_id:
address:
chain: tezos | ...
ownership_class:
  USER_PERSONAL
  USER_BUSINESS
  USER_CONTROLLED_ENTITY
  COLLABORATOR
  MARKETPLACE
  CUSTOMER
  PROTOCOL
  UNKNOWN
owner_participant_id:  # nullable until confirmed
related_entity_id: nullable
confirmation: USER_CONFIRMED | INFERRED | UNKNOWN
```

Rules:

- Transfers among **confirmed** user-owned wallets MUST NOT automatically be treated as disposals (AC-004).
- Ownership mappings MUST remain private by default (never in public tool share URLs unless the user explicitly shares).
- TOOL-007 requires confirmation before relationships become authoritative.

## Artwork and rights extension (§18)

Artist domain package models artwork **separately** from payment/token mechanics.

```yaml
artwork_id:
title:
creator_ids: []
medium:
physical_or_digital: physical | digital | both
edition_size:
creation_date:
copyright_owner:
rights_transferred: []
licence_terms:
commercial_rights:
reproduction_rights:
tokenized: boolean
token_contract:
token_id:
associated_physical_object:
```

MUST NOT assume NFT ownership transfers copyright. Marketplace decode produces token transfer + optional sale legs; rights remain unknown unless user/evidence says otherwise.

Package: `domain-packs/artists/` referencing generic `asset` + `artwork`.

## Token compensation rights (§19)

Distinguish: `TOKEN_OPTION TOKEN_WARRANT RESTRICTED_TOKEN VESTING_TOKEN LOCKED_TOKEN SAFT_OR_SIMILAR_RIGHT OTHER_CONTINGENT_RIGHT`

Separate events MUST exist and MUST NOT auto-collapse:

```text
right granted
right vested
token delivered
token unlocked
token sold
```

Map to semantic events: `TOKEN_GRANT TOKEN_VESTING TOKEN_UNLOCK TOKEN_COMPENSATION` plus later `CRYPTO_SALE` / `ASSET_SALE`. Builder Compensation Timeline is P1, but the schema and event types are P0 so P0 classification does not smash grant+delivery into one income event.

## Implementation tasks

1. Author JSON Schema for participant, residency, capacity, entity, relationship, wallet ownership, artwork, compensation right.
2. Generate TS types; round-trip fixtures.
3. Core helpers: `isConfirmedSelfTransfer(from, to, ownershipMap)`, `capacitiesAt(participant, date)`.
4. Workspace CRUD for profile + ownership (thin; UI in plan 09).
5. Tests: AC-010 multiple capacities; entity vs personal wallets; copyright not inferred from FA2 transfer; vesting events remain distinct.

## Out of scope

- Full corporate tax (P0 says not required)
- KYC/identity vault
- Automatic residency from geolocation
