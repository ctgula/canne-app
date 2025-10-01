-- Cash App Payments Table
-- This table stores temporary payment records for Cash App transactions
-- Orders are created after payment is verified

CREATE TABLE IF NOT EXISTS cashapp_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_code TEXT UNIQUE NOT NULL,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  customer_phone TEXT,
  status TEXT NOT NULL DEFAULT 'awaiting_payment' 
    CHECK (status IN ('awaiting_payment', 'verifying', 'paid', 'expired', 'refunded')),
  cashapp_handle TEXT,
  screenshot_url TEXT,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '15 minutes')
);

-- Index for fast lookups by short code
CREATE INDEX IF NOT EXISTS idx_cashapp_payments_short_code ON cashapp_payments(short_code);

-- Index for status queries
CREATE INDEX IF NOT EXISTS idx_cashapp_payments_status ON cashapp_payments(status);

-- Index for expiration cleanup
CREATE INDEX IF NOT EXISTS idx_cashapp_payments_expires_at ON cashapp_payments(expires_at);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_cashapp_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_cashapp_payments_updated_at
  BEFORE UPDATE ON cashapp_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_cashapp_payments_updated_at();

-- RLS Policies
ALTER TABLE cashapp_payments ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to read their own payment records
CREATE POLICY "Allow read access to payment records"
  ON cashapp_payments
  FOR SELECT
  USING (true);

-- Allow service role to insert/update
CREATE POLICY "Allow service role full access"
  ON cashapp_payments
  FOR ALL
  USING (true);
