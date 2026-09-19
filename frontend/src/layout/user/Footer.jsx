import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-6 mt-12">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 gap-4">
        <div className="flex items-center gap-3">
          <span className="font-bold text-emerald-800 text-sm">K-Tutor</span>
          <span>© 2025 K-Tutor. Nền tảng học tiếng Hàn thông minh cùng AI dành riêng cho người Việt.</span>
        </div>

        <div className="flex items-center gap-6 font-medium">
          <a href="#" className="hover:underline">Điều khoản dịch vụ</a>
          <a href="#" className="hover:underline">Chính sách bảo mật</a>
          <a href="#" className="hover:underline">Hỗ trợ học viên</a>
          <a href="#" className="hover:underline">Liên hệ</a>
        </div>
      </div>
    </footer>
  );
}