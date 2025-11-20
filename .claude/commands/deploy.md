---
description: Commit, push, and deploy changes to both frontend (Vercel) and backend (Render) with full verification
---

You are a deployment specialist. Your role is to handle the complete deployment workflow for the ScriptRipper application, ensuring changes are committed, pushed, and deployed to both Vercel (frontend) and Render (backend) successfully.

## Overview

This agent automates the entire deployment pipeline:
1. Detect and stage changes (frontend/backend/both)
2. Create descriptive commit with proper formatting
3. Push to GitHub
4. Verify/trigger Vercel deployment (frontend)
5. Verify/trigger Render deployment (backend)
6. Confirm both deployments are live and healthy

## Step 1: Detect Changes

**Check what changed:**
```bash
# Get current branch
git branch --show-current

# Check git status
git status

# Identify what changed
git diff --name-only
```

**Categorize changes:**
- Frontend: Files in `web/` directory
- Backend: Files in `api/` directory
- Worker: Files in `worker/` directory
- Infrastructure: Files like `render.yaml`, `vercel.json`, `docker-compose.yml`
- Shared: Files in `shared/` directory (affects backend and worker)
- Docs/Config: Files like `README.md`, `.claude/`, `scripts/`, etc.

## Step 2: Stage Changes

**Ask user what to include:**
- If clear: "I see changes in [frontend/backend/both]. Shall I commit all of them?"
- If unclear: Present options with AskUserQuestion tool

**Stage files:**
```bash
# Stage specific directories
git add web/
git add api/
git add worker/
git add shared/

# Or stage everything
git add .

# Review what's staged
git status
```

## Step 3: Create Commit

**Commit message format:**
```
<type>: <short description>

<detailed description of changes>
- Change 1
- Change 2
- Change 3

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `docs`: Documentation
- `style`: UI/styling changes
- `chore`: Maintenance, dependencies
- `perf`: Performance improvements

**Create commit:**
```bash
git commit -m "$(cat <<'EOF'
feat: add PDF and Word document upload support

- Add pdfjs-dist and mammoth parsers
- Update dropzone to accept .pdf, .doc, .docx
- Update backend ALLOWED_EXTENSIONS
- Fix Docker build to include shared/ directory

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

## Step 4: Push to GitHub

**Push changes:**
```bash
# Push to main branch
git push origin main

# Check if push succeeded
if [ $? -eq 0 ]; then
  echo "✅ Pushed to GitHub successfully"
else
  echo "❌ Push failed"
  exit 1
fi
```

**Common push issues:**
- Rejected: Need to pull first (`git pull origin main`)
- Authentication: Need to set up SSH keys or personal access token
- Protected branch: May need to use a feature branch and create PR

## Step 5: Verify Vercel Deployment

**Vercel auto-deploys on every push to main.**

**Check deployment status:**
```bash
# Option 1: Check via Vercel CLI (if available)
vercel ls --scope scriptripper

# Option 2: Poll Vercel API (requires VERCEL_TOKEN)
# Wait 10 seconds for deployment to start
sleep 10

# Check latest deployment
curl -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://api.vercel.com/v6/deployments?projectId=scriptripper&limit=1"
```

**Manual verification:**
1. Go to https://vercel.com/scriptripper/deployments
2. Check if new deployment started (within 30 seconds of push)
3. Monitor deployment progress (usually 30-90 seconds)
4. Verify deployment status: "Ready" (green checkmark)

**Health check:**
```bash
# Check if frontend is responding
curl -I https://www.scriptripper.com

# Should return: HTTP/2 200
```

## Step 6: Verify/Trigger Render Deployment

**Render should auto-deploy with `autoDeploy: true` in render.yaml.**

**Check if auto-deploy started:**
```bash
# Wait 30-60 seconds for Render to detect GitHub push
sleep 30

# Manual check: Go to https://dashboard.render.com
# Look for "Deploying..." status on scriptripper-api
```

**If auto-deploy didn't trigger, manually trigger:**

**Option A: Via Render Dashboard (no API key required)**
1. Go to https://dashboard.render.com
2. Click on `scriptripper-api` service
3. Click "Manual Deploy" button (top right)
4. Select "Deploy latest commit"
5. Click "Deploy"

**Option B: Via Render API (if RENDER_API_KEY available)**
```bash
# Check if API key exists
if [ -n "$RENDER_API_KEY" ]; then
  # Get service ID (you may need to fetch this first)
  SERVICE_ID="srv-xxxxx"

  # Trigger deploy
  curl -X POST \
    "https://api.render.com/v1/services/${SERVICE_ID}/deploys" \
    -H "Authorization: Bearer ${RENDER_API_KEY}" \
    -H "Content-Type: application/json" \
    -d '{"clearCache": "do_not_clear"}'

  echo "✅ Render deployment triggered via API"
else
  echo "⚠️  No RENDER_API_KEY found. Please trigger deploy manually:"
  echo "   1. Go to https://dashboard.render.com"
  echo "   2. Click scriptripper-api → Manual Deploy"
fi
```

**Monitor Render deployment:**
```bash
# Wait for deployment to complete (usually 2-4 minutes)
echo "⏳ Waiting for Render deployment..."

# Poll health endpoint
MAX_ATTEMPTS=40  # 40 attempts * 5 seconds = 3 minutes
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  # Check API health
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://scriptripper-api.onrender.com/health)

  if [ "$STATUS" = "200" ]; then
    echo "✅ API is healthy and responding"
    break
  fi

  ATTEMPT=$((ATTEMPT + 1))
  echo "   Attempt $ATTEMPT/$MAX_ATTEMPTS: API returned $STATUS, waiting..."
  sleep 5
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
  echo "❌ API deployment may have failed. Check Render logs."
  exit 1
fi
```

## Step 7: Verify Both Deployments

**Full health check:**
```bash
echo ""
echo "═══════════════════════════════════════"
echo "Deployment Health Check"
echo "═══════════════════════════════════════"

# Frontend check
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://www.scriptripper.com)
if [ "$FRONTEND_STATUS" = "200" ]; then
  echo "✅ Frontend (Vercel): https://www.scriptripper.com"
else
  echo "❌ Frontend (Vercel): Failed (HTTP $FRONTEND_STATUS)"
fi

# Backend API check
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://scriptripper-api.onrender.com/health)
if [ "$API_STATUS" = "200" ]; then
  echo "✅ Backend (Render): https://scriptripper-api.onrender.com"
else
  echo "❌ Backend (Render): Failed (HTTP $API_STATUS)"
fi

# Get API version/info
API_INFO=$(curl -s https://scriptripper-api.onrender.com/health)
echo ""
echo "API Info:"
echo "$API_INFO"

echo ""
echo "═══════════════════════════════════════"
echo "🎉 Deployment Complete!"
echo "═══════════════════════════════════════"
```

## Complete Workflow Example

```bash
#!/bin/bash
set -e

echo "🚀 Starting deployment workflow..."

# 1. Check what changed
echo ""
echo "📝 Changes detected:"
git status --short

# 2. Stage changes
git add web/ api/ shared/ render.yaml

# 3. Commit
git commit -m "$(cat <<'EOF'
feat: add file upload support

- Add PDF and Word parsers
- Update frontend dropzone
- Fix Docker build

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"

# 4. Push
echo ""
echo "⬆️  Pushing to GitHub..."
git push origin main

# 5. Wait for Vercel
echo ""
echo "⏳ Waiting 30 seconds for Vercel to start deploying..."
sleep 30

# 6. Check Vercel status
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://www.scriptripper.com)
if [ "$FRONTEND_STATUS" = "200" ]; then
  echo "✅ Frontend deployed"
else
  echo "⚠️  Frontend may still be deploying..."
fi

# 7. Wait for Render
echo ""
echo "⏳ Waiting 60 seconds for Render to start deploying..."
sleep 60

# 8. Poll Render API health
echo "🔍 Checking API health..."
MAX_ATTEMPTS=30
for i in $(seq 1 $MAX_ATTEMPTS); do
  API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://scriptripper-api.onrender.com/health)

  if [ "$API_STATUS" = "200" ]; then
    echo "✅ Backend deployed"
    break
  fi

  if [ $i -eq $MAX_ATTEMPTS ]; then
    echo "❌ Backend deployment timeout. Check Render dashboard."
    exit 1
  fi

  echo "   Attempt $i/$MAX_ATTEMPTS: Waiting for API..."
  sleep 10
done

# 9. Final verification
echo ""
echo "═══════════════════════════════════════"
echo "✅ Deployment Complete!"
echo "═══════════════════════════════════════"
echo "Frontend: https://www.scriptripper.com"
echo "Backend:  https://scriptripper-api.onrender.com"
echo "═══════════════════════════════════════"
```

## Usage Instructions

**When invoked:**

1. **Auto-detect changes** - Run `git status` and categorize
2. **Ask user for confirmation** - "I see changes in [X]. Ready to deploy?"
3. **Create descriptive commit** - Based on changes detected
4. **Push to GitHub** - Execute `git push origin main`
5. **Monitor Vercel** - Wait 30s, check frontend health
6. **Monitor Render** - Wait 60s, check backend health or trigger manual deploy
7. **Report status** - Show final deployment status for both

**Expected output:**
```
🚀 Starting deployment workflow...

📝 Changes detected:
   Frontend: 3 files in web/
   Backend: 2 files in api/

✅ Staged all changes

✅ Commit created: "feat: add file upload support"

⬆️  Pushing to GitHub...
✅ Pushed successfully

⏳ Monitoring Vercel deployment...
✅ Frontend deployed (30 seconds)

⏳ Monitoring Render deployment...
✅ Backend deployed (2 minutes)

═══════════════════════════════════════
✅ Deployment Complete!
═══════════════════════════════════════
Frontend: https://www.scriptripper.com (200 OK)
Backend:  https://scriptripper-api.onrender.com (200 OK)
═══════════════════════════════════════
```

## Error Handling

**If Vercel fails:**
1. Check Vercel dashboard: https://vercel.com/scriptripper/deployments
2. Look for build errors in logs
3. Common issues:
   - Build timeout (increase timeout in Vercel settings)
   - Environment variables missing
   - Dependency installation failed

**If Render fails:**
1. Check Render dashboard: https://dashboard.render.com
2. View deployment logs
3. Common issues:
   - Docker build failed (check Dockerfile)
   - Missing environment variables
   - Database connection failed
   - Health check failing

**If push fails:**
1. Check if branch is protected
2. Verify authentication (SSH keys or PAT)
3. May need to pull first: `git pull origin main`

## Best Practices

1. **Always verify both deployments** - Don't assume auto-deploy worked
2. **Monitor health checks** - Poll API until it responds
3. **Check logs on failure** - Render logs show exact error
4. **Use descriptive commits** - Makes debugging easier
5. **Test locally first** - Ensure Docker builds locally before pushing
6. **Keep deployments atomic** - Related frontend/backend changes together

## Quick Reference

```bash
# Full deployment command
/deploy

# The agent will:
# 1. Detect changes (frontend/backend/both)
# 2. Stage and commit with proper message
# 3. Push to GitHub
# 4. Verify Vercel deployment
# 5. Verify/trigger Render deployment
# 6. Report final status
```

---

**Remember:** This agent handles the ENTIRE deployment pipeline. No more manual steps, no more guessing if things deployed. One command, full deployment, verified results.
