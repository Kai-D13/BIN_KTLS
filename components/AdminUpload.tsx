'use client';

import { useState, useEffect } from 'react';
import { parseExcelFile, getSheetNames } from '@/lib/excel-parser';
import { supabase } from '@/lib/supabase';
import { Upload, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface AdminUploadProps {
  tableType: 'pending' | 'compensation';
}

// Generate week options (9 weeks)
const generateWeekOptions = () => {
  const options: { value: string; label: string }[] = [];
  const today = new Date();
  // Get current month and year
  const currentMonth = today.getMonth() + 1; // 1-12
  const currentYear = today.getFullYear();
  // Generate options for current month và 2 tháng tiếp theo
  for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
    const month = ((currentMonth - 1 + monthOffset) % 12) + 1;
    const year = currentYear + Math.floor((currentMonth - 1 + monthOffset) / 12);
    for (let week = 1; week <= 4; week++) {
      const label = `Tuần ${week} - Tháng ${month}`;
      options.push({ value: label, label });
    }
  }
  // Thêm cố định 4 tuần của tháng 2 năm 2026
  for (let week = 1; week <= 4; week++) {
    const label = `Tuần ${week} - Tháng 2 - 2026`;
    options.push({ value: label, label });
  }
  return options;
};

export default function AdminUpload({ tableType }: AdminUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [weekLabel, setWeekLabel] = useState<string>('');
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  const tableName = tableType === 'pending' ? 'bin_pickup_pending' : 'bin_compensation';
  const weekOptions = generateWeekOptions();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setResult(null);
      
      try {
        const sheets = await getSheetNames(selectedFile);
        setSheetNames(sheets);
        setSelectedSheet(sheets[0] || ''); // Auto-select first sheet
      } catch (error) {
        setResult({
          success: false,
          message: 'Không thể đọc danh sách sheet trong file',
        });
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setResult({
        success: false,
        message: 'Vui lòng chọn file Excel để upload',
      });
      return;
    }

    if (!weekLabel) {
      setResult({
        success: false,
        message: 'Vui lòng chọn tuần',
      });
      return;
    }

    setUploading(true);
    setResult(null);

    try {
      // Parse Excel file
      const { data, errors } = await parseExcelFile(file, weekLabel, selectedSheet);

      if (errors.length > 0) {
        setResult({
          success: false,
          message: `Có ${errors.length} lỗi khi parse file`,
          details: errors,
        });
        setUploading(false);
        return;
      }

      // Insert data into Supabase
      const { error: insertError } = await supabase
        .from(tableName)
        .insert(data);

      if (insertError) {
        setResult({
          success: false,
          message: 'Lỗi khi upload dữ liệu vào database',
          details: insertError.message,
        });
      } else {
        // Log import history
        await supabase.from('import_history').insert({
          file_name: file.name,
          file_type: tableType,
          week_label: weekLabel,
          total_rows: data.length,
          success_rows: data.length,
          failed_rows: 0,
        });

        setResult({
          success: true,
          message: `Upload thành công ${data.length} records vào ${weekLabel}`,
        });
        setFile(null);
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: 'Lỗi không xác định',
        details: error.message,
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
              📁 Chọn file Excel
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
            />
          </div>
        </div>

        {sheetNames.length > 0 && (
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label htmlFor="sheet-select" className="block text-sm font-medium text-gray-700 mb-2">
                📄 Chọn sheet
              </label>
              <select
                id="sheet-select"
                value={selectedSheet}
                onChange={(e) => setSelectedSheet(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              >
                {sheetNames.map((sheet) => (
                  <option key={sheet} value={sheet}>
                    {sheet}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label htmlFor="week-select" className="block text-sm font-medium text-gray-700 mb-2">
                📅 Chọn tuần
              </label>
          <select
            id="week-select"
            value={weekLabel}
            onChange={(e) => setWeekLabel(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          >
            <option value="">-- Chọn tuần --</option>
            {weekOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
            </select>
          </div>

          <div className="pt-7">
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang upload...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload File
                </>
              )}
            </button>
          </div>
        </div>
      )}
      </div>

      {file && (
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          File đã chọn: <span className="font-semibold">{file.name}</span> ({(file.size / 1024).toFixed(2)} KB)
        </div>
      )}

      {result && (
        <div
          className={`p-4 rounded-lg border ${
            result.success
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}
        >
          <div className="flex items-start gap-3">
            {result.success ? (
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
            )}
            <div className="flex-1">
              <p
                className={`font-semibold ${
                  result.success ? 'text-green-800' : 'text-red-800'
                }`}
              >
                {result.message}
              </p>
              {result.details && (
                <pre className="mt-2 text-xs overflow-auto max-h-40">
                  {JSON.stringify(result.details, null, 2)}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
