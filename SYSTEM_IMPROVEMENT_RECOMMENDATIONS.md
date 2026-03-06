# SBOS Dashboard — System Improvement Recommendations

> Generated: March 6, 2026
> Scope: Full codebase audit of the SBOS (Sim's Business Operating System) Dashboard

---

## Executive Summary

The SBOS Dashboard is a well-designed personal life management and financial tracking system built with React 18, Tailwind CSS, and Babel Standalone. The UI is polished, component patterns are clean, and the system covers 7 life pillars effectively. However, there are meaningful opportunities to improve **data architecture, performance, reliability, and maintainability** that would transform this from a functional prototype into a robust, scalable tool.

---

## Priority 1 — Critical Improvements

### 1.1 Replace Hardcoded Data with an External Data Source

**Problem:** All financial figures, goals, tasks, and life area scores are hardcoded directly in HTML files. Updating any value requires editing source code and redeploying.

**Affected files:**
- `index.html:287-300` — Goals array with static progress values
- `finance-dashboard.html:82-102` — Debt balances, budget allocations, monthly history
- `index.html:147` — Date hardcoded as "Tuesday, March 3, 2026" instead of being dynamic

**Recommendation:**
- Extract all data into a `data/` directory with JSON files (e.g., `data/goals.json`, `data/finances.json`)
- Load data with `fetch()` at runtime so HTML files stay static
- Long-term: integrate with the Notion API to pull data directly from existing Notion workspaces, eliminating manual data entry entirely

### 1.2 Fix the Hardcoded Date Display

**Problem:** `index.html:147` displays a static string `"Tuesday, March 3, 2026"` rather than computing the current date dynamically.

**Fix:** Replace the hardcoded string with a dynamic date formatter:
```jsx
const dateStr = now.toLocaleDateString('en-US', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});
```

### 1.3 Eliminate In-Browser Babel Compilation

**Problem:** Every page loads Babel Standalone (~300KB) and compiles JSX in the browser on each page load. This adds significant latency and bandwidth cost.

**Recommendation:**
- Adopt a lightweight build tool like **Vite** with the React plugin
- Pre-compile JSX at build time so browsers receive optimized JavaScript
- Expected improvement: ~1-2 second faster initial load, ~300KB smaller payload

---

## Priority 2 — High-Impact Improvements

### 2.1 Fix Memory Leaks in Animations and Timers

**Problem:** Several components have missing cleanup for `requestAnimationFrame` and `setInterval`.

**Affected code:**
- `finance-dashboard.html:106-117` — `AnimatedNumber` calls `requestAnimationFrame` in a `useEffect` but never cancels it on unmount
- `finance-dashboard.html:297`, `index.html:139`, `sbos-launchpad.html:63` — Multiple `setInterval` timers running concurrently

**Fix for AnimatedNumber:**
```jsx
useEffect(() => {
  let rafId;
  const tick = () => {
    // ... animation logic
    if (progress < 1) rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(rafId); // cleanup
}, [value]);
```

### 2.2 Replace innerHTML with React in Menu Bar

**Problem:** `sbos-menubar.html:71` uses `document.getElementById("app").innerHTML` with template literals instead of React's rendering. This bypasses React's virtual DOM and is an XSS risk if data ever becomes dynamic.

**Recommendation:** Convert to use `ReactDOM.createRoot()` with proper React components, consistent with the other dashboard pages.

### 2.3 Add Error Boundaries and Fallback UI

**Problem:** No error handling exists anywhere in the codebase. If any data is malformed or a calculation throws, the entire dashboard crashes with a white screen.

**Recommendation:**
- Add a React Error Boundary component wrapping each major dashboard section
- Add `try-catch` around data transformations (debt calculations, progress computations)
- Display a user-friendly fallback message instead of a blank page

### 2.4 Improve React Rendering Patterns

**Problem:** Several anti-patterns exist:
- `index.html:111-122` — Using array index as `key` in `.map()` for SVG elements (can cause rendering bugs if data reorders)
- No use of `useMemo` for expensive calculations (radar chart coordinate math, debt projections)

**Fix:**
- Use stable, unique identifiers as keys instead of array indices
- Wrap expensive computations in `useMemo` to prevent recalculation on every render

---

## Priority 3 — Medium-Impact Improvements

### 3.1 Consolidate Code Architecture

**Current state:** 5 standalone HTML files, each ~100-530 lines, with duplicated React setup, styles, and utility components.

**Recommendation:**
- Extract shared components (`ProgressBar`, `AnimatedNumber`, navigation) into reusable modules
- Create a shared CSS/Tailwind configuration instead of per-file inline styles
- Use a single entry point with client-side routing (e.g., React Router) to navigate between dashboards

### 3.2 Add Accessibility (a11y) Support

**Gaps identified:**
- No `aria-label` attributes on interactive SVG charts (radar chart, donut charts)
- Checkbox inputs in `index.html` lack associated `<label>` elements
- Color-only status indicators (red/yellow/green) have no text alternative for colorblind users
- No keyboard navigation support for custom button elements

**Recommendation:**
- Add `role` and `aria-label` to all interactive and decorative elements
- Ensure all buttons/links are keyboard-focusable
- Add visible focus indicators
- Test with a screen reader (VoiceOver/NVDA)

### 3.3 Protect Notion Workspace Links

**Problem:** `sbos-launchpad.html:33-51` exposes Notion workspace IDs in public HTML source. Anyone viewing the page source can access these workspace URLs.

**Recommendation:**
- If the repo is public, move Notion URLs to an environment variable or a private configuration file excluded from version control
- Alternatively, use a lightweight proxy/redirect service that maps short codes to Notion URLs

### 3.4 Add a Testing Foundation

**Current state:** Zero tests exist.

**Recommendation:**
- Start with unit tests for financial calculation logic (debt payoff projections, avalanche strategy ordering, progress percentages)
- Add component tests for key UI elements using React Testing Library
- Consider end-to-end tests for critical flows with Playwright

### 3.5 Upgrade Dependencies

**Current versions:**
| Dependency | Current | Latest |
|---|---|---|
| Tailwind CSS | 2.2.19 (CDN) | 4.x |
| Babel Standalone | 7.23.9 | 7.26.x |
| React | 18.2.0 | 19.x |

**Recommendation:** If staying with CDN-based loading, pin to latest stable versions. If adopting a build tool (recommended), manage versions via `package.json`.

---

## Priority 4 — Nice-to-Have Improvements

### 4.1 Add Progressive Web App (PWA) Support
- Add a service worker for offline caching
- Add a `manifest.json` for installability
- Enable push notifications for task reminders

### 4.2 Add Data Persistence
- Use `localStorage` as a lightweight persistence layer for task completion state and settings
- Sync with Notion API for cross-device access

### 4.3 Improve Documentation
- Expand `README.md` with setup instructions, architecture overview, and screenshots
- Add JSDoc comments to complex utility functions (debt calculations, chart coordinate math)

### 4.4 Add Dark Mode Support
- The dashboard is used morning and evening; dark mode would reduce eye strain
- Tailwind's `dark:` variant makes this straightforward

---

## Summary Table

| # | Improvement | Priority | Effort | Impact |
|---|---|---|---|---|
| 1.1 | External data source | Critical | Medium | High |
| 1.2 | Dynamic date display | Critical | Low | Medium |
| 1.3 | Pre-compiled JSX (build tool) | Critical | Medium | High |
| 2.1 | Fix memory leaks (RAF/timers) | High | Low | Medium |
| 2.2 | Replace innerHTML with React | High | Low | Medium |
| 2.3 | Error boundaries | High | Low | High |
| 2.4 | React rendering patterns | High | Low | Medium |
| 3.1 | Consolidate architecture | Medium | High | High |
| 3.2 | Accessibility | Medium | Medium | Medium |
| 3.3 | Protect Notion URLs | Medium | Low | Medium |
| 3.4 | Testing foundation | Medium | Medium | High |
| 3.5 | Upgrade dependencies | Medium | Low | Low |
| 4.1 | PWA support | Low | Medium | Medium |
| 4.2 | Data persistence | Low | Medium | High |
| 4.3 | Documentation | Low | Low | Low |
| 4.4 | Dark mode | Low | Low | Low |

---

*These recommendations are ordered by risk and impact. Starting with Priority 1 items will yield the greatest stability and maintainability gains with moderate effort.*
