import React from "react";
import {
  MonitorPlay,
  FileText,
  ScanLine,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";

export default function FeaturesSection() {
  return (
    <div className="mt-12">
      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Luyện Giao Tiếp (Theme Xanh Lá) */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 flex flex-col hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <MonitorPlay className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full flex items-center gap-1">
              ✨ AI phản hồi 24/7
            </span>
          </div>

          <div className="mb-3">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              Luyện Giao Tiếp{" "}
              <span className="text-xs font-normal text-gray-400">
                주제별 회화
              </span>
            </h3>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed mb-4 flex-1">
            Đàm thoại nhập vai tình huống: Du lịch Seoul, Phỏng vấn việc làm,
            Đời sống hàng ngày cùng trợ lý phát âm chuẩn bản ngữ.
          </p>

          <div className="space-y-2 mb-6">
            <div className="text-[11px] font-medium text-gray-700 flex items-center gap-2">
              <span className="text-gray-400">✈️</span> Check-in sân bay Incheon
            </div>
            <div className="text-[11px] font-medium text-gray-700 flex items-center gap-2">
              <span className="text-gray-400">☕</span> Đặt cafe tại Hongdae
            </div>
          </div>

          <button className="mt-auto pt-4 border-t border-gray-100 text-sm font-bold text-emerald-700 hover:text-emerald-800 flex items-center justify-center gap-1 w-full group">
            Bắt đầu hội thoại{" "}
            <ArrowUpRight className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Card 2: Luyện Thi TOPIK (Theme Xanh Dương) */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 flex flex-col hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full flex items-center gap-1">
              Đề thi chuẩn 2025
            </span>
          </div>

          <div className="mb-3">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              Luyện Thi TOPIK I & II{" "}
              <span className="text-xs font-normal text-gray-400">
                TOPIK 시험 대비
              </span>
            </h3>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed mb-4 flex-1">
            Kho 3,000+ từ vựng trọng tâm theo tần suất ra đề, dự đoán điểm số
            thông minh và chiến lược giải bài Đọc - Nghe chi tiết.
          </p>

          <div className="space-y-2 mb-6">
            <div className="text-[11px] font-medium text-gray-700 flex items-center gap-2">
              <span className="text-red-400">🎯</span> Mô phỏng phòng thi thật
            </div>
            <div className="text-[11px] font-medium text-gray-700 flex items-center gap-2">
              <span className="text-blue-400">📊</span> Phân tích điểm yếu AI
            </div>
          </div>

          <button className="mt-auto pt-4 border-t border-gray-100 text-sm font-bold text-blue-700 hover:text-blue-800 flex items-center justify-center gap-1 w-full group">
            Làm bài thi thử{" "}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Card 3: AI OCR & Nhận Diện (Theme Tím) */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 flex flex-col hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
              <ScanLine className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full flex items-center gap-1">
              Thị giác máy tính
            </span>
          </div>

          <div className="mb-3">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              AI OCR & Nhận Diện{" "}
              <span className="text-xs font-normal text-gray-400">
                AI 필기 인식 & 음성
              </span>
            </h3>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed mb-4 flex-1">
            Chụp ảnh vở ghi chép chữ Hangeul hoặc tài liệu giấy. AI tự động tách
            chữ, tra từ điển, chỉ ra lỗi chính tả và phát âm mẫu.
          </p>

          <div className="space-y-2 mb-6">
            <div className="text-[11px] font-medium text-gray-700 flex items-center gap-2">
              <span className="text-amber-500">✍️</span> Chữ viết tay tự do
            </div>
            <div className="text-[11px] font-medium text-gray-700 flex items-center gap-2">
              <span className="text-purple-500">🔊</span> Phát âm đa tốc độ
              (0.8x - 1.2x)
            </div>
          </div>

          <button className="mt-auto pt-4 border-t border-gray-100 text-sm font-bold text-purple-700 hover:text-purple-800 flex items-center justify-center gap-1 w-full group">
            Tải ảnh lên quét{" "}
            <ArrowUpRight className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
