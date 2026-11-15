import React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2 } from "lucide-react";
import useSpeak from "../../../hooks/useSpeak";
import ReviewHud from "./ReviewHud";
import {
  ARENA_HEIGHT,
  BUBBLE_HEIGHT,
  MAX_LIVES,
  SPEEDS,
  shuffle,
} from "./reviewUtils";

const MAX_BUBBLES = 4;
const CORRECT_DELAY_MS = 750;
const MISSED_DELAY_MS = 1500;
const OVER_DELAY_MS = 900;

const currentTime = () => Date.now();
const normalize = (value) => String(value ?? "").trim().toLowerCase();

// Một lượt: đáp án đúng + tối đa 3 đáp án nhiễu lấy từ chính các từ đã chọn.
function buildBubbles(target, pool, baseSeconds, combo) {
  const seen = new Set([normalize(target.korean)]);
  const distractors = [];

  for (const word of shuffle(pool)) {
    const key = normalize(word.korean);
    if (word.id === target.id || !key || seen.has(key)) continue;
    seen.add(key);
    distractors.push(word);
    if (distractors.length === MAX_BUBBLES - 1) break;
  }

  // Combo càng cao, bong bóng rơi càng nhanh (có giới hạn).
  const seconds = Math.max(baseSeconds * 0.55, baseSeconds - combo * 0.35);

  return shuffle([target, ...distractors]).map((word, lane) => ({
    id: word.id,
    word,
    lane,
    isCorrect: word.id === target.id,
    delay: Math.random() * 1.0,
    duration: seconds * (0.9 + Math.random() * 0.25),
  }));
}

// Mưa từ vựng: nghĩa tiếng Việt ở trên, bấm đúng bong bóng từ tiếng Hàn đang rơi.
export default function WordRainGame({ queue, pool, settings, onFinish, onQuit }) {
  const wordPool = pool?.length ? pool : queue;
  // Trò này rơi nhanh hơn "Mưa chữ" vì chỉ cần bấm, không cần gõ.
  const baseSeconds =
    (SPEEDS.find((speed) => speed.value === settings.speed)?.seconds ?? 10) *
    0.75;
  const { speak } = useSpeak();
  const timerRef = useRef(null);

  const makeRound = useCallback(
    (index, comboNow) => ({
      index,
      status: "playing", // playing | correct | missed | over
      wrongIds: [],
      gained: 0,
      startedAt: currentTime(),
      bubbles: buildBubbles(queue[index], wordPool, baseSeconds, comboNow),
    }),
    [baseSeconds, queue, wordPool],
  );

  const [round, setRound] = useState(() => makeRound(0, 0));
  const [lives, setLives] = useState(MAX_LIVES);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [results, setResults] = useState([]);

  const target = queue[round.index];

  useEffect(() => () => clearTimeout(timerRef.current), []);

  // Chờ một chút rồi sang từ tiếp theo, hoặc kết thúc trò chơi.
  function scheduleNext(next, delay) {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const isLast = round.index + 1 >= queue.length;
      if (next.lives <= 0 || isLast) {
        onFinish({
          score: next.score,
          bestCombo: next.bestCombo,
          results: next.results,
          ended: next.lives <= 0 ? "lives" : "complete",
        });
        return;
      }
      setRound(makeRound(round.index + 1, next.combo));
    }, delay);
  }

  function handlePick(bubble) {
    if (round.status !== "playing" || round.wrongIds.includes(bubble.id)) {
      return;
    }

    if (bubble.isCorrect) {
      const clean = round.wrongIds.length === 0;
      const totalMs = (bubble.delay + bubble.duration) * 1000;
      const elapsed = currentTime() - round.startedAt;
      const speedBonus = Math.round(50 * Math.max(0, 1 - elapsed / totalMs));
      const gained = clean ? 100 + speedBonus + Math.min(combo, 5) * 10 : 40;
      const next = {
        lives,
        score: score + gained,
        combo: clean ? combo + 1 : 0,
        bestCombo: Math.max(bestCombo, clean ? combo + 1 : 0),
        results: [...results, { word: target, correct: clean }],
      };

      setScore(next.score);
      setCombo(next.combo);
      setBestCombo(next.bestCombo);
      setResults(next.results);
      setRound({ ...round, status: "correct", gained });
      speak(target.korean);
      scheduleNext(next, CORRECT_DELAY_MS);
      return;
    }

    const nextLives = lives - 1;
    const wrongIds = [...round.wrongIds, bubble.id];
    setLives(nextLives);
    setCombo(0);

    if (nextLives <= 0) {
      const next = {
        lives: 0,
        score,
        combo: 0,
        bestCombo,
        results: [...results, { word: target, correct: false }],
      };
      setResults(next.results);
      setRound({ ...round, status: "over", wrongIds });
      scheduleNext(next, OVER_DELAY_MS);
      return;
    }

    setRound({ ...round, wrongIds });
  }

  // Chỉ bong bóng đúng mới quan trọng: rơi chạm đáy nghĩa là trượt từ này.
  function handleBubbleEnd(bubble) {
    if (!bubble.isCorrect || round.status !== "playing") return;

    const nextLives = lives - 1;
    const next = {
      lives: nextLives,
      score,
      combo: 0,
      bestCombo,
      results: [...results, { word: target, correct: false }],
    };
    setLives(nextLives);
    setCombo(0);
    setResults(next.results);
    setRound({ ...round, status: "missed" });
    scheduleNext(next, MISSED_DELAY_MS);
  }

  // Phím 1-4 chọn bong bóng ở cột tương ứng.
  useEffect(() => {
    function handleKeyDown(event) {
      const bubble = round.bubbles[Number(event.key) - 1];
      if (bubble) handlePick(bubble);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const resolved = round.status !== "playing";

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-6 md:px-6">
      <ReviewHud
        lives={lives}
        score={score}
        combo={combo}
        progressLabel={`Từ ${round.index + 1} / ${queue.length}`}
        progress={round.index / queue.length}
        hint="Phím 1-4 để chọn nhanh"
        onQuit={onQuit}
      />

      <div
        aria-live="polite"
        className="mb-3 rounded-2xl border border-gray-200 bg-white p-4 text-center shadow-sm"
      >
        <p className="text-xs font-semibold text-emerald-700">
          Tìm từ tiếng Hàn có nghĩa
        </p>
        <p className="mt-2 text-xl font-bold text-gray-900 sm:text-2xl">
          {target.meaning}
        </p>
        <div className="mt-2 h-6 text-sm font-semibold">
          {round.status === "correct" && (
            <span className="inline-flex items-center gap-1.5 text-emerald-600">
              {round.gained >= 100 ? "Chính xác!" : "Đúng rồi!"} +{round.gained}
              <Volume2 className="h-4 w-4" />
            </span>
          )}
          {round.status === "missed" && (
            <span className="text-rose-600">
              Rơi mất rồi! Đáp án: {target.korean}
            </span>
          )}
          {round.status === "over" && (
            <span className="text-rose-600">Hết mạng!</span>
          )}
        </div>
      </div>

      <div
        className="relative overflow-hidden rounded-2xl border border-sky-100 bg-gradient-to-b from-sky-50 via-white to-emerald-50"
        style={{ height: ARENA_HEIGHT }}
      >
        <div
          className="absolute inset-0 grid gap-2 px-2"
          style={{
            gridTemplateColumns: `repeat(${round.bubbles.length}, minmax(0, 1fr))`,
          }}
        >
          {round.bubbles.map((bubble) => {
            const isWrong = round.wrongIds.includes(bubble.id);
            const isHit = round.status === "correct" && bubble.isCorrect;
            const isRevealed = round.status === "missed" && bubble.isCorrect;
            const dimmed = resolved && !isHit && !isRevealed;

            return (
              <div key={`${round.index}-${bubble.id}`} className="relative">
                <div
                  className="word-rain-fall absolute inset-x-0 top-0"
                  style={{
                    height: BUBBLE_HEIGHT,
                    "--rain-duration": `${bubble.duration}s`,
                    "--rain-delay": `${bubble.delay}s`,
                    "--rain-distance": `${ARENA_HEIGHT - BUBBLE_HEIGHT - 8}px`,
                    animationPlayState: resolved ? "paused" : "running",
                  }}
                  onAnimationEnd={() => handleBubbleEnd(bubble)}
                >
                  <button
                    type="button"
                    onClick={() => handlePick(bubble)}
                    disabled={isWrong || dimmed}
                    aria-label={`Đáp án ${bubble.lane + 1}: ${bubble.word.korean}`}
                    data-state={
                      isHit ? "hit" : isWrong ? "wrong" : isRevealed ? "reveal" : "idle"
                    }
                    className={`word-rain-bubble relative flex h-full w-full items-center justify-center rounded-2xl border-2 px-2 text-center shadow-md transition-colors ${
                      isWrong
                        ? "border-rose-200 bg-rose-50 text-rose-300"
                        : isHit
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : isRevealed
                            ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                            : "border-emerald-200 bg-white text-gray-900 hover:border-emerald-400 hover:bg-emerald-50"
                    } ${dimmed ? "opacity-40" : ""}`}
                  >
                    <span className="absolute left-2 top-1 text-[10px] font-semibold text-gray-300">
                      {bubble.lane + 1}
                    </span>
                    <span className="line-clamp-2 text-lg font-bold leading-tight sm:text-xl">
                      {bubble.word.korean}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-t from-rose-200/70 to-transparent" />
      </div>
    </div>
  );
}
