import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

// Backend chưa lưu tiến độ học nên chưa xếp hạng được chủ đề theo lượt học;
// hiển thị số chủ đề của từng cấp độ.
export default function TopTopics({ levels }) {
  const maxCount = Math.max(1, ...levels.map((level) => level.count));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold text-gray-900 text-base">
            Chủ đề theo cấp độ
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Số chủ đề học hiện có trong từng cấp độ
          </p>
        </div>
        <Link
          to="/admin/levels"
          className="text-xs font-semibold text-gray-600 hover:text-emerald-700 flex items-center gap-1 transition"
        >
          Quản lý cấp độ <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Levels List */}
      <div className="space-y-4">
        {levels.length === 0 && (
          <p className="text-xs text-gray-400">Chưa có cấp độ nào</p>
        )}

        {levels.map((level, index) => (
          <div
            key={level.levelId}
            className="flex items-center justify-between gap-4 py-1"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0">
                {index + 1}
              </span>
              <h4 className="text-xs font-bold text-gray-800 truncate">
                {level.name}
              </h4>
            </div>

            {/* Progress Bar */}
            <div className="w-48 flex items-center gap-3 shrink-0">
              <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-700 h-2 rounded-full"
                  style={{ width: `${(level.count / maxCount) * 100}%` }}
                />
              </div>
              <span className="text-xs font-bold text-gray-700 w-8 text-right">
                {level.count}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
