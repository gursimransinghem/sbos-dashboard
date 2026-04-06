# SBOS Financial Command Center — Fix Plan

## Context
Building a 4-section financial dashboard (React + Vite + Recharts) at ~/Projects/sbos-dashboard/.
The spec is at /Users/claud/.openclaw/workspace/tasks/financial-dashboard-spec.md.
Monarch transaction data (8,720 rows) is at ~/Projects/sbos-dashboard/data/monarch_transactions_2026-03-09.csv.
Current state: 4 basic components exist but lack the deep analysis required by spec.
After building, deploy: copy dist/* to /Users/claud/.openclaw/workspace/dashboards/sbos-app/

## Data file to update: src/data.js
Update balances to match latest:
- Apple Card: $8,435 (not $6,583)
- Costco Citi: $3,790 @ 29.99%
- Jess Prime: $5,766 @ 27.49%
- Cap One QS: $4,650 @ 27.24% (LOCKED)
- Chase Sapphire: $15,157 @ 26.49%
- Sim Prime: $258
- Rent is $6,075 (not mortgage $3,365 — they rent, no mortgage)
- ChatGPT Plus is $200/mo (not $20)
- Claude Pro is $200/mo (not $20)
- MacBook Pro M5 installment should NOT be listed (user has M2, considering buying M5 later)
- Remove Augmedix from subscriptions (it's a work expense, not personal sub)

## Tasks

### Task 1: Fix data accuracy in src/data.js
- [ ] Update Apple Card balance to $8,435
- [ ] Fix rent vs mortgage: change "Mortgage" to "Rent" at $6,075, remove "Home Equity" from assets
- [ ] Update ChatGPT to $200/mo and Claude to $200/mo
- [ ] Remove MacBook Pro M5 installment (doesn't exist)
- [ ] Move Augmedix ($378) out of subscriptions
- [ ] Add fuboTV ($108), Paramount+ ($13), Peacock ($9) to subscriptions
- [ ] Recalculate all totals
- [ ] Remove Home Equity asset ($85,000) — they rent, don't own
- [ ] Remove Mortgage liability ($365,000) — they rent
- [ ] Doc2Doc monthly payments: #1 is $212.37/mo, #2 is $172.83/mo (not $450 and $350)
- [ ] Tesla payment is $2,314.50/mo (not $1,400)

### Task 2: Enhance DebtAvalanche component (Section 1: Debt Elimination Engineer)
- [ ] Add month-by-month avalanche payoff schedule table at 3 payment levels: $2k/mo (actual), $5k/mo, $10k/mo (planned)
- [ ] Calculate total interest paid under each scenario
- [ ] Show payoff date for each card under each scenario
- [ ] Add balance transfer analysis callout: Costco Citi $3,790 @ 29.99% to 0% APR card
- [ ] Add Doc2Doc refinancing analysis: 16-20% to 8-10%, calculate savings
- [ ] Add visual countdown showing each card hitting $0

### Task 3: Add WealthDiagnostic component (Section 2: Wealth Diagnostic)
- [ ] Replace current NetWorth with expanded WealthDiagnostic
- [ ] Parse Monarch CSV in a data utility (src/monarchData.js) for income/expense calculations
- [ ] Monthly cash flow analysis (income vs spending, last 3 months from Monarch data)
- [ ] Savings rate calculation
- [ ] Debt-to-income ratio visualization
- [ ] Liquidity ratio (cash / monthly expenses)
- [ ] Line chart showing net worth trajectory

### Task 4: Enhance SpendingMonitor (Section 3: Zero-Based Budget Builder)
- [ ] Add Needs vs Wants categorization for all spending categories
- [ ] Monthly budget template based on ~$35k/mo income with visual allocation
- [ ] Show fixed obligations total
- [ ] Subscription waste identification (highlight fuboTV overlap with YouTube TV)
- [ ] Spending cap enforcement with historical trend
- [ ] Surplus allocation visualization: actual debt attack ($2k) vs planned ($10k)
- [ ] Show the $8k/mo gap clearly

### Task 5: Add TaxOptimization component (Section 4: Tax Optimization — DUE APR 15, 2026)
- [ ] Create new TaxOptimization.jsx component
- [ ] Checklist of potential 2025 deductions with estimated values
- [ ] Countdown timer to April 15, 2026 deadline (33 days from Mar 13)
- [ ] Status tracker for tax doc gathering (W-2, 1099s, Coinbase)
- [ ] Print-friendly styling for this section

### Task 6: UI/UX Polish
- [ ] Make all sections collapsible (accordion style)
- [ ] Ensure mobile-responsive (test at 375px width)
- [ ] Add section navigation/tabs at top
- [ ] Smooth transitions and animations

### Task 7: Build, deploy, verify
- [ ] Run npm run build successfully
- [ ] Copy dist/* to /Users/claud/.openclaw/workspace/dashboards/sbos-app/
- [ ] Verify all charts render with no errors
- [ ] All data is accurate per the corrected balances above

## Completed
- [x] Project enabled for Ralph
- [x] Basic 4-component structure created (DebtAvalanche, SpendingMonitor, BillsCalendar, NetWorth)
- [x] Recharts integrated
- [x] Dark theme CSS variables set up
- [x] Build pipeline working (vite)

## EXIT CRITERIA
All tasks above are checked off. Dashboard builds without errors. All 4+ sections render with real data. Deployed to /Users/claud/.openclaw/workspace/dashboards/sbos-app/. Accessible via web server on port 8080.

---
Created: 2026-03-24
Last Reviewed: 2026-03-24
Last Edited: 2026-03-24
Review Notes: Freshness footer added during comprehensive audit.
