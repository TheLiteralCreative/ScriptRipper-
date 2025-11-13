# Deploy ScriptRipper+ to Render (5 Minutes)

**100% browser-based. No CLI needed.**

---

## Step 1: Push to GitHub (If Not Already Done)

```bash
# In your terminal (one time)
cd /Users/superiorcommunicator/Agents/ScriptRipper/ScriptRipper+

git add .
git commit -m "Ready for Render deployment"
git push origin main
```

---

## Step 2: Create Render Account

1. Go to: **https://render.com**
2. Click: **"Get Started"**
3. Sign up with **GitHub** (easiest)
4. Authorize Render to access your repos

---

## Step 3: Deploy API Service

### Create Web Service

1. Click: **"New +"** → **"Web Service"**
2. Connect your **ScriptRipper+** repository
3. Render auto-fills these settings:

**Service Settings:**
- **Name**: `scriptripper-api`
- **Region**: Choose closest to you (e.g., Oregon)
- **Branch**: `main`
- **Root Directory**: `api`
- **Runtime**: Docker
- **Dockerfile Path**: `api/Dockerfile`
- **Docker Build Context**: `./api`

**Instance Type:**
- **Free** (to start) or **Starter ($7/month)**

### Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add these one by one:

```bash
# Database (Render will auto-fill this after you add PostgreSQL)
DATABASE_URL=<will be auto-filled>

# Redis (Render will auto-fill this after you add Redis)
REDIS_URL=<will be auto-filled>

# Required API Keys (YOU PROVIDE THESE)
GEMINI_API_KEY=your_gemini_key_here
STRIPE_SECRET_KEY=sk_live_your_stripe_key
STRIPE_PRO_PRICE_ID=price_your_price_id
JWT_SECRET=your_random_32_char_string

# Stripe URLs
STRIPE_SUCCESS_URL=https://scriptripper.com/success
STRIPE_CANCEL_URL=https://scriptripper.com/pricing
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# App Config
ENVIRONMENT=production
LOG_LEVEL=INFO
CORS_ORIGINS=https://scriptripper.com,https://www.scriptripper.com
APP_NAME=ScriptRipper
MAX_TRANSCRIPT_LENGTH=500000

# Optional: Error Tracking
SENTRY_DSN=your_sentry_dsn_optional
```

**Click**: **"Create Web Service"**

Render starts building... (takes 3-5 minutes)

---

## Step 4: Add PostgreSQL Database

1. From dashboard, click: **"New +"** → **"PostgreSQL"**
2. **Name**: `scriptripper-db`
3. **Database**: `scriptripper_production`
4. **User**: `scriptripper`
5. **Region**: Same as your API service
6. **Plan**: **Free** (to start)
7. Click: **"Create Database"**

### Connect Database to API

1. Go to your **scriptripper-db** database
2. Copy the **Internal Database URL** (starts with `postgresql://`)
3. Go back to **scriptripper-api** service
4. Click **"Environment"** tab
5. Find `DATABASE_URL` variable
6. Paste the Internal Database URL
7. Click **"Save Changes"**

**Render auto-redeploys your API with database connected!**

---

## Step 5: Add Redis

1. From dashboard, click: **"New +"** → **"Redis"**
2. **Name**: `scriptripper-redis`
3. **Region**: Same as API
4. **Plan**: **Free** (25MB)
5. Click: **"Create Redis"**

### Connect Redis to API

1. Go to your **scriptripper-redis** instance
2. Copy the **Internal Redis URL** (starts with `redis://`)
3. Go back to **scriptripper-api** service
4. Click **"Environment"** tab
5. Find `REDIS_URL` variable
6. Paste the Internal Redis URL
7. Click **"Save Changes"**

**Render redeploys again!**

---

## Step 6: Deploy Worker Service

1. Click: **"New +"** → **"Background Worker"**
2. Connect your **ScriptRipper+** repository
3. **Name**: `scriptripper-worker`
4. **Region**: Same as API
5. **Root Directory**: `worker`
6. **Runtime**: Docker
7. **Dockerfile Path**: `worker/Dockerfile`

### Add Same Environment Variables

Copy ALL the same environment variables from your API service:
- `DATABASE_URL` (same as API)
- `REDIS_URL` (same as API)
- `GEMINI_API_KEY`
- `STRIPE_SECRET_KEY`
- etc.

**Click**: **"Create Background Worker"**

---

## Step 7: Run Database Migrations

### Option A: Use Render Shell (Easy)

1. Go to your **scriptripper-api** service
2. Click **"Shell"** tab (top right)
3. Run these commands:

```bash
cd /app
alembic upgrade head
python3 scripts/seed_prompts.py
```

### Option B: Use One-Off Job

1. In **scriptripper-api** service
2. Click **"Manual Deploy"** → **"Run a one-off job"**
3. Command: `alembic upgrade head && python3 scripts/seed_prompts.py`

---

## Step 8: Configure Custom Domain (scriptripper.com)

### In Render:

1. Go to **scriptripper-api** service
2. Click **"Settings"** tab
3. Scroll to **"Custom Domain"**
4. Click **"Add Custom Domain"**
5. Enter: `scriptripper.com`
6. Render shows you DNS records to add

### In GoDaddy:

1. Log into **GoDaddy**
2. Go to: **My Products** → **Domains** → **scriptripper.com** → **DNS**
3. Click **"Add"**

**Add CNAME record:**
```
Type: CNAME
Name: @
Value: scriptripper-api.onrender.com
TTL: 600
```

**Also add www:**
```
Type: CNAME
Name: www
Value: scriptripper.com
TTL: 600
```

4. **Delete** any existing `@` A records
5. Click **"Save"**

**Wait 10-30 minutes for DNS propagation**

Render automatically provisions SSL certificate when DNS is live!

---

## Step 9: Configure Stripe Webhook

1. **Stripe Dashboard**: https://dashboard.stripe.com/webhooks
2. Click: **"Add endpoint"**
3. **Endpoint URL**: `https://scriptripper.com/api/v1/billing/webhook`
4. **Select events**:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
5. Click: **"Add endpoint"**
6. **Copy webhook secret** (starts with `whsec_`)
7. Back in Render → **scriptripper-api** → **Environment**
8. Update `STRIPE_WEBHOOK_SECRET` with the secret
9. **Save Changes**

---

## Step 10: Verify Deployment

### Check Health

```bash
curl https://scriptripper.com/health
```

**Should return:**
```json
{
  "api": "ok",
  "database": "ok",
  "redis": "ok"
}
```

### Visit API Docs

**https://scriptripper.com/docs**

You should see your interactive Swagger UI!

---

## ✅ Deployment Complete!

**Your ScriptRipper+ is now live at:**
- API: https://scriptripper.com
- Docs: https://scriptripper.com/docs
- Health: https://scriptripper.com/health

---

## 🎯 Quick Reference: Render Services

| Service | Type | Purpose | URL |
|---------|------|---------|-----|
| scriptripper-api | Web Service | FastAPI backend | scriptripper.com |
| scriptripper-worker | Background Worker | Async jobs | (internal) |
| scriptripper-db | PostgreSQL | Database | (internal) |
| scriptripper-redis | Redis | Cache/Queue | (internal) |

---

## 💰 Pricing

**Free Tier (Great for testing):**
- Web Service: Free (750 hrs/month)
- PostgreSQL: Free (90 days, then $7/month)
- Redis: Free (25MB)
- Worker: Free (750 hrs/month)

**Paid (Recommended for production):**
- Web Service: $7/month (Starter)
- PostgreSQL: $7/month (256MB)
- Redis: Free is fine (25MB)
- Worker: $7/month
- **Total**: ~$21/month

**Upgrade later** when you need it. Free tier works fine to start!

---

## 🔧 Common Tasks in Render

### View Logs
1. Go to service
2. Click **"Logs"** tab
3. Real-time logs appear

### Restart Service
1. Go to service
2. Click **"Manual Deploy"** → **"Clear build cache & deploy"**

### Update Environment Variables
1. Go to service
2. Click **"Environment"** tab
3. Edit variables
4. Click **"Save Changes"**
5. Render auto-redeploys

### Access Database
1. Go to **scriptripper-db**
2. Click **"Connect"** → **"External Connection"**
3. Use provided connection string with `psql`

### Run Shell Commands
1. Go to **scriptripper-api**
2. Click **"Shell"** tab
3. Run commands interactively

---

## 🐛 Troubleshooting

### Build Failed
- Check **Logs** tab for errors
- Most common: Missing environment variable
- Fix: Add variable, redeploy

### Database Connection Error
- Verify `DATABASE_URL` is set correctly
- Should be Internal Database URL (not External)
- Format: `postgresql://user:password@host/database`

### Redis Connection Error
- Verify `REDIS_URL` is set correctly
- Should be Internal Redis URL
- Format: `redis://host:port`

### Health Check Failing
- Check Logs for specific errors
- Verify all environment variables are set
- Ensure database migrations ran

### DNS Not Working
- Check DNS propagation: https://dnschecker.org
- Can take 10-30 minutes
- Verify CNAME points to correct Render URL

---

## 📝 Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Render account created
- [ ] API service deployed
- [ ] PostgreSQL database created and connected
- [ ] Redis instance created and connected
- [ ] Worker service deployed
- [ ] Database migrations run
- [ ] Prompts seeded
- [ ] Custom domain configured in Render
- [ ] DNS records added in GoDaddy
- [ ] SSL certificate issued (automatic)
- [ ] Stripe webhook configured
- [ ] Health check returns 200 OK
- [ ] API docs accessible

---

## 🚀 Next Steps After Deployment

1. **Test Everything**
   - Register a user
   - Submit analysis
   - Test Stripe checkout (use test mode first)

2. **Monitor**
   - Check Render logs regularly
   - Set up Sentry for errors (optional)
   - Use Render's built-in metrics

3. **Scale When Ready**
   - Upgrade to Starter plans ($7/month each)
   - Add more instances if needed
   - Optimize database queries

---

## 💡 Why Render is Great

- ✅ **Zero config** - Auto-detects everything
- ✅ **Free tier** - Test before paying
- ✅ **Auto SSL** - HTTPS just works
- ✅ **Auto deploys** - Push to GitHub → auto-deploy
- ✅ **No CLI needed** - 100% browser-based
- ✅ **Great docs** - Easy to find answers
- ✅ **Fast builds** - Usually 2-3 minutes

---

## 🆘 Need Help?

**Render Docs**: https://render.com/docs
**Render Community**: https://community.render.com
**Status**: https://status.render.com

---

**That's it! Way simpler than Railway, right?** 😅

Now go deploy! Should take 15-20 minutes total (mostly waiting for builds).
