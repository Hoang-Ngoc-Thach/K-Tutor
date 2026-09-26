import React from "react";
import { Sparkles, Volume2 } from "lucide-react";

export default function WordDetailsCard() {
  const playAudio = () => {
    const utterance = new SpeechSynthesisUtterance("사과");
    utterance.lang = "ko-KR";
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-6 relative overflow-hidden">
      {/* Header tags */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
            <Sparkles className="w-3 h-3" /> Từ mới trọng tâm
          </span>
        </div>
        <div className="flex gap-2 text-[10px] font-semibold text-gray-500">
          <span className="bg-gray-50 px-2 py-1 rounded">
            Sơ cấp 1 • TOPIK I
          </span>
          <span className="bg-gray-50 px-2 py-1 rounded">
            Tần suất: Rất cao
          </span>
        </div>
      </div>

      {/* Main Word Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-semibold text-gray-400">
              Danh từ (명사)
            </span>
            <span className="text-xs font-semibold text-gray-400 border-l border-gray-200 pl-3">
              Từ cốt lõi
            </span>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              Giọng chuẩn Seoul (ko-KR)
            </span>
          </div>
          <div className="flex items-end gap-3 mb-4">
            <h1 className="text-6xl md:text-7xl font-black text-gray-900 tracking-tight">
              사과
            </h1>
            <span className="text-lg text-gray-400 font-medium pb-2">
              /sagwa/
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Quả táo <span className="text-gray-300 mx-2">•</span>{" "}
            <span className="text-gray-600">Lời xin lỗi</span>
          </h2>
          <div className="space-y-1 text-sm text-gray-600">
            <p>1. Trái cây ngọt giòn mùa thu.</p>
            <p>2. Hành động bày tỏ nhận lỗi (trong ngữ cảnh 사과하다).</p>
          </div>
        </div>

        {/* Nút phát âm to */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          <button
            onClick={playAudio}
            className="w-16 h-16 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-600/30 transition-transform hover:scale-105"
          >
            <Volume2 className="w-8 h-8" />
          </button>
          <span className="text-[10px] font-bold text-gray-400">
            Nghe phát âm
          </span>
        </div>
      </div>

      {/* Hangul Breakdown */}
      <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Cấu tạo âm tiết Hangul
          </h3>
          <span className="text-[10px] text-gray-400 font-medium">
            2 Âm tiết (사 + 과)
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-white p-3 rounded-xl border border-gray-100 flex items-center gap-4">
            <div className="text-3xl font-black text-gray-800">사</div>
            <div>
              <div className="text-sm font-bold text-gray-700">
                ㅅ(s) + ㅏ(a)
              </div>
              <div className="text-[11px] text-gray-400">
                Phụ âm đầu + Nguyên âm đơn
              </div>
            </div>
          </div>
          <div className="bg-white p-3 rounded-xl border border-gray-100 flex items-center gap-4">
            <div className="text-3xl font-black text-gray-800">과</div>
            <div>
              <div className="text-sm font-bold text-gray-700">
                ㄱ(g) + ㅘ(wa)
              </div>
              <div className="text-[11px] text-gray-400">
                Phụ âm đầu + Nguyên âm kép
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
