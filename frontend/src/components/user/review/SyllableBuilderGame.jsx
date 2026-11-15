import React from "react";
import { useEffect, useRef, useState } from "react";
import { Lightbulb, SkipForward, Volume2 } from "lucide-react";
import useSpeak from "../../../hooks/useSpeak";
import ReviewHud from "./ReviewHud";
import { MAX_LIVES, shuffle, splitIntoTiles } from "./reviewUtils";

const CORRECT_DELAY_MS = 1100;
const WRONG_DELAY_MS = 700;
const REVEAL_DELAY_MS = 1800;

function makeRound(index, word) {
  const groups = splitIntoTiles(word.korean);
  const expected = groups.flat();
  const baseTiles = expected.map((text, id) => ({ id, text }));

  // Xáo trộn, cố gắng không để ra đúng thứ tự ban đầu.
  let tiles = shuffle(baseTiles);
  for (let attempt = 0; attempt < 5 && expected.length > 1; attempt += 1) {
    if (tiles.some((tile, position) => tile.text !== expected[position])) break;
    tiles = shuffle(baseTiles);
  }

  return {
    index,
    groups,
    expected,
    tiles,
    placed: Array(expected.length).fill(null), // id ô chữ đang nằm ở mỗi chỗ trống
    status: "playing", // playing | correct | wrong | revealed | over
    mistakes: 0,
    hints: 0,
  };
}

export default function SyllableBuilderGame({ queue, onFinish, onQuit }) {
  const { speak } = useSpeak();
  const timerRef = useRef(null);
  const [round, setRound] = useState(() => makeRound(0, queue[0]));
  const [stats, setStats] = useState({
    lives: MAX_LIVES,
    score: 0,
    combo: 0,
    bestCombo: 0,
    results: [],
  });

  const word = queue[round.index];
  const tileById = new Map(round.tiles.map((tile) => [tile.id, tile]));
  const playing = round.status === "playing";

  useEffect(() => () => clearTimeout(timerRef.current), []);

  function goNext(nextStats, delay) {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const isLast = round.index + 1 >= queue.length;
      if (nextStats.lives <= 0 || isLast) {
        onFinish({
          score: nextStats.score,
          bestCombo: nextStats.bestCombo,
          results: nextStats.results,
          ended: nextStats.lives <= 0 ? "lives" : "complete",
        });
        return;
      }
      setRound(makeRound(round.index + 1, queue[round.index + 1]));
    }, delay);
  }

  // Kiểm tra khi đã điền đủ các chỗ trống.
  function checkAnswer(placed, current) {
    const isRight = placed.every(
      (tileId, slot) => tileById.get(tileId)?.text === current.expected[slot],
    );

    if (isRight) {
      const clean = current.mistakes === 0 && current.hints === 0;
      const gained = clean ? 100 + Math.min(stats.combo, 5) * 10 : 40;
      const nextCombo = clean ? stats.combo + 1 : 0;
      const nextStats = {
        ...stats,
        score: stats.score + gained,
        combo: nextCombo,
        bestCombo: Math.max(stats.bestCombo, nextCombo),
        results: [...stats.results, { word, correct: clean }],
      };
      setStats(nextStats);
      setRound({ ...current, placed, status: "correct", gained });
      speak(word.korean);
      goNext(nextStats, CORRECT_DELAY_MS);
      return;
    }

    const nextLives = stats.lives - 1;
    const mistakes = current.mistakes + 1;

    if (nextLives <= 0) {
      const nextStats = {
        ...stats,
        lives: 0,
        combo: 0,
        results: [...stats.results, { word, correct: false }],
      };
      setStats(nextStats);
      setRound({ ...current, placed, mistakes, status: "over" });
      goNext(nextStats, REVEAL_DELAY_MS);
      return;
    }

    setStats({ ...stats, lives: nextLives, combo: 0 });
    setRound({ ...current, placed, mistakes, status: "wrong" });
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setRound((latest) => ({
        ...latest,
        placed: Array(latest.expected.length).fill(null),
        status: "playing",
      }));
    }, WRONG_DELAY_MS);
  }

  function placeTile(tileId) {
    if (!playing || round.placed.includes(tileId)) return;
    const slot = round.placed.indexOf(null);
    if (slot === -1) return;
    const placed = [...round.placed];
    placed[slot] = tileId;
    if (placed.includes(null)) {
      setRound({ ...round, placed });
    } else {
      checkAnswer(placed, round);
    }
  }

  function removeFromSlot(slot) {
    if (!playing || round.placed[slot] === null) return;
    const placed = [...round.placed];
    placed[slot] = null;
    setRound({ ...round, placed });
  }

  // Gợi ý: điền sẵn ô chữ đúng cho chỗ trống sai/chưa điền đầu tiên.
  function revealHint() {
    if (!playing) return;
    const slot = round.placed.findIndex(
      (tileId, position) =>
        tileById.get(tileId)?.text !== round.expected[position],
    );
    if (slot === -1) return;

    const candidate = round.tiles.find((tile) => {
      if (tile.text !== round.expected[slot]) return false;
      const position = round.placed.indexOf(tile.id);
      return position === -1 || position > slot;
    });
    if (!candidate) return;

    const placed = round.placed.map((tileId) =>
      tileId === candidate.id ? null : tileId,
    );
    placed[slot] = candidate.id;
    const next = { ...round, hints: round.hints + 1 };

    if (placed.includes(null)) {
      setRound({ ...next, placed });
    } else {
      checkAnswer(placed, next);
    }
  }

  // Bỏ qua: hiện đáp án, tính là từ chưa thuộc nhưng không mất mạng.
  function skipWord() {
    if (!playing) return;
    const usedIds = new Set();
    const placed = round.expected.map((text) => {
      const tile = round.tiles.find(
        (candidate) => candidate.text === text && !usedIds.has(candidate.id),
      );
      usedIds.add(tile.id);
      return tile.id;
    });
    const nextStats = {
      ...stats,
      combo: 0,
      results: [...stats.results, { word, correct: false }],
    };
    setStats(nextStats);
    setRound({ ...round, placed, status: "revealed" });
    goNext(nextStats, REVEAL_DELAY_MS);
  }

  const showAnswer = round.status === "revealed" || round.status === "over";
  const groupStarts = round.groups.map((_, groupIndex) =>
    round.groups
      .slice(0, groupIndex)
      .reduce((sum, group) => sum + group.length, 0),
  );

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-6 md:px-6">
      <ReviewHud
        lives={stats.lives}
        score={stats.score}
        combo={stats.combo}
        progressLabel={`Từ ${round.index + 1} / ${queue.length}`}
        progress={round.index / queue.length}
        onQuit={onQuit}
      />

      <section
        aria-live="polite"
        className="rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-sm sm:p-8"
      >
        <p className="text-xs font-semibold text-emerald-700">
          Ghép thành từ tiếng Hàn có nghĩa
        </p>
        <p className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
          {word.meaning}
        </p>
        <div className="mt-1 h-6 text-sm">
          {(round.status === "correct" || showAnswer) && word.pronunciation && (
            <span className="text-gray-500">{word.pronunciation}</span>
          )}
        </div>

        {/* Các chỗ trống */}
        <div
          className={`mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 ${
            round.status === "wrong" ? "builder-shake" : ""
          }`}
        >
          {round.groups.map((group, groupIndex) => {
            const start = groupStarts[groupIndex];
            return (
              <div key={groupIndex} className="flex gap-2">
                {group.map((_, offset) => {
                  const slot = start + offset;
                  const tile = tileById.get(round.placed[slot]);
                  const isCorrectSlot = tile?.text === round.expected[slot];
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => removeFromSlot(slot)}
                      disabled={!playing || !tile}
                      aria-label={
                        tile ? `Bỏ ô chữ ${tile.text}` : `Chỗ trống ${slot + 1}`
                      }
                      className={`flex h-14 w-12 items-center justify-center rounded-xl border-2 text-2xl font-bold transition sm:h-16 sm:w-14 ${
                        round.status === "correct" || (showAnswer && isCorrectSlot)
                          ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                          : round.status === "wrong"
                            ? "border-rose-300 bg-rose-50 text-rose-600"
                            : tile
                              ? "border-emerald-300 bg-white text-gray-900 hover:border-rose-300"
                              : "border-dashed border-gray-300 bg-gray-50"
                      }`}
                    >
                      {tile?.text}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div className="mt-2 h-6 text-sm font-semibold">
          {round.status === "correct" && (
            <span className="text-emerald-600">
              {round.gained >= 100 ? "Chính xác!" : "Đúng rồi!"} +{round.gained}
            </span>
          )}
          {round.status === "wrong" && (
            <span className="text-rose-600">Chưa đúng, thử lại nhé!</span>
          )}
          {showAnswer && (
            <span className="text-rose-600">
              {round.status === "over" ? "Hết mạng! " : ""}Đáp án: {word.korean}
            </span>
          )}
        </div>

        {/* Các ô chữ bị xáo trộn */}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {round.tiles.map((tile) => {
            const isPlaced = round.placed.includes(tile.id);
            return (
              <button
                key={tile.id}
                type="button"
                onClick={() => placeTile(tile.id)}
                disabled={!playing || isPlaced}
                className={`flex h-14 w-12 items-center justify-center rounded-xl border-2 text-2xl font-bold shadow-sm transition sm:h-16 sm:w-14 ${
                  isPlaced
                    ? "border-gray-100 bg-gray-50 text-transparent shadow-none"
                    : "border-emerald-200 bg-white text-gray-900 hover:-translate-y-0.5 hover:border-emerald-400 hover:bg-emerald-50"
                }`}
              >
                {tile.text}
              </button>
            );
          })}
        </div>
      </section>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => speak(word.korean)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 transition hover:border-emerald-200 hover:text-emerald-700"
        >
          <Volume2 className="h-4 w-4" />
          Nghe phát âm
        </button>
        <button
          type="button"
          onClick={revealHint}
          disabled={!playing}
          className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 transition hover:border-amber-300 hover:text-amber-700 disabled:opacity-40"
        >
          <Lightbulb className="h-4 w-4" />
          Gợi ý một ô
        </button>
        <button
          type="button"
          onClick={skipWord}
          disabled={!playing}
          className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 transition hover:border-gray-300 disabled:opacity-40"
        >
          <SkipForward className="h-4 w-4" />
          Bỏ qua
        </button>
      </div>
      <p className="mt-3 text-center text-xs text-gray-500">
        Bấm ô chữ để điền vào chỗ trống, bấm lại chỗ đã điền để gỡ ra. Dùng gợi
        ý thì từ đó không tính là đúng hoàn toàn.
      </p>
    </div>
  );
}
