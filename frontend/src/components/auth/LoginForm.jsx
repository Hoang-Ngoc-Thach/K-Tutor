import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LoginForm({ onSwitchToRegister }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-1">
        Chào mừng trở lại!
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Đăng nhập để tiếp tục lộ trình học cá nhân hóa
      </p>

      {/* Tabs Switcher */}
      <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
        <button className="flex-1 py-2 text-sm font-semibold text-emerald-700 bg-white rounded-lg shadow-sm flex items-center justify-center gap-1 transition-all">
          <span>➔</span> Đăng nhập
        </button>
        <button
          onClick={onSwitchToRegister}
          className="flex-1 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 rounded-lg flex items-center justify-center gap-1 transition-all"
        >
          <span>👤+</span> Đăng ký
        </button>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Email hoặc Tên tài khoản
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="name@example.com"
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-gray-700">
              Mật khẩu
            </label>
            <a href="#" className="text-xs text-gray-500 hover:underline">
              Quên mật khẩu?
            </a>
          </div>
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

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="remember"
            className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
          />
          <label
            htmlFor="remember"
            className="text-xs text-gray-600 font-medium"
          >
            Ghi nhớ đăng nhập
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm shadow-md mt-2"
        >
          Đăng Nhập <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <span className="relative bg-white px-3 text-[11px] font-semibold text-gray-400 tracking-wider uppercase">
          Hoặc tiếp tục bằng
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
        Chưa có tài khoản?{" "}
        <button
          onClick={onSwitchToRegister}
          className="text-emerald-700 font-bold hover:underline"
        >
          Đăng ký miễn phí ngay
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
