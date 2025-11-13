# GoDaddy DNS Setup for scriptripper.com → Render

**Status**: Domain added to Render ✅
**Verification Status**: Unverified (pending DNS records)

---

## DNS Records to Add in GoDaddy

### Step 1: Log into GoDaddy DNS Management

1. Go to: https://dcc.godaddy.com/control/scriptripper.com/dns
2. Or: GoDaddy → My Products → scriptripper.com → DNS → Manage Zones

---

### Step 2: Point `www` to the Web UI (Vercel)

Deploy the Next.js UI on Vercel first, then copy the assigned hostname (e.g., `scriptripper-web.vercel.app`). **Delete any existing `www` records** and add:

```
Type: CNAME
Name: www
Value: <your-vercel-domain>.vercel.app
TTL: 600 (10 minutes)
```

> Example: `Value = scriptripper-web.vercel.app`

### Step 3: Point `api` to the FastAPI service (Render)

Add a dedicated subdomain for the API:

```
Type: CNAME
Name: api
Value: scriptripper-api.onrender.com
TTL: 600
```

Update the Render service with the custom domain once DNS propagates so TLS is issued for `api.scriptripper.com`.

### Step 4: Configure Apex Domain (scriptripper.com)

Keep the apex focused on the UI. GoDaddy does not allow a direct CNAME at `@`, so use forwarding:

1. Remove every existing `@` A record (typically parking entries).
2. Domain Settings → Forwarding → Domain → Add Forwarding.
3. Forward to: `https://www.scriptripper.com`
4. Type: Permanent (301), Settings: Forward only.
5. Save.

This keeps SEO consistent and ensures all human traffic flows through the Vercel-hosted UI before hitting the API.

---

### Step 4: Verify Current DNS Records

Before making changes, check what you currently have:

**In GoDaddy DNS Management**, look for:
- Any @ A records (likely pointing to GoDaddy parking page - DELETE these)
- Any existing CNAME records
- Any existing forwarding rules

**Delete these**:
- @ A records (e.g., 160.153.x.x - GoDaddy parking)
- Any conflicting CNAME or forwarding

---

## Expected Final DNS Configuration

After setup, the key records will look like:

```
Type    Name    Value                                   TTL
CNAME   www     <your-vercel-domain>.vercel.app         600
CNAME   api     scriptripper-api.onrender.com           600

Domain Forwarding:
scriptripper.com → https://www.scriptripper.com (301 permanent)
```

---

## Verification

### Step 1: Wait for DNS Propagation (10-30 minutes)

Check status at: https://dnschecker.org

Enter: `scriptripper.com`

Should resolve to: Render's servers

### Step 2: Check Render Verification

After DNS propagates, Render will automatically verify and issue SSL:

```bash
# Check domain status
curl -s "https://api.render.com/v1/services/srv-d47mub9r0fns73finib0/custom-domains/cdm-d4886sjuibrs7393l2eg" \
  -H "Authorization: Bearer rnd_DurxD2vTGfk8ESlJhCqK0dem46mz" | grep verificationStatus

# Should show: "verificationStatus": "verified"
```

### Step 3: Test the Domain

```bash
# Test apex domain
curl -I https://scriptripper.com

# Test www subdomain
curl -I https://www.scriptripper.com

# Test health endpoint
curl https://scriptripper.com/health
```

**Expected**: All should return 200 OK with SSL certificate

---

## Troubleshooting

### "DNS not propagating"
- Wait 30 minutes (GoDaddy can be slow)
- Check at multiple DNS checkers
- Clear your browser cache
- Use incognito/private mode

### "SSL Certificate Error"
- Render issues SSL automatically after domain verification
- Takes 5-10 minutes after DNS propagates
- Check Render dashboard for SSL status

### "CNAME not allowed for apex domain"
- Use Option B: Domain forwarding
- Forward scriptripper.com → www.scriptripper.com
- www CNAME points to Render

### "Still seeing GoDaddy parking page"
- You didn't delete the @ A records
- Go back to DNS, delete ALL @ A records
- DNS cache - wait 10-30 minutes

---

## Current Status

- ✅ Domain added to Render: scriptripper.com
- ✅ Subdomain added to Render: www.scriptripper.com
- ⏳ DNS records: **You need to add these in GoDaddy now**
- ⏳ Verification: Pending DNS propagation
- ⏳ SSL: Will be issued after verification

---

## Quick Reference

**Service URL (current API)**: https://scriptripper-api.onrender.com  
**UI Host (target)**: https://www.scriptripper.com (Vercel)  
**API Host (target)**: https://api.scriptripper.com

**Render Domain IDs**:
- Apex: cdm-d4886sjuibrs7393l2eg
- WWW: cdm-d4886sjuibrs7393l2fg

**GoDaddy DNS**: https://dcc.godaddy.com/control/scriptripper.com/dns

---

## Timeline

| Step | Time | Status |
|------|------|--------|
| Add domain to Render | Instant | ✅ Done |
| Add DNS records in GoDaddy | 2 min | ⏳ **DO THIS NOW** |
| DNS propagation | 10-30 min | ⏳ Automatic |
| Render verification | 1 min | ⏳ Automatic |
| SSL certificate issuance | 5-10 min | ⏳ Automatic |
| **Total** | **~20-45 min** | |

---

## Next Steps

1. **Now**: Add/adjust DNS records in GoDaddy (Steps 2-4 above)
2. **Wait**: 10-30 minutes for propagation
3. **Verify**:
   - `dig www.scriptripper.com CNAME`
   - `dig api.scriptripper.com CNAME`
   - `curl https://api.scriptripper.com/health`
4. **Celebrate**: UI at `www`, API at `api` with valid SSL 🎉
