import React from "react";
import { RotateCcw, Settings2, Trophy, Volume2 } from "lucide-react";
import useSpeak from "../../../hooks/useSpeak";

export default function ReviewResult({
  summary,
  isNewRecord,
  bestScore,
  onReplay,
  onReviewMissed,
  onBackToSetup,
}) {
  const { speak } = useSpeak();
  const total = summary.results.length;
  const correctCount = summary.results.filter((item) => item.correct).length;
  const missed = summary.results.filter((item) => !item.correct);
  const accuracy = total === 0 ? 0 : Math.round((correctCount / total) * 100);
  const completed = summary.ended === "complete";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8 md:px-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
          <Trophy className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-xl font-bold text-gray-900">
          {completed ? "Bạn đã ôn hết lượt từ!" : "Hết mạng rồi, thử lại nhé!"}
        </h1>
        {isNewRecord ? (
          <p className="mt-2 text-sm font-semibold text-amber-600">
            Kỷ lục mới: {summary.score} điểm
          </p>
        ) : (
          bestScore > 0 && (
            <p className="mt-2 text-xs text-gray-500">
              Điểm cao nhất của bạn: {bestScore}
            </p>
          )
        )}

        <div className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-emerald-50 p-4">
            <p className="text-2xl font-bold text-emerald-700">
              {summary.score}
            </p>
            <p className="mt-1 text-xs font-medium text-gray-600">Điểm</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-2xl font-bold text-gray-700">
              {correctCount}/{total}
            </p>
            <p className="mt-1 text-xs font-medium text-gray-600">Từ đúng</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-2xl font-bold text-gray-700">{accuracy}%</p>
            <p className="mt-1 text-xs font-medium text-gray-600">Chính xác</p>
          </div>
          <div className="rounded-xl bg-amber-50 p-4">
            <p className="text-2xl font-bold text-amber-600">
              x{summary.bestCombo}
            </p>
            <p className="mt-1 text-xs font-medium text-gray-600">Combo</p>
          </div>
        </div>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          {missed.length > 0 && (
            <button
              type="button"
              onClick={() => onReviewMissed(missed.map((item) => item.word))}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              <RotateCcw className="h-4 w-4" />
              Ôn lại {missed.length} từ sai
            </button>
          )}
          <button
            type="button"
            onClick={onReplay}
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Chơi lại
          </button>
          <button
            type="button"
            onClick={onBackToSetup}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            <Settings2 className="h-4 w-4" />
            Đổi chủ đề
          </button>
        </div>
      </section>

      {missed.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 text-base font-semibold text-gray-900">
            Từ cần ôn thêm
          </h2>
          <ul className="space-y-2">
            {missed.map(({ word }) => (
              <li
                key={word.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4"
              >
                <div className="min-w-0">
                  <p className="text-base font-bold text-gray-900">
                    {word.korean}
                    {word.pronunciation && (
                      <span className="ml-2 text-xs font-normal text-gray-500">
                        {word.pronunciation}
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-sm text-gray-600">{word.meaning}</p>
                </div>
                <button
                  type="button"
                  onClick={() => speak(word.korean)}
                  aria-label={`Nghe phát âm ${word.korean}`}
                  className="shrink-0 rounded-lg p-2 text-emerald-700 transition hover:bg-emerald-50"
                >
                  <Volume2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
