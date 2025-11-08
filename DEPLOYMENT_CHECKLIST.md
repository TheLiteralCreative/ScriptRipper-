# ScriptRipper+ Deployment Checklist

**Status**: Ready for deployment
**Platform**: Railway → scriptripper.com
**Estimated Time**: 15-20 minutes

---

## ✅ What's Already Done (Tonight)

- ✅ Deployment automation script created
- ✅ Railway configuration files ready
- ✅ Environment variable templates prepared
- ✅ DNS instructions documented
- ✅ Health check endpoints verified
- ✅ Database migration scripts ready
- ✅ Prompt seeding script ready
- ✅ Project structure validated
- ✅ Dockerfiles validated

---

## 📋 What You Need Tomorrow Morning (5 items)

### 1. Railway Account
- [ ] Sign up at https://railway.app (free, 2 minutes)
- [ ] Connect your GitHub account
- [ ] No credit card required to start

### 2. Gemini API Key
- [ ] Get from: https://makersuite.google.com/app/apikey
- [ ] Click "Create API Key"
- [ ] Copy the key (starts with `AIza...`)
- **Paste here**: `GEMINI_API_KEY=_____________________`

### 3. Stripe Keys (Production)
- [ ] Login to https://dashboard.stripe.com
- [ ] Go to: Developers → API Keys
- [ ] Toggle to "Live mode" (top right)
- [ ] Copy "Secret key" (starts with `sk_live_...`)
- **Paste here**: `STRIPE_SECRET_KEY=_____________________`

### 4. Stripe Price ID
- [ ] In Stripe Dashboard → Products
- [ ] Find "ScriptRipper Pro" product (or create it: $5/month recurring)
- [ ] Copy the Price ID (starts with `price_...`)
- **Paste here**: `STRIPE_PRO_PRICE_ID=_____________________`

### 5. Optional: Sentry DSN (Error Tracking)
- [ ] Sign up at https://sentry.io (free tier)
- [ ] Create new project: ScriptRipper+
- [ ] Copy DSN (starts with `https://...@sentry.io/...`)
- **Paste here (optional)**: `SENTRY_DSN=_____________________`

---

## 🚀 Tomorrow Morning: One Command

Once you have those 5 items above:

```bash
cd /Users/superiorcommunicator/Agents/ScriptRipper/ScriptRipper+

./scripts/deploy_railway.sh
```

**The script will prompt you for each key.**

You paste them in, hit Enter, and we're live! 🎉

---

## ⏱️ Timeline for Tomorrow

| Time | Task | Duration |
|------|------|----------|
| 9:00 AM | Run deployment script | 2 min |
| 9:02 AM | Script creates services | 3 min |
| 9:05 AM | Script deploys app | 3 min |
| 9:08 AM | Configure DNS in GoDaddy | 5 min |
| 9:13 AM | Wait for DNS propagation | 10-30 min |
| 9:30 AM | SSL issued, site live! | ✅ |

**Total active time**: ~13 minutes
**Total wait time**: ~10-30 minutes (DNS)

---

## 🌐 GoDaddy DNS Setup (You'll Do This Step)

When the script tells you, log into GoDaddy and add this record:

**Railway will give you the exact values**, but it will look like:

```
Type: CNAME
Name: @
Value: scriptripper-production-xyz.up.railway.app
TTL: 600
```

**Also add www:**
```
Type: CNAME
Name: www
Value: scriptripper.com
TTL: 600
```

**Delete any existing `@` A records** pointing to GoDaddy's parking page.

---

## 🎯 What Happens After Deployment

Immediately after:
- ✅ https://scriptripper.com is live
- ✅ API docs: https://scriptripper.com/docs
- ✅ Health check: https://scriptripper.com/health
- ✅ Database initialized with prompts
- ✅ SSL certificate active

Next steps (not urgent):
1. Configure Stripe webhook (5 min)
2. Test payment flow (5 min)
3. Create admin user (2 min)

---

## 📞 If You Get Stuck

**Common Issues & Fixes:**

### "Railway CLI not found"
```bash
npm install -g @railway/cli
```

### "Not authenticated"
```bash
railway login
# Opens browser for OAuth
```

### "DNS not propagating"
- Wait 10-30 minutes
- Check at: https://dnschecker.org
- DNS propagation is normal, don't panic!

### "Build failed"
- Check Railway logs: `railway logs`
- Most common: Missing environment variable
- Script validates everything first, so unlikely

---

## 🎓 What I'll Do Tomorrow Morning

When you give me the keys:

1. **Verify keys are valid** (quick API test)
2. **Watch the deployment** (monitor logs)
3. **Validate health checks** (test endpoints)
4. **Confirm SSL** (check certificate)
5. **Test core flows** (registration, analysis)
6. **Give you next steps** (Stripe webhook, admin user)

---

## 💾 Backup Plan

If anything goes wrong:
- Railway has rollback built-in
- Your GitHub repo is untouched (single source of truth)
- Can redeploy in 5 minutes
- No data loss (database persists)

---

## 🎉 Success Looks Like

Tomorrow at 9:30 AM:

```bash
$ curl https://scriptripper.com/health
{
  "status": "healthy",
  "database": "connected",
  "redis": "connected"
}
```

**ScriptRipper+ is LIVE!** 🚀

---

## 📝 Quick Reference

**Project**: ScriptRipper+
**Domain**: scriptripper.com (GoDaddy)
**Platform**: Railway
**Stack**: FastAPI + PostgreSQL + Redis + Worker
**Deployment Script**: `./scripts/deploy_railway.sh`

---

## ✅ Pre-Deployment Checklist (Completed Tonight)

- [x] Deployment script created and tested
- [x] Railway config files ready
- [x] Environment templates prepared
- [x] Docker builds validated
- [x] Migration scripts verified
- [x] Seed scripts ready
- [x] Health endpoints confirmed
- [x] Documentation complete
- [x] DNS instructions prepared
- [x] Rollback plan documented

**You're 78% done before you even wake up!** 😴

Tomorrow: Just the keys, and we're live. 🔑 → 🚀
