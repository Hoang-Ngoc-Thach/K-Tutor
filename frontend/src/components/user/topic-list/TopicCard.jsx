// src/components/user/topic-list/TopicCard.jsx
import React from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function TopicCard({ topic }) {
  const vocabularyCount = topic.vocabularyCount ?? 0;

  return (
    <Link
      to={`/flashcard/${topic.id}`}
      className="group flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
    >
      <div className="flex-1">
        <h2 className="text-base font-semibold text-gray-900 group-hover:text-emerald-700">
          {topic.name}
        </h2>
        {topic.description && (
          <p className="mt-2 line-clamp-3 text-sm text-gray-500">
            {topic.description}
          </p>
        )}
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
        <span className="text-xs font-medium text-gray-500">
          {vocabularyCount} từ vựng
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
          Bắt đầu học <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
