import React from "react";
import { ArrowRight } from "lucide-react";
import { GAMES } from "../review/reviewUtils";

// Màn nghỉ ngắn giữa hai chặng: kết quả chặng vừa xong và trò tiếp theo.
export default function StageBreak({ stages, index, summary, onContinue }) {
  const finished = GAMES.find((game) => game.value === stages[index].game);
  const next = GAMES.find((game) => game.value === stages[index + 1]?.game);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
        <p className="text-sm text-gray-500">Xong chặng {index + 1}</p>
        <h1 className="mt-1 text-xl font-bold text-gray-900">{finished?.label}</h1>
        <p className="mt-4 text-3xl font-bold text-emerald-700">
          {summary.correct}/{summary.total}
        </p>
        <p className="mt-1 text-sm text-gray-500">
          {summary.ended === "lives"
            ? "từ đúng (chặng này kết thúc vì hết mạng)"
            : "từ đúng"}
        </p>

        <div className="mt-6 rounded-xl bg-gray-50 p-4 text-left">
          <p className="text-xs text-gray-500">Chặng tiếp theo</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">{next?.label}</p>
          <p className="mt-1 text-xs leading-relaxed text-gray-500">
            {next?.description}
          </p>
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
        >
          Tiếp tục
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
