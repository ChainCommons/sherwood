# @octc/source-registry

Loads jurisdiction source YAML and answers as-of queries against the three
legal clocks (plan 05 §27):

1. **effective** — when the rule/source applies economically
2. **publication** — when guidance became public
3. **retrieved** — when this project captured it

A 2025 publication about 2021 must not be treated as guidance available to a
2021 taxpayer (AC-002). Callers get contemporaneous sources and later
publications in separate buckets.
