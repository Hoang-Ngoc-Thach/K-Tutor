import React from "react";
import { Link } from "react-router-dom";
import { Volume2 } from "lucide-react";
import useSpeak from "../../../hooks/useSpeak";
import StreakFlame from "./StreakFlame";
import WeekStrip from "./WeekStrip";

// Màn hoàn thành phiên: chuỗi mới, độ chính xác và các từ cần ôn thêm.
export default function StreakComplete({ outcome, results, onAgain }) {
  const { speak } = useSpeak();
  const total = results.length;
  const correct = results.filter((item) => item.correct).length;
  const accuracy = total === 0 ? 0 : Math.round((correct / total) * 100);

  // Mỗi từ chỉ liệt kê một lần dù xuất hiện ở nhiều chặng.
  const missed = [
    ...new Map(
      results.filter((item) => !item.correct).map((item) => [item.word.id, item.word]),
    ).values(),
  ];

  const headline = outcome.streakIncreased
    ? outcome.current === 1
      ? "Chuỗi mới đã bắt đầu!"
      : `Chuỗi ${outcome.current} ngày!`
    : "Bạn đã giữ chuỗi từ trước";

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 md:px-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm sm:p-8">
        <div className="flex justify-center">
          <StreakFlame days={outcome.current} size="lg" />
        </div>
        <h1 className="mt-4 text-xl font-bold text-gray-900">{headline}</h1>
        <p className="mt-1 text-sm text-gray-600">
          {outcome.streakIncreased
            ? "Hôm nay đã được tính vào chuỗi của bạn."
            : "Hôm nay đã được tính từ phiên trước. Kết quả phiên này vẫn được lưu lại."}
        </p>

        <div className="mt-5 flex justify-center">
          <WeekStrip days={outcome.last7Days} today={outcome.today} />
        </div>

        <dl className="mx-auto mt-6 grid max-w-sm grid-cols-2 gap-3">
          <div className="rounded-xl bg-emerald-50 p-4">
            <dd className="text-2xl font-bold text-emerald-700">
              {correct}/{total}
            </dd>
            <dt className="mt-1 text-xs font-medium text-gray-600">Từ đúng</dt>
          </div>
          <div className="rounded-xl bg-gray-50 p-4">
            <dd className="text-2xl font-bold text-gray-700">{accuracy}%</dd>
            <dt className="mt-1 text-xs font-medium text-gray-600">Chính xác</dt>
          </div>
        </dl>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            Về trang chủ
          </Link>
          <button
            type="button"
            onClick={onAgain}
            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Ôn thêm một phiên
          </button>
        </div>
      </section>

      {missed.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 text-base font-semibold text-gray-900">
            Từ cần ôn thêm
          </h2>
          <ul className="space-y-2">
            {missed.map((word) => (
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
