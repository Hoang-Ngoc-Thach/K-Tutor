import React from 'react';
import AdminSidebar from '../../layout/admin/AdminSidebar';
import StatCards from '../../components/admin/StatCards';
import TopTopics from '../../components/admin/TopTopics';
import { Bell, Download, Filter } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="flex bg-gray-50/60 min-h-screen">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-gray-900">Thống kê tổng quan</h1>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Realtime
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Chào mừng trở lại, xem hiệu suất học tập và tăng trưởng của K-Tutor hôm nay.
            </p>
          </div>

          {/* Action Filters & Buttons */}
          <div className="flex items-center gap-2">
            <div className="bg-white border border-gray-200 rounded-xl p-1 flex text-xs font-medium text-gray-600">
              <button className="px-3 py-1.5 bg-gray-100 rounded-lg text-gray-900 font-semibold">
                Hôm nay
              </button>
              <button className="px-3 py-1.5 hover:text-gray-900">7 ngày qua</button>
              <button className="px-3 py-1.5 hover:text-gray-900">30 ngày qua</button>
            </div>

            <button className="bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 flex items-center gap-1.5 hover:bg-gray-50">
              <Filter className="w-3.5 h-3.5" /> Lọc ngày
            </button>

            <button className="bg-white border border-gray-200 p-2 rounded-xl text-gray-600 hover:bg-gray-50 relative">
              <Bell className="w-4 h-4" />
            </button>

            <button className="bg-emerald-900 hover:bg-emerald-950 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition">
              <Download className="w-3.5 h-3.5" /> Xuất báo cáo
            </button>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="space-y-6">
          <StatCards />
          <TopTopics />
        </div>
      </main>
    </div>
  );
}