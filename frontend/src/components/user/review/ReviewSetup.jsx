import React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Brain, CloudRain, Keyboard, Play, Puzzle } from "lucide-react";
import { getLevelsRequest, getLevelErrorMessage } from "../../../api/levels";
import { getTopicsRequest, getTopicErrorMessage } from "../../../api/topics";
import {
  getVocabulariesRequest,
  getVocabularyErrorMessage,
} from "../../../api/vocabularies";
import {
  COUNTS,
  DEFAULT_SETTINGS,
  GAMES,
  SPEEDS,
  readBestScore,
} from "./reviewUtils";

const GAME_ICONS = {
  choice: CloudRain,
  builder: Puzzle,
  memory: Brain,
  typing: Keyboard,
};

function OptionGroup({ label, options, value, onChange }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-gray-500">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={value === option.value}
            className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
              value === option.value
                ? "bg-emerald-600 text-white shadow-sm"
                : "border border-gray-200 bg-white text-gray-600 hover:border-emerald-200 hover:text-emerald-700"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ReviewSetup({ onStart }) {
  const [levels, setLevels] = useState([]);
  const [selectedLevelId, setSelectedLevelId] = useState("");
  const [topics, setTopics] = useState([]);
  const [selectedTopicIds, setSelectedTopicIds] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [levelsLoading, setLevelsLoading] = useState(true);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const bestScore = readBestScore(settings.game);

  useEffect(() => {
    let active = true;

    async function loadLevels() {
      try {
        const result = await getLevelsRequest();
        if (!active) return;
        const availableLevels = Array.isArray(result) ? result : [];
        setLevels(availableLevels);
        setSelectedLevelId(availableLevels[0]?.id ?? "");
      } catch (error) {
        if (active) setErrorMessage(getLevelErrorMessage(error));
      } finally {
        if (active) setLevelsLoading(false);
      }
    }

    loadLevels();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedLevelId) return undefined;

    let active = true;

    async function loadTopics() {
      setTopicsLoading(true);
      setErrorMessage("");
      try {
        const result = await getTopicsRequest(selectedLevelId);
        if (!active) return;
        const availableTopics = Array.isArray(result) ? result : [];
        setTopics(availableTopics);
        // Select every topic that has vocabulary by default.
        setSelectedTopicIds(
          availableTopics
            .filter((topic) => (topic.vocabularyCount ?? 0) > 0)
            .map((topic) => topic.id),
        );
      } catch (error) {
        if (active) {
          setTopics([]);
          setSelectedTopicIds([]);
          setErrorMessage(getTopicErrorMessage(error));
        }
      } finally {
        if (active) setTopicsLoading(false);
      }
    }

    loadTopics();
    return () => {
      active = false;
    };
  }, [selectedLevelId]);

  const selectableTopics = topics.filter(
    (topic) => (topic.vocabularyCount ?? 0) > 0,
  );
  const totalWords = topics
    .filter((topic) => selectedTopicIds.includes(topic.id))
    .reduce((sum, topic) => sum + (topic.vocabularyCount ?? 0), 0);
  const canStart = totalWords >= 2 && !starting && !topicsLoading;

  function selectLevel(levelId) {
    if (levelId === selectedLevelId) return;
    setSelectedLevelId(levelId);
    setTopics([]);
    setSelectedTopicIds([]);
    setTopicsLoading(true);
  }

  function toggleTopic(topicId) {
    setSelectedTopicIds((current) =>
      current.includes(topicId)
        ? current.filter((id) => id !== topicId)
        : [...current, topicId],
    );
  }

  function updateSetting(key, value) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  async function handleStart() {
    setStarting(true);
    setErrorMessage("");
    try {
      // The API returns the vocabulary of one topic per request.
      const lists = await Promise.all(
        selectedTopicIds.map((topicId) => getVocabulariesRequest(topicId)),
      );
      const unique = new Map();
      lists.flat().forEach((vocabulary) => unique.set(vocabulary.id, vocabulary));
      const words = [...unique.values()];

      if (words.length < 2) {
        setErrorMessage("Cần ít nhất 2 từ vựng để chơi. Hãy chọn thêm chủ đề.");
        return;
      }
      onStart(words, settings);
    } catch (error) {
      setErrorMessage(getVocabularyErrorMessage(error));
    } finally {
      setStarting(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-8 md:px-6">
      <header className="mb-7">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
          Ôn tập
        </p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          Ôn tập từ vựng
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-500">
          Chọn chủ đề và một trò chơi để ôn lại các từ vựng đã học. Trả lời
          đúng liên tiếp để tăng combo và phá kỷ lục của chính bạn.
        </p>
        {bestScore > 0 && (
          <p className="mt-2 text-xs font-semibold text-amber-600">
            Điểm cao nhất ở trò này: {bestScore}
          </p>
        )}
      </header>

      {levelsLoading ? (
        <p className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-500">
          Đang tải...
        </p>
      ) : levels.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">
            {errorMessage || "Chưa có cấp độ học. Vui lòng quay lại sau."}
          </p>
          <Link
            to="/"
            className="mt-4 inline-flex rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
          >
            Quay lại trang chủ
          </Link>
        </div>
      ) : (
        <div className="space-y-7">
          <section>
            <h2 className="mb-3 text-base font-semibold text-gray-900">
              Cấp độ
            </h2>
            <div className="flex gap-2 overflow-x-auto pb-2" aria-label="Chọn cấp độ">
              {levels.map((level) => (
                <button
                  key={level.id}
                  type="button"
                  onClick={() => selectLevel(level.id)}
                  aria-pressed={selectedLevelId === level.id}
                  className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    selectedLevelId === level.id
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "border border-gray-200 bg-white text-gray-600 hover:border-emerald-200 hover:text-emerald-700"
                  }`}
                >
                  {level.name}
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">
                Chủ đề muốn ôn
              </h2>
              {selectableTopics.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setSelectedTopicIds(
                      selectedTopicIds.length === selectableTopics.length
                        ? []
                        : selectableTopics.map((topic) => topic.id),
                    )
                  }
                  className="text-xs font-semibold text-emerald-700 hover:underline"
                >
                  {selectedTopicIds.length === selectableTopics.length
                    ? "Bỏ chọn tất cả"
                    : "Chọn tất cả"}
                </button>
              )}
            </div>

            {topicsLoading ? (
              <p className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-500">
                Đang tải...
              </p>
            ) : topics.length === 0 ? (
              <p className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-500">
                Cấp độ này hiện chưa có chủ đề học.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {topics.map((topic) => {
                  const count = topic.vocabularyCount ?? 0;
                  const checked = selectedTopicIds.includes(topic.id);
                  return (
                    <button
                      key={topic.id}
                      type="button"
                      disabled={count === 0}
                      onClick={() => toggleTopic(topic.id)}
                      aria-pressed={checked}
                      className={`flex items-center justify-between gap-3 rounded-2xl border p-4 text-left transition disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 ${
                        checked
                          ? "border-emerald-400 bg-emerald-50"
                          : "border-gray-200 bg-white hover:border-emerald-200"
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-gray-900">
                          {topic.name}
                        </span>
                        <span className="mt-0.5 block text-xs text-gray-500">
                          {count} từ vựng
                        </span>
                      </span>
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[11px] font-bold ${
                          checked
                            ? "border-emerald-600 bg-emerald-600 text-white"
                            : "border-gray-300 bg-white text-transparent"
                        }`}
                      >
                        ✓
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-gray-900">
              Trò chơi
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {GAMES.map((game) => {
                const Icon = GAME_ICONS[game.value];
                const selected = settings.game === game.value;
                return (
                  <button
                    key={game.value}
                    type="button"
                    onClick={() => updateSetting("game", game.value)}
                    aria-pressed={selected}
                    className={`rounded-2xl border p-4 text-left transition ${
                      selected
                        ? "border-emerald-400 bg-emerald-50"
                        : "border-gray-200 bg-white hover:border-emerald-200"
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                        selected
                          ? "bg-emerald-600 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="mt-3 block text-sm font-semibold text-gray-900">
                      {game.label}
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-gray-500">
                      {game.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5">
            {(settings.game === "typing" || settings.game === "choice") && (
              <OptionGroup
                label="Tốc độ rơi"
                options={SPEEDS}
                value={settings.speed}
                onChange={(value) => updateSetting("speed", value)}
              />
            )}
            <OptionGroup
              label="Số từ mỗi lượt"
              options={COUNTS}
              value={settings.count}
              onChange={(value) => updateSetting("count", value)}
            />
          </section>

          {errorMessage && (
            <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
              {errorMessage}
            </p>
          )}

          <div className="flex flex-col items-start gap-2">
            <button
              type="button"
              onClick={handleStart}
              disabled={!canStart}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
            >
              <Play className="h-4 w-4" />
              {starting ? "Đang chuẩn bị..." : "Bắt đầu"}
            </button>
            <p className="text-xs text-gray-500">
              {totalWords >= 2
                ? `Đã chọn ${totalWords} từ vựng.`
                : "Chọn các chủ đề có tổng cộng ít nhất 2 từ vựng."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
