import React from "react";
import { useEffect, useRef, useState } from "react";
import useSpeak from "../../../hooks/useSpeak";
import ReviewHud from "./ReviewHud";
import { MEMORY_BOARD_PAIRS, shuffle } from "./reviewUtils";

const PEEK_BASE_MS = 1500;
const PEEK_PER_PAIR_MS = 400;
const MISMATCH_DELAY_MS = 900;
const BOARD_DONE_DELAY_MS = 1200;

// Chia đều các từ thành các bàn chơi, mỗi bàn tối đa MEMORY_BOARD_PAIRS cặp.
function splitIntoBoards(queue) {
  const boardCount = Math.ceil(queue.length / MEMORY_BOARD_PAIRS);
  const size = Math.ceil(queue.length / boardCount);
  return Array.from({ length: boardCount }, (_, index) =>
    queue.slice(index * size, (index + 1) * size),
  );
}

function makeBoard(index, words) {
  const cards = shuffle(
    words.flatMap((word) => [
      {
        id: `${word.id}-korean`,
        wordId: word.id,
        side: "korean",
        text: word.korean,
        sub: word.pronunciation,
      },
      {
        id: `${word.id}-meaning`,
        wordId: word.id,
        side: "meaning",
        text: word.meaning,
      },
    ]),
  );
  return {
    index,
    words,
    cards,
    flipped: [],
    matched: [],
    peeking: true,
    locked: false,
    moves: 0,
    mistakes: {}, // wordId -> số lần lật nhầm
  };
}

export default function MemoryMatchGame({ queue, onFinish, onQuit }) {
  const { speak } = useSpeak();
  const timerRef = useRef(null);
  const [boards] = useState(() => splitIntoBoards(queue));
  const [board, setBoard] = useState(() => makeBoard(0, boards[0]));
  const [stats, setStats] = useState({
    score: 0,
    combo: 0,
    bestCombo: 0,
    results: [],
  });

  useEffect(() => () => clearTimeout(timerRef.current), []);

  // Cho xem trước tất cả thẻ rồi úp lại.
  useEffect(() => {
    const peekMs = PEEK_BASE_MS + board.words.length * PEEK_PER_PAIR_MS;
    const timer = setTimeout(() => {
      setBoard((latest) =>
        latest.index === board.index ? { ...latest, peeking: false } : latest,
      );
    }, peekMs);
    return () => clearTimeout(timer);
  }, [board.index, board.words.length]);

  function finishBoard(current, nextStats) {
    const results = [
      ...nextStats.results,
      ...current.words.map((word) => ({
        word,
        correct: !current.mistakes[word.id],
      })),
    ];
    const finalStats = { ...nextStats, results };
    setStats(finalStats);

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (current.index + 1 >= boards.length) {
        onFinish({
          score: finalStats.score,
          bestCombo: finalStats.bestCombo,
          results: finalStats.results,
          ended: "complete",
        });
        return;
      }
      setBoard(makeBoard(current.index + 1, boards[current.index + 1]));
    }, BOARD_DONE_DELAY_MS);
  }

  function handleFlip(card) {
    if (
      board.peeking ||
      board.locked ||
      board.matched.includes(card.id) ||
      board.flipped.includes(card.id)
    ) {
      return;
    }

    const flipped = [...board.flipped, card.id];
    if (flipped.length < 2) {
      setBoard({ ...board, flipped });
      return;
    }

    const first = board.cards.find((item) => item.id === board.flipped[0]);
    const moves = board.moves + 1;

    if (first.wordId === card.wordId) {
      const matched = [...board.matched, first.id, card.id];
      const gained = 100 + Math.min(stats.combo, 5) * 10;
      const nextStats = {
        ...stats,
        score: stats.score + gained,
        combo: stats.combo + 1,
        bestCombo: Math.max(stats.bestCombo, stats.combo + 1),
      };
      const next = { ...board, flipped: [], matched, moves };
      setBoard(next);
      setStats(nextStats);
      speak(first.side === "korean" ? first.text : card.text);
      if (matched.length === board.cards.length) finishBoard(next, nextStats);
      return;
    }

    const mistakes = { ...board.mistakes };
    [first.wordId, card.wordId].forEach((wordId) => {
      mistakes[wordId] = (mistakes[wordId] ?? 0) + 1;
    });
    setBoard({ ...board, flipped, locked: true, moves, mistakes });
    setStats({ ...stats, combo: 0 });
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setBoard((latest) => ({ ...latest, flipped: [], locked: false }));
    }, MISMATCH_DELAY_MS);
  }

  const pairCount = board.words.length;
  const matchedPairs = board.matched.length / 2;
  const progress = (board.index + matchedPairs / pairCount) / boards.length;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-6 md:px-6">
      <ReviewHud
        lives={null}
        score={stats.score}
        combo={stats.combo}
        progressLabel={`Bàn ${board.index + 1} / ${boards.length} · ${matchedPairs}/${pairCount} cặp`}
        progress={progress}
        hint={`Lượt lật: ${board.moves}`}
        onQuit={onQuit}
      />

      <p
        aria-live="polite"
        className="mb-3 rounded-2xl border border-gray-200 bg-white p-3 text-center text-sm font-semibold text-gray-700 shadow-sm"
      >
        {board.peeking
          ? "Ghi nhớ vị trí các thẻ, sắp úp lại rồi!"
          : "Lật hai thẻ: từ tiếng Hàn và nghĩa tương ứng của nó."}
      </p>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {board.cards.map((card, position) => {
          const isMatched = board.matched.includes(card.id);
          const isFaceUp =
            board.peeking || isMatched || board.flipped.includes(card.id);
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => handleFlip(card)}
              disabled={isMatched}
              aria-label={isFaceUp ? card.text : `Thẻ ${position + 1}`}
              className="memory-card h-24 sm:h-28"
            >
              <span className="memory-card-inner" data-flipped={isFaceUp}>
                <span className="memory-card-face memory-card-front flex items-center justify-center rounded-2xl border-2 border-emerald-200 bg-emerald-600 text-2xl font-bold text-emerald-100 shadow-sm transition hover:bg-emerald-700">
                  ?
                </span>
                <span
                  className={`memory-card-face memory-card-back flex flex-col items-center justify-center rounded-2xl border-2 px-2 text-center shadow-sm ${
                    isMatched
                      ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                      : "border-emerald-200 bg-white text-gray-900"
                  }`}
                >
                  <span
                    className={`line-clamp-3 font-bold leading-tight ${
                      card.side === "korean"
                        ? card.text.length > 5
                          ? "text-sm sm:text-base"
                          : "text-xl"
                        : "text-xs sm:text-sm"
                    }`}
                  >
                    {card.text}
                  </span>
                  {card.side === "korean" && card.sub && (
                    <span className="mt-0.5 text-[10px] font-normal text-gray-500">
                      {card.sub}
                    </span>
                  )}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
