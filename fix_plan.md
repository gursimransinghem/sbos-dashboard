# SBOS Dashboard Fix Plan
> Created: 2026-03-13 from Monarch CSV analysis (8,720 transactions)

## Task 1: Fix Data Accuracy (spending caps from real Monarch data)
**Update `src/data.js` spendingCategories with March 2026 actuals:**
- Food Delivery: cap $400, **spent $679** (Uber Eats $368 + DoorDash $89 + Instacart $222) — OVER CAP
- Shopping: cap $1,500, **spent $1,522** (Shopping $1,328 + Electronics $194) — OVER CAP
- Dining Out: cap $500, **spent $622** (Restaurants & Bars) — OVER CAP
- Entertainment: cap $200, **spent $141** (Entertainment & Recreation)
- PlayStation: cap $0, spent $0

## Task 2: Replace NetWorth with WealthDiagnostic
- WealthDiagnostic.jsx already exists and is more comprehensive (ratios, cash flow, projections)
- Swap `<NetWorth />` for `<WealthDiagnostic />` in App.jsx
- Can remove NetWorth.jsx import

## Task 3: Add CashFlow/Income Analysis Component
**Build `src/components/CashFlowAnalysis.jsx` using Monarch CSV summary data:**
- Monthly income: ~$49.6k (Mar partial), avg ~$90k/mo from last 6 months
- Monthly spending breakdown by category
- Income vs spending trend (6-month history)
- Hardcode the aggregated CSV data into a new data export

## Task 4: Add SpendingTrends Component
**Build `src/components/SpendingTrends.jsx`:**
- 6-month spending trend chart (bar + line)
- Category breakdown over time
- Month-over-month comparison
- Highlight months where spending exceeded income

## Task 5: Polish Layout & Collapsible Sections
- Add collapsible section wrapper component
- Improve responsive grid layout
- Ensure all sections work on mobile (min 340px)
- Add section numbering for command center aesthetic

## Task 6: Build, Verify, Deploy
- `npm run build` — must pass with no errors
- Verify all charts render (check for import issues)
- Deploy: `cp -r dist/* /Users/claud/.openclaw/workspace/dashboards/sbos-app/`
