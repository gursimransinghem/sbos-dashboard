# Coding Conventions

**Analysis Date:** 2026-03-14

## Naming Patterns

**Files:**
- Components: PascalCase (e.g., `DebtAvalanche.jsx`, `Section.jsx`, `NetWorth.jsx`)
- Data/utilities: camelCase (e.g., `data.js`)
- Styles: `index.css` for global styles

**Functions:**
- Component functions: PascalCase matching filename
- Helper functions: camelCase (e.g., `fmt`, `fmtExact`, `getPayoffDate`, `simulateAvalanche`)
- Nested component functions within files: PascalCase (e.g., `CardRow`, `OtherDebtRow`, `CustomTooltip`, `GaugeRing`)
- Utility formatters: abbreviated camelCase (e.g., `fmt()` for currency, `fmtExact()` for decimal precision)

**Variables:**
- Data objects: camelCase (e.g., `creditCards`, `billsSummary`, `allocationData`)
- Constants/configurations: camelCase (e.g., `statusColor`, `statusLabel`, `scenarios`, `spendingCaps`)
- React state: descriptive camelCase (e.g., `open`, `setOpen`, `showScenarios`, `setShowScenarios`)
- Loop counters: single letter acceptable for chart iteration (e.g., `i`, `idx`)

**Types/Objects:**
- No explicit TypeScript but data structures follow clear shape patterns
- Status constants defined as objects: `{ ATTACK: '#ef4444', LOCKED: '#f59e0b', MINIMUM: '#64748b' }`
- Color mappings: defined as constants before component definition

## Code Style

**Formatting:**
- ESLint configured with `@eslint/js` recommended rules
- React Hooks plugin enabled (`eslint-plugin-react-hooks`)
- React Refresh plugin enabled (`eslint-plugin-react-refresh`)
- No Prettier config — ESLint rules define style
- Indentation: 2 spaces (implicit, follow existing)

**Linting:**
- Rule: `no-unused-vars` with pattern `^[A-Z_]` — allows unused ALL_CAPS constants and PascalCase components
- ESLint target: ES 2020, JSX enabled
- Browser globals enabled via `globals.browser`

**Inline Styles:**
- All styling done with React inline `style` objects — no CSS classes except Recharts overrides
- CSS variables used extensively for themeing: `var(--bg-surface)`, `var(--cyan)`, `var(--red)`, etc.
- Color tokens defined in `src/index.css`:
  - Backgrounds: `--bg-deep`, `--bg-surface`, `--bg-elevated`, `--bg-hover`
  - Accents: `--cyan`, `--amber`, `--red`, `--green`, `--purple` (all with `-dim` variants)
  - Text: `--text-primary`, `--text-secondary`, `--text-muted`
  - Borders: `--border`, `--border-accent`
  - Fonts: `--font-display` (Outfit), `--font-mono` (JetBrains Mono)

**Component Structure:**
- Helper functions and constants defined BEFORE component export
- State hooks at top of component function
- Large data transformations happen at module level (e.g., chart data pre-calculated in `DebtAvalanche.jsx`)
- Inline functions for row/card renderers to keep parent readable (e.g., `CardRow()`, `OtherDebtRow()`)

## Import Organization

**Order:**
1. React imports: `import { useState, useContext, ... } from 'react'`
2. Third-party libraries: `import { BarChart, Bar, ... } from 'recharts'`
3. Local data: `import { creditCards, otherDebts, ... } from '../data'`

**Path Aliases:**
- No path aliases configured
- Relative imports used: `../data`, `../components`

## Error Handling

**Patterns:**
- No try-catch blocks observed in current codebase
- No error boundaries implemented
- Defensive calculations: use fallback values (e.g., `Math.max(0, surplus)`)
- Null/undefined checks implicit in template expressions
- Invalid data conditions handled with conditional rendering (e.g., `cap === 0` shows disabled state)

## Logging

**Framework:** `console` not used in visible code

**Patterns:**
- No debug logging in components
- Data calculations are transparent in code (not hidden behind logging)
- Status indicators (badges, colors) serve as user-facing "logging" of state

## Comments

**When to Comment:**
- Section dividers for major blocks (e.g., `{/* Interest burn rate badge */}`)
- Algorithm explanations (e.g., `simulateAvalanche()` function has step-by-step comments)
- Data source attribution (e.g., `// from Monarch CSV — 6 months`)
- Complex calculations (e.g., interest compounding formulas)
- Config overrides (e.g., `// assume $35 min per active card`)

**JSDoc/TSDoc:**
- Not used — JavaScript without TypeScript annotations
- Comments are single-line block dividers or inline explanations

## Function Design

**Size:**
- Components typically 100-500 lines (e.g., `DebtAvalanche.jsx` is 489 lines but self-contained)
- Helper functions are small (20-50 lines max)
- Data transformation functions at module level for clarity

**Parameters:**
- Components accept props object: `function CardRow({ card })`
- Helper functions take single argument when possible (e.g., `fmt(n)`, `getPayoffDate(months)`)
- Multi-param functions group related args: `function GaugeRing({ spent, cap, color, size = 80 })`

**Return Values:**
- Components return JSX fragments or sections
- Helper functions return formatted strings or computed values
- Calculations return objects with multiple related values (e.g., `simulateAvalanche` returns `{ monthData, totalInterest, payoffDates }`)

## Module Design

**Exports:**
- `src/main.jsx`: Exports App component
- `src/App.jsx`: Default export of root component
- Component files: `export default function ComponentName() { ... }`
- `src/data.js`: Named exports of all data constants (no default export)
  - Example: `export const creditCards = [...]`, `export const totalCCDebt = ...`

**Barrel Files:**
- Not used — each component is its own file
- Components imported directly: `import DebtAvalanche from './components/DebtAvalanche'`

**Module-level Data:**
- Constants defined at top of component files before export
- Pre-calculated chart data (e.g., `trajectoryData`, `simResults`) defined before component to avoid recalculation
- Data flows: components import from `data.js`, calculate derived values, render
- Example pattern in `DebtAvalanche.jsx`:
  ```javascript
  const scenarios = [...]
  const simResults = scenarios.map(s => ({ ...s, ...simulateAvalanche(...) }))
  const trajectoryData = [] // build from simResults
  export default function DebtAvalanche() { ... }
  ```

## Theme & Design System

**Color System:**
- Dark theme (deep navy base `#0a0e17`)
- Neon accents (cyan, amber, red, green, purple)
- Semantic usage:
  - Red for danger/high-priority debt
  - Green for positive/payoff progress
  - Amber for warning/medium-priority
  - Cyan for neutral info/primary accent
  - Purple for secondary/supporting
- Dim variants for background tints

**Typography:**
- Display font: Outfit (headings, section titles, brand text)
- Mono font: JetBrains Mono (body text, numbers, code-like display)
- Font sizes: 0.6rem to 2.2rem scale with purpose
- Example usage: `fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700`

**Spacing:**
- Gaps and padding in 4px increments: 4px, 6px, 8px, 12px, 16px, 20px, 24px, 28px
- Common patterns: `gap: '16px'`, `padding: '12px 16px'`, `margin: '8px 0'`

---

*Convention analysis: 2026-03-14*

---
Created: 2026-03-24
Last Reviewed: 2026-03-24
Last Edited: 2026-03-24
Review Notes: Freshness footer added during comprehensive audit.
