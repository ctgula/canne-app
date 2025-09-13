-- Create driver_applications table
CREATE TABLE IF NOT EXISTS driver_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  availability text[] NOT NULL CHECK (array_length(availability, 1) > 0),
  vehicle_type text,
  cashapp_handle text,
  about text,
  status text DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_driver_applications_email ON driver_applications(email);
CREATE INDEX IF NOT EXISTS idx_driver_applications_phone ON driver_applications(phone);
CREATE INDEX IF NOT EXISTS idx_driver_applications_status ON driver_applications(status);
CREATE INDEX IF NOT EXISTS idx_driver_applications_created_at ON driver_applications(created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_driver_applications_updated_at 
    BEFORE UPDATE ON driver_applications 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS (Row Level Security) policies if needed
ALTER TABLE driver_applications ENABLE ROW LEVEL SECURITY;

-- Policy to allow reading applications (for admin)
CREATE POLICY "Allow admin read access" ON driver_applications
    FOR SELECT USING (true);

-- Policy to allow inserting new applications (for public form)
CREATE POLICY "Allow public insert" ON driver_applications
    FOR INSERT WITH CHECK (true);
