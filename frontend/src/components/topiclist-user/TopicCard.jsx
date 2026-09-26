// src/components/topiclist-user/TopicCard.jsx
import React from "react";
import { RotateCw, Play, ArrowRight } from "lucide-react";

export default function TopicCard({ topic }) {
  const { emoji, title, subtitle, learned, total, isNew } = topic;
  const progress = Math.round((learned / total) * 100) || 0;

  const isCompleted = progress === 100;
  const inProgress = progress > 0 && progress < 100;
  const notStarted = progress === 0;

  return (
    <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full relative group">
      {/* Badge trạng thái */}
      <div className="flex justify-between items-start mb-4">
        <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
          {total} từ cốt lõi
        </span>
        {isCompleted && (
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-md">
            Hoàn thành
          </span>
        )}
        {inProgress && (
          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-1 rounded-md">
            Đang học
          </span>
        )}
        {isNew && (
          <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-100 px-2 py-1 rounded-md">
            Mới
          </span>
        )}
      </div>

      {/* Icon & Tiêu đề */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">
          {emoji}
        </div>
        <h3 className="text-base font-bold text-gray-900 mb-1">{title}</h3>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>

      {/* Thanh tiến độ & Nút bấm (Đẩy xuống đáy) */}
      <div className="mt-auto pt-4">
        <div className="flex justify-between items-end mb-2">
          <span className="text-xs font-medium text-gray-500">
            Tiến độ ghi nhớ
          </span>
          <span className="text-xs font-bold text-gray-900">
            {learned}/{total} từ ({progress}%)
          </span>
        </div>

        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4">
          <div
            className={`h-1.5 rounded-full ${isCompleted ? "bg-emerald-500" : "bg-blue-500"}`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {isCompleted && (
          <button className="w-full py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-1.5 transition-colors">
            <RotateCw className="w-4 h-4" /> Ôn tập lại
          </button>
        )}

        {inProgress && (
          <button className="w-full py-2.5 rounded-xl bg-emerald-600 text-sm font-bold text-white hover:bg-emerald-700 flex items-center justify-center gap-1.5 transition-colors shadow-sm">
            <Play className="w-4 h-4 fill-current" /> Tiếp tục học
          </button>
        )}

        {notStarted && (
          <button className="w-full py-2.5 rounded-xl bg-gray-50 text-sm font-bold text-gray-700 hover:bg-gray-100 flex items-center justify-center gap-1.5 transition-colors">
            Bắt đầu học <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
