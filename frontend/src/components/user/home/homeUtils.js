// Hàm dùng chung cho trang chủ học viên.

// Chưa có tên hiển thị trong tài khoản, nên lấy phần trước @ của email.
export function greetingName(email) {
  const local = String(email ?? "").split("@")[0];
  if (!local) return "bạn";
  return local.charAt(0).toUpperCase() + local.slice(1);
}

export function formatShortDate(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

// topicsByLevel: { [levelId]: Topic[] } -> tổng số chủ đề / từ vựng / ngữ pháp
export function sumCatalog(topicsByLevel) {
  const topics = Object.values(topicsByLevel).flat();
  return {
    topics: topics.length,
    vocabulary: topics.reduce((sum, topic) => sum + (topic.vocabularyCount ?? 0), 0),
    grammar: topics.reduce((sum, topic) => sum + (topic.grammarCount ?? 0), 0),
  };
}

// Tóm tắt các lượt làm đề: số lượt, điểm cao nhất, điểm trung bình.
export function summarizeAttempts(attempts) {
  if (attempts.length === 0) return { count: 0, best: 0, average: 0 };
  const scores = attempts.map((attempt) => attempt.score);
  return {
    count: attempts.length,
    best: Math.max(...scores),
    average: Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length),
  };
}

// Gợi ý tối đa `limit` đề: đề chưa làm trước, sau đó đề có điểm cao nhất thấp nhất.
export function suggestExams(exams, attempts, limit = 3) {
  const bestByExam = new Map();
  attempts.forEach((attempt) => {
    bestByExam.set(
      attempt.examId,
      Math.max(bestByExam.get(attempt.examId) ?? 0, attempt.score),
    );
  });

  const pending = exams.filter((exam) => !bestByExam.has(exam.id));
  const retry = exams
    .filter((exam) => bestByExam.has(exam.id))
    .sort((a, b) => bestByExam.get(a.id) - bestByExam.get(b.id));

  return [...pending, ...retry]
    .slice(0, limit)
    .map((exam) => ({ exam, best: bestByExam.get(exam.id) ?? null }));
}
