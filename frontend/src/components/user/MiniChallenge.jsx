import React from "react";
import { Blocks } from "lucide-react";

export default function MiniChallenge() {
  return (
    <div className="mt-12 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
      {/* Cột trái: Thông tin thử thách */}
      <div className="flex-1 w-full">
        <div className="mb-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md uppercase tracking-wide">
            <Blocks className="w-3 h-3" />
            KHỐI GHÉP CHỮ TƯƠNG TÁC • 한글 조합
          </span>
        </div>

        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
          Thử thách ghép âm Hangeul nhanh hôm nay
        </h3>

        <p className="text-sm text-gray-500">
          Ghép các phụ âm và nguyên âm để hoàn thiện từ vựng:{" "}
          <span className="font-bold text-emerald-800">"Hàn Quốc" (한국)</span>
        </p>
      </div>

      {/* Cột phải: Khu vực thao tác */}
      <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto justify-between md:justify-end">
        {/* Các khối chữ (Blocks) */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Khối đã điền */}
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl border-2 border-emerald-500 bg-emerald-50 flex items-center justify-center shadow-sm cursor-pointer hover:bg-emerald-100 transition-colors">
            <span className="text-2xl md:text-3xl font-black text-emerald-800">
              한
            </span>
          </div>

          <span className="text-gray-300 font-bold text-xl">+</span>

          {/* Khối trống / Đang chờ điền */}
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 transition-all group">
            <span className="text-2xl md:text-3xl font-black text-gray-300 group-hover:text-emerald-400">
              국
            </span>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="flex flex-col items-center gap-1.5">
          <button className="bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-bold px-6 py-3 rounded-xl transition-colors shadow-sm">
            Kiểm tra
          </button>
          <span className="text-[10px] font-medium text-gray-400">
            Hoàn thành <span className="text-amber-500 font-bold">+15 XP</span>
          </span>
        </div>
      </div>
    </div>
  );
}
