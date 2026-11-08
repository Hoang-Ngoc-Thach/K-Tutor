import React, { useState } from "react";
import { Download, FileSpreadsheet, X } from "lucide-react";
import {
  getImportError,
  importContentRequest,
  MAX_IMPORT_FILE_SIZE,
} from "../../api/contents";

const CONFIG = {
  vocabulary: {
    title: "Nhập từ vựng từ Excel",
    unit: "từ vựng",
    columns: [
      { name: "Từ tiếng Hàn", required: true },
      { name: "Phát âm", required: false },
      { name: "Nghĩa tiếng Việt", required: true },
    ],
    templateHref: "/templates/mau-nhap-tu-vung.xlsx",
  },
  grammar: {
    title: "Nhập ngữ pháp từ Excel",
    unit: "ngữ pháp",
    columns: [
      { name: "Ngữ pháp", required: true },
      { name: "Giải thích", required: true },
    ],
    templateHref: "/templates/mau-nhap-ngu-phap.xlsx",
  },
};

const MAX_ROWS_SHOWN = 10;

// Render có điều kiện từ trang cha ({importType && <ImportExcelModal ... />})
// nên state luôn được khởi tạo lại mỗi lần mở.
// topics: [{ id, label }]. onImported(count) được gọi khi nhập thành công.
export default function ImportExcelModal({
  type,
  topics,
  defaultTopicId,
  onClose,
  onImported,
}) {
  const config = CONFIG[type];

  const [topicId, setTopicId] = useState(defaultTopicId);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null); // { message, rows }

  const handleFileChange = (e) => {
    const selected = e.target.files[0] ?? null;
    setError(null);

    if (selected && !selected.name.toLowerCase().endsWith(".xlsx")) {
      setFile(null);
      setError({
        message: "Chỉ nhận tệp Excel định dạng .xlsx.",
        rows: [],
      });
      return;
    }
    if (selected && selected.size > MAX_IMPORT_FILE_SIZE) {
      setFile(null);
      setError({ message: "Tệp quá lớn (tối đa 2 MB).", rows: [] });
      return;
    }

    setFile(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    if (!file) {
      setError({ message: "Vui lòng chọn tệp Excel.", rows: [] });
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const result = await importContentRequest({ type, topicId, file });
      onImported(result.imported);
    } catch (err) {
      setError(getImportError(err));
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 px-4 backdrop-blur-[2px]">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{config.title}</h2>

            <p className="mt-1 text-xs text-gray-400">
              Thêm nhiều {config.unit} cùng lúc vào một chủ đề
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

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 px-6 py-5">
            {/* Hướng dẫn cột */}
            <div className="rounded-xl bg-gray-50 p-4 text-xs text-gray-600">
              <p className="font-semibold text-gray-800">
                Tệp .xlsx có dòng 1 là tiêu đề, gồm các cột:
              </p>

              <ul className="mt-2 list-inside list-disc space-y-0.5">
                {config.columns.map((column) => (
                  <li key={column.name}>
                    {column.name}
                    <span className="text-gray-400">
                      {column.required ? " (bắt buộc)" : " (không bắt buộc)"}
                    </span>
                  </li>
                ))}
              </ul>

              <p className="mt-2 text-[11px] text-gray-400">
                Tối đa 500 dòng và 2 MB. Nếu có dòng lỗi, hệ thống sẽ không thêm
                dòng nào.
              </p>

              <a
                href={config.templateHref}
                download
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:underline"
              >
                <Download className="h-3.5 w-3.5" />
                Tải tệp mẫu
              </a>
            </div>

            {/* Chủ đề */}
            <div>
              <label className="mb-2 block text-xs font-semibold text-gray-700">
                Chủ đề
              </label>

              <select
                required
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-gray-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tệp */}
            <div>
              <label className="mb-2 block text-xs font-semibold text-gray-700">
                Tệp Excel
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-gray-300 px-4 py-3 text-xs text-gray-600 transition hover:border-emerald-500 hover:bg-emerald-50/40">
                <FileSpreadsheet className="h-5 w-5 shrink-0 text-emerald-700" />

                <span className="truncate">
                  {file ? file.name : "Chọn tệp .xlsx"}
                </span>

                <input
                  type="file"
                  accept=".xlsx"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-600">
                <p>{error.message}</p>

                {error.rows.length > 0 && (
                  <ul className="mt-2 max-h-40 space-y-0.5 overflow-y-auto">
                    {error.rows.slice(0, MAX_ROWS_SHOWN).map((line) => (
                      <li key={line}>{line}</li>
                    ))}

                    {error.rows.length > MAX_ROWS_SHOWN && (
                      <li>và {error.rows.length - MAX_ROWS_SHOWN} lỗi khác</li>
                    )}
                  </ul>
                )}
              </div>
            )}
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
              {saving ? "Đang nhập..." : "Nhập dữ liệu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
