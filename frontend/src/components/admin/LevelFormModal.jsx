import React, { useState } from "react";
import { X } from "lucide-react";
import { getLevelErrorMessage } from "../../api/levels";

// Render có điều kiện từ trang cha ({level && <LevelFormModal ... />})
// nên state form luôn được khởi tạo lại mỗi lần mở.
// onSave phải trả về Promise; nếu ném lỗi, modal giữ nguyên và hiện thông báo.
export default function LevelFormModal({ level, onClose, onSave }) {
  const [form, setForm] = useState(() => ({
    ...level,
    description: level.description ?? "",
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    setError("");

    try {
      await onSave({
        id: form.id,
        name: form.name.trim(),
        description: form.description.trim() || null,
        sortOrder: Number(form.sortOrder) || 0,
      });
    } catch (err) {
      setError(getLevelErrorMessage(err));
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 px-4 backdrop-blur-[2px]">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {form.id ? "Chỉnh sửa cấp độ" : "Thêm cấp độ"}
            </h2>

            <p className="mt-1 text-xs text-gray-400">
              Cấp độ chứa các chủ đề học (ví dụ: Sơ cấp 1, Trung cấp 1)
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-5 px-6 py-5">
            <Field label="Tên cấp độ">
              <input
                required
                type="text"
                maxLength={100}
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Ví dụ: Sơ cấp 1"
                className={inputClass}
              />
            </Field>

            <Field label="Mô tả">
              <textarea
                maxLength={1000}
                rows={3}
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Mô tả ngắn về cấp độ này (không bắt buộc)"
                className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </Field>

            <Field label="Thứ tự hiển thị">
              <input
                required
                type="number"
                min="0"
                step="1"
                value={form.sortOrder}
                onChange={(e) => handleChange("sortOrder", e.target.value)}
                className={inputClass}
              />
            </Field>

            {error && <p className="text-xs text-red-600">{error}</p>}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 border-t border-gray-100 bg-gray-50/50 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-emerald-800 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Đang lưu..."
                : form.id
                  ? "Lưu thay đổi"
                  : "Thêm cấp độ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-gray-700">
        {label}
      </label>

      {children}
    </div>
  );
}

const inputClass =
  "h-10 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";
