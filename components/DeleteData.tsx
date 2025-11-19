'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, Loader2, AlertTriangle } from 'lucide-react';

interface DeleteDataProps {
  tableType: 'pending' | 'compensation';
}

export default function DeleteData({ tableType }: DeleteDataProps) {
  const [weekNumber, setWeekNumber] = useState<number>(1);
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const tableName = tableType === 'pending' ? 'bin_pickup_pending' : 'bin_compensation';
  const tableLabel = tableType === 'pending' ? 'Danh sách cần thu hồi' : 'Chốt đền bù';

  const handleDelete = async () => {
    setDeleting(true);
    setResult(null);

    try {
      // Delete records for the selected week
      const { error, count } = await supabase
        .from(tableName)
        .delete({ count: 'exact' })
        .eq('week_number', weekNumber);

      if (error) {
        setResult({
          success: false,
          message: `Lỗi khi xóa: ${error.message}`,
        });
      } else {
        // Delete import history
        await supabase
          .from('import_history')
          .delete()
          .eq('file_type', tableType)
          .eq('week_number', weekNumber);

        setResult({
          success: true,
          message: `Đã xóa thành công ${count || 0} bản ghi của tuần ${weekNumber}`,
        });
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: `Lỗi: ${error.message}`,
      });
    } finally {
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Trash2 className="w-5 h-5 text-red-600" />
        <h3 className="font-semibold text-red-800">Xóa dữ liệu {tableLabel}</h3>
      </div>

      <div className="flex items-end gap-3">
        <div>
          <label htmlFor="delete-week" className="block text-sm font-medium text-gray-700 mb-2">
            Chọn tuần cần xóa
          </label>
          <select
            id="delete-week"
            value={weekNumber}
            onChange={(e) => setWeekNumber(Number(e.target.value))}
            disabled={deleting}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
          >
            {[1, 2, 3, 4].map((week) => (
              <option key={week} value={week}>
                Tuần {week}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setShowConfirm(true)}
          disabled={deleting}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
        >
          {deleting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Đang xóa...
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4" />
              Xóa dữ liệu
            </>
          )}
        </button>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-bold text-gray-900">Xác nhận xóa</h3>
            </div>
            <p className="text-gray-700 mb-6">
              Bạn có chắc chắn muốn xóa <strong>TOÀN BỘ</strong> dữ liệu của{' '}
              <strong className="text-red-600">Tuần {weekNumber}</strong> trong bảng{' '}
              <strong>{tableLabel}</strong>?
              <br />
              <br />
              <span className="text-red-600 font-semibold">
                ⚠️ Hành động này KHÔNG THỂ HOÀN TÁC!
              </span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Message */}
      {result && (
        <div
          className={`mt-4 p-3 rounded-lg ${
            result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {result.message}
        </div>
      )}
    </div>
  );
}
