-- Fix Cash App Payments Foreign Key Relationship
-- Run this in your Supabase SQL Editor

-- First, check if the table exists and add the foreign key if missing
DO $$ 
BEGIN
  -- Add order_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cashapp_payments' AND column_name = 'order_id'
  ) THEN
    ALTER TABLE cashapp_payments 
    ADD COLUMN order_id UUID REFERENCES orders(id) ON DELETE SET NULL;
    
    RAISE NOTICE 'Added order_id column to cashapp_payments';
  END IF;

  -- Add foreign key constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'cashapp_payments' 
    AND constraint_type = 'FOREIGN KEY'
    AND constraint_name = 'cashapp_payments_order_id_fkey'
  ) THEN
    ALTER TABLE cashapp_payments
    ADD CONSTRAINT cashapp_payments_order_id_fkey 
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL;
    
    RAISE NOTICE 'Added foreign key constraint to cashapp_payments';
  END IF;
END $$;

-- Verify the foreign key exists
SELECT
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name='cashapp_payments';
