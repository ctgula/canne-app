-- ============================================
-- Discord Notifications Database Fix
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Check and add missing columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS order_number TEXT,
ADD COLUMN IF NOT EXISTS delivery_address_line1 TEXT;

-- Step 2: Migrate data if needed
UPDATE orders 
SET delivery_address_line1 = delivery_address 
WHERE delivery_address IS NOT NULL AND delivery_address_line1 IS NULL;

-- Step 3: Ensure the foreign key constraint exists and is correct
ALTER TABLE cashapp_payments 
DROP CONSTRAINT IF EXISTS cashapp_payments_order_id_fkey;

ALTER TABLE cashapp_payments 
ADD CONSTRAINT cashapp_payments_order_id_fkey 
FOREIGN KEY (order_id) 
REFERENCES orders(id) 
ON DELETE SET NULL;

-- Step 4: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cashapp_payments_order_id ON cashapp_payments(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Step 5: Create a view for easier querying (optional but helpful)
CREATE OR REPLACE VIEW cashapp_payment_details AS
SELECT 
  cp.id as payment_id,
  cp.short_code,
  cp.amount_cents,
  cp.customer_phone as payment_customer_phone,
  cp.status as payment_status,
  cp.cashtag,
  cp.payment_note,
  cp.order_id,
  cp.created_at as payment_created_at,
  cp.expires_at,
  o.order_number,
  o.total as order_total,
  o.customer_name,
  o.customer_phone as order_customer_phone,
  o.customer_email,
  o.delivery_address_line1,
  o.delivery_city,
  o.delivery_state,
  o.delivery_zip,
  o.status as order_status
FROM cashapp_payments cp
LEFT JOIN orders o ON cp.order_id = o.id;

-- Step 6: Grant access to the view
GRANT SELECT ON cashapp_payment_details TO anon, authenticated;

-- Step 7: Verify the fix
SELECT 
    'Foreign key exists' as check_name,
    COUNT(*) as result
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY'
    AND table_name = 'cashapp_payments'
    AND constraint_name = 'cashapp_payments_order_id_fkey'
UNION ALL
SELECT 
    'View created' as check_name,
    COUNT(*) as result
FROM information_schema.views
WHERE table_name = 'cashapp_payment_details';
