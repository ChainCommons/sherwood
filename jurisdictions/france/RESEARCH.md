# France — source research log

**TODO:** P0-3-01 · **Status:** LEVEL 3 (sources indexed; a narrow set modelled
in [`rules/`](rules/README.md) under P0-3-03) ·
**Review status:** `COMMUNITY_DRAFT` — no qualified French reviewer is recorded
(that is [P0-L-01](../../plans/23-implementation.md)).

Nothing in this directory is tax advice. This file is a *log*: what was looked
for, where it was found, on what date, and — more important — what was **not**
found. A gap recorded here is a result, not a hole to be filled with a guess.

Companion index: [`sources/README.md`](sources/README.md). EU dependencies:
[`../eu/sources/`](../eu/sources/).

---

## 1. Method

All retrieval was done on **2026-09-08** against the publishers' own sites. No
blog, aggregator, law-firm note or tax-tool marketing page is cited as
authority anywhere in this pack. Secondary commentary was used only to *find*
primary documents, and every document indexed here was then opened at its
publisher before being recorded.

Three clocks are kept apart in every record, per plan 05 §§25–27:

| Field | Question it answers |
| --- | --- |
| `effective_from` / `effective_to` | Which periods does the rule govern? |
| `publication_date` | When could a taxpayer first have read this? |
| `retrieved_at` | When did this project capture it? |

Where a document carries no readable publication date, `publication_date` is
**omitted** rather than guessed. Two records are in that state
(`fr-impots-faq-cessions-actifs-numeriques`,
`fr-impots-actu-comptes-actifs-numeriques-etranger`); both say so in `notes`,
and neither may be used to answer a historical as-of query.

### Publishers used

| Publisher | What it gives us | Automated retrieval |
| --- | --- | --- |
| Légifrance (`legifrance.gouv.fr`) | CGI, CSS, décrets, Conseil d'État, JORF | **HTTP 403** to scripted requests |
| BOFiP (`bofip.impots.gouv.fr`) | Administrative doctrine, dated per version | 200, byte-stable |
| impots.gouv.fr | Forms, FAQ, notices | 200, byte-stable |
| EUR-Lex (`eur-lex.europa.eu`) | EU directives, regulations, CJEU | 202 (async render) |

---

## 2. Hashes and what they cover

`content_hash` is a **sha256 of the exact bytes returned by this recipe**:

```sh
curl -sSL "<canonical_url>" | sha256sum
```

Confirmed reproducible: repeated fetches of BOFiP and impots.gouv.fr pages
returned identical digests, and the digest is independent of `User-Agent`.

**Légifrance records carry no `content_hash` on purpose.** Légifrance answers
scripted requests with HTTP 403, so we cannot obtain the bytes to hash. Writing
a hash we cannot reproduce would be a fabricated integrity signal — precisely
the kind of false authority this project exists to avoid. Those records say so
in `notes`. Fixing this needs a capture path Légifrance permits (the LEGI
open-data bulk distribution on data.gouv.fr is the obvious candidate) and is
part of **P0-0-11**.

A hash pins bytes, not meaning. A BOFiP page's rendering can change without the
doctrine changing; a digest mismatch means "re-read this", never "the law
changed".

**A link-health sweep will report 403 on every Légifrance URL in this pack.**
That is the anti-bot response, not a dead link; all fourteen were opened at the
publisher on 2026-09-08. Do not "fix" them by swapping in a mirror or an
aggregator.

---

## 3. Licensing and redistribution

The consolidated legislation (LEGI), case law (CETAT/JADE) and tax doctrine
(BOFiP) datasets are distributed under **Licence Ouverte 2.0 (Etalab)**, which
permits reuse, adaptation and redistribution, commercial included, on condition
that the source and the date of last update are cited, and that the reuse is
not presented as official or endorsed. EUR-Lex material is reusable under
Commission Decision 2011/833/EU with acknowledgement of source.

So a **dated mirror of BOFiP and LEGI is licence-permitted** and plan 15 says
to prefer it where lawful. This PR does not create one: mirroring is a capture
and storage job with its own integrity requirements, and it is **P0-0-11**.
Until then the operative posture across this pack is:

    redistribution: extract

Short permitted extracts, links, dates and hashes only. Each source record
states this on the first line of its `notes`.

> **Schema gap.** Plan 15 asks for `redistribution: full | extract | forbidden`
> as a field on each source. `schemas/source/source.schema.json` has no such
> property and is `additionalProperties: false`, and schemas are outside this
> lane's owned paths. The value is therefore carried as the leading token of
> `notes` and a schema change is requested in
> [`docs/rfc/P0-3-01.md`](../../docs/rfc/P0-3-01.md). Anything parsing this
> pack should read the RFC before depending on the `notes` convention.

`impots.gouv.fr` editorial pages (the FAQ, the notice, the form landing pages)
are **not** part of the open-data distribution. Their licence is recorded as
`Not verified`, and they are treated as `extract` too.

---

## 4. What the sources actually establish

This section is a map of the terrain, not doctrine. Nothing here is a rule; no
rule YAML ships in this PR (that is **P0-3-03**).

### 4.1 The individual disposal regime (well sourced)

CGI art. 150 VH bis, created by the loi de finances pour 2019 (art. 41), taxes
occasional disposals of digital assets by individuals. It is documented by
BOFiP from **2019-09-02** (`BOI-RPPM-PVBMC-30-10 / -20 / -30`), i.e. more than
eight months after the regime began to govern. Three things in it matter to a
tax engine:

- **The 305 € floor.** Where total disposal proceeds for the year do not exceed
  305 €, the gains are exempt. It is a *proceeds* threshold, not a gains one.
- **Exchange without soulte is outside the charge.** Crypto-to-crypto without a
  cash balancing payment is not a taxable disposal under this article.
- **The computation is portfolio-wide, and it is not FIFO.** The gain uses the
  total acquisition price of the whole portfolio scaled by the disposal price
  over the portfolio's global value at the moment of disposal
  (`BOI-RPPM-PVBMC-30-20`). Any engine that assumes FIFO for France is wrong.

### 4.2 Which category (period-sensitive, sourced)

| Period | Occasional | "Professional-like" buying/selling | Mining |
| --- | --- | --- | --- |
| before 2019 | art. 150 UA (CE 26 avr. 2018) | BIC | BNC (art. 92) |
| 2019 – 2022 | art. 150 VH bis | BIC (`BOI-BIC-CHAMP-60-50-20190902`) | BNC (art. 92) |
| from 2023 | art. 150 VH bis | BNC art. 92, 2° (LF 2022 art. 70) | BNC (art. 92) |

The 2023 shift is why both the 2019 and the 2023 BOFiP versions of
`BOI-BIC-CHAMP-60-50` and `BOI-BNC-CHAMP-10-10-20-40` are indexed separately.
An as-of query for a 2021 trader **must** return the 2019 text.

### 4.3 Rates and the option (sourced, with a striking date gap)

CGI art. 200 C: 12,8 % flat, plus 17,2 % prélèvements sociaux levied under the
code de la sécurité sociale (that source is **not yet indexed** — see §6). The
option for the barème progressif comes from LF 2022 art. 79 and applies to
disposals **from 2023-01-01**, but the BOFiP commentary on it
(`ACTU-2024-00078`, and the revised `BOI-RPPM-PVBMC-30-30`) appeared only on
**2024-04-23**. A taxpayer filing for 2023 had the statute and no doctrine.

### 4.4 NFTs: the gap, and the two dates that closed part of it

This is the part the France pack exists for, and it must be stated exactly.

**For VAT:** there was **no French administrative guidance specific to NFTs
until 2024-02-14**, when `BOI-RES-TVA-000140` was published. It states that
non-fungible tokens have no specific VAT regime, that the analysis looks
through the token to the underlying good or service, and that a JNF is not a
payment, utility or investment token — so NFT operations sit outside the
financial exemption of CGI art. 261 C. Searching for earlier French NFT VAT
doctrine returned nothing at the publisher. **The absence is the finding.** For
2021, 2022 and 2023 the correct machine answer is `UNSETTLED`, and the 2024
rescrit must not be back-projected onto those years.

**For income tax:** France had no NFT-specific charging provision at all until
**CGI art. 150 VH ter**, created by the loi n° 2026-534 du 25 juin 2026 (art.
91) and applying to disposals **from 2026-01-01** — enacted roughly six months
into the period it governs. It taxes a unique, non-fungible crypto-asset under
the regime of the good or right it represents, and routes to CGI art. 150 VI
where that good is a listed object of art or collection. In parallel, art. 150
VH bis was recast on **2026-06-28** to key off the MiCA perimeter
(règlement (UE) 2023/1114), whose art. 2(3) excludes unique, non-fungible
crypto-assets.

So the honest picture for an NFT artist is three eras, and the pack must be
able to tell them apart:

| Disposal year | Income tax | VAT |
| --- | --- | --- |
| 2021 – 2023 | `UNSETTLED` — art. 150 VH bis says "actifs numériques" via CMF art. L. 54-10-1 and is silent on fungibility | `UNSETTLED` until 2024-02-14 |
| 2024 – 2025 | `UNSETTLED` | rescrit available: look through to the underlying |
| from 2026 | art. 150 VH ter: regime of the underlying good or right | rescrit available |

**MiCA does not settle "is this an NFT".** Its recitals treat issuance in a
large series or collection as an *indicator of fungibility*, and say a unique
identifier alone is not enough. That is a facts question about a specific
collection, so the pack must ask the user, not classify silently.

### 4.5 Artist-author, royalties, and what is genuinely unresolved

CGI art. 93, 1 quater taxes authors' droits d'auteur under the traitements et
salaires rules **when they are fully declared by third parties**. CSS art.
L. 382-1 sets the artistes-auteurs social scheme, collected by URSSAF since
2019-01-01.

Neither text has been applied to on-chain royalties by any source indexed here.
On the sources we hold, no NFT marketplace is a "tiers déclarant" in the sense
of art. 93, 1 quater, and an on-chain royalty enforced by a smart contract is
not obviously a droit d'auteur at all rather than a contractual resale share.
The pack must ask for facts (capacity, whether a copyright licence was granted,
who declares what) and emit `REVIEW_REQUIRED` — plan 15 is explicit that this
must not be silently picked.

### 4.6 Digital art and the 5,5 % VAT rate

The reduced rate on works of art was generalised to all supplies from
2025-01-01 by the loi de finances pour 2024 (art. 83), transposing Directive
(EU) 2022/542. But "œuvre d'art" is defined by the **closed list** at CGI ann.
III art. 98 A, which enumerates physical media — paintings executed by hand,
limited-run engravings, sculptures, photographs signed and numbered within 30
copies. Nothing in it addresses a purely digital work. The reduced rate
therefore **must not** be asserted for a digital-only NFT on the sources
indexed here.

### 4.7 Reporting

CGI art. 1649 bis C requires declaring digital-asset accounts held abroad,
via form 3916/3916-bis, with penalties at CGI art. 1736 (750 € per account,
125 € per omission, doubled above a 50 000 € portfolio value, capped at
10 000 € per declaration). Doctrine: `BOI-CF-CPF-30-20-20210526` — **published
2021-05-26, so it is available for as-of queries from that date.**

Whether a self-custodied wallet is a "compte ouvert auprès d'une entreprise,
personne morale, institution ou organisme" is not answered by anything indexed
here. For on-chain users this is the single most consequential open question in
the reporting domain, and it stays `UNSETTLED`.

At EU level, DAC8 (Directive (EU) 2023/2226) changes what service providers
report about a taxpayer. It does not change how the taxpayer is taxed, and must
not be modelled as if it did.

---

## 5. Time Machine anchors

Plan 15 requires that a 2021 question be answerable with 2021-available
material, and that later guidance be visibly later. The dated pairs below are
the raw material for the **P0-3-06** fixtures.

| Question | 2021-available source | Later source |
| --- | --- | --- |
| Text of art. 150 VH bis | `fr-cgi-150-vh-bis-2019` (« actifs numériques », CMF L. 54-10-1) | `fr-cgi-150-vh-bis-2026` (« crypto-actifs », MiCA) |
| Modalités / obligations déclaratives | `fr-bofip-rppm-pvbmc-30-30-2019` (02/09/2019) | `fr-bofip-rppm-pvbmc-30-30-2024` (23/04/2024) |
| Habitual trading | `fr-bofip-bic-champ-60-50-2019` (BIC) | `fr-bofip-bic-champ-60-50-2023` (post-LF 2022 boundary) |
| Mining | `fr-bofip-bnc-champ-10-10-20-40-2019` | `fr-bofip-bnc-champ-10-10-20-40-2023` |
| NFT VAT | **none** | `fr-bofip-res-tva-000140-2024` (14/02/2024) |
| NFT income tax | **none** | `fr-cgi-150-vh-ter` (25/06/2026) |

The two `none` rows are the ones that matter most. A Time Machine that produces
an answer for them in 2021 is lying.

Légifrance serves a version-pinned URL of the form
`…/codes/article_lc/<LEGIARTI id>/<YYYY-MM-DD>`, which resolves to the wording
in force at that date. `fr-cgi-150-vh-bis-2019` uses it, pinned to 2021-06-30,
and the page confirms the window **24/05/2019 – 27/06/2026**. This is a real
2021 artefact, not a reconstruction.

### Archival coverage — UNVERIFIED

The Wayback availability API was queried for 2021 snapshots of the BOFiP and
impots.gouv.fr pages and returned **HTTP 429 (rate limited)** on every attempt
from this network. **No claim is made about archive coverage.** Reproduce with:

```sh
curl -sS "https://archive.org/wayback/available?url=<url>&timestamp=20211231"
```

Establishing (or failing to establish) 2021 coverage, and submitting captures
where it is missing, is **P0-0-11**. Until it is done, the pack must not imply
it can produce a 2021 page it has never held.

---

## 6. Known gaps in this index

Recorded so the next contributor starts from the edge of what is known.

**Not yet indexed, and needed:**

- Prélèvements sociaux (17,2 %): code de la sécurité sociale, CSG/CRDS on
  revenus du patrimoine. Cited throughout §4 but no source record exists.
- CGI art. 34 (BIC definition) — no Légifrance URL was resolved; the doctrine
  at `BOI-BIC-CHAMP-60-50` is indexed instead.
- CGI art. 261 C (financial exemptions) — named by the 2024 NFT rescrit.
- CGI art. 278-0 bis and art. 297 A — VAT rate and margin scheme for works of
  art after the loi de finances pour 2024.
- Loi n° 2023-1322 du 29 décembre 2023 de finances pour 2024, art. 83 — cited
  from the EU record but not indexed as a French source.
- CGI art. 100 bis (revenue averaging for artistic BNC income).
- Code de la propriété intellectuelle art. L. 122-8 (droit de suite) — not tax,
  but the closest legal analogue to a resale royalty.
- URSSAF artistes-auteurs guidance on what counts as an œuvre and as revenue.
- Per-year PDFs of form 2086 (CERFA 16043*03 … *07). The landing page is
  indexed; the per-year PDFs are the real as-of artefacts and are the right
  next capture.

**Unresolved questions about sources already indexed:**

- Légifrance attributes a version of art. 150 VH bis taking effect 2026-07-01
  to the ordonnance n° 2024-936 du 15 octobre 2024, art. 26, while the wording
  we captured takes effect 2026-06-28 from the loi n° 2026-534. The
  relationship between the two consolidations was not resolved. Recorded in
  `fr-cgi-150-vh-bis-2026`.
- `publication_date` on French statutes is the **date of the law itself**; the
  Journal officiel issue date follows within days and was not re-verified.
- The codified Légifrance page for art. 150 VH ter was not captured; the
  article was read through the JORF article of the loi n° 2026-534.
- Paragraph numbering inside CGI art. 1736 was not transcribed. Do not build a
  penalty rule on that record without re-reading the article.

**Deliberately absent:**

- No `content_hash` on any Légifrance record (§2) — restated here because it
  is the one integrity gap this log will not paper over.
- Rules now exist (**P0-3-03**, [`rules/README.md`](rules/README.md)), but only
  where citable: thirteen of them, five saying `UNSETTLED`. The gaps listed
  above are the reason the other domains stay unmodelled, and
  [`rules/README.md`](rules/README.md) says which of them blocks what.
- No `SOURCE_VERIFIED` or `EXPERT_REVIEWED` label anywhere. The pack is
  `COMMUNITY_DRAFT` and the UI must say expert review is absent.

---

## 7. Re-verification

Re-check at least every 12 months (the validator warns past that) and whenever
a finance law lands. Bump `last_source_verification` in
[`jurisdiction.yaml`](jurisdiction.yaml) only after actually re-fetching.

```sh
# Digest drift on the hashed records:
curl -sSL "<canonical_url>" | sha256sum
```

A changed digest means re-read the page and decide whether the doctrine moved.
If it did, add a **new dated source record** and link it with
`supersedes` / `superseded_by`. Never overwrite a historical record: plan 05
§28 is explicit that current text must not overwrite historical text, and every
as-of answer this pack has ever given depends on the old record still existing.
