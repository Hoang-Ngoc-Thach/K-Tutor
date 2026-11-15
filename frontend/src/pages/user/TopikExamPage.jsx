import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Clock, FileQuestion, Play } from "lucide-react";
import TopikTakingForm from "../../components/user/topik/TopikTakingForm";
import TopikResult from "../../components/user/topik/TopikResult";
import {
  getTopikErrorMessage,
  getTopikExamRequest,
  submitTopikAttemptRequest,
} from "../../api/topikExams";

// Luồng một đề: giới thiệu -> làm bài -> kết quả.
export default function TopikExamPage() {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [phase, setPhase] = useState("intro"); // intro | taking | result
  const [attemptKey, setAttemptKey] = useState(0);
  const [outcome, setOutcome] = useState(null);

  useEffect(() => {
    let active = true;

    getTopikExamRequest(examId, { publishedOnly: true })
      .then((data) => {
        if (active) setExam(data);
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
  }, [examId]);

  // Server chấm điểm. Ném lỗi (đã dịch sang tiếng Việt) để form làm bài
  // giữ nguyên bài làm và cho học viên thử nộp lại.
  async function handleSubmit({ answers, elapsedSec }) {
    let response;
    try {
      response = await submitTopikAttemptRequest(exam.id, {
        answers,
        durationSec: elapsedSec,
      });
    } catch (err) {
      throw new Error(getTopikErrorMessage(err));
    }

    // Đáp án và giải thích chỉ được trả về sau khi nộp bài.
    const review = new Map(response.review.map((item) => [item.questionId, item]));
    const gradedExam = {
      ...exam,
      questions: exam.questions.map((question) => ({
        ...question,
        answerIndex: review.get(question.id)?.answerIndex,
        explanation: review.get(question.id)?.explanation ?? "",
      })),
    };

    setOutcome({
      gradedExam,
      answers,
      elapsedSec: response.durationSec,
      result: {
        score: response.score,
        correct: response.correct,
        total: response.total,
      },
    });
    setPhase("result");
  }

  function startExam() {
    setAttemptKey((key) => key + 1);
    setOutcome(null);
    setPhase("taking");
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <p className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-500">
          Đang tải...
        </p>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error || "Không tìm thấy đề thi."}
        </p>
        <Link
          to="/topik"
          className="mt-4 inline-flex rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
        >
          Về danh sách đề
        </Link>
      </div>
    );
  }

  if (exam.questions.length === 0) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <p className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-500">
          Đề này chưa có câu hỏi nào.
        </p>
      </div>
    );
  }

  if (phase === "taking") {
    return (
      <TopikTakingForm
        key={attemptKey}
        exam={exam}
        onSubmit={handleSubmit}
        onQuit={() => setPhase("intro")}
      />
    );
  }

  if (phase === "result" && outcome) {
    return (
      <TopikResult
        exam={outcome.gradedExam}
        answers={outcome.answers}
        result={outcome.result}
        elapsedSec={outcome.elapsedSec}
        onRetry={startExam}
      />
    );
  }

  const listeningCount = exam.questions.filter(
    (question) => question.section === "listening",
  ).length;

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 md:px-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
          {exam.level}
        </span>
        <h1 className="mt-3 text-xl font-bold text-gray-900">{exam.title}</h1>
        {exam.description && (
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            {exam.description}
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600">
          <span className="inline-flex items-center gap-1.5">
            <FileQuestion className="h-4 w-4 text-gray-400" />
            {exam.questions.length} câu
            {listeningCount > 0 && ` (${listeningCount} câu nghe)`}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-gray-400" />
            {exam.durationMinutes} phút
          </span>
        </div>

        <ul className="mt-6 list-disc space-y-1.5 rounded-xl bg-gray-50 py-4 pl-9 pr-4 text-sm text-gray-600">
          <li>Đồng hồ bắt đầu chạy khi bạn bấm "Bắt đầu làm bài".</li>
          <li>Hết giờ, hệ thống tự nộp bài với các câu đã chọn.</li>
          <li>Có thể đánh dấu câu cần xem lại và chuyển câu bằng bảng số câu.</li>
          {listeningCount > 0 && (
            <li>Câu nghe được đọc bằng giọng đọc của trình duyệt, bạn có thể nghe nhiều lần.</li>
          )}
        </ul>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={startExam}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            <Play className="h-4 w-4" />
            Bắt đầu làm bài
          </button>
          <Link
            to="/topik"
            className="rounded-xl border border-gray-200 px-6 py-3 text-center text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Quay lại
          </Link>
        </div>
      </section>
    </div>
  );
}
