// src/components/topiclist-user/TopicHeader.jsx
import React from "react";
import { Search, Flame, Target } from "lucide-react";

export default function TopicHeader() {
  const filters = [
    { label: "Tất cả (24)", active: true },
    { label: "Đời sống hàng ngày", active: false },
    { label: "Ẩm thực & Mua sắm", active: false },
    { label: "Du lịch & Sân bay", active: false },
    { label: "Công sở & Giao tiếp", active: false },
    { label: "K-Drama & Giải trí", active: false },
    { label: "TOPIK I-II", active: false },
  ];

  return (
    <div className="flex flex-col gap-6 mb-8">
      {/* Tiêu đề & Thống kê */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-emerald-600 font-semibold text-sm bg-emerald-50 px-3 py-1 rounded-full mb-3 inline-block">
            Khóa Từ vựng Giao tiếp
          </span>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Chủ đề Từ vựng
          </h1>
          <p className="text-gray-500 text-sm max-w-xl">
            Khám phá hơn 1.500 từ vựng thực chiến qua ngữ cảnh giao tiếp trực
            quan, kích hoạt trí nhớ dài hạn cùng nhịp phản xạ chuẩn ngữ âm Hàn
            Quốc.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 px-3">
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">
                14 Ngày streak
              </p>
              <p className="text-sm font-bold text-gray-900">420 từ đã thuộc</p>
            </div>
          </div>
          <div className="w-px h-10 bg-gray-100"></div>
          <div className="flex items-center gap-3 px-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Chủ đề đã học</p>
              <p className="text-sm font-bold text-gray-900">12 / 24</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tìm kiếm & Bộ lọc */}
      <div className="flex flex-col gap-4">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors"
            placeholder="Tìm nhanh chủ đề (VD: Trái cây, Sân bay...)"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {filters.map((filter, index) => (
            <button
              key={index}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter.active
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
