'use client';

import { useState, useEffect } from 'react';
import { useFilterStore } from '@/lib/store';
import { supabase, BinRecord } from '@/lib/supabase';
import { Package, Users, Building2 } from 'lucide-react';

interface SummaryCardsProps {
  tableType: 'pending' | 'compensation';
}

export default function SummaryCards({ tableType }: SummaryCardsProps) {
  const { hubName, employeeName, searchText, weekLabel } = useFilterStore();
  const [stats, setStats] = useState({
    totalBins: 0,
    totalCustomers: 0,
    totalHubs: 0,
  });
  const [loading, setLoading] = useState(true);

  const tableName = tableType === 'pending' ? 'bin_pickup_pending' : 'bin_compensation';

  useEffect(() => {
    fetchStats();
  }, [hubName, employeeName, searchText, weekLabel, tableType]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      let query = supabase.from(tableName).select('*', { count: 'exact' });

      // Apply filters
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

        setStats({
          totalBins: count || 0,
          totalCustomers: uniqueCustomers.size,
          totalHubs: uniqueHubs.size,
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
    },
    {
      title: 'Khách hàng',
      value: stats.totalCustomers,
      icon: Users,
      color: 'bg-green-500',
    },
    {
      title: 'HUB',
      value: stats.totalHubs,
      icon: Building2,
      color: 'bg-purple-500',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const borderColor = card.color === 'bg-blue-500' ? '#3b82f6' : card.color === 'bg-green-500' ? '#22c55e' : '#a855f7';
        return (
          <div
            key={card.title}
            className="bg-white rounded-lg shadow-sm p-6"
            style={{ borderLeft: `4px solid ${borderColor}` }}
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
  );
}
