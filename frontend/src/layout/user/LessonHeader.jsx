import React from "react";
import { X, Heart, Zap, User } from "lucide-react";

export default function LessonHeader() {
  return (
    <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4 md:gap-8">
        {/* Nút thoát */}
        <button className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors shrink-0">
          <X className="w-5 h-5" />
          <span className="font-black text-emerald-900 hidden md:block">
            K-Tutor
          </span>
        </button>

        {/* Thanh tiến độ */}
        <div className="flex-1 max-w-xl bg-gray-100 h-2.5 rounded-full overflow-hidden">
          <div className="bg-emerald-500 h-full rounded-full w-[20%] transition-all duration-500"></div>
        </div>

        {/* Các chỉ số */}
        <div className="flex items-center gap-4 shrink-0 text-sm font-bold text-gray-600">
          <div className="flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-gray-400" />
            <span>5</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-emerald-500 fill-emerald-500" />
            <span>120 XP</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
            <User className="w-4 h-4 text-gray-500" />
          </div>
        </div>
      </div>
    </header>
  );
}
