import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TopicCard from "../../components/user/topic-list/TopicCard";
import { getLevelsRequest, getLevelErrorMessage } from "../../api/levels";
import { getTopicsRequest, getTopicErrorMessage } from "../../api/topics";

export default function TopicListPage() {
  const [levels, setLevels] = useState([]);
  const [selectedLevelId, setSelectedLevelId] = useState("");
  const [topics, setTopics] = useState([]);
  const [levelsLoading, setLevelsLoading] = useState(true);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [levelsError, setLevelsError] = useState("");
  const [topicsError, setTopicsError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadLevels() {
      setLevelsLoading(true);
      setLevelsError("");
      try {
        const result = await getLevelsRequest();
        if (!active) return;
        const availableLevels = Array.isArray(result) ? result : [];
        setLevels(availableLevels);
        setSelectedLevelId(availableLevels[0]?.id ?? "");
      } catch (error) {
        if (active) setLevelsError(getLevelErrorMessage(error));
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
    if (!selectedLevelId) {
      return undefined;
    }

    let active = true;
    async function loadTopics() {
      setTopicsLoading(true);
      setTopicsError("");
      try {
        const result = await getTopicsRequest(selectedLevelId);
        if (active) setTopics(Array.isArray(result) ? result : []);
      } catch (error) {
        if (active) {
          setTopics([]);
          setTopicsError(getTopicErrorMessage(error));
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

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 md:px-6">
      <header className="mb-7">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
          Lộ trình học
        </p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          Chọn chủ đề từ vựng
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-500">
          Chọn cấp độ và một chủ đề để bắt đầu học bằng flashcard.
        </p>
      </header>

      {levelsLoading ? (
        <p className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-500">
          Đang tải...
        </p>
      ) : levelsError ? (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {levelsError}
        </p>
      ) : levels.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">
            Chưa có cấp độ học. Vui lòng quay lại sau.
          </p>
          <Link
            to="/"
            className="mt-4 inline-flex rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
          >
            Quay lại trang chủ
          </Link>
        </div>
      ) : (
        <>
          <div
            className="mb-7 flex gap-2 overflow-x-auto pb-2"
            aria-label="Chọn cấp độ"
          >
            {levels.map((level) => (
              <button
                key={level.id}
                type="button"
                onClick={() => {
                  if (selectedLevelId !== level.id) {
                    setSelectedLevelId(level.id);
                    setTopics([]);
                    setTopicsLoading(true);
                    setTopicsError("");
                  }
                }}
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

          <div className="mb-4">
            <h2 className="text-base font-semibold text-gray-900">
              Chủ đề học
            </h2>
          </div>

          {topicsLoading ? (
            <p className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-500">
              Đang tải...
            </p>
          ) : topicsError ? (
            <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
              {topicsError}
            </p>
          ) : topics.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-sm text-gray-500">
                Cấp độ này hiện chưa có chủ đề học.
              </p>
              <Link
                to="/"
                className="mt-4 inline-flex rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                Quay lại trang chủ
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {topics.map((topic) => (
                <TopicCard key={topic.id} topic={topic} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
