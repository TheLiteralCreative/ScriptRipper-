# GoDaddy DNS Setup for scriptripper.com → Render

**Status**: Domain added to Render ✅
**Verification Status**: Unverified (pending DNS records)

---

## DNS Records to Add in GoDaddy

### Step 1: Log into GoDaddy DNS Management

1. Go to: https://dcc.godaddy.com/control/scriptripper.com/dns
2. Or: GoDaddy → My Products → scriptripper.com → DNS → Manage Zones

---

### Step 2: Add CNAME Record for www subdomain

**Delete any existing www records first**, then add:

```
Type: CNAME
Name: www
Value: scriptripper-api.onrender.com
TTL: 600 (10 minutes)
```

**Important**: Remove the trailing dot if GoDaddy adds one automatically.

---

### Step 3: Configure Apex Domain (scriptripper.com)

**Option A: CNAME Flattening (Recommended if GoDaddy supports it)**

GoDaddy now supports CNAME flattening for apex domains:

```
Type: CNAME
Name: @
Value: scriptripper-api.onrender.com
TTL: 600
```

**Option B: If CNAME doesn't work for @ (older GoDaddy)**

You'll need to forward the apex domain:

1. In GoDaddy DNS, delete any existing @ A records
2. Go to: Domain Settings → Forwarding → Domain
3. Forward to: https://www.scriptripper.com
4. Forward Type: Permanent (301)
5. Then the www CNAME (from Step 2) will handle all traffic

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

After setup, your DNS should look like:

```
Type    Name    Value                           TTL
CNAME   www     scriptripper-api.onrender.com   600
CNAME   @       scriptripper-api.onrender.com   600
```

OR (if using forwarding):

```
Type    Name    Value                           TTL
CNAME   www     scriptripper-api.onrender.com   600

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

**Service URL (current)**: https://scriptripper-api.onrender.com
**Custom Domain (target)**: https://scriptripper.com
**WWW Subdomain**: https://www.scriptripper.com

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

1. **Now**: Add DNS records in GoDaddy (see Step 2 & 3 above)
2. **Wait**: 10-30 minutes for DNS propagation
3. **Verify**: Check https://scriptripper.com/health
4. **Celebrate**: Your app is live on a custom domain! 🎉
