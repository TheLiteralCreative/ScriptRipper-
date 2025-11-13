# Deploy Web UI & Worker – Runbook

Use this runbook (and the accompanying agent prompts) whenever ScriptRipper’s frontend or worker tier needs to be deployed or recovered. It enforces the hosting decisions from SPEC §8 and ADR-0006.

## Inputs
- SPEC: `docs/spec/SPEC.md` (§8 for architecture, §3 for UX acceptance criteria)
- Alignment plan: `PROJECT_ALIGNMENT_PLAN.md`
- Deployment docs: `DEPLOYMENT.md`, `GODADDY_DNS_SETUP.md`, `DEPLOYMENT_SUCCESS.md`
- Scripts/config: `render.yaml`, `.github/workflows/deploy.yml`, `.env.render`

## A. Web UI (Next.js on Vercel)
1. **Spec Read & Checklist**
   - Agent must read SPEC §8 and confirm that Web UI + API separation is required.
   - Confirm `web/` exists with Dockerfile (`web/Dockerfile`) and `package.json`.
2. **Local Validation**
   - `cd ScriptRipper+/web`
   - `npm ci`
   - `npm run lint && npm run test && npm run test:e2e`
3. **Vercel Deploy**
   - Ensure `VERCEL_TOKEN`, org, and project IDs are available (or create new project).
   - `npx vercel link --project scriptripper-web`
   - `npx vercel env pull .env.production`
   - `npx vercel --prod`
4. **Post-Deploy Verification**
   - Hit the preview URL + `/health`.
   - Capture build ID and commit SHA for `DEPLOYMENT_SUCCESS.md`.
5. **DNS Cutover**
   - Follow `GODADDY_DNS_SETUP.md` (Steps 2-4) to point `www` + apex to Vercel and `api` to Render.
   - Verify via `dig` + `curl`.

## B. Background Worker (Render Starter Plan)
1. **Spec Read & Checklist**
   - Confirm SPEC §8 requires Redis-backed workers.
   - Ensure `worker/` contains `Dockerfile`, `requirements.txt`, and `main.py`.
2. **render.yaml Sync**
   - Verify worker service block is present (plan `starter`) with env vars referencing `scriptripper-db`.
   - If missing, run the “Activate Render Worker” agent prompt.
3. **Provision Worker**
   - `git add render.yaml && git commit -m "Add worker service"` (if changed).
   - Push to `main` so Render Blueprint detects change.
   - In Render dashboard, apply blueprint changes and set environment variables (copy from `.env.render`).
4. **Functional Verification**
   - `curl -X POST https://api.scriptripper.com/api/v1/jobs ...` to enqueue a test job.
   - Poll `/api/v1/jobs/{id}` until status is `finished`.
   - Inspect Render worker logs for success.

## C. Documentation Update
After both tiers are live:
1. Append a new section to `DEPLOYMENT_SUCCESS.md` with date, services deployed, URLs, and validation evidence.
2. Update `GODADDY_DNS_SETUP.md` if DNS instructions changed.
3. Record any new automation prompts or scripts in `.claude/prompts` or `scripts/`.

## Agent Prompts
- **Web Deployment**: `.claude/prompts/examples/deploy-web-vercel.md`
- **Worker Activation**: `.claude/prompts/examples/add-render-worker.md`

Always attach the relevant prompt when launching an agent so it inherits this runbook context.
