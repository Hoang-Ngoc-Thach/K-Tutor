// Hằng số và hàm dùng chung cho phần luyện đề TOPIK.

export const TOPIK_LEVELS = ["TOPIK I", "TOPIK II"];

export const SECTIONS = [
  { value: "reading", label: "Đọc" },
  { value: "listening", label: "Nghe" },
];

export const OPTION_MARKS = ["①", "②", "③", "④"];

export function sectionLabel(section) {
  return SECTIONS.find((item) => item.value === section)?.label ?? "Đọc";
}

export function formatClock(totalSeconds) {
  const safe = Math.max(0, totalSeconds);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function formatDuration(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes} phút ${seconds} giây` : `${seconds} giây`;
}

export function bestAttempt(attempts, examId) {
  return attempts
    .filter((attempt) => attempt.examId === examId)
    .reduce((best, attempt) => (!best || attempt.score > best.score ? attempt : best), null);
}

export function emptyQuestion(section = "reading") {
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `q-${Math.random().toString(36).slice(2)}`,
    section,
    text: "",
    passage: "",
    script: "",
    options: ["", "", "", ""],
    answerIndex: 0,
    explanation: "",
  };
}

export function validateTopikExam(exam, audioDurationSec = null) {
  const errors = [];
  const questions = Array.isArray(exam.questions) ? exam.questions : [];
  const questionErrors = questions.map(() => []);

  if (!String(exam.title ?? "").trim()) {
    errors.push({ message: "Vui lòng nhập tên đề thi.", questionIndex: null });
  }
  if (questions.length === 0) {
    errors.push({
      message: "Đề thi cần ít nhất 1 câu hỏi.",
      questionIndex: null,
    });
  }

  const year = Number(exam.year);
  if (
    !String(exam.year ?? "").trim() ||
    !Number.isInteger(year) ||
    year < 2000 ||
    year > 2100
  ) {
    errors.push({
      message: "Năm phải là số nguyên từ 2000 đến 2100.",
      questionIndex: null,
    });
  }

  const durationMinutes = Number(exam.durationMinutes);
  if (
    !String(exam.durationMinutes ?? "").trim() ||
    !Number.isInteger(durationMinutes) ||
    durationMinutes < 1 ||
    durationMinutes > 300
  ) {
    errors.push({
      message: "Thời gian làm bài phải từ 1 đến 300 phút.",
      questionIndex: null,
    });
  }

  questions.forEach((question, index) => {
    const addQuestionError = (message) => {
      const error = `Câu ${index + 1}: ${message}`;
      questionErrors[index].push(error);
      errors.push({ message: error, questionIndex: index });
    };

    if (!String(question.text ?? "").trim()) {
      addQuestionError("chưa nhập nội dung câu hỏi.");
    }

    const options = Array.isArray(question.options) ? question.options : [];
    if (options.some((option) => !String(option ?? "").trim())) {
      addQuestionError("cần nhập đủ 4 đáp án.");
    }

    const uniqueOptions = new Set(
      options.map((option) => String(option ?? "").trim()),
    );
    if (uniqueOptions.size < options.length) {
      addQuestionError("các đáp án không được trùng nhau.");
    }

    if (
      question.section === "listening" &&
      !String(question.script ?? "").trim()
    ) {
      addQuestionError("câu nghe cần có kịch bản bài nghe.");
    }

    const startText = String(question.audioStartSec ?? "").trim();
    const endText = String(question.audioEndSec ?? "").trim();
    const start = Number(question.audioStartSec);
    const end = Number(question.audioEndSec);
    const hasStart = startText !== "";
    const hasEnd = endText !== "";

    if (
      (hasStart && (!Number.isFinite(start) || start < 0 || start * 10 % 1)) ||
      (hasEnd && (!Number.isFinite(end) || end < 0 || end * 10 % 1))
    ) {
      addQuestionError("mốc thời gian phải là số không âm, tối đa 1 chữ số thập phân.");
    }
    if (hasStart && hasEnd && end <= start) {
      addQuestionError("thời điểm kết thúc phải lớn hơn thời điểm bắt đầu.");
    }
    if (Number.isFinite(audioDurationSec)) {
      if (hasStart && start > audioDurationSec) {
        addQuestionError("thời điểm bắt đầu vượt quá thời lượng âm thanh.");
      }
      if (hasEnd && end > audioDurationSec) {
        addQuestionError("thời điểm kết thúc vượt quá thời lượng âm thanh.");
      }
    }
  });

  return { errors, questionErrors, isValid: errors.length === 0 };
}
