import React, { useMemo, useState } from 'react';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Volume2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import AdminSidebar from '../../layout/admin/AdminSidebar';
import ContentFormModal from '../../components/admin/ContentFormModal';
import DeleteContentModal from '../../components/admin/DeleteContentModal';
const topics = [
  'Nhà hàng',
  'Du lịch',
  'Đời sống',
  'Sức khỏe',
  'Giao tiếp',
];

const initialContents = [
  {
    id: 1,
    type: 'vocabulary',
    korean: '주문하다',
    pronunciation: 'ju-mun-ha-da',
    meaning: 'Gọi món',
    topic: 'Nhà hàng',
    status: 'active',
  },
  {
    id: 2,
    type: 'vocabulary',
    korean: '여행',
    pronunciation: 'yeo-haeng',
    meaning: 'Du lịch, chuyến đi',
    topic: 'Du lịch',
    status: 'active',
  },
  {
    id: 3,
    type: 'vocabulary',
    korean: '예약하다',
    pronunciation: 'ye-yak-ha-da',
    meaning: 'Đặt trước, đặt chỗ',
    topic: 'Đời sống',
    status: 'active',
  },
  {
    id: 4,
    type: 'vocabulary',
    korean: '병원',
    pronunciation: 'byeong-won',
    meaning: 'Bệnh viện',
    topic: 'Sức khỏe',
    status: 'active',
  },
  {
    id: 5,
    type: 'grammar',
    korean: '-고 싶다',
    pronunciation: '-go sip-da',
    meaning: 'Muốn làm gì (thể hiện nguyện vọng)',
    topic: 'Giao tiếp',
    status: 'active',
  },
  {
    id: 6,
    type: 'grammar',
    korean: '-(으)ㄴ/는 것 같다',
    pronunciation: '-(eu)n/neun geot gat-da',
    meaning: 'Có vẻ, hình như (phỏng đoán)',
    topic: 'Giao tiếp',
    status: 'active',
  },
  {
    id: 7,
    type: 'grammar',
    korean: '-기 때문에',
    pronunciation: '-gi ttae-mun-e',
    meaning: 'Vì, bởi vì (nguyên nhân, lý do)',
    topic: 'Đời sống',
    status: 'active',
  },
  {
    id: 8,
    type: 'vocabulary',
    korean: '학교',
    pronunciation: 'hak-gyo',
    meaning: 'Trường học',
    topic: 'Đời sống',
    status: 'active',
  },
];

export default function AdminContent() {
  const [contents, setContents] = useState(initialContents);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [topicFilter, setTopicFilter] = useState('all');

  const [editingContent, setEditingContent] = useState(null);
  const [deletingContent, setDeletingContent] = useState(null);

  const filteredContents = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return contents.filter((item) => {
      const matchesSearch =
        !keyword ||
        item.korean.toLowerCase().includes(keyword) ||
        item.meaning.toLowerCase().includes(keyword) ||
        item.pronunciation.toLowerCase().includes(keyword);

      const matchesType =
        typeFilter === 'all' || item.type === typeFilter;

      const matchesTopic =
        topicFilter === 'all' || item.topic === topicFilter;

      return matchesSearch && matchesType && matchesTopic;
    });
  }, [contents, search, typeFilter, topicFilter]);

  const vocabularyCount = contents.filter(
    (item) => item.type === 'vocabulary'
  ).length;

  const grammarCount = contents.filter(
    (item) => item.type === 'grammar'
  ).length;

  const handleSaveContent = (updatedContent) => {
    if (updatedContent.id) {
      setContents((prev) =>
        prev.map((item) =>
          item.id === updatedContent.id
            ? updatedContent
            : item
        )
      );
    } else {
      setContents((prev) => [
        {
          ...updatedContent,
          id: Date.now(),
        },
        ...prev,
      ]);
    }

    setEditingContent(null);
  };

  const handleDeleteContent = () => {
    setContents((prev) =>
      prev.filter(
        (item) => item.id !== deletingContent.id
      )
    );

    setDeletingContent(null);
  };

  return (
    <div className="flex min-h-screen bg-gray-50/60">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto p-8">
        {/* Header */}
        <div className="mb-7 flex items-end justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                K-Tutor Curriculum
              </span>

              <span className="text-[10px] text-gray-400">
                • Cập nhật 10 phút trước
              </span>
            </div>

            <h1 className="text-2xl font-black tracking-tight text-gray-900">
              Nội dung học
            </h1>

            <p className="mt-1 text-xs text-gray-500">
              Quản lý từ vựng và ngữ pháp cho học viên
            </p>
          </div>

          <button
            onClick={() =>
              setEditingContent({
                type: 'vocabulary',
                korean: '',
                pronunciation: '',
                meaning: '',
                topic: topics[0],
                status: 'active',
              })
            }
            className="flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-900"
          >
            <Plus className="h-4 w-4" />
            Thêm nội dung
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
                  placeholder="Tìm kiếm từ vựng hoặc ngữ pháp..."
                  className="h-10 w-full rounded-xl border border-gray-200 pl-9 pr-3 text-xs outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-50"
                />
              </div>

              <div className="flex items-center gap-2">
                {/* Type */}
                <div className="flex overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-0.5">
                  {[
                    ['all', 'Tất cả', contents.length],
                    ['vocabulary', 'Từ vựng', vocabularyCount],
                    ['grammar', 'Ngữ pháp', grammarCount],
                  ].map(([value, label, count]) => (
                    <button
                      key={value}
                      onClick={() => setTypeFilter(value)}
                      className={`rounded-lg px-3 py-2 text-[11px] font-semibold ${
                        typeFilter === value
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

                {/* Topic */}
                <select
                  value={topicFilter}
                  onChange={(e) =>
                    setTopicFilter(e.target.value)
                  }
                  className="h-10 rounded-xl border border-gray-200 px-3 text-[11px] text-gray-600 outline-none focus:border-emerald-500"
                >
                  <option value="all">Tất cả chủ đề</option>

                  {topics.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase text-gray-400">
                    Nội dung
                  </th>

                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase text-gray-400">
                    Loại
                  </th>

                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase text-gray-400">
                    Chủ đề
                  </th>

                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase text-gray-400">
                    Nghĩa / Giải thích
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
                {filteredContents.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 hover:bg-gray-50/70"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                          <Volume2 className="h-3.5 w-3.5" />
                        </button>

                        <div>
                          <div className="text-sm font-bold text-gray-900">
                            {item.korean}
                          </div>

                          <div className="text-[10px] text-gray-400">
                            {item.pronunciation}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${
                          item.type === 'vocabulary'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-indigo-100 text-indigo-700'
                        }`}
                      >
                        {item.type === 'vocabulary'
                          ? 'Từ vựng'
                          : 'Ngữ pháp'}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="rounded-md bg-indigo-50 px-2 py-1 text-[9px] font-semibold text-indigo-700">
                        {item.topic}
                      </span>
                    </td>

                    <td className="max-w-[250px] px-4 py-3.5 text-xs text-gray-700">
                      {item.meaning}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                        Đang sử dụng
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() =>
                            setEditingContent(item)
                          }
                          className="rounded-lg p-2 text-gray-400 hover:bg-emerald-50 hover:text-emerald-700"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() =>
                            setDeletingContent(item)
                          }
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

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
            <span className="text-[10px] text-gray-400">
              Hiển thị 1–{filteredContents.length} trong{' '}
              {filteredContents.length} nội dung
            </span>

            <div className="flex items-center gap-1">
              <button className="rounded-lg border border-gray-200 p-1.5 text-gray-300">
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>

              <button className="rounded-lg bg-emerald-800 px-2.5 py-1.5 text-[10px] font-bold text-white">
                1
              </button>

              <button className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-[10px]">
                2
              </button>

              <button className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-[10px]">
                3
              </button>

              <button className="rounded-lg border border-gray-200 p-1.5">
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Edit / Add */}
      <ContentFormModal
        content={editingContent}
        topics={topics}
        onClose={() => setEditingContent(null)}
        onSave={handleSaveContent}
      />

      {/* Delete */}
      <DeleteContentModal
        content={deletingContent}
        onClose={() => setDeletingContent(null)}
        onConfirm={handleDeleteContent}
      />
    </div>
  );
}