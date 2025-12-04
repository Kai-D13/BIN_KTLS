-- Migration: Add status tracking to BIN tables
-- Run this in Supabase SQL Editor

-- 1. Add status column to bin_pickup_pending
ALTER TABLE bin_pickup_pending 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' 
CHECK (status IN ('pending', 'picked_up', 'returned'));

-- 2. Add status column to bin_compensation
ALTER TABLE bin_compensation 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' 
CHECK (status IN ('pending', 'picked_up', 'returned'));

-- 3. Update existing NULL values to 'pending'
UPDATE bin_pickup_pending SET status = 'pending' WHERE status IS NULL;
UPDATE bin_compensation SET status = 'pending' WHERE status IS NULL;

-- 4. Create indexes for status column
CREATE INDEX IF NOT EXISTS idx_bin_pickup_pending_status ON bin_pickup_pending(status);
CREATE INDEX IF NOT EXISTS idx_bin_compensation_status ON bin_compensation(status);

-- 5. Add UPDATE policies (if they don't exist)
DROP POLICY IF EXISTS "Allow public update on bin_pickup_pending" ON bin_pickup_pending;
DROP POLICY IF EXISTS "Allow public update on bin_compensation" ON bin_compensation;

CREATE POLICY "Allow public update on bin_pickup_pending" 
ON bin_pickup_pending FOR UPDATE USING (true);

CREATE POLICY "Allow public update on bin_compensation" 
ON bin_compensation FOR UPDATE USING (true);

-- Verify the changes
SELECT 'bin_pickup_pending' as table_name, status, COUNT(*) as count
FROM bin_pickup_pending
GROUP BY status
UNION ALL
SELECT 'bin_compensation' as table_name, status, COUNT(*) as count
FROM bin_compensation
GROUP BY status
ORDER BY table_name, status;
