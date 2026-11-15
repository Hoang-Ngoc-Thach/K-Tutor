import React, { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, Pencil, Plus, Search, Trash2 } from "lucide-react";

import AdminSidebar from "../../layout/admin/AdminSidebar";
import TopikExamFormModal from "../../components/admin/TopikExamFormModal";
import DeleteContentModal from "../../components/admin/DeleteContentModal";
import {
  TOPIK_LEVELS,
  emptyQuestion,
} from "../../components/user/topik/topikUtils";
import {
  createTopikExamRequest,
  deleteTopikExamRequest,
  getTopikErrorMessage,
  getTopikExamRequest,
  getTopikExamsRequest,
  updateTopikExamRequest,
} from "../../api/topikExams";

const STATUS_STYLES = {
  published: "bg-emerald-50 text-emerald-700",
  draft: "bg-gray-100 text-gray-600",
};

export default function AdminTopik() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [editingExam, setEditingExam] = useState(null);
  const [deletingExam, setDeletingExam] = useState(null);

  // Tăng reloadKey để tải lại danh sách sau khi thêm / sửa / xóa.
  const [reloadKey, setReloadKey] = useState(0);
  const reloadExams = () => setReloadKey((key) => key + 1);

  useEffect(() => {
    let cancelled = false;

    getTopikExamsRequest()
      .then((data) => {
        if (cancelled) return;
        setExams(data);
        setError("");
      })
      .catch((err) => {
        if (!cancelled) setError(getTopikErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const visibleExams = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return exams.filter(
      (exam) =>
        (levelFilter === "all" || exam.level === levelFilter) &&
        (statusFilter === "all" || exam.status === statusFilter) &&
        (!keyword ||
          `${exam.title} ${exam.round} ${exam.year}`
            .toLowerCase()
            .includes(keyword)),
    );
  }, [exams, levelFilter, statusFilter, query]);

  const publishedCount = exams.filter(
    (exam) => exam.status === "published",
  ).length;
  const questionCount = exams.reduce(
    (sum, exam) => sum + exam.questionCount,
    0,
  );

  // Ném lỗi ra ngoài để TopikExamFormModal hiển thị ngay trong modal.
  const handleSaveExam = async ({ id, ...body }) => {
    if (id) {
      await updateTopikExamRequest(id, body);
    } else {
      await createTopikExamRequest(body);
    }

    setEditingExam(null);
    reloadExams();
  };

  // Danh sách chỉ có số câu; mở form sửa thì tải đủ câu hỏi và đáp án.
  const handleEditExam = async (exam) => {
    try {
      setEditingExam(await getTopikExamRequest(exam.id));
    } catch (err) {
      setError(getTopikErrorMessage(err));
    }
  };

  const handleToggleStatus = async (exam) => {
    try {
      await updateTopikExamRequest(exam.id, {
        status: exam.status === "published" ? "draft" : "published",
      });
      reloadExams();
    } catch (err) {
      setError(getTopikErrorMessage(err));
    }
  };

  const handleDeleteExam = async () => {
    const exam = deletingExam;
    // Đóng modal ngay để tránh bấm xóa hai lần.
    setDeletingExam(null);

    try {
      await deleteTopikExamRequest(exam.id);
      reloadExams();
    } catch (err) {
      setError(getTopikErrorMessage(err));
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
              Quản lý đề TOPIK
            </h1>

            <p className="mt-1 text-xs text-gray-500">
              Soạn, xuất bản và chỉnh sửa đề thi cho học viên luyện tập
            </p>
          </div>

          <button
            onClick={() =>
              setEditingExam({
                title: "",
                level: "TOPIK I",
                year: new Date().getFullYear(),
                round: "",
                durationMinutes: 40,
                status: "draft",
                description: "",
                questions: [emptyQuestion()],
              })
            }
            className="flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-900"
          >
            <Plus className="h-4 w-4" />
            Thêm đề thi
          </button>
        </div>

        {/* Summary */}
        <div className="mb-5 grid grid-cols-3 gap-4">
          {[
            ["Tổng số đề", exams.length],
            ["Đang xuất bản", publishedCount],
            ["Tổng số câu hỏi", questionCount],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <p className="text-[10px] font-bold uppercase text-gray-400">
                {label}
              </p>
              <p className="mt-1 text-2xl font-black text-gray-900">{value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <label className="relative block w-64">
            <span className="sr-only">Tìm đề thi</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm theo tên, năm, kỳ thi"
              className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-xs text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </label>

          <select
            aria-label="Lọc theo cấp"
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 outline-none focus:border-emerald-500"
          >
            <option value="all">Tất cả cấp</option>
            {TOPIK_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>

          <select
            aria-label="Lọc theo trạng thái"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 outline-none focus:border-emerald-500"
          >
            <option value="all">Mọi trạng thái</option>
            <option value="published">Đã xuất bản</option>
            <option value="draft">Bản nháp</option>
          </select>
        </div>

        {error && (
          <p className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-600">
            {error}
          </p>
        )}

        {/* Table */}
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {[
                    "Đề thi",
                    "Cấp",
                    "Kỳ / Năm",
                    "Số câu",
                    "Thời gian",
                    "Trạng thái",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-4 py-3 text-left text-[10px] font-bold uppercase text-gray-400"
                    >
                      {heading}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right text-[10px] font-bold uppercase text-gray-400">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-10 text-center text-xs text-gray-400"
                    >
                      Đang tải...
                    </td>
                  </tr>
                )}

                {!loading && visibleExams.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-10 text-center text-xs text-gray-400"
                    >
                      {exams.length === 0
                        ? "Chưa có đề thi nào"
                        : "Không có đề phù hợp với bộ lọc"}
                    </td>
                  </tr>
                )}

                {visibleExams.map((exam) => (
                  <tr
                    key={exam.id}
                    className="border-b border-gray-100 hover:bg-gray-50/70"
                  >
                    <td className="px-4 py-3.5">
                      <div className="text-sm font-bold text-gray-900">
                        {exam.title}
                      </div>
                      {exam.description && (
                        <div className="mt-0.5 line-clamp-1 max-w-sm text-[10px] text-gray-400">
                          {exam.description}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-xs font-semibold text-gray-700">
                      {exam.level}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-700">
                      {exam.round ? `${exam.round} · ` : ""}
                      {exam.year}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-700">
                      {exam.questionCount}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-700">
                      {exam.durationMinutes} phút
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`rounded-lg px-2.5 py-1 text-[10px] font-bold ${STATUS_STYLES[exam.status]}`}
                      >
                        {exam.status === "published"
                          ? "Đã xuất bản"
                          : "Bản nháp"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleToggleStatus(exam)}
                          title={
                            exam.status === "published"
                              ? "Gỡ xuống bản nháp"
                              : "Xuất bản"
                          }
                          aria-label={
                            exam.status === "published"
                              ? "Gỡ xuống bản nháp"
                              : "Xuất bản"
                          }
                          className="rounded-lg p-2 text-gray-400 hover:bg-emerald-50 hover:text-emerald-700"
                        >
                          {exam.status === "published" ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                        </button>

                        <button
                          onClick={() => handleEditExam(exam)}
                          aria-label="Chỉnh sửa"
                          className="rounded-lg p-2 text-gray-400 hover:bg-emerald-50 hover:text-emerald-700"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => setDeletingExam(exam)}
                          aria-label="Xóa"
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

          <div className="border-t border-gray-100 px-4 py-3">
            <span className="text-[10px] text-gray-400">
              Hiển thị {visibleExams.length} / {exams.length} đề thi
            </span>
          </div>
        </section>
      </main>

      {/* Add / Edit */}
      {editingExam && (
        <TopikExamFormModal
          exam={editingExam}
          onClose={() => setEditingExam(null)}
          onSave={handleSaveExam}
        />
      )}

      {/* Delete */}
      <DeleteContentModal
        content={deletingExam}
        title="Xóa đề thi?"
        label={deletingExam?.title}
        note="Toàn bộ câu hỏi và lịch sử làm bài của đề này cũng sẽ bị xóa."
        onClose={() => setDeletingExam(null)}
        onConfirm={handleDeleteExam}
      />
    </div>
  );
}
