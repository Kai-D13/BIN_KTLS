'use client';

import { useState, useEffect } from 'react';
import { useFilterStore } from '@/lib/store';
import { supabase, BinRecord } from '@/lib/supabase';
import { exportToExcel } from '@/lib/excel-parser';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';
import Toast from './Toast';

interface DataTableProps {
  tableType: 'pending' | 'compensation';
}

export default function DataTable({ tableType }: DataTableProps) {
  const { hubName, employeeName, searchText, weekLabel, status } = useFilterStore();
  const [data, setData] = useState<BinRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const rowsPerPage = 50;

  const tableName = tableType === 'pending' ? 'bin_pickup_pending' : 'bin_compensation';

  useEffect(() => {
    fetchData();
  }, [hubName, employeeName, searchText, weekLabel, status, tableType, currentPage]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let query = supabase.from(tableName).select('*', { count: 'exact' });

      // Apply filters
      if (status) {
        query = query.eq('status', status);
      }
      if (weekLabel) {
        query = query.eq('week_label', weekLabel);
      }
      if (hubName) {
        query = query.eq('hub_name', hubName);
      }
      if (employeeName) {
        query = query.eq('employee_name', employeeName);
      }
      if (searchText) {
        query = query.or(
          `bin_code.ilike.%${searchText}%,cust_name.ilike.%${searchText}%,reference_code_of_so.ilike.%${searchText}%`
        );
      }

      // Pagination
      const from = (currentPage - 1) * rowsPerPage;
      const to = from + rowsPerPage - 1;
      query = query.range(from, to).order('created_at', { ascending: false });

      const { data: fetchedData, error, count } = await query;

      if (error) throw error;

      setData(fetchedData || []);
      setTotalRecords(count || 0);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      let query = supabase.from(tableName).select('*');

      if (status) query = query.eq('status', status);
      if (weekLabel) query = query.eq('week_label', weekLabel);
      if (hubName) query = query.eq('hub_name', hubName);
      if (employeeName) query = query.eq('employee_name', employeeName);
      if (searchText) {
        query = query.or(
          `bin_code.ilike.%${searchText}%,cust_name.ilike.%${searchText}%,reference_code_of_so.ilike.%${searchText}%`
        );
      }

      const { data: allData } = await query;
      if (allData) {
        exportToExcel(allData, `bin_recovery_${tableType}_${new Date().toISOString().split('T')[0]}.xlsx`);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const totalPages = Math.ceil(totalRecords / rowsPerPage);

  const updateStatus = async (recordId: string, newStatus: 'pending' | 'picked_up' | 'returned') => {
    setUpdatingStatus(recordId);
    try {
      const { error } = await supabase
        .from(tableName)
        .update({ status: newStatus })
        .eq('id', recordId);

      if (error) throw error;

      // Optimistic update
      setData(prevData => 
        prevData.map(record => 
          record.id === recordId ? { ...record, status: newStatus } : record
        )
      );

      // Success feedback
      const statusLabel = newStatus === 'pending' ? '🔴 Chưa lấy' : newStatus === 'picked_up' ? '🟡 Đã lấy' : '🟢 Đã trả kho';
      setToast({ message: `✓ Cập nhật thành công: ${statusLabel}`, type: 'success' });
      
      // Clear loading state
      setTimeout(() => {
        setUpdatingStatus(null);
      }, 500);

      // Refresh data sau 600ms để đồng bộ với server và cập nhật summary cards
      setTimeout(() => {
        fetchData();
      }, 600);
    } catch (error) {
      console.error('Error updating status:', error);
      setUpdatingStatus(null);
      setToast({ message: '❌ Không thể cập nhật. Vui lòng thử lại.', type: 'error' });
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'pending': return 'text-red-600 bg-red-50';
      case 'picked_up': return 'text-yellow-600 bg-yellow-50';
      case 'returned': return 'text-green-600 bg-green-50';
      default: return 'text-red-600 bg-red-50';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'pending': return '🔴 Chưa lấy';
      case 'picked_up': return '🟡 Đã lấy';
      case 'returned': return '🟢 Đã trả kho';
      default: return '🔴 Chưa lấy';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 sm:p-6 border-b">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-gray-800">📋 Danh sách Mã BIN</h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Hiển thị {data.length} / {totalRecords.toLocaleString()} bản ghi
          </p>
        </div>
        <button
          onClick={handleExport}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
        >
          <Download className="w-4 h-4" />
          <span>Export Excel</span>
        </button>
      </div>

      {/* Table - Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Trạng thái</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Mã BIN</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">HUB</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Mã Thu Hồi</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Mã Đơn Hàng</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Khách hàng</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Địa chỉ</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Phường/Xã</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Quận/Huyện</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                  Không tìm thấy dữ liệu
                </td>
              </tr>
            ) : (
              data.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    {updatingStatus === record.id ? (
                      <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-md bg-indigo-50 text-indigo-600 font-medium">
                        <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Đang lưu...
                      </div>
                    ) : (
                      <select
                        value={record.status || 'pending'}
                        onChange={(e) => updateStatus(record.id, e.target.value as 'pending' | 'picked_up' | 'returned')}
                        disabled={updatingStatus === record.id}
                        className={`text-xs px-2 py-1.5 rounded-md border-0 font-medium cursor-pointer transition-all ${getStatusColor(record.status)} hover:shadow-md`}
                      >
                        <option value="pending">🔴 Chưa lấy</option>
                        <option value="picked_up">🟡 Đã lấy</option>
                        <option value="returned">🟢 Đã trả kho</option>
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-indigo-600">{record.bin_code}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{record.hub_name || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{record.ma_don || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{record.reference_code_of_so || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{record.cust_name || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">{record.cust_address || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{record.cust_ward || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{record.cust_district || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Card View - Mobile */}
      <div className="md:hidden divide-y divide-gray-200">
        {data.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Không tìm thấy dữ liệu
          </div>
        ) : (
          data.map((record) => (
            <div key={record.id} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium text-indigo-600">{record.bin_code}</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">{record.hub_name}</span>
              </div>
              <div className="space-y-1 text-sm mb-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Mã Thu Hồi:</span>
                  <span className="text-gray-700 truncate ml-2">{record.ma_don || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Mã Đơn Hàng:</span>
                  <span className="text-gray-700 truncate ml-2">{record.reference_code_of_so || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Khách hàng:</span>
                  <span className="text-gray-700 font-medium truncate ml-2">{record.cust_name || '-'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500">Địa chỉ:</span>
                  <span className="text-gray-700 text-xs">{record.cust_address || '-'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">{record.cust_ward || '-'}</span>
                  <span className="text-gray-500">{record.cust_district || '-'}</span>
                </div>
              </div>
              {/* Status buttons for mobile */}
              <div className="flex gap-2">
                <button
                  onClick={() => updateStatus(record.id, 'pending')}
                  disabled={updatingStatus === record.id}
                  className={`flex-1 py-2.5 px-3 text-xs rounded-md font-medium transition-all duration-200 ${
                    updatingStatus === record.id 
                      ? 'opacity-50 cursor-wait' 
                      : record.status === 'pending' || !record.status 
                        ? 'bg-red-600 text-white shadow-md scale-105' 
                        : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                  }`}
                >
                  {updatingStatus === record.id && (record.status === 'pending' || !record.status) ? (
                    <span className="flex items-center justify-center gap-1">
                      <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang lưu...
                    </span>
                  ) : (
                    <>🔴 Chưa lấy</>
                  )}
                </button>
                <button
                  onClick={() => updateStatus(record.id, 'picked_up')}
                  disabled={updatingStatus === record.id}
                  className={`flex-1 py-2.5 px-3 text-xs rounded-md font-medium transition-all duration-200 ${
                    updatingStatus === record.id 
                      ? 'opacity-50 cursor-wait' 
                      : record.status === 'picked_up' 
                        ? 'bg-yellow-600 text-white shadow-md scale-105' 
                        : 'bg-yellow-50 text-yellow-600 border border-yellow-200 hover:bg-yellow-100'
                  }`}
                >
                  {updatingStatus === record.id && record.status === 'picked_up' ? (
                    <span className="flex items-center justify-center gap-1">
                      <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang lưu...
                    </span>
                  ) : (
                    <>🟡 Đã lấy</>
                  )}
                </button>
                <button
                  onClick={() => updateStatus(record.id, 'returned')}
                  disabled={updatingStatus === record.id}
                  className={`flex-1 py-2.5 px-3 text-xs rounded-md font-medium transition-all duration-200 ${
                    updatingStatus === record.id 
                      ? 'opacity-50 cursor-wait' 
                      : record.status === 'returned' 
                        ? 'bg-green-600 text-white shadow-md scale-105' 
                        : 'bg-green-50 text-green-600 border border-green-200 hover:bg-green-100'
                  }`}
                >
                  {updatingStatus === record.id && record.status === 'returned' ? (
                    <span className="flex items-center justify-center gap-1">
                      <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang lưu...
                    </span>
                  ) : (
                    <>🟢 Đã trả kho</>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t">
          <div className="text-xs sm:text-sm text-gray-600">
            Trang {currentPage} / {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Trước</span>
            </button>
            <div className="flex items-center px-3 py-2 border rounded-lg bg-white text-sm">
              {currentPage} / {totalPages}
            </div>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <span className="hidden sm:inline">Sau</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
