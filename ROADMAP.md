# ScriptRipper Development Roadmap

## Milestones

### M0 – Project Setup (Week 0–1)
**Deliverables:**
- Repo scaffold, mono‑repo (web, api, worker)
- CI (lint/test/typecheck); devcontainers; Makefile
- Infrastructure stubs (Vercel, Render/Cloud Run, DB, Redis, n8n)

**Acceptance Criteria:**
- CI green; `hello` across web/api/worker; environments live

**References:**
- See SPEC §13; ADR‑0001/0006

---

### M1 – Core MVP Flows (Week 1–3)
**Deliverables:**
- Upload→profile→analyze→output (single file)
- Provider abstraction (three vendors: Gemini, OpenAI, Anthropic)
- Exports (ZIP/JSON); artifact storage

**Acceptance Criteria:**
- Gherkin A passes E2E; exports verified with checksums

**References:**
- See SPEC §3 A/E; ADR‑0003

---

### M2 – Batch & Profiles (Week 3–4)
**Deliverables:**
- Batch processing; per-item status
- Profile CRUD + versioning; admin UI

**Acceptance Criteria:**
- Gherkin B/C pass; audit log for profile changes

**References:**
- See SPEC §3 B/C

---

### M3 – Web UI Parity & CLI (Week 4–5)
**Deliverables:**
- Web parity with CLI; custom user prompts post‑job
- CLI packaging and API tokens

**Acceptance Criteria:**
- Gherkin F/G + custom prompt scenario pass

**References:**
- See SPEC §3 F/G

---

### M4 – Hardening & Launch (Week 5–6)
**Deliverables:**
- Observability (metrics, traces); SLO alerting
- Billing gates (trial→paid); docs & runbooks

**Acceptance Criteria:**
- SLO dashboards green; burn‑rate alerts tested; paywall smoke test

**References:**
- See SPEC §4/§12

---

## Dependencies
- LLM provider keys (Gemini, OpenAI, Anthropic)
- Managed Postgres/Redis instances
- n8n instance for orchestration
- Object storage for artifacts (S3-compatible)

## Risks & Mitigations
- **Provider quotas**: Implement multi-provider fallback logic
- **Large transcript costs**: Set per-job and daily budget caps
- **Export timeouts**: Implement async export generation with polling

See SPEC §14 for detailed risk analysis.

---

## Version 1 Features (Post-MVP)
- Batch presets
- Project history & organization
- Richer share links
- Cost/quality routing policies
- Embeddings cache for faster re-analysis
- Profile marketplace

## Future Considerations (V-later)
- Multi‑tenant organization hierarchy
- Granular RBAC
- Real‑time meeting capture
- Enterprise SSO (SAML, OIDC)
- Fine‑tuned models
