-- Fix the foreign key relationship between cashapp_payments and orders
-- This migration ensures the relationship is properly set up for Discord notifications

-- First, ensure the orders table has all necessary columns
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS order_number TEXT,
ADD COLUMN IF NOT EXISTS delivery_address_line1 TEXT;

-- Update delivery_address to delivery_address_line1 if it exists
UPDATE orders 
SET delivery_address_line1 = delivery_address 
WHERE delivery_address IS NOT NULL AND delivery_address_line1 IS NULL;

-- Create index on order_id in cashapp_payments for faster joins
CREATE INDEX IF NOT EXISTS idx_cashapp_payments_order_id ON cashapp_payments(order_id);

-- Ensure the foreign key constraint exists
ALTER TABLE cashapp_payments 
DROP CONSTRAINT IF EXISTS cashapp_payments_order_id_fkey;

ALTER TABLE cashapp_payments 
ADD CONSTRAINT cashapp_payments_order_id_fkey 
FOREIGN KEY (order_id) 
REFERENCES orders(id) 
ON DELETE SET NULL;

-- Create a view for easier querying of payment and order information
CREATE OR REPLACE VIEW cashapp_payment_details AS
SELECT 
  cp.*,
  o.order_number,
  o.total,
  o.customer_name,
  o.customer_phone,
  o.customer_email,
  o.delivery_address_line1,
  o.delivery_city,
  o.delivery_state,
  o.delivery_zip,
  o.status as order_status
FROM cashapp_payments cp
LEFT JOIN orders o ON cp.order_id = o.id;

-- Grant access to the view
GRANT SELECT ON cashapp_payment_details TO anon, authenticated;
