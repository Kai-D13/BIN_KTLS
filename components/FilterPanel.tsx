'use client';

import { useState, useEffect } from 'react';
import { useFilterStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { Search, Filter, X } from 'lucide-react';

interface FilterPanelProps {
  tableType: 'pending' | 'compensation';
}

export default function FilterPanel({ tableType }: FilterPanelProps) {
  const { hubName, employeeName, searchText, setHubName, setEmployeeName, setSearchText, resetFilters } = useFilterStore();
  const [hubs, setHubs] = useState<string[]>([]);
  const [employees, setEmployees] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const tableName = tableType === 'pending' ? 'bin_pickup_pending' : 'bin_compensation';

  useEffect(() => {
    fetchHubs();
  }, [tableType]);

  // Fetch employees when hub changes
  useEffect(() => {
    fetchEmployees();
  }, [hubName, tableType]);

  const fetchHubs = async () => {
    setLoading(true);
    try {
      // Fetch unique hubs
      const { data: hubsData } = await supabase
        .from(tableName)
        .select('hub_name')
        .not('hub_name', 'is', null);

      if (hubsData) {
        const uniqueHubs = Array.from(new Set(hubsData.map((row) => row.hub_name))).sort();
        setHubs(uniqueHubs as string[]);
      }
    } catch (error) {
      console.error('Error fetching hubs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      // Build query for employees
      let query = supabase
        .from(tableName)
        .select('employee_name')
        .not('employee_name', 'is', null);

      // If hub is selected, filter employees by that hub
      if (hubName) {
        query = query.eq('hub_name', hubName);
      }

      const { data: employeesData } = await query;

      if (employeesData) {
        const uniqueEmployees = Array.from(new Set(employeesData.map((row) => row.employee_name))).sort();
        setEmployees(uniqueEmployees as string[]);
        
        // Reset employee selection if current employee is not in the filtered list
        if (employeeName && !uniqueEmployees.includes(employeeName)) {
          setEmployeeName('');
        }
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
        <h2 className="text-base sm:text-lg font-semibold text-gray-800">Bộ lọc</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* HUB Filter */}
        <div>
          <label htmlFor="hub-select" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            🏢 HUB Name
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
      {(hubName || employeeName || searchText) && (
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
