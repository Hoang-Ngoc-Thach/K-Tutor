import React, { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, RotateCcw, Volume2, XCircle } from "lucide-react";
import useSpeak from "../../../hooks/useSpeak";
import { OPTION_MARKS, formatDuration, sectionLabel } from "./topikUtils";

// Kết quả: điểm, thống kê và xem lại từng câu kèm giải thích.
export default function TopikResult({ exam, answers, result, elapsedSec, onRetry }) {
  const { speak } = useSpeak();
  const [onlyWrong, setOnlyWrong] = useState(false);
  const wrongCount = result.total - result.correct;

  const rows = exam.questions
    .map((question, index) => ({ question, index }))
    .filter(
      ({ question }) =>
        !onlyWrong || answers[question.id] !== question.answerIndex,
    );

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 md:px-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm sm:p-8">
        <p className="text-xs font-semibold text-emerald-700">{exam.title}</p>
        <p className="mt-3 text-5xl font-bold text-gray-900">
          {result.score}
          <span className="text-xl font-semibold text-gray-400">/100</span>
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Đúng {result.correct}/{result.total} câu · Thời gian làm bài{" "}
          {formatDuration(elapsedSec)}
        </p>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            <RotateCcw className="h-4 w-4" />
            Làm lại đề này
          </button>
          <Link
            to="/topik"
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Chọn đề khác
          </Link>
        </div>
      </section>

      <div className="mb-3 mt-8 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">Xem lại bài làm</h2>
        <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-gray-600">
          <input
            type="checkbox"
            checked={onlyWrong}
            onChange={(event) => setOnlyWrong(event.target.checked)}
            className="h-4 w-4 accent-emerald-600"
          />
          Chỉ hiện câu sai ({wrongCount})
        </label>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-emerald-700">
          Tuyệt vời! Bạn không sai câu nào.
        </p>
      ) : (
        <ol className="space-y-4">
          {rows.map(({ question, index }) => {
            const picked = answers[question.id];
            const isCorrect = picked === question.answerIndex;

            return (
              <li
                key={question.id}
                className="rounded-2xl border border-gray-200 bg-white p-5"
              >
                <div className="flex items-center gap-2 text-xs font-semibold">
                  {isCorrect ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-gray-900">Câu {index + 1}</span>
                  <span className="rounded-md bg-gray-100 px-2 py-0.5 text-gray-600">
                    {sectionLabel(question.section)}
                  </span>
                </div>

                <p className="mt-3 text-sm font-semibold leading-relaxed text-gray-900">
                  {question.text}
                </p>
                {question.passage && (
                  <p className="mt-2 whitespace-pre-line rounded-xl bg-gray-50 p-3 text-sm leading-loose text-gray-800">
                    {question.passage}
                  </p>
                )}
                {question.script && (
                  <div className="mt-2 flex items-start justify-between gap-2 rounded-xl bg-gray-50 p-3 text-sm leading-relaxed text-gray-800">
                    <span>
                      <span className="mb-1 block text-[11px] font-semibold text-gray-500">
                        Kịch bản bài nghe
                      </span>
                      {question.script}
                    </span>
                    <button
                      type="button"
                      onClick={() => speak(question.script)}
                      aria-label="Nghe lại"
                      className="shrink-0 rounded-lg p-2 text-emerald-700 hover:bg-emerald-50"
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <ul className="mt-3 space-y-1.5">
                  {question.options.map((option, optionIndex) => {
                    const isAnswer = optionIndex === question.answerIndex;
                    const isWrongPick = optionIndex === picked && !isAnswer;
                    return (
                      <li
                        key={optionIndex}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                          isAnswer
                            ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                            : isWrongPick
                              ? "border-red-200 bg-red-50 text-red-800"
                              : "border-gray-100 text-gray-600"
                        }`}
                      >
                        <span className="font-semibold text-gray-400">
                          {OPTION_MARKS[optionIndex]}
                        </span>
                        <span className="flex-1">{option}</span>
                        {isAnswer && (
                          <span className="text-[11px] font-bold">Đáp án đúng</span>
                        )}
                        {isWrongPick && (
                          <span className="text-[11px] font-bold">Bạn chọn</span>
                        )}
                      </li>
                    );
                  })}
                </ul>

                {picked === undefined && (
                  <p className="mt-2 text-xs font-semibold text-amber-600">
                    Bạn chưa trả lời câu này.
                  </p>
                )}
                {question.explanation && (
                  <p className="mt-3 rounded-xl bg-emerald-50/60 p-3 text-xs leading-relaxed text-gray-700">
                    <span className="font-bold text-emerald-700">Giải thích: </span>
                    {question.explanation}
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
