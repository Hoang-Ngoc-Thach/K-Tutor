import React from "react";
import { Play, ArrowRight, BookOpen } from "lucide-react";

export default function PracticeTopics() {
  const topics = [
    {
      id: 1,
      level: "Sơ cấp 1",
      levelColor: "text-emerald-700 bg-emerald-50",
      students: "4.1k học viên",
      title: "Chào hỏi & Giới thiệu",
      koreanTitle: "자기소개",
      desc: "Học cách xưng hô kính ngữ, hỏi quốc tịch, nghề nghiệp và sở thích trong lần đầu gặ...",
      progressText: "12/15 bài",
      progressPercent: 80,
      statusText: "80%",
      buttonText: "Tiếp tục học",
      buttonStyle: "bg-emerald-800 text-white hover:bg-emerald-900",
      buttonIcon: <Play className="w-4 h-4 fill-current" />,
    },
    {
      id: 2,
      level: "Sơ cấp 2",
      levelColor: "text-emerald-700 bg-emerald-50",
      students: "3.2k học viên",
      title: "Gọi món tại nhà hàng",
      koreanTitle: "식당에서 주문하기",
      desc: "Kỹ năng gọi món, xin thêm banchan (món phụ), yêu cầu gia giảm độ cay và thanh...",
      progressText: "6/12 bài",
      progressPercent: 45,
      statusText: "45%",
      buttonText: "Tiếp tục học",
      buttonStyle: "bg-emerald-800 text-white hover:bg-emerald-900",
      buttonIcon: <Play className="w-4 h-4 fill-current" />,
    },
    {
      id: 3,
      level: "Đời sống",
      levelColor: "text-blue-700 bg-blue-50",
      students: "2.1k học viên",
      title: "Mua sắm tại chợ Myeongdong",
      koreanTitle: "쇼핑하기",
      desc: "Hỏi giá cả, thử trang phục, đổi trả hàng và sử dụng các câu đàm phán giảm giá thô...",
      progressText: "10 bài học",
      progressPercent: 0,
      statusText: "Chưa học",
      buttonText: "Bắt đầu học",
      buttonStyle:
        "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200",
      buttonIcon: <ArrowRight className="w-4 h-4" />,
    },
    {
      id: 4,
      level: "Trung cấp",
      levelColor: "text-purple-700 bg-purple-50",
      students: "1.5k học viên",
      title: "Phỏng vấn xin việc",
      koreanTitle: "면접 준비",
      desc: "Diễn đạt kinh nghiệm làm việc, trả lời câu hỏi hóc búa với ngữ thái trang trọng và...",
      progressText: "1/14 bài",
      progressPercent: 10,
      statusText: "10%",
      buttonText: "Học ngay",
      buttonStyle: "bg-emerald-800 text-white hover:bg-emerald-900",
      buttonIcon: <Play className="w-4 h-4 fill-current" />,
    },
  ];

  return (
    <div className="mt-12">
      {/* Header & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold text-gray-900">
              Chủ đề luyện nói thực chiến hàng ngày
            </h2>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
              <BookOpen className="w-3 h-3" /> 32 bài học
            </span>
          </div>
          <p className="text-sm text-gray-500">
            Các tình huống mô phỏng chân thực bám sát đời sống tại Hàn Quốc
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 hide-scrollbar">
          <button className="whitespace-nowrap px-4 py-2 bg-emerald-800 text-white text-xs font-semibold rounded-full">
            Tất cả
          </button>
          <button className="whitespace-nowrap px-4 py-2 bg-gray-50 text-gray-600 hover:bg-gray-100 text-xs font-semibold rounded-full border border-gray-200 transition-colors">
            Đã học
          </button>
          <button className="whitespace-nowrap px-4 py-2 bg-gray-50 text-gray-600 hover:bg-gray-100 text-xs font-semibold rounded-full border border-gray-200 transition-colors">
            Chưa học
          </button>
          <button className="whitespace-nowrap px-4 py-2 bg-gray-50 text-gray-600 hover:bg-gray-100 text-xs font-semibold rounded-full border border-gray-200 transition-colors">
            Sơ cấp
          </button>
          <button className="whitespace-nowrap px-4 py-2 bg-gray-50 text-gray-600 hover:bg-gray-100 text-xs font-semibold rounded-full border border-gray-200 transition-colors">
            Trung cấp
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {topics.map((topic) => (
          <div
            key={topic.id}
            className="bg-white rounded-3xl border border-gray-100 p-5 flex flex-col hover:shadow-lg transition-shadow"
          >
            {/* Card Header */}
            <div className="flex items-center justify-between mb-4">
              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${topic.levelColor}`}
              >
                {topic.level}
              </span>
              <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                👥 {topic.students}
              </span>
            </div>

            {/* Titles */}
            <div className="mb-3">
              <h3 className="text-sm font-bold text-gray-900 leading-tight mb-1">
                {topic.title}
              </h3>
              <p className="text-xs text-gray-400 font-medium">
                {topic.koreanTitle}
              </p>
            </div>

            {/* Description */}
            <p className="text-xs text-gray-500 leading-relaxed mb-6 flex-1">
              {topic.desc}
            </p>

            {/* Progress Section */}
            <div className="mt-auto">
              <div className="flex items-center justify-between text-[11px] font-semibold text-gray-600 mb-2">
                <span>Tiến độ: {topic.progressText}</span>
                <span
                  className={
                    topic.progressPercent > 0
                      ? "text-emerald-700"
                      : "text-gray-400"
                  }
                >
                  {topic.statusText}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4 overflow-hidden flex">
                <div
                  className="bg-emerald-600 h-1.5 rounded-full"
                  style={{ width: `${topic.progressPercent}%` }}
                ></div>
              </div>

              {/* Action Button */}
              <button
                className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${topic.buttonStyle}`}
              >
                {topic.buttonText} {topic.buttonIcon}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
