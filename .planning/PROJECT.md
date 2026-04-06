# SBOS Dashboard

## What This Is

React + Vite financial dashboard for the SBOS (Sim's Business Operating System). Originally a standalone dashboard for visualizing financial data, now being recreated as the ULoS Engine frontend — a unified life operating system dashboard.

## Core Value

Visual command center for financial health, debt avalanche tracking, and life metrics — all in one interactive dashboard.

## Current State

### What's Built
- React + Vite scaffolding (sbos-vite-temp)
- Basic dashboard layout with data directory
- ESLint config
- Node dependencies installed

### What's Needed
- Integration with ULoS Engine data (PostgreSQL queries)
- Financial visualization panels (debt avalanche, account balances, budget tracking)
- Life metrics panels (sleep, energy, schedule optimization)
- Real-time data refresh

## Architecture
- **Frontend:** React + Vite
- **Data:** PostgreSQL (simlife DB) via ULoS Engine
- **Deploy:** Local dev server (vite dev)

## Relationship to ULoS Engine
This dashboard is the **presentation layer** for ULoS Engine. ULoS handles data ingestion, energy modeling, and scheduling. This dashboard visualizes it all.
