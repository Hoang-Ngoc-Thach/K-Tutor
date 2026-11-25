import React from "react";
import { Link } from "react-router-dom";
import {
  formatShortDate,
  suggestExams,
  summarizeAttempts,
} from "./homeUtils";

const BARS_SHOWN = 8;

// Ô TOPIK: điểm các lượt làm gần nhất và gợi ý đề tiếp theo, toàn bộ từ dữ liệu thật.
export default function TopikPanel({ exams, attempts }) {
  const summary = summarizeAttempts(attempts);
  const titleById = new Map(exams.map((exam) => [exam.id, exam.title]));
  const recent = attempts.slice(-BARS_SHOWN);
  const suggestions = suggestExams(exams, attempts);

  return (
    <section
      aria-labelledby="topik-title"
      className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6"
    >
      <div className="flex items-end justify-between gap-3">
        <h2 id="topik-title" className="text-lg font-bold text-gray-900">
          Luyện đề TOPIK
        </h2>
        <Link
          to="/topik"
          className="text-sm font-semibold text-emerald-700 hover:underline"
        >
          Xem tất cả đề
        </Link>
      </div>

      {summary.count === 0 ? (
        <p className="mt-3 text-sm text-gray-600">
          {exams.length > 0
            ? "Bạn chưa làm đề nào. Làm một đề để xem điểm của mình tại đây."
            : "Hiện chưa có đề thi nào được xuất bản."}
        </p>
      ) : (
        <>
          <dl className="mt-3 flex gap-6 text-sm">
            <div>
              <dt className="text-xs text-gray-500">Số lượt làm</dt>
              <dd className="text-lg font-bold text-gray-900">{summary.count}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Điểm cao nhất</dt>
              <dd className="text-lg font-bold text-gray-900">{summary.best}/100</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Trung bình</dt>
              <dd className="text-lg font-bold text-gray-900">{summary.average}/100</dd>
            </div>
          </dl>

          <figure className="mt-4">
            <div
              className="flex h-24 items-end gap-2 border-b border-gray-200"
              role="img"
              aria-label={`Điểm ${recent.length} lượt làm gần nhất: ${recent
                .map((attempt) => attempt.score)
                .join(", ")}`}
            >
              {recent.map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex flex-1 flex-col items-center justify-end"
                  title={`${titleById.get(attempt.examId) ?? "Đề đã gỡ"}: ${attempt.score}/100`}
                >
                  <span className="mb-1 text-[11px] font-semibold text-gray-600">
                    {attempt.score}
                  </span>
                  <div
                    className="w-full rounded-t bg-emerald-600"
                    style={{ height: `${Math.max(attempt.score, 4) * 0.62}px` }}
                  />
                </div>
              ))}
            </div>
            <figcaption className="mt-1.5 flex gap-2 text-[11px] text-gray-400">
              {recent.map((attempt) => (
                <span key={attempt.id} className="flex-1 text-center">
                  {formatShortDate(attempt.createdAt)}
                </span>
              ))}
            </figcaption>
          </figure>
        </>
      )}

      {suggestions.length > 0 && (
        <div className="mt-5 flex-1">
          <h3 className="mb-2 text-sm font-semibold text-gray-700">
            {summary.count === 0 ? "Đề đang mở" : "Nên làm tiếp"}
          </h3>
          <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200">
            {suggestions.map(({ exam, best }) => (
              <li key={exam.id}>
                <Link
                  to={`/topik/${exam.id}`}
                  className="flex items-center justify-between gap-3 px-4 py-3 transition hover:bg-emerald-50/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-gray-900">
                      {exam.title}
                    </span>
                    <span className="block text-xs text-gray-500">
                      {exam.level}, {exam.questionCount} câu, {exam.durationMinutes} phút
                    </span>
                  </span>
                  <span
                    className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                      best === null
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {best === null ? "Chưa làm" : `Cao nhất ${best}`}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
