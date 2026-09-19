import React, { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function RegisterForm({ onSwitchToLogin }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="w-full bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-1">
        Tạo tài khoản mới
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Bắt đầu hành trình chinh phục tiếng Hàn ngay hôm nay
      </p>

      {/* Tabs Switcher */}
      <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
        <button
          onClick={onSwitchToLogin}
          className="flex-1 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 rounded-lg flex items-center justify-center gap-1 transition-all"
        >
          <span>➔</span> Đăng nhập
        </button>
        <button className="flex-1 py-2 text-sm font-semibold text-emerald-700 bg-white rounded-lg shadow-sm flex items-center justify-center gap-1 transition-all">
          <span>👤+</span> Đăng ký
        </button>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Họ và tên
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Nhập họ và tên của bạn"
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              placeholder="name@example.com"
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1 block">
            Mật khẩu
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu của bạn"
              className="w-full pl-9 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Xác nhận mật khẩu
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Nhập lại mật khẩu"
              className="w-full pl-9 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm shadow-md mt-2"
        >
          Tạo Tài Khoản <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <span className="relative bg-white px-3 text-[11px] font-semibold text-gray-400 tracking-wider uppercase">
          Hoặc đăng ký bằng
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button className="flex items-center justify-center gap-2 border border-gray-200 py-2 rounded-xl hover:bg-gray-50 text-xs font-semibold text-gray-700 transition">
          <span className="text-red-500 font-bold">G</span> Google
        </button>
        <button className="flex items-center justify-center gap-2 border border-gray-200 py-2 rounded-xl hover:bg-gray-50 text-xs font-semibold text-gray-700 transition">
          <span className="text-blue-600 font-bold">f</span> Facebook
        </button>
      </div>

      <div className="text-center mt-6 text-xs text-gray-600">
        Đã có tài khoản?{" "}
        <button
          onClick={onSwitchToLogin}
          className="text-emerald-700 font-bold hover:underline"
        >
          Đăng nhập ngay
        </button>
      </div>

      <p className="text-[10px] text-gray-400 text-center mt-4 leading-relaxed">
        Bằng cách tiếp tục, bạn đồng ý với{" "}
        <a href="#" className="underline hover:text-gray-600">
          Điều khoản dịch vụ
        </a>{" "}
        và{" "}
        <a href="#" className="underline hover:text-gray-600">
          Chính sách bảo mật
        </a>{" "}
        của K-Tutor.
      </p>
    </div>
  );
}
