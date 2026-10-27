import React from "react";
import { Lightbulb } from "lucide-react";

export default function WordTips() {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-32">
      <div className="flex items-center gap-2 text-sm font-bold text-emerald-700 mb-4">
        <Lightbulb className="w-4 h-4" /> Mẹo ghi nhớ từ vựng & Cụm từ hay gặp
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
          <div className="font-bold text-gray-900 mb-1">사과를 깎다</div>
          <div className="text-xs text-gray-500">
            Gọt quả táo • Thường dùng trong bữa tráng miệng
          </div>
        </div>
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
          <div className="font-bold text-gray-900 mb-1">사과를 드리다</div>
          <div className="text-xs text-gray-500">
            Gửi lời xin lỗi (Kính ngữ chân thành)
          </div>
        </div>
      </div>
    </div>
  );
}
