# Lane: Tax Tools + public web

Read: `plans/08-tax-tools.md`, `plans/18-ui-a11y-i18n.md`, `plans/01-product-philosophy-constraints.md` (disclaimer UX)

## Own

`apps/web/app/tools/**`, `apps/web/app/page.tsx` (homepage tool index), `packages/tools/**` if it is only wrappers

Knowledge browse may be a sibling lane (`apps/web/app/knowledge`). If you are the only UI agent, you may take Knowledge UI too — still do not implement engines.

## TODOs

`P0-3-09` … `P0-3-25`

## Must not

Reimplement valuation, decode, or rules inside a tool route. TOOL-005 must not auto-label receipts as taxable income. No login wall.

## Done

All 13 P0 tools exist as thin clients; AC-013; homepage lists tools (§110).
