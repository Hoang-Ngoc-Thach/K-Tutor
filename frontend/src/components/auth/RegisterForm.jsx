import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { getAuthErrorMessage, registerRequest } from "../../api/auth";
import { useAuth } from "../../context/useAuth";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 72; // bcrypt only uses the first 72 bytes

export default function RegisterForm({ onSwitchToLogin, onRegistered }) {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const trimmedEmail = email.trim();
    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setError("Vui lòng nhập email hợp lệ.");
      return;
    }
    if (password.length < PASSWORD_MIN_LENGTH) {
      setError(`Mật khẩu phải có ít nhất ${PASSWORD_MIN_LENGTH} ký tự.`);
      return;
    }
    if (password.length > PASSWORD_MAX_LENGTH) {
      setError(`Mật khẩu tối đa ${PASSWORD_MAX_LENGTH} ký tự.`);
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      await registerRequest({ email: trimmedEmail, password });
    } catch (err) {
      setError(getAuthErrorMessage(err));
      setSubmitting(false);
      return;
    }

    try {
      await login({ email: trimmedEmail, password, remember: false });
    } catch {
      onRegistered?.(trimmedEmail);
    }
  };

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

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tối thiểu 8 ký tự"
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
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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

        {error && (
          <p
            role="alert"
            className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-emerald-800 hover:bg-emerald-900 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm shadow-md mt-2"
        >
          {submitting ? "Đang tạo tài khoản..." : "Tạo Tài Khoản"}{" "}
          {!submitting && <ArrowRight className="w-4 h-4" />}
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
