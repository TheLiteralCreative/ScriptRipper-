# Vercel Deployment Guide - ScriptRipper+ Web Frontend

## Quick Deploy (5 minutes)

### Step 1: Navigate to web directory
```bash
cd /Users/superiorcommunicator/Agents/ScriptRipper/ScriptRipper+/web
```

### Step 2: Login to Vercel (if not already)
```bash
vercel login
```
Follow the prompts to authenticate.

### Step 3: Deploy to Production
```bash
vercel --prod
```

When prompted:
- **Set up and deploy?** → `Y` (Yes)
- **Which scope?** → Choose your account
- **Link to existing project?** → `N` (No, this is first deploy)
- **What's your project's name?** → `scriptripper` (or `scriptripper-web`)
- **In which directory is your code located?** → `./` (current directory)
- **Override settings?** → `N` (No, use detected Next.js settings)

Vercel will:
1. Build your Next.js app
2. Deploy to production
3. Give you a URL like: `https://scriptripper.vercel.app`

### Step 4: Configure Custom Domain

After deployment:

1. Go to Vercel Dashboard: https://vercel.com/dashboard
2. Select your `scriptripper` project
3. Go to **Settings** → **Domains**
4. Add domains:
   - `www.scriptripper.com`
   - `scriptripper.com`

5. Vercel will provide DNS records to add in GoDaddy:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com

   Type: A
   Name: @
   Value: 76.76.21.21
   ```

### Step 5: Update API CORS

Update Render API environment variable:
```
CORS_ORIGINS=https://scriptripper.com,https://www.scriptripper.com,https://scriptripper.vercel.app
```

### Step 6: Optional - Configure Environment Variables in Vercel

If you need to add Google OAuth or other secrets:

1. Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Add:
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID` → Your Google Client ID

## Verification

After deployment, test:

1. **Homepage**: https://www.scriptripper.com
2. **API connectivity**: Login → Upload transcript
3. **Authentication**: Magic link or Google OAuth
4. **Job processing**: Create a job and monitor status

## Rollback

If something goes wrong:

1. Vercel Dashboard → Your Project → **Deployments**
2. Find the last working deployment
3. Click ⋯ → **Promote to Production**

## Monitoring

- **Logs**: Vercel Dashboard → Your Project → **Logs**
- **Analytics**: Vercel Dashboard → Your Project → **Analytics**
- **Performance**: Vercel Dashboard → Your Project → **Speed Insights**

## Cost

- Vercel Hobby (Free) tier includes:
  - 100GB bandwidth/month
  - Unlimited deployments
  - Automatic HTTPS
  - Perfect for MVP/beta

## Environment Variables Reference

Already configured in `vercel.json`:
- `NEXT_PUBLIC_API_URL` → https://scriptripper-api.onrender.com
- `NEXT_PUBLIC_APP_NAME` → ScriptRipper
- `NEXT_PUBLIC_APP_VERSION` → 0.1.0
- Feature flags and limits

## Troubleshooting

### Build fails
```bash
# Test build locally first
cd web
npm run build
```

### API not connecting
- Check CORS_ORIGINS in Render API includes your Vercel domain
- Verify NEXT_PUBLIC_API_URL in Vercel env vars

### Domain not working
- DNS propagation can take 1-48 hours
- Use Vercel's default URL (scriptripper.vercel.app) while waiting

## Next Steps After Deploy

1. ✅ Web frontend live on Vercel
2. ✅ API live on Render
3. Update DNS (see above)
4. Test end-to-end flow
5. (Optional) Add worker service to Render for background jobs

---

**Estimated total time**: 10-15 minutes (plus DNS propagation)
