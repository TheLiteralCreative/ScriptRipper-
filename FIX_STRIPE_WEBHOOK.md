# Fix Stripe Webhook Integration

You mentioned that you paid the $5 Stripe fee but weren't upgraded to Pro. Let's fix this!

## 🔍 Problem Diagnosis

The webhook code has been updated, but we need to:
1. Verify webhook configuration
2. Manually upgrade your paid account
3. Test the webhook for future payments

---

## ⚡ Quick Fix: Manually Upgrade Your Account

Since you already paid, let's upgrade you manually:

### Option 1: Using Admin Dashboard (Once Running)
1. Start the app: `docker-compose up` or `npm run dev` (web) + `uvicorn app.main:app --reload` (api)
2. Login as admin at: http://localhost:3000/login
3. Go to: http://localhost:3000/admin
4. In "Grant Pro Access" section, enter your email
5. Click "Set to Pro"

### Option 2: Using Debug Admin Endpoint
```bash
# Find your email in the database
curl http://localhost:8000/api/v1/debug-admin/list-all-users

# Upgrade to Pro (replace with your actual email)
curl -X POST http://localhost:8000/api/v1/admin/users/set-pro \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"email": "your-email@example.com"}'
```

### Option 3: Direct Database Update
```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U scriptripper scriptripper

# Update your user (replace YOUR_EMAIL)
UPDATE users
SET subscription_tier = 'pro',
    subscription_source = 'stripe'
WHERE email = 'YOUR_EMAIL@example.com';

# Verify
SELECT email, subscription_tier, subscription_source FROM users WHERE email = 'YOUR_EMAIL@example.com';
```

---

## 🔧 Fix Webhook for Future Payments

### Step 1: Check Webhook Secret

```bash
cd ScriptRipper+/api
cat .env | grep STRIPE_WEBHOOK_SECRET
```

**Expected**: `STRIPE_WEBHOOK_SECRET=whsec_...`

**If missing or wrong**:
1. Start Stripe CLI listener:
   ```bash
   stripe listen --forward-to localhost:8000/api/v1/billing/webhook
   ```
2. Copy the webhook secret from output (looks like `whsec_ABC123...`)
3. Add to `ScriptRipper+/api/.env`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_ABC123...
   ```
4. Restart API server

### Step 2: Verify Webhook Endpoint

```bash
# Check if webhook endpoint exists
curl http://localhost:8000/api/v1/billing/webhook \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected**: Error about missing signature (this is good - endpoint exists!)

### Step 3: Test Webhook with Stripe CLI

Keep these running in separate terminals:

**Terminal 1 - API Server**:
```bash
cd ScriptRipper+/api
uvicorn app.main:app --reload
```

**Terminal 2 - Stripe Listener**:
```bash
stripe listen --forward-to localhost:8000/api/v1/billing/webhook
```

**Terminal 3 - Test Payment**:
```bash
# Trigger a test checkout.session.completed event
stripe trigger checkout.session.completed
```

Watch Terminal 2 for webhook events. You should see:
```
✔ Received event checkout.session.completed
✔ Forwarded to http://localhost:8000/api/v1/billing/webhook
```

### Step 4: Check API Logs

After triggering the test event, check API logs for:
```
INFO: POST /api/v1/billing/webhook
INFO: User upgraded to Pro via Stripe
```

If you see errors, share them with me!

---

## 🧪 Test with Real Payment

### Using Stripe Test Card

1. **Create a test account** (if you haven't):
   ```bash
   # Go to your app
   http://localhost:3000/register

   # Register with: test@example.com
   ```

2. **Initiate checkout**:
   ```bash
   http://localhost:3000/upgrade
   ```

3. **Use test card**:
   - Card: `4242 4242 4242 4242`
   - Exp: Any future date (e.g., `12/34`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)

4. **Verify upgrade**:
   ```bash
   # Check in admin dashboard
   http://localhost:3000/admin

   # Should show "pro" tier with "stripe" source
   ```

---

## 📋 Checklist

- [ ] Database migration run (`./run_migration.sh`)
- [ ] API server running
- [ ] Stripe listener running (`stripe listen --forward-to ...`)
- [ ] Webhook secret in `.env` file
- [ ] API restarted after adding webhook secret
- [ ] Your paid account manually upgraded to Pro
- [ ] Test payment successful with test card
- [ ] User shows "Pro" tier with "Stripe" source in admin dashboard

---

## 🐛 Common Issues

### Webhook Secret Mismatch
**Symptom**: Payment succeeds, but user not upgraded
**Fix**: Make sure webhook secret in `.env` matches `stripe listen` output

### API Not Running During Payment
**Symptom**: Payment succeeds, webhook logged in Stripe, but nothing happens
**Fix**: Ensure API is running when payment is made

### Metadata Missing in Checkout Session
**Symptom**: Webhook receives event but can't find user_id
**Fix**: Check that checkout session includes metadata with user_id

### Database Connection Issues
**Symptom**: Webhook received but database update fails
**Fix**: Check database is running: `docker-compose ps postgres`

---

## 📞 Need Help?

If none of this works, let me know and provide:
1. API logs when webhook fires
2. Stripe webhook event details (from Stripe Dashboard > Developers > Webhooks)
3. Output of: `cat api/.env | grep STRIPE`
