# Redis Setup for Render (Required Manual Step)

**Why manual?** Render's Blueprint YAML doesn't support Redis - it must be created via the dashboard.

## Quick Setup (3 minutes)

### Step 1: Create Redis Instance

1. Go to: https://dashboard.render.com
2. Click: **"New +"** (top right)
3. Select: **"Redis"**
4. Fill in:
   - **Name**: `scriptripper-redis`
   - **Region**: `Oregon` (must match your API)
   - **Plan**: `Free` (25MB)
5. Click: **"Create Redis"**
6. Wait ~30 seconds for it to provision

### Step 2: Get Redis URL

1. Click on the newly created **scriptripper-redis** service
2. Look for: **"Internal Redis URL"** or **"Connection String"**
3. Copy the URL - it looks like:
   ```
   redis://red-xxxxx.oregon-postgres.render.com:6379
   ```

### Step 3: Update API Environment Variable

1. Go to your **scriptripper-api** service
2. Click: **"Environment"** tab
3. Find: `REDIS_URL`
4. Click **"Edit"**
5. Paste the Redis URL from Step 2
6. Click: **"Save Changes"**

This will automatically redeploy your API (takes ~2 minutes).

### Step 4: Verify

After redeployment:
```bash
curl https://scriptripper-api.onrender.com/health
```

You should see:
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

## Cleanup (Optional)

Delete the fake "scriptripper-redis" PostgreSQL database that was created:
1. Find the PostgreSQL database named "scriptripper-redis" (not the real Redis)
2. Delete it (you don't need it)

---

**Total time**: 3-5 minutes
