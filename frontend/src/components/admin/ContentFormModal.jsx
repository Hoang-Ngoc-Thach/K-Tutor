import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export default function EditContentModal({
  content,
  topics,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (content) {
      setForm({
        ...content,
      });
    }
  }, [content]);

  if (!content || !form) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 px-4 backdrop-blur-[2px]">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {form.id ? 'Chỉnh sửa nội dung' : 'Thêm nội dung'}
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
            {/* Loại nội dung */}
            <Field label="Loại nội dung">
              <select
                value={form.type}
                onChange={(e) =>
                  handleChange('type', e.target.value)
                }
                className={selectClass}
              >
                <option value="vocabulary">Từ vựng</option>
                <option value="grammar">Ngữ pháp</option>
              </select>
            </Field>

            {/* Từ / Ngữ pháp */}
            <Field
              label={
                form.type === 'vocabulary'
                  ? 'Từ tiếng Hàn'
                  : 'Ngữ pháp'
              }
            >
              <input
                required
                type="text"
                value={form.korean}
                onChange={(e) =>
                  handleChange('korean', e.target.value)
                }
                placeholder={
                  form.type === 'vocabulary'
                    ? 'Ví dụ: 주문하다'
                    : 'Ví dụ: -고 싶다'
                }
                className={inputClass}
              />
            </Field>

            {/* Phát âm */}
            {form.type === 'vocabulary' && (
              <Field label="Phát âm">
                <input
                  type="text"
                  value={form.pronunciation}
                  onChange={(e) =>
                    handleChange(
                      'pronunciation',
                      e.target.value
                    )
                  }
                  placeholder="Ví dụ: ju-mun-ha-da"
                  className={inputClass}
                />
              </Field>
            )}

            {/* Nghĩa */}
            <Field
              label={
                form.type === 'vocabulary'
                  ? 'Nghĩa tiếng Việt'
                  : 'Giải thích tiếng Việt'
              }
            >
              <textarea
                required
                value={form.meaning}
                onChange={(e) =>
                  handleChange('meaning', e.target.value)
                }
                placeholder={
                  form.type === 'vocabulary'
                    ? 'Ví dụ: Gọi món'
                    : 'Ví dụ: Diễn tả mong muốn làm một việc gì đó'
                }
                rows={3}
                className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </Field>

            {/* Chủ đề */}
            <Field label="Chủ đề">
              <select
                value={form.topic}
                onChange={(e) =>
                  handleChange('topic', e.target.value)
                }
                className={selectClass}
              >
                {topics.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            </Field>

            {/* Trạng thái */}
            <Field label="Trạng thái">
              <select
                value={form.status}
                onChange={(e) =>
                  handleChange('status', e.target.value)
                }
                className={selectClass}
              >
                <option value="active">Đang sử dụng</option>
                <option value="inactive">Tạm ẩn</option>
              </select>
            </Field>
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
              className="rounded-xl bg-emerald-800 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-900"
            >
              {form.id ? 'Lưu thay đổi' : 'Thêm nội dung'}
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
  'h-10 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100';

const selectClass =
  'h-10 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-gray-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100';