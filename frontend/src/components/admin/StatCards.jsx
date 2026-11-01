import React from "react";
import { Users, BookOpen, Type } from "lucide-react";

const formatNumber = (value) => value.toLocaleString("vi-VN");

const getPercent = (value, total) =>
  total ? Math.round((value / total) * 100) : 0;

export default function StatCards({ stats }) {
  const { totalUsers, byGoal, totalTopics, topicsByLevel } = stats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Card 1: Tổng người dùng */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <p className="text-xs font-medium text-gray-500 mb-1">
          Tổng người dùng
        </p>
        <h3 className="text-2xl font-black text-gray-900 mb-4">
          {formatNumber(totalUsers)}
        </h3>

        <div className="bg-gray-50/80 rounded-xl p-2.5 text-xs text-gray-600 flex justify-between">
          <div>
            <span className="text-gray-400">Giao tiếp</span>
            <p className="font-bold text-gray-800">
              {formatNumber(byGoal.conversation)}{" "}
              <span className="text-[10px] font-normal text-gray-400">
                {getPercent(byGoal.conversation, totalUsers)}%
              </span>
            </p>
          </div>
          <div className="border-l border-gray-200 pl-3">
            <span className="text-gray-400">TOPIK</span>
            <p className="font-bold text-gray-800">
              {formatNumber(byGoal.topik)}{" "}
              <span className="text-[10px] font-normal text-gray-400">
                {getPercent(byGoal.topik, totalUsers)}%
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Card 2: Tổng chủ đề */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>
        <p className="text-xs font-medium text-gray-500 mb-1">Tổng chủ đề</p>
        <h3 className="text-2xl font-black text-gray-900 mb-4">
          {formatNumber(totalTopics)}
        </h3>

        <div className="bg-gray-50/80 rounded-xl p-2.5 text-xs space-y-1.5">
          {topicsByLevel.length === 0 && (
            <span className="text-gray-400">Chưa có cấp độ nào</span>
          )}

          {topicsByLevel.slice(0, 2).map((level) => (
            <div
              key={level.levelId}
              className="flex justify-between items-center"
            >
              <span className="text-gray-500 truncate">{level.name}</span>
              <span className="font-bold text-gray-800 shrink-0 pl-2">
                {formatNumber(level.count)} chủ đề
              </span>
            </div>
          ))}

          {topicsByLevel.length > 2 && (
            <div className="text-[10px] text-gray-400">
              và {topicsByLevel.length - 2} cấp độ khác
            </div>
          )}
        </div>
      </div>

      {/* Card 3: Tổng từ vựng */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Type className="w-5 h-5" />
          </div>
        </div>
        <p className="text-xs font-medium text-gray-500 mb-1">Tổng từ vựng</p>
        <h3 className="text-2xl font-black text-gray-900 mb-4">
          {formatNumber(stats.totalVocabularies)}
        </h3>

        <div className="bg-gray-50/80 rounded-xl p-2.5 text-xs space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Ngữ pháp</span>
            <span className="font-bold text-gray-800">
              {formatNumber(stats.totalGrammars)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Từ vựng kèm câu ví dụ</span>
            <span className="font-bold text-gray-800">
              {formatNumber(stats.vocabulariesWithExamples)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
