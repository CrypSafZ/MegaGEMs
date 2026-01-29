-- MegaGEMs Supabase Schema
-- Run this SQL in the Supabase SQL Editor to set up the database

-- Create the requests table
CREATE TABLE IF NOT EXISTS requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  x_handle TEXT NOT NULL,
  pfp_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  usd_amount NUMERIC DEFAULT 0,
  mega_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_wallet_address ON requests(wallet_address);
CREATE INDEX IF NOT EXISTS idx_requests_mega_amount ON requests(mega_amount DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to read approved requests (for the public leaderboard)
CREATE POLICY "Anyone can view approved requests"
  ON requests FOR SELECT
  USING (status = 'approved');

-- Policy: Allow authenticated service role to do everything
-- This is automatically handled by the service role key

-- Optional: Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_requests_updated_at
  BEFORE UPDATE ON requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (if needed for anon role to insert)
-- Note: We use service role for most operations, so this is optional
-- GRANT INSERT ON requests TO anon;
-- GRANT SELECT ON requests TO anon;
