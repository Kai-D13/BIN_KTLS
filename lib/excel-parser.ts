import * as XLSX from 'xlsx';
import { BinRecord } from './supabase';

export interface ParsedExcelData {
  data: BinRecord[];
  errors: string[];
}

export function getSheetNames(file: File): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        resolve(workbook.SheetNames);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsBinaryString(file);
  });
}

export function parseExcelFile(
  file: File,
  weekLabel: string,
  sheetName?: string
): Promise<ParsedExcelData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const selectedSheet = sheetName || workbook.SheetNames[0];
        const worksheet = workbook.Sheets[selectedSheet];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const parsedData: BinRecord[] = [];
        const errors: string[] = [];

        jsonData.forEach((row: any, index: number) => {
          try {
            // Skip rows without bin_code
            if (!row.bin_code) {
              return;
            }

            const record: BinRecord = {
              hub_name: row.HUB_NAME || null,
              han_thu_hoi: row['HẠN THU HỒI'] ? new Date(row['HẠN THU HỒI']).toISOString() : null,
              ma_don: row['MÃ ĐƠN'] || null,
              ngay_phat_sinh_bin: row['NGÀY PHÁT SINH BIN'] ? new Date(row['NGÀY PHÁT SINH BIN']).toISOString() : null,
              bin_code: row.bin_code,
              bin_type: row.bin_type || null,
              reference_code: row.reference_code || null,
              reference_code_of_so: row.reference_code_of_so || null,
              cust_name: row.cust_name || null,
              cust_address: row.cust_address || null,
              cust_ward: row.cust_ward || null,
              cust_district: row.cust_district || null,
              cust_province: row.cust_province || null,
              employee_id: row.employee_id ? Number(row.employee_id) : null,
              employee_name: row.employee_name || null,
              week_label: weekLabel,
            };

            parsedData.push(record);
          } catch (error) {
            errors.push(`Row ${index + 2}: ${error}`);
          }
        });

        resolve({ data: parsedData, errors });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsBinaryString(file);
  });
}

export function exportToExcel(data: BinRecord[], filename: string) {
  const worksheet = XLSX.utils.json_to_sheet(data.map(record => ({
    'BIN Code': record.bin_code,
    'HUB Name': record.hub_name,
    'Reference Code': record.reference_code,
    'Reference Code OF SO': record.reference_code_of_so,
    'Customer Name': record.cust_name,
    'Address': record.cust_address,
    'Ward': record.cust_ward,
    'District': record.cust_district,
    'Province': record.cust_province,
    'Employee ID': record.employee_id,
    'Employee Name': record.employee_name,
  })));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  XLSX.writeFile(workbook, filename);
}
