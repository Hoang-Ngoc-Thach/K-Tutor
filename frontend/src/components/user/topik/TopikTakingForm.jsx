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

function waitForLoadedMetadata(audio) {
  if (audio.readyState >= 1) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const handleLoadedMetadata = () => {
      audio.removeEventListener("error", handleError);
      resolve();
    };
    const handleError = () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      reject(new Error("Audio metadata could not be loaded."));
    };
    audio.addEventListener("loadedmetadata", handleLoadedMetadata, { once: true });
    audio.addEventListener("error", handleError, { once: true });
  });
}

// Form làm bài: câu hỏi trắc nghiệm, đồng hồ đếm ngược, bảng số câu, nộp bài.
// onSubmit({ answers, elapsedSec }) được gọi khi học viên nộp hoặc hết giờ.
export default function TopikTakingForm({ exam, audioMode = "practice", onSubmit, onQuit }) {
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
  const examAudioRef = useRef(null);
  const lastAudioTimeRef = useRef(0);
  const pendingExamResumeRef = useRef(null);
  const rangeRequestIdRef = useRef(0);
  const [audioTime, setAudioTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [hasStartedExamAudio, setHasStartedExamAudio] = useState(false);
  const [examAudioEnded, setExamAudioEnded] = useState(false);
  const [examAudioPlaying, setExamAudioPlaying] = useState(false);
  const [playingRange, setPlayingRange] = useState(false);
  const [audioError, setAudioError] = useState("");

  const question = exam.questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const unanswered = exam.questions.length - answeredCount;
  const isLast = currentIndex === exam.questions.length - 1;
  const hasAudio = Boolean(exam.audioUrl);
  const hasRange = question.audioStartSec != null && question.audioEndSec != null;

  useEffect(() => {
    const audio = examAudioRef.current;
    if (!audio) return undefined;
    const updateTime = () => {
      setAudioTime(audio.currentTime || 0);
      lastAudioTimeRef.current = audio.currentTime || 0;
      if (audio.duration && Number.isFinite(audio.duration)) setAudioDuration(audio.duration);
      if (audioMode === "practice" && playingRange && audio.currentTime >= Number(question.audioEndSec)) {
        audio.pause();
        setPlayingRange(false);
      }
    };
    const updateDuration = () => {
      if (Number.isFinite(audio.duration)) setAudioDuration(audio.duration);
    };
    const handleEnded = () => {
      setExamAudioEnded(true);
      setExamAudioPlaying(false);
      setPlayingRange(false);
    };
    const handlePlay = () => setExamAudioPlaying(true);
    const handlePause = () => setExamAudioPlaying(false);
    const preventSeeking = () => {
      if (audioMode === "exam" && hasStartedExamAudio && !examAudioEnded && Math.abs(audio.currentTime - lastAudioTimeRef.current) > 0.5) {
        audio.currentTime = lastAudioTimeRef.current;
      }
    };
    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("seeking", preventSeeking);
    updateDuration();
    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("seeking", preventSeeking);
    };
  }, [audioMode, examAudioEnded, hasStartedExamAudio, playingRange, question.audioEndSec]);

  useEffect(() => {
    if (audioMode !== "practice" || !hasAudio) return;
    const audio = examAudioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setPlayingRange(false);
    setAudioTime(0);
    return () => {
      rangeRequestIdRef.current += 1;
    };
  }, [currentIndex, audioMode, hasAudio]);

  useEffect(() => () => {
    rangeRequestIdRef.current += 1;
    examAudioRef.current?.pause();
  }, []);

  async function toggleExamAudio() {
    const audio = examAudioRef.current;
    if (!audio || examAudioEnded) return;
    setAudioError("");
    try {
      if (audio.error) {
        if (pendingExamResumeRef.current === null) {
          pendingExamResumeRef.current = hasStartedExamAudio
            ? Math.max(audio.currentTime || 0, lastAudioTimeRef.current || 0)
            : 0;
        }
        const resumeAt = pendingExamResumeRef.current;
        audio.load();
        await waitForLoadedMetadata(audio);
        lastAudioTimeRef.current = resumeAt;
        audio.currentTime = resumeAt;
        await audio.play();
        pendingExamResumeRef.current = null;
        setHasStartedExamAudio(true);
        return;
      }
      if (audio.paused && hasStartedExamAudio) {
        await audio.play();
      } else if (!hasStartedExamAudio) {
        audio.currentTime = 0;
        await audio.play();
        setHasStartedExamAudio(true);
      } else {
        audio.pause();
      }
    } catch {
      setAudioError("Không thể phát audio. Hãy bấm nút để thử phát lại.");
    }
  }

  async function toggleQuestionRange() {
    const requestId = ++rangeRequestIdRef.current;
    const audio = examAudioRef.current;
    if (!audio) return;
    if (playingRange) {
      rangeRequestIdRef.current += 1;
      audio.pause();
      setPlayingRange(false);
      return;
    }
    setAudioError("");
    try {
      if (audio.error) {
        audio.load();
        await waitForLoadedMetadata(audio);
        if (rangeRequestIdRef.current !== requestId) {
          audio.pause();
          return;
        }
      }
      audio.currentTime = Number(question.audioStartSec);
      await audio.play();
      if (rangeRequestIdRef.current !== requestId) {
        audio.pause();
        return;
      }
      setPlayingRange(true);
    } catch {
      setAudioError("Không thể phát audio. Vui lòng thử lại.");
    }
  }

  function formatAudioTime(seconds) {
    const safeSeconds = Math.max(0, Math.floor(seconds || 0));
    return `${Math.floor(safeSeconds / 60)}:${String(safeSeconds % 60).padStart(2, "0")}`;
  }

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
        {hasAudio && audioMode === "exam" && (
          <div className="sticky top-2 z-20 col-span-full rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm lg:top-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-amber-900">Chế độ thi thử — Audio chỉ phát 1 lần</p>
                <p className="mt-1 text-xs tabular-nums text-amber-800">{formatAudioTime(audioTime)} / {formatAudioTime(audioDuration)}</p>
              </div>
              <button type="button" onClick={toggleExamAudio} disabled={examAudioEnded} className="rounded-xl bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-50">
                {examAudioEnded ? "Đã phát xong audio phần nghe" : hasStartedExamAudio ? (examAudioPlaying ? "Tạm dừng audio" : "Tiếp tục audio") : "Bắt đầu phát audio"}
              </button>
            </div>
            {audioError && <p role="alert" className="mt-2 text-xs text-red-700">{audioError}</p>}
            {examAudioEnded && <p className="mt-2 text-xs font-semibold text-amber-900">Đã phát xong audio phần nghe</p>}
          </div>
        )}
        {hasAudio && <audio ref={examAudioRef} src={exam.audioUrl} preload="metadata" controls={audioMode === "practice" && question.section === "listening" && !hasRange} className={audioMode === "practice" && question.section === "listening" && !hasRange ? "col-span-full w-full" : "hidden"} />}
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
              {question.category && (
                <span className="rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">{question.category}</span>
              )}
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

          {question.section === "listening" && !hasAudio && (
            <button
              type="button"
              onClick={() => speak(question.script)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
            >
              <Volume2 className="h-4 w-4" />
              Nghe đoạn hội thoại
            </button>
          )}

          {question.section === "listening" && hasAudio && audioMode === "practice" && hasRange && (
            <button type="button" onClick={toggleQuestionRange} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100">
              <Volume2 className="h-4 w-4" />
              {playingRange ? "Dừng nghe" : `Nghe câu này (${Number(question.audioStartSec).toFixed(1)}s – ${Number(question.audioEndSec).toFixed(1)}s)`}
            </button>
          )}
          {audioError && audioMode === "practice" && <p role="alert" className="mt-2 text-xs text-red-700">{audioError}</p>}

          {question.passage && (
            <blockquote className="mt-4 whitespace-pre-line rounded-xl border-l-4 border-emerald-300 bg-gray-50 p-4 text-base leading-loose text-gray-800">
              {question.passage}
            </blockquote>
          )}

          {question.imageUrl && (
            <img src={question.imageUrl} alt={`Hình minh họa câu ${currentIndex + 1}`} className="mt-5 max-h-80 w-full rounded-xl border border-gray-200 object-contain" />
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
