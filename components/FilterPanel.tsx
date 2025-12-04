'use client';

import { useState, useEffect } from 'react';
import { useFilterStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { Search, Filter, X } from 'lucide-react';

interface FilterPanelProps {
  tableType: 'pending' | 'compensation';
}

export default function FilterPanel({ tableType }: FilterPanelProps) {
  const { hubName, employeeName, searchText, weekLabel, status, setHubName, setEmployeeName, setSearchText, setWeekLabel, setStatus, resetFilters } = useFilterStore();
  const [hubs, setHubs] = useState<string[]>([]);
  const [employees, setEmployees] = useState<string[]>([]);
  const [weeks, setWeeks] = useState<string[]>([]);
  const [statusCounts, setStatusCounts] = useState({ pending: 0, picked_up: 0, returned: 0 });
  const [loading, setLoading] = useState(true);

  const tableName = tableType === 'pending' ? 'bin_pickup_pending' : 'bin_compensation';

  useEffect(() => {
    fetchHubs();
    fetchWeeks();
    fetchStatusCounts();
  }, [tableType]);

  // Fetch employees when hub changes
  useEffect(() => {
    fetchEmployees();
  }, [hubName, tableType]);

  const fetchHubs = async () => {
    setLoading(true);
    try {
      // Dùng RPC function để lấy distinct hubs (hiệu quả hơn)
      const { data, error } = await supabase
        .rpc('get_distinct_hubs', { table_name: tableName });

      if (error) {
        console.error('RPC error, fallback to normal query:', error);
        // Fallback: nếu RPC chưa có, dùng query thông thường
        const { data: hubsData } = await supabase
          .from(tableName)
          .select('hub_name')
          .not('hub_name', 'is', null);
        
        if (hubsData) {
          const uniqueHubs = Array.from(new Set(hubsData.map((row) => row.hub_name))).sort();
          setHubs(uniqueHubs);
        }
      } else if (data) {
        setHubs(data.map((row: { hub_name: string }) => row.hub_name));
      }
    } catch (error) {
      console.error('Error fetching hubs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      // Dùng RPC function với hub filter
      const { data, error } = await supabase
        .rpc('get_distinct_employees', { 
          table_name: tableName,
          selected_hub: hubName || null
        });

      if (error) {
        console.error('RPC error, fallback to normal query:', error);
        // Fallback
        let query = supabase
          .from(tableName)
          .select('employee_name')
          .not('employee_name', 'is', null);

        if (hubName) {
          query = query.eq('hub_name', hubName);
        }

        const { data: employeesData } = await query;
        
        if (employeesData) {
          const uniqueEmployees = Array.from(new Set(employeesData.map((row) => row.employee_name))).sort();
          setEmployees(uniqueEmployees);
          
          if (employeeName && !uniqueEmployees.includes(employeeName)) {
            setEmployeeName('');
          }
        }
      } else if (data) {
        const uniqueEmployees = data.map((row: { employee_name: string }) => row.employee_name);
        setEmployees(uniqueEmployees);
        
        if (employeeName && !uniqueEmployees.includes(employeeName)) {
          setEmployeeName('');
        }
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchWeeks = async () => {
    try {
      // Dùng RPC function
      const { data, error } = await supabase
        .rpc('get_distinct_weeks', { table_name: tableName });

      if (error) {
        console.error('RPC error, fallback to normal query:', error);
        // Fallback
        const { data: weeksData } = await supabase
          .from(tableName)
          .select('week_label')
          .not('week_label', 'is', null);

        if (weeksData) {
          const uniqueWeeks = Array.from(new Set(weeksData.map((row) => row.week_label))).sort();
          setWeeks(uniqueWeeks);
        }
      } else if (data) {
        setWeeks(data.map((row: { week_label: string }) => row.week_label));
      }
    } catch (error) {
      console.error('Error fetching weeks:', error);
    }
  };

  const fetchStatusCounts = async () => {
    try {
      // Fetch counts cho từng status bằng count queries (không load data)
      const [pendingResult, pickedUpResult, returnedResult] = await Promise.all([
        supabase.from(tableName).select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from(tableName).select('*', { count: 'exact', head: true }).eq('status', 'picked_up'),
        supabase.from(tableName).select('*', { count: 'exact', head: true }).eq('status', 'returned'),
      ]);

      setStatusCounts({
        pending: pendingResult.count || 0,
        picked_up: pickedUpResult.count || 0,
        returned: returnedResult.count || 0,
      });
    } catch (error) {
      console.error('Error fetching status counts:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
        <h2 className="text-base sm:text-lg font-semibold text-gray-800">Bộ lọc</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Status Filter */}
        <div>
          <label htmlFor="status-select" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            📊 Trạng thái
          </label>
          <select
            id="status-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending">🔴 Chưa lấy ({statusCounts.pending})</option>
            <option value="picked_up">🟡 Đã lấy ({statusCounts.picked_up})</option>
            <option value="returned">🟢 Đã trả kho ({statusCounts.returned})</option>
          </select>
        </div>

        {/* Week Filter */}
        <div>
          <label htmlFor="week-select" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            📅 Tuần
          </label>
          <select
            id="week-select"
            value={weekLabel}
            onChange={(e) => setWeekLabel(e.target.value)}
            disabled={loading}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none disabled:bg-gray-100"
          >
            <option value="">Tất cả tuần</option>
            {weeks.map((week) => (
              <option key={week} value={week}>
                {week}
              </option>
            ))}
          </select>
        </div>

        {/* HUB Filter */}
        <div>
          <label htmlFor="hub-select" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            🏢 HUB
          </label>
          <select
            id="hub-select"
            value={hubName}
            onChange={(e) => setHubName(e.target.value)}
            disabled={loading}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none disabled:bg-gray-100"
          >
            <option value="">Tất cả HUB</option>
            {hubs.map((hub) => (
              <option key={hub} value={hub}>
                {hub}
              </option>
            ))}
          </select>
        </div>

        {/* Employee Filter */}
        <div>
          <label htmlFor="employee-select" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            👤 Nhân viên
          </label>
          <select
            id="employee-select"
            value={employeeName}
            onChange={(e) => setEmployeeName(e.target.value)}
            disabled={loading}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none disabled:bg-gray-100"
          >
            <option value="">Tất cả nhân viên</option>
            {employees.map((employee) => (
              <option key={employee} value={employee}>
                {employee}
              </option>
            ))}
          </select>
        </div>

        {/* Search Box */}
        <div className="sm:col-span-2 lg:col-span-1">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            🔍 Tìm kiếm
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Bin code, tên khách hàng..."
              className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
      </div>

      {/* Reset Button */}
      {(status || weekLabel || hubName || employeeName || searchText) && (
        <div className="mt-4">
          <button
            onClick={resetFilters}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition"
          >
            <X className="w-4 h-4" />
            Xóa bộ lọc
          </button>
        </div>
      )}
    </div>
  );
}
