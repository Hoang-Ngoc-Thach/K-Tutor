// src/components/user/topic-list/TopicCard.jsx
import React from "react";
import { BookOpen, Layers } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TopicCard({ topic }) {
  const navigate = useNavigate();
  const vocabularyCount = topic.vocabularyCount ?? 0;
  const grammarCount = topic.grammarCount ?? 0;

  return (
    <article className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md">
      <div className="flex-1">
        <h2 className="text-base font-semibold text-gray-900">
          {topic.name}
        </h2>
        {topic.description && (
          <p className="mt-2 line-clamp-3 text-sm text-gray-500">
            {topic.description}
          </p>
        )}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2 border-t border-gray-100 pt-4">
        <button
          type="button"
          disabled={vocabularyCount === 0}
          onClick={() => navigate(`/flashcard/${topic.id}`)}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-2.5 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
        >
          <Layers className="h-3.5 w-3.5" />
          Học từ vựng ({vocabularyCount})
        </button>
        <button
          type="button"
          disabled={grammarCount === 0}
          onClick={() => navigate(`/grammar/${topic.id}`)}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 px-2.5 py-2.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
        >
          <BookOpen className="h-3.5 w-3.5" />
          Ngữ pháp ({grammarCount})
        </button>
      </div>
    </article>
  );
}
