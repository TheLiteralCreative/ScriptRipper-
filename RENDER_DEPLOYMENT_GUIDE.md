# ScriptRipper+ Render Deployment Guide

Complete step-by-step guide to deploy ScriptRipper+ to Render using Infrastructure as Code (render.yaml Blueprint).

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Preparation](#preparation)
3. [Deploy to Render](#deploy-to-render)
4. [Configure Environment Variables](#configure-environment-variables)
5. [Run Database Migrations](#run-database-migrations)
6. [Configure Custom Domain (GoDaddy)](#configure-custom-domain-godaddy)
7. [Set Up Stripe Webhooks](#set-up-stripe-webhooks)
8. [Verify Deployment](#verify-deployment)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- [ ] GitHub account with ScriptRipper+ repository
- [ ] Render account (free): https://dashboard.render.com/register
- [ ] Domain registered with GoDaddy: scriptripper.com
- [ ] Gemini API key: https://makersuite.google.com/app/apikey
- [ ] Stripe account: https://dashboard.stripe.com
- [ ] (Optional) Sentry account: https://sentry.io

---

## Preparation

### Step 1: Run the Deployment Script

From your project root directory:

```bash
./deploy_render.sh
```

This script will:
- Validate your git configuration
- Add render.yaml to your repository
- Commit and push to GitHub
- Show you next steps

**Expected Output:**
```
✓ Git is installed
✓ Git repository detected
✓ render.yaml found
✓ Git remote configured: https://github.com/YOUR_USERNAME/ScriptRipper.git
✓ Successfully pushed to GitHub
```

### Step 2: Review Environment Variables

Open `.env.render` and note all the values you need to configure. Key items:

**Required:**
- `JWT_SECRET` - Already generated (64-character hex string)
- `GEMINI_API_KEY` - Get from Google AI Studio
- `STRIPE_SECRET_KEY` - Get from Stripe Dashboard
- `STRIPE_PRO_PRICE_ID` - Get from Stripe Products

**Optional but Recommended:**
- `SENTRY_DSN` - For error tracking
- `PURELYMAIL_*` - For email functionality

---

## Deploy to Render

### Step 1: Access Render Dashboard

1. Go to: https://dashboard.render.com
2. Log in or create a free account
3. Click **"New"** → **"Blueprint"**

### Step 2: Connect GitHub Repository

1. Click **"Connect GitHub"** (if not already connected)
2. Authorize Render to access your repositories
3. Select your ScriptRipper+ repository
4. Choose the branch: **main** (or your default branch)

### Step 3: Review Blueprint Configuration

Render will automatically detect `render.yaml` and show:

**Services to be created:**
- ✅ **scriptripper-api** (Web Service)
  - Type: Docker
  - Plan: Free
  - Auto-deploy: Enabled
  - Health check: /health

- ✅ **scriptripper-worker** (Worker Service)
  - Type: Docker
  - Plan: Free
  - Auto-deploy: Enabled

**Databases to be created:**
- ✅ **scriptripper-db** (PostgreSQL)
  - Plan: Free (256MB RAM, 1GB storage)
  - Database: scriptripper_production

- ✅ **scriptripper-redis** (Redis)
  - Plan: Free (25MB RAM)
  - Eviction policy: allkeys-lru

### Step 4: Configure Service Plans (Optional)

**Free Tier Limitations:**
- Services spin down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds
- Shared resources

**Recommended for Production:**
- Upgrade API service to **Starter ($7/mo)** or **Standard ($25/mo)**
- Upgrade Worker to **Starter ($7/mo)**
- Upgrade Database to **Starter ($7/mo)** - 1GB RAM, 10GB storage
- Keep Redis on Free tier initially

To upgrade later: Dashboard → Service → Settings → Plan

### Step 5: Apply Blueprint

1. Review all services and databases
2. Click **"Apply"** at the bottom
3. Render will start creating all resources simultaneously

**This process takes 5-10 minutes:**
- Creating database instances
- Building Docker images
- Deploying services
- Establishing connections

**Monitor Progress:**
- You'll see real-time logs for each service
- Green checkmark = Service is live
- Yellow spinner = Building/deploying
- Red X = Error (check logs)

---

## Configure Environment Variables

After services are created, you need to manually add environment variables that couldn't be auto-configured.

### Step 1: Configure API Service Variables

1. In Render Dashboard, click **"scriptripper-api"**
2. Go to **"Environment"** tab
3. Click **"Add Environment Variable"**

**Add these variables from `.env.render`:**

#### Required Variables

| Variable | Value | Where to Get It |
|----------|-------|-----------------|
| `JWT_SECRET` | Copy from `.env.render` | Auto-generated (64 hex chars) |
| `GEMINI_API_KEY` | Your Gemini API key | https://makersuite.google.com/app/apikey |
| `STRIPE_SECRET_KEY` | `sk_live_...` | https://dashboard.stripe.com/apikeys |
| `STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | https://dashboard.stripe.com/apikeys |
| `STRIPE_PRO_PRICE_ID` | `price_...` | https://dashboard.stripe.com/products |

**Note:** For testing, use Stripe **test keys** (`sk_test_...`, `pk_test_...`)

#### Optional Variables

| Variable | Purpose | Where to Get It |
|----------|---------|-----------------|
| `SENTRY_DSN` | Error tracking | https://sentry.io/settings/projects/[project]/keys/ |
| `PURELYMAIL_API_TOKEN` | Email sending | https://purelymail.com/manage/settings/api |
| `PURELYMAIL_SMTP_USER` | Email auth | Your Purelymail email |
| `PURELYMAIL_SMTP_PASS` | Email auth | Purelymail app password |
| `GOOGLE_CLIENT_ID` | OAuth login | https://console.cloud.google.com/apis/credentials |
| `GOOGLE_CLIENT_SECRET` | OAuth login | Google Cloud Console |

**Adding Variables:**
1. Click "+ Add Environment Variable"
2. Enter key name (e.g., `JWT_SECRET`)
3. Paste value from `.env.render`
4. Click "Add"
5. Repeat for all variables

### Step 2: Configure Worker Service Variables

The worker needs the **same environment variables** as the API:

1. Click **"scriptripper-worker"** in Dashboard
2. Go to **"Environment"** tab
3. Add the same variables as API:
   - `GEMINI_API_KEY`
   - `SENTRY_DSN` (optional)
   - `PURELYMAIL_*` (if using email)

**Note:** `DATABASE_URL` and `REDIS_URL` are auto-configured - don't add them manually.

### Step 3: Save and Deploy

After adding all variables:
1. Click **"Save Changes"** at the bottom
2. Render will automatically redeploy both services
3. Wait for green checkmark (services are live)

---

## Run Database Migrations

After services are deployed, initialize the database schema.

### Step 1: Access Shell on API Service

1. In Render Dashboard, click **"scriptripper-api"**
2. Go to **"Shell"** tab
3. Click **"Launch Shell"** (opens web terminal)

### Step 2: Run Alembic Migrations

In the shell, run:

```bash
# Navigate to API directory (if needed)
cd /app

# Run database migrations
alembic upgrade head
```

**Expected Output:**
```
INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.
INFO  [alembic.runtime.migration] Will assume transactional DDL.
INFO  [alembic.runtime.migration] Running upgrade -> abc123, initial schema
INFO  [alembic.runtime.migration] Running upgrade abc123 -> def456, add_users_table
```

### Step 3: Verify Tables Created

Still in the shell:

```bash
# Connect to database
python -c "from app.config.database import init_db; import asyncio; asyncio.run(init_db()); print('Database initialized')"
```

**Alternative: Use Render PostgreSQL Console**

1. Click **"scriptripper-db"** in Dashboard
2. Go to **"Query"** tab
3. Run SQL query:

```sql
-- List all tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
```

**Expected tables:**
- `users`
- `profiles`
- `jobs`
- `artifacts`
- `usage`
- `prompts`
- `custom_prompts`
- `alembic_version`

### Step 4: Seed Initial Data (Optional)

If you have a seed script:

```bash
python -m app.scripts.seed
```

---

## Configure Custom Domain (GoDaddy)

Point scriptripper.com to your Render deployment.

### Step 1: Get Render DNS Records

1. In Render Dashboard, click **"scriptripper-api"**
2. Go to **"Settings"** tab
3. Scroll to **"Custom Domain"**
4. Click **"Add Custom Domain"**
5. Enter: `scriptripper.com`
6. Click **"Save"**

Render will show DNS records you need to configure:

**Option A: CNAME (Recommended)**
```
Type: CNAME
Name: @
Value: scriptripper-api.onrender.com
TTL: 3600
```

**Option B: A Record + CNAME**
```
Type: A
Name: @
Value: [IP address provided by Render]
TTL: 3600

Type: CNAME
Name: www
Value: scriptripper.com
TTL: 3600
```

### Step 2: Configure GoDaddy DNS

1. Log in to GoDaddy: https://dcc.godaddy.com/
2. Go to **"My Products"** → **"Domains"**
3. Click **"DNS"** next to scriptripper.com
4. Scroll to **"Records"** section

**Add CNAME Record:**
1. Click **"Add"** button
2. Select **"CNAME"** from Type dropdown
3. Enter:
   - **Name:** `@` (for root domain)
   - **Value:** `scriptripper-api.onrender.com`
   - **TTL:** `1 Hour` (or custom)
4. Click **"Save"**

**Add www Subdomain:**
1. Click **"Add"** again
2. Select **"CNAME"**
3. Enter:
   - **Name:** `www`
   - **Value:** `scriptripper.com`
   - **TTL:** `1 Hour`
4. Click **"Save"**

### Step 3: Wait for DNS Propagation

- **Time:** 15 minutes to 48 hours (usually < 1 hour)
- **Check status:** https://dnschecker.org
- Enter `scriptripper.com` and verify CNAME records

### Step 4: Enable HTTPS in Render

1. Back in Render Dashboard → **scriptripper-api** → **Settings**
2. Under **"Custom Domain"**, you'll see your domain
3. Wait for SSL certificate to provision (automatic)
4. Green checkmark = HTTPS enabled

**Status indicators:**
- ⏳ Pending - DNS propagation in progress
- ✅ Active - Domain is live with HTTPS
- ❌ Failed - Check DNS configuration

### Step 5: Update CORS Origins

After domain is active, update environment variables:

1. Go to **scriptripper-api** → **Environment**
2. Find `CORS_ORIGINS` variable
3. Update to:
   ```
   https://scriptripper.com,https://www.scriptripper.com
   ```
4. Save (service will redeploy)

---

## Set Up Stripe Webhooks

Configure Stripe to send payment events to your API.

### Step 1: Get Webhook Endpoint URL

Your webhook endpoint is:
```
https://scriptripper.com/api/v1/billing/webhook
```

Or if using Render domain:
```
https://scriptripper-api.onrender.com/api/v1/billing/webhook
```

### Step 2: Create Webhook in Stripe Dashboard

1. Log in to Stripe: https://dashboard.stripe.com
2. Go to **"Developers"** → **"Webhooks"**
3. Click **"Add endpoint"**

**Configure Endpoint:**
- **Endpoint URL:** `https://scriptripper.com/api/v1/billing/webhook`
- **Description:** ScriptRipper Production Webhook
- **Events to send:** Select these events:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.paid`
  - `invoice.payment_failed`
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`

4. Click **"Add endpoint"**

### Step 3: Get Webhook Signing Secret

After creating the webhook:

1. Click on the webhook you just created
2. Under **"Signing secret"**, click **"Reveal"**
3. Copy the secret (starts with `whsec_...`)

### Step 4: Add Webhook Secret to Render

1. Go to Render Dashboard → **scriptripper-api** → **Environment**
2. Find `STRIPE_WEBHOOK_SECRET` variable
3. Paste the signing secret
4. Click **"Save Changes"**

**Also update Worker:**
1. Go to **scriptripper-worker** → **Environment**
2. Add same `STRIPE_WEBHOOK_SECRET`
3. Save

### Step 5: Test Webhook

In Stripe Dashboard → Webhooks → [Your Endpoint]:

1. Click **"Send test webhook"**
2. Select event: `checkout.session.completed`
3. Click **"Send test webhook"**

**Check Response:**
- ✅ Status: 200 OK = Working correctly
- ❌ Status: 4xx/5xx = Check logs in Render

**View Logs:**
- Render Dashboard → scriptripper-api → **Logs** tab
- Search for `[BILLING]` or `stripe webhook`

---

## Verify Deployment

Test that everything is working correctly.

### Step 1: Run Automated Tests

From your local machine:

```bash
./verify_deployment.sh
```

This script will test:
- Health check endpoint
- API documentation
- User registration
- Authentication

### Step 2: Manual Verification

**Test Health Check:**
```bash
curl https://scriptripper.com/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "checks": {
    "api": "ok",
    "database": "ok",
    "redis": "ok"
  }
}
```

**Test API Root:**
```bash
curl https://scriptripper.com/
```

**Expected Response:**
```json
{
  "name": "ScriptRipper",
  "version": "0.1.0",
  "environment": "production"
}
```

**Test Registration (if enabled):**
```bash
curl -X POST https://scriptripper.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123!",
    "name": "Test User"
  }'
```

### Step 3: Check Service Status

In Render Dashboard:

1. **scriptripper-api**
   - Status: ✅ Live
   - Last deploy: Recent
   - Health check: Passing
   - CPU/Memory: Normal

2. **scriptripper-worker**
   - Status: ✅ Live
   - Last deploy: Recent
   - Logs: Processing jobs

3. **scriptripper-db**
   - Status: ✅ Available
   - Connections: Active

4. **scriptripper-redis**
   - Status: ✅ Available
   - Memory usage: Normal

### Step 4: Monitor Logs

**API Logs:**
```
Render Dashboard → scriptripper-api → Logs
```

Look for:
- `[INFO] Application startup complete`
- `[INFO] Uvicorn running on http://0.0.0.0:8000`
- No errors or exceptions

**Worker Logs:**
```
Render Dashboard → scriptripper-worker → Logs
```

Look for:
- `[INFO] Worker started`
- `[INFO] Listening for jobs on queue: default`
- Job processing logs

---

## Troubleshooting

### Service Won't Start

**Symptom:** Service shows "Deploy failed" or keeps restarting

**Solutions:**
1. Check environment variables are set correctly
2. Review build logs for errors
3. Ensure Dockerfile paths are correct
4. Verify DATABASE_URL and REDIS_URL are populated

**How to Check:**
- Dashboard → Service → Logs → Filter by "error"
- Look for missing environment variables
- Check Docker build stage for failures

### Database Connection Errors

**Symptom:** `sqlalchemy.exc.OperationalError: could not connect to server`

**Solutions:**
1. Ensure database is fully provisioned (check status)
2. Verify DATABASE_URL is auto-configured (don't set manually)
3. Run migrations: `alembic upgrade head`
4. Check database plan isn't exhausted (free tier: 1GB limit)

**How to Check:**
- Dashboard → scriptripper-db → Info → Status
- Dashboard → scriptripper-api → Environment → Verify DATABASE_URL exists
- Dashboard → scriptripper-db → Metrics → Check storage usage

### Redis Connection Errors

**Symptom:** `redis.exceptions.ConnectionError`

**Solutions:**
1. Ensure Redis is provisioned and running
2. Verify REDIS_URL is auto-configured
3. Check Redis memory limit (free tier: 25MB)
4. Restart services if Redis was recently created

**How to Check:**
- Dashboard → scriptripper-redis → Info → Status
- Dashboard → scriptripper-api → Environment → Verify REDIS_URL exists
- Dashboard → scriptripper-redis → Metrics → Check memory usage

### Health Check Failing

**Symptom:** Health check endpoint returns 503 or times out

**Solutions:**
1. Check all dependencies are healthy:
   ```bash
   curl https://scriptripper.com/health
   ```
2. Review which service is failing (database/redis/api)
3. Restart unhealthy service
4. Check service logs for connection errors

### Worker Not Processing Jobs

**Symptom:** Jobs stuck in "pending" state

**Solutions:**
1. Check worker service is running
2. Verify worker has same environment variables as API
3. Check Redis connection in worker logs
4. Ensure REDIS_URL matches between API and worker

**How to Check:**
- Dashboard → scriptripper-worker → Status (should be "Live")
- Dashboard → scriptripper-worker → Logs (look for "Listening for jobs")
- Compare environment variables between API and worker

### Custom Domain Not Working

**Symptom:** Domain returns "Not Found" or doesn't resolve

**Solutions:**
1. Check DNS propagation: https://dnschecker.org
2. Verify CNAME record in GoDaddy points to Render
3. Wait 15-60 minutes for DNS propagation
4. Ensure SSL certificate is provisioned in Render

**How to Check:**
- GoDaddy → Domains → scriptripper.com → DNS → Verify records
- Render → scriptripper-api → Settings → Custom Domain → Check status
- Use `dig scriptripper.com` to verify DNS resolution

### Stripe Webhooks Not Working

**Symptom:** Webhook status shows errors in Stripe Dashboard

**Solutions:**
1. Verify webhook URL is correct and accessible
2. Check STRIPE_WEBHOOK_SECRET is set in Render
3. Review API logs for webhook processing errors
4. Test webhook endpoint manually:
   ```bash
   curl https://scriptripper.com/api/v1/billing/webhook
   ```

**How to Check:**
- Stripe Dashboard → Webhooks → [Endpoint] → Check recent attempts
- Render → scriptripper-api → Logs → Search for "stripe webhook"
- Verify API endpoint responds (may return 400 for test, but shouldn't 404)

### Free Tier Services Spinning Down

**Symptom:** First request after inactivity takes 30+ seconds

**Solutions:**
1. This is expected behavior on free tier
2. Upgrade to Starter plan ($7/mo) to keep services always on
3. Use UptimeRobot (free) to ping health endpoint every 5 minutes
4. Consider upgrading at least the API service

**Upgrade Steps:**
- Dashboard → scriptripper-api → Settings → Plan
- Select "Starter" or higher
- Confirm payment

---

## Post-Deployment Checklist

After successful deployment:

- [ ] All services show "Live" status in Render
- [ ] Health check returns "healthy"
- [ ] Database migrations completed
- [ ] Custom domain (scriptripper.com) resolves correctly
- [ ] HTTPS is enabled and working
- [ ] Environment variables configured for API and Worker
- [ ] Stripe webhooks set up and responding
- [ ] Test user registration and authentication
- [ ] Test transcript analysis job
- [ ] Monitor logs for errors
- [ ] Set up monitoring (optional): UptimeRobot, Better Uptime
- [ ] Configure alerting (optional): Sentry, email notifications

---

## Useful Commands

### View Service Logs
```bash
# Via Render CLI (install first: npm install -g render)
render logs scriptripper-api
render logs scriptripper-worker
```

### Access Database
```bash
# Get connection string from Dashboard → scriptripper-db → Info
psql "postgresql://scriptripper:PASSWORD@HOST/scriptripper_production"
```

### Restart Service
```bash
# Via Dashboard
Dashboard → Service → Manual Deploy → Deploy latest commit

# Via CLI
render deploy scriptripper-api
```

### Check Redis
```bash
# Via Dashboard Shell (scriptripper-api → Shell)
redis-cli -u $REDIS_URL ping
redis-cli -u $REDIS_URL info memory
```

---

## Support & Resources

- **Render Documentation:** https://render.com/docs
- **Render Status Page:** https://status.render.com
- **Render Community:** https://community.render.com
- **ScriptRipper Repository:** [Your GitHub URL]
- **Issues:** [Your GitHub Issues URL]

---

## Summary

You've successfully deployed ScriptRipper+ to Render! Your infrastructure includes:

- ✅ FastAPI web service (auto-scaling, health checks)
- ✅ Background worker service (async job processing)
- ✅ PostgreSQL database (persistent data storage)
- ✅ Redis cache (job queue and caching)
- ✅ Custom domain with HTTPS
- ✅ Stripe integration for billing
- ✅ Error tracking with Sentry (optional)
- ✅ Auto-deploy on git push

**Next Steps:**
1. Monitor your services for the first 24 hours
2. Test all critical functionality
3. Set up backup strategy for database
4. Configure monitoring and alerting
5. Plan for scaling (upgrade to paid tiers as needed)

**Remember:** Free tier services spin down after 15 minutes of inactivity. Upgrade to Starter plan for always-on services.

Happy deploying! 🚀
