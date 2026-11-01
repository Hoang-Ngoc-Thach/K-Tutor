import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";

import AdminSidebar from "../../layout/admin/AdminSidebar";
import TopicFormModal from "../../components/admin/TopicFormModal";
import DeleteContentModal from "../../components/admin/DeleteContentModal";
import { getLevelsRequest } from "../../api/levels";
import {
  createTopicRequest,
  deleteTopicRequest,
  getTopicErrorMessage,
  getTopicsRequest,
  updateTopicRequest,
} from "../../api/topics";

export default function AdminTopics() {
  const [levels, setLevels] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");

  const [editingTopic, setEditingTopic] = useState(null);
  const [deletingTopic, setDeletingTopic] = useState(null);

  // Tăng reloadKey để tải lại danh sách sau khi thêm / sửa / xóa.
  const [reloadKey, setReloadKey] = useState(0);
  const reloadTopics = () => setReloadKey((key) => key + 1);

  // GET /topics cần levelId, nên lấy levels trước rồi lấy topics của từng level.
  useEffect(() => {
    let cancelled = false;

    getLevelsRequest()
      .then(async (levelList) => {
        const topicLists = await Promise.all(
          levelList.map((level) => getTopicsRequest(level.id)),
        );
        if (cancelled) return;
        setLevels(levelList);
        setTopics(topicLists.flat());
        setError("");
      })
      .catch((err) => {
        if (!cancelled) setError(getTopicErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const levelNameById = useMemo(
    () => Object.fromEntries(levels.map((level) => [level.id, level.name])),
    [levels],
  );

  const filteredTopics = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return topics.filter((topic) => {
      const matchesSearch =
        !keyword ||
        topic.name.toLowerCase().includes(keyword) ||
        (topic.description ?? "").toLowerCase().includes(keyword);

      const matchesLevel =
        levelFilter === "all" || topic.levelId === levelFilter;

      return matchesSearch && matchesLevel;
    });
  }, [topics, search, levelFilter]);

  const handleAddTopic = () => {
    const levelId = levelFilter !== "all" ? levelFilter : levels[0].id;

    setEditingTopic({
      name: "",
      description: "",
      levelId,
      sortOrder: topics.filter((topic) => topic.levelId === levelId).length,
    });
  };

  // Ném lỗi ra ngoài để TopicFormModal hiển thị ngay trong modal.
  const handleSaveTopic = async ({ id, ...body }) => {
    if (id) {
      await updateTopicRequest(id, body);
    } else {
      await createTopicRequest(body);
    }

    setEditingTopic(null);
    reloadTopics();
  };

  const handleDeleteTopic = async () => {
    const topic = deletingTopic;
    // Đóng modal ngay để tránh bấm xóa hai lần.
    setDeletingTopic(null);

    try {
      await deleteTopicRequest(topic.id);
      reloadTopics();
    } catch (err) {
      setError(getTopicErrorMessage(err));
    }
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
              Thêm và chỉnh sửa các chủ đề học thuộc từng cấp độ
            </p>
          </div>

          <button
            onClick={handleAddTopic}
            disabled={levels.length === 0}
            className="flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Thêm chủ đề
          </button>
        </div>

        {error && (
          <p className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-600">
            {error}
          </p>
        )}

        {!loading && levels.length === 0 && !error && (
          <p className="mb-4 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs text-amber-700">
            Chưa có cấp độ nào. Hãy{" "}
            <Link to="/admin/levels" className="font-semibold underline">
              tạo cấp độ
            </Link>{" "}
            trước khi thêm chủ đề.
          </p>
        )}

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

              {/* Level */}
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="h-10 rounded-xl border border-gray-200 px-3 text-[11px] text-gray-600 outline-none focus:border-emerald-500"
              >
                <option value="all">Tất cả cấp độ</option>

                {levels.map((level) => (
                  <option key={level.id} value={level.id}>
                    {level.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase text-gray-400">
                    Chủ đề
                  </th>

                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase text-gray-400">
                    Cấp độ
                  </th>

                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase text-gray-400">
                    Thứ tự
                  </th>

                  <th className="px-4 py-3 text-right text-[10px] font-bold uppercase text-gray-400">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-10 text-center text-xs text-gray-400"
                    >
                      Đang tải...
                    </td>
                  </tr>
                )}

                {!loading && filteredTopics.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-10 text-center text-xs text-gray-400"
                    >
                      {topics.length === 0
                        ? "Chưa có chủ đề nào"
                        : "Không tìm thấy chủ đề phù hợp"}
                    </td>
                  </tr>
                )}

                {filteredTopics.map((topic) => (
                  <tr
                    key={topic.id}
                    className="border-b border-gray-100 hover:bg-gray-50/70"
                  >
                    <td className="px-4 py-3.5">
                      <div className="text-sm font-bold text-gray-900">
                        {topic.name}
                      </div>

                      {topic.description && (
                        <div className="mt-0.5 max-w-md text-[10px] text-gray-400">
                          {topic.description}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="rounded-md bg-indigo-50 px-2 py-1 text-[9px] font-semibold text-indigo-700">
                        {levelNameById[topic.levelId]}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-xs text-gray-700">
                      {topic.sortOrder}
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
              Hiển thị {filteredTopics.length} / {topics.length} chủ đề
            </span>
          </div>
        </section>
      </main>

      {/* Add / Edit */}
      {editingTopic && (
        <TopicFormModal
          topic={editingTopic}
          levels={levels}
          onClose={() => setEditingTopic(null)}
          onSave={handleSaveTopic}
        />
      )}

      {/* Delete */}
      <DeleteContentModal
        content={deletingTopic}
        title="Xóa chủ đề?"
        label={deletingTopic?.name}
        note="Từ vựng và ngữ pháp thuộc chủ đề này cũng sẽ bị xóa."
        onClose={() => setDeletingTopic(null)}
        onConfirm={handleDeleteTopic}
      />
    </div>
  );
}
