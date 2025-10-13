-- Migration: Add contact capture and notification tracking fields
-- Created: 2025-01-13
-- Purpose: Add marketing opt-in, SMS preferences, and notification logging

-- =============================================================================
-- 1. Add marketing and communication fields to customers table (if missing)
-- =============================================================================

-- Add marketing_opt_in column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customers' AND column_name = 'marketing_opt_in'
  ) THEN
    ALTER TABLE customers ADD COLUMN marketing_opt_in BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add marketing_subscribed_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customers' AND column_name = 'marketing_subscribed_at'
  ) THEN
    ALTER TABLE customers ADD COLUMN marketing_subscribed_at TIMESTAMPTZ;
  END IF;
END $$;

-- Add sms_opt_out column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customers' AND column_name = 'sms_opt_out'
  ) THEN
    ALTER TABLE customers ADD COLUMN sms_opt_out BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add name column if it doesn't exist (for convenience)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customers' AND column_name = 'name'
  ) THEN
    ALTER TABLE customers ADD COLUMN name TEXT;
  END IF;
END $$;

-- =============================================================================
-- 2. Create notification_logs table (if it doesn't exist)
-- =============================================================================

CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms')),
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'pending')),
  provider_response JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for notification_logs
CREATE INDEX IF NOT EXISTS idx_notification_logs_customer_id ON notification_logs(customer_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_order_id ON notification_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON notification_logs(status);
CREATE INDEX IF NOT EXISTS idx_notification_logs_channel ON notification_logs(channel);
CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON notification_logs(created_at DESC);

-- =============================================================================
-- 3. Add order_ref column to orders table if missing (for client-facing IDs)
-- =============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'order_ref'
  ) THEN
    ALTER TABLE orders ADD COLUMN order_ref TEXT;
    -- Add unique constraint
    ALTER TABLE orders ADD CONSTRAINT orders_order_ref_unique UNIQUE (order_ref);
  END IF;
END $$;

-- Create index on order_ref for fast lookups
CREATE INDEX IF NOT EXISTS idx_orders_order_ref ON orders(order_ref);

-- =============================================================================
-- 4. Add amount column to orders table if missing (in cents, for consistency)
-- =============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'amount'
  ) THEN
    ALTER TABLE orders ADD COLUMN amount INTEGER; -- amount in cents
    COMMENT ON COLUMN orders.amount IS 'Order total in cents (integer)';
  END IF;
END $$;

-- =============================================================================
-- 5. Add items JSONB column to orders table if missing
-- =============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'items'
  ) THEN
    ALTER TABLE orders ADD COLUMN items JSONB;
    COMMENT ON COLUMN orders.items IS 'Order items stored as JSON for quick access';
  END IF;
END $$;

-- =============================================================================
-- 6. Enable RLS on notification_logs (security)
-- =============================================================================

ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do everything
CREATE POLICY IF NOT EXISTS "Service role has full access to notification_logs"
  ON notification_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy: Authenticated users can only view their own notifications
CREATE POLICY IF NOT EXISTS "Users can view their own notification logs"
  ON notification_logs
  FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE email = auth.jwt() ->> 'email'
    )
  );

-- =============================================================================
-- 7. Create helper function to update updated_at timestamp
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to notification_logs if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_notification_logs_updated_at'
  ) THEN
    CREATE TRIGGER update_notification_logs_updated_at
      BEFORE UPDATE ON notification_logs
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

-- Summary of changes:
-- ✅ Added marketing_opt_in, marketing_subscribed_at, sms_opt_out to customers
-- ✅ Created notification_logs table with proper indexes and RLS
-- ✅ Added order_ref and amount columns to orders for better tracking
-- ✅ Added items JSONB column to orders for denormalized data
-- ✅ Created helper function and triggers for timestamp management
