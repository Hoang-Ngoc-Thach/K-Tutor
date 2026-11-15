import React, { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import TopikExamCard from "../../components/user/topik/TopikExamCard";
import { TOPIK_LEVELS, bestAttempt } from "../../components/user/topik/topikUtils";
import {
  getTopikAttemptsRequest,
  getTopikErrorMessage,
  getTopikExamsRequest,
} from "../../api/topikExams";

// Danh sách đề TOPIK đã xuất bản để học viên chọn làm.
export default function TopikListPage() {
  const [exams, setExams] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [level, setLevel] = useState("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let active = true;

    Promise.all([
      getTopikExamsRequest({ publishedOnly: true }),
      getTopikAttemptsRequest(),
    ])
      .then(([examList, attemptList]) => {
        if (!active) return;
        setExams(examList);
        setAttempts(attemptList);
      })
      .catch((err) => {
        if (active) setError(getTopikErrorMessage(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const visibleExams = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return exams.filter(
      (exam) =>
        (level === "all" || exam.level === level) &&
        (!keyword ||
          `${exam.title} ${exam.round} ${exam.year}`.toLowerCase().includes(keyword)),
    );
  }, [exams, level, query]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8 md:px-6">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
          Luyện thi
        </p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Đề thi TOPIK</h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-500">
          Chọn một đề để làm bài tính giờ như thi thật. Hệ thống chấm điểm ngay và
          giải thích từng câu sau khi bạn nộp bài.
        </p>
      </header>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2" aria-label="Lọc theo cấp">
          {["all", ...TOPIK_LEVELS].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setLevel(value)}
              aria-pressed={level === value}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                level === value
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "border border-gray-200 bg-white text-gray-600 hover:border-emerald-200 hover:text-emerald-700"
              }`}
            >
              {value === "all" ? "Tất cả" : value}
            </button>
          ))}
        </div>

        <label className="relative block sm:w-64">
          <span className="sr-only">Tìm đề thi</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm theo tên, năm, kỳ thi"
            className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </label>
      </div>

      {error && (
        <p role="alert" className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <p className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-500">
          Đang tải...
        </p>
      ) : visibleExams.length === 0 ? (
        <p className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-500">
          {exams.length === 0
            ? "Hiện chưa có đề thi nào được xuất bản."
            : "Không tìm thấy đề phù hợp với bộ lọc."}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {visibleExams.map((exam) => (
            <TopikExamCard
              key={exam.id}
              exam={exam}
              best={bestAttempt(attempts, exam.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
