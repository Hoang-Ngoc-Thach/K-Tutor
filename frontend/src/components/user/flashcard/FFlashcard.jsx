import React from "react";
import { Volume2, Bookmark, RotateCw } from "lucide-react";

export default function FFlashcard() {
  return (
    <div className="absolute inset-0 w-full h-full bg-white rounded-[2rem] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 [backface-visibility:hidden] flex flex-col">
      {/* Hàng trên cùng: Tags và Công cụ */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex gap-2">
          <span className="text-[10px] font-bold bg-gray-50 text-gray-600 px-2.5 py-1 rounded-md border border-gray-100">
            Tính từ 형용사
          </span>
        </div>

        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors">
            <Volume2 className="w-4 h-4" />
          </button>
          <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors">
            <Bookmark className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Khu vực Từ vựng trung tâm */}
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <h2 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight">
          행복하다
        </h2>
        <p className="text-sm font-medium text-gray-400">[haeng-bok-ha-da]</p>
      </div>

      {/* Gợi ý lật thẻ */}
      <div className="text-center mt-auto text-gray-300 text-xs flex items-center justify-center gap-1.5">
        <RotateCw className="w-3 h-3" /> Nhấn Space hoặc click để lật thẻ
      </div>
    </div>
  );
}
