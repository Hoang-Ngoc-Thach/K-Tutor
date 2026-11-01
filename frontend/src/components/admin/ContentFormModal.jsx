import React, { useState } from "react";
import { X } from "lucide-react";
import { getContentErrorMessage } from "../../api/contents";

// Render có điều kiện từ trang cha ({content && <ContentFormModal ... />})
// nên state form luôn được khởi tạo lại mỗi lần mở.
// topics: [{ id, label }]. onSave phải trả về Promise; nếu ném lỗi,
// modal giữ nguyên và hiện thông báo.
export default function EditContentModal({ content, topics, onClose, onSave }) {
  const [form, setForm] = useState(() => ({
    ...content,
    pronunciation: content.pronunciation ?? "",
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
        type: form.type,
        korean: form.korean.trim(),
        pronunciation: form.pronunciation.trim(),
        meaning: form.meaning.trim(),
        topicId: form.topicId,
      });
    } catch (err) {
      setError(getContentErrorMessage(err));
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
              {form.id ? "Chỉnh sửa nội dung" : "Thêm nội dung"}
            </h2>

            <p className="mt-1 text-xs text-gray-400">
              Nhập thông tin nội dung học tập
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
            {/* Loại nội dung (từ vựng và ngữ pháp nằm ở hai bảng nên không đổi loại khi sửa) */}
            <Field label="Loại nội dung">
              <select
                value={form.type}
                disabled={Boolean(form.id)}
                onChange={(e) => handleChange("type", e.target.value)}
                className={`${selectClass} disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500`}
              >
                <option value="vocabulary">Từ vựng</option>
                <option value="grammar">Ngữ pháp</option>
              </select>
            </Field>

            {/* Từ / Ngữ pháp */}
            <Field
              label={form.type === "vocabulary" ? "Từ tiếng Hàn" : "Ngữ pháp"}
            >
              <input
                required
                type="text"
                maxLength={255}
                value={form.korean}
                onChange={(e) => handleChange("korean", e.target.value)}
                placeholder={
                  form.type === "vocabulary"
                    ? "Ví dụ: 주문하다"
                    : "Ví dụ: -고 싶다"
                }
                className={inputClass}
              />
            </Field>

            {/* Phát âm */}
            {form.type === "vocabulary" && (
              <Field label="Phát âm">
                <input
                  type="text"
                  maxLength={255}
                  value={form.pronunciation}
                  onChange={(e) =>
                    handleChange("pronunciation", e.target.value)
                  }
                  placeholder="Ví dụ: ju-mun-ha-da"
                  className={inputClass}
                />
              </Field>
            )}

            {/* Nghĩa */}
            <Field
              label={
                form.type === "vocabulary"
                  ? "Nghĩa tiếng Việt"
                  : "Giải thích tiếng Việt"
              }
            >
              <textarea
                required
                maxLength={form.type === "vocabulary" ? 500 : 20000}
                value={form.meaning}
                onChange={(e) => handleChange("meaning", e.target.value)}
                placeholder={
                  form.type === "vocabulary"
                    ? "Ví dụ: Gọi món"
                    : "Ví dụ: Diễn tả mong muốn làm một việc gì đó"
                }
                rows={3}
                className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </Field>

            {/* Chủ đề */}
            <Field label="Chủ đề">
              <select
                required
                value={form.topicId}
                onChange={(e) => handleChange("topicId", e.target.value)}
                className={selectClass}
              >
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.label}
                  </option>
                ))}
              </select>
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
                  : "Thêm nội dung"}
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

const selectClass =
  "h-10 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-gray-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";
