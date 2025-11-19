'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Lock, Shield } from 'lucide-react';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loginMode, setLoginMode] = useState<'user' | 'admin'>('user');
  const { login, loginAsAdmin } = useAuthStore();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let success = false;
    if (loginMode === 'admin') {
      success = loginAsAdmin(password);
    } else {
      success = login(password);
    }
    
    if (success) {
      router.push('/dashboard');
    } else {
      setError('Mật khẩu không đúng. Vui lòng thử lại.');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className={`${loginMode === 'admin' ? 'bg-red-600' : 'bg-indigo-600'} p-4 rounded-full mb-4 transition-colors`}>
            {loginMode === 'admin' ? (
              <Shield className="w-8 h-8 text-white" />
            ) : (
              <Lock className="w-8 h-8 text-white" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            BIN Recovery System
          </h1>
          <p className="text-gray-600 text-center">
            {loginMode === 'admin' ? '🔐 Admin Login' : 'Hệ thống quản lý thu hồi BIN'}
          </p>
        </div>

        {/* Toggle Login Mode */}
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => {
              setLoginMode('user');
              setError('');
              setPassword('');
            }}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
              loginMode === 'user'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            👤 User
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMode('admin');
              setError('');
              setPassword('');
            }}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
              loginMode === 'admin'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🔐 Admin
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu {loginMode === 'admin' && '(Admin)'}
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              placeholder={loginMode === 'admin' ? 'Nhập mật khẩu admin' : 'Nhập mật khẩu'}
              autoFocus
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className={`w-full py-3 rounded-lg font-semibold transition duration-200 shadow-lg hover:shadow-xl ${
              loginMode === 'admin'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            Đăng nhập
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>© 2025 KTLS - Bin Recovery Management</p>
        </div>
      </div>
    </div>
  );
}
