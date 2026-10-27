import React, { useState } from "react";
import {
  BookOpen,
  ChevronUp,
  ChevronDown,
  Volume2,
  RotateCw,
} from "lucide-react";

export default function BFlashcard() {
  // Đưa state showExample vào đây vì chỉ mặt sau mới cần dùng
  const [showExample, setShowExample] = useState(true);

  return (
    <div className="absolute inset-0 w-full h-full bg-white rounded-[2rem] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col">
      {/* Hàng trên cùng mặt sau */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex gap-2">
          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-100">
            Ý nghĩa & Ví dụ
          </span>
        </div>
      </div>

      {/* Khu vực Ý nghĩa */}
      <div className="text-center my-6">
        <p className="text-2xl md:text-3xl font-bold text-gray-800">
          Hạnh phúc, vui sướng trọn vẹn
        </p>
      </div>

      {/* Khu vực Ví dụ thực tế */}
      <div
        className="mt-2 rounded-2xl bg-[#F8FAFD] p-5 md:p-6 border border-blue-50/50"
        onClick={(e) => e.stopPropagation()} // Ngăn lật thẻ khi click vào khu vực này
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 uppercase tracking-wide">
            <BookOpen className="w-3.5 h-3.5" /> Ngữ cảnh thực tế
          </h3>
          <button
            onClick={() => setShowExample(!showExample)}
            className="text-[10px] font-bold text-gray-500 flex items-center gap-1 hover:text-gray-700"
          >
            {showExample ? "Ẩn ví dụ" : "Hiện ví dụ"}{" "}
            {showExample ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        </div>

        {showExample && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-start gap-2">
              <button className="mt-0.5 text-emerald-600 shrink-0">
                <Volume2 className="w-4 h-4" />
              </button>
              <div>
                <p className="text-gray-900 font-bold leading-relaxed mb-1">
                  "우리가 함께 있는 것만으로도 정말{" "}
                  <span className="bg-emerald-100/80 px-1 rounded text-emerald-900">
                    행복해요
                  </span>
                  ."
                </p>
                <p className="text-sm text-gray-600">
                  Chỉ cần chúng ta ở bên nhau thôi cũng đã thực sự rất hạnh phúc
                  rồi.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Gợi ý lật thẻ */}
      <div className="text-center mt-auto text-gray-300 text-xs flex items-center justify-center gap-1.5 pt-4">
        <RotateCw className="w-3 h-3" /> Nhấn Space hoặc click để quay lại
      </div>
    </div>
  );
}
