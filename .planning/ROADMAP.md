# Roadmap: SBOS Dashboard

## Overview

Scaffolded React + Vite app that needs to become the ULoS Engine frontend. The focus is connecting to the PostgreSQL data layer and building interactive visualization panels.

## Phases

- [x] **Phase 1: Scaffolding** — React + Vite project setup
- [ ] **Phase 2: Data Layer** — PostgreSQL connection, API endpoints, data models
- [ ] **Phase 3: Financial Panels** — Debt avalanche, account balances, budget tracking
- [ ] **Phase 4: Life Metrics** — Sleep, energy, schedule visualization from ULoS
- [ ] **Phase 5: Interactive Features** — Real-time refresh, drill-down, export

## Phase Details

### Phase 1: Scaffolding (Complete)
**Goal**: Working React + Vite development environment
**Status**: Complete — basic layout, ESLint, dependencies

### Phase 2: Data Layer
**Goal**: Connect dashboard to PostgreSQL simlife database
**Depends on**: Phase 1
**Success Criteria**:
  1. API server or direct DB queries working
  2. Data models for financial accounts, transactions, schedule
  3. Test data loading and rendering

### Phase 3: Financial Panels
**Goal**: Core financial visualization
**Depends on**: Phase 2
**Success Criteria**:
  1. Debt avalanche progress chart (waterfall)
  2. Account balance overview
  3. Budget vs actual tracking
  4. Bill calendar

### Phase 4: Life Metrics
**Goal**: ULoS Engine data visualization
**Depends on**: Phase 2, ULoS Engine integration
**Success Criteria**:
  1. Sleep quality trends (from WHOOP)
  2. Energy/alertness curve (from ULoS model)
  3. Schedule optimization view

### Phase 5: Interactive Features
**Goal**: Production-quality interactive dashboard
**Depends on**: Phase 3, Phase 4
**Success Criteria**:
  1. Real-time auto-refresh
  2. Drill-down into any metric
  3. Export to PDF/image
