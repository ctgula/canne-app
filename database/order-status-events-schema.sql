-- Create order_status_events table for audit logging
CREATE TABLE IF NOT EXISTS order_status_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  reason TEXT,
  admin_user TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_order_status_events_order_id ON order_status_events(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_events_created_at ON order_status_events(created_at DESC);

-- Ensure payouts table has proper constraints
ALTER TABLE payouts ADD CONSTRAINT IF NOT EXISTS unique_order_payout UNIQUE(order_id);

-- Add status column to payouts if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payouts' AND column_name = 'status') THEN
    ALTER TABLE payouts ADD COLUMN status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'paid', 'blocked'));
  END IF;
END $$;

-- Enable RLS on order_status_events
ALTER TABLE order_status_events ENABLE ROW LEVEL SECURITY;

-- Create policy for service role access
CREATE POLICY IF NOT EXISTS "Service role can manage order_status_events" ON order_status_events
  FOR ALL USING (auth.role() = 'service_role');
