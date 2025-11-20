# Vercel Optimization Guide

**Last Updated:** 2025-11-19
**Status:** Quick wins implemented ✅

---

## 🚀 Quick Wins Implemented

### 1. Bundle Analyzer ✅

**What was added:**
- Installed `@next/bundle-analyzer` package
- Configured in `next.config.mjs`
- Added `build:analyze` script to package.json

**How to use:**
```bash
cd web
npm run build:analyze
```

This will build your app and open an interactive visualization showing:
- Which packages are taking up the most space
- Duplicate dependencies
- Opportunities for code splitting

**When to use:**
- Before major releases
- When investigating slow builds
- When bundle size is growing unexpectedly

---

### 2. Next.js Configuration Optimizations ✅

**Created:** `web/next.config.mjs`

**Optimizations enabled:**

#### Performance
- ✅ **SWC Minification** - Faster builds
- ✅ **Package Import Optimization** - Smaller bundles for:
  - lucide-react
  - All @radix-ui components
  - framer-motion
  - date-fns
  - react-syntax-highlighter

#### Security Headers
- ✅ X-DNS-Prefetch-Control
- ✅ X-Frame-Options (SAMEORIGIN)
- ✅ X-Content-Type-Options (nosniff)
- ✅ Referrer-Policy (origin-when-cross-origin)

#### Production Optimizations
- ✅ Remove console logs (keeps error/warn)
- ✅ Disable source maps in production
- ✅ Standalone output mode

#### Image Optimization
- ✅ AVIF and WebP support
- ✅ Remote patterns for API images

**Expected Impact:**
- 15-20% smaller bundles
- 10-15% faster builds
- Better security posture
- Improved Core Web Vitals

---

### 3. Vercel Analytics & Speed Insights ✅

**What was added:**
- Installed `@vercel/analytics` and `@vercel/speed-insights`
- Integrated in `src/app/layout.tsx`

**What you get:**

#### Analytics
- Real User Monitoring (RUM)
- Page view tracking
- Custom event tracking (ready to use)
- Audience insights

#### Speed Insights
- Core Web Vitals tracking:
  - Largest Contentful Paint (LCP)
  - First Input Delay (FID)
  - Cumulative Layout Shift (CLS)
- Performance scores per route
- Real-world performance data

**How to view:**
1. Go to [Vercel Dashboard](https://vercel.com/literal-creative-projects/scriptripper-web)
2. Click "Analytics" tab
3. View metrics after next deployment

**Custom event tracking (optional):**
```typescript
import { track } from '@vercel/analytics';

// Track custom events
track('prompt_selected', { prompt_name: 'Action Items Tracker' });
track('transcript_uploaded', { size_mb: 2.5 });
```

---

## 📋 Environment Variables Migration (ACTION REQUIRED)

### Current State
Environment variables are defined in `web/vercel.json`:
```json
{
  "env": {
    "NEXT_PUBLIC_API_URL": "https://scriptripper-api.onrender.com",
    "NEXT_PUBLIC_APP_NAME": "ScriptRipper",
    "NEXT_PUBLIC_APP_VERSION": "0.1.0",
    "NEXT_PUBLIC_ENABLE_CUSTOM_PROMPTS": "true",
    "NEXT_PUBLIC_ENABLE_BATCH_UPLOAD": "true",
    "NEXT_PUBLIC_MAX_FILE_SIZE_MB": "50"
  }
}
```

### Why Move to Dashboard?
✅ **Security** - Sensitive values not in code
✅ **Flexibility** - Update without redeployment
✅ **Environment-specific** - Different values for prod/preview/dev
✅ **Team access** - Managed centrally

### Migration Steps

#### 1. Add to Vercel Dashboard
Go to: https://vercel.com/literal-creative-projects/scriptripper-web/settings/environment-variables

Add each variable:

| Key | Value | Environments |
|-----|-------|--------------|
| `NEXT_PUBLIC_API_URL` | `https://scriptripper-api.onrender.com` | Production, Preview, Development |
| `NEXT_PUBLIC_APP_NAME` | `ScriptRipper` | Production, Preview, Development |
| `NEXT_PUBLIC_APP_VERSION` | `0.1.0` | Production, Preview, Development |
| `NEXT_PUBLIC_ENABLE_CUSTOM_PROMPTS` | `true` | Production, Preview, Development |
| `NEXT_PUBLIC_ENABLE_BATCH_UPLOAD` | `true` | Production, Preview, Development |
| `NEXT_PUBLIC_MAX_FILE_SIZE_MB` | `50` | Production, Preview, Development |

**For Preview/Development environments, you might want different values:**
- Preview API URL: Use staging API if available
- Development: Use `http://localhost:8000`

#### 2. Update vercel.json
After adding to dashboard, you can remove the `env` section from `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

#### 3. Redeploy
```bash
vercel --prod
```

Environment variables from the dashboard will be automatically injected during build.

#### 4. Verify
Check deployment logs to confirm variables are loaded:
```
✓ Environment variables loaded from dashboard
```

---

## 🧪 Testing the Optimizations

### 1. Local Build Test
```bash
cd web
npm run build
```

**Expected output:**
- Build completes successfully
- Bundle size shown in terminal
- No TypeScript errors
- All routes built correctly

### 2. Bundle Analysis
```bash
npm run build:analyze
```

**What to look for:**
- Largest packages identified
- Duplicate dependencies (should be minimal)
- Route-specific bundle sizes

### 3. Local Development
```bash
npm run dev
```

**Verify:**
- ✅ App loads without errors
- ✅ Analytics script loaded (check browser console)
- ✅ Speed Insights initialized
- ✅ All features work as expected

---

## 📊 Expected Performance Improvements

### Before Optimizations
- Build time: 42-48s
- Lambda size: 1.75MB
- No analytics
- No bundle visibility

### After Optimizations (Estimated)
- Build time: **35-40s** (-15%)
- Lambda size: **1.2-1.4MB** (-20%)
- **Real-time analytics** enabled
- **Bundle analysis** on demand

### Monitoring Post-Deployment

**Check these metrics:**
1. **Build Duration** - Vercel Dashboard → Deployments
2. **Bundle Size** - Build logs
3. **Core Web Vitals** - Analytics → Speed tab
4. **Error Rates** - Analytics → Overview

**Target Metrics:**
- LCP: <2.5s (Good)
- FID: <100ms (Good)
- CLS: <0.1 (Good)

---

## 🔄 Next Steps (Optional)

### Further Optimizations

#### 1. Framer Motion Lazy Loading
Current: Full library loaded everywhere
Optimization: Use `LazyMotion`

**Savings:** ~30-40KB

```typescript
// Before
import { motion } from 'framer-motion';

// After
import { LazyMotion, domAnimation, m } from 'framer-motion';

<LazyMotion features={domAnimation}>
  <m.div>Animated content</m.div>
</LazyMotion>
```

#### 2. Edge Runtime for Static Pages
For pages that don't need full Node.js runtime:

```typescript
// src/app/some-page/page.tsx
export const runtime = 'edge';
```

**Benefits:**
- Faster cold starts
- Better global distribution
- Lower costs

#### 3. Multi-Region Deployment
Current: Single region (iad1)
Add: Additional regions for global users

Update `vercel.json`:
```json
{
  "regions": ["iad1", "sfo1", "lhr1"]
}
```

**Regions:**
- `iad1` - US East (current)
- `sfo1` - US West
- `lhr1` - Europe (London)

---

## 🐛 Troubleshooting

### Build Failures After Changes

**Check:**
1. TypeScript errors: `npm run type-check`
2. Lint errors: `npm run lint`
3. Missing dependencies: `npm install`

**Common issues:**
- Import errors from new packages
- Config syntax errors
- Missing environment variables

### Analytics Not Showing

**Verify:**
1. Components added to layout.tsx ✅
2. Packages installed ✅
3. Deployment successful
4. Check after 24 hours (data needs time to populate)

### Bundle Analyzer Not Opening

**Try:**
```bash
# Clear cache first
rm -rf .next
npm run build:analyze
```

**If still failing:**
- Check console for errors
- Verify @next/bundle-analyzer installed
- Try with ANALYZE=true npm run build directly

---

## 📝 Maintenance

### Regular Tasks

**Weekly:**
- Review Analytics dashboard
- Check Core Web Vitals trends
- Monitor build times

**Monthly:**
- Run bundle analysis
- Review and update dependencies
- Check for security vulnerabilities

**Quarterly:**
- Review and optimize largest routes
- Evaluate new Vercel features
- Update Next.js version

---

## 📚 Resources

- [Next.js Optimization Docs](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Vercel Analytics Docs](https://vercel.com/docs/analytics)
- [Bundle Analyzer Guide](https://www.npmjs.com/package/@next/bundle-analyzer)
- [Core Web Vitals](https://web.dev/vitals/)

---

## ✅ Checklist

**Quick Wins Completed:**
- [x] Bundle analyzer installed
- [x] next.config.mjs created with optimizations
- [x] Vercel Analytics integrated
- [x] Speed Insights integrated
- [x] Build script added for analysis
- [x] Documentation created

**Action Required:**
- [ ] Move environment variables to Vercel Dashboard
- [ ] Test build locally
- [ ] Deploy to production
- [ ] Verify Analytics after 24 hours
- [ ] Run bundle analysis

**Optional Next Steps:**
- [ ] Implement Framer Motion lazy loading
- [ ] Add edge runtime to static pages
- [ ] Configure multi-region deployment
- [ ] Set up automated performance monitoring
