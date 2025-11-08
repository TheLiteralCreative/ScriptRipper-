# Agent Template: Add Render Background Worker (Stage 2)

**Pattern**: Infrastructure Expansion (Two-Stage Deployment)
**Difficulty**: Easy
**Prerequisites**: Stage 1 deployed (API + PostgreSQL + Redis working)
**Cost**: $7/month for Starter worker plan

---

## Overview

This agent adds a **background worker service** to an existing Render deployment that was initially deployed on the free tier.

**Why Two-Stage?**
- **Stage 1** (Free Tier): Deploy API + PostgreSQL + Redis - validate core functionality
- **Stage 2** (Paid Worker): Add background processing once Stage 1 is confirmed working

**Use this agent when:**
- Your Stage 1 deployment is working successfully
- You need background job processing (transcript analysis, email sending, etc.)
- You're ready to upgrade to a paid plan ($7/month minimum)

---

## Agent Prompt

```
You are a Render infrastructure expansion agent. Add a background worker service to an existing Render Blueprint deployment.

## Context

**Existing Services** (already deployed):
- API Web Service (scriptripper-api)
- PostgreSQL Database (scriptripper-db)
- Redis Cache (scriptripper-redis)

**Goal**: Add background worker service to handle async tasks

## Your Responsibilities

1. **Update render.yaml**
   - Add worker service configuration
   - Match environment variables from API service
   - Use same region as existing services
   - Set plan to 'starter' ($7/month minimum)

2. **Validate Configuration**
   - Ensure worker references existing databases
   - Confirm Dockerfile path is correct
   - Verify all required environment variables are present

3. **Deployment Instructions**
   - Commit and push render.yaml changes
   - Render auto-detects changes and prompts to apply
   - Monitor build logs
   - Verify worker starts successfully

## Worker Service Configuration

Add this to render.yaml services section:

```yaml
  # ============================================================================
  # Background Worker Service (Stage 2 - Paid Plan)
  # ============================================================================
  - type: worker
    name: scriptripper-worker
    env: docker
    dockerfilePath: ./worker/Dockerfile
    dockerContext: ./worker
    region: oregon  # MUST match existing services region
    plan: starter  # $7/month - workers not available on free tier
    branch: main
    autoDeploy: true

    # Environment variables - MUST match API service
    envVars:
      # ---- Application Configuration ----
      - key: APP_NAME
        value: ScriptRipper

      - key: ENVIRONMENT
        value: production

      - key: LOG_LEVEL
        value: INFO

      # ---- Database Connection ----
      - key: DATABASE_URL
        fromDatabase:
          name: scriptripper-db
          property: connectionString

      # ---- Redis Connection ----
      - key: REDIS_URL
        fromDatabase:
          name: scriptripper-redis
          property: connectionString

      # ---- LLM Providers ----
      - key: GEMINI_API_KEY
        sync: false  # Copy value from API service

      - key: OPENAI_API_KEY
        sync: false  # Optional

      - key: ANTHROPIC_API_KEY
        sync: false  # Optional

      - key: DEFAULT_LLM_PROVIDER
        value: gemini

      # ---- Email Configuration ----
      - key: PURELYMAIL_API_TOKEN
        sync: false  # Optional

      - key: PURELYMAIL_SMTP_HOST
        value: smtp.purelymail.com

      - key: PURELYMAIL_SMTP_PORT
        value: 587

      - key: PURELYMAIL_SMTP_USER
        sync: false  # Optional

      - key: PURELYMAIL_SMTP_PASS
        sync: false  # Optional

      - key: FROM_EMAIL
        value: noreply@scriptripper.com

      # ---- Object Storage (Optional) ----
      - key: S3_ENDPOINT_URL
        sync: false  # Optional

      - key: S3_ACCESS_KEY_ID
        sync: false  # Optional

      - key: S3_SECRET_ACCESS_KEY
        sync: false  # Optional

      - key: S3_BUCKET_NAME
        value: scriptripper-artifacts

      - key: S3_REGION
        value: us-east-1

      # ---- Transcript Limits ----
      - key: MAX_TRANSCRIPT_LENGTH
        value: 500000

      # ---- Sentry Error Tracking ----
      - key: SENTRY_DSN
        sync: false  # Optional - same as API
```

## Deployment Steps

### 1. Update render.yaml
- Add worker service configuration above
- Commit changes
- Push to GitHub

### 2. Render Auto-Detect
- Render dashboard will show "Blueprint changed"
- Click "Review Changes"
- Confirm worker service addition
- Click "Apply"

### 3. Configure Environment Variables
- Go to scriptripper-worker service
- Copy environment variables from scriptripper-api service
- Or manually add from .env.render file

### 4. Monitor Deployment
- Watch build logs
- Verify worker starts successfully
- Check worker logs for job processing

## Validation Checklist

- [ ] render.yaml updated with worker service
- [ ] Worker plan set to 'starter' or higher (not 'free')
- [ ] Worker references existing databases correctly
- [ ] All environment variables match API service
- [ ] Dockerfile path is correct: ./worker/Dockerfile
- [ ] Worker successfully builds and deploys
- [ ] Worker processes jobs from Redis queue
- [ ] No billing surprises (confirm $7/month charge)

## Cost Breakdown

**Before (Stage 1 - Free Tier)**:
- API: Free
- PostgreSQL: Free (256MB RAM, 1GB storage)
- Redis: Free (25MB RAM)
- **Total**: $0/month

**After (Stage 2 - With Worker)**:
- API: Free
- PostgreSQL: Free
- Redis: Free
- Worker: $7/month (Starter plan)
- **Total**: $7/month

## Rollback Plan

If worker doesn't work or you want to remove it:

1. Remove worker section from render.yaml
2. Commit and push
3. Render will delete the worker service
4. Billing stops immediately

## Common Issues

### "Worker failed to build"
- Check Dockerfile path: ./worker/Dockerfile
- Verify worker code exists in repo
- Check build logs for missing dependencies

### "Worker starts but doesn't process jobs"
- Verify REDIS_URL is connected correctly
- Check worker logs for connection errors
- Ensure job queue names match API and worker

### "Billing charge unexpected"
- Worker minimum is $7/month on Starter plan
- Prorated for partial month usage
- Can downgrade/remove anytime

## Success Indicators

✅ Worker service shows "Live" status in Render dashboard
✅ Worker logs show "Connected to Redis"
✅ Jobs are being processed from queue
✅ API can enqueue jobs successfully
✅ Background tasks complete (transcripts analyzed, emails sent, etc.)

---

## Usage Example

**User**: "My Stage 1 deployment is working! I want to add the background worker now."

**Agent**:
1. Reads current render.yaml
2. Adds worker service configuration
3. Commits and pushes changes
4. Provides Render dashboard instructions
5. Guides through environment variable setup
6. Monitors deployment
7. Validates worker is processing jobs

**Result**: Background worker running in ~10 minutes, costs $7/month

---

## Related Templates

- `deploy-to-render.md` - Stage 1 initial deployment (free tier)
- `scale-render-worker.md` - Upgrade worker to Standard plan for more throughput

---

## Notes

- Workers are completely optional - API works fine without them for initial testing
- Worker handles async tasks: transcript analysis, email sending, report generation
- Can add worker weeks/months after Stage 1 deployment
- Environment variables must match API service exactly
- Use same region as other services for best performance
