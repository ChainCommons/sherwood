# European Union (eu)

**Maturity: LEVEL 1 — sources indexed, no rules modelled.**

This pack exists to hold the EU instruments the **France** pack depends on, so
France can reference them instead of duplicating them (plan 15 §79). It is not
an EU tax pack and does not model any member state.

- [`sources/`](sources/README.md) — five indexed instruments: MiCA, the VAT
  Directive, the 2022 VAT-rates amendment, DAC8, and CJEU *Hedqvist*.
- No `rules/` yet. The VAT / place-of-supply skeleton is **P0-3-04**.

Nothing in this directory is tax advice. Every tax domain is listed as
unsupported in [`jurisdiction.yaml`](jurisdiction.yaml), so the UI reports "not
modelled" rather than implying that silence means no tax applies.

Adding content means following `CONTRIBUTING.md`: every rule needs a source, a
publication date, an effective period, a certainty level and test cases.
