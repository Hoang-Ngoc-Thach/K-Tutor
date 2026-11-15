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
