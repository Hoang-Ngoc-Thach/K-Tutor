import React from "react";
import { ArrowLeft, Volume2, Zap, Flame } from "lucide-react";

export default function WordHeader() {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 pt-4">
      <div className="flex items-center gap-3 w-full md:w-auto">
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
          📖 Chủ đề: Hoa quả & Đời sống
        </span>
        <span className="text-sm font-bold text-gray-900 ml-2">
          Từ vựng mới
        </span>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end text-xs font-bold">
        <span className="text-gray-500">1/5 (20%)</span>
        <button className="w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors">
          <Volume2 className="w-3.5 h-3.5" />
        </button>
        <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
          <Zap className="w-3.5 h-3.5 fill-current" /> +145 XP
        </div>
        <div className="flex items-center gap-1 text-gray-600 border border-gray-200 px-2.5 py-1 rounded-full">
          <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" /> 14
          Ngày
        </div>
      </div>
    </div>
  );
}
