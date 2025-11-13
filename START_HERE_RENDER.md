# 🚀 Deploy ScriptRipper+ to Render (Quick Start)

**Browser-only. No CLI. You know Render. Let's do this.**

---

## ⏱️ Time: 15-20 Minutes

- 5 min: Create services in Render
- 5 min: Configure environment variables
- 5 min: Run migrations & configure domain
- 5 min: DNS propagation wait

---

## 📋 What You Need (Gather These First)

### API Keys (Required)
1. **Gemini API Key**: https://makersuite.google.com/app/apikey
2. **Stripe Secret Key**: https://dashboard.stripe.com/apikeys (Live mode)
3. **Stripe Price ID**: https://dashboard.stripe.com/products (create "ScriptRipper Pro" - $5/month)

### Optional
4. **Sentry DSN**: https://sentry.io (error tracking)

---

## 🎯 Quick Deploy Steps

### 1. Push to GitHub (If Not Done)

```bash
cd /Users/superiorcommunicator/Agents/ScriptRipper/ScriptRipper+
git add .
git commit -m "Ready for Render"
git push origin main
```

### 2. Go to Render Dashboard

**https://dashboard.render.com**

(Sign in with GitHub if not already)

### 3. Create Services (Click Through UI)

Create these **4 services** in this order:

#### A. PostgreSQL Database
- New + → PostgreSQL
- Name: `scriptripper-db`
- Plan: Free (to start)
- **Copy Internal Database URL** (you'll need this)

#### B. Redis
- New + → Redis
- Name: `scriptripper-redis`
- Plan: Free
- **Copy Internal Redis URL** (you'll need this)

#### C. API Web Service
- New + → Web Service
- Connect: ScriptRipper+ repo
- Name: `scriptripper-api`
- Root Directory: `api`
- Runtime: Docker
- **Add Environment Variables** (see below)

#### D. Worker Background Service
- New + → Background Worker
- Connect: ScriptRipper+ repo
- Name: `scriptripper-worker`
- Root Directory: `worker`
- Runtime: Docker
- **Add same environment variables as API**

---

## 🔑 Environment Variables (Copy-Paste)

**Add these to BOTH API and Worker services:**

```bash
# Database & Redis (from services you created)
DATABASE_URL=<paste Internal Database URL from PostgreSQL>
REDIS_URL=<paste Internal Redis URL from Redis>

# Your API Keys
GEMINI_API_KEY=<paste your Gemini key>
STRIPE_SECRET_KEY=<paste sk_live_...>
STRIPE_PRO_PRICE_ID=<paste price_...>
JWT_SECRET=<paste any random 32+ character string>

# Stripe URLs (change scriptripper.com to your domain if different)
STRIPE_SUCCESS_URL=https://scriptripper.com/success
STRIPE_CANCEL_URL=https://scriptripper.com/pricing
STRIPE_WEBHOOK_SECRET=<leave empty for now, add after webhook setup>

# App Config
ENVIRONMENT=production
LOG_LEVEL=INFO
CORS_ORIGINS=https://scriptripper.com,https://www.scriptripper.com
APP_NAME=ScriptRipper
MAX_TRANSCRIPT_LENGTH=500000

# Optional: Sentry
SENTRY_DSN=<paste if you have one, otherwise delete this line>
```

**Generate JWT Secret**: Just mash your keyboard for 32+ random characters, or use: https://generate-secret.vercel.app/32

---

## 4. Run Migrations (After API Deploys)

**Wait for API to finish deploying** (check Logs tab - takes 3-5 min)

Then:

1. Go to **scriptripper-api** service
2. Click **"Shell"** tab (top right)
3. Run:

```bash
alembic upgrade head
python3 scripts/seed_prompts.py
```

---

## 5. Configure Domain (scriptripper.com)

### In Render:
1. Go to **scriptripper-api**
2. Settings → Custom Domain
3. Add: `scriptripper.com`
4. Render shows DNS records

### In GoDaddy:
1. GoDaddy → scriptripper.com → DNS
2. Add CNAME:
   - Type: CNAME
   - Name: @
   - Value: `scriptripper-api.onrender.com`
   - TTL: 600
3. Add CNAME for www:
   - Type: CNAME
   - Name: www
   - Value: `scriptripper.com`
   - TTL: 600
4. Delete any existing @ A records
5. Save

**Wait 10-30 min for DNS propagation**

---

## 6. Configure Stripe Webhook

1. Stripe Dashboard → Webhooks
2. Add endpoint: `https://scriptripper.com/api/v1/billing/webhook`
3. Select events: `checkout.session.*`, `customer.subscription.*`
4. Copy webhook secret (`whsec_...`)
5. Render → scriptripper-api → Environment
6. Add/update: `STRIPE_WEBHOOK_SECRET=whsec_...`
7. Save (auto-redeploys)

---

## ✅ Verify It Works

```bash
curl https://scriptripper.com/health
```

Should return:
```json
{"api":"ok","database":"ok","redis":"ok"}
```

**Visit**: https://scriptripper.com/docs

You should see your API documentation!

---

## 🎉 You're Live!

**URLs:**
- API: https://scriptripper.com
- Docs: https://scriptripper.com/docs
- Health: https://scriptripper.com/health

---

## 💰 Cost

**Free tier (good for testing):**
- Everything free for ~90 days
- After: ~$21/month ($7 each for API, Worker, DB)

**Upgrade when ready** via Render dashboard.

---

## 📖 Full Guide

Need more details? See: **`DEPLOY_TO_RENDER.md`**

---

## 🐛 Something Broke?

**Check Logs:**
- Render Dashboard → Your Service → Logs tab

**Common fixes:**
- Missing env variable → Add it in Environment tab
- Database not connected → Check DATABASE_URL is Internal URL
- Build failed → Check Logs for specific error

---

**That's it! Way simpler than Railway.** 😅

Questions? Check the full guide: `DEPLOY_TO_RENDER.md`
