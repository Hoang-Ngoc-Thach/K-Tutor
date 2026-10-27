import React from "react";
import { Mic, ScanLine } from "lucide-react";
import ChatSimulation from "./ChatSimulation";

// Thêm prop showChat, mặc định là true
export default function HeroSection({ showChat = true }) {
  return (
    <div className="bg-emerald-50/50 rounded-3xl p-8 lg:p-10 border border-emerald-100/50 flex flex-col lg:flex-row items-center gap-10">
      {/* Cột trái: Nội dung text & Nút CTA */}
      <div className="flex-1 w-full flex flex-col justify-between h-full">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100/80 text-emerald-800 text-[10px] font-bold rounded-full mb-6 uppercase tracking-wider">
            ● GIA SƯ AI THỜI GIAN THỰC • 실시간 AI 튜터
          </span>

          <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
            Chinh phục tiếng Hàn giao tiếp & TOPIK{" "}
            <span className="text-emerald-600">dễ dàng cùng AI</span>
          </h1>

          <p className="text-gray-600 text-sm leading-relaxed mb-8 max-w-lg">
            Thực hành phản xạ đàm thoại 1-on-1, chữa lỗi phát âm tức thì và nhận
            diện chữ viết tay Hangeul bằng công nghệ thị giác máy tính AI hiện
            đại nhất.
          </p>

          <div className="flex flex-wrap items-center gap-4 mb-8">
            <button className="bg-emerald-800 hover:bg-emerald-900 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition shadow-md shadow-emerald-900/10">
              <Mic className="w-4 h-4" /> Luyện nói ngay{" "}
              <span className="ml-1">→</span>
            </button>
            <button className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition">
              <ScanLine className="w-4 h-4" /> Quét chữ viết tay OCR
            </button>
          </div>

          <div className="flex items-center gap-6 text-xs font-semibold text-gray-600 mb-8">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center text-[8px]">
                ✓
              </div>
              120+ Tình huống đàm thoại
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center text-[8px]">
                ✓
              </div>
              Chuẩn giọng Seoul bản ngữ
            </div>
          </div>
        </div>
      </div>

      {/* Cột phải: Chỉ render ChatSimulation nếu showChat là true */}
      {showChat && (
        <div className="w-full lg:w-5/12 flex-shrink-0 relative z-10">
          <ChatSimulation />
        </div>
      )}
    </div>
  );
}
