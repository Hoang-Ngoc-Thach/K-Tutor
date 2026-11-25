import React from "react";
import { Link } from "react-router-dom";
import { ClipboardList, CloudRain, Layers } from "lucide-react";

const MODES = [
  {
    icon: Layers,
    title: "Học theo chủ đề",
    text: "Học từ vựng bằng flashcard có phát âm và câu ví dụ, kèm các bài ngữ pháp theo từng chủ đề và cấp độ.",
  },
  {
    icon: CloudRain,
    title: "Ôn tập bằng trò chơi",
    text: "Ôn lại từ đã học qua các trò chơi ngắn: chọn từ đang rơi, xếp âm tiết, lật thẻ nối cặp và gõ chữ.",
  },
  {
    icon: ClipboardList,
    title: "Luyện đề TOPIK",
    text: "Làm đề tính giờ như thi thật, được chấm điểm ngay và xem giải thích từng câu sau khi nộp bài.",
  },
];

// Trang chủ cho người chưa đăng nhập: giới thiệu, không có số liệu.
export default function GuestHome() {
  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 md:px-6">
      <section className="max-w-2xl">
        <h1 className="text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
          Học tiếng Hàn từng chủ đề, ôn tập mỗi ngày, luyện đề TOPIK
        </h1>
        <p className="mt-4 text-base leading-relaxed text-gray-600">
          K-Tutor dành cho người Việt học tiếng Hàn. Học từ vựng và ngữ pháp
          theo lộ trình, ôn lại bằng trò chơi và thử sức với đề thi TOPIK.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            to="/auth"
            className="rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          >
            Đăng nhập để bắt đầu học
          </Link>
        </div>
      </section>

      <section className="mt-14 grid grid-cols-1 divide-y divide-gray-200 overflow-hidden rounded-2xl border border-gray-200 bg-white md:grid-cols-3 md:divide-x md:divide-y-0">
        {MODES.map(({ icon: Icon, title, text }) => (
          <div key={title} className="p-6">
            <Icon className="h-5 w-5 text-emerald-700" aria-hidden="true" />
            <h2 className="mt-3 text-base font-semibold text-gray-900">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
