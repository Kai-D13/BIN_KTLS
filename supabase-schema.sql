-- BIN Recovery System Database Schema

-- Table 1: bin_pickup_pending (File thứ 6 - Danh sách cần thu hồi)
CREATE TABLE IF NOT EXISTS bin_pickup_pending (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_name TEXT,
  han_thu_hoi TIMESTAMP,
  ma_don TEXT,
  ngay_phat_sinh_bin TIMESTAMP,
  bin_code TEXT NOT NULL,
  bin_type TEXT,
  reference_code TEXT,
  reference_code_of_so TEXT,
  cust_name TEXT,
  cust_address TEXT,
  cust_ward TEXT,
  cust_district TEXT,
  cust_province TEXT,
  employee_id NUMERIC,
  employee_name TEXT,
  week_number INTEGER NOT NULL,
  import_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table 2: bin_compensation (File thứ 4 - Chốt đền bù)
CREATE TABLE IF NOT EXISTS bin_compensation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_name TEXT,
  han_thu_hoi TIMESTAMP,
  ma_don TEXT,
  ngay_phat_sinh_bin TIMESTAMP,
  bin_code TEXT NOT NULL,
  bin_type TEXT,
  reference_code TEXT,
  reference_code_of_so TEXT,
  cust_name TEXT,
  cust_address TEXT,
  cust_ward TEXT,
  cust_district TEXT,
  cust_province TEXT,
  employee_id NUMERIC,
  employee_name TEXT,
  week_number INTEGER NOT NULL,
  import_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table 3: import_history (Lịch sử import)
CREATE TABLE IF NOT EXISTS import_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('pending', 'compensation')),
  week_number INTEGER NOT NULL,
  total_rows INTEGER NOT NULL DEFAULT 0,
  success_rows INTEGER NOT NULL DEFAULT 0,
  failed_rows INTEGER NOT NULL DEFAULT 0,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bin_pickup_pending_hub ON bin_pickup_pending(hub_name);
CREATE INDEX IF NOT EXISTS idx_bin_pickup_pending_employee ON bin_pickup_pending(employee_name);
CREATE INDEX IF NOT EXISTS idx_bin_pickup_pending_bin_code ON bin_pickup_pending(bin_code);
CREATE INDEX IF NOT EXISTS idx_bin_pickup_pending_week ON bin_pickup_pending(week_number);
CREATE INDEX IF NOT EXISTS idx_bin_pickup_pending_created_at ON bin_pickup_pending(created_at);

CREATE INDEX IF NOT EXISTS idx_bin_compensation_hub ON bin_compensation(hub_name);
CREATE INDEX IF NOT EXISTS idx_bin_compensation_employee ON bin_compensation(employee_name);
CREATE INDEX IF NOT EXISTS idx_bin_compensation_bin_code ON bin_compensation(bin_code);
CREATE INDEX IF NOT EXISTS idx_bin_compensation_week ON bin_compensation(week_number);
CREATE INDEX IF NOT EXISTS idx_bin_compensation_created_at ON bin_compensation(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE bin_pickup_pending ENABLE ROW LEVEL SECURITY;
ALTER TABLE bin_compensation ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_history ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read access (since we're using password auth in app)
CREATE POLICY "Allow public read access on bin_pickup_pending" 
  ON bin_pickup_pending FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert on bin_pickup_pending" 
  ON bin_pickup_pending FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public read access on bin_compensation" 
  ON bin_compensation FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert on bin_compensation" 
  ON bin_compensation FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public read access on import_history" 
  ON import_history FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert on import_history" 
  ON import_history FOR INSERT 
  WITH CHECK (true);

-- Function to delete records older than 28 days (4 weeks)
CREATE OR REPLACE FUNCTION delete_old_records()
RETURNS void AS $$
BEGIN
  DELETE FROM bin_pickup_pending WHERE created_at < NOW() - INTERVAL '28 days';
  DELETE FROM bin_compensation WHERE created_at < NOW() - INTERVAL '28 days';
  DELETE FROM import_history WHERE uploaded_at < NOW() - INTERVAL '28 days';
END;
$$ LANGUAGE plpgsql;

-- Note: You need to set up a cron job in Supabase to run this function daily
-- Go to Supabase Dashboard > Database > Cron Jobs
-- Add: SELECT cron.schedule('delete-old-records', '0 2 * * *', 'SELECT delete_old_records()');
