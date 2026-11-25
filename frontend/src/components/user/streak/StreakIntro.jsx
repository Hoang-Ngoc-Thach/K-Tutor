import React from "react";
import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import { GAMES } from "../review/reviewUtils";
import StreakFlame from "./StreakFlame";
import WeekStrip from "./WeekStrip";

// Màn đầu của trang ôn tập giữ chuỗi: chuỗi hiện tại, 7 ngày gần nhất và nút bắt đầu.
export default function StreakIntro({ streak, starting, error, notice, onStart }) {
  const locked = streak.learnedCount < streak.minWords;
  const missing = streak.minWords - streak.learnedCount;

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 md:px-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <StreakFlame days={streak.current} size="lg" />
        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          {streak.studiedToday
            ? "Hôm nay bạn đã giữ chuỗi. Ôn thêm một phiên nữa cũng giúp nhớ lâu hơn."
            : streak.current > 0
              ? `Hoàn thành phiên ôn tập hôm nay để giữ chuỗi ${streak.current} ngày.`
              : "Hoàn thành một phiên ôn tập để bắt đầu chuỗi đầu tiên của bạn."}
        </p>

        <div className="mt-6">
          <WeekStrip days={streak.last7Days} today={streak.today} />
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-gray-100 pt-5">
          <div>
            <dt className="text-xs text-gray-500">Chuỗi dài nhất</dt>
            <dd className="text-lg font-bold text-gray-900">{streak.longest} ngày</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Từ đã học</dt>
            <dd className="text-lg font-bold text-gray-900">{streak.learnedCount} từ</dd>
          </div>
        </dl>
      </section>

      <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
        <h2 className="text-base font-bold text-gray-900">Một phiên ôn tập gồm 4 chặng</h2>
        <p className="mt-1 text-sm text-gray-600">
          Mỗi chặng là một trò chơi, dùng tối đa 5 từ chọn ngẫu nhiên trong các từ bạn đã
          bấm "Đã nhớ" khi học flashcard. Thứ tự trò chơi thay đổi mỗi lần.
        </p>
        <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {GAMES.map((game) => (
            <li
              key={game.value}
              className="rounded-xl bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800"
            >
              {game.label}
            </li>
          ))}
        </ul>

        {notice && (
          <p role="status" className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
            {notice}
          </p>
        )}
        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {locked ? (
          <div className="mt-5 rounded-xl border border-dashed border-gray-300 p-4">
            <p className="text-sm text-gray-700">
              Bạn cần ít nhất {streak.minWords} từ đã học để ôn tập. Còn thiếu{" "}
              {missing} từ. Hãy học flashcard một chủ đề và bấm "Đã nhớ" ở các từ
              bạn thuộc.
            </p>
            <Link
              to="/topics"
              className="mt-3 inline-flex rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              Chọn chủ đề để học
            </Link>
          </div>
        ) : (
          <button
            type="button"
            onClick={onStart}
            disabled={starting}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Play className="h-4 w-4" aria-hidden="true" />
            {starting
              ? "Đang chuẩn bị..."
              : streak.studiedToday
                ? "Ôn thêm một phiên"
                : "Bắt đầu ôn tập"}
          </button>
        )}
      </section>
    </div>
  );
}
