# Final Deployment Steps - ScriptRipper+

## ✅ Completed
- [x] API deployed to Render: https://scriptripper-api.onrender.com
- [x] PostgreSQL database provisioned and running
- [x] Redis cache provisioned and running
- [x] Web frontend deployed to Vercel: https://script-ripper.vercel.app

## 🔧 Next Steps

### Step 1: Update API CORS Settings on Render

The API needs to accept requests from your Vercel frontend.

1. Go to: https://render.com/dashboard
2. Select **scriptripper-api** service
3. Go to **Environment** tab
4. Find `CORS_ORIGINS` variable
5. Update the value to:
   ```
   https://script-ripper.vercel.app,https://www.scriptripper.com,https://scriptripper.com
   ```
6. Click **Save Changes**
7. The service will automatically redeploy (takes ~2 minutes)

### Step 2: Add Custom Domain to Vercel

1. Go to: https://vercel.com/literal-creative-projects/scriptripper-web/settings/domains
2. Click **Add Domain**
3. Add: `www.scriptripper.com` → Click Add
4. Add: `scriptripper.com` → Click Add

Vercel will show you DNS records needed:

**For www.scriptripper.com:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**For scriptripper.com (apex):**
```
Type: A
Name: @
Value: 76.76.21.21
```

### Step 3: Update DNS at GoDaddy

1. Go to: https://dcc.godaddy.com/control/scriptripper.com/dns
2. Find the existing records for `www` and `@`
3. **Delete or update** the old records pointing to Render
4. Add the new Vercel records from Step 2

**Important:**
- Remove any old CNAME for `www` pointing to Render
- The `@` (apex) should point to Vercel's A record

### Step 4: Add Custom Domain for API (Optional but Recommended)

On Render, add a custom domain for the API:

1. Go to Render Dashboard → **scriptripper-api**
2. Go to **Settings** tab
3. Scroll to **Custom Domains**
4. Add: `api.scriptripper.com`

Render will give you a CNAME record:
```
Type: CNAME
Name: api
Value: scriptripper-api.onrender.com
```

Add this to GoDaddy DNS.

Then update `NEXT_PUBLIC_API_URL` in Vercel:
1. Vercel Dashboard → scriptripper-web → **Settings** → **Environment Variables**
2. Update `NEXT_PUBLIC_API_URL` from `https://scriptripper-api.onrender.com` to `https://api.scriptripper.com`
3. Redeploy the web app

### Step 5: Verify Everything Works

After DNS propagates (can take 5 minutes to 48 hours, usually ~15 minutes):

1. **Test www.scriptripper.com** - Should show the web frontend
2. **Test login/registration** - Should work with API
3. **Test transcript upload** - Should process (if worker is running)

### Step 6: Monitor Initial Traffic

- **Vercel Logs**: https://vercel.com/literal-creative-projects/scriptripper-web/logs
- **Render API Logs**: https://dashboard.render.com/web/srv-[your-service-id]/logs
- **Render DB**: Check connections and queries

## 🎯 Final Architecture

```
User Browser
    ↓
www.scriptripper.com (Vercel - Next.js)
    ↓
api.scriptripper.com (Render - FastAPI)
    ↓
PostgreSQL (Render) + Redis (Render)
```

## ⚠️ Known Limitations (MVP)

- **No Worker Service**: Jobs run synchronously in API (upgrade to Render Starter plan for background workers)
- **Free Tier Limits**:
  - Vercel: 100GB bandwidth/month
  - Render: Services sleep after 15 min inactivity (first request takes 30-60s to wake)
  - Render DB: 256MB RAM, 1GB storage

## 🔐 Security Next Steps (Post-Launch)

1. Rotate all API keys exposed in local .env files:
   - Gemini API key
   - OpenAI API key
   - Anthropic API key
   - Stripe live secret key
   - Purelymail API token
   - Google OAuth client secret

2. Set up monitoring:
   - Add Sentry DSN to both Vercel and Render
   - Set up uptime monitoring (UptimeRobot, etc.)

## 📊 Success Criteria

- [ ] www.scriptripper.com loads the web frontend
- [ ] Login/registration works
- [ ] API health check: https://api.scriptripper.com/health returns 200
- [ ] Can upload and process a transcript
- [ ] No CORS errors in browser console

---

**Estimated Time to Complete**: 15-20 minutes + DNS propagation
