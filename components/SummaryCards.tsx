'use client';

import { useState, useEffect } from 'react';
import { useFilterStore } from '@/lib/store';
import { supabase, BinRecord } from '@/lib/supabase';
import { Package, Users, Building2 } from 'lucide-react';

interface SummaryCardsProps {
  tableType: 'pending' | 'compensation';
}

export default function SummaryCards({ tableType }: SummaryCardsProps) {
  const { hubName, employeeName, searchText, weekLabel, status } = useFilterStore();
  const [stats, setStats] = useState({
    totalBins: 0,
    totalCustomers: 0,
    totalHubs: 0,
    pendingCount: 0,
    pickedUpCount: 0,
    returnedCount: 0,
  });
  const [loading, setLoading] = useState(true);

  const tableName = tableType === 'pending' ? 'bin_pickup_pending' : 'bin_compensation';

  useEffect(() => {
    fetchStats();
  }, [hubName, employeeName, searchText, weekLabel, status, tableType]);

  const fetchStats = async () => {
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

      const { data, error, count } = await query;

      if (error) throw error;

      if (data) {
        const uniqueCustomers = new Set(data.map((row: BinRecord) => row.cust_name).filter(Boolean));
        const uniqueHubs = new Set(data.map((row: BinRecord) => row.hub_name).filter(Boolean));

        const pendingCount = data.filter(row => row.status === 'pending' || !row.status).length;
        const pickedUpCount = data.filter(row => row.status === 'picked_up').length;
        const returnedCount = data.filter(row => row.status === 'returned').length;

        setStats({
          totalBins: count || 0,
          totalCustomers: uniqueCustomers.size,
          totalHubs: uniqueHubs.size,
          pendingCount,
          pickedUpCount,
          returnedCount,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      title: 'Tổng Mã BIN',
      value: stats.totalBins,
      icon: Package,
      color: 'bg-blue-500',
      borderColor: 'border-l-blue-500',
    },
    {
      title: 'Khách hàng',
      value: stats.totalCustomers,
      icon: Users,
      color: 'bg-green-500',
      borderColor: 'border-l-green-500',
    },
    {
      title: 'HUB',
      value: stats.totalHubs,
      icon: Building2,
      color: 'bg-purple-500',
      borderColor: 'border-l-purple-500',
    },
  ];

  const progressPercentage = stats.totalBins > 0 
    ? Math.round(((stats.pickedUpCount + stats.returnedCount) / stats.totalBins) * 100)
    : 0;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Original 3 cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={`bg-white rounded-lg shadow-sm p-6 border-l-4 ${card.borderColor}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-800">{card.value.toLocaleString()}</p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Status progress cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Pending */}
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-l-red-500">
          <p className="text-xs font-medium text-gray-600 mb-1">🔴 Chưa lấy</p>
          <p className="text-2xl font-bold text-red-600">{stats.pendingCount.toLocaleString()}</p>
        </div>

        {/* Picked Up */}
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-l-yellow-500">
          <p className="text-xs font-medium text-gray-600 mb-1">🟡 Đã lấy</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pickedUpCount.toLocaleString()}</p>
        </div>

        {/* Returned */}
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-l-green-500">
          <p className="text-xs font-medium text-gray-600 mb-1">🟢 Đã trả kho</p>
          <p className="text-2xl font-bold text-green-600">{stats.returnedCount.toLocaleString()}</p>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-l-indigo-500">
          <p className="text-xs font-medium text-gray-600 mb-2">📊 Tiến độ</p>
          <p className="text-2xl font-bold text-indigo-600 mb-2">{progressPercentage}%</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
