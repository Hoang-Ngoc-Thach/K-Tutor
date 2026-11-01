import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";

import AdminSidebar from "../../layout/admin/AdminSidebar";
import LevelFormModal from "../../components/admin/LevelFormModal";
import DeleteContentModal from "../../components/admin/DeleteContentModal";
import {
  createLevelRequest,
  deleteLevelRequest,
  getLevelErrorMessage,
  getLevelsRequest,
  updateLevelRequest,
} from "../../api/levels";

export default function AdminLevels() {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingLevel, setEditingLevel] = useState(null);
  const [deletingLevel, setDeletingLevel] = useState(null);

  // Tăng reloadKey để tải lại danh sách sau khi thêm / sửa / xóa.
  const [reloadKey, setReloadKey] = useState(0);
  const reloadLevels = () => setReloadKey((key) => key + 1);

  useEffect(() => {
    let cancelled = false;

    getLevelsRequest()
      .then((data) => {
        if (cancelled) return;
        setLevels(data);
        setError("");
      })
      .catch((err) => {
        if (!cancelled) setError(getLevelErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  // Ném lỗi ra ngoài để LevelFormModal hiển thị ngay trong modal.
  const handleSaveLevel = async ({ id, ...body }) => {
    if (id) {
      await updateLevelRequest(id, body);
    } else {
      await createLevelRequest(body);
    }

    setEditingLevel(null);
    reloadLevels();
  };

  const handleDeleteLevel = async () => {
    const level = deletingLevel;
    // Đóng modal ngay để tránh bấm xóa hai lần.
    setDeletingLevel(null);

    try {
      await deleteLevelRequest(level.id);
      reloadLevels();
    } catch (err) {
      setError(getLevelErrorMessage(err));
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
              Quản lý cấp độ
            </h1>

            <p className="mt-1 text-xs text-gray-500">
              Thêm và chỉnh sửa các cấp độ chứa chủ đề học cho học viên
            </p>
          </div>

          <button
            onClick={() =>
              setEditingLevel({
                name: "",
                description: "",
                sortOrder: levels.length,
              })
            }
            className="flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-900"
          >
            <Plus className="h-4 w-4" />
            Thêm cấp độ
          </button>
        </div>

        {error && (
          <p className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-600">
            {error}
          </p>
        )}

        {/* Content */}
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
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
                      colSpan={3}
                      className="px-4 py-10 text-center text-xs text-gray-400"
                    >
                      Đang tải...
                    </td>
                  </tr>
                )}

                {!loading && levels.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-10 text-center text-xs text-gray-400"
                    >
                      Chưa có cấp độ nào
                    </td>
                  </tr>
                )}

                {levels.map((level) => (
                  <tr
                    key={level.id}
                    className="border-b border-gray-100 hover:bg-gray-50/70"
                  >
                    <td className="px-4 py-3.5">
                      <div className="text-sm font-bold text-gray-900">
                        {level.name}
                      </div>

                      {level.description && (
                        <div className="mt-0.5 max-w-md text-[10px] text-gray-400">
                          {level.description}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-xs text-gray-700">
                      {level.sortOrder}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setEditingLevel(level)}
                          className="rounded-lg p-2 text-gray-400 hover:bg-emerald-50 hover:text-emerald-700"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => setDeletingLevel(level)}
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
              Tổng cộng {levels.length} cấp độ
            </span>
          </div>
        </section>
      </main>

      {/* Add / Edit */}
      {editingLevel && (
        <LevelFormModal
          level={editingLevel}
          onClose={() => setEditingLevel(null)}
          onSave={handleSaveLevel}
        />
      )}

      {/* Delete */}
      <DeleteContentModal
        content={deletingLevel}
        title="Xóa cấp độ?"
        label={deletingLevel?.name}
        note="Tất cả chủ đề (và từ vựng, ngữ pháp bên trong) thuộc cấp độ này cũng sẽ bị xóa."
        onClose={() => setDeletingLevel(null)}
        onConfirm={handleDeleteLevel}
      />
    </div>
  );
}
