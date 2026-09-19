import React from 'react';
import { BarChart2, BookOpen, Users, LogOut } from 'lucide-react';

export default function AdminSidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-100 min-h-screen p-4 flex flex-col justify-between shrink-0">
      <div>
        {/* Brand Logo */}
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="w-8 h-8 bg-emerald-800 text-white rounded-lg flex items-center justify-center font-bold">
            🎓
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-emerald-950 text-base">K-Tutor</span>
            </div>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 font-semibold px-2 py-0.5 rounded-md">
              Quản trị học viện
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-emerald-50 text-emerald-800 font-semibold text-sm"
          >
            <BarChart2 className="w-4 h-4 text-emerald-700" />
            <span>Thống kê</span>
          </a>

          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 text-sm font-medium transition"
          >
            <BookOpen className="w-4 h-4 text-gray-400" />
            <span>Nội dung học</span>
          </a>

          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 text-sm font-medium transition"
          >
            <Users className="w-4 h-4 text-gray-400" />
            <span>Người dùng</span>
          </a>
        </nav>
      </div>

      {/* User Profile Footer */}
      <div className="bg-gray-50 p-3 rounded-2xl flex items-center justify-between border border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-emerald-800 text-white font-bold text-xs rounded-full flex items-center justify-center">
            AD
          </div>
          <div>
            <h5 className="text-xs font-bold text-gray-800 leading-tight">Nguyễn Quản Trị</h5>
            <p className="text-[10px] text-gray-500">Quản trị viên</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600 p-1">
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}