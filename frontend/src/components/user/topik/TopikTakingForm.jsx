import React, { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Flag,
  Send,
  Volume2,
  X,
} from "lucide-react";
import useSpeak from "../../../hooks/useSpeak";
import TopikQuestionPalette from "./TopikQuestionPalette";
import { OPTION_MARKS, formatClock, sectionLabel } from "./topikUtils";

const currentTime = () => Date.now();

// Form làm bài: câu hỏi trắc nghiệm, đồng hồ đếm ngược, bảng số câu, nộp bài.
// onSubmit({ answers, elapsedSec }) được gọi khi học viên nộp hoặc hết giờ.
export default function TopikTakingForm({ exam, onSubmit, onQuit }) {
  const totalSeconds = exam.durationMinutes * 60;
  const { speak } = useSpeak();
  const [startedAt] = useState(currentTime);
  const [remaining, setRemaining] = useState(totalSeconds);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState([]);
  const [confirming, setConfirming] = useState(false);
  const [quitting, setQuitting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const question = exam.questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const unanswered = exam.questions.length - answeredCount;
  const isLast = currentIndex === exam.questions.length - 1;

  // Luôn giữ hàm nộp bài mới nhất để bộ đếm giờ gọi được khi hết giờ.
  // onSubmit có thể ném lỗi (ví dụ mất mạng): giữ nguyên bài làm và cho nộp lại.
  const submitRef = useRef(null);
  useEffect(() => {
    submitRef.current = async () => {
      setSubmitting(true);
      setSubmitError("");
      try {
        await onSubmit({
          answers,
          elapsedSec: Math.min(
            totalSeconds,
            Math.round((currentTime() - startedAt) / 1000),
          ),
        });
      } catch (err) {
        setSubmitError(err.message);
        setSubmitting(false);
        setConfirming(true);
      }
    };
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const left = totalSeconds - Math.floor((currentTime() - startedAt) / 1000);
      setRemaining(Math.max(0, left));
      if (left <= 0) {
        clearInterval(timer);
        submitRef.current?.();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [startedAt, totalSeconds]);

  function selectOption(optionIndex) {
    setAnswers((current) => ({ ...current, [question.id]: optionIndex }));
  }

  function clearAnswer() {
    setAnswers((current) => {
      const next = { ...current };
      delete next[question.id];
      return next;
    });
  }

  function toggleFlag() {
    setFlagged((current) =>
      current.includes(question.id)
        ? current.filter((id) => id !== question.id)
        : [...current, question.id],
    );
  }

  const lowTime = remaining <= 300;

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-emerald-700">{exam.level}</p>
          <h1 className="truncate text-lg font-bold text-gray-900">{exam.title}</h1>
        </div>
        <button
          type="button"
          onClick={() => setQuitting(true)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 transition hover:border-red-200 hover:text-red-600"
        >
          <X className="h-3.5 w-3.5" />
          Thoát
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_280px]">
        {/* Câu hỏi */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white">
                Câu {currentIndex + 1}/{exam.questions.length}
              </span>
              <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                {sectionLabel(question.section)}
              </span>
            </div>
            <button
              type="button"
              onClick={toggleFlag}
              aria-pressed={flagged.includes(question.id)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                flagged.includes(question.id)
                  ? "bg-amber-50 text-amber-700"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <Flag className="h-3.5 w-3.5" />
              {flagged.includes(question.id) ? "Bỏ đánh dấu" : "Đánh dấu xem lại"}
            </button>
          </div>

          <p className="mt-5 text-base font-semibold leading-relaxed text-gray-900">
            {question.text}
          </p>

          {question.section === "listening" && (
            <button
              type="button"
              onClick={() => speak(question.script)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
            >
              <Volume2 className="h-4 w-4" />
              Nghe đoạn hội thoại
            </button>
          )}

          {question.passage && (
            <blockquote className="mt-4 whitespace-pre-line rounded-xl border-l-4 border-emerald-300 bg-gray-50 p-4 text-base leading-loose text-gray-800">
              {question.passage}
            </blockquote>
          )}

          <fieldset className="mt-5 space-y-2.5">
            <legend className="sr-only">Chọn đáp án</legend>
            {question.options.map((option, optionIndex) => {
              const selected = answers[question.id] === optionIndex;
              return (
                <label
                  key={optionIndex}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 text-sm transition ${
                    selected
                      ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                      : "border-gray-200 bg-white text-gray-800 hover:border-emerald-200"
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    checked={selected}
                    onChange={() => selectOption(optionIndex)}
                    className="h-4 w-4 accent-emerald-600"
                  />
                  <span className="font-semibold text-gray-400">
                    {OPTION_MARKS[optionIndex]}
                  </span>
                  <span>{option}</span>
                </label>
              );
            })}
          </fieldset>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-5">
            <button
              type="button"
              onClick={() => setCurrentIndex((index) => index - 1)}
              disabled={currentIndex === 0}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Câu trước
            </button>

            {answers[question.id] !== undefined && (
              <button
                type="button"
                onClick={clearAnswer}
                className="text-xs font-semibold text-gray-500 hover:text-red-600"
              >
                Xóa lựa chọn
              </button>
            )}

            {isLast ? (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700"
              >
                <Send className="h-4 w-4" />
                Nộp bài
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentIndex((index) => index + 1)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700"
              >
                Câu sau
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </section>

        {/* Đồng hồ + bảng số câu */}
        <aside className="h-fit space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
          <div
            role="timer"
            aria-label="Thời gian còn lại"
            className={`flex items-center justify-between rounded-xl px-4 py-3 ${
              lowTime ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-800"
            }`}
          >
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
              <Clock className="h-4 w-4" />
              Còn lại
            </span>
            <span className="text-xl font-bold tabular-nums">
              {formatClock(remaining)}
            </span>
          </div>

          <p className="text-xs text-gray-500">
            Đã làm <span className="font-bold text-gray-800">{answeredCount}</span>/
            {exam.questions.length} câu
          </p>

          <TopikQuestionPalette
            questions={exam.questions}
            answers={answers}
            flagged={flagged}
            currentIndex={currentIndex}
            onJump={setCurrentIndex}
          />

          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
          >
            Nộp bài
          </button>
        </aside>
      </div>

      {confirming && (
        <ConfirmDialog
          title="Nộp bài?"
          confirmLabel="Nộp bài"
          busy={submitting}
          error={submitError}
          onCancel={() => setConfirming(false)}
          onConfirm={() => submitRef.current?.()}
        >
          {unanswered > 0
            ? `Bạn còn ${unanswered} câu chưa trả lời. Câu bỏ trống sẽ tính là sai.`
            : "Bạn đã trả lời tất cả các câu. Nộp bài để xem kết quả?"}
          {flagged.length > 0 && ` Có ${flagged.length} câu đang được đánh dấu xem lại.`}
        </ConfirmDialog>
      )}

      {quitting && (
        <ConfirmDialog
          title="Thoát khỏi bài làm?"
          confirmLabel="Thoát"
          danger
          onCancel={() => setQuitting(false)}
          onConfirm={onQuit}
        >
          Bài làm hiện tại sẽ không được lưu.
        </ConfirmDialog>
      )}
    </div>
  );
}

function ConfirmDialog({
  title,
  confirmLabel,
  danger,
  busy,
  error,
  onCancel,
  onConfirm,
  children,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 px-4 backdrop-blur-[2px]">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"
      >
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">{children}</p>
        {error && (
          <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-700">
            {error}
          </p>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`rounded-xl px-4 py-2 text-xs font-bold text-white disabled:opacity-60 ${
              danger ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {busy ? "Đang nộp..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
