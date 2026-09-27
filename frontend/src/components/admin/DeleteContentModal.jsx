import React from 'react';
import { Trash2, X } from 'lucide-react';

export default function DeleteContentModal({
  content,
  onClose,
  onConfirm,
}) {
  if (!content) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
            <Trash2 className="h-5 w-5 text-red-600" />
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <h2 className="mt-4 text-base font-bold text-gray-900">
          Xóa nội dung?
        </h2>

        <p className="mt-2 text-xs leading-5 text-gray-500">
          Bạn có chắc muốn xóa{' '}
          <span className="font-semibold text-gray-800">
            {content.korean}
          </span>
          ?
        </p>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600"
          >
            Hủy
          </button>

          <button
            onClick={onConfirm}
            className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}