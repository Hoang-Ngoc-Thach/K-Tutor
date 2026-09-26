import React from "react";
import { RotateCcw, CheckCircle2, CheckCircle } from "lucide-react";

export default function StudyActions() {
  return (
    <div className="w-full max-w-3xl mx-auto mt-2 flex flex-col items-center">
      <div className="flex items-center justify-center gap-4 md:gap-6 w-full mb-6">
        <button className="flex-1 max-w-[140px] flex flex-col items-center justify-center gap-1.5 py-4 px-2 rounded-2xl bg-[#FFF1F2] hover:bg-rose-100 transition-colors border border-rose-50 shadow-sm group">
          <RotateCcw className="w-6 h-6 text-rose-400 mb-1 group-hover:-rotate-45 transition-transform duration-300" />
          <span className="text-sm font-bold text-gray-800">Chưa thuộc</span>
          <span className="text-[11px] font-medium text-gray-500">
            Ôn lại <strong className="text-gray-700">[1]</strong>
          </span>
        </button>

        <button className="flex-1 max-w-[140px] flex flex-col items-center justify-center gap-1.5 py-4 px-2 rounded-2xl bg-emerald-800 hover:bg-emerald-900 transition-colors shadow-md shadow-emerald-900/20 group">
          <CheckCircle className="w-6 h-6 text-white mb-1 group-hover:scale-110 transition-transform duration-300" />
          <span className="text-sm font-bold text-white">Đã thuộc</span>
          <span className="text-[11px] font-medium text-emerald-100/80">
            7 ngày <strong className="text-white">[3]</strong>
          </span>
        </button>
      </div>

      {/* Ghi chú phím tắt thao tác nhanh */}
      <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-[11px] font-medium text-gray-400">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-gray-600">Space</span>
          <span>Lật thẻ</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-gray-300"></div>

        <div className="flex items-center gap-1.5">
          <span className="font-bold text-gray-600">A</span>
          <span>Nghe âm thanh Seoul</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-gray-300"></div>

        <div className="flex items-center gap-1.5">
          <span className="font-bold text-gray-600">← / →</span>
          <span>Chuyển thẻ</span>
        </div>
      </div>
    </div>
  );
}
