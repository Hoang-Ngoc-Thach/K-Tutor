import React from "react";
import { Link } from "react-router-dom";
import StreakFlame from "./StreakFlame";
import WeekStrip from "./WeekStrip";

// Thẻ chuỗi ở trang chủ: chuỗi hiện tại, 7 ngày gần nhất và nút vào ôn tập.
export default function StreakCard({ streak }) {
  const locked = streak.learnedCount < streak.minWords;

  return (
    <section
      aria-label="Chuỗi ngày học"
      className="flex flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-5 md:flex-row md:items-center md:justify-between"
    >
      <div>
        <StreakFlame days={streak.current} />
        <p className="mt-2 text-sm text-gray-600">
          {streak.studiedToday
            ? "Hôm nay bạn đã ôn tập."
            : streak.current > 0
              ? "Ôn tập hôm nay để giữ chuỗi."
              : "Ôn tập mỗi ngày để tạo chuỗi."}
        </p>
      </div>

      <WeekStrip days={streak.last7Days} today={streak.today} />

      <div className="md:text-right">
        <Link
          to="/streak"
          className="inline-flex rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
        >
          {streak.studiedToday ? "Ôn thêm" : "Ôn tập giữ chuỗi"}
        </Link>
        {locked && (
          <p className="mt-2 text-xs text-gray-500">
            Cần {streak.minWords} từ đã học (hiện có {streak.learnedCount}).
          </p>
        )}
      </div>
    </section>
  );
}
