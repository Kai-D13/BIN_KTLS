import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface BinRecord {
  id?: string;
  hub_name: string | null;
  han_thu_hoi: string | null;
  ma_don: string | null;
  ngay_phat_sinh_bin: string | null;
  bin_code: string;
  bin_type: string | null;
  reference_code: string | null;
  reference_code_of_so: string | null;
  cust_name: string | null;
  cust_address: string | null;
  cust_ward: string | null;
  cust_district: string | null;
  cust_province: string | null;
  employee_id: number | null;
  employee_name: string | null;
  week_label: string;  // "Tuần 1 - Tháng 11"
  status?: 'pending' | 'picked_up' | 'returned';  // Chưa lấy, Đã lấy, Đã trả kho
  import_date?: string;
  created_at?: string;
}

export interface ImportHistory {
  id?: string;
  file_name: string;
  file_type: 'pending' | 'compensation';
  week_label: string;  // "Tuần 1 - Tháng 11"
  total_rows: number;
  success_rows: number;
  failed_rows: number;
  uploaded_at?: string;
}
