# @octc/core

Primitives every other package shares: decimal money, zoned time, identifiers,
content hashing, and the enum vocabularies from plans 02–06 and 09.

`core` has no chain HTTP, no tax rules and no jurisdiction knowledge — those
belong to `event-engine`, `rules-engine` and the packs under `jurisdictions/`.
