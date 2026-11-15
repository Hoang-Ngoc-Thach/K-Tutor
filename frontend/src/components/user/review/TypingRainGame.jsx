import React from "react";
import { useEffect, useReducer, useRef, useState } from "react";
import useSpeak from "../../../hooks/useSpeak";
import ReviewHud from "./ReviewHud";
import {
  ARENA_HEIGHT,
  BUBBLE_HEIGHT,
  MAX_LIVES,
  SPEEDS,
  matchesWord,
  shuffle,
} from "./reviewUtils";

const LANE_COUNT = 4;
const POP_REMOVE_MS = 600;
const NOTICE_MS = 2200;
const FIRST_SPAWN_MS = 700;
const EMPTY_SPAWN_MS = 450;
const FINISH_DELAY_MS = 900;

const currentTime = () => Date.now();

function createInitialState() {
  return {
    items: [], // các từ đang rơi hoặc vừa bị phá
    spawned: 0,
    lives: MAX_LIVES,
    score: 0,
    combo: 0,
    bestCombo: 0,
    results: [],
    notice: null,
  };
}

function reducer(state, action) {
  switch (action.type) {
    case "spawn":
      return {
        ...state,
        spawned: state.spawned + 1,
        items: [...state.items, action.item],
      };
    case "hit": {
      if (state.lives <= 0) return state;
      const item = state.items.find(
        (candidate) =>
          candidate.uid === action.uid && candidate.status === "falling",
      );
      if (!item) return state;
      const elapsed = action.now - item.at;
      const speedBonus = Math.round(
        50 * Math.max(0, 1 - elapsed / (item.duration * 1000)),
      );
      const gained = 100 + speedBonus + Math.min(state.combo, 5) * 10;
      const combo = state.combo + 1;
      return {
        ...state,
        score: state.score + gained,
        combo,
        bestCombo: Math.max(state.bestCombo, combo),
        results: [...state.results, { word: item.word, correct: true }],
        items: state.items.map((candidate) =>
          candidate.uid === action.uid
            ? { ...candidate, status: "popped", gained }
            : candidate,
        ),
      };
    }
    case "miss": {
      if (state.lives <= 0) return state;
      const item = state.items.find(
        (candidate) =>
          candidate.uid === action.uid && candidate.status === "falling",
      );
      if (!item) return state;
      return {
        ...state,
        lives: state.lives - 1,
        combo: 0,
        results: [...state.results, { word: item.word, correct: false }],
        items: state.items.filter((candidate) => candidate.uid !== action.uid),
        notice: { id: action.uid, word: item.word },
      };
    }
    case "remove":
      return {
        ...state,
        items: state.items.filter((candidate) => candidate.uid !== action.uid),
      };
    case "clearNotice":
      return { ...state, notice: null };
    default:
      return state;
  }
}

export default function TypingRainGame({ queue, settings, onFinish, onQuit }) {
  const speed = SPEEDS.find((item) => item.value === settings.speed) ?? SPEEDS[1];
  const { speak } = useSpeak();
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  const [value, setValue] = useState("");
  const [shake, setShake] = useState(false);
  const [laneOrder] = useState(() => shuffle([0, 1, 2, 3]));
  const inputRef = useRef(null);
  const timersRef = useRef([]);

  const fallingCount = state.items.filter(
    (item) => item.status === "falling",
  ).length;
  const isOver = state.lives <= 0;
  const allSpawned = state.spawned >= queue.length;
  const caught = state.results.filter((item) => item.correct).length;

  useEffect(
    () => () => {
      timersRef.current.forEach(clearTimeout);
    },
    [],
  );

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Cho từ tiếp theo xuất hiện; nếu màn hình đang trống thì ra nhanh hơn.
  useEffect(() => {
    if (isOver || allSpawned) return undefined;

    const delay =
      state.spawned === 0
        ? FIRST_SPAWN_MS
        : fallingCount === 0
          ? EMPTY_SPAWN_MS
          : speed.interval;

    const timer = setTimeout(() => {
      dispatch({
        type: "spawn",
        item: {
          uid: state.spawned,
          word: queue[state.spawned],
          lane: laneOrder[state.spawned % LANE_COUNT],
          duration: speed.seconds * (0.9 + Math.random() * 0.25),
          at: currentTime(),
          status: "falling",
        },
      });
    }, delay);
    return () => clearTimeout(timer);
  }, [
    isOver,
    allSpawned,
    state.spawned,
    fallingCount,
    speed,
    queue,
    laneOrder,
  ]);

  // Kết thúc khi hết mạng hoặc đã xử lý hết các từ.
  useEffect(() => {
    if (!isOver && !(allSpawned && fallingCount === 0)) return undefined;
    const timer = setTimeout(() => {
      onFinish({
        score: state.score,
        bestCombo: state.bestCombo,
        results: state.results,
        ended: isOver ? "lives" : "complete",
      });
    }, FINISH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [isOver, allSpawned, fallingCount, state, onFinish]);

  // Tự ẩn thông báo "rơi mất".
  useEffect(() => {
    if (!state.notice) return undefined;
    const timer = setTimeout(() => dispatch({ type: "clearNotice" }), NOTICE_MS);
    return () => clearTimeout(timer);
  }, [state.notice]);

  // Từ rơi lâu nhất (xuất hiện trước) được ưu tiên khi trùng nhau.
  function tryMatch(text) {
    if (isOver || !text.trim()) return false;
    const target = state.items.find(
      (item) => item.status === "falling" && matchesWord(text, item.word),
    );
    if (!target) return false;

    dispatch({ type: "hit", uid: target.uid, now: currentTime() });
    speak(target.word.korean);
    timersRef.current.push(
      setTimeout(
        () => dispatch({ type: "remove", uid: target.uid }),
        POP_REMOVE_MS,
      ),
    );
    setValue("");
    return true;
  }

  function handleChange(event) {
    const next = event.target.value;
    setValue(next);
    tryMatch(next);
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!tryMatch(value) && value.trim()) {
      setShake(true);
      timersRef.current.push(setTimeout(() => setShake(false), 350));
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-6 md:px-6">
      <ReviewHud
        lives={state.lives}
        score={state.score}
        combo={state.combo}
        progressLabel={`Đã phá ${caught} / ${queue.length} từ`}
        progress={state.results.length / queue.length}
        hint="Gõ chữ Hàn hoặc phiên âm rồi Enter"
        onQuit={onQuit}
      />

      <div
        aria-live="polite"
        className="mb-3 flex h-12 items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 text-center text-sm font-semibold shadow-sm"
      >
        {isOver ? (
          <span className="text-rose-600">Hết mạng!</span>
        ) : state.notice ? (
          <span className="text-rose-600">
            Rơi mất rồi! {state.notice.word.korean} = {state.notice.word.meaning}
          </span>
        ) : (
          <span className="text-gray-600">
            Đọc nghĩa của từ đang rơi và gõ từ tiếng Hàn tương ứng.
          </span>
        )}
      </div>

      <div
        className="relative overflow-hidden rounded-2xl border border-sky-100 bg-gradient-to-b from-sky-50 via-white to-emerald-50"
        style={{ height: ARENA_HEIGHT }}
        onClick={() => inputRef.current?.focus()}
      >
        {state.items.map((item) => (
          <div
            key={item.uid}
            className="word-rain-fall absolute top-0 px-1"
            style={{
              left: `${item.lane * (100 / LANE_COUNT)}%`,
              width: `${100 / LANE_COUNT}%`,
              height: BUBBLE_HEIGHT,
              "--rain-duration": `${item.duration}s`,
              "--rain-delay": "0s",
              "--rain-distance": `${ARENA_HEIGHT - BUBBLE_HEIGHT - 8}px`,
              animationPlayState:
                isOver || item.status === "popped" ? "paused" : "running",
            }}
            onAnimationEnd={(event) => {
              if (event.target !== event.currentTarget) return;
              dispatch({ type: "miss", uid: item.uid });
            }}
          >
            <div
              className={`word-rain-bubble flex h-full w-full items-center justify-center rounded-2xl border-2 px-2 text-center font-bold shadow-md ${
                item.status === "popped"
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : "border-emerald-200 bg-white text-gray-900"
              }`}
              data-state={item.status === "popped" ? "hit" : "idle"}
            >
              <span className="line-clamp-3 text-sm leading-tight sm:text-base">
                {item.status === "popped" ? item.word.korean : item.word.meaning}
              </span>
            </div>
          </div>
        ))}
        <div className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-t from-rose-200/70 to-transparent" />
      </div>

      <form onSubmit={handleSubmit} className="mt-3">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          disabled={isOver}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder="Gõ từ tiếng Hàn hoặc phiên âm..."
          aria-label="Nhập câu trả lời"
          className={`w-full rounded-xl border bg-white px-4 py-3 text-base text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 ${
            shake ? "builder-shake border-rose-300" : "border-gray-200"
          }`}
        />
      </form>
    </div>
  );
}
