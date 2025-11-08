# ScriptRipper Deployment Guide

## Quick Start: Deploy to scriptripper.com (15 minutes)

This is the **fastest path** to get ScriptRipper+ live at scriptripper.com using Railway + GoDaddy.

### What You Need
- GitHub account with ScriptRipper+ repo
- GoDaddy account with scriptripper.com domain ✓ (you have this)
- API keys: Gemini, Stripe

### Step 1: Deploy to Railway (5 min)

1. **Sign up for Railway**: Go to [railway.app](https://railway.app) → Sign in with GitHub

2. **Create New Project**:
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your `ScriptRipper+` repository
   - Railway auto-detects Dockerfile and starts building

3. **Add PostgreSQL**:
   - Click "+ New" → "Database" → "PostgreSQL"
   - Railway provisions managed database
   - Copy the `DATABASE_URL` from the PostgreSQL service variables

4. **Add Redis**:
   - Click "+ New" → "Database" → "Redis"
   - Copy the `REDIS_URL` from the Redis service variables

5. **Configure API Environment Variables**:
   - Click on your `api` service → "Variables" tab
   - Add all these variables:

   ```bash
   DATABASE_URL=<from PostgreSQL service>
   REDIS_URL=<from Redis service>
   GEMINI_API_KEY=<your Gemini key>
   JWT_SECRET=<generate random 32+ char string>
   STRIPE_SECRET_KEY=sk_live_<your live key>
   STRIPE_PRO_PRICE_ID=price_<your price ID>
   STRIPE_WEBHOOK_SECRET=whsec_<will add after webhook setup>
   STRIPE_SUCCESS_URL=https://scriptripper.com/success
   STRIPE_CANCEL_URL=https://scriptripper.com/pricing
   ENVIRONMENT=production
   LOG_LEVEL=INFO
   CORS_ORIGINS=https://scriptripper.com,https://www.scriptripper.com
   ```

6. **Add Worker Service**:
   - Click "+ New" → "Empty Service"
   - Name: `worker`
   - Settings → "Dockerfile Path" → `Dockerfile.worker`
   - Add same environment variables as API
   - Deploy

### Step 2: Configure GoDaddy DNS (5 min)

1. **Get Railway Domain**:
   - In Railway, click on `api` service
   - Go to "Settings" → "Networking" → "Generate Domain"
   - Railway gives you: `scriptripper-production-xyz.up.railway.app`
   - Click "Add Custom Domain" → Enter: `scriptripper.com`

2. **Railway Shows DNS Instructions** - Choose one:

   **Option A: CNAME (Easiest)**
   - Type: `CNAME`
   - Name: `@`
   - Value: `<your-railway-domain>.up.railway.app`
   - TTL: `600`

   **Option B: A Record**
   - Type: `A`
   - Name: `@`
   - Value: `<IP from Railway>`
   - TTL: `600`

3. **Log into GoDaddy**:
   - Go to [godaddy.com](https://godaddy.com) → My Products → Domains
   - Click on scriptripper.com → DNS Management

4. **Add DNS Records**:
   - Click "Add" → Select record type (CNAME or A based on Railway's instructions)
   - **Delete any existing `@` A records** (GoDaddy parking page)
   - Add the record as Railway instructed
   - Also add www CNAME:
     - Type: `CNAME`
     - Name: `www`
     - Value: `scriptripper.com`
     - TTL: `600`
   - Click "Save"

5. **Wait for DNS Propagation** (10-30 minutes):
   - Check status: `dig scriptripper.com`
   - Or use: https://dnschecker.org

### Step 3: SSL Auto-Configuration (5 min)

Railway automatically provisions SSL certificates:
- Once DNS propagates, Railway detects your domain
- Let's Encrypt SSL certificate issued automatically
- Your site becomes available at `https://scriptripper.com`

### Step 4: Configure Stripe Webhook

1. **In Stripe Dashboard**:
   - Go to: Developers → Webhooks → "Add endpoint"
   - Endpoint URL: `https://scriptripper.com/api/v1/billing/webhook`
   - Select events:
     - `checkout.session.completed`
     - `customer.subscription.deleted`
     - `customer.subscription.updated`
   - Click "Add endpoint"
   - **Copy Webhook Signing Secret** (starts with `whsec_`)

2. **Update Railway**:
   - Go back to Railway → `api` service → Variables
   - Add: `STRIPE_WEBHOOK_SECRET=whsec_<your secret>`
   - Railway auto-redeploys

### Step 5: Initialize Database

1. **Run Migrations**:
   - Railway → `api` service → "Deployments"
   - Click latest deployment → "View Logs"
   - Migrations should run automatically on startup

2. **Seed Prompts**:
   ```bash
   # SSH into Railway container or run via Railway CLI
   python3 scripts/seed_prompts.py
   ```

### Step 6: Test Live Site

```bash
# Health check
curl https://scriptripper.com/health

# Should return:
# {"status":"healthy","database":"connected","redis":"connected"}
```

Visit: **https://scriptripper.com/docs** to see your live API!

---

## Table of Contents
1. [Quick Start: Deploy to scriptripper.com](#quick-start-deploy-to-scriptrippercom-15-minutes)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Stripe Configuration](#stripe-configuration)
5. [Purelymail Setup](#purelymail-setup)
6. [Database Migrations](#database-migrations)
7. [Local Development](#local-development)
8. [Production Deployment](#production-deployment)
9. [Post-Deployment](#post-deployment)

## Prerequisites

- **Backend:**
  - Python 3.11+
  - PostgreSQL 14+
  - Redis 7+

- **Frontend:**
  - Node.js 18+
  - npm or yarn

- **Third-party Services:**
  - Stripe account (for payments)
  - Purelymail account (for emails)
  - Google Cloud account (for Gemini API)

## Environment Setup

### Backend Environment Variables

Create `api/.env` file:

```bash
# Application
APP_NAME=ScriptRipper
APP_VERSION=1.0.0
ENVIRONMENT=development  # or production
LOG_LEVEL=info

# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/scriptripper

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# Google Gemini API
GEMINI_API_KEY=your-gemini-api-key
DEFAULT_LLM_PROVIDER=gemini

# Stripe Payment Processing
STRIPE_SECRET_KEY=sk_test_...  # Use sk_live_... for production
STRIPE_PUBLISHABLE_KEY=pk_test_...  # Use pk_live_... for production
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...  # Created in Stripe Dashboard
STRIPE_SUCCESS_URL=http://localhost:3000/subscription/success  # Change for production
STRIPE_CANCEL_URL=http://localhost:3000/subscription/cancel  # Change for production

# Purelymail Email
PURELYMAIL_API_TOKEN=pm-live-...  # From Purelymail Settings → API
PURELYMAIL_SMTP_HOST=smtp.purelymail.com
PURELYMAIL_SMTP_PORT=587
PURELYMAIL_SMTP_USER=noreply@scriptripper.dev
PURELYMAIL_SMTP_PASS=your-smtp-password-here  # Set password in Purelymail for this user
FROM_EMAIL=noreply@scriptripper.dev
MAGIC_LINK_EXPIRE_MINUTES=15

# CORS
CORS_ORIGINS=http://localhost:3000  # Add production URL for production

# Optional: Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/v1/auth/oauth/google/callback
```

### Frontend Environment Variables

Create `web/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

For production:
```bash
NEXT_PUBLIC_API_URL=https://api.scriptripper.dev
```

## Stripe Configuration

### 1. Create Stripe Account
1. Sign up at [stripe.com](https://stripe.com)
2. Get your API keys from the Dashboard

### 2. Create Pro Subscription Product
1. Go to **Products** → **Add Product**
2. Name: "ScriptRipper Pro"
3. Description: "Unlimited rips, priority processing"
4. Pricing: $5/month (recurring)
5. Copy the **Price ID** (starts with `price_`)
6. Add to `.env` as `STRIPE_PRO_PRICE_ID`

### 3. Configure Webhook
For local development, use Stripe CLI:
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to http://localhost:8000/api/v1/billing/webhook

# Copy the webhook signing secret (starts with whsec_) to your .env
```

For production:
1. Go to **Developers** → **Webhooks** → **Add endpoint**
2. Endpoint URL: `https://api.scriptripper.dev/api/v1/billing/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the **Signing secret** to production `.env`

### 4. Test Payment Flow
1. Use test card: `4242 4242 4242 4242`
2. Any future expiry date
3. Any 3-digit CVC
4. Any ZIP code

## Purelymail Setup

### 1. Create Purelymail Account
1. Sign up at [purelymail.com](https://purelymail.com)
2. Add your domain (e.g., `scriptripper.dev`)
3. Configure DNS records as instructed (MX, SPF, DKIM)
4. Wait for DNS propagation (~24 hours max)

### 2. Get API Token
1. Log in to Purelymail dashboard
2. Go to **Settings** → **API**
3. Click **Refresh API Key**
4. Copy the token (starts with `pm-live-...`)
5. Add to `.env` as `PURELYMAIL_API_TOKEN`

### 3. Create Email User for Sending
1. In Purelymail, go to **Users**
2. Click **Add User**
3. Username: `noreply`
4. Domain: `scriptripper.dev`
5. Set a strong password for SMTP authentication
6. Add to `.env` as `PURELYMAIL_SMTP_USER=noreply@scriptripper.dev` and `PURELYMAIL_SMTP_PASS=your-password`

### 4. Configure SMTP Settings
Add these to your `.env`:
```bash
PURELYMAIL_SMTP_HOST=smtp.purelymail.com
PURELYMAIL_SMTP_PORT=587
PURELYMAIL_SMTP_USER=noreply@scriptripper.dev
PURELYMAIL_SMTP_PASS=your-smtp-password
FROM_EMAIL=noreply@scriptripper.dev
```

### 5. Verify DNS Configuration
1. Check MX records: `dig scriptripper.dev MX`
2. Check SPF record: `dig scriptripper.dev TXT`
3. Ensure DKIM is configured properly
4. Test with [mail-tester.com](https://www.mail-tester.com)

### 6. Test Email Sending
Register a new user or request password reset to test email delivery. Check Purelymail dashboard for sent email logs.

### Cost
- Purelymail: **$10/year** for unlimited emails (much cheaper than SendGrid)

## Database Migrations

### Initial Setup
```bash
cd api

# Create database
createdb scriptripper

# Run migrations
alembic upgrade head

# Seed initial data (prompts)
python -m app.scripts.seed_prompts
```

### Creating New Migrations
```bash
# Auto-generate migration from model changes
alembic revision --autogenerate -m "description of changes"

# Review the generated migration in api/alembic/versions/

# Apply migration
alembic upgrade head
```

## Local Development

### Start Backend
```bash
cd api
make up  # Starts Docker containers (PostgreSQL, Redis)
make dev  # Starts FastAPI server with hot reload
```

Backend will be available at: http://localhost:8000
API docs: http://localhost:8000/docs

### Start Frontend
```bash
cd web
npm install
npm run dev
```

Frontend will be available at: http://localhost:3000

### Test Accounts
The seed script creates these test accounts:
- **Admin:** admin@scriptripper.dev / admin123
- **User:** user@scriptripper.dev / user123

## Production Deployment

### Backend Deployment

#### Option 1: Docker Compose
```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec api alembic upgrade head
```

#### Option 2: Cloud Platforms

**Heroku:**
```bash
heroku create scriptripper-api
heroku addons:create heroku-postgresql:mini
heroku addons:create heroku-redis:mini
git push heroku main
heroku run alembic upgrade head
```

**Render / Railway / Fly.io:**
Follow their respective Python deployment guides.

### Frontend Deployment

#### Vercel (Recommended)
```bash
cd web
vercel --prod
```

Or connect your GitHub repo to Vercel dashboard for automatic deployments.

#### Netlify
```bash
cd web
npm run build
netlify deploy --prod --dir=.next
```

### Environment Variables for Production

**Backend:**
- Set all `.env` variables in your hosting platform's environment settings
- Update URLs to production domains
- Use `ENVIRONMENT=production`
- Use production Stripe keys (`sk_live_...`)

**Frontend:**
- Set `NEXT_PUBLIC_API_URL` to your production API URL
- Enable production optimizations

## Post-Deployment

### 1. Test Payment Flow
1. Navigate to `/upgrade`
2. Click "Upgrade to Pro"
3. Complete checkout with test card (if in test mode)
4. Verify redirect to success page
5. Check subscription status in `/profile`

### 2. Test Email Delivery
1. Register a new account
2. Verify welcome email received
3. Request password reset
4. Verify reset email received
5. Test password reset flow

### 3. Monitor Webhooks
1. Go to Stripe Dashboard → Webhooks
2. Check that events are being delivered successfully
3. Review any failed webhook deliveries

### 4. Set Up Monitoring
- Application logs (errors, exceptions)
- Database performance
- API response times
- Stripe webhook delivery
- Purelymail email delivery (check Activity dashboard)

### 5. Security Checklist
- [ ] All environment variables are secret (not committed to git)
- [ ] JWT secret is strong and unique
- [ ] Database has strong password
- [ ] CORS origins are restricted to your domain
- [ ] HTTPS/SSL is enabled
- [ ] Stripe webhooks use signature verification
- [ ] Rate limiting is configured
- [ ] Error messages don't leak sensitive info

## Troubleshooting

### Emails Not Sending
- Verify `PURELYMAIL_SMTP_USER` and `PURELYMAIL_SMTP_PASS` are correct
- Check DNS records are properly configured (MX, SPF, DKIM)
- Review Purelymail dashboard → Activity for delivery status
- Test SMTP connection: `telnet smtp.purelymail.com 587`
- Check server logs for SMTP authentication errors
- Verify the email user exists in Purelymail dashboard

### Stripe Webhook Failures
- Verify `STRIPE_WEBHOOK_SECRET` matches webhook endpoint
- Check webhook URL is publicly accessible
- Review Stripe Dashboard → Webhooks for error details
- Ensure endpoint returns 200 status code

### Database Connection Errors
- Verify `DATABASE_URL` format is correct
- Ensure PostgreSQL is running
- Check database user has proper permissions
- For connection pooling issues, adjust pool size in settings

### Payment Issues
- Verify you're using correct Stripe API mode (test vs live)
- Check `STRIPE_PRO_PRICE_ID` matches your price in Stripe
- Review Stripe Dashboard for payment attempt details
- Test with Stripe test cards first

## Support

For deployment assistance:
- Email: support@scriptripper.dev
- GitHub Issues: [github.com/yourorg/scriptripper/issues](https://github.com)

## Next Steps

After successful deployment:
1. Set up custom domain
2. Configure SSL certificates
3. Set up monitoring and alerts
4. Create backup strategy
5. Document runbook for common operations
6. Set up CI/CD pipeline
7. Plan scaling strategy
