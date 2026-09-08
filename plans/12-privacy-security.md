# 12 — Privacy, security, sensitive data, telemetry, offline

**Spec:** §§66–70, 92, 97  
**Workstream:** L  
**Depends on:** workspace storage choice  
**P0:** all MUST items

## Local-first (§66)

Private user data MUST remain local by default. Core analysis MUST NOT require an account.

Storage options (implement first two in P0):

- browser local database (OPFS + SQLite)
- encrypted local project file
- desktop local database (P1 MAY add Tauri)

Optional cloud sync MAY be added later **only as opt-in** (P2).

## Sensitive data (§67)

Includes: identity; wallet ownership; tax residency; income; trading history; entity ownership; vesting schedules; token allocations; exchange accounts; tax liabilities; uploaded correspondence.

MUST NOT be sent to remote infrastructure without **explicit user action**.

Network exceptions the user opts into: chain indexer fetch (public addresses they entered); price APIs; optional cloud AI (plan 11); optional pack update download (jurisdiction YAML, not their ledger).

Public Tax Tools that take a public address will call indexers from the client (or a proxy that does not persist). Proxy MUST NOT log addresses/hashes (see telemetry). If a proxy is used, document it.

## Private-key prohibition (§68)

MUST NEVER request: private keys, seed phrases, recovery phrases.

Wallet connection = public addresses or safe signed authentication where appropriate. P0: paste/watch address only. No WalletConnect that could confuse users into signing arbitrary tax messages unless a later typed-data design is reviewed.

CI grep: `seed`, `mnemonic`, `private key` in form labels.

## Telemetry (§70)

MUST NOT include: wallet addresses; transaction hashes; names; income amounts; tax IDs; account numbers; tax calculations; uploaded financial documents.

If any telemetry exists, it is opt-in, aggregate (e.g. “tool_opened=timeline”), no identifiers. Default off is acceptable.

## Offline (§92)

Previously downloaded jurisdiction packs and private ledgers SHOULD support offline analysis.

Network MAY be required for: fresh chain fetching; live source verification; market-price APIs; cloud AI.

Implementation: service worker or explicit “offline packs” cache; valuation cache (plan 06); tools 010/011 work offline if France pack is local.

## Security (§97)

Maintain:

- dependency scanning
- secret scanning
- security policy (`SECURITY.md`)
- responsible disclosure
- sanitization of imported files/content
- safe handling of CSV/HTML
- AI prompt-injection defenses (plan 11)
- auditable releases

CSV/HTML: parse with libraries that do not execute formulas; never `innerHTML` unsanitized marketplace metadata; MIME sniffing caution.

Releases: signed checksums of engine + rule-pack versions (ties to snapshots).

## Implementation tasks

1. `PRIVACY.md`, `SECURITY.md`, threat model (`docs/threat-model.md`): local compromise vs remote exfil vs prompt injection vs malicious CSV.
2. Network allowlist in the client: indexer, price, pack CDN, optional AI — each with a consent chip.
3. Project file encryption (user passphrase, documented KDF).
4. Sanitizer for metadata/CSV.
5. Telemetry stub that cannot accept forbidden fields (type-level).
6. Dependency + secret scanning in CI.

## Acceptance

- AC-008 analyze without account or uploading complete ledger
- Attempting to paste a seed into any field is not requested; if user pastes one into a notes field, do not sync it anywhere
