# France — source index

Metadata about official documents. **Not** a mirror of them: links, dates,
short permitted extracts and content hashes only. See
[`../RESEARCH.md`](../RESEARCH.md) for how these were gathered, what the hashes
cover, and what is deliberately missing.

Every record is a `Source`
([schema](../../../schemas/source/source.schema.json)). No rules ship yet.

## Reading a record

- `publication_date` — when a taxpayer could first have read it. Absent means
  the document carries no readable date, and the record **must not** answer a
  historical as-of query.
- `effective_from` / `effective_to` — the period the text governs, which is
  often *earlier* than publication. The validator warns when it is; those
  warnings are the point (AC-002), not noise.
- `content_hash` — sha256 of `curl -sSL "<canonical_url>"`. Absent on
  Légifrance records because Légifrance returns 403 to scripted requests.
- `notes` — begins with `redistribution: extract` (see RESEARCH.md §3 and
  [`docs/rfc/P0-3-01.md`](../../../docs/rfc/P0-3-01.md) for why it lives here).

## Dated captures

Where doctrine or statute changed, **each dated text is its own record**,
linked by `supersedes` / `superseded_by`, and named with its year:

- `fr-cgi-150-vh-bis-2019` → `fr-cgi-150-vh-bis-2026`
- `fr-bofip-rppm-pvbmc-30-30-2019` → `…-2024`
- `fr-bofip-bic-champ-60-50-2019` → `…-2023`
- `fr-bofip-bnc-champ-10-10-20-40-2019` → `…-2023`

A rule cites the record that was in force for its period. **Never edit a
historical record in place** — plan 05 §28. Every as-of answer this pack gives
depends on the old text still being here.

## Index

### Statute, regulation, case law

| `source_id` | Reference | Published | Authority |
| --- | --- | --- | --- |
| `fr-cgi-150-vh-bis-2019` | CGI art. 150 VH bis, rédaction « actifs numériques » | 2018-12-28 | BINDING_LEGISLATION |
| `fr-cgi-150-vh-bis-2026` | CGI art. 150 VH bis, rédaction « crypto-actifs » (MiCA) | 2026-06-25 | BINDING_LEGISLATION |
| `fr-cgi-150-vh-ter` | CGI art. 150 VH ter — crypto-actifs uniques et non fongibles | 2026-06-25 | BINDING_LEGISLATION |
| `fr-cgi-92` | CGI art. 92 — BNC, dont le 2° actifs numériques | 2021-12-30 | BINDING_LEGISLATION |
| `fr-cgi-200-c` | CGI art. 200 C — 12,8 % et option barème | 2018-12-28 | BINDING_LEGISLATION |
| `fr-cgi-150-ua` | CGI art. 150 UA — plus-values de biens meubles | — | BINDING_LEGISLATION |
| `fr-cgi-150-vi` | CGI art. 150 VI — taxe forfaitaire objets d'art | — | BINDING_LEGISLATION |
| `fr-cgi-1649-bis-c` | CGI art. 1649 bis C — comptes détenus à l'étranger | 2018-12-28 | BINDING_LEGISLATION |
| `fr-cgi-1736` | CGI art. 1736 — amendes | — | BINDING_LEGISLATION |
| `fr-cgi-93` | CGI art. 93, dont 1 quater sur les droits d'auteur | — | BINDING_LEGISLATION |
| `fr-cgi-annexe3-98-a` | CGI ann. III art. 98 A — définition des œuvres d'art | — | BINDING_LEGISLATION |
| `fr-css-l382-1` | CSS art. L. 382-1 — artistes-auteurs | — | BINDING_LEGISLATION |
| `fr-decret-2019-656` | Décret n° 2019-656 — obligations déclaratives | 2019-06-27 | BINDING_LEGISLATION |
| `fr-ce-2018-04-26-417809` | CE, 26 avril 2018, n° 417809 et autres | 2018-04-26 | BINDING_DOCTRINE |

### Administrative doctrine (BOFiP)

| `source_id` | Reference | Published |
| --- | --- | --- |
| `fr-bofip-rppm-pvbmc-30` | BOI-RPPM-PVBMC-30 (division) | 2024-04-23 |
| `fr-bofip-rppm-pvbmc-30-10-2019` | BOI-RPPM-PVBMC-30-10 — champ d'application | 2019-09-02 |
| `fr-bofip-rppm-pvbmc-30-20-2019` | BOI-RPPM-PVBMC-30-20 — base d'imposition | 2019-09-02 |
| `fr-bofip-rppm-pvbmc-30-30-2019` | BOI-RPPM-PVBMC-30-30 — modalités et obligations | 2019-09-02 |
| `fr-bofip-rppm-pvbmc-30-30-2024` | BOI-RPPM-PVBMC-30-30 — révision option barème | 2024-04-23 |
| `fr-bofip-bnc-champ-10-10-20-40-2019` | BOI-BNC-CHAMP-10-10-20-40 — minage | 2019-09-02 |
| `fr-bofip-bnc-champ-10-10-20-40-2023` | BOI-BNC-CHAMP-10-10-20-40 — révision LF 2022 | 2023-06-28 |
| `fr-bofip-bic-champ-60-50-2019` | BOI-BIC-CHAMP-60-50 — achat-vente habituel | 2019-09-02 |
| `fr-bofip-bic-champ-60-50-2023` | BOI-BIC-CHAMP-60-50 — révision LF 2022 | 2023-06-28 |
| `fr-bofip-res-tva-000140-2024` | BOI-RES-TVA-000140 — rescrit TVA « NFT » | 2024-02-14 |
| `fr-bofip-cf-cpf-30-20` | BOI-CF-CPF-30-20 — comptes hors de France | 2021-05-26 |
| `fr-bofip-actu-2019-00174` | ACTU-2019-00174 — création du régime (LF 2019) | 2019-09-02 |
| `fr-bofip-actu-2023-00099` | ACTU-2023-00099 — BIC/BNC (LF 2022 art. 70) | 2023-06-28 |
| `fr-bofip-actu-2024-00078` | ACTU-2024-00078 — option barème (LF 2022 art. 79) | 2024-04-23 |

### Forms, FAQ and notices (impots.gouv.fr)

| `source_id` | Reference | Published |
| --- | --- | --- |
| `fr-impots-form-2086` | Formulaire 2086 (CERFA 16043) | — |
| `fr-impots-form-3916` | Formulaire 3916 / 3916-bis (CERFA 11916) | — |
| `fr-impots-faq-cessions-actifs-numeriques` | FAQ — déclarer les plus ou moins-values | — |
| `fr-impots-actu-comptes-actifs-numeriques-etranger` | Notice — comptes détenus à l'étranger | — |

An FAQ is not opposable doctrine. Where these disagree with BOFiP, BOFiP wins;
where they carry no date, they cannot answer a historical question at all.

## Adding a source

1. Open it **at the publisher**. A blog post is not a source.
2. Record all three clocks. Omit `publication_date` rather than guess it.
3. `curl -sSL "<url>" | sha256sum` for `content_hash`. If the publisher blocks
   scripted requests, leave it out and say so in `notes` — never invent one.
4. Extracts stay short and stay in the original language.
5. `pnpm validate`.
