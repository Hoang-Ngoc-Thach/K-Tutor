import React, { useState } from "react";
import { Mic, AudioLines, Sparkles } from "lucide-react";

export default function VoicePractice() {
  const [isRecording, setIsRecording] = useState(false);
  const [score, setScore] = useState(null);

  const handleRecord = () => {
    setIsRecording(true);
    // Giả lập ghi âm 2s
    setTimeout(() => {
      setIsRecording(false);
      setScore({ total: 95, intonation: 98, stress: 94 });
    }, 2000);
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-6 text-center">
      <div className="flex justify-center mb-4">
        {isRecording ? (
          <div className="flex gap-1 items-center h-8">
            {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((h, i) => (
              <div
                key={i}
                className="w-1.5 bg-emerald-500 rounded-full animate-pulse"
                style={{ height: `${h * 4}px` }}
              ></div>
            ))}
          </div>
        ) : (
          <AudioLines className="w-8 h-8 text-gray-300" />
        )}
      </div>

      <p className="text-sm font-bold text-gray-600 mb-4">
        {isRecording
          ? "Đang nghe..."
          : 'Nhấn micro bên dưới và nói rõ từ: "사과"'}
      </p>

      <button
        onClick={handleRecord}
        disabled={isRecording}
        className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6 transition-all ${
          isRecording
            ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30 scale-110"
            : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
        }`}
      >
        <Mic className="w-6 h-6" />
      </button>

      {/* Kết quả AI */}
      {score && (
        <div className="inline-flex items-center gap-6 bg-emerald-50/50 border border-emerald-100 px-6 py-3 rounded-2xl animate-in fade-in zoom-in duration-300">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black text-emerald-600">
              {score.total}%
            </span>
            <div className="text-left">
              <div className="text-xs font-bold text-gray-800 flex items-center gap-1">
                Phát âm xuất sắc!{" "}
                <Sparkles className="w-3 h-3 text-amber-400" />
              </div>
              <div className="text-[10px] text-gray-500">
                Chuẩn ngữ điệu bản xứ
              </div>
            </div>
          </div>
          <div className="w-px h-8 bg-emerald-100"></div>
          <div className="flex gap-4 text-[11px] font-bold text-gray-600">
            <div>
              Ngữ điệu:{" "}
              <span className="text-emerald-600">{score.intonation}%</span>
            </div>
            <div>
              Trọng âm:{" "}
              <span className="text-emerald-600">{score.stress}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
