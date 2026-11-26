import React, { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import { getAuthErrorMessage, verifyEmailRequest } from "../../api/auth";
import Header from "../../layout/user/Header";
import Footer from "../../layout/user/Footer";

// Opened from the link in the confirmation email: /verify-email?token=...
export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [state, setState] = useState(
    token
      ? { status: "loading" }
      : { status: "error", message: "Liên kết xác nhận không hợp lệ." },
  );
  // The token works only once. React runs effects twice in development, so a
  // second request would fail and wrongly show an error.
  const requested = useRef(false);

  useEffect(() => {
    if (!token || requested.current) return;
    requested.current = true;

    verifyEmailRequest(token)
      .then((data) => setState({ status: "success", email: data.email }))
      .catch((error) =>
        setState({ status: "error", message: getAuthErrorMessage(error) }),
      );
  }, [token]);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="mx-auto flex w-full max-w-md flex-1 items-center px-6 py-10">
        <div className="w-full rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-xl">
          {state.status === "loading" && (
            <p className="text-sm text-gray-500">Đang xác nhận email...</p>
          )}

          {state.status === "success" && (
            <>
              <CheckCircle2
                className="mx-auto h-12 w-12 text-emerald-600"
                aria-hidden="true"
              />
              <h1 className="mt-4 text-2xl font-bold text-gray-900">
                Email đã được xác nhận
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Tài khoản <span className="font-semibold">{state.email}</span> đã
                sẵn sàng. Bạn có thể đăng nhập và bắt đầu học.
              </p>
              <Link
                to="/auth"
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-emerald-800 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900"
              >
                Đăng nhập
              </Link>
            </>
          )}

          {state.status === "error" && (
            <>
              <XCircle
                className="mx-auto h-12 w-12 text-red-500"
                aria-hidden="true"
              />
              <h1 className="mt-4 text-2xl font-bold text-gray-900">
                Không xác nhận được email
              </h1>
              <p role="alert" className="mt-2 text-sm text-gray-600">
                {state.message}
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Nếu bạn đã xác nhận trước đó, hãy đăng nhập. Nếu chưa, hãy đăng
                nhập để yêu cầu gửi lại email xác nhận.
              </p>
              <Link
                to="/auth"
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-emerald-800 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900"
              >
                Đến trang đăng nhập
              </Link>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
