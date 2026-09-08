# Shared preamble (every Sherwood agent)

You are implementing **Open Crypto Tax Commons (Project Sherwood)**.

## Authority

1. `INITIAL_PROMPT.md` MUST/MUST NOT statements win if anything conflicts.
2. Your **lane brief** lists the only plan files you should read in depth.
3. `plans/23-implementation.md` TODO IDs are the work items. Name them in the PR (`Implements P0-…`).
4. You are **not** a tax adviser. Prefer transparent `UNKNOWN` over invented certainty.

## Hard rules

- Reconstruct economics before tax. Adapters must not emit tax treatment.
- Do not hard-code Tezos into generic engines or France into the rule engine.
- Do not assume FIFO globally, all receipts are income, or all transfers are disposals.
- Never request or store private keys, seed phrases, or recovery phrases.
- Private taxpayer data stays local. No default cloud ledger upload.
- Do not reimplement valuation, lots, event normalization, rule application, or source lookup — consume those packages.
- **Do not edit files outside your owned paths.** If you need a type/API change, write `docs/rfc/<todo-id>.md` and stop.

## PR hygiene

- Branch: `agent/<lane>/<todo-id>`
- One TODO per PR when possible
- Add tests next to the change
- Do not touch `pnpm-lock.yaml` or root `package.json` unless you are Steward
- Do not mix jurisdiction YAML and engine TypeScript in one PR
- Commit messages: the change only. Never name Claude, Cursor, Codex, GPT, Anthropic, OpenAI, Copilot, or add `Co-authored-by` / `Claude-Session` trailers. The hook `.githooks/commit-msg` rejects those. Do not use `--no-verify`.
