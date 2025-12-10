-- Create partnership_requests table
CREATE TABLE IF NOT EXISTS partnership_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  company_name TEXT NOT NULL,
  website TEXT,
  category TEXT NOT NULL,
  message TEXT,
  logo_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'contacted')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_partnership_requests_status ON partnership_requests(status);
CREATE INDEX idx_partnership_requests_created_at ON partnership_requests(created_at DESC);

-- Enable RLS
ALTER TABLE partnership_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert (submit application)
CREATE POLICY "Allow public insert on partnership_requests"
  ON partnership_requests
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy: Only authenticated users (admins) can view all requests
CREATE POLICY "Allow authenticated users to view partnership_requests"
  ON partnership_requests
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only authenticated users (admins) can update requests
CREATE POLICY "Allow authenticated users to update partnership_requests"
  ON partnership_requests
  FOR UPDATE
  TO authenticated
  USING (true);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_partnership_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER partnership_requests_updated_at
  BEFORE UPDATE ON partnership_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_partnership_requests_updated_at();
