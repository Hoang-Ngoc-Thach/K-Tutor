import React, { useState } from 'react';
import { X } from 'lucide-react';

// Render có điều kiện từ trang cha ({topic && <TopicFormModal ... />})
// nên state form luôn được khởi tạo lại mỗi lần mở.
export default function TopicFormModal({
  topic,
  categories,
  takenTitles,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState(() => ({ ...topic }));

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const trimmedTitle = form.title.trim();
  const isDuplicate =
    trimmedTitle !== '' &&
    takenTitles.includes(trimmedTitle.toLowerCase());

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isDuplicate) return;

    onSave({
      ...form,
      emoji: form.emoji.trim(),
      title: trimmedTitle,
      subtitle: form.subtitle.trim(),
      wordCount: Number(form.wordCount),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 px-4 backdrop-blur-[2px]">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {form.id ? 'Chỉnh sửa chủ đề' : 'Thêm chủ đề'}
            </h2>

            <p className="mt-1 text-xs text-gray-400">
              Chủ đề sẽ hiển thị ở danh sách bộ thẻ của học viên
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
            {/* Biểu tượng + Tên chủ đề */}
            <div className="flex gap-3">
              <div className="w-24 shrink-0">
                <Field label="Biểu tượng">
                  <input
                    required
                    type="text"
                    maxLength={16}
                    value={form.emoji}
                    onChange={(e) =>
                      handleChange('emoji', e.target.value)
                    }
                    placeholder="Emoji"
                    className={`${inputClass} text-center`}
                  />
                </Field>
              </div>

              <div className="flex-1">
                <Field label="Tên chủ đề">
                  <input
                    required
                    type="text"
                    value={form.title}
                    onChange={(e) =>
                      handleChange('title', e.target.value)
                    }
                    placeholder="Ví dụ: Cà phê & Gọi món"
                    className={`${inputClass} ${
                      isDuplicate
                        ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                        : ''
                    }`}
                  />
                </Field>
              </div>
            </div>

            {isDuplicate && (
              <p className="-mt-3 text-[11px] text-red-600">
                Đã có chủ đề cùng tên này.
              </p>
            )}

            {/* Tên tiếng Hàn */}
            <Field label="Tên tiếng Hàn (kèm phiên âm)">
              <input
                type="text"
                value={form.subtitle}
                onChange={(e) =>
                  handleChange('subtitle', e.target.value)
                }
                placeholder="Ví dụ: 카페 & 주문 (kape)"
                className={inputClass}
              />
            </Field>

            {/* Danh mục + Số từ */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Danh mục">
                <select
                  value={form.category}
                  onChange={(e) =>
                    handleChange('category', e.target.value)
                  }
                  className={selectClass}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Số từ cốt lõi">
                <input
                  required
                  type="number"
                  min="1"
                  value={form.wordCount}
                  onChange={(e) =>
                    handleChange('wordCount', e.target.value)
                  }
                  className={inputClass}
                />
              </Field>
            </div>

            {/* Trạng thái */}
            <Field label="Trạng thái">
              <select
                value={form.status}
                onChange={(e) =>
                  handleChange('status', e.target.value)
                }
                className={selectClass}
              >
                <option value="active">Đang hiển thị</option>
                <option value="inactive">Tạm ẩn</option>
              </select>
            </Field>

            {/* Nhãn Mới */}
            <label className="flex cursor-pointer items-center gap-2.5 text-xs font-semibold text-gray-700">
              <input
                type="checkbox"
                checked={form.isNew}
                onChange={(e) =>
                  handleChange('isNew', e.target.checked)
                }
                className="h-4 w-4 rounded border-gray-300 accent-emerald-700"
              />
              Gắn nhãn "Mới" cho chủ đề này
            </label>
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
              disabled={isDuplicate}
              className="rounded-xl bg-emerald-800 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {form.id ? 'Lưu thay đổi' : 'Thêm chủ đề'}
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
