# 🚀 Discord Notifications Fix - Action Plan

## ✅ COMPLETED: API Code Fixed

The file `/src/app/api/orders/submit-payment/route.ts` has been updated to:
- Split the query into two separate queries (no more nested select)
- First fetch payment record, then fetch order details
- Updated Discord notification to use new data structure
- All TypeScript errors resolved

**Status**: ✅ Ready to deploy

---

## 🔴 ACTION REQUIRED: Run Database Migration

### Step 1: Copy the SQL Below

```sql
-- =================================================
-- Discord Notifications Database Fix
-- Copy this entire block and run in Supabase
-- =================================================

-- 1. Add missing columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS order_number TEXT,
ADD COLUMN IF NOT EXISTS delivery_address_line1 TEXT;

-- 2. Migrate existing data
UPDATE orders 
SET delivery_address_line1 = delivery_address 
WHERE delivery_address IS NOT NULL 
  AND delivery_address_line1 IS NULL;

-- 3. Recreate foreign key constraint explicitly
ALTER TABLE cashapp_payments 
DROP CONSTRAINT IF EXISTS cashapp_payments_order_id_fkey;

ALTER TABLE cashapp_payments 
ADD CONSTRAINT cashapp_payments_order_id_fkey 
FOREIGN KEY (order_id) 
REFERENCES orders(id) 
ON DELETE SET NULL;

-- 4. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_cashapp_payments_order_id 
  ON cashapp_payments(order_id);
  
CREATE INDEX IF NOT EXISTS idx_orders_order_number 
  ON orders(order_number);

-- 5. Verify the fix worked
SELECT 
  'Foreign Key Exists' as status,
  COUNT(*) as result
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY'
  AND table_name = 'cashapp_payments'
  AND constraint_name = 'cashapp_payments_order_id_fkey';

-- Expected result: status='Foreign Key Exists', result=1
```

### Step 2: Run in Supabase Dashboard

1. **Open Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: `shfaxsmyxhlzzdmzmqwo`
3. **Navigate to**: SQL Editor (left sidebar)
4. **Click**: "New query"
5. **Paste**: The SQL from Step 1
6. **Click**: "Run" (or press Cmd/Ctrl + Enter)
7. **Verify**: Last query should return `result=1`

---

## 📦 Deployment Steps

### 1. Commit & Push
```bash
git add .
git commit -m "fix: Discord notifications database relationship issue"
git push origin main
```

### 2. Vercel Auto-Deploy
Vercel will automatically deploy the changes.

### 3. Verify Environment Variables (Vercel Dashboard)
Go to: Project Settings > Environment Variables

Ensure these are set:
- ✅ `DISCORD_WEBHOOK` (NOT `DISCORD_WEBHOOK_URL`)
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`

---

## 🧪 Testing

After database migration and deployment:

1. **Place a test order**
   - Add item to cart
   - Go to checkout
   - Complete order

2. **Go to payment page**
   - You'll see the short code (e.g., ABC123)

3. **Submit payment notification**
   - Click "I Paid – Verify My Order"

4. **Check Discord**
   - You should see a message like:
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

## 🔍 Troubleshooting

### If Discord notification still fails:

1. **Check Vercel Logs**
   ```
   Vercel Dashboard > Deployments > Latest > Functions > Logs
   ```
   Look for error messages from `/api/orders/submit-payment`

2. **Test Discord Webhook**
   ```bash
   curl -X POST "YOUR_DISCORD_WEBHOOK_URL" \
     -H "Content-Type: application/json" \
     -d '{"content": "Test message"}'
   ```
   Should send a test message to Discord

3. **Check Database**
   In Supabase SQL Editor:
   ```sql
   -- Check if foreign key exists
   SELECT constraint_name, table_name 
   FROM information_schema.table_constraints 
   WHERE constraint_type = 'FOREIGN KEY' 
     AND table_name = 'cashapp_payments';
   
   -- Check if columns exist
   SELECT column_name 
   FROM information_schema.columns 
   WHERE table_name = 'orders' 
     AND column_name IN ('order_number', 'delivery_address_line1');
   ```

4. **Frontend Console**
   Open browser DevTools > Console when submitting payment
   Look for any error messages

---

## 📝 Summary of Changes

### Files Modified:
1. ✅ `/src/app/api/orders/submit-payment/route.ts` - Fixed query pattern
2. ✅ `/mcp_config.json` - Updated project ref and region
3. 📄 Created documentation files

### Database Changes Needed:
- Add `order_number` column to `orders` table
- Add `delivery_address_line1` column to `orders` table
- Recreate foreign key constraint
- Add performance indexes

### Next Steps:
1. **Run SQL migration** in Supabase (see above)
2. **Deploy code** to Vercel (git push)
3. **Test** the payment flow
4. **Verify** Discord notifications work

---

## ✨ Expected Result

After completing all steps, when a customer submits a payment:

1. ✅ Payment status updates to "verifying"
2. ✅ Discord receives notification with:
   - Order number
   - Amount
   - Customer info
   - Short code
   - Optional: CashApp handle & screenshot
3. ✅ No errors in Vercel logs
4. ✅ Customer sees success message

**You're ready to go!** 🎉

Run the SQL migration first, then deploy the code.
