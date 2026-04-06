# Testing Patterns

**Analysis Date:** 2026-03-14

## Test Framework

**Runner:**
- Not detected — no test runner installed or configured

**Assertion Library:**
- Not applicable — no testing framework present

**Run Commands:**
```bash
npm run lint                # ESLint check (only linting available)
npm run dev                 # Run dev server (can verify behavior manually)
npm run build               # Build for production
npm run preview             # Preview built version
```

## Test File Organization

**Location:**
- No test files exist in the project
- Project structure: `src/` contains only component and data files
- No `__tests__/`, `tests/`, or `.test.js` files

**Naming:**
- Not applicable

**Structure:**
- Not applicable

## Test Coverage

**Requirements:**
- No coverage targets enforced
- No coverage measurement tools installed

## Test Types

**Unit Tests:**
- Not present — no unit test framework

**Integration Tests:**
- Not present — no integration test framework

**E2E Tests:**
- Not present — no E2E test framework

## Current QA Strategy

**Manual Testing Approach:**
- Run `npm run dev` to start Vite dev server (hot reload enabled)
- Visual inspection of rendered components
- Browser DevTools for debugging
- Manual verification of calculations (e.g., debt payoff simulations)

**Verification Points (Observable in Code):**
1. **Data Integrity:** `DebtAvalanche.jsx` pre-calculates `simResults` before render — values visible in DOM
2. **Formatting:** Helper functions `fmt()` and `fmtExact()` tested via visual output
3. **Chart Rendering:** Recharts components render with provided data
4. **State Management:** React DevTools can inspect state (e.g., `open`, `showScenarios`)

## Code Quality Tools

**Linting:**
- ESLint 9.39.4
- Config: `eslint.config.js` using FlatConfig
- Plugins:
  - `@eslint/js` (recommended rules)
  - `eslint-plugin-react-hooks` (React Hooks rules)
  - `eslint-plugin-react-refresh` (React Refresh rules)
- Command: `npm run lint`

**Formatting:**
- No Prettier configured
- ESLint rules enforce style implicitly

## Gaps & Recommendations

**Missing Test Infrastructure:**
- No test runner (Jest, Vitest, etc.)
- No assertion library
- No mock utilities
- No fixture/factory setup

**High-Risk Areas Without Tests:**
1. **Calculations** (`DebtAvalanche.jsx`):
   - `simulateAvalanche()` — complex 60-month debt payoff simulation
   - No automated verification of payoff dates or interest calculations
   - Risk: Off-by-one errors, interest rounding bugs, payoff date drift

2. **Data Flow** (`src/data.js`):
   - Aggregated totals (e.g., `totalCCDebt`, `billsSummary.total`) not verified
   - Risk: Stale or incorrect summary values cause cascading component bugs

3. **Number Formatting** (`fmt`, `fmtExact`):
   - Locale-specific currency formatting untested
   - Risk: Display errors for edge cases (negative numbers, large numbers, decimals)

4. **Component Integration:**
   - No verification that data flows correctly from `data.js` → components
   - No snapshot tests for rendered output
   - Risk: Silent breaking changes when refactoring

## Recommended Testing Setup

**Phase 1 — Immediate (Foundation):**
```bash
npm install --save-dev vitest @testing-library/react @testing-library/dom
npm install --save-dev jsdom
```

**Phase 2 — Unit Tests (High Impact):**
- Test `src/data.js` aggregations:
  - `totalCCDebt` matches sum of `creditCards[].balance`
  - `billsSummary.total` matches fixed + subs + installments
  - `netWorth` equals assets minus liabilities

- Test helper functions:
  - `fmt(1000)` returns `"$1,000"`
  - `fmtExact(100.5)` returns `"$100.50"`
  - `getPayoffDate(6)` returns correct date string

- Test `simulateAvalanche()`:
  - Verify 5-card debt payoff simulation
  - Test interest accumulation accuracy
  - Verify card-by-card payoff dates

**Phase 3 — Integration Tests (Component Behavior):**
- Render `DebtAvalanche` with sample data, verify scenario data displays
- Render `Section` with collapsible state, verify expand/collapse works
- Verify spending monitor gauge calculations match input percentage

**Example Test (Vitest + React Testing Library):**
```javascript
// src/data.test.js
import { describe, it, expect } from 'vitest';
import { creditCards, totalCCDebt, billsSummary } from './data';

describe('data.js aggregations', () => {
  it('totalCCDebt equals sum of credit card balances', () => {
    const sum = creditCards.reduce((acc, c) => acc + c.balance, 0);
    expect(totalCCDebt).toBe(sum);
  });

  it('billsSummary.total equals sum of all obligations', () => {
    const expected = billsSummary.fixed + billsSummary.subs + billsSummary.installments;
    expect(billsSummary.total).toBe(expected);
  });
});

// src/components/DebtAvalanche.test.jsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DebtAvalanche from './DebtAvalanche';

describe('DebtAvalanche', () => {
  it('renders credit card list', () => {
    render(<DebtAvalanche />);
    expect(screen.getByText(/Jess Prime/)).toBeInTheDocument();
  });

  it('displays total monthly interest burn', () => {
    render(<DebtAvalanche />);
    expect(screen.getByText(/interest burn/)).toBeInTheDocument();
  });
});
```

**Vitest Config (vitest.config.ts):**
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [],
  },
});
```

**Run Tests:**
```bash
npm run test                # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Generate coverage report
```

---

*Testing analysis: 2026-03-14*

---
Created: 2026-03-24
Last Reviewed: 2026-03-24
Last Edited: 2026-03-24
Review Notes: Freshness footer added during comprehensive audit.
