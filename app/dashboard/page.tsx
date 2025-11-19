'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import AdminUpload from '@/components/AdminUpload';
import DeleteData from '@/components/DeleteData';
import DataTable from '@/components/DataTable';
import FilterPanel from '@/components/FilterPanel';
import SummaryCards from '@/components/SummaryCards';
import { LogOut, Upload, Table } from 'lucide-react';

export default function DashboardPage() {
  const { isAuthenticated, isAdmin, logout } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'pending' | 'compensation'>('pending');
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                📊 BIN Recovery Management System
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Hệ thống quản lý thu hồi BIN - Miền Tây
              </p>
            </div>
            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              {isAdmin && (
                <button
                  onClick={() => setShowAdminPanel(!showAdminPanel)}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition text-sm ${
                    showAdminPanel
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {showAdminPanel ? <Table className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                  <span className="hidden sm:inline">{showAdminPanel ? 'View Mode' : 'Admin Mode'}</span>
                  <span className="sm:hidden">{showAdminPanel ? 'View' : 'Admin'}</span>
                </button>
              )}
              <button
                onClick={handleLogout}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Đăng xuất</span>
                <span className="sm:hidden">Thoát</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
          <div className="border-b overflow-x-auto">
            <nav className="flex -mb-px min-w-full">
              <button
                onClick={() => setActiveTab('pending')}
                className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium border-b-2 transition whitespace-nowrap ${
                  activeTab === 'pending'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📋 Danh sách cần thu hồi
              </button>
              <button
                onClick={() => setActiveTab('compensation')}
                className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium border-b-2 transition whitespace-nowrap ${
                  activeTab === 'compensation'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                💰 Chốt đền bù
              </button>
            </nav>
          </div>

          {/* Admin Upload Panel */}
          {showAdminPanel && isAdmin && (
            <div className="p-4 sm:p-6 bg-blue-50 border-b space-y-6">
              <AdminUpload tableType={activeTab} />
              <DeleteData tableType={activeTab} />
            </div>
          )}
        </div>

        {/* Filter Panel */}
        {!showAdminPanel && (
          <div className="mb-4 sm:mb-6">
            <FilterPanel tableType={activeTab} />
          </div>
        )}

        {/* Summary Cards */}
        {!showAdminPanel && (
          <div className="mb-4 sm:mb-6">
            <SummaryCards tableType={activeTab} />
          </div>
        )}

        {/* Data Table */}
        {!showAdminPanel && (
          <div>
            <DataTable tableType={activeTab} />
          </div>
        )}
      </main>
    </div>
  );
}
