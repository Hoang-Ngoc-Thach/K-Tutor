// src/components/topiclist-user/LeaderboardStrip.jsx
import React from "react";
import { Trophy, ChevronRight } from "lucide-react";

export default function LeaderboardStrip() {
  return (
    <div className="w-full bg-white border border-emerald-100 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 mt-8 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-50 rounded-xl flex items-center justify-center border border-emerald-200/50">
          <Trophy className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-gray-900 mb-0.5">
            Bảng vàng từ vựng K-Tutor tuần này
          </h4>
          <p className="text-xs text-gray-500">
            Hơn 4,230 học viên đã hoàn thành tối thiểu 3 chủ đề hôm nay.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex -space-x-3">
          <img
            className="w-8 h-8 rounded-full border-2 border-white object-cover"
            src="https://i.pravatar.cc/100?img=1"
            alt="User 1"
          />
          <img
            className="w-8 h-8 rounded-full border-2 border-white object-cover"
            src="https://i.pravatar.cc/100?img=5"
            alt="User 2"
          />
          <img
            className="w-8 h-8 rounded-full border-2 border-white object-cover"
            src="https://i.pravatar.cc/100?img=8"
            alt="User 3"
          />
          <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
            +99
          </div>
        </div>
        <span className="text-sm font-bold text-emerald-600 flex items-center">
          Xem bảng xếp hạng <ChevronRight className="w-4 h-4 ml-1" />
        </span>
      </div>
    </div>
  );
}
