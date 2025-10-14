# 🎯 Discord Notifications Fix - Final Steps

## Current Status
- ✅ **API Code Fixed** - `/src/app/api/orders/submit-payment/route.ts` is updated
- ⚠️ **Database Migration Needed** - Run SQL in Supabase Dashboard

---

## 🔴 Step 1: Fix Database (Required)

### Go to Supabase Dashboard and run this SQL:

1. Open: **https://supabase.com/dashboard**
2. Select your project: **shfaxsmyxhlzzdmzmqwo**
3. Click: **SQL Editor** (left sidebar)
4. Click: **New query**
5. **Copy/Paste this entire block:**

```sql
-- Discord Notifications Fix
-- Copy this entire block and click "Run"

-- Add missing columns
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS order_number TEXT,
ADD COLUMN IF NOT EXISTS delivery_address_line1 TEXT;

-- Migrate data
UPDATE orders 
SET delivery_address_line1 = delivery_address 
WHERE delivery_address IS NOT NULL 
  AND delivery_address_line1 IS NULL;

-- Fix foreign key
ALTER TABLE cashapp_payments 
DROP CONSTRAINT IF EXISTS cashapp_payments_order_id_fkey;

ALTER TABLE cashapp_payments 
ADD CONSTRAINT cashapp_payments_order_id_fkey 
FOREIGN KEY (order_id) 
REFERENCES orders(id) 
ON DELETE SET NULL;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_cashapp_payments_order_id 
  ON cashapp_payments(order_id);
  
CREATE INDEX IF NOT EXISTS idx_orders_order_number 
  ON orders(order_number);

-- Verify (should show result=1)
SELECT 
  'Success - Foreign Key Created' as status,
  COUNT(*) as result
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY'
  AND table_name = 'cashapp_payments'
  AND constraint_name = 'cashapp_payments_order_id_fkey';
```

6. Click: **Run** (or Cmd/Ctrl + Enter)
7. **Verify**: Last query shows `result = 1`

---

## 🚀 Step 2: Deploy Code

```bash
git add .
git commit -m "fix: Discord notifications foreign key relationship"
git push origin main
```

Vercel will auto-deploy.

---

## ✅ Step 3: Test

1. **Place a test order** on your site
2. **Go to payment page** (you'll get a short code)
3. **Click** "I Paid – Verify My Order"
4. **Check Discord** - you should see:

```
💳 Payment Submitted for Verification

Order Number: CN-XXXXXXXX-XXXX
Amount: $XX.XX
Short Code: ABC123
Customer: [Name]
Phone: [Phone]
Status: 🔍 VERIFYING
```

---

## 🔍 If Still Not Working

### Check Vercel Environment Variables:
Go to: **Vercel Dashboard** > Your Project > **Settings** > **Environment Variables**

Verify these exist:
- `DISCORD_WEBHOOK` ← (NOT `DISCORD_WEBHOOK_URL`)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Check Vercel Logs:
**Vercel Dashboard** > **Deployments** > Latest > **Functions**

Look for errors in `/api/orders/submit-payment`

---

## What Was The Problem?

**Error**: `"Could not find a relationship between 'cashapp_payments' and 'orders'"`

**Root Cause**: 
- Supabase PostgREST couldn't recognize the foreign key relationship
- The nested select query syntax was failing

**Solution Applied**:
1. ✅ API now uses two separate queries instead of nested select
2. ⚠️ Database foreign key needs to be explicitly recreated (run SQL above)

---

## Files Changed
- ✅ `/src/app/api/orders/submit-payment/route.ts` - Query pattern fixed
- ✅ `/mcp_config.json` - Updated region to us-east-1

---

**That's it!** Just run the SQL in Supabase Dashboard and deploy. 🎉
