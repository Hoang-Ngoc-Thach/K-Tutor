import React from "react";
import { Link } from "react-router-dom";
import { GAMES, readBestScore } from "../review/reviewUtils";

// Ô ôn tập: liệt kê đúng các trò đang có và kỷ lục của người học.
export default function ReviewPanel({ wordCount }) {
  const bestScore = readBestScore();

  return (
    <section
      aria-labelledby="review-title"
      className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6"
    >
      <h2 id="review-title" className="text-lg font-bold text-gray-900">
        Ôn tập từ vựng
      </h2>
      <p className="mt-1 text-sm text-gray-600">
        {wordCount > 0
          ? `${wordCount} từ vựng sẵn sàng để ôn, lấy từ các chủ đề bạn chọn.`
          : "Chưa có từ vựng để ôn. Từ vựng sẽ hiện khi có chủ đề."}
      </p>

      <ul className="mt-5 flex-1 space-y-3">
        {GAMES.map((game) => (
          <li key={game.value}>
            <p className="text-sm font-semibold text-gray-900">{game.label}</p>
            <p className="text-xs leading-relaxed text-gray-500">
              {game.description}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
        <p className="text-xs text-gray-500">
          {bestScore > 0
            ? `Điểm cao nhất của bạn: ${bestScore}`
            : "Bạn chưa chơi lượt nào."}
        </p>
        <Link
          to="/review"
          className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
        >
          Vào ôn tập
        </Link>
      </div>
    </section>
  );
}
