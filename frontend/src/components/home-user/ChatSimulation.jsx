import React from "react";
import { Volume2, Mic, ChevronRight } from "lucide-react";

export default function ChatSimulation() {
  return (
    <div className="bg-white/95 backdrop-blur-sm border border-emerald-100 rounded-3xl p-5 shadow-xl relative w-full max-w-md mx-auto lg:ml-auto">
      {/* Header - Trạng thái AI */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-black text-sm">
            AI
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              Trợ giảng Ji-won (이지원)
            </h3>
            <p className="text-[11px] text-gray-500 flex items-center gap-1">
              Đang lắng nghe trực tiếp...
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
          Trực tuyến
        </div>
      </div>

      {/* Khu vực tin nhắn */}
      <div className="flex flex-col gap-4">
        {/* Tin nhắn của AI */}
        <div className="flex gap-3 max-w-[85%]">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold shrink-0 mt-1">
            AI
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-none p-3.5">
            <div className="flex items-start justify-between gap-4 mb-1">
              <p className="text-sm font-bold text-gray-900 leading-tight">
                주말에 뭐 하고 싶어요?
              </p>
              <button className="text-emerald-600 hover:text-emerald-700 shrink-0">
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-gray-400 font-medium mb-1.5">
              [ju-mar-e mwo ha-go sip-eo-yo?]
            </p>
            <p className="text-xs text-gray-600">
              Cuối tuần này bạn muốn làm gì?
            </p>
          </div>
        </div>

        {/* Tin nhắn của User */}
        <div className="flex gap-3 max-w-[90%] self-end flex-row-reverse mt-2">
          <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-1 shadow-sm">
            TN
          </div>
          <div className="bg-emerald-700 text-white rounded-2xl rounded-tr-none p-3.5 shadow-md relative">
            <div className="flex items-start justify-between gap-4 mb-1">
              <p className="text-sm font-bold leading-tight">
                친구를 만나서 커피를 마셔요.
              </p>
              <Mic className="w-3.5 h-3.5 text-emerald-200 shrink-0 mt-0.5" />
            </div>
            <p className="text-xs text-emerald-100/90 mt-1.5 border-t border-emerald-600/50 pt-1.5">
              Tôi gặp bạn bè và đi uống cà phê.
            </p>
          </div>
        </div>
      </div>

      {/* Thẻ đánh giá / Feedback */}
      <div className="mt-5 bg-white border border-emerald-100 rounded-2xl p-3 flex items-center justify-between shadow-[0_4px_20px_-4px_rgba(16,185,129,0.1)]">
        <div className="flex items-center gap-3">
          <div className="text-xl font-black text-emerald-600 tracking-tighter">
            98%
          </div>
          <div>
            <div className="text-xs font-bold text-gray-900">
              Phát âm xuất sắc!
            </div>
            <div className="text-[10px] text-gray-500">
              Chuẩn ngữ điệu Seoul
            </div>
          </div>
        </div>
        <button className="text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg flex items-center transition-colors">
          Xem chi tiết <ChevronRight className="w-3 h-3 ml-0.5" />
        </button>
      </div>
    </div>
  );
}
