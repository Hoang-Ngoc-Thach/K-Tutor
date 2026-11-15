// Hằng số và hàm dùng chung cho các trò chơi ôn tập từ vựng.

export const MAX_LIVES = 3;
export const ARENA_HEIGHT = 440;
export const BUBBLE_HEIGHT = 64;
export const MEMORY_BOARD_PAIRS = 6;

export const GAMES = [
  {
    value: "choice",
    label: "Mưa từ vựng",
    description:
      "Đọc nghĩa tiếng Việt rồi bấm đúng từ tiếng Hàn trong các bong bóng đang rơi xuống.",
  },
  {
    value: "builder",
    label: "Xếp âm tiết",
    description:
      "Đọc nghĩa tiếng Việt rồi ghép các âm tiết bị xáo trộn thành từ tiếng Hàn đúng.",
  },
  {
    value: "memory",
    label: "Lật thẻ trí nhớ",
    description:
      "Nhớ vị trí các thẻ, rồi lật từng cặp thẻ từ tiếng Hàn và nghĩa trùng nhau.",
  },
  {
    value: "typing",
    label: "Mưa chữ",
    description:
      "Nghĩa của từ rơi xuống như mưa. Gõ từ tiếng Hàn (hoặc phiên âm) để phá chúng.",
  },
];

// Mưa từ vựng và Mưa chữ: thời gian rơi (giây) và khoảng cách giữa hai lần xuất hiện (ms).
export const SPEEDS = [
  { value: "slow", label: "Chậm", seconds: 13, interval: 4200 },
  { value: "normal", label: "Vừa", seconds: 10, interval: 3200 },
  { value: "fast", label: "Nhanh", seconds: 7, interval: 2200 },
];

export const COUNTS = [
  { value: 10, label: "10 từ" },
  { value: 20, label: "20 từ" },
  { value: "all", label: "Tất cả" },
];

export const DEFAULT_SETTINGS = {
  game: "builder",
  speed: "normal",
  count: 10,
};

export function shuffle(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

export function buildQueue(words, count) {
  const shuffled = shuffle(words);
  return count === "all" ? shuffled : shuffled.slice(0, count);
}

// ---- So khớp câu trả lời gõ tay (Mưa chữ) ----

function normalizeKorean(text) {
  return String(text ?? "")
    .normalize("NFC")
    .replace(/\s+/g, "");
}

function normalizeRoman(text) {
  return String(text ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

// Chấp nhận chữ Hàn hoặc phiên âm (không phân biệt dấu, hoa/thường, khoảng trắng).
export function matchesWord(input, word) {
  const korean = normalizeKorean(input);
  if (korean && korean === normalizeKorean(word.korean)) return true;
  const roman = normalizeRoman(input);
  return Boolean(
    roman && word.pronunciation && roman === normalizeRoman(word.pronunciation),
  );
}

// ---- Tách từ tiếng Hàn thành các ô chữ (Xếp âm tiết) ----

const INITIALS = Array.from("ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ");
const MEDIALS = Array.from("ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ");
const FINALS = [
  "", "ㄱ", "ㄲ", "ㄳ", "ㄴ", "ㄵ", "ㄶ", "ㄷ", "ㄹ", "ㄺ", "ㄻ", "ㄼ", "ㄽ", "ㄾ",
  "ㄿ", "ㅀ", "ㅁ", "ㅂ", "ㅄ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
];

function splitSyllable(char) {
  const code = char.charCodeAt(0) - 0xac00;
  if (code < 0 || code > 11171) return [char];
  const parts = [
    INITIALS[Math.floor(code / 588)],
    MEDIALS[Math.floor((code % 588) / 28)],
    FINALS[code % 28],
  ];
  return parts.filter(Boolean);
}

// Trả về các nhóm (mỗi nhóm là một cụm không có khoảng trắng) gồm các ô chữ.
// Từ chỉ có 1 âm tiết sẽ được tách tiếp thành các nguyên âm/phụ âm.
export function splitIntoTiles(korean) {
  const groups = String(korean ?? "")
    .normalize("NFC")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => Array.from(part));
  const total = groups.reduce((sum, group) => sum + group.length, 0);
  return total < 2 ? groups.map((group) => group.flatMap(splitSyllable)) : groups;
}

// ---- Điểm cao nhất theo từng trò chơi ----

const bestKey = (game) => `kt_review_best_${game}`;

export function readBestScore(game) {
  try {
    return Number(localStorage.getItem(bestKey(game))) || 0;
  } catch {
    return 0;
  }
}

export function saveBestScore(game, score) {
  try {
    localStorage.setItem(bestKey(game), String(score));
  } catch {
    // Có thể bị chặn lưu trữ; điểm cao nhất chỉ là phần phụ.
  }
}
