import React, { useState } from "react";
import { Link } from "react-router-dom";
import TopicCard from "../topic-list/TopicCard";

const TOPICS_SHOWN = 6;

// Lộ trình học: các cấp độ thật từ API nối thành một đường đi.
// Bấm một cấp để xem các chủ đề của cấp đó.
export default function LearningPath({ levels, topicsByLevel }) {
  const firstWithTopics = levels.find(
    (level) => (topicsByLevel[level.id] ?? []).length > 0,
  );
  const [selectedId, setSelectedId] = useState(
    (firstWithTopics ?? levels[0])?.id,
  );

  const selectedTopics = topicsByLevel[selectedId] ?? [];
  const selectedLevel = levels.find((level) => level.id === selectedId);

  return (
    <section aria-labelledby="path-title">
      <div className="mb-5 flex items-end justify-between gap-3">
        <h2 id="path-title" className="text-lg font-bold text-gray-900">
          Lộ trình học
        </h2>
        <Link
          to="/topics"
          className="text-sm font-semibold text-emerald-700 hover:underline"
        >
          Xem tất cả chủ đề
        </Link>
      </div>

      <ol
        className="flex overflow-x-auto pb-3"
        aria-label="Các cấp độ, theo thứ tự học"
      >
        {levels.map((level, index) => {
          const topics = topicsByLevel[level.id] ?? [];
          const words = topics.reduce(
            (sum, topic) => sum + (topic.vocabularyCount ?? 0),
            0,
          );
          const selected = level.id === selectedId;
          const empty = topics.length === 0;

          return (
            <li key={level.id} className="relative min-w-[150px] flex-1">
              {index < levels.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute top-5 h-0.5 bg-gray-200"
                  style={{ left: "calc(50% + 26px)", width: "calc(100% - 52px)" }}
                />
              )}
              <button
                type="button"
                onClick={() => setSelectedId(level.id)}
                aria-pressed={selected}
                className="group flex w-full flex-col items-center px-2 text-center focus-visible:outline-none"
              >
                <span
                  className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition group-focus-visible:ring-2 group-focus-visible:ring-emerald-600 group-focus-visible:ring-offset-2 ${
                    selected
                      ? "bg-emerald-700 text-white"
                      : empty
                        ? "border border-dashed border-gray-300 bg-white text-gray-400"
                        : "border border-gray-300 bg-white text-gray-700 group-hover:border-emerald-500"
                  }`}
                >
                  {index + 1}
                </span>
                <span
                  className={`mt-2 text-sm font-semibold ${
                    selected ? "text-emerald-800" : "text-gray-800"
                  }`}
                >
                  {level.name}
                </span>
                <span className="mt-0.5 text-xs text-gray-500">
                  {empty
                    ? "Chưa có chủ đề"
                    : `${topics.length} chủ đề, ${words} từ`}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="mt-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">
          Chủ đề của {selectedLevel?.name}
        </h3>

        {selectedTopics.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gray-300 bg-white p-5 text-sm text-gray-500">
            Cấp độ này chưa có chủ đề nào. Hãy chọn cấp độ khác.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {selectedTopics.slice(0, TOPICS_SHOWN).map((topic) => (
                <TopicCard key={topic.id} topic={topic} />
              ))}
            </div>
            {selectedTopics.length > TOPICS_SHOWN && (
              <p className="mt-3 text-sm text-gray-500">
                Còn {selectedTopics.length - TOPICS_SHOWN} chủ đề nữa.{" "}
                <Link
                  to="/topics"
                  className="font-semibold text-emerald-700 hover:underline"
                >
                  Xem tất cả
                </Link>
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
