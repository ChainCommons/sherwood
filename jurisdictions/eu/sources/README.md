# EU — source index

EU instruments that the **France** pack depends on. This is a dependency index,
not an EU tax pack: no member-state treatment is derived from it. Since
P0-3-04 a narrow set of these instruments is modelled as rules — see
[`../rules/`](../rules/README.md) — and the rest of this index is still
metadata that nothing executes.

Plan 15 §79: national packs SHOULD *reference* shared EU rules rather than
duplicate them. France VAT explanations cite these `source_id`s; they do not
restate the directives.

| `source_id` | Reference | Published | Why France needs it |
| --- | --- | --- | --- |
| `eu-reg-2023-1114-mica` | Regulation (EU) 2023/1114 (MiCA) | 2023-06-09 | Defines the perimeter CGI art. 150 VH bis uses from 2026-06-28; art. 2(3) excludes unique non-fungible crypto-assets, which CGI art. 150 VH ter picks up |
| `eu-dir-2006-112-vat` | Council Directive 2006/112/EC (VAT Directive) | 2006-12-11 | The frame for supply/place-of-supply and the art. 135(1) exemptions behind the 2024 French NFT rescrit |
| `eu-dir-2022-542-vat-rates` | Council Directive (EU) 2022/542 | 2022-04-06 | Transposed by LF 2024 art. 83; source of the 5,5 % rate on works of art from 2025-01-01 |
| `eu-dir-2023-2226-dac8` | Council Directive (EU) 2023/2226 (DAC8) | 2023-10-24 | Crypto-asset reporting by service providers. Reporting only — it does not change how a taxpayer is taxed |
| `eu-cjeu-c-264-14-hedqvist` | CJEU, 22 Oct 2015, C-264/14 | 2015-10-22 | Fungible payment token ↔ currency exchange is VAT-exempt. Says nothing about NFTs, mints or royalties |

## Cautions

- **MiCA is not a tax instrument.** It is used here only because French law now
  borrows its perimeter. Do not derive a tax treatment from it.
- **Hedqvist is narrow.** It concerns exchanging a currency for bitcoin and
  back. The 2024 French rescrit expressly places NFT operations *outside* the
  financial-operations exemption, so Hedqvist must not be stretched to cover
  them.
- **No consolidated version is pinned.** A rule that turns on a specific
  article must pin the consolidated text in force for its period; the ELI URLs
  here point at the act as published.
- `publication_date` for the 2022 and 2023 directives is the OJ date reported
  by EUR-Lex search and was **not** read off the document itself. P0-3-04 did
  not clear this: EUR-Lex was unreachable from that authoring environment, so
  no date here was re-verified and no rule was allowed to turn on one that had
  not been. [`../RESEARCH.md`](../RESEARCH.md) §3.2.

Licence: © European Union. Reuse authorised under Commission Decision
2011/833/EU with acknowledgement of source. Redistribution posture in this
repository: `extract`.
