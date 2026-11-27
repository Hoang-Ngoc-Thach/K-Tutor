import { ApiError, apiFetch } from "./client";

// Học viên: /topik-exams (chỉ đề đã xuất bản, chưa có đáp án).
// Admin: /admin/topik-exams (đủ đề nháp, có đáp án).

const EXAM_FIELDS = [
  "title",
  "level",
  "year",
  "round",
  "durationMinutes",
  "status",
  "description",
  "audioUrl",
  "audioPublicId",
];

// Backend trả null cho các trường văn bản trống; form dùng chuỗi rỗng.
function normalizeQuestion(question) {
  return {
    ...question,
    passage: question.passage ?? "",
    script: question.script ?? "",
    explanation: question.explanation ?? "",
    imageUrl: question.imageUrl ?? "",
    imagePublicId: question.imagePublicId ?? "",
    audioStartSec: question.audioStartSec ?? null,
    audioEndSec: question.audioEndSec ?? null,
    category: question.category ?? "",
  };
}

function normalizeExam(exam) {
  const questions = exam.questions?.map(normalizeQuestion);
  return {
    ...exam,
    round: exam.round ?? "",
    description: exam.description ?? "",
    questions,
    // Danh sách chỉ trả số câu; chi tiết đề trả đủ câu hỏi.
    questionCount: exam.questionCount ?? questions?.length ?? 0,
  };
}

// Chỉ gửi các trường backend chấp nhận (không gửi id, createdAt...).
function toBody(exam) {
  const body = {};
  EXAM_FIELDS.forEach((field) => {
    if (exam[field] !== undefined) body[field] = exam[field];
  });
  if (exam.questions) {
    body.questions = exam.questions.map((question) => ({
      section: question.section,
      text: question.text,
      passage: question.passage,
      script: question.script,
      options: question.options,
      answerIndex: question.answerIndex,
      explanation: question.explanation,
      imageUrl: question.imageUrl,
      imagePublicId: question.imagePublicId,
      audioStartSec: question.audioStartSec,
      audioEndSec: question.audioEndSec,
      category: question.category,
    }));
  }
  return body;
}

// publishedOnly: học viên chỉ thấy đề đã xuất bản.
export async function getTopikExamsRequest({ publishedOnly = false } = {}) {
  const exams = await apiFetch(
    publishedOnly ? "/topik-exams" : "/admin/topik-exams",
  );
  return exams.map(normalizeExam);
}

export async function getTopikExamRequest(id, { publishedOnly = false } = {}) {
  const exam = await apiFetch(
    publishedOnly ? `/topik-exams/${id}` : `/admin/topik-exams/${id}`,
  );
  return normalizeExam(exam);
}

export async function createTopikExamRequest(body) {
  const exam = await apiFetch("/admin/topik-exams", {
    method: "POST",
    body: toBody(body),
  });
  return normalizeExam(exam);
}

// body có thể chỉ gồm một vài trường, ví dụ { status: "published" }.
export async function updateTopikExamRequest(id, body) {
  const exam = await apiFetch(`/admin/topik-exams/${id}`, {
    method: "PATCH",
    body: toBody(body),
  });
  return normalizeExam(exam);
}

export function deleteTopikExamRequest(id) {
  return apiFetch(`/admin/topik-exams/${id}`, { method: "DELETE" });
}

// Các lượt làm bài của chính học viên: { id, examId, score, correct, total, durationSec, createdAt }
export function getTopikAttemptsRequest() {
  return apiFetch("/topik-exams/attempts/me");
}

// Server chấm điểm. answers: { [questionId]: optionIndex }.
// Trả về { score, correct, total, durationSec, review: [{ questionId, answerIndex, explanation }] }.
export function submitTopikAttemptRequest(examId, { answers, durationSec }) {
  return apiFetch(`/topik-exams/${examId}/submit`, {
    method: "POST",
    body: {
      answers: Object.entries(answers).map(([questionId, answerIndex]) => ({
        questionId,
        answerIndex,
      })),
      durationSec,
    },
  });
}

// Backend messages are English codes; the UI shows Vietnamese.
export function getTopikErrorMessage(error) {
  if (!(error instanceof ApiError)) {
    return "Đã có lỗi xảy ra. Vui lòng thử lại.";
  }
  if (error.status === 0) {
    return "Không thể kết nối tới máy chủ. Vui lòng thử lại sau.";
  }
  if (error.status === 401) {
    return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
  }
  if (error.status === 403) {
    return "Bạn không có quyền thực hiện thao tác này.";
  }
  if (error.status === 404 && error.message.includes("TOPIK_EXAM_NOT_FOUND")) {
    return "Đề thi không còn tồn tại hoặc chưa được xuất bản.";
  }
  if (
    error.status === 409 &&
    error.message.includes("TOPIK_EXAM_TITLE_EXISTS")
  ) {
    return "Đã có đề thi cùng tên này.";
  }
  if (error.status === 400) {
    if (error.message.includes("TOPIK_LISTENING_SCRIPT_REQUIRED")) {
      return "Câu nghe cần có kịch bản bài nghe.";
    }
    if (error.message.includes("TOPIK_OPTIONS_DUPLICATED")) {
      return "Các đáp án trong cùng một câu không được trùng nhau.";
    }
    if (error.message.includes("TOPIK_INVALID_ANSWER")) {
      return "Bài làm chứa câu hỏi không thuộc đề này. Vui lòng tải lại trang.";
    }
    return "Thông tin không hợp lệ. Vui lòng kiểm tra lại.";
  }
  return "Đã có lỗi xảy ra. Vui lòng thử lại.";
}
