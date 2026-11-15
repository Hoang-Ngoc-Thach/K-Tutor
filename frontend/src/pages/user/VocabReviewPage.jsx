import React from "react";
import { useState } from "react";
import ReviewSetup from "../../components/user/review/ReviewSetup";
import WordRainGame from "../../components/user/review/WordRainGame";
import SyllableBuilderGame from "../../components/user/review/SyllableBuilderGame";
import MemoryMatchGame from "../../components/user/review/MemoryMatchGame";
import TypingRainGame from "../../components/user/review/TypingRainGame";
import ReviewResult from "../../components/user/review/ReviewResult";
import {
  DEFAULT_SETTINGS,
  buildQueue,
  readBestScore,
  saveBestScore,
} from "../../components/user/review/reviewUtils";

const GAME_COMPONENTS = {
  choice: WordRainGame,
  builder: SyllableBuilderGame,
  memory: MemoryMatchGame,
  typing: TypingRainGame,
};

// Trang ôn tập từ vựng: chọn chủ đề + trò chơi -> chơi -> xem kết quả.
export default function VocabReviewPage() {
  const [phase, setPhase] = useState("setup"); // setup | playing | result
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [pool, setPool] = useState([]);
  const [queue, setQueue] = useState([]);
  const [gameKey, setGameKey] = useState(0);
  const [summary, setSummary] = useState(null);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [bestScore, setBestScore] = useState(0);

  function beginGame(words, nextPool, nextSettings, count) {
    setQueue(buildQueue(words, count));
    setPool(nextPool);
    setSettings(nextSettings);
    setGameKey((key) => key + 1);
    setSummary(null);
    setPhase("playing");
  }

  function handleStart(words, nextSettings) {
    beginGame(words, words, nextSettings, nextSettings.count);
  }

  function handleFinish(result) {
    const previousBest = readBestScore(settings.game);
    const record = result.score > previousBest;
    if (record) saveBestScore(settings.game, result.score);
    setBestScore(record ? result.score : previousBest);
    setIsNewRecord(record);
    setSummary(result);
    setPhase("result");
  }

  if (phase === "playing") {
    const Game = GAME_COMPONENTS[settings.game] ?? SyllableBuilderGame;
    return (
      <Game
        key={gameKey}
        queue={queue}
        pool={pool}
        settings={settings}
        onFinish={handleFinish}
        onQuit={() => setPhase("setup")}
      />
    );
  }

  if (phase === "result" && summary) {
    return (
      <ReviewResult
        summary={summary}
        isNewRecord={isNewRecord}
        bestScore={bestScore}
        onReplay={() => beginGame(pool, pool, settings, settings.count)}
        onReviewMissed={(words) => beginGame(words, pool, settings, "all")}
        onBackToSetup={() => setPhase("setup")}
      />
    );
  }

  return <ReviewSetup onStart={handleStart} />;
}
