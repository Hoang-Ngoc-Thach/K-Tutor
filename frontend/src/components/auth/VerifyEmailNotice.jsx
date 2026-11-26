import React from "react";
import { MailCheck } from "lucide-react";
import ResendVerificationButton from "./ResendVerificationButton";

// Shown right after registering: the learner must open the emailed link
// before they can log in.
export default function VerifyEmailNotice({ email, emailSent, onBackToLogin }) {
  return (
    <div className="w-full rounded-3xl border border-gray-100 bg-white p-8 shadow-xl">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
        <MailCheck className="h-6 w-6" aria-hidden="true" />
      </div>
      <h2 className="mb-2 text-2xl font-bold text-gray-900">
        Kiểm tra email của bạn
      </h2>

      {emailSent ? (
        <p className="mb-5 text-sm leading-relaxed text-gray-600">
          Chúng tôi đã gửi liên kết xác nhận tới{" "}
          <span className="font-semibold text-gray-900">{email}</span>. Bấm vào
          liên kết trong email để kích hoạt tài khoản. Liên kết có hiệu lực trong
          24 giờ. Nếu không thấy, hãy kiểm tra cả mục Spam.
        </p>
      ) : (
        <p
          role="alert"
          className="mb-5 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-sm leading-relaxed text-amber-800"
        >
          Tài khoản <span className="font-semibold">{email}</span> đã được tạo
          nhưng chúng tôi chưa gửi được email xác nhận. Hãy bấm "Gửi lại" bên
          dưới.
        </p>
      )}

      <ResendVerificationButton email={email} />

      <button
        type="button"
        onClick={onBackToLogin}
        className="mt-4 w-full text-center text-sm font-semibold text-gray-500 hover:text-gray-700"
      >
        Quay lại đăng nhập
      </button>
    </div>
  );
}
