import React from "react";
import { Menu } from "lucide-react";

// Chỉ hiển thị tên trang (và nút mở sidebar trên màn hình nhỏ).
export default function UserHeader({ title, onMenuClick }) {
  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-gray-100">
      <div className="px-6 py-4 flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="p-1 -ml-1 text-gray-500 hover:text-gray-900 lg:hidden"
          aria-label="Mở menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <span className="text-lg font-bold text-gray-900">{title}</span>
      </div>
    </header>
  );
}
