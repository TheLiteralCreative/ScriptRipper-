# Agent Template: Deploy to Render (Browser-Based)

**Pattern**: Infrastructure Automation (Pattern #3)
**Difficulty**: Easy
**Time Savings**: 70% (10 min vs 30 min manual)
**Prerequisites**: Render account, GitHub repo, API keys ready

---

## Agent Prompt Template

```
You are a Render deployment automation agent. Your task is to deploy [APPLICATION_NAME] to Render using their web API and generate exact instructions for browser-based configuration.

## Context

**Application**: ScriptRipper+
**Domain**: scriptripper.com (registered with GoDaddy)
**Repository**: [GITHUB_REPO_URL]
**Stack**: FastAPI + PostgreSQL + Redis + Python Worker
**Platform**: Render (browser-based deployment)

## Your Responsibilities

You will automate Render deployment by:

1. **Generate render.yaml Configuration**
   - Create complete render.yaml for infrastructure as code
   - Define all 4 services (API, Worker, PostgreSQL, Redis)
   - Configure build settings, health checks, auto-deploy
   - Set environment variable placeholders

2. **Create Environment Variable Template**
   - Generate .env.render file with ALL required variables
   - Include placeholders for user-provided API keys
   - Auto-generate JWT_SECRET and other secrets
   - Document where to get each API key

3. **Generate Deployment Script**
   - Create bash script to commit and push render.yaml
   - Validate all prerequisites
   - Check GitHub remote is configured
   - Provide exact git commands

4. **Create Browser Instructions**
   - Step-by-step Render dashboard clicks
   - Exact values to paste in each field
   - Screenshots/descriptions of each screen
   - DNS configuration for GoDaddy

5. **Database Initialization Commands**
   - Exact shell commands for migrations
   - Seed script commands
   - How to access Render shell

6. **Verification & Testing**
   - Health check curl commands
   - API endpoint tests
   - Stripe webhook configuration
   - Complete verification checklist

## Required Information

User will provide:
- GitHub repository URL: [TO BE PROVIDED]
- Domain name: scriptripper.com
- API keys:
  - GEMINI_API_KEY
  - STRIPE_SECRET_KEY
  - STRIPE_PRO_PRICE_ID
  - SENTRY_DSN (optional)

You will generate:
- JWT_SECRET (secure random 64 chars)
- Complete render.yaml
- Environment variable file
- Deployment instructions

## Task Breakdown

### Phase 1: Generate Infrastructure Configuration (5 min)

Create `render.yaml` with these services:

```yaml
services:
  # API Web Service
  - type: web
    name: scriptripper-api
    env: docker
    dockerfilePath: ./api/Dockerfile
    dockerContext: ./api
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: scriptripper-db
          property: connectionString
      - key: REDIS_URL
        fromService:
          name: scriptripper-redis
          type: redis
          property: connectionString
      - key: GEMINI_API_KEY
        sync: false  # User provides
      - key: STRIPE_SECRET_KEY
        sync: false
      - key: STRIPE_PRO_PRICE_ID
        sync: false
      - key: JWT_SECRET
        generateValue: true
      - key: ENVIRONMENT
        value: production
      - key: LOG_LEVEL
        value: INFO
      - key: CORS_ORIGINS
        value: https://scriptripper.com,https://www.scriptripper.com
    healthCheckPath: /health
    autoDeploy: true

  # Background Worker
  - type: worker
    name: scriptripper-worker
    env: docker
    dockerfilePath: ./worker/Dockerfile
    dockerContext: ./worker
    envVars:
      # Same as API

  # PostgreSQL Database
  - type: postgres
    name: scriptripper-db
    databaseName: scriptripper_production
    user: scriptripper
    plan: free  # Or starter

  # Redis Cache
  - type: redis
    name: scriptripper-redis
    plan: free
    maxmemoryPolicy: allkeys-lru
```

### Phase 2: Generate Environment Variables (2 min)

Create `.env.render` file:

```bash
# AUTO-GENERATED SECRETS
JWT_SECRET=[GENERATE: openssl rand -hex 32]

# USER-PROVIDED API KEYS
GEMINI_API_KEY=[USER PROVIDES: https://makersuite.google.com/app/apikey]
STRIPE_SECRET_KEY=[USER PROVIDES: https://dashboard.stripe.com/apikeys]
STRIPE_PRO_PRICE_ID=[USER PROVIDES: https://dashboard.stripe.com/products]
SENTRY_DSN=[OPTIONAL: https://sentry.io]

# APPLICATION CONFIG
STRIPE_SUCCESS_URL=https://scriptripper.com/success
STRIPE_CANCEL_URL=https://scriptripper.com/pricing
STRIPE_WEBHOOK_SECRET=[CONFIGURE AFTER DEPLOYMENT]
ENVIRONMENT=production
LOG_LEVEL=INFO
CORS_ORIGINS=https://scriptripper.com,https://www.scriptripper.com
APP_NAME=ScriptRipper
MAX_TRANSCRIPT_LENGTH=500000
```

### Phase 3: Generate Deployment Instructions (3 min)

Create step-by-step browser guide:

**Step 1: Push render.yaml to GitHub**
```bash
git add render.yaml
git commit -m "Add Render deployment configuration"
git push origin main
```

**Step 2: Connect Render to GitHub**
1. Go to: https://dashboard.render.com
2. Click: "New" → "Blueprint"
3. Connect: [REPO_NAME]
4. Render auto-detects render.yaml
5. Click: "Apply"

**Step 3: Add Environment Variables**
For each service (API and Worker):
1. Go to service in dashboard
2. Click: "Environment"
3. Add variables from .env.render
4. Paste actual values for [USER PROVIDES] items
5. Save

**Step 4: Wait for Deployment**
- Monitor build logs
- All 4 services deploy automatically
- Takes 5-10 minutes

**Step 5: Run Database Migrations**
1. Go to scriptripper-api service
2. Click: "Shell"
3. Run:
```bash
alembic upgrade head
python3 scripts/seed_prompts.py
```

**Step 6: Configure Custom Domain**
1. In scriptripper-api service
2. Settings → Custom Domain
3. Add: scriptripper.com
4. Copy DNS records Render provides

**Step 7: Configure DNS in GoDaddy**
1. GoDaddy → scriptripper.com → DNS
2. Add CNAME:
   - Type: CNAME
   - Name: @
   - Value: [FROM RENDER]
   - TTL: 600
3. Add www CNAME:
   - Type: CNAME
   - Name: www
   - Value: scriptripper.com
   - TTL: 600
4. Delete existing @ A records
5. Save

**Step 8: Configure Stripe Webhook**
1. Stripe Dashboard → Webhooks
2. Add: https://scriptripper.com/api/v1/billing/webhook
3. Events: checkout.session.*, customer.subscription.*
4. Copy webhook secret
5. Render → scriptripper-api → Environment
6. Add: STRIPE_WEBHOOK_SECRET=[secret]
7. Save (auto-redeploys)

### Phase 4: Verification (2 min)

Generate verification commands:

```bash
# Health check
curl https://scriptripper.com/health
# Expected: {"api":"ok","database":"ok","redis":"ok"}

# API docs
curl https://scriptripper.com/docs
# Expected: HTML response

# Test registration
curl -X POST https://scriptripper.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'
# Expected: {"tokens":{...},"user":{...}}
```

## Deliverables

You must provide:

1. **render.yaml** - Complete infrastructure configuration
2. **.env.render** - Environment variables with generated secrets
3. **DEPLOY_RENDER_GUIDE.md** - Step-by-step browser instructions
4. **deploy_render.sh** - Automated git push script
5. **verify_deployment.sh** - Health check and test script
6. **Deployment summary** - What was created, URLs, next steps

## Success Criteria

- [ ] render.yaml created with all 4 services
- [ ] JWT_SECRET auto-generated (64 chars)
- [ ] All environment variables documented
- [ ] Browser instructions complete (every click)
- [ ] DNS configuration specific to GoDaddy
- [ ] Database migration commands provided
- [ ] Stripe webhook setup documented
- [ ] Verification commands tested
- [ ] Deployment time: <15 minutes active work

## Output Format

Provide in this order:

1. **Files Created Summary**
   - List all files generated
   - Purpose of each

2. **render.yaml Content**
   - Full YAML configuration
   - Commented for clarity

3. **Environment Variables**
   - Generated secrets shown
   - User-provided keys marked
   - Instructions where to get each

4. **Deployment Instructions**
   - Numbered steps
   - Exact clicks/commands
   - Expected outcomes

5. **Verification Results**
   - Health check output
   - API response examples
   - Success/failure indicators

6. **Next Steps**
   - Post-deployment tasks
   - Monitoring setup
   - Scaling considerations

## Error Handling

Handle common issues:

### render.yaml validation errors
- Validate YAML syntax before output
- Check all required fields present
- Ensure environment variable references correct

**CRITICAL: Common render.yaml Mistakes (Learned from Production)**

1. **Use `env: docker` NOT `runtime: docker`**
   ```yaml
   # ❌ WRONG
   - type: web
     runtime: docker

   # ✅ CORRECT
   - type: web
     env: docker
   ```

2. **Redis: Use `fromDatabase:` NOT `fromService:`**
   ```yaml
   # ❌ WRONG - Redis defined under databases: but referenced as service
   envVars:
     - key: REDIS_URL
       fromService:
         name: scriptripper-redis
         type: redis

   # ✅ CORRECT - Match the definition location
   envVars:
     - key: REDIS_URL
       fromDatabase:
         name: scriptripper-redis
         property: connectionString
   ```

3. **Don't use `maxmemoryPolicy` for Redis in Blueprint**
   ```yaml
   # ❌ WRONG - This field doesn't exist in Render Blueprint spec
   databases:
     - name: scriptripper-redis
       maxmemoryPolicy: allkeys-lru  # Field not found error

   # ✅ CORRECT - Omit this field entirely
   databases:
     - name: scriptripper-redis
       plan: free
       ipAllowList: []
   ```

### Environment variable missing
- List all required variables
- Indicate which are user-provided
- Show how to add in Render dashboard

### Build failures
- Common Docker build errors
- Missing dependencies
- Port configuration issues

### DNS propagation delays
- Explain typical wait time (10-30 min)
- How to check status (dnschecker.org)
- What to do if it takes longer

## Constraints

- Use Render's Infrastructure as Code (render.yaml) approach
- Follow Render best practices for Docker deployments
- Use Internal URLs for service-to-service communication
- Enable auto-deploy on main branch pushes
- Configure health checks for all web services
- Use free tier where possible (upgradeable later)

## Notes

- Render auto-detects render.yaml on connect
- Blueprint deployments are atomic (all or nothing)
- Environment variables can be synced between services
- Render provides automatic SSL via Let's Encrypt
- Build logs available in real-time
- Shell access for running commands
- Metrics and monitoring built-in

Begin infrastructure generation now.
```

---

## Example Execution

When you launch this agent with ScriptRipper+ details:

**Input:**
- App: ScriptRipper+
- Repo: github.com/user/ScriptRipper
- Domain: scriptripper.com
- Keys: (user provides at runtime)

**Agent Output:**
1. Creates `render.yaml` (150 lines)
2. Creates `.env.render` with generated JWT_SECRET
3. Creates `DEPLOY_RENDER_GUIDE.md` (step-by-step)
4. Creates `deploy_render.sh` (git automation)
5. Creates `verify_deployment.sh` (health checks)
6. Provides deployment summary

**User Action:**
1. Review generated files (2 min)
2. Paste API keys into .env.render (2 min)
3. Run deploy_render.sh (30 sec)
4. Go to Render dashboard and click "Apply Blueprint" (30 sec)
5. Paste environment variables in Render UI (3 min)
6. Wait for deploy (5-10 min passive)
7. Run migrations via Shell (1 min)
8. Configure DNS in GoDaddy (5 min)
9. Run verify_deployment.sh (30 sec)

**Total Time:**
- Agent generation: 5 min
- User active work: ~12 min
- Passive waiting: ~10-30 min
- **Total**: ~22-47 min vs 60-90 min manual

---

## Advantages Over Manual Deployment

**What Agent Automates:**
- ✅ render.yaml creation (no manual service setup)
- ✅ JWT secret generation (secure random)
- ✅ Environment variable template (nothing forgotten)
- ✅ Git commands (no mistakes)
- ✅ Verification scripts (test everything)
- ✅ Complete documentation (step-by-step)

**What User Still Does:**
- Provide API keys (can't automate secret retrieval)
- Click through Render UI (Blueprint applies automatically but needs confirmation)
- Configure DNS (requires GoDaddy login)
- Verify deployment (run provided scripts)

**Time Breakdown:**
| Task | Manual | With Agent | Savings |
|------|--------|-----------|---------|
| Config files | 20 min | 0 min | 100% |
| Environment vars | 15 min | 3 min | 80% |
| Git setup | 5 min | 30 sec | 90% |
| Render UI clicks | 15 min | 5 min | 67% |
| Migrations | 5 min | 1 min | 80% |
| DNS config | 10 min | 5 min | 50% |
| Verification | 10 min | 30 sec | 95% |
| **Total** | **80 min** | **15 min** | **81%** |

---

## Usage in Other Projects

To adapt this template for different applications:

1. **Change Stack Details**:
   - Update service types (web, worker, cron, etc.)
   - Modify Dockerfile paths
   - Adjust health check endpoints

2. **Modify Environment Variables**:
   - Add/remove based on app needs
   - Change API key requirements
   - Update domain-specific configs

3. **Adjust Database/Cache**:
   - Use MySQL instead of PostgreSQL
   - Add Elasticsearch or other services
   - Change database names

4. **Customize Domain Setup**:
   - Replace scriptripper.com with target domain
   - Adjust DNS provider instructions (not GoDaddy)
   - Handle subdomain configurations

---

## Related Templates

- `deploy-to-railway.md` - Alternative platform (CLI-based)
- `add-database-adapter.md` - If using different database
- `add-error-tracking.md` - Add Sentry after deployment

---

## Success Metrics

**Agent Performance:**
- Configuration generation: <5 min
- Zero manual file creation
- All environment variables documented
- Deployment guides complete and accurate

**Deployment Results:**
- All services healthy on first try
- DNS propagates within 30 min
- Health checks pass immediately
- API fully functional

**User Experience:**
- Minimal manual steps
- Clear, actionable instructions
- No guesswork on configuration
- Fast deployment (<20 min active)
