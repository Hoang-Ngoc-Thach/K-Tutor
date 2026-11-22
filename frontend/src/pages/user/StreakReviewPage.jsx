import React, { useEffect, useState } from "react";
import StreakIntro from "../../components/user/streak/StreakIntro";
import StageBar from "../../components/user/streak/StageBar";
import StageBreak from "../../components/user/streak/StageBreak";
import StreakComplete from "../../components/user/streak/StreakComplete";
import WordRainGame from "../../components/user/review/WordRainGame";
import SyllableBuilderGame from "../../components/user/review/SyllableBuilderGame";
import MemoryMatchGame from "../../components/user/review/MemoryMatchGame";
import TypingRainGame from "../../components/user/review/TypingRainGame";
import {
  completeDailyReviewRequest,
  getDailyReviewRequest,
  getStreakRequest,
  getStudyErrorMessage,
} from "../../api/study";

const GAME_COMPONENTS = {
  choice: WordRainGame,
  builder: SyllableBuilderGame,
  memory: MemoryMatchGame,
  typing: TypingRainGame,
};

const QUIT_NOTICE =
  "Bạn đã thoát giữa chừng nên phiên ôn tập chưa được tính vào chuỗi.";

// Ôn tập giữ chuỗi: 4 chặng, mỗi chặng một trò chơi, từ lấy ngẫu nhiên
// trong danh sách từ đã học. Hoàn thành cả 4 chặng thì hôm nay được tính vào chuỗi.
export default function StreakReviewPage() {
  const [streak, setStreak] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [phase, setPhase] = useState("intro"); // intro | playing | break | saving | done
  const [session, setSession] = useState(null);
  const [stageIndex, setStageIndex] = useState(0);
  const [collected, setCollected] = useState([]);
  const [stageSummary, setStageSummary] = useState(null);
  const [outcome, setOutcome] = useState(null);
  const [starting, setStarting] = useState(false);
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;

    getStreakRequest()
      .then((data) => {
        if (active) setStreak(data);
      })
      .catch((error) => {
        if (active) setLoadError(getStudyErrorMessage(error));
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  async function handleStart() {
    setStarting(true);
    setActionError("");
    setNotice("");
    try {
      const data = await getDailyReviewRequest();
      setSession(data);
      setStageIndex(0);
      setCollected([]);
      setPhase("playing");
    } catch (error) {
      setActionError(getStudyErrorMessage(error));
    } finally {
      setStarting(false);
    }
  }

  async function saveSession(results) {
    setPhase("saving");
    setActionError("");
    try {
      setOutcome(await completeDailyReviewRequest(results));
      setPhase("done");
    } catch (error) {
      setActionError(getStudyErrorMessage(error));
    }
  }

  function handleStageFinish(result) {
    const results = [...collected, ...result.results];
    setCollected(results);

    if (stageIndex + 1 >= session.stages.length) {
      saveSession(results);
      return;
    }
    setStageSummary({
      correct: result.results.filter((item) => item.correct).length,
      total: result.results.length,
      ended: result.ended,
    });
    setPhase("break");
  }

  function handleQuit() {
    setPhase("intro");
    setNotice(QUIT_NOTICE);
  }

  function backToIntro() {
    setStreak(null);
    setPhase("intro");
    setReloadKey((key) => key + 1);
  }

  if (phase === "playing" && session) {
    const stage = session.stages[stageIndex];
    const Game = GAME_COMPONENTS[stage.game];
    return (
      <>
        <StageBar stages={session.stages} index={stageIndex} />
        <Game
          key={stageIndex}
          queue={stage.words}
          pool={session.pool}
          settings={{ game: stage.game, speed: "normal", count: stage.words.length }}
          onFinish={handleStageFinish}
          onQuit={handleQuit}
        />
      </>
    );
  }

  if (phase === "break" && session && stageSummary) {
    return (
      <StageBreak
        stages={session.stages}
        index={stageIndex}
        summary={stageSummary}
        onContinue={() => {
          setStageIndex((index) => index + 1);
          setPhase("playing");
        }}
      />
    );
  }

  if (phase === "saving") {
    return (
      <div className="mx-auto w-full max-w-md flex-1 px-4 py-10 text-center">
        {actionError ? (
          <div className="rounded-2xl border border-red-100 bg-white p-6">
            <p role="alert" className="text-sm text-red-700">
              {actionError}
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Kết quả phiên ôn tập vẫn còn, bạn có thể thử lưu lại.
            </p>
            <button
              type="button"
              onClick={() => saveSession(collected)}
              className="mt-4 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              Thử lưu lại
            </button>
          </div>
        ) : (
          <p className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-500">
            Đang lưu kết quả...
          </p>
        )}
      </div>
    );
  }

  if (phase === "done" && outcome) {
    return (
      <StreakComplete outcome={outcome} results={collected} onAgain={backToIntro} />
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-8">
        <div role="alert" className="rounded-2xl border border-red-100 bg-red-50 p-5">
          <p className="text-sm text-red-700">{loadError}</p>
          <button
            type="button"
            onClick={() => {
              setLoadError("");
              setReloadKey((key) => key + 1);
            }}
            className="mt-3 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-red-700 ring-1 ring-red-200"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!streak) {
    return (
      <p className="mx-auto w-full max-w-2xl px-4 py-8 text-sm text-gray-500">
        Đang tải...
      </p>
    );
  }

  return (
    <StreakIntro
      streak={streak}
      starting={starting}
      error={actionError}
      notice={notice}
      onStart={handleStart}
    />
  );
}
