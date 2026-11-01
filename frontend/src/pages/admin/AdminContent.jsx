import React, { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Volume2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import AdminSidebar from "../../layout/admin/AdminSidebar";
import ContentFormModal from "../../components/admin/ContentFormModal";
import DeleteContentModal from "../../components/admin/DeleteContentModal";
import {
  deleteContentRequest,
  getContentErrorMessage,
  getContentsRequest,
  getGrammarRequest,
  saveContentRequest,
} from "../../api/contents";
import { getLevelsRequest } from "../../api/levels";
import { getTopicsRequest } from "../../api/topics";

const PAGE_SIZE = 10;

export default function AdminContent() {
  const [contents, setContents] = useState([]);
  const [meta, setMeta] = useState({
    current: 1,
    pageSize: PAGE_SIZE,
    total: 0,
  });
  const [summary, setSummary] = useState({ all: 0, vocabulary: 0, grammar: 0 });
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [topicFilter, setTopicFilter] = useState("all");
  const [page, setPage] = useState(1);

  const [editingContent, setEditingContent] = useState(null);
  const [grammarLoading, setGrammarLoading] = useState(false);
  const [grammarLoadError, setGrammarLoadError] = useState("");
  const [deletingContent, setDeletingContent] = useState(null);
  const editingId = editingContent?.id;
  const editingType = editingContent?.type;

  useEffect(() => {
    if (!editingId || editingType !== "grammar") return undefined;

    let cancelled = false;

    getGrammarRequest(editingId)
      .then((grammar) => {
        if (cancelled) return;
        setEditingContent((current) =>
          current?.id === editingId
            ? {
                ...current,
                korean: grammar.title,
                meaning: grammar.content,
                topicId: grammar.topicId,
                examples:
                  grammar.examples?.length > 0
                    ? grammar.examples.map(({ korean, meaning }) => ({
                        korean,
                        meaning,
                      }))
                    : [{ korean: "", meaning: "" }],
              }
            : current,
        );
      })
      .catch((err) => {
        if (!cancelled) setGrammarLoadError(getContentErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setGrammarLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [editingId, editingType]);

  // Tăng reloadKey để tải lại danh sách sau khi thêm / sửa / xóa.
  const [reloadKey, setReloadKey] = useState(0);
  const reloadContents = () => setReloadKey((key) => key + 1);

  // Danh sách chủ đề (kèm tên cấp độ) cho bộ lọc và form.
  useEffect(() => {
    let cancelled = false;

    getLevelsRequest()
      .then(async (levelList) => {
        const topicLists = await Promise.all(
          levelList.map((level) => getTopicsRequest(level.id)),
        );
        if (cancelled) return;

        setTopics(
          levelList.flatMap((level, index) =>
            topicLists[index].map((topic) => ({
              id: topic.id,
              label: `${level.name} · ${topic.name}`,
            })),
          ),
        );
      })
      .catch((err) => {
        if (!cancelled) setError(getContentErrorMessage(err));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Chờ người dùng ngừng gõ rồi mới gửi từ khóa lên backend.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(search.trim());
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;

    getContentsRequest({
      current: page,
      pageSize: PAGE_SIZE,
      search: searchTerm,
      type: typeFilter === "all" ? undefined : typeFilter,
      topicId: topicFilter === "all" ? undefined : topicFilter,
    })
      .then((data) => {
        if (cancelled) return;

        // Trang hiện tại không còn dữ liệu (vừa xóa mục cuối của trang).
        if (data.items.length === 0 && page > 1) {
          setPage(page - 1);
          return;
        }

        setContents(data.items);
        setMeta(data.meta);
        setSummary(data.summary);
        setError("");
      })
      .catch((err) => {
        if (!cancelled) setError(getContentErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, searchTerm, typeFilter, topicFilter, reloadKey]);

  const totalPages = Math.max(1, Math.ceil(meta.total / meta.pageSize));

  // Ném lỗi ra ngoài để ContentFormModal hiển thị ngay trong modal.
  const handleSaveContent = async (content) => {
    await saveContentRequest(content);

    setEditingContent(null);
    setGrammarLoadError("");
    reloadContents();
  };

  const openContentEditor = (content) => {
    setEditingContent(content);
    setGrammarLoading(content.type === "grammar" && Boolean(content.id));
    setGrammarLoadError("");
  };

  const closeContentEditor = () => {
    setEditingContent(null);
    setGrammarLoading(false);
    setGrammarLoadError("");
  };

  const handleDeleteContent = async () => {
    const content = deletingContent;
    // Đóng modal ngay để tránh bấm xóa hai lần.
    setDeletingContent(null);

    try {
      await deleteContentRequest(content);
      reloadContents();
    } catch (err) {
      setError(getContentErrorMessage(err));
    }
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
                type: "vocabulary",
                korean: "",
                pronunciation: "",
                meaning: "",
                topicId: topicFilter !== "all" ? topicFilter : topics[0].id,
              })
            }
            disabled={topics.length === 0}
            className="flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Thêm nội dung
          </button>
        </div>

        {error && (
          <p className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-600">
            {error}
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
                  placeholder="Tìm kiếm từ vựng hoặc ngữ pháp..."
                  className="h-10 w-full rounded-xl border border-gray-200 pl-9 pr-3 text-xs outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-50"
                />
              </div>

              <div className="flex items-center gap-2">
                {/* Type */}
                <div className="flex overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-0.5">
                  {[
                    ["all", "Tất cả", summary.all],
                    ["vocabulary", "Từ vựng", summary.vocabulary],
                    ["grammar", "Ngữ pháp", summary.grammar],
                  ].map(([value, label, count]) => (
                    <button
                      key={value}
                      onClick={() => {
                        setTypeFilter(value);
                        setPage(1);
                      }}
                      className={`rounded-lg px-3 py-2 text-[11px] font-semibold ${
                        typeFilter === value
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500"
                      }`}
                    >
                      {label}
                      <span className="ml-1.5 text-gray-400">{count}</span>
                    </button>
                  ))}
                </div>

                {/* Topic */}
                <select
                  value={topicFilter}
                  onChange={(e) => {
                    setTopicFilter(e.target.value);
                    setPage(1);
                  }}
                  className="h-10 max-w-[200px] rounded-xl border border-gray-200 px-3 text-[11px] text-gray-600 outline-none focus:border-emerald-500"
                >
                  <option value="all">Tất cả chủ đề</option>

                  {topics.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px]">
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

                  <th className="px-4 py-3 text-right text-[10px] font-bold uppercase text-gray-400">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-xs text-gray-400"
                    >
                      Đang tải...
                    </td>
                  </tr>
                )}

                {!loading && contents.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-xs text-gray-400"
                    >
                      {summary.all === 0 && !searchTerm
                        ? "Chưa có nội dung nào"
                        : "Không tìm thấy nội dung phù hợp"}
                    </td>
                  </tr>
                )}

                {contents.map((item) => (
                  <tr
                    key={`${item.type}-${item.id}`}
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

                          {item.pronunciation && (
                            <div className="text-[10px] text-gray-400">
                              {item.pronunciation}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${
                          item.type === "vocabulary"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-indigo-100 text-indigo-700"
                        }`}
                      >
                        {item.type === "vocabulary" ? "Từ vựng" : "Ngữ pháp"}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="rounded-md bg-indigo-50 px-2 py-1 text-[9px] font-semibold text-indigo-700">
                        {item.topicName}
                      </span>
                    </td>

                    <td className="max-w-[250px] px-4 py-3.5 text-xs text-gray-700">
                      <div className="line-clamp-2">{item.meaning}</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openContentEditor(item)}
                          className="rounded-lg p-2 text-gray-400 hover:bg-emerald-50 hover:text-emerald-700"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => setDeletingContent(item)}
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
              Hiển thị {contents.length} / {meta.total} nội dung
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((current) => current - 1)}
                disabled={page <= 1}
                className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>

              <span className="px-3 text-[10px] font-bold text-gray-700">
                {page} / {totalPages}
              </span>

              <button
                onClick={() => setPage((current) => current + 1)}
                disabled={page >= totalPages}
                className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Edit / Add */}
      {editingContent && (
        <ContentFormModal
          key={`${editingContent.type}-${editingContent.id ?? "new"}-${editingContent.examples ? "loaded" : "initial"}`}
          content={editingContent}
          topics={topics}
          loading={grammarLoading}
          loadError={grammarLoadError}
          onClose={closeContentEditor}
          onSave={handleSaveContent}
        />
      )}

      {/* Delete */}
      <DeleteContentModal
        content={deletingContent}
        onClose={() => setDeletingContent(null)}
        onConfirm={handleDeleteContent}
      />
    </div>
  );
}
