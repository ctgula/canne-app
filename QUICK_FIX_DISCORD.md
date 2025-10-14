# Quick Fix for Discord Notifications Issue

## The Problem
The Discord notifications are failing because the database query can't find the relationship between `cashapp_payments` and `orders` tables.

Error: `"Could not find a relationship between 'cashapp_payments' and 'orders' in the schema cache"`

## The Solution (2 Parts)

### Part 1: Fix Database (Run in Supabase Dashboard)

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Navigate to**: SQL Editor
3. **Copy and paste this SQL** and click "Run":

```sql
-- Add missing columns if they don't exist
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS order_number TEXT,
ADD COLUMN IF NOT EXISTS delivery_address_line1 TEXT;

-- Migrate existing data
UPDATE orders 
SET delivery_address_line1 = delivery_address 
WHERE delivery_address IS NOT NULL 
  AND delivery_address_line1 IS NULL;

-- Recreate the foreign key constraint
ALTER TABLE cashapp_payments 
DROP CONSTRAINT IF EXISTS cashapp_payments_order_id_fkey;

ALTER TABLE cashapp_payments 
ADD CONSTRAINT cashapp_payments_order_id_fkey 
FOREIGN KEY (order_id) 
REFERENCES orders(id) 
ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_cashapp_payments_order_id 
  ON cashapp_payments(order_id);
  
CREATE INDEX IF NOT EXISTS idx_orders_order_number 
  ON orders(order_number);

-- Verify the fix
SELECT 
  'Foreign Key Created' as status,
  COUNT(*) as count
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY'
  AND table_name = 'cashapp_payments'
  AND constraint_name = 'cashapp_payments_order_id_fkey';
```

### Part 2: API Code Already Fixed ✅

The API code has been updated to use a two-step query instead of nested select:

**File**: `/src/app/api/orders/submit-payment/route.ts`

Changes:
- ✅ Split the query into two parts
- ✅ First get payment record
- ✅ Then get order details if order_id exists
- ✅ Updated Discord notification to use new data structure

## Test After Applying

1. Place a test order
2. Go to payment page
3. Click "I Paid - Verify My Order"
4. Check your Discord channel for notification

Expected Discord message:
```
💳 Payment Submitted for Verification

Order Number: CN-XXXXXXXX-XXXX
Amount: $XX.XX
Short Code: ABC123
Customer: [Name]
Phone: [Phone]
Status: 🔍 VERIFYING
```

## If Still Not Working

Check environment variables in Vercel:
1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Verify these are set:
   - `DISCORD_WEBHOOK` (not DISCORD_WEBHOOK_URL)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

## Files Changed
- ✅ `/src/app/api/orders/submit-payment/route.ts` - Fixed query logic
- 📝 SQL migration (run in Supabase dashboard)

## Need Help?
If you still see errors, check:
1. Supabase dashboard > Table Editor > orders table (verify columns exist)
2. Vercel deployment logs for detailed error messages
3. Discord webhook URL is valid (test with curl)
