-- =================================================
-- COPY THIS ENTIRE FILE AND RUN IN SUPABASE
-- =================================================
-- Discord Notifications Fix
-- Run in: Supabase Dashboard > SQL Editor
-- =================================================

-- Step 1: Add missing columns
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS order_number TEXT,
ADD COLUMN IF NOT EXISTS delivery_address_line1 TEXT;

-- Step 2: Migrate existing data
UPDATE orders 
SET delivery_address_line1 = delivery_address 
WHERE delivery_address IS NOT NULL 
  AND delivery_address_line1 IS NULL;

-- Step 3: Fix foreign key relationship
ALTER TABLE cashapp_payments 
DROP CONSTRAINT IF EXISTS cashapp_payments_order_id_fkey;

ALTER TABLE cashapp_payments 
ADD CONSTRAINT cashapp_payments_order_id_fkey 
FOREIGN KEY (order_id) 
REFERENCES orders(id) 
ON DELETE SET NULL;

-- Step 4: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_cashapp_payments_order_id 
  ON cashapp_payments(order_id);
  
CREATE INDEX IF NOT EXISTS idx_orders_order_number 
  ON orders(order_number);

-- Step 5: Verify (should return result=1)
SELECT 
  'Foreign Key Created' as status,
  COUNT(*) as result
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY'
  AND table_name = 'cashapp_payments'
  AND constraint_name = 'cashapp_payments_order_id_fkey';
