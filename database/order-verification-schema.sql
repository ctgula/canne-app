-- Update cashapp_orders table to support full order verification system
ALTER TABLE cashapp_orders 
ADD COLUMN IF NOT EXISTS driver_id UUID,
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS customer_email TEXT,
ADD COLUMN IF NOT EXISTS delivery_address TEXT,
ADD COLUMN IF NOT EXISTS delivery_city TEXT,
ADD COLUMN IF NOT EXISTS delivery_state TEXT,
ADD COLUMN IF NOT EXISTS delivery_zip TEXT,
ADD COLUMN IF NOT EXISTS delivery_notes TEXT;

-- Update status enum to include all required statuses
ALTER TABLE cashapp_orders 
DROP CONSTRAINT IF EXISTS cashapp_orders_status_check;

ALTER TABLE cashapp_orders 
ADD CONSTRAINT cashapp_orders_status_check 
CHECK (status IN ('pending', 'awaiting_payment', 'verifying', 'paid', 'assigned', 'delivered', 'refunded'));

-- Create payouts table
CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID NOT NULL,
  order_id UUID NOT NULL REFERENCES cashapp_orders(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('queued', 'paid')),
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create drivers table if it doesn't exist
CREATE TABLE IF NOT EXISTS drivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  availability TEXT[] NOT NULL,
  experience TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payouts_driver_id ON payouts(driver_id);
CREATE INDEX IF NOT EXISTS idx_payouts_order_id ON payouts(order_id);
CREATE INDEX IF NOT EXISTS idx_cashapp_orders_status ON cashapp_orders(status);
CREATE INDEX IF NOT EXISTS idx_cashapp_orders_driver_id ON cashapp_orders(driver_id);
