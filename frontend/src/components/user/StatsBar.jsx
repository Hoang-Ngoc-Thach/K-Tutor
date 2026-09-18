import React from "react";
import { Timer, BookOpen, Mic, Award } from "lucide-react";

export default function StatsBar() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
      {/* Thông số 1: Mục tiêu thời gian */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
          <Timer className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <div className="text-sm font-extrabold text-gray-900">
            25{" "}
            <span className="text-gray-500 font-medium text-xs">/ 30 phút</span>
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5">
            Mục tiêu học hôm nay
          </div>
        </div>
      </div>

      {/* Đường phân cách (Chỉ hiện trên desktop) */}
      <div className="hidden md:block w-px h-10 bg-gray-100"></div>

      {/* Thông số 2: Từ vựng */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <div className="text-sm font-extrabold text-gray-900">
            18{" "}
            <span className="text-gray-500 font-medium text-xs">từ vựng</span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[11px] text-gray-500">Đã thuộc hôm nay</span>
            <span className="text-[9px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-md">
              AI
            </span>
          </div>
        </div>
      </div>

      {/* Đường phân cách */}
      <div className="hidden md:block w-px h-10 bg-gray-100"></div>

      {/* Thông số 3: Điểm phát âm */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
          <Mic className="w-5 h-5 text-rose-500" />
        </div>
        <div>
          <div className="text-sm font-extrabold text-gray-900">
            <span className="text-rose-600">94</span>{" "}
            <span className="text-gray-500 font-medium text-xs">/ 100</span>
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5">
            Điểm phát âm trung bình
          </div>
        </div>
      </div>

      {/* Đường phân cách */}
      <div className="hidden md:block w-px h-10 bg-gray-100"></div>

      {/* Thông số 4: Mục tiêu TOPIK */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
          <Award className="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <div className="text-sm font-extrabold text-gray-900 flex items-center gap-1.5">
            TOPIK I
            <span className="text-[10px] bg-emerald-100/80 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
              Level 2
            </span>
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5">
            Mục tiêu kỳ thi T10/2025
          </div>
        </div>
      </div>
    </div>
  );
}
