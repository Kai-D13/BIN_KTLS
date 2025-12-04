-- Create RPC function to get distinct hub names
-- Run this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION get_distinct_hubs(table_name text)
RETURNS TABLE(hub_name text) AS $$
BEGIN
  RETURN QUERY EXECUTE format('
    SELECT DISTINCT hub_name 
    FROM %I 
    WHERE hub_name IS NOT NULL 
    ORDER BY hub_name
  ', table_name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RPC function to get distinct employees by hub
CREATE OR REPLACE FUNCTION get_distinct_employees(table_name text, selected_hub text DEFAULT NULL)
RETURNS TABLE(employee_name text) AS $$
BEGIN
  IF selected_hub IS NULL OR selected_hub = '' THEN
    RETURN QUERY EXECUTE format('
      SELECT DISTINCT employee_name 
      FROM %I 
      WHERE employee_name IS NOT NULL 
      ORDER BY employee_name
    ', table_name);
  ELSE
    RETURN QUERY EXECUTE format('
      SELECT DISTINCT employee_name 
      FROM %I 
      WHERE employee_name IS NOT NULL 
        AND hub_name = %L
      ORDER BY employee_name
    ', table_name, selected_hub);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RPC function to get distinct weeks
CREATE OR REPLACE FUNCTION get_distinct_weeks(table_name text)
RETURNS TABLE(week_label text) AS $$
BEGIN
  RETURN QUERY EXECUTE format('
    SELECT DISTINCT week_label 
    FROM %I 
    WHERE week_label IS NOT NULL 
    ORDER BY week_label
  ', table_name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
