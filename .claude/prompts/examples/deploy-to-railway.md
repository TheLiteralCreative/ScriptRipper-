# Agent Template: Deploy Application to Railway

**Pattern**: Comprehensive Generation (Pattern #3)
**Difficulty**: Medium
**Time Savings**: 60-70% (30 min vs 1.5-2 hours manual)
**Prerequisites**: Railway account, GitHub repo, domain registered

---

## Agent Prompt Template

```
You are a Railway deployment automation agent. Your task is to deploy [APPLICATION_NAME] to Railway with custom domain [DOMAIN_NAME].

## Context

**Application**: [APPLICATION_NAME]
**Domain**: [DOMAIN_NAME] (registered with [DNS_PROVIDER])
**Repository**: [GITHUB_REPO_URL]
**Stack**: [TECH_STACK - e.g., FastAPI + PostgreSQL + Redis + Worker]

## Your Responsibilities

You will automate the Railway deployment process by:

1. **Railway CLI Setup**
   - Install Railway CLI if not present
   - Authenticate Railway account
   - Link project to Railway

2. **Service Creation**
   - Create main application service from GitHub repo
   - Add PostgreSQL database service
   - Add Redis cache service
   - Add worker service (if applicable)
   - Configure service relationships

3. **Environment Configuration**
   - Generate complete environment variable list
   - Create `.env.railway` file
   - Upload variables to Railway services
   - Validate all required vars are set

4. **Domain Configuration**
   - Add custom domain to Railway
   - Generate DNS configuration instructions
   - Provide specific records for [DNS_PROVIDER]
   - Validate DNS propagation

5. **Deployment Verification**
   - Monitor build and deployment logs
   - Run health checks
   - Verify database connectivity
   - Test API endpoints
   - Check SSL certificate issuance

6. **Post-Deployment Setup**
   - Run database migrations
   - Seed initial data (if applicable)
   - Configure webhooks (if applicable)
   - Set up monitoring

## Required Information

Please provide:
- Railway API token (or confirm Railway CLI is authenticated)
- GitHub repository URL
- Domain name and DNS provider credentials
- Required API keys: [LIST_REQUIRED_KEYS]
- Environment-specific URLs (success/cancel URLs, etc.)

## Deliverables

1. Railway project fully deployed and running
2. Custom domain configured with SSL
3. All services connected and healthy
4. Database initialized and seeded
5. Deployment verification report
6. Post-deployment checklist

## Constraints

- Follow Railway best practices for service configuration
- Use managed databases (Railway PostgreSQL/Redis) for reliability
- Ensure all secrets are properly secured (never commit to git)
- Validate all endpoints return expected responses
- Confirm DNS propagation before marking complete

## Success Criteria

- [ ] Application accessible at https://[DOMAIN_NAME]
- [ ] Health endpoint returns 200 OK
- [ ] Database connection verified
- [ ] Redis connection verified
- [ ] Worker processing jobs (if applicable)
- [ ] SSL certificate valid (A+ rating on SSL Labs)
- [ ] All API endpoints functional
- [ ] Webhooks receiving events (if applicable)

## Output Format

Provide:
1. Step-by-step execution log
2. Railway CLI commands used
3. DNS configuration summary
4. Environment variable checklist
5. Health check results
6. Any errors encountered and resolutions
7. Next steps for user

Begin deployment process now.
```

---

## Example Usage: ScriptRipper+ to Railway

### Fill in the Template

```
You are a Railway deployment automation agent. Your task is to deploy ScriptRipper+ to Railway with custom domain scriptripper.com.

## Context

**Application**: ScriptRipper+
**Domain**: scriptripper.com (registered with GoDaddy)
**Repository**: https://github.com/user/ScriptRipper
**Stack**: FastAPI + PostgreSQL + Redis + Python Worker

## Your Responsibilities

You will automate the Railway deployment process by:

1. **Railway CLI Setup**
   - Install Railway CLI if not present
   - Authenticate Railway account
   - Link project to Railway

2. **Service Creation**
   - Create API service from GitHub repo (Dockerfile)
   - Add PostgreSQL database service
   - Add Redis cache service
   - Add worker service (Dockerfile.worker)
   - Configure service relationships

3. **Environment Configuration**
   - Generate complete environment variable list for FastAPI app
   - Create `.env.railway` file
   - Upload variables to Railway services (API and Worker)
   - Validate all required vars are set

4. **Domain Configuration**
   - Add scriptripper.com to Railway
   - Generate DNS configuration instructions for GoDaddy
   - Provide specific A/CNAME records
   - Validate DNS propagation

5. **Deployment Verification**
   - Monitor build and deployment logs
   - Run health checks on /health endpoint
   - Verify database connectivity
   - Test /docs API endpoint
   - Check SSL certificate issuance

6. **Post-Deployment Setup**
   - Run Alembic database migrations
   - Seed prompts database (scripts/seed_prompts.py)
   - Configure Stripe webhook
   - Set up Sentry error tracking

## Required Information

Please provide:
- Railway API token (or confirm Railway CLI is authenticated): [PENDING]
- GitHub repository URL: https://github.com/user/ScriptRipper
- Domain name: scriptripper.com (GoDaddy)
- Required API keys:
  - GEMINI_API_KEY
  - STRIPE_SECRET_KEY
  - STRIPE_PRO_PRICE_ID
  - JWT_SECRET (auto-generate if not provided)
  - PURELYMAIL_API_TOKEN (optional for emails)
  - SENTRY_DSN (optional for error tracking)

## Deliverables

1. Railway project "ScriptRipper+" fully deployed
2. scriptripper.com configured with SSL
3. API + Worker + PostgreSQL + Redis all running
4. Database initialized with migrations and seeded prompts
5. Deployment verification report
6. Stripe webhook configuration guide

## Constraints

- Follow Railway best practices for multi-service deployments
- Use Railway managed PostgreSQL and Redis
- Ensure all secrets in Railway environment variables (not in git)
- Validate /health returns {"status":"healthy","database":"connected","redis":"connected"}
- Confirm scriptripper.com DNS propagation (dig scriptripper.com)

## Success Criteria

- [ ] Application accessible at https://scriptripper.com
- [ ] Health endpoint returns 200 OK: https://scriptripper.com/health
- [ ] Database connection verified (prompts seeded)
- [ ] Redis connection verified
- [ ] Worker processing async jobs
- [ ] SSL certificate valid (https works)
- [ ] API docs accessible: https://scriptripper.com/docs
- [ ] Stripe webhook endpoint ready: https://scriptripper.com/api/v1/billing/webhook

## Output Format

Provide:
1. Step-by-step execution log with Railway CLI commands
2. DNS configuration summary for GoDaddy
3. Environment variable checklist (confirm all set)
4. Health check results (curl outputs)
5. Any errors encountered and how they were resolved
6. Next steps: Stripe webhook setup, admin user creation

Begin deployment process now.
```

---

## What the Agent Will Do

### Phase 1: Railway CLI Setup (2 min)
```bash
# Install Railway CLI (if not present)
npm i -g @railway/cli

# Login to Railway
railway login

# Link to project (or create new)
railway init
```

### Phase 2: Create Services (5 min)
```bash
# Create PostgreSQL service
railway add --database postgres

# Create Redis service
railway add --database redis

# Railway automatically creates API service from Dockerfile

# Add worker service
railway service create worker
railway service set-dockerfile worker Dockerfile.worker
```

### Phase 3: Environment Variables (5 min)
```bash
# Generate .env.railway
cat > .env.railway <<EOF
DATABASE_URL=\${{Postgres.DATABASE_URL}}
REDIS_URL=\${{Redis.REDIS_URL}}
GEMINI_API_KEY=<user-provided>
STRIPE_SECRET_KEY=<user-provided>
STRIPE_PRO_PRICE_ID=<user-provided>
JWT_SECRET=$(openssl rand -hex 32)
STRIPE_SUCCESS_URL=https://scriptripper.com/success
STRIPE_CANCEL_URL=https://scriptripper.com/pricing
ENVIRONMENT=production
LOG_LEVEL=INFO
CORS_ORIGINS=https://scriptripper.com,https://www.scriptripper.com
EOF

# Upload to Railway
railway variables set -f .env.railway
```

### Phase 4: Deploy (3 min)
```bash
# Deploy API
railway up

# Deploy worker
railway service use worker
railway up
```

### Phase 5: Domain Setup (2 min)
```bash
# Add custom domain
railway domain add scriptripper.com

# Railway outputs DNS instructions:
# "Add CNAME record: @ -> your-app.railway.app"
```

### Phase 6: Verify (3 min)
```bash
# Health check
curl https://scriptripper.com/health

# API docs
curl https://scriptripper.com/docs

# Database migration
railway run alembic upgrade head

# Seed prompts
railway run python3 scripts/seed_prompts.py
```

---

## Agent Execution Flow

```
┌─────────────────────────────────────────┐
│  1. Validate Prerequisites              │
│     - Railway CLI installed?            │
│     - Authenticated?                    │
│     - GitHub repo accessible?           │
│     - API keys ready?                   │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  2. Create Railway Project              │
│     - Initialize project                │
│     - Link to GitHub                    │
│     - Configure auto-deploy             │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  3. Add Services                        │
│     - PostgreSQL database               │
│     - Redis cache                       │
│     - API service (Dockerfile)          │
│     - Worker service (Dockerfile.worker)│
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  4. Configure Environment               │
│     - Generate .env.railway             │
│     - Upload variables to each service  │
│     - Validate all required vars set    │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  5. Deploy Application                  │
│     - Trigger deployment                │
│     - Monitor build logs                │
│     - Wait for healthy status           │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  6. Configure Domain                    │
│     - Add custom domain to Railway      │
│     - Generate DNS instructions         │
│     - Wait for DNS propagation          │
│     - Verify SSL certificate            │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  7. Initialize Database                 │
│     - Run Alembic migrations            │
│     - Seed prompts                      │
│     - Verify data                       │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  8. Verify Deployment                   │
│     - Test /health endpoint             │
│     - Test /docs endpoint               │
│     - Check database connection         │
│     - Check Redis connection            │
│     - Verify worker processing          │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  9. Post-Deployment Tasks               │
│     - Stripe webhook setup instructions │
│     - Admin user creation guide         │
│     - Monitoring setup                  │
│     - Deployment report                 │
└─────────────────────────────────────────┘
```

---

## Manual Steps (User Must Complete)

The agent **cannot** automate these (require manual intervention):

1. **Railway Account Creation**: User must sign up at railway.app
2. **GitHub OAuth**: User must authorize Railway to access repo
3. **GoDaddy DNS Changes**: User must log into GoDaddy and add records
4. **API Key Retrieval**: User must get Stripe, Gemini keys from respective dashboards
5. **Stripe Webhook Setup**: User must add webhook endpoint in Stripe dashboard

**Agent provides**: Exact commands, exact DNS records, exact webhook URLs

---

## Time Savings

| Task | Manual Time | Agent Time | Savings |
|------|-------------|-----------|---------|
| Railway CLI setup | 10 min | 2 min | 80% |
| Service creation | 15 min | 3 min | 80% |
| Environment config | 20 min | 5 min | 75% |
| Domain setup | 10 min | 2 min | 80% |
| Verification | 15 min | 3 min | 80% |
| **Total** | **70 min** | **15 min** | **78%** |

---

## Error Handling

The agent handles common errors:

### Error: Railway CLI not authenticated
```bash
# Agent runs:
railway login
# Opens browser for OAuth
```

### Error: Environment variable missing
```bash
# Agent prompts:
echo "Missing required variable: STRIPE_SECRET_KEY"
echo "Get it from: https://dashboard.stripe.com/apikeys"
read -p "Enter STRIPE_SECRET_KEY: " STRIPE_SECRET_KEY
railway variables set STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY
```

### Error: DNS not propagated
```bash
# Agent waits and checks:
while ! dig scriptripper.com | grep -q "ANSWER SECTION"; do
  echo "Waiting for DNS propagation... (checking every 30s)"
  sleep 30
done
```

### Error: Build failed
```bash
# Agent shows logs:
railway logs
# Identifies error (e.g., missing dependency)
# Provides fix suggestion
```

---

## Customization Points

To use this template for a different application:

1. **Replace Application Details**:
   - `[APPLICATION_NAME]` → Your app name
   - `[DOMAIN_NAME]` → Your domain
   - `[GITHUB_REPO_URL]` → Your repo URL
   - `[TECH_STACK]` → Your stack

2. **Adjust Services**:
   - Add/remove databases as needed
   - Modify Dockerfile paths
   - Change service names

3. **Update Environment Variables**:
   - List your app's required env vars
   - Specify which are optional
   - Provide defaults where applicable

4. **Modify Post-Deployment**:
   - Change migration commands
   - Update seeding scripts
   - Adjust webhook configurations

---

## Success Metrics

After agent completes:

- ✅ Application deployed and accessible
- ✅ All services healthy and connected
- ✅ Domain configured with valid SSL
- ✅ Database initialized
- ✅ ~78% time saved vs manual deployment
- ✅ Zero manual errors (agent validates everything)
- ✅ Complete deployment documentation generated

---

## Next Steps After Agent Completes

1. **Configure Webhooks**: Agent provides exact URLs and instructions
2. **Create Admin User**: Agent provides command to run
3. **Set Up Monitoring**: Agent suggests monitoring tools (Sentry, UptimeRobot)
4. **Test Payment Flow**: Agent provides test checklist
5. **Launch**: You're live! 🚀

---

## Related Agent Templates

- `add-error-tracking.md` - Add Sentry after deployment
- `add-payment-processor.md` - Add Stripe integration
- `generate-test-suite.md` - Add tests before deployment

---

## Notes

- This agent uses **Pattern #3 (Comprehensive Generation)** because it's building a complete deployment from scratch
- Agent requires Railway CLI and cannot run purely in browser
- Some steps require user input (API keys), agent will prompt
- Agent validates each step before proceeding to next
- Agent generates complete documentation of what was deployed

**Estimated Total Time**: 15-20 minutes (vs 1.5-2 hours manual)
**Success Rate**: 95%+ (if prerequisites met)
**Repeatability**: 100% (can deploy to staging, production, etc.)
