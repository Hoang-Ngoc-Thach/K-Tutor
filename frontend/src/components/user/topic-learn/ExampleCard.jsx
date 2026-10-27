import React from "react";
import { BookOpen, Headphones } from "lucide-react";

export default function ExampleCard() {
  return (
    <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-6 overflow-hidden">
      {/* Hình ảnh bên trái */}
      <div className="w-full md:w-1/3 h-48 md:h-auto rounded-2xl overflow-hidden relative bg-gray-100 shrink-0">
        <img
          src="https://images.unsplash.com/photo-1560806887-1e4cd0b6fac6?auto=format&fit=crop&q=80&w=400"
          alt="Apple"
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold px-3 py-1.5 rounded-lg text-center">
          Văn hóa Hàn: Táo đỏ Daegu
        </div>
      </div>

      {/* Nội dung ví dụ bên phải */}
      <div className="flex-1 py-2 pr-2">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
            <BookOpen className="w-3.5 h-3.5" /> Ngữ cảnh & Câu ví dụ thực tế
          </div>
          <button className="flex items-center gap-1 text-[11px] font-bold text-gray-500 hover:text-emerald-600 transition-colors">
            <Headphones className="w-3.5 h-3.5" /> Nghe câu
          </button>
        </div>

        <p className="text-xl font-bold text-gray-900 mb-2 leading-relaxed">
          아침에 먹는{" "}
          <span className="text-emerald-600 underline decoration-emerald-200 underline-offset-4">
            사과
          </span>
          는 건강에 아주 좋아요.
        </p>
        <p className="text-xs text-gray-400 font-medium mb-2">
          [Achim-e meong-neun sagwa-neun geon-gang-e aju jo-a-yo]
        </p>
        <p className="text-sm font-medium text-gray-700 mb-6">
          Ăn táo vào buổi sáng rất tốt cho sức khỏe.
        </p>

        {/* Ghi chú ngữ pháp */}
        <div className="pt-4 border-t border-gray-100">
          <p className="text-[11px] text-gray-500 font-semibold mb-1">
            Ghi chú ngữ pháp:
          </p>
          <ul className="text-[11px] text-gray-400 space-y-1">
            <li>
              <span className="font-bold text-gray-600">~에</span> (Vào lúc /
              Chỉ thời gian)
            </li>
            <li>
              <span className="font-bold text-gray-600">~는</span> (Định ngữ
              tính từ/động từ)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
