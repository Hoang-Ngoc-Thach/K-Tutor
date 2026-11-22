import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getLevelsRequest } from "../../../api/levels";
import { getTopicsRequest, getTopicErrorMessage } from "../../../api/topics";
import {
  getTopikAttemptsRequest,
  getTopikErrorMessage,
  getTopikExamsRequest,
} from "../../../api/topikExams";
import LearningPath from "./LearningPath";
import ReviewPanel from "./ReviewPanel";
import TopikPanel from "./TopikPanel";
import { greetingName, sumCatalog } from "./homeUtils";

function LoadError({ message, onRetry }) {
  return (
    <div role="alert" className="rounded-2xl border border-red-100 bg-red-50 p-5">
      <p className="text-sm text-red-700">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-red-700 ring-1 ring-red-200 hover:bg-red-50"
      >
        Thử lại
      </button>
    </div>
  );
}

function LoadingBlock({ label }) {
  return (
    <p className="rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-500">
      {label}
    </p>
  );
}

// Trang chủ của người đã đăng nhập: mọi số liệu lấy từ API, không gán cứng.
export default function LearnerHome({ user }) {
  const [catalog, setCatalog] = useState({ status: "loading" });
  const [topik, setTopik] = useState({ status: "loading" });
  const [catalogKey, setCatalogKey] = useState(0);
  const [topikKey, setTopikKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const levels = await getLevelsRequest();
        const lists = await Promise.all(
          levels.map((level) => getTopicsRequest(level.id)),
        );
        if (!active) return;
        setCatalog({
          status: "ready",
          levels,
          topicsByLevel: Object.fromEntries(
            levels.map((level, index) => [level.id, lists[index]]),
          ),
        });
      } catch (error) {
        if (active) {
          setCatalog({
            status: "error",
            message: getTopicErrorMessage(error),
          });
        }
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [catalogKey]);

  useEffect(() => {
    let active = true;

    Promise.all([
      getTopikExamsRequest({ publishedOnly: true }),
      getTopikAttemptsRequest(),
    ])
      .then(([exams, attempts]) => {
        if (active) setTopik({ status: "ready", exams, attempts });
      })
      .catch((error) => {
        if (active) {
          setTopik({ status: "error", message: getTopikErrorMessage(error) });
        }
      });

    return () => {
      active = false;
    };
  }, [topikKey]);

  const totals =
    catalog.status === "ready" ? sumCatalog(catalog.topicsByLevel) : null;

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 space-y-10 px-4 py-8 md:px-6">
      {/* Lời chào + số liệu thật */}
      <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            Xin chào, {greetingName(user.email)}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-600">
            {totals
              ? totals.topics === 0
                ? "Chưa có chủ đề nào được mở. Bạn quay lại sau nhé."
                : `Hiện có ${totals.vocabulary} từ vựng và ${totals.grammar} bài ngữ pháp trong ${totals.topics} chủ đề để bạn học và ôn tập.`
              : "Đang tải kho học liệu..."}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/topics"
            className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          >
            Học theo chủ đề
          </Link>
          {user.role === "admin" && (
            <Link
              to="/admin"
              className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Trang quản trị
            </Link>
          )}
        </div>
      </header>

      {/* Lộ trình học */}
      {catalog.status === "loading" && <LoadingBlock label="Đang tải lộ trình học..." />}
      {catalog.status === "error" && (
        <LoadError
          message={catalog.message}
          onRetry={() => {
            setCatalog({ status: "loading" });
            setCatalogKey((key) => key + 1);
          }}
        />
      )}
      {catalog.status === "ready" &&
        (catalog.levels.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-500">
            Chưa có cấp độ học nào. Quản trị viên sẽ sớm bổ sung.
          </p>
        ) : (
          <LearningPath levels={catalog.levels} topicsByLevel={catalog.topicsByLevel} />
        ))}

      {/* Ôn tập và TOPIK */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ReviewPanel wordCount={totals?.vocabulary ?? 0} />

        {topik.status === "loading" && <LoadingBlock label="Đang tải đề TOPIK..." />}
        {topik.status === "error" && (
          <LoadError
            message={topik.message}
            onRetry={() => {
              setTopik({ status: "loading" });
              setTopikKey((key) => key + 1);
            }}
          />
        )}
        {topik.status === "ready" && (
          <TopikPanel exams={topik.exams} attempts={topik.attempts} />
        )}
      </div>

      <p className="text-xs text-gray-500">
        Sắp ra mắt: luyện nói với gia sư AI và quét chữ viết tay Hangeul.
      </p>
    </div>
  );
}
