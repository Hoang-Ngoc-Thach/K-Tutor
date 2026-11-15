import React from "react";
import { Flame, Heart, X } from "lucide-react";
import { MAX_LIVES } from "./reviewUtils";

// Thanh trạng thái dùng chung cho các trò chơi: mạng, combo, điểm, tiến độ.
export default function ReviewHud({
  lives,
  score,
  combo,
  progressLabel,
  progress,
  hint,
  onQuit,
}) {
  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onQuit}
          className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 transition hover:border-emerald-200 hover:text-emerald-700"
        >
          <X className="h-3.5 w-3.5" />
          Dừng chơi
        </button>

        <div className="flex items-center gap-4">
          {lives !== null && (
            <div
              className="flex items-center gap-0.5"
              aria-label={`Còn ${lives} mạng`}
            >
              {Array.from({ length: MAX_LIVES }, (_, index) => (
                <Heart
                  key={index}
                  className={`h-5 w-5 ${
                    index < lives
                      ? "fill-rose-500 text-rose-500"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          )}
          <div
            className={`flex items-center gap-1 text-sm font-bold ${
              combo >= 2 ? "text-amber-600" : "text-gray-300"
            }`}
          >
            <Flame className="h-4 w-4" />x{combo}
          </div>
          <div className="min-w-16 text-right text-lg font-bold text-gray-900">
            {score}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="mb-1.5 flex justify-between text-xs font-medium text-gray-500">
          <span>{progressLabel}</span>
          {hint && <span>{hint}</span>}
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
          />
        </div>
      </div>
    </>
  );
}
