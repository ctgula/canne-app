# 🚀 Run This Now - Discord Fix

## Fastest Way to Fix (1 minute)

### Option 1: Supabase Dashboard (Recommended)

1. **Open**: https://supabase.com/dashboard/project/shfaxsmyxhlzzdmzmqwo/sql/new

2. **Paste this SQL and click Run**:

```sql
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

-- Verify
SELECT 'SUCCESS - Foreign Key Created' as status;
```

3. **Click** "Run" (or Cmd+Enter)

4. **Done!** ✅

---

## Then Deploy

```bash
git add .
git commit -m "fix: Discord notifications"
git push origin main
```

---

## Test It

1. Place order on your site
2. Go to payment page
3. Click "I Paid"
4. Check Discord ✅

---

**That's it!** The API code is already fixed, just needs the database migration.
