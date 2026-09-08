/**
 * Shared vocabularies (plans 02, 03, 04, 05, 06, 09).
 *
 * These are the single source of truth. `schemas/` repeats them as JSON Schema
 * enums and `tests/contracts/enum-parity.test.ts` fails if the two drift, so a
 * new event type only has to be added in one place plus its schema.
 */

/** Plan 02 §10 — capacity is first-class on activity, and may be UNKNOWN. */
export const CAPACITIES = [
  'ARTIST', 'CREATOR', 'COLLECTOR', 'PRIVATE_INVESTOR', 'ACTIVE_TRADER',
  'PROFESSIONAL_TRADER', 'FOUNDER', 'EMPLOYEE', 'CONTRACTOR',
  'PROTOCOL_CONTRIBUTOR', 'DAO_CONTRIBUTOR', 'MARKETPLACE_OPERATOR',
  'TOKEN_ISSUER', 'VALIDATOR', 'BAKER', 'MINER', 'STAKER', 'DELEGATOR',
  'LIQUIDITY_PROVIDER', 'LENDER', 'BORROWER', 'BUSINESS_OWNER', 'DONOR',
  'RECIPIENT', 'UNKNOWN'
] as const
export type Capacity = (typeof CAPACITIES)[number]

export const PARTICIPANT_TYPES = [
  'individual', 'company', 'partnership', 'association', 'foundation',
  'trust', 'DAO', 'other'
] as const
export type ParticipantType = (typeof PARTICIPANT_TYPES)[number]

/** Plan 02 — entity relationship graph. */
export const RELATIONSHIP_TYPES = [
  'OWNS', 'CONTROLS', 'EMPLOYED_BY', 'CONTRACTS_FOR', 'FOUNDED', 'DIRECTOR_OF',
  'MEMBER_OF', 'CONTRIBUTES_TO', 'BENEFICIARY_OF', 'WALLET_OWNED_BY',
  'ACCOUNT_OWNED_BY'
] as const
export type RelationshipType = (typeof RELATIONSHIP_TYPES)[number]

/** Plan 02 §43 — a transfer between confirmed user wallets is not a disposal. */
export const OWNERSHIP_CLASSES = [
  'USER_PERSONAL', 'USER_BUSINESS', 'USER_CONTROLLED_ENTITY', 'COLLABORATOR',
  'MARKETPLACE', 'CUSTOMER', 'PROTOCOL', 'UNKNOWN'
] as const
export type OwnershipClass = (typeof OWNERSHIP_CLASSES)[number]

export const CONFIRMATION_STATUSES = ['USER_CONFIRMED', 'INFERRED', 'UNKNOWN'] as const
export type ConfirmationStatus = (typeof CONFIRMATION_STATUSES)[number]

/** Plan 02 §19 — grant, vest, deliver and unlock must not collapse. */
export const COMPENSATION_RIGHT_TYPES = [
  'TOKEN_OPTION', 'TOKEN_WARRANT', 'RESTRICTED_TOKEN', 'VESTING_TOKEN',
  'LOCKED_TOKEN', 'SAFT_OR_SIMILAR_RIGHT', 'OTHER_CONTINGENT_RIGHT'
] as const
export type CompensationRightType = (typeof COMPENSATION_RIGHT_TYPES)[number]

/** Plan 03 §12 — importers exist for a subset; the enum is complete from day one. */
export const EVIDENCE_TYPES = [
  'blockchain_operation', 'marketplace_transaction', 'generic_csv',
  'manual_user_record', 'exchange_export', 'bank_record',
  'payment_processor_record', 'invoice', 'gallery_statement', 'contract',
  'grant_document', 'token_allocation_agreement', 'vesting_schedule',
  'accounting_csv'
] as const
export type EvidenceType = (typeof EVIDENCE_TYPES)[number]

export const TECHNICAL_TX_STATUSES = ['applied', 'failed', 'backtracked', 'skipped'] as const
export type TechnicalTxStatus = (typeof TECHNICAL_TX_STATUSES)[number]

/** Plan 03 §14 — what a leg *is* economically, before any tax view of it. */
export const ECONOMIC_CHARACTERS = [
  'consideration', 'transfer', 'fee', 'royalty', 'reward', 'collateral',
  'loan_principal', 'repayment', 'interest', 'compensation', 'distribution',
  'grant', 'gift', 'unknown'
] as const
export type EconomicCharacter = (typeof ECONOMIC_CHARACTERS)[number]

export const LEG_DIRECTIONS = ['inbound', 'outbound'] as const
export type LegDirection = (typeof LEG_DIRECTIONS)[number]

/**
 * Plan 03 §15 — the full semantic event enum ships in P0 so later protocol
 * support never has to migrate stored data. Runtime decode may be partial.
 */
export const SEMANTIC_EVENT_TYPES = [
  // General acquisition / disposal
  'ASSET_PURCHASE', 'ASSET_SALE', 'ASSET_EXCHANGE', 'ASSET_TRANSFER',
  'SELF_TRANSFER', 'GIFT', 'DONATION', 'BARTER', 'LOSS', 'THEFT', 'BURN',
  'REFUND',
  // Artistic activity
  'ART_PRIMARY_SALE', 'ART_SECONDARY_SALE', 'COMMISSION_INCOME',
  'ROYALTY_RECEIPT', 'LICENCE_INCOME', 'COPYRIGHT_ASSIGNMENT',
  'GALLERY_CONSIGNMENT', 'GALLERY_SETTLEMENT', 'GRANT', 'PRIZE', 'PATRONAGE',
  'COLLABORATION_SPLIT',
  // NFT activity
  'NFT_MINT', 'NFT_PURCHASE', 'NFT_SALE', 'NFT_TRANSFER', 'NFT_ROYALTY',
  'NFT_GIFT', 'NFT_DONATION', 'NFT_BURN', 'NFT_REDEMPTION',
  // Compensation / builders
  'SALARY_PAYMENT', 'CONTRACTOR_PAYMENT', 'FOUNDER_COMPENSATION',
  'TOKEN_COMPENSATION', 'TOKEN_GRANT', 'TOKEN_VESTING', 'TOKEN_UNLOCK',
  'BOUNTY', 'DAO_COMPENSATION', 'FOUNDER_ALLOCATION', 'TEAM_ALLOCATION',
  // Basic crypto (INV-019: these exist without any NFT type)
  'CRYPTO_RECEIPT', 'CRYPTO_PURCHASE', 'CRYPTO_SALE', 'CRYPTO_SWAP',
  'CRYPTO_PAYMENT', 'AIRDROP', 'FORK_RECEIPT',
  // Protocol activity
  'MINING_REWARD', 'VALIDATOR_REWARD', 'BAKING_REWARD', 'STAKING_REWARD',
  'DELEGATION_REWARD', 'LIQUIDITY_DEPOSIT', 'LIQUIDITY_WITHDRAWAL',
  'LIQUIDITY_REWARD', 'LENDING_DEPOSIT', 'LOAN_ADVANCE', 'LOAN_REPAYMENT',
  'INTEREST_RECEIPT', 'INTEREST_PAYMENT', 'COLLATERAL_DEPOSIT',
  'COLLATERAL_RELEASE', 'LIQUIDATION', 'WRAP', 'UNWRAP', 'BRIDGE_DEPOSIT',
  'BRIDGE_WITHDRAWAL',
  // Trading
  'SPOT_TRADE', 'DERIVATIVE_OPEN', 'DERIVATIVE_CLOSE', 'OPTION_EXERCISE',
  'OPTION_EXPIRY', 'PERPETUAL_FUNDING',
  // Nothing could be determined; never guess a sale.
  'UNKNOWN'
] as const
export type SemanticEventType = (typeof SEMANTIC_EVENT_TYPES)[number]

/** Plan 03 §16 — provenance of a derived fact. */
export const FACT_STATUSES = [
  'OBSERVED', 'IMPORTED', 'USER_CONFIRMED', 'INFERRED', 'ESTIMATED', 'UNKNOWN'
] as const
export type FactStatus = (typeof FACT_STATUSES)[number]

export const CLASSIFICATION_SOURCES = ['user', 'adapter', 'heuristic', 'ai_candidate'] as const
export type ClassificationSource = (typeof CLASSIFICATION_SOURCES)[number]

/** Plan 04 §17 — economic category only. Legal class is per-jurisdiction (INV-014). */
export const ASSET_ECONOMIC_CATEGORIES = [
  'fiat', 'cryptocurrency', 'stablecoin', 'governance_token', 'utility_token',
  'nft', 'wrapped_asset', 'staking_receipt', 'liquidity_position',
  'derivative', 'tokenized_real_world_asset', 'physical_asset',
  'intellectual_property', 'other'
] as const
export type AssetEconomicCategory = (typeof ASSET_ECONOMIC_CATEGORIES)[number]

export const FUNGIBILITY = ['fungible', 'nonfungible', 'semi_fungible'] as const
export type Fungibility = (typeof FUNGIBILITY)[number]

export const POSITION_TYPES = [
  'liquidity', 'lending', 'borrowing', 'staking', 'collateral', 'derivative',
  'vesting', 'other'
] as const
export type PositionType = (typeof POSITION_TYPES)[number]

/** Plan 04 §21 — FIFO is never the global default. */
export const LOT_METHODS = [
  'FIFO', 'LIFO', 'HIFO', 'SPECIFIC_IDENTIFICATION', 'AVERAGE_COST', 'POOLING',
  'OTHER'
] as const
export type LotMethod = (typeof LOT_METHODS)[number]

/** Plan 06 §35 — how a value was arrived at; never silently invented. */
export const VALUATION_METHODS = [
  'exact_timestamp', 'nearest_trade', 'daily', 'marketplace_implied',
  'user_supplied', 'professional'
] as const
export type ValuationMethod = (typeof VALUATION_METHODS)[number]

export const VALUATION_MISS_REASONS = [
  'no_market', 'hole', 'unsupported_asset', 'network'
] as const
export type ValuationMissReason = (typeof VALUATION_MISS_REASONS)[number]

/** Plan 05 §22. */
export const JURISDICTION_TYPES = [
  'supranational', 'national', 'federal', 'state', 'province', 'canton',
  'local', 'treaty'
] as const
export type JurisdictionType = (typeof JURISDICTION_TYPES)[number]

/** Plan 05 §24 — packs must be able to say a domain is *not* modeled. */
export const TAX_DOMAINS = [
  'personal_income_tax', 'professional_business_income', 'corporation_tax',
  'capital_gains', 'vat', 'gst_hst', 'sales_use_tax', 'social_security',
  'artist_social_regime', 'self_employment_contributions', 'withholding',
  'business_registration', 'reporting', 'crypto_reporting',
  'foreign_asset_reporting', 'deductible_expenses', 'tax_lot_accounting',
  'recordkeeping', 'filing', 'corrections', 'voluntary_disclosure',
  'audit_procedure', 'administrative_appeals', 'payment_collection',
  'court_deadlines'
] as const
export type TaxDomain = (typeof TAX_DOMAINS)[number]

/** Plan 05 §25. */
export const SOURCE_TYPES = [
  'STATUTE', 'REGULATION', 'TREATY', 'COURT_DECISION', 'ADMINISTRATIVE_RULING',
  'ADMINISTRATIVE_GUIDANCE', 'OFFICIAL_MANUAL', 'OFFICIAL_FAQ', 'FORM',
  'FORM_INSTRUCTIONS', 'OFFICIAL_NOTICE', 'LEGISLATIVE_HISTORY',
  'GOVERNMENT_REPORT', 'PROFESSIONAL_GUIDANCE', 'ACADEMIC_ANALYSIS',
  'SECONDARY_COMMENTARY', 'PUBLIC_FIRST_PERSON_CASE', 'NEWS_REPORT', 'OTHER'
] as const
export type SourceType = (typeof SOURCE_TYPES)[number]

/** Plan 05 §26 — an official-looking page is not automatically binding. */
export const AUTHORITY_LEVELS = [
  'BINDING_LEGISLATION', 'BINDING_DOCTRINE', 'ADMINISTRATIVE_GUIDANCE',
  'OFFICIAL_FAQ', 'PROFESSIONAL_GUIDANCE', 'COMMENTARY', 'UNKNOWN'
] as const
export type AuthorityLevel = (typeof AUTHORITY_LEVELS)[number]

/** Plan 05 §30 — legal certainty. Not a model confidence score. */
export const CERTAINTY_LEVELS = [
  'AUTHORITATIVE_CLEAR', 'AUTHORITATIVE_INTERPRETIVE', 'EXPERT_INTERPRETATION',
  'AMBIGUOUS', 'CONFLICTING_AUTHORITIES', 'UNSETTLED', 'UNKNOWN'
] as const
export type CertaintyLevel = (typeof CERTAINTY_LEVELS)[number]

/** Plan 05 §31. */
export const REVIEW_STATUSES = [
  'EXPERT_REVIEWED', 'SOURCE_VERIFIED', 'COMMUNITY_DRAFT', 'STALE', 'DISPUTED'
] as const
export type ReviewStatus = (typeof REVIEW_STATUSES)[number]

/** Only these may appear in a verified pack (plan 16 §84). */
export const VERIFIED_REVIEW_STATUSES = ['SOURCE_VERIFIED', 'EXPERT_REVIEWED'] as const

/** Plan 05 §77 — maturity is exposed in the UI, never implied. */
export const MATURITY_LEVELS = [0, 1, 2, 3, 4, 5, 6] as const
export type MaturityLevel = (typeof MATURITY_LEVELS)[number]

/** Plan 05 §34. */
export const PRECEDENTIAL_STATUSES = [
  'binding', 'persuasive', 'administrative', 'settlement', 'allegation_only',
  'anecdotal'
] as const
export type PrecedentialStatus = (typeof PRECEDENTIAL_STATUSES)[number]

export const CASE_FACT_STATUSES = ['KNOWN', 'INFERRED', 'CLAIMED', 'UNKNOWN'] as const
export type CaseFactStatus = (typeof CASE_FACT_STATUSES)[number]

/** Plan 09 §51. */
export const FINDING_STATUSES = [
  'relevant', 'potentially_relevant', 'not_relevant', 'unknown'
] as const
export type FindingStatus = (typeof FINDING_STATUSES)[number]

/** Plan 10 §55 — correcting your own error is not challenging the authority. */
export const FINDING_POSTURES = [
  'reconstruction', 'correction_of_own_error', 'challenge_of_authority_position',
  'unspecified'
] as const
export type FindingPosture = (typeof FINDING_POSTURES)[number]

/** Plan 14 — scenarios are factual patterns, grouped by domain pack. */
export const DOMAIN_PACKS = ['artists', 'collectors', 'builders', 'crypto'] as const
export type DomainPack = (typeof DOMAIN_PACKS)[number]

export const ROUNDING_MODES = [
  'HALF_UP', 'HALF_EVEN', 'HALF_DOWN', 'UP', 'DOWN', 'CEILING', 'FLOOR'
] as const
