import React from "react";
import { GAMES } from "../review/reviewUtils";

// Thanh các chặng của phiên ôn tập: chặng đã xong, đang chơi, chưa chơi.
export default function StageBar({ stages, index }) {
  const current = GAMES.find((game) => game.value === stages[index]?.game);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pt-5 md:px-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-gray-900">
          Chặng {index + 1}/{stages.length}: {current?.label}
        </p>
        <p className="text-xs text-gray-500">Ôn tập giữ chuỗi</p>
      </div>
      <ol className="mt-2 flex gap-1.5" aria-label="Các chặng">
        {stages.map((stage, stageIndex) => (
          <li
            key={stage.game}
            className={`h-1.5 flex-1 rounded-full ${
              stageIndex < index
                ? "bg-orange-400"
                : stageIndex === index
                  ? "bg-emerald-600"
                  : "bg-gray-200"
            }`}
          />
        ))}
      </ol>
    </div>
  );
}
