import React from 'react';
import { Users, BookOpen, Type } from 'lucide-react';

export default function StatCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Card 1: Tổng người dùng */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
            📈 +14.2%
          </span>
        </div>
        <p className="text-xs font-medium text-gray-500 mb-1">Tổng người dùng</p>
        <h3 className="text-2xl font-black text-gray-900 mb-4">24,850</h3>

        <div className="bg-gray-50/80 rounded-xl p-2.5 text-xs text-gray-600 flex justify-between">
          <div>
            <span className="text-gray-400">Giao tiếp</span>
            <p className="font-bold text-gray-800">15,320 <span className="text-[10px] font-normal text-gray-400">62%</span></p>
          </div>
          <div className="border-l border-gray-200 pl-3">
            <span className="text-gray-400">TOPIK</span>
            <p className="font-bold text-gray-800">9,530 <span className="text-[10px] font-normal text-gray-400">38%</span></p>
          </div>
        </div>
      </div>

      {/* Card 2: Tổng chủ đề */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
            ➕ +8 mới
          </span>
        </div>
        <p className="text-xs font-medium text-gray-500 mb-1">Tổng chủ đề</p>
        <h3 className="text-2xl font-black text-gray-900 mb-4">142</h3>

        <div className="bg-gray-50/80 rounded-xl p-2.5 text-xs space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">🟢 Sơ cấp & Đời sống</span>
            <span className="font-bold text-gray-800">86 bài</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">🟣 Trung cấp & TOPIK</span>
            <span className="font-bold text-gray-800">56 bài</span>
          </div>
        </div>
      </div>

      {/* Card 3: Tổng từ vựng */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Type className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
            🔄 +320 từ vựng mới
          </span>
        </div>
        <p className="text-xs font-medium text-gray-500 mb-1">Tổng từ vựng</p>
        <h3 className="text-2xl font-black text-gray-900 mb-4">12,480</h3>

        <div className="bg-gray-50/80 rounded-xl p-2.5 text-xs space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">🔊 Từ vựng có phát âm AI</span>
            <span className="font-bold text-emerald-700">100%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">📝 Kèm ví dụ mẫu</span>
            <span className="font-bold text-gray-800">11,800</span>
          </div>
        </div>
      </div>
    </div>
  );
}