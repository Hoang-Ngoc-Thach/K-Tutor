import React, { useMemo, useState } from 'react';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';

import AdminSidebar from '../../layout/admin/AdminSidebar';
import TopicFormModal from '../../components/admin/TopicFormModal';
import DeleteContentModal from '../../components/admin/DeleteContentModal';

const categories = [
  'Đời sống hàng ngày',
  'Ẩm thực & Mua sắm',
  'Du lịch & Sân bay',
  'Công sở & Giao tiếp',
  'K-Drama & Giải trí',
  'TOPIK I-II',
];

const initialTopics = [
  {
    id: 1,
    emoji: '🍎',
    title: 'Trái cây & Hoa quả',
    subtitle: '과일 (gwail)',
    category: 'Đời sống hàng ngày',
    wordCount: 32,
    isNew: false,
    status: 'active',
  },
  {
    id: 2,
    emoji: '🍲',
    title: 'Ẩm thực & Món ăn',
    subtitle: '음식 & 요리 (eumsik)',
    category: 'Ẩm thực & Mua sắm',
    wordCount: 50,
    isNew: false,
    status: 'active',
  },
  {
    id: 3,
    emoji: '✈️',
    title: 'Sân bay & Du lịch',
    subtitle: '공항 & 여행 (gonghang)',
    category: 'Du lịch & Sân bay',
    wordCount: 45,
    isNew: false,
    status: 'active',
  },
  {
    id: 4,
    emoji: '👨‍👩‍👧‍👦',
    title: 'Gia đình & Quan hệ',
    subtitle: '가족 & 관계 (gajok)',
    category: 'Đời sống hàng ngày',
    wordCount: 28,
    isNew: false,
    status: 'active',
  },
  {
    id: 5,
    emoji: '🌤️',
    title: 'Thời tiết & Bốn mùa',
    subtitle: '날씨 & 계절 (nalssi)',
    category: 'Đời sống hàng ngày',
    wordCount: 25,
    isNew: false,
    status: 'active',
  },
  {
    id: 6,
    emoji: '☕',
    title: 'Cà phê & Gọi món',
    subtitle: '카페 & 주문 (kape)',
    category: 'Ẩm thực & Mua sắm',
    wordCount: 35,
    isNew: true,
    status: 'active',
  },
  {
    id: 7,
    emoji: '🏥',
    title: 'Bệnh viện & Sức khỏe',
    subtitle: '병원 & 건강 (byeongwon)',
    category: 'Đời sống hàng ngày',
    wordCount: 38,
    isNew: false,
    status: 'active',
  },
  {
    id: 8,
    emoji: '🚇',
    title: 'Giao thông & Đi lại',
    subtitle: '교통 & 지하철 (gyotong)',
    category: 'Du lịch & Sân bay',
    wordCount: 40,
    isNew: false,
    status: 'active',
  },
];

const emptyTopic = {
  emoji: '',
  title: '',
  subtitle: '',
  category: categories[0],
  wordCount: 20,
  isNew: true,
  status: 'active',
};

export default function AdminTopics() {
  const [topics, setTopics] = useState(initialTopics);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [editingTopic, setEditingTopic] = useState(null);
  const [deletingTopic, setDeletingTopic] = useState(null);

  const filteredTopics = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return topics.filter((topic) => {
      const matchesSearch =
        !keyword ||
        topic.title.toLowerCase().includes(keyword) ||
        topic.subtitle.toLowerCase().includes(keyword);

      const matchesCategory =
        categoryFilter === 'all' ||
        topic.category === categoryFilter;

      const matchesStatus =
        statusFilter === 'all' || topic.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [topics, search, categoryFilter, statusFilter]);

  const activeCount = topics.filter(
    (topic) => topic.status === 'active'
  ).length;

  const inactiveCount = topics.length - activeCount;

  // Tên đã có (trừ chính chủ đề đang sửa) để chặn thêm trùng
  const takenTitles = editingTopic
    ? topics
        .filter((topic) => topic.id !== editingTopic.id)
        .map((topic) => topic.title.toLowerCase())
    : [];

  const handleSaveTopic = (savedTopic) => {
    if (savedTopic.id) {
      setTopics((prev) =>
        prev.map((topic) =>
          topic.id === savedTopic.id ? savedTopic : topic
        )
      );
    } else {
      setTopics((prev) => [
        {
          ...savedTopic,
          id: Date.now(),
        },
        ...prev,
      ]);
    }

    setEditingTopic(null);
  };

  const handleDeleteTopic = () => {
    setTopics((prev) =>
      prev.filter((topic) => topic.id !== deletingTopic.id)
    );

    setDeletingTopic(null);
  };

  return (
    <div className="flex min-h-screen bg-gray-50/60">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto p-8">
        {/* Header */}
        <div className="mb-7 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900">
              Quản lý chủ đề
            </h1>

            <p className="mt-1 text-xs text-gray-500">
              Thêm và chỉnh sửa các chủ đề từ vựng hiển thị cho học
              viên
            </p>
          </div>

          <button
            onClick={() => setEditingTopic(emptyTopic)}
            className="flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-900"
          >
            <Plus className="h-4 w-4" />
            Thêm chủ đề
          </button>
        </div>

        {/* Content */}
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* Toolbar */}
          <div className="border-b border-gray-100 p-4">
            <div className="flex items-center justify-between gap-4">
              {/* Search */}
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm kiếm chủ đề..."
                  className="h-10 w-full rounded-xl border border-gray-200 pl-9 pr-3 text-xs outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-50"
                />
              </div>

              <div className="flex items-center gap-2">
                {/* Status */}
                <div className="flex overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-0.5">
                  {[
                    ['all', 'Tất cả', topics.length],
                    ['active', 'Đang hiển thị', activeCount],
                    ['inactive', 'Tạm ẩn', inactiveCount],
                  ].map(([value, label, count]) => (
                    <button
                      key={value}
                      onClick={() => setStatusFilter(value)}
                      className={`rounded-lg px-3 py-2 text-[11px] font-semibold ${
                        statusFilter === value
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500'
                      }`}
                    >
                      {label}
                      <span className="ml-1.5 text-gray-400">
                        {count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Category */}
                <select
                  value={categoryFilter}
                  onChange={(e) =>
                    setCategoryFilter(e.target.value)
                  }
                  className="h-10 rounded-xl border border-gray-200 px-3 text-[11px] text-gray-600 outline-none focus:border-emerald-500"
                >
                  <option value="all">Tất cả danh mục</option>

                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase text-gray-400">
                    Chủ đề
                  </th>

                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase text-gray-400">
                    Danh mục
                  </th>

                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase text-gray-400">
                    Số từ
                  </th>

                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase text-gray-400">
                    Trạng thái
                  </th>

                  <th className="px-4 py-3 text-right text-[10px] font-bold uppercase text-gray-400">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredTopics.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-xs text-gray-400"
                    >
                      Không tìm thấy chủ đề phù hợp
                    </td>
                  </tr>
                )}

                {filteredTopics.map((topic) => (
                  <tr
                    key={topic.id}
                    className="border-b border-gray-100 hover:bg-gray-50/70"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-xl">
                          {topic.emoji}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-900">
                              {topic.title}
                            </span>

                            {topic.isNew && (
                              <span className="rounded-md border border-purple-100 bg-purple-50 px-1.5 py-0.5 text-[9px] font-bold text-purple-700">
                                Mới
                              </span>
                            )}
                          </div>

                          <div className="text-[10px] text-gray-400">
                            {topic.subtitle}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="rounded-md bg-indigo-50 px-2 py-1 text-[9px] font-semibold text-indigo-700">
                        {topic.category}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-xs text-gray-700">
                      {topic.wordCount} từ
                    </td>

                    <td className="px-4 py-3.5">
                      {topic.status === 'active' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                          Đang hiển thị
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-[9px] font-bold text-gray-500">
                          <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                          Tạm ẩn
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setEditingTopic(topic)}
                          className="rounded-lg p-2 text-gray-400 hover:bg-emerald-50 hover:text-emerald-700"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => setDeletingTopic(topic)}
                          className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-4 py-3">
            <span className="text-[10px] text-gray-400">
              Hiển thị {filteredTopics.length} / {topics.length} chủ
              đề
            </span>
          </div>
        </section>
      </main>

      {/* Add / Edit */}
      {editingTopic && (
        <TopicFormModal
          topic={editingTopic}
          categories={categories}
          takenTitles={takenTitles}
          onClose={() => setEditingTopic(null)}
          onSave={handleSaveTopic}
        />
      )}

      {/* Delete */}
      <DeleteContentModal
        content={deletingTopic}
        title="Xóa chủ đề?"
        label={deletingTopic?.title}
        onClose={() => setDeletingTopic(null)}
        onConfirm={handleDeleteTopic}
      />
    </div>
  );
}
