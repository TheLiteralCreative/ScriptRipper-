# Deployment Status — November 9, 2025

> This log now reflects the actual production footprint. Earlier versions incorrectly implied every surface was live; the sections below document what is *currently* running and what still needs to ship.

## 1. Current State Snapshot

| Surface | Host | Status | Notes |
| --- | --- | --- | --- |
| Web UI (Next.js) | _Pending Vercel deploy_ | ⚠️ Not deployed | UI exists locally but has never been published. Need to deploy and point `www`/apex at it. |
| API (FastAPI) | https://scriptripper-api.onrender.com | ✅ Live | Health checks green; temporarily handles all traffic. Planned move to `https://api.scriptripper.com`. |
| Worker (Python) | _Pending Render worker service_ | ⚠️ Not deployed | Required by SPEC for async jobs; worker removed when we targeted the free tier. |
| PostgreSQL | Render managed DB (`scriptripper-db`) | ✅ Live | Auto migrations + seeds succeed on deploy. |
| Redis | Render managed Redis (`scriptripper-redis`) | ✅ Live | Available, but no worker is consuming the queues yet. |

## 2. Live Endpoint Details (API Only)

- **Primary**: `https://scriptripper-api.onrender.com`
- **Custom Domain (temporary)**: `www.scriptripper.com` → Render API (until UI deploy completes)
- **Health**: `GET /health` reports API/database/Redis status

## 3. Infrastructure Inventory

- **API Web Service** (Render, free plan) – Service ID `srv-d47mub9r0fns73finib0`
- **PostgreSQL** (Render DB, free tier) – DB name `scriptripper_production`
- **Redis** (Render Redis, free tier) – Instance ID `red-d487ngndiees739phdc0`
- **Custom Domain** (GoDaddy) – Currently mapped to the API; SSL via Render/Let’s Encrypt
- **Web / Worker** – Not yet deployed (see §4)

## 4. Outstanding Work

1. **Deploy the Web UI**
   - Use Vercel (preferred) or the corrected Render Docker build in `render.yaml`.
   - Run Playwright/Jest suites, then update DNS so `www.scriptripper.com` and apex hit the UI.

2. **Add the Background Worker**
   - Re-enable the worker service defined in `render.yaml` (starter plan) and populate env vars from `.env.render`.
   - Validate jobs enqueue/dequeue end-to-end through `/api/v1/jobs`.

3. **DNS Realignment**
   - `www` + apex → Vercel UI.
   - `api.scriptripper.com` → Render API (`CORS_ORIGINS` + `NEXT_PUBLIC_API_URL` already set accordingly).
   - Document the change in `GODADDY_DNS_SETUP.md`.

4. **Documentation Discipline**
   - Every deployment record must cite which services actually shipped.
   - When only part of the stack deploys, capture the exception instead of declaring “Live.”

## 5. Timeline (to date)

| Task | Status | Notes |
| --- | --- | --- |
| API service deployed to Render | ✅ | Includes migrations + seeds. |
| Postgres + Redis provisioned | ✅ | Both healthy. |
| Custom domain added to Render | ✅ | Currently directs to API. |
| Web UI deployment | ⚠️ | Not yet executed. |
| Worker deployment | ⚠️ | Not yet executed. |
| DNS realignment | ⚠️ | Pending web deploy. |

---

_Keep this file append-only. Each future deployment should add a new dated section summarizing what changed, which SPEC requirements were satisfied, and what remains._
