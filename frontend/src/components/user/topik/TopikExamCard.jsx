import React from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Clock, FileQuestion, Trophy } from "lucide-react";

export default function TopikExamCard({ exam, best }) {
  const isAdvanced = exam.level === "TOPIK II";

  return (
    <article className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <span
          className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${
            isAdvanced
              ? "bg-indigo-50 text-indigo-700"
              : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {exam.level}
        </span>
        {best && (
          <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
            <Trophy className="h-3 w-3" />
            Cao nhất: {best.score}/100
          </span>
        )}
      </div>

      <h2 className="mt-3 text-base font-bold text-gray-900">{exam.title}</h2>
      <p className="mt-1.5 line-clamp-2 flex-1 text-sm leading-relaxed text-gray-500">
        {exam.description || "Đề luyện thi TOPIK."}
      </p>

      <dl className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <FileQuestion className="h-3.5 w-3.5 text-gray-400" />
          <dt className="sr-only">Số câu</dt>
          <dd>{exam.questionCount} câu</dd>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-gray-400" />
          <dt className="sr-only">Thời gian</dt>
          <dd>{exam.durationMinutes} phút</dd>
        </div>
        <div className="flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5 text-gray-400" />
          <dt className="sr-only">Kỳ thi</dt>
          <dd>
            {exam.year}
            {exam.round ? ` · ${exam.round}` : ""}
          </dd>
        </div>
      </dl>

      <Link
        to={`/topik/${exam.id}`}
        className="mt-5 inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
      >
        {best ? "Làm lại đề" : "Làm bài"}
      </Link>
    </article>
  );
}
