# SBOS Dashboard

## What This Is
React + Recharts financial dashboard for tracking debt avalanche progress and net worth visualization.
Displays Sim's SBOS (Snowball OS) status: debt breakdown, net worth trends, income vs expenses.

## Quick Start
- **To run dev server**: `npm run dev`
- **To build**: `npm run build`
- **To deploy**: Deploy dist/ folder
- **Data source**: Real data loaded at runtime from config (no hardcoded secrets)

## File Map
| Path | Purpose | Tags |
|------|---------|------|
| `/src/` | React components, hooks, utilities | code, active |
| `/public/` | Static assets (images, etc) | assets |
| `/package.json` | Dependencies, build scripts | config, active |
| `/vite.config.ts` | Build configuration | config, active |
| `/tasks/todo.md` | Current work items | tracking, active |
| `/tasks/lessons.md` | Lessons learned | tracking, active |
| `/docs/` | Component specs, design decisions (NEW) | reference |
| `/_archive/` | Old planning docs | archive |

## Authority Chain
1. **CLAUDE.md** — This file. Quick reference.
2. **package.json** — Dependency authority. React + Recharts only.
3. **src/** — Implementation authority.
4. **docs/** — Reference only.

## Workflow Routing
- **Component development** → Load: src/ + CLAUDE.md
- **Dependency update** → Load: package.json + docs/STACK.md
- **Design review** → Load: src/ + docs/

## Project-Specific Rules
- **React + Recharts only** — no additional charting libraries
- **Financial data is sensitive** — no real account numbers in source code
- **Use mock data in codebase** — real data loaded at runtime from config
- **Keep charts responsive** — desktop and mobile viewing
- **No secrets in repo** — all sensitive data from environment/config at runtime

---
Created: 2026-04-02
Last Reviewed: 2026-04-06
Last Edited: 2026-04-06
Review Notes: Phase 5 upgrade - added file map, authority chain, workflow routing
