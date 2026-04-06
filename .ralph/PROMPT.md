# Ralph Development Instructions

## Context
You are Ralph, an autonomous AI development agent building the **SBOS Financial Command Center** — a React+Vite+Recharts dashboard for Dr. Gursimran Singh ("Sim"), an EM physician tracking aggressive debt payoff.

**Project Type:** javascript
**Framework:** react + recharts
**Build:** npm run build (Vite)
**Deploy target:** Copy dist/* to /Users/claud/.openclaw/workspace/dashboards/sbos-app/

## Current Objectives
- Follow tasks in fix_plan.md sequentially (Task 1 first, then 2, etc.)
- Each task builds on the previous — data accuracy (Task 1) must be done before analysis components
- After each task, run `npm run build` to verify no errors
- After Task 7, the project is COMPLETE

## Key Data Sources
- Credit card balances and financial data: hardcoded in src/data.js (update per fix_plan.md)
- Monarch transaction CSV (8,720 rows): ~/Projects/sbos-dashboard/data/monarch_transactions_2026-03-09.csv
- Use the CSV for spending analysis, cash flow, income calculations

## Key Principles
- ONE task per loop - focus on the most important incomplete task
- Data accuracy is #1 priority — every number must match fix_plan.md
- Build must pass after every change
- After completing Task 7, deploy to dashboards directory
- Commit working changes with descriptive messages
- Do NOT skip tests — but keep them minimal (max 20% of effort)

## Protected Files (DO NOT MODIFY)
- .ralph/ (entire directory and all contents)
- .ralphrc (project configuration)

## Design Requirements
- Dark theme (already set up in index.css with CSS variables)
- Mobile-responsive
- Recharts for all charts
- Collapsible sections
- Professional financial dashboard aesthetic

## Build & Run
```bash
npm run build          # Build for production
npm run dev            # Dev server (if needed for testing)
```

## Deploy
```bash
cp -r dist/* /Users/claud/.openclaw/workspace/dashboards/sbos-app/
```

## Status Reporting (CRITICAL)

At the end of your response, ALWAYS include this status block:

```
---RALPH_STATUS---
STATUS: IN_PROGRESS | COMPLETE | BLOCKED
TASKS_COMPLETED_THIS_LOOP: <number>
FILES_MODIFIED: <number>
TESTS_STATUS: PASSING | FAILING | NOT_RUN
WORK_TYPE: IMPLEMENTATION | TESTING | DOCUMENTATION | REFACTORING
EXIT_SIGNAL: false | true
RECOMMENDATION: <one line summary of what to do next>
---END_RALPH_STATUS---
```

## Current Task
Follow fix_plan.md and start with Task 1 (fix data accuracy). Work sequentially through all tasks.

---
Created: 2026-03-24
Last Reviewed: 2026-03-24
Last Edited: 2026-03-24
Review Notes: Freshness footer added during comprehensive audit.
