// src/pages/user/TopicListPage.jsx
import React from "react";
import Header from "../../layout/user/Header";
import Footer from "../../layout/user/Footer";
import TopicHeader from "../../components/topiclist-user/TopicHeader";
import TopicCard from "../../components/topiclist-user/TopicCard";
import LeaderboardStrip from "../../components/topiclist-user/LeaderboardStrip";

// Dữ liệu mẫu giả lập API trả về
const TOPIC_DATA = [
  {
    id: 1,
    emoji: "🍎",
    title: "Trái cây & Hoa quả",
    subtitle: "과일 (gwail)",
    learned: 32,
    total: 32,
    isNew: false,
  },
  {
    id: 2,
    emoji: "🍲",
    title: "Ẩm thực & Món ăn",
    subtitle: "음식 & 요리 (eumsik)",
    learned: 36,
    total: 50,
    isNew: false,
  },
  {
    id: 3,
    emoji: "✈️",
    title: "Sân bay & Du lịch",
    subtitle: "공항 & 여행 (gonghang)",
    learned: 22,
    total: 45,
    isNew: false,
  },
  {
    id: 4,
    emoji: "👨‍👩‍👧‍👦",
    title: "Gia đình & Quan hệ",
    subtitle: "가족 & 관계 (gajok)",
    learned: 24,
    total: 28,
    isNew: false,
  },
  {
    id: 5,
    emoji: "🌤️",
    title: "Thời tiết & Bốn mùa",
    subtitle: "날씨 & 계절 (nalssi)",
    learned: 0,
    total: 25,
    isNew: false,
  },
  {
    id: 6,
    emoji: "☕",
    title: "Cà phê & Gọi món",
    subtitle: "카페 & 주문 (kape)",
    learned: 0,
    total: 35,
    isNew: true,
  },
  {
    id: 7,
    emoji: "🏥",
    title: "Bệnh viện & Sức khỏe",
    subtitle: "병원 & 건강 (byeongwon)",
    learned: 0,
    total: 38,
    isNew: false,
  },
  {
    id: 8,
    emoji: "🚇",
    title: "Giao thông & Đi lại",
    subtitle: "교통 & 지하철 (gyotong)",
    learned: 24,
    total: 40,
    isNew: false,
  },
];

export default function TopicListPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFB]">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-8 flex flex-col">
        {/* Phần Header của trang danh sách */}
        <TopicHeader />

        {/* Danh sách các chủ đề (Grid) */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Danh sách bộ thẻ</h2>
          <span className="text-sm text-gray-500">
            Sắp xếp theo:{" "}
            <strong className="text-emerald-600 cursor-pointer">
              Tiến độ học
            </strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TOPIC_DATA.map((topic) => (
            <TopicCard key={topic.id} topic={topic} />
          ))}
        </div>

        {/* Banner xếp hạng */}
        <LeaderboardStrip />
      </main>

      <Footer />
    </div>
  );
}
