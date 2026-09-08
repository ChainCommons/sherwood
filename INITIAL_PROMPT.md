
# Open Crypto Tax Commons - Project Sherwood

## Product & Engineering Requirements Specification

### Version 1.0

**Status:** Planning-ready specification  
**Primary audience:** Agentic planning system, software architects, development agents, domain researchers, tax professionals, maintainers  
**Initial proving ecosystem:** Tezos  
**Initial high-priority users:** Artists, collectors, builders/platforms and other participants in crypto-native creative ecosystems  
**Long-term applicability:** General crypto-economic activity across jurisdictions

---

# 1. Executive summary

Open Crypto Tax Commons is an open-source public knowledge and software infrastructure intended to help people understand, reconstruct, document and navigate the tax consequences of crypto-economic activity.

The project originates from tax problems encountered by artists and builders in the Tezos ecosystem, but the underlying architecture MUST NOT assume that the taxpayer is always an artist or that activity is always related to NFTs.

The system MUST support people acting in multiple capacities, including:

- artist;
    
- creator;
    
- collector;
    
- investor;
    
- trader;
    
- builder;
    
- founder;
    
- employee;
    
- contractor;
    
- protocol contributor;
    
- DAO contributor;
    
- validator/baker/staker;
    
- marketplace/platform operator;
    
- business entity.
    

The project consists of four interconnected product surfaces:

1. **Public Tax Knowledge Commons**  
    A versioned, source-backed, historically accurate database of tax rules, official guidance, procedures and public cases by jurisdiction.
    
2. **Tax Tools**  
    A collection of small, focused, NFTBiker-like utilities solving concrete taxation and record-reconstruction problems.
    
3. **Private Tax Workspace**  
    A local-first environment for importing wallets/accounts, reconstructing economic activity, classifying transactions, performing valuations, applying jurisdiction rules and preparing evidence.
    
4. **Professional Review Layer**  
    Transparent exports and workflows that accountants and lawyers can inspect, reproduce, correct and use.
    

The system MUST NOT be designed primarily as a conventional “calculate my crypto taxes” application.

The core invariant is:

> Every material conclusion MUST be traceable through:
> 
> **participant → capacity → facts → raw evidence → economic event → asset/position change → valuation → applicable rule version → authoritative source**

Where cost basis is relevant:

> **→ acquisition lot → cost-basis method → disposition calculation**

The project MUST prefer a transparent `UNKNOWN` result over unsupported certainty.

---

# 2. Mission

The mission is to reduce the likelihood that people participating in crypto-native economic systems incur unexpected, incorrectly calculated or unmanageable tax liabilities because:

- legal guidance was unclear;
    
- official guidance changed;
    
- guidance did not exist at the relevant time;
    
- different official sources conflicted;
    
- a transaction was incorrectly classified;
    
- payment was received in volatile assets;
    
- records were inadequate;
    
- wallet activity was misunderstood;
    
- blockchain transfers were mistaken for taxable events;
    
- historical valuation was reconstructed incorrectly;
    
- crypto received as compensation was treated incorrectly;
    
- NFTs were incorrectly assumed to have one universal tax treatment;
    
- tax software did not understand protocol or marketplace semantics;
    
- later asset disposals were confused with original income events;
    
- cross-border obligations were missed;
    
- reporting obligations were misunderstood;
    
- the taxpayer acted in several capacities;
    
- a tax authority later reconstructed events differently;
    
- or the taxpayer lacked access to specialist advice early enough.
    

The project SHOULD be especially useful to independent creators, collectors, builders and small organizations that do not have institutional tax infrastructure.

---

# 3. Product philosophy

The project MUST NOT simply answer:

> “Your tax liability is €X.”

Instead, it SHOULD be capable of answering:

> What actually happened?

> Which economic events matter?

> Which wallet transfers appear to be self-transfers?

> What was each asset worth at the relevant moment?

> What evidence supports that valuation?

> Which rule potentially applies?

> What did that rule say at the time?

> Was that guidance actually published at the time?

> What changed later?

> Which assumptions did the software make?

> Which facts remain unknown?

> What interpretations are disputed?

> What documentation is missing?

> What should an accountant or lawyer review?

> Can every number be reproduced?

The software SHOULD behave more like an open forensic, accounting and legal-research infrastructure than a black-box tax calculator.

---

# 4. Explicit non-goals

The project MUST NOT initially:

- present itself as a tax adviser, accountant or law firm;
    
- guarantee that a tax treatment is legally correct;
    
- silently file tax returns;
    
- silently communicate with tax authorities;
    
- generate aggressive tax-avoidance strategies;
    
- infer tax residency from an IP address;
    
- infer wallet ownership without user confirmation or reliable evidence;
    
- treat AI output as legal authority;
    
- treat social-media commentary as precedent;
    
- assume current rules applied historically;
    
- assume all NFTs are treated identically;
    
- assume all crypto transfers are disposals;
    
- assume all crypto receipts are income;
    
- assume FIFO globally;
    
- require identity disclosure;
    
- store private keys;
    
- request seed phrases;
    
- centrally store users' complete financial histories by default;
    
- or become dependent on one blockchain indexer, one pricing provider or one AI provider.
    

---

# 5. Requirement terminology

**MUST / MUST NOT** — mandatory.

**SHOULD / SHOULD NOT** — strongly recommended; deviation requires justification.

**MAY** — optional.

Priority:

- **P0** — initial usable release;
    
- **P1** — first mature product generation;
    
- **P2** — later expansion.
    

---

# 6. Major product surfaces

## 6.1 Public Tax Knowledge Commons

Provides:

- jurisdiction browsing;
    
- official-source registry;
    
- historical source versions;
    
- machine-readable rules;
    
- human-readable explanations;
    
- public administrative/court cases;
    
- documented public tax disputes;
    
- rule history;
    
- source diffs;
    
- jurisdiction maturity status;
    
- public APIs.
    

No private taxpayer data is required.

---

## 6.2 Tax Tools

A collection of individually useful utilities.

Each tool SHOULD:

- solve one understandable problem;
    
- work without account creation where possible;
    
- produce useful results quickly;
    
- expose underlying evidence;
    
- compose with the private workspace;
    
- have a stable URL;
    
- be reusable as a library/component;
    
- be understandable without reading a large manual.
    

This is the primary NFTBiker-inspired product principle.

---

## 6.3 Private Tax Workspace

Provides:

- participant profile;
    
- wallet/account ownership;
    
- raw-data import;
    
- blockchain reconstruction;
    
- transaction reconciliation;
    
- economic-event normalization;
    
- user annotations;
    
- valuations;
    
- lots/positions;
    
- jurisdiction analysis;
    
- uncertainty review;
    
- evidence storage;
    
- professional exports.
    

Private financial state MUST remain local by default.

---

## 6.4 Professional Review Layer

Provides:

- accountant/lawyer review packs;
    
- calculation traceability;
    
- assumptions;
    
- evidence provenance;
    
- rule/source references;
    
- unresolved questions;
    
- corrections;
    
- reproducible analysis snapshots.
    

The project SHOULD facilitate professional review rather than attempt to eliminate professionals.

---

# 7. User classes

The system MUST support:

### U-001 — Artist / creator

### U-002 — Crypto-native artist

### U-003 — Collector

### U-004 — Private investor

### U-005 — Active trader

### U-006 — Builder / founder

### U-007 — Employee paid in crypto/tokens

### U-008 — Contractor / protocol contributor

### U-009 — DAO contributor

### U-010 — Validator / baker / staker

### U-011 — Marketplace / platform operator

### U-012 — Small crypto-native business

### U-013 — Accountant / tax adviser

### U-014 — Tax lawyer

### U-015 — Jurisdiction researcher

### U-016 — Qualified professional reviewer

### U-017 — Technical contributor

### U-018 — Policy researcher / advocate

A single participant MAY occupy multiple user roles.

---

# 8. Critical architectural invariants

## INV-001

Raw evidence and derived interpretations MUST remain separate.

## INV-002

Technical blockchain transactions and economic events MUST remain separate.

## INV-003

Economic events and tax classifications MUST remain separate.

## INV-004

A participant may act in multiple capacities.

## INV-005

Capacity may vary by event and time.

## INV-006

Tax rules MUST be temporally versioned.

## INV-007

Every material tax rule MUST cite sources.

## INV-008

Source authority MUST be explicit.

## INV-009

Legal uncertainty MUST be representable.

## INV-010

Calculations MUST be deterministic where practical.

## INV-011

AI MUST be subordinate to evidence and sources.

## INV-012

Private financial data MUST remain local by default.

## INV-013

Jurisdiction logic MUST be modular.

## INV-014

Asset legal classification may vary by jurisdiction.

## INV-015

One blockchain transaction may represent multiple economic events.

## INV-016

One economic event may be evidenced by multiple data records.

## INV-017

Tax lots and positions are distinct from raw transactions.

## INV-018

Information-reporting treatment and substantive taxation are separate.

## INV-019

The architecture MUST remain useful to people who never use NFTs.

## INV-020

Every material conclusion MUST be inspectable and reproducible.

---

# 9. Participant model

The root domain object MUST be `Participant`, not `Artist`.

```yaml
participant_id:

participant_type:
  individual
  company
  partnership
  association
  foundation
  trust
  DAO
  other

tax_residencies:

citizenships_if_relevant:

business_activities:

professional_statuses:

tax_registrations:

accounting_methods:

functional_currencies:

wallet_ownership:

exchange_accounts:

related_entities:
```

---

# 10. Capacity model

Capacity MUST be a first-class property of economic activity.

Supported initial capacities SHOULD include:

```text
ARTIST
CREATOR
COLLECTOR

PRIVATE_INVESTOR
ACTIVE_TRADER
PROFESSIONAL_TRADER

FOUNDER
EMPLOYEE
CONTRACTOR
PROTOCOL_CONTRIBUTOR
DAO_CONTRIBUTOR

MARKETPLACE_OPERATOR
TOKEN_ISSUER

VALIDATOR
BAKER
MINER
STAKER
DELEGATOR

LIQUIDITY_PROVIDER
LENDER
BORROWER

BUSINESS_OWNER

DONOR
RECIPIENT

UNKNOWN
```

Example:

```yaml
capacity:
  primary: ARTIST
  secondary:
    - SELF_EMPLOYED
```

Another event by the same user may be:

```yaml
capacity:
  primary: COLLECTOR
```

Capacity MUST be:

- user-correctable;
    
- date-sensitive;
    
- capable of remaining `UNKNOWN`;
    
- capable of carrying multiple candidate interpretations.
    

---

# 11. Entity relationship graph

The system SHOULD support relationships such as:

```text
OWNS
CONTROLS
EMPLOYED_BY
CONTRACTS_FOR
FOUNDED
DIRECTOR_OF
MEMBER_OF
CONTRIBUTES_TO
BENEFICIARY_OF
WALLET_OWNED_BY
ACCOUNT_OWNED_BY
```

Example:

```text
Individual
├── owns Company A
├── founded Project B
├── controls Wallet 1
└── personally controls Wallet 2

Company A
└── controls Wallet 3
```

This distinction is necessary when the same human participates personally and through entities.

---

# 12. Raw evidence layer

Raw evidence MUST be stored separately from normalized interpretation.

Supported evidence types SHOULD include:

- blockchain operation;
    
- marketplace transaction;
    
- exchange export;
    
- bank record;
    
- payment-processor record;
    
- invoice;
    
- gallery statement;
    
- contract;
    
- grant document;
    
- token allocation agreement;
    
- vesting schedule;
    
- accounting CSV;
    
- manual user record.
    

Each record SHOULD support:

```yaml
evidence_id:
evidence_type:
source_system:
source_identifier:
timestamp:
raw_payload_ref:
content_hash:
imported_at:
```

Imported raw evidence SHOULD be immutable.

Corrections SHOULD occur through annotations or derived records.

---

# 13. Universal economic model

Use three layers:

```text
RAW / TECHNICAL TRANSACTION
          ↓
     ECONOMIC LEGS
          ↓
     SEMANTIC EVENT
```

Tax treatment is applied afterward.

---

# 14. Economic leg model

```yaml
leg_id:
event_id:

from_party:
to_party:

asset:
quantity:

direction:
  inbound
  outbound

economic_character:
  consideration
  transfer
  fee
  royalty
  reward
  collateral
  loan_principal
  repayment
  interest
  compensation
  distribution
  grant
  gift
  unknown

timestamp:
source_evidence:
valuation_ref:
```

A semantic event MAY contain multiple legs.

---

# 15. Semantic event model

Core events SHOULD include:

## General acquisition/disposal

```text
ASSET_PURCHASE
ASSET_SALE
ASSET_EXCHANGE
ASSET_TRANSFER
SELF_TRANSFER
GIFT
DONATION
BARTER
LOSS
THEFT
BURN
REFUND
```

## Artistic activity

```text
ART_PRIMARY_SALE
ART_SECONDARY_SALE
COMMISSION_INCOME
ROYALTY_RECEIPT
LICENCE_INCOME
COPYRIGHT_ASSIGNMENT
GALLERY_CONSIGNMENT
GALLERY_SETTLEMENT
GRANT
PRIZE
PATRONAGE
COLLABORATION_SPLIT
```

## NFT activity

```text
NFT_MINT
NFT_PURCHASE
NFT_SALE
NFT_TRANSFER
NFT_ROYALTY
NFT_GIFT
NFT_DONATION
NFT_BURN
NFT_REDEMPTION
```

## Compensation/builders

```text
SALARY_PAYMENT
CONTRACTOR_PAYMENT
FOUNDER_COMPENSATION
TOKEN_COMPENSATION
TOKEN_GRANT
TOKEN_VESTING
TOKEN_UNLOCK
BOUNTY
DAO_COMPENSATION
FOUNDER_ALLOCATION
TEAM_ALLOCATION
```

## Basic crypto

```text
CRYPTO_RECEIPT
CRYPTO_PURCHASE
CRYPTO_SALE
CRYPTO_SWAP
CRYPTO_PAYMENT
AIRDROP
FORK_RECEIPT
```

## Protocol activity

```text
MINING_REWARD
VALIDATOR_REWARD
BAKING_REWARD
STAKING_REWARD
DELEGATION_REWARD

LIQUIDITY_DEPOSIT
LIQUIDITY_WITHDRAWAL
LIQUIDITY_REWARD

LENDING_DEPOSIT
LOAN_ADVANCE
LOAN_REPAYMENT
INTEREST_RECEIPT
INTEREST_PAYMENT

COLLATERAL_DEPOSIT
COLLATERAL_RELEASE
LIQUIDATION

WRAP
UNWRAP
BRIDGE_DEPOSIT
BRIDGE_WITHDRAWAL
```

## Trading

```text
SPOT_TRADE
DERIVATIVE_OPEN
DERIVATIVE_CLOSE
OPTION_EXERCISE
OPTION_EXPIRY
PERPETUAL_FUNDING
```

Complex protocol support MAY remain incomplete during P0, but the schema MUST allow these concepts.

---

# 16. Normalized event record

```yaml
event_id:
event_type:

occurred_at_utc:
occurred_at_local:
timezone:

participant:
capacity:

counterparties:

assets_given:
assets_received:

gross_amount:
fees:
royalties:
commissions:
net_amount:

jurisdiction_facts:

source_evidence:

user_annotations:

classification:
classification_source:
classification_confidence:

created_at:
schema_version:
```

Each derived fact SHOULD carry status:

```text
OBSERVED
IMPORTED
USER_CONFIRMED
INFERRED
ESTIMATED
UNKNOWN
```

---

# 17. Asset model

```yaml
asset_id:
asset_type:

native_chain:
contract:
token_id:

fungibility:
  fungible
  nonfungible
  semi_fungible

economic_category:
  fiat
  cryptocurrency
  stablecoin
  governance_token
  utility_token
  nft
  wrapped_asset
  staking_receipt
  liquidity_position
  derivative
  tokenized_real_world_asset
  physical_asset
  intellectual_property
  other

underlying_assets:

issuer:
decimals:

price_sources:

classification_status:
```

Legal classification MUST remain jurisdiction-specific.

---

# 18. Artwork and rights extension

The artist domain package MUST model artwork separately from payment/token mechanics.

```yaml
artwork_id:
title:
creator_ids:

medium:
physical_or_digital:

edition_size:
creation_date:

copyright_owner:

rights_transferred:
licence_terms:
commercial_rights:
reproduction_rights:

tokenized:
token_contract:
token_id:

associated_physical_object:
```

The system MUST NOT assume NFT ownership transfers copyright.

---

# 19. Token compensation rights

The system SHOULD distinguish:

```text
TOKEN_OPTION
TOKEN_WARRANT
RESTRICTED_TOKEN
VESTING_TOKEN
LOCKED_TOKEN
SAFT_OR_SIMILAR_RIGHT
OTHER_CONTINGENT_RIGHT
```

Separate events MUST be available for:

```text
right granted
right vested
token delivered
token unlocked
token sold
```

These MUST NOT be automatically collapsed.

---

# 20. Position model

For DeFi, vesting and similar activities:

```yaml
position_id:
participant:

protocol:
position_type:
  liquidity
  lending
  borrowing
  staking
  collateral
  derivative
  vesting
  other

assets_deposited:
assets_received:

opened_at:
closed_at:

source_events:
```

---

# 21. Tax-lot engine

The core MUST support acquisition lots.

```yaml
lot_id:
asset:
quantity_original:
quantity_remaining:

acquired_at:
acquisition_event:

cost_basis:
cost_basis_currency:

valuation_ref:

holding_period_start:

owner:
```

Jurisdiction-selectable accounting methods MUST include where appropriate:

```text
FIFO
LIFO
HIFO
SPECIFIC_IDENTIFICATION
AVERAGE_COST
POOLING
OTHER
```

The engine MUST NOT assume FIFO globally.

---

# 22. Jurisdiction architecture

Jurisdiction packs MUST support nesting:

```text
EU
└── France

US
├── Federal
├── California
└── New York

Canada
├── Federal
└── Quebec
```

Schema:

```yaml
jurisdiction_id:
name:
parent_jurisdiction:
jurisdiction_type:
currency:
official_languages:
tax_year_convention:
timezone_reference:
supported_tax_domains:
effective_from:
effective_to:
maintainers:
review_status:
last_source_verification:
```

Supported jurisdiction types:

- supranational;
    
- national;
    
- federal;
    
- state;
    
- province;
    
- canton;
    
- local;
    
- treaty/cross-border.
    

---

# 23. Initial jurisdiction priorities

## P0

- France
    
- EU dependencies required by France
    

## P1

- United States federal
    
- United Kingdom
    
- Germany
    
- Canada federal
    
- Singapore
    
- broader EU rules
    

The architecture MUST allow arbitrary future packs.

---

# 24. Tax-domain model

Jurisdiction packs MUST be capable of representing:

- personal income tax;
    
- professional/business income;
    
- corporation tax;
    
- capital gains;
    
- VAT;
    
- GST/HST;
    
- sales/use taxes;
    
- social-security contributions;
    
- artist-specific social regimes;
    
- self-employment contributions;
    
- withholding;
    
- business-registration obligations;
    
- reporting obligations;
    
- crypto reporting;
    
- foreign-asset reporting;
    
- deductible expenses;
    
- tax-lot/accounting rules;
    
- recordkeeping;
    
- filing;
    
- corrections;
    
- voluntary disclosure;
    
- audit procedure;
    
- administrative appeals;
    
- payment/collection;
    
- court deadlines.
    

Unsupported domains MUST be explicitly identified as unsupported.

---

# 25. Source registry

Each legal source MUST have a stable identifier.

```yaml
source_id:

jurisdiction_id:
issuing_authority:

source_type:
authority_level:

title:
canonical_reference:

original_language:

publication_date:
effective_from:
effective_to:
repealed_at:

retrieved_at:

canonical_url:
archive_reference:

content_hash:

supersedes:
superseded_by:

notes:
```

Supported types:

```text
STATUTE
REGULATION
TREATY
COURT_DECISION
ADMINISTRATIVE_RULING
ADMINISTRATIVE_GUIDANCE
OFFICIAL_MANUAL
OFFICIAL_FAQ
FORM
FORM_INSTRUCTIONS
OFFICIAL_NOTICE
LEGISLATIVE_HISTORY
GOVERNMENT_REPORT

PROFESSIONAL_GUIDANCE
ACADEMIC_ANALYSIS
SECONDARY_COMMENTARY

PUBLIC_FIRST_PERSON_CASE
NEWS_REPORT
OTHER
```

---

# 26. Source authority

Every jurisdiction MUST define source hierarchy.

The system MUST distinguish, for example:

- legislation;
    
- binding doctrine;
    
- administrative guidance;
    
- official FAQ;
    
- professional guidance;
    
- commentary.
    

An official-looking page MUST NOT automatically be treated as binding tax doctrine.

This distinction MUST be visible to users.

---

# 27. Temporal legal model

For every material rule distinguish:

### Transaction applicability

When the rule applies economically.

### Publication availability

When the guidance became public.

### Repository observation

When the project captured it.

A statement published in 2026 that discusses 2021 MUST NOT be represented as guidance available to taxpayers in 2021.

Historical source state is a fundamental requirement.

---

# 28. Source preservation

Where legally permissible the project SHOULD preserve:

- metadata;
    
- identifiers;
    
- URL;
    
- publication date;
    
- effective dates;
    
- archived version;
    
- content hash;
    
- predecessor/successor relationships;
    
- extracted structured information;
    
- permitted excerpts.
    

Current text MUST NOT overwrite historical text.

---

# 29. Rule schema

```yaml
rule_id:

jurisdiction_id:
tax_domain:

title:

applies_to:
  participant_types:
  capacities:
  event_types:
  asset_types:

conditions:

effects:
  classification:
  valuation_rule:
  reporting_rule:
  tax_base_rule:
  calculation_rule:

effective_from:
effective_to:

published_from:

sources:

authority_status:

certainty:
  level:
  reason:

supersedes:
superseded_by:

review:
  status:
  reviewer:
  reviewed_at:

test_cases:
```

---

# 30. Rule certainty

Use:

```text
AUTHORITATIVE_CLEAR
AUTHORITATIVE_INTERPRETIVE
EXPERT_INTERPRETATION
AMBIGUOUS
CONFLICTING_AUTHORITIES
UNSETTLED
UNKNOWN
```

This MUST describe legal/source certainty, not LLM confidence.

---

# 31. Review status

Rules and jurisdiction packs SHOULD expose:

```text
EXPERT_REVIEWED
SOURCE_VERIFIED
COMMUNITY_DRAFT
STALE
DISPUTED
```

Expert-reviewed material SHOULD record reviewer qualification, review date and scope.

---

# 32. Source monitoring

Automated tooling SHOULD:

- monitor official pages;
    
- compare hashes;
    
- detect source changes;
    
- detect dead links;
    
- detect new official publications;
    
- detect superseding materials;
    
- create review issues.
    

A changed source MUST NOT silently modify an approved rule.

Workflow:

```text
SOURCE CHANGE
     ↓
SOURCE DIFF
     ↓
CANDIDATE RULE UPDATE
     ↓
REVIEW
     ↓
NEW VERSION
```

---

# 33. Public case database

The project SHOULD include public cases involving:

- artists;
    
- collectors;
    
- builders;
    
- platforms;
    
- crypto companies;
    
- traders;
    
- protocol participants.
    

Case schema:

```yaml
case_id:
subject:
subject_type:

jurisdiction:
tax_years:

issues:

known_facts:
unknown_facts:

procedural_status:
outcome:

sources:

precedential_status:
  binding
  persuasive
  administrative
  settlement
  allegation_only
  anecdotal

research_status:

public_information_only: true
```

Social-media claims MAY be recorded as public case evidence but MUST NOT be treated as precedent.

---

# 34. Public case research principle

Every case MUST separate:

```text
KNOWN
INFERRED
CLAIMED
UNKNOWN
```

The system MUST NOT manufacture similarities between cases.

A case such as a public dispute involving an artist and another involving a platform MAY be linked under a research topic without claiming they involve identical legal issues.

---

# 35. Valuation engine

Valuation MUST be a standalone subsystem.

Support:

- fiat/fiat;
    
- crypto/fiat;
    
- crypto/crypto;
    
- exact timestamp valuation;
    
- nearest-trade valuation;
    
- daily valuation;
    
- marketplace transaction valuation;
    
- professional/user-supplied valuation;
    
- multiple price providers;
    
- fallback chains.
    

Schema:

```yaml
valuation_id:

asset:
quantity:

timestamp:

target_currency:

unit_price:
total_value:

provider:
provider_market:

method:
time_resolution:

raw_source_reference:

fallback_used:
confidence:

generated_at:
```

The engine MUST NOT silently invent prices.

---

# 36. Multi-source valuation

Users SHOULD be able to compare:

```text
Provider A       €0.91
Provider B       €0.93
Provider C       €0.90

selected method:
Provider B / nearest trade

spread:
3.3%
```

This is particularly important for volatile or thinly traded assets.

---

# 37. Valuation reproducibility

An analysis snapshot MUST record:

- provider;
    
- provider data reference;
    
- method;
    
- timestamp;
    
- application version;
    
- price;
    
- currency.
    

Where practical, historical provider responses SHOULD be hashable or snapshot-capable.

---

# 38. Blockchain adapter architecture

Core logic MUST be chain-neutral.

Adapters MUST provide:

```text
raw chain data
       ↓
standard technical transaction representation
       ↓
semantic decoding
```

Initial priority:

### P0

- generic CSV
    
- Tezos
    

### P1

- EVM
    
- Solana
    
- additional relevant chains
    

---

# 39. Tezos-first implementation

Tezos is the first full proving ground.

Tezos support SHOULD include:

- public wallet history;
    
- tez transfers;
    
- FA1.2 assets;
    
- FA2 assets;
    
- NFTs;
    
- contract interactions;
    
- marketplace transactions;
    
- minting;
    
- burning;
    
- primary sales;
    
- secondary sales;
    
- royalties;
    
- platform fees;
    
- creator splits;
    
- self-transfers;
    
- baker/staking rewards;
    
- multiple owned wallets;
    
- historical balance reconstruction;
    
- transaction hash preservation;
    
- block timestamp preservation.
    

Data-provider integration MUST be abstracted.

TzKT MAY be the preferred initial source but MUST NOT be hard-wired as the only possible provider.

---

# 40. Marketplace adapters

Marketplace semantics SHOULD exist as separate adapters.

Examples MAY include Tezos-native art marketplaces.

An adapter SHOULD decode:

```text
buyer
seller
artist
gross price
marketplace fee
royalty
referral fee
asset transferred
timestamp
transaction hashes
```

Generic blockchain evidence MUST remain available underneath marketplace interpretations.

---

# 41. Generic import system

Support:

- generic CSV;
    
- exchange CSV;
    
- accounting exports;
    
- bank exports;
    
- payment processor exports;
    
- marketplace exports;
    
- gallery statements.
    

Every importer SHOULD emit normalized raw evidence rather than directly creating tax outcomes.

---

# 42. Reconciliation engine

The system MUST handle duplicate representations.

Example:

```text
marketplace API record
+
blockchain operation
+
exchange record
```

may describe overlapping economic activity.

The reconciliation engine SHOULD:

- suggest matches;
    
- expose confidence;
    
- permit user confirmation;
    
- permit rejection;
    
- preserve all source evidence.
    

---

# 43. Wallet ownership

Support:

```text
USER_PERSONAL
USER_BUSINESS
USER_CONTROLLED_ENTITY
COLLABORATOR
MARKETPLACE
CUSTOMER
PROTOCOL
UNKNOWN
```

Transfers among confirmed user-owned wallets MUST NOT automatically be treated as disposals.

Ownership mappings MUST remain private by default.

---

# 44. Tax Tools product surface

The project MUST include a dedicated Tax Tools surface.

The Tax Tools surface MUST NOT require users to complete the full private-workspace setup before receiving value.

Tools SHOULD function independently where practical.

The design philosophy is:

> one concrete question → one focused tool → inspectable result

---

# 45. P0 Tax Tools

## TOOL-001 — Wallet Tax Timeline

Input:

- public wallet address;
    
- optional date range.
    

Output:

- economically meaningful activity grouped chronologically and by tax year;
    
- totals;
    
- unresolved activity;
    
- links to evidence.
    

The timeline MUST distinguish raw transfers from interpreted events.

---

## TOOL-002 — Historical Asset Valuator

Input:

- transaction hash;
    
- block;
    
- timestamp;
    
- asset;
    
- quantity.
    

Output:

- historical value in selected fiat;
    
- provider;
    
- methodology;
    
- timestamp resolution;
    
- alternative valuations if available.
    

The result SHOULD be shareable without exposing unrelated wallet history.

---

## TOOL-003 — Tezos Transaction Explainer

Input:

- operation hash / transaction.
    

Output example:

```text
OBJKT secondary sale

Collector paid:          100 XTZ
Seller received:        87.5 XTZ
Creator royalty:          10 XTZ
Marketplace fee:         2.5 XTZ

Timestamp:
Block:
Historical EUR value:
Evidence:
```

It MUST distinguish economic interpretation from tax treatment.

---

## TOOL-004 — NFT Sale / Purchase Reconstructor

Input:

- NFT identifier;
    
- wallet;
    
- transaction.
    

Output:

- acquisition;
    
- disposal;
    
- gross consideration;
    
- marketplace fees;
    
- royalties;
    
- relevant payment asset;
    
- contemporaneous fiat valuation.
    

---

## TOOL-005 — Artist Revenue Explorer

Input:

- artist wallet(s);
    
- period.
    

Output categories SHOULD include:

- primary sales;
    
- royalties;
    
- commissions;
    
- collaboration splits;
    
- grants;
    
- gifts;
    
- unknown receipts;
    
- self-transfers.
    

The tool MUST NOT automatically call all receipts taxable income.

---

## TOOL-006 — Collector Activity Explorer

Output SHOULD identify:

- acquisitions;
    
- disposals;
    
- gifts;
    
- transfers;
    
- fees;
    
- acquisition values;
    
- disposal values;
    
- potential cost-basis chains.
    

---

## TOOL-007 — Linked Wallet / Self-Transfer Mapper

Users mark multiple wallets as belonging to themselves or related entities.

The tool identifies likely internal transfers.

It MUST require user confirmation before ownership relationships become authoritative.

---

## TOOL-008 — Transaction Tagger

Allow manual/bulk categorization:

```text
art income
royalty
purchase
sale
self transfer
gift
compensation
staking reward
fee
loan
unknown
```

Original evidence MUST remain unchanged.

---

## TOOL-009 — Tax Data Health Check

Example output:

```text
4,921 events analyzed

4,808 classified
63 missing reliable valuation
31 suspected duplicate records
12 unresolved counterparties
7 probable self-transfers
4 ambiguous marketplace interactions
```

The tool SHOULD prioritize problems by materiality.

---

## TOOL-010 — Guidance Time Machine

Input:

```text
jurisdiction
activity
date / tax year
```

Example:

```text
France
NFT artist
2021
```

Output:

- official sources available by that date;
    
- rules applicable at that date;
    
- later publications shown separately;
    
- unresolved gaps;
    
- source authority.
    

---

## TOOL-011 — Rule Diff

Input:

- jurisdiction;
    
- topic;
    
- date A;
    
- date B.
    

Output:

- changed source language;
    
- changed rule version;
    
- changed thresholds;
    
- newly issued guidance;
    
- resolved/unresolved ambiguity.
    

---

## TOOL-012 — Evidence Pack Generator

Generate an inspectable package containing:

- chronology;
    
- transaction references;
    
- valuations;
    
- evidence provenance;
    
- classifications;
    
- assumptions;
    
- uncertainties;
    
- relevant rules;
    
- sources;
    
- calculation tables.
    

---

## TOOL-013 — External Tax Software Exporter

Export normalized activity for use in third-party systems.

Initial output SHOULD include robust generic CSV.

Vendor-specific mappings MAY later support major tax-accounting products.

The system SHOULD complement existing tax software when replacement is unnecessary.

---

# 46. P1 Tax Tools

Potential P1 tools:

### Portfolio Cost Basis Explorer

Trace asset lots and disposal matching.

### Crypto Income Explorer

Separate compensation, rewards, business receipts and transfers.

### Builder Compensation Timeline

Display grant → vest → receipt → unlock → sale.

### Staking/Baking Explorer

Reconstruct rewards and subsequent asset history.

### Tax-Lot Visualizer

Show exactly which acquisition lots feed each disposal.

### Marketplace Reconciliation Tool

Compare blockchain evidence against marketplace records.

### Missing Records Detector

Identify gaps in invoices, valuations or ownership classifications.

### Tax Authority Report Reconciler

Compare user history against known third-party reporting data.

### Cross-Jurisdiction Activity Explorer

Identify transactions potentially touching multiple jurisdictions.

### Tax Letter Deadline Navigator

Analyze document type and public procedural deadlines.

---

# 47. Tax Tools UX requirements

Every tool SHOULD:

- have a clear single purpose;
    
- accept minimal input;
    
- avoid mandatory registration;
    
- preserve state locally;
    
- provide evidence links;
    
- display assumptions;
    
- allow CSV/JSON export;
    
- expose source data where lawful;
    
- provide copyable/shareable summaries;
    
- avoid legal jargon where possible.
    

Tools MAY link into deeper private analysis:

> Open this result in Workspace

without requiring that users start there.

---

# 48. Tool composability

Tools MUST reuse common internal packages.

Example:

```text
Historical Valuator
        │
        └── valuation engine

Wallet Timeline
        │
        ├── Tezos adapter
        ├── semantic events
        └── valuation engine

Evidence Pack
        │
        ├── event engine
        ├── rule engine
        ├── valuation engine
        └── source registry
```

Independent tools MUST NOT implement conflicting duplicate tax logic.

---

# 49. Public API for tools

Reusable APIs/libraries SHOULD enable third parties to build additional tools.

Potential operations:

```text
decode transaction
normalize wallet history
historical valuation
identify self transfers
query rules
query rules as-of date
retrieve source
retrieve source history
calculate tax lots
explain finding
```

---

# 50. Tax Situation Explorer

The private workspace SHOULD provide a guided analysis workflow.

Ask facts, not tax jargon.

Example:

```text
Where were you tax resident?

Were you acting personally or through an entity?

What activities did you perform?

Did you create/sell art?

Did you collect art?

Were you paid in cryptocurrency?

Did you later sell or swap those assets?

Did you receive tokens for work?

Did you stake/bake?

Which wallets/accounts belong to you?

Which tax period should be analyzed?
```

---

# 51. Finding format

```yaml
finding_id:

participant:
capacity:

event_refs:
rule_refs:
source_refs:

jurisdiction:

issue:

status:
  relevant
  potentially_relevant
  not_relevant
  unknown

calculation:

assumptions:

missing_facts:

valuation_refs:

certainty:

explanation:

professional_review_recommended:

generated_at:
engine_version:
rule_pack_version:
```

---

# 52. Explainability

Each material finding MUST support:

```text
FACTS
  ↓
RAW EVIDENCE
  ↓
ECONOMIC EVENT
  ↓
CAPACITY
  ↓
VALUATION
  ↓
ASSET LOT/POSITION
  ↓
RULE
  ↓
SOURCE
  ↓
CALCULATION
  ↓
RESULT / UNCERTAINTY
```

The system MUST NOT require trust in hidden model reasoning.

---

# 53. “Before I do this…” tool

A P1 tool SHOULD answer prospective questions.

Example:

> I am a French artist about to sell work for 100,000 XTZ.

Output SHOULD emphasize:

- records to preserve;
    
- timestamp;
    
- valuation evidence;
    
- invoice;
    
- buyer/customer facts potentially required;
    
- rights transferred;
    
- relevant registrations;
    
- marketplace records;
    
- subsequent asset tracking;
    
- questions for a tax professional.
    

The tool SHOULD prevent future recordkeeping failures.

---

# 54. Recordkeeping assistant

The system SHOULD flag:

```text
transaction found

missing:
- invoice
- customer-location evidence
- contemporaneous fiat value
- contract/rights documentation
```

It SHOULD operate both prospectively and retrospectively.

---

# 55. Audit and dispute support

The project MUST NOT become a litigation bot.

However, it SHOULD support forensic reconstruction.

A future audit module MAY include:

- tax-document identification;
    
- chronology;
    
- response deadlines;
    
- public procedural rights;
    
- requested information checklist;
    
- assessment reconstruction;
    
- alternative calculation;
    
- evidence gap analysis.
    

The interface MUST distinguish:

```text
CORRECTING A PRIOR TAXPAYER ERROR
```

from:

```text
CHALLENGING A TAX-AUTHORITY POSITION
```

---

# 56. Information reporting

A separate reporting layer SHOULD eventually model:

- exchange reporting;
    
- employer reporting;
    
- CARF;
    
- DAC8;
    
- CRS-related interfaces where relevant;
    
- jurisdiction-specific crypto information returns.
    

Core principle:

```text
REPORTABLE ≠ TAXABLE
```

and:

```text
NOT REPORTED ≠ NOT TAXABLE
```

---

# 57. Reporting rule schema

```yaml
reporting_rule_id:
jurisdiction:

framework:

reporting_party:
reported_person:

event_types:

reported_fields:

reporting_period:

effective_from:
effective_to:

sources:
```

---

# 58. Reporting reconciliation

The system SHOULD eventually compare:

```text
participant reconstructed ledger
```

with:

```text
potential third-party reporting
```

and identify mismatches.

It MUST NOT assume the external report is necessarily correct.

---

# 59. AI architecture

Required conceptual architecture:

```text
AUTHORITATIVE SOURCES
        ↓
SOURCE INGESTION
        ↓
STRUCTURED RULES
        ↓
DETERMINISTIC EVENT / VALUATION / LOT ENGINE
        ↓
STRUCTURED FINDINGS
        ↓
AI EXPLANATION / RESEARCH / RED TEAM
        ↓
USER
```

Forbidden architecture:

```text
USER
 ↓
LLM
 ↓
UNSOURCED TAX ANSWER
```

---

# 60. Permitted AI functions

AI MAY:

- summarize sources;
    
- extract candidate rules;
    
- compare source revisions;
    
- translate sources;
    
- identify potentially relevant rules;
    
- propose event classifications;
    
- identify missing facts;
    
- explain calculations;
    
- explain terminology;
    
- generate accountant questions;
    
- identify anomalies;
    
- cluster activity;
    
- search public knowledge;
    
- build factual chronologies;
    
- red-team conclusions;
    
- propose rule updates for human review.
    

---

# 61. AI restrictions

AI MUST NOT:

- create authoritative rules without sources;
    
- fabricate citations;
    
- silently infer residency;
    
- silently infer wallet ownership;
    
- silently decide business/private capacity;
    
- silently choose disputed legal interpretation;
    
- silently choose valuation methodology;
    
- modify approved jurisdiction packs autonomously;
    
- override deterministic results invisibly.
    

---

# 62. AI uncertainty

Candidate classifications MAY use model confidence:

```text
Possible NFT primary sale
classification confidence: 91%
```

But this MUST remain distinct from legal certainty.

User confirmation SHOULD promote factual classifications.

---

# 63. AI red-team mode

AI SHOULD identify:

- contrary authority;
    
- alternate event classifications;
    
- valuation weaknesses;
    
- unsupported assumptions;
    
- missing facts;
    
- adverse interpretations;
    
- calculation inconsistencies.
    

Outputs SHOULD show both favorable and unfavorable reasoning.

---

# 64. AI source grounding

Material factual/legal AI claims MUST cite repository sources.

If sufficient verified sources do not exist:

```text
INSUFFICIENT VERIFIED SOURCE MATERIAL
```

is the correct outcome.

---

# 65. AI source-ingestion security

All imported content MUST be treated as untrusted data.

Instructions contained within:

- websites;
    
- PDFs;
    
- CSV fields;
    
- token metadata;
    
- transaction memo fields;
    
- NFT metadata;
    

MUST NOT be treated as system instructions.

---

# 66. Local-first privacy

Private user data MUST remain local by default.

Core analysis MUST NOT require an account.

Possible storage:

- browser local database;
    
- desktop local database;
    
- encrypted local project file.
    

Optional cloud synchronization MAY be added later only as opt-in.

---

# 67. Sensitive data

Sensitive project data includes:

- identity;
    
- wallet ownership;
    
- tax residency;
    
- income;
    
- trading history;
    
- entity ownership;
    
- vesting schedules;
    
- token allocations;
    
- exchange accounts;
    
- tax liabilities;
    
- uploaded correspondence.
    

Such data MUST NOT be sent to remote infrastructure without explicit user action.

---

# 68. Private-key prohibition

The application MUST NEVER request:

- private keys;
    
- seed phrases;
    
- recovery phrases.
    

Wallet connection MUST use public addresses or safe signed authentication where appropriate.

---

# 69. Cloud AI privacy

If private financial data is sent to a cloud AI provider:

- explicit user consent MUST be obtained;
    
- data scope MUST be shown;
    
- provider transmission MUST be disclosed.
    

The architecture SHOULD permit:

- local models;
    
- redacted queries;
    
- metadata-only queries.
    

---

# 70. Telemetry

Telemetry MUST NOT include:

- wallet addresses;
    
- transaction hashes;
    
- names;
    
- income amounts;
    
- tax IDs;
    
- account numbers;
    
- tax calculations;
    
- uploaded financial documents.
    

---

# 71. Professional review pack

Export SHOULD contain:

```text
1. participant/entity profile
2. residency chronology
3. activity/capacity chronology
4. wallet/account ownership map
5. normalized ledger
6. asset inventory
7. tax lots
8. positions
9. valuations
10. findings
11. rules
12. source references
13. assumptions
14. unresolved questions
15. missing evidence
16. calculation methodology
```

Facts and interpretations MUST be visibly separate.

---

# 72. Third-party interoperability

The project SHOULD integrate with the broader tax ecosystem rather than assume all users will replace existing software.

Support SHOULD include:

- normalized CSV export;
    
- structured JSON;
    
- lot reports;
    
- transaction classifications;
    
- valuation exports.
    

Vendor-specific exporters MAY support major accounting/tax platforms.

These integrations MUST remain optional.

---

# 73. Knowledge API

Public API SHOULD support:

```text
list jurisdictions
retrieve jurisdiction
retrieve source
retrieve source history
retrieve rule
query rules by date
query rules by event
retrieve scenario
retrieve public case
retrieve jurisdiction maturity
```

---

# 74. Core analysis library

Core engine SHOULD be UI-independent.

Input:

```text
participant facts
+
normalized events
+
valuation data
+
lots/positions
+
jurisdiction packs
+
analysis date
```

Output:

```text
structured findings
```

---

# 75. CLI

CLI SHOULD eventually support:

```text
validate-source
validate-rule
validate-jurisdiction

import
normalize
reconcile
value
lots
analyze

explain
export

source-diff
rule-diff
run-tests
```

This is especially important for agentic development and automated jurisdiction contributions.

---

# 76. Scenario library

Scenarios MUST be separate from jurisdiction rules.

Initial scenarios:

## Artists

- direct physical sale;
    
- gallery sale;
    
- commission;
    
- licensing;
    
- royalty;
    
- grant;
    
- collaboration;
    
- NFT primary sale;
    
- NFT secondary royalty;
    
- crypto payment;
    
- international buyer.
    

## Collectors

- NFT purchase;
    
- NFT sale;
    
- art purchase with crypto;
    
- gift;
    
- donation;
    
- frequent trading.
    

## Builders

- salary paid in tokens;
    
- contractor compensation;
    
- founder allocation;
    
- token vesting;
    
- token unlock;
    
- bounty;
    
- DAO compensation.
    

## Crypto

- fiat purchase;
    
- crypto sale;
    
- crypto swap;
    
- self-transfer;
    
- staking;
    
- baking;
    
- airdrop;
    
- bridge;
    
- wrap;
    
- lending.
    

Each scenario MUST define factual questions needed for analysis.

---

# 77. Jurisdiction maturity

Packs SHOULD move through:

```text
LEVEL 0 — Skeleton
LEVEL 1 — Sources indexed
LEVEL 2 — Human-readable explanation
LEVEL 3 — Machine-readable rules
LEVEL 4 — Deterministic analysis
LEVEL 5 — Expert reviewed
LEVEL 6 — Continuous monitoring
```

The UI MUST expose maturity.

---

# 78. France P0 pack

France SHOULD be the first full jurisdiction implementation.

It SHOULD cover at minimum:

- professional income;
    
- BNC issues;
    
- artist-author issues;
    
- crypto compensation;
    
- non-cash professional receipts;
    
- crypto disposal;
    
- NFT sales;
    
- NFT royalties;
    
- VAT;
    
- digital-art VAT considerations;
    
- rights/licensing distinctions;
    
- social contributions;
    
- filing;
    
- recordkeeping;
    
- correction mechanisms;
    
- audit procedure;
    
- administrative review;
    
- payment/collection procedures.
    

Historical gaps in NFT guidance MUST be explicit.

---

# 79. EU dependency pack

Model separately where applicable:

- VAT;
    
- place of supply;
    
- digital/electronic services;
    
- B2B/B2C distinctions;
    
- cross-border reporting;
    
- relevant supranational rules.
    

National packs SHOULD reference shared EU rules rather than duplicate them where feasible.

---

# 80. Source-driven search

Users SHOULD be able to search:

```text
France NFT VAT 2021
France Tezos artist crypto income
Germany NFT collector 2024
US tokens received for development work
```

Results SHOULD prioritize:

1. primary sources;
    
2. applicable historical versions;
    
3. expert-reviewed interpretation;
    
4. source-verified summaries;
    
5. community content.
    

---

# 81. Date-sensitive search

Every search interface SHOULD support:

```text
AS OF YYYY-MM-DD
```

Results MUST indicate whether a source:

- existed on that date;
    
- was published later;
    
- was superseded;
    
- applies retrospectively;
    
- or was unavailable.
    

---

# 82. “What changed?” functionality

A tool SHOULD answer:

> What changed in the French treatment/guidance for this activity between 2021 and 2026?

It MUST derive the response from source/rule history.

---

# 83. Public repository structure

Recommended conceptual structure:

```text
open-crypto-tax-commons/
│
├── README.md
├── LICENSE
├── CONTRIBUTING.md
├── GOVERNANCE.md
├── SECURITY.md
├── PRIVACY.md
├── DISCLAIMER.md
├── CODE_OF_CONDUCT.md
│
├── docs/
│
├── schemas/
│   ├── participant/
│   ├── entity/
│   ├── evidence/
│   ├── event/
│   ├── asset/
│   ├── position/
│   ├── valuation/
│   ├── source/
│   ├── rule/
│   ├── jurisdiction/
│   ├── scenario/
│   ├── case/
│   └── finding/
│
├── jurisdictions/
│   ├── eu/
│   ├── france/
│   ├── united-states/
│   ├── united-kingdom/
│   ├── germany/
│   ├── canada/
│   └── singapore/
│
├── scenarios/
│
├── cases/
│
├── packages/
│   ├── core/
│   ├── evidence/
│   ├── event-engine/
│   ├── rules-engine/
│   ├── source-registry/
│   ├── valuation/
│   ├── lots/
│   ├── positions/
│   ├── reconciliation/
│   ├── ai/
│   └── exporters/
│
├── adapters/
│   ├── tezos/
│   ├── evm/
│   ├── solana/
│   ├── csv/
│   ├── exchanges/
│   └── marketplaces/
│
├── domain-packs/
│   ├── artists/
│   ├── collectors/
│   ├── builders/
│   └── crypto/
│
├── apps/
│   ├── public-web/
│   ├── workspace/
│   └── cli/
│
├── tools/
│   ├── wallet-tax-timeline/
│   ├── historical-valuator/
│   ├── transaction-explainer/
│   ├── nft-reconstructor/
│   ├── artist-revenue/
│   ├── collector-explorer/
│   ├── wallet-mapper/
│   ├── transaction-tagger/
│   ├── data-health/
│   ├── guidance-time-machine/
│   ├── rule-diff/
│   └── evidence-pack/
│
└── tests/
    ├── synthetic-ledgers/
    ├── jurisdiction/
    ├── valuation/
    ├── rules/
    ├── adapters/
    └── regression/
```

The planner MAY alter physical layout while preserving boundaries.

---

# 84. Contribution requirements

A rule contribution MUST include:

- jurisdiction;
    
- tax domain;
    
- event/capacity applicability;
    
- affected period;
    
- authoritative source;
    
- source publication date;
    
- effective date;
    
- interpretation;
    
- confidence;
    
- test scenarios;
    
- contributor;
    
- review status.
    

Unsourced material rules MUST NOT be promoted into verified packs.

---

# 85. Automated CI validation

CI MUST validate:

- schemas;
    
- unique IDs;
    
- source references;
    
- temporal ranges;
    
- missing publication/effective dates;
    
- broken internal links;
    
- rule tests;
    
- source references;
    
- jurisdiction IDs;
    
- unsupported versions.
    

CI SHOULD detect stale external sources.

---

# 86. Rule testing

Each deterministic rule SHOULD include:

- positive case;
    
- negative case;
    
- boundary date;
    
- threshold boundary;
    
- missing-fact case;
    
- historical version;
    
- successor version.
    

Ambiguous rules SHOULD test for:

```text
UNKNOWN
```

or:

```text
REVIEW_REQUIRED
```

---

# 87. Synthetic fixtures

Public tests MUST use synthetic taxpayers.

Include:

- traditional artist;
    
- Tezos generative artist;
    
- NFT collector;
    
- gallery-represented artist;
    
- Tezos builder;
    
- founder receiving tokens;
    
- baker/staker;
    
- active trader;
    
- international freelancer;
    
- small platform/business.
    

---

# 88. Regression corpus

Every significant bug SHOULD become a permanent test.

Examples:

- self-transfer treated as sale;
    
- royalty treated as primary sale;
    
- marketplace fee duplicated;
    
- token compensation treated as gift;
    
- wrong timezone;
    
- current rule applied historically;
    
- cost basis matched incorrectly;
    
- current NFT guidance assumed to exist historically.
    

---

# 89. Calculation integrity

Money calculations MUST use decimal arithmetic.

Crypto quantities MUST preserve native precision.

Rounding MUST be jurisdiction/rule configurable.

---

# 90. Time handling

Preserve raw blockchain timestamp in UTC.

Support:

- UTC;
    
- participant local time;
    
- tax jurisdiction date.
    

Timezone assumptions MUST be inspectable.

---

# 91. Performance

A local workspace SHOULD comfortably handle:

```text
100,000+ normalized events
```

on a modern consumer device.

Processing SHOULD be incremental.

---

# 92. Offline capability

Previously downloaded jurisdiction packs and private ledgers SHOULD support offline analysis.

Network MAY be required for:

- fresh chain fetching;
    
- live source verification;
    
- market-price APIs;
    
- cloud AI.
    

---

# 93. Analysis snapshots

Every saved analysis SHOULD record:

```text
participant/profile version
ledger version
ownership mappings
jurisdiction-pack version
rule versions
valuation methodology
price dataset refs
lot method
engine version
analysis date
```

This enables reproduction.

---

# 94. UI principles

The UI SHOULD be:

- tool-first;
    
- evidence-first;
    
- low-friction;
    
- understandable by non-accountants;
    
- transparent;
    
- progressive in complexity.
    

Avoid dashboards overloaded with unexplained tax numbers.

Prefer:

```text
Potential issue detected
```

over:

```text
You owe €X
```

unless the calculation is sufficiently deterministic and sourced.

---

# 95. Accessibility

Public interfaces SHOULD target WCAG 2.2 AA.

Warnings, confidence and review status MUST NOT rely on color alone.

---

# 96. Internationalization

The system MUST preserve source original language.

Translations MUST remain separate.

Machine translations MUST be labeled.

Original legal text MUST remain accessible where redistribution rules allow.

---

# 97. Security

Maintain:

- dependency scanning;
    
- secret scanning;
    
- security policy;
    
- responsible disclosure;
    
- sanitization of imported files/content;
    
- safe handling of CSV/HTML;
    
- AI prompt-injection defenses;
    
- auditable releases.
    

---

# 98. Governance roles

Project roles SHOULD include:

```text
core maintainers
technical maintainers
jurisdiction maintainers
source researchers
qualified professional reviewers
tool maintainers
community contributors
```

---

# 99. Jurisdiction governance

A mature jurisdiction SHOULD ideally have:

- primary maintainer;
    
- backup maintainer;
    
- qualified local reviewer.
    

Where expert review is absent, the UI MUST say so.

---

# 100. Legal disagreement

Competing interpretations MUST be representable.

Example:

```text
INTERPRETATION A
sources...
reviewer...

INTERPRETATION B
sources...
reviewer...

STATUS:
UNRESOLVED
```

The project MUST NOT manufacture consensus.

---

# 101. Licensing

Code and knowledge content MAY use different open licenses.

Third-party source redistribution rights MUST be respected.

Prefer:

- structured metadata;
    
- source links;
    
- hashes;
    
- permitted extracts;
    

over unnecessary republishing.

---

# 102. P0 MVP definition

P0 is complete only when the following exist.

## Foundation

1. repository governance;
    
2. contributor model;
    
3. schemas;
    
4. source registry;
    
5. temporal source model;
    
6. temporal rule model;
    
7. deterministic rule engine;
    
8. valuation engine;
    
9. participant/entity model;
    
10. evidence model;
    
11. economic-event engine;
    
12. lot engine;
    
13. local workspace storage.
    

## Tezos

14. Tezos adapter;
    
15. public wallet import;
    
16. NFT semantic decoding;
    
17. marketplace decoding for at least one major ecosystem path;
    
18. staking/baking recognition;
    
19. self-transfer handling;
    
20. historical XTZ valuation.
    

## Knowledge

21. France jurisdiction pack v0.1;
    
22. required EU dependencies;
    
23. historical-source querying;
    
24. source/rule search;
    
25. review/maturity labels.
    

## Tax Tools

26. Wallet Tax Timeline;
    
27. Historical Asset Valuator;
    
28. Tezos Transaction Explainer;
    
29. NFT Sale/Purchase Reconstructor;
    
30. Artist Revenue Explorer;
    
31. Collector Activity Explorer;
    
32. Linked Wallet Mapper;
    
33. Transaction Tagger;
    
34. Tax Data Health Check;
    
35. Guidance Time Machine;
    
36. Rule Diff;
    
37. Evidence Pack Generator;
    
38. generic tax-software export.
    

## Workspace

39. participant profile;
    
40. wallet ownership;
    
41. event correction;
    
42. valuation review;
    
43. structured findings;
    
44. explainability;
    
45. analysis snapshot;
    
46. professional export.
    

## AI

47. source-grounded explanation;
    
48. candidate event classification;
    
49. missing-fact detection;
    
50. red-team prototype.
    

## Quality

51. synthetic corpus;
    
52. regression tests;
    
53. CI validation;
    
54. privacy/security controls.
    

---

# 103. P1 scope

P1 SHOULD add:

- US Federal;
    
- UK;
    
- Germany;
    
- Canada;
    
- Singapore;
    
- EVM;
    
- Solana;
    
- more Tezos marketplace adapters;
    
- builder compensation tools;
    
- staking explorer;
    
- lot visualizer;
    
- richer DeFi;
    
- tax-letter navigator;
    
- information-reporting model;
    
- source monitoring;
    
- public-case research interface;
    
- professional review workflows;
    
- multilingual explanations;
    
- third-party exporter plugins.
    

---

# 104. P2 scope

P2 MAY add:

- additional jurisdictions;
    
- US states;
    
- Canadian provinces;
    
- advanced DeFi;
    
- derivatives;
    
- corporate treasury workflows;
    
- accounting integrations;
    
- optional encrypted sync;
    
- professional collaboration;
    
- third-party reporting reconciliation;
    
- anonymized policy analysis;
    
- tax-filing integrations.
    

---

# 105. Critical acceptance tests

## AC-001 — Provenance

No material legal conclusion is displayed without rule/source references.

## AC-002 — Historical correctness

A 2021 transaction cannot silently use guidance first published in 2025 as though available in 2021.

## AC-003 — Unknown

Unsupported treatment can resolve to `UNKNOWN`.

## AC-004 — Self transfer

Confirmed self-wallet transfer is not automatically treated as a sale.

## AC-005 — Valuation

Every historical crypto valuation exposes provider, timestamp and method.

## AC-006 — Reproducibility

A saved analysis can be reproduced using its recorded versions and methods.

## AC-007 — AI grounding

AI explanations derive from structured facts and source-backed rules.

## AC-008 — Privacy

A user can analyze wallets without creating an account or uploading their complete ledger.

## AC-009 — Raw evidence

A manual correction never destroys underlying imported evidence.

## AC-010 — Multiple capacity

One user can simultaneously have artist, collector and builder activity.

## AC-011 — Legal ambiguity

Two competing interpretations can coexist.

## AC-012 — Chain semantics

A blockchain operation is not automatically treated as a taxable event.

## AC-013 — Tool independence

At least several P0 Tax Tools are useful without configuring a full workspace.

## AC-014 — Professional inspection

An accountant can inspect facts, classifications, valuations, rules and sources separately.

## AC-015 — Tezos-native usefulness

The Tezos tools must understand primary NFT sales, secondary sales, royalties, fees and self-transfers rather than representing everything as generic token transfers.

---

# 106. Architecture before UI

The planning agent MUST prioritize stabilization of:

```text
participant schema
entity schema
evidence schema
event/leg schema
asset schema
valuation schema
source schema
rule schema
jurisdiction schema
finding schema
```

before significant UI work.

The toolbox MAY begin with thin interfaces over stable core packages.

---

# 107. Avoiding duplicate business logic

There MUST be one authoritative implementation for:

- valuation;
    
- lot matching;
    
- event normalization;
    
- rule application;
    
- source lookup.
    

Individual Tax Tools MUST consume these packages rather than reimplement them.

---

# 108. Existing ecosystem positioning

The project SHOULD NOT attempt to duplicate every capability of commercial crypto-tax products.

Instead it SHOULD focus on areas where open infrastructure is especially valuable:

```text
high-quality chain semantics
historical source provenance
legal rule versioning
open calculation logic
explicit ambiguity
transaction reconstruction
evidence generation
small focused tools
professional auditability
privacy
interoperability
```

Existing tax products SHOULD be treated as potential downstream consumers of cleaned data.

---

# 109. Tezos product principle

The first release SHOULD feel native to the Tezos community rather than like generic accounting software with Tezos support bolted on.

It SHOULD understand concepts users recognize:

- artist;
    
- collector;
    
- mint;
    
- primary;
    
- secondary;
    
- royalty;
    
- marketplace;
    
- tez;
    
- FA2;
    
- baker;
    
- wallet;
    
- collection.
    

It MUST then map those concepts into generic underlying economic records.

---

# 110. Tool discoverability

The public home page SHOULD prominently expose Tax Tools.

Example:

```text
TOOLS

Wallet Tax Timeline
Historical Valuator
Transaction Explainer
NFT Sale Reconstructor
Artist Revenue
Collector Activity
Wallet Mapper
Data Health Check
Guidance Time Machine
Rule Diff
Evidence Pack
```

Users SHOULD be able to arrive through a search engine and use one tool immediately.

---

# 111. Planner instructions

The agentic planner MUST:

1. treat all MUST/MUST NOT statements as constraints;
    
2. separate product requirements from implementation choices;
    
3. decompose P0 into independent epics;
    
4. identify schema dependencies;
    
5. establish stable package/API contracts;
    
6. define ownership boundaries for parallel development agents;
    
7. produce automated acceptance tests;
    
8. build shared core packages before duplicative tool work;
    
9. preserve Tezos-first usability;
    
10. avoid hard-coding Tezos into generic accounting models;
    
11. avoid hard-coding France into the generic rule engine;
    
12. preserve local-first privacy;
    
13. treat jurisdiction rules as versioned data;
    
14. treat legal sources as data with provenance;
    
15. prefer deterministic calculations;
    
16. design AI as a consumer of structured evidence;
    
17. expose unsupported functionality honestly;
    
18. optimize for composability;
    
19. build Tax Tools as first-class deliverables;
    
20. plan for professional reviewers and community maintainers from the beginning.
    

The planner MAY select:

- programming languages;
    
- frontend framework;
    
- database;
    
- local-storage technology;
    
- server architecture;
    
- deployment infrastructure;
    
- CI/CD tooling;
    
- AI providers;
    
- blockchain providers;
    

provided all normative requirements remain satisfied.

---

# 112. Recommended development workstreams

The planner SHOULD consider parallel workstreams approximately corresponding to:

### Workstream A — Schemas and domain model

Participant, entities, evidence, events, assets, positions, findings.

### Workstream B — Public knowledge system

Sources, jurisdiction packs, historical versions, search.

### Workstream C — Rule engine

Rule evaluation, uncertainty, temporal queries.

### Workstream D — Tezos data

Indexing adapters, semantic interpretation, marketplaces.

### Workstream E — Valuation

Historical price sources and reproducibility.

### Workstream F — Lots and accounting

Cost basis, holdings, matching.

### Workstream G — Tax Tools

Independent public utilities.

### Workstream H — Private workspace

Local project, tagging, reconciliation and findings.

### Workstream I — AI

Source ingestion, explanation, classification and red team.

### Workstream J — Exports/interoperability

Professional packs and external software exports.

### Workstream K — France content

France source collection, rules and validation.

### Workstream L — QA/security

Synthetic fixtures, CI, privacy and threat model.

Shared interfaces MUST be defined before agents work independently.

---

# 113. Primary P0 demonstration scenario

The project MUST be able to demonstrate:

> A French-resident Tezos artist has several wallets, creates NFTs, receives XTZ from primary sales and secondary royalties, buys other artists' NFTs, transfers assets between their own wallets, receives staking/baking rewards, later disposes of some XTZ and wants to understand activity from 2021–2024.

The system should:

1. fetch/import activity;
    
2. preserve raw chain evidence;
    
3. identify marketplace semantics;
    
4. identify candidate economic events;
    
5. let the user confirm wallet ownership;
    
6. remove self-transfers from economic interpretation;
    
7. distinguish artist income from collector activity;
    
8. value relevant events historically;
    
9. build acquisition lots;
    
10. identify subsequent disposals;
    
11. load the France rules applicable to each period;
    
12. identify guidance that existed at each date;
    
13. separate later guidance;
    
14. flag ambiguity;
    
15. show relevant findings;
    
16. explain every finding;
    
17. identify missing records;
    
18. generate an accountant-ready evidence pack.
    

---

# 114. Secondary P0 demonstration scenario

A French-based builder/platform participant:

- operates through an entity;
    
- receives marketplace/platform fees;
    
- receives or holds XTZ;
    
- pays contributors;
    
- has treasury transfers;
    
- has personal wallets and company wallets.
    

The system MUST demonstrate that:

- entity ownership is separable;
    
- company and personal wallets are separable;
    
- platform fees are distinguishable from raw transfers;
    
- tax treatment is not inferred solely from chain activity;
    
- unresolved corporate questions can remain unknown.
    

Full corporate tax automation is NOT required for P0.

---

# 115. Product success condition

The product succeeds when a participant can say:

> I was active in crypto several years ago. I created art, collected some work, received tokens for work, used multiple wallets and I don't know whether I treated everything correctly.

and the system can respond in substance:

> We reconstructed your activity.

> Here is what happened economically.

> Here is what came directly from evidence.

> Here is what you confirmed.

> Here is what we inferred.

> Here is what remains unknown.

> Here are the historical values.

> Here are the acquisition lots.

> Here are the rules potentially applicable in your jurisdiction during those periods.

> Here is the guidance that was actually available at the time.

> Here is later guidance, separately identified.

> Here are conflicting interpretations.

> Here are records you appear to be missing.

> Here are the calculations.

> Here are the sources.

> Here are the questions that require professional judgment.

> Every conclusion can be inspected.

---

# 116. Final product maxims

## Maxim 1

**Do not build another black-box crypto tax calculator.**

## Maxim 2

**Reconstruct the economics before applying tax law.**

## Maxim 3

**Historical rules and historical guidance are first-class data.**

## Maxim 4

**Unknown is better than confidently wrong.**

## Maxim 5

**Open-source the research and tools; protect private taxpayer data.**

## Maxim 6

**Build small useful tools as well as deep workflows.**

## Maxim 7

**Tezos is the proving ground, not an architectural limitation.**

## Maxim 8

**Artists are a priority user group, not the root domain object.**

## Maxim 9

**AI explains, searches, classifies and challenges; sources and deterministic computation remain authoritative.**

## Maxim 10

**Every important number and conclusion must be reproducible.**