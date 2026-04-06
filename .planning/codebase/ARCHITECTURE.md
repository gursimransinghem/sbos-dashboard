# Architecture

**Analysis Date:** 2026-03-14

## Pattern Overview

**Overall:** Component-Based Dashboard (React) with Static Data Layer

**Key Characteristics:**
- Vertical slice per financial topic (debt, spending, cash flow, wealth, taxes, etc.)
- Each topic encapsulated in a self-contained collapsible component
- All data centralized in a single immutable data object
- Heavy use of inline styles (CSS-in-JS) for theme-aware UI
- Recharts for visualization (bar charts, line charts, pie charts)
- No state management library (React hooks only for local UI state like collapse/expand)
- No API/backend — all computations client-side using hardcoded data

## Layers

**Data Layer:**
- Purpose: Single source of truth for financial data (income, debts, assets, transactions, etc.)
- Location: `src/data.js`
- Contains: Raw financial data (credit cards, fixed bills, subscriptions, monthly history, assets/liabilities)
- Depends on: Nothing
- Used by: All feature components (DebtAvalanche, SpendingMonitor, BudgetBuilder, etc.)

**Component Layer:**
- Purpose: Render financial widgets and charts
- Location: `src/components/`
- Contains: 10 feature components + 1 layout wrapper (Section)
- Depends on: `src/data.js` (imports), React, Recharts
- Used by: App root component

**App/Root Layer:**
- Purpose: Dashboard orchestration and layout
- Location: `src/App.jsx`
- Contains: Header, grid layout, section composition, global styles
- Depends on: All components, global CSS variables
- Used by: main.jsx entry point

**Styling Layer:**
- Purpose: Theme, typography, animations, recharts overrides
- Location: `src/index.css`
- Contains: CSS custom properties (colors, fonts, spacing), global rules, animations
- Used by: All components (via `var(--*)` references)

## Data Flow

**Single Direction (Components → Data):**

1. App mounts
2. Components import from `src/data.js`
3. Each component reads its relevant slice of data
4. Components format/compute derived values (e.g., `simulateAvalanche()` payoff projection)
5. Components render charts and tables using Recharts
6. Component state (like `open`/`close` in Section) managed locally with `useState()`

**Example: DebtAvalanche Component:**
- Reads: `creditCards`, `otherDebts`, `totalCCDebt`, `totalMonthlyInterest`, `paidOffCards` from `src/data.js`
- Computes: Avalanche payoff simulations for 3 payment scenarios ($2k, $5k, $10k/mo)
- Renders: Status badges, utilization bars, interest charts, scenario comparison tables
- State: `showScenarios` boolean (collapse/expand scenario section)

**State Management:**
- No Redux/Zustand — all data flows from imports
- Local UI state only (e.g., Section collapse, chart toggles) via `useState()`
- No mutations — data is read-only

## Key Abstractions

**Section Wrapper Component:**
- Purpose: Reusable collapsible card container for each financial topic
- Location: `src/components/Section.jsx`
- Pattern: Higher-order component (wrapper) — takes `children` + metadata (number, label, title, gradient)
- Used by: App.jsx to wrap all 8 feature components
- Handles: Collapse/expand state, header styling with gradient text, section numbering

**Financial Data Model:**
- Purpose: Represent credit cards, debts, assets, liabilities, transactions
- Location: `src/data.js`
- Pattern: Plain JS objects with calculated summary fields
- Examples:
  - `creditCards`: `{ name, balance, apr, limit, status, monthlyInterest }`
  - `fixedBills`: `{ name, amount, due }` (monthly recurring)
  - `assets/liabilities`: `{ name, value }`
- Computed fields: `totalCCDebt`, `totalMonthlyInterest`, `netWorth`

**Simulation Functions:**
- Purpose: Model financial scenarios (avalanche payoff, cash flow)
- Location: Inline in component files (e.g., `simulateAvalanche()` in DebtAvalanche.jsx)
- Pattern: Pure functions taking parameters (cards, payment amount) → results object
- Result: Month-by-month projection data fed to line/bar charts

**Formatting Helpers:**
- Purpose: Consistent currency/numeric display
- Location: Inline in each component (repeated)
- Pattern: `fmt(n)` → "$X,XXX", `fmtExact(n)` → "$X,XXX.XX"
- Issue: Not DRY — helpers defined in multiple files

**Theme Color System:**
- Purpose: Semantic colors for financial status (red=debt, green=savings, amber=warning)
- Location: `src/index.css` (CSS variables) + component inline style objects
- Pattern: `var(--red)`, `var(--green)`, etc.
- Used for: Status badges, chart colors, accent gradients

## Entry Points

**Browser Entry:**
- Location: `index.html` → `src/main.jsx`
- Triggers: Page load
- Responsibilities: Hydrate React, mount App component to #root

**App Component:**
- Location: `src/App.jsx`
- Triggers: React mount
- Responsibilities:
  - Layout: Flex container with 2-column responsive grid
  - Composition: Wrap each feature component in Section
  - Styling: Header with SBOS branding, footer with data timestamp
  - Animation: Blinking "live" status indicator

## Error Handling

**Strategy:** None currently implemented

**Patterns:**
- No try/catch blocks
- No error boundaries
- No validation of imported data
- Assumes data.js is always syntactically valid
- Division by zero risk in formulas (e.g., utilization %), unchecked

**Recommendation:** Add React Error Boundary around components; validate critical fields in data.js

## Cross-Cutting Concerns

**Logging:** None — no console.log or debug output

**Validation:** None — data assumed correct at import time

**Authentication:** Not applicable (client-only dashboard)

**Responsive Design:**
- Grid uses `minmax(360px, 1fr)` for auto-layout
- Inline styles handle mobile (no media queries)
- Fonts scale via rem units

**Accessibility:**
- Limited: semantic HTML not prioritized
- No ARIA labels
- Colors alone used for status (red=bad) — issue for color-blind users
- Collapsible sections have no focus management

---

*Architecture analysis: 2026-03-14*

---
Created: 2026-03-24
Last Reviewed: 2026-03-24
Last Edited: 2026-03-24
Review Notes: Freshness footer added during comprehensive audit.
