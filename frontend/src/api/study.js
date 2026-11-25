import { ApiError, apiFetch } from "./client";

export function getLearnedRequest(topicId) {
  const query = topicId ? `?topicId=${encodeURIComponent(topicId)}` : "";
  return apiFetch(`/study/learned${query}`);
}

// learned = true: đánh dấu đã học; false: bỏ đánh dấu. Trả về { learnedCount }.
export function setLearnedRequest(vocabularyIds, learned) {
  return apiFetch("/study/learned", {
    method: "PUT",
    body: { vocabularyIds, learned },
  });
}

// { today, current, longest, studiedToday, last7Days: [{ date, studied }], learnedCount, minWords }
export function getStreakRequest() {
  return apiFetch("/study/streak");
}

// { date, stages: [{ game, words }], pool }. Mỗi chặng là một trong 4 trò chơi.
export function getDailyReviewRequest() {
  return apiFetch("/study/daily-review");
}

// results: [{ word, correct }]. Trả về chuỗi mới cùng { streakIncreased, session }.
export function completeDailyReviewRequest(results) {
  return apiFetch("/study/daily-review/complete", {
    method: "POST",
    body: {
      results: results.map((item) => ({
        vocabularyId: item.word.id,
        correct: item.correct,
      })),
    },
  });
}

export function getStudyErrorMessage(error) {
  if (!(error instanceof ApiError)) {
    return "Đã có lỗi xảy ra. Vui lòng thử lại.";
  }
  if (error.status === 0) {
    return "Không thể kết nối tới máy chủ. Vui lòng thử lại sau.";
  }
  if (error.status === 401) {
    return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
  }
  if (
    error.status === 400 &&
    error.message.includes("NOT_ENOUGH_LEARNED_WORDS")
  ) {
    return 'Bạn cần đánh dấu "Đã nhớ" thêm từ vựng trước khi ôn tập giữ chuỗi.';
  }
  if (error.status === 400 && error.message.includes("INVALID_REVIEW_WORDS")) {
    return "Kết quả có từ chưa nằm trong danh sách đã học. Vui lòng tải lại trang.";
  }
  if (error.status === 404) {
    return "Từ vựng không còn tồn tại. Vui lòng tải lại trang.";
  }
  return "Đã có lỗi xảy ra. Vui lòng thử lại.";
}
