import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getAuthErrorMessage, unsubscribeRequest } from "../../api/auth";
import Header from "../../layout/user/Header";
import Footer from "../../layout/user/Footer";

// Opened from the link at the bottom of a reminder email:
// /unsubscribe?token=... The learner confirms with a button.
export default function UnsubscribePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [state, setState] = useState(
    token
      ? { status: "ready" }
      : { status: "error", message: "Liên kết hủy nhận email không hợp lệ." },
  );

  async function handleUnsubscribe() {
    setState({ status: "working" });
    try {
      await unsubscribeRequest(token);
      setState({ status: "done" });
    } catch (error) {
      setState({ status: "error", message: getAuthErrorMessage(error) });
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="mx-auto flex w-full max-w-md flex-1 items-center px-6 py-10">
        <div className="w-full rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-xl">
          {(state.status === "ready" || state.status === "working") && (
            <>
              <h1 className="text-2xl font-bold text-gray-900">
                Hủy nhận email nhắc học?
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Bạn sẽ không nhận email nhắc học của K-Tutor nữa. Email xác nhận
                tài khoản vẫn được gửi khi cần.
              </p>
              <button
                type="button"
                onClick={handleUnsubscribe}
                disabled={state.status === "working"}
                className="mt-6 w-full rounded-xl bg-emerald-800 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900 disabled:opacity-60"
              >
                {state.status === "working" ? "Đang xử lý..." : "Hủy nhận email nhắc học"}
              </button>
              <Link
                to="/"
                className="mt-3 inline-block text-sm font-semibold text-gray-500 hover:text-gray-700"
              >
                Giữ nguyên, về trang chủ
              </Link>
            </>
          )}

          {state.status === "done" && (
            <>
              <h1 className="text-2xl font-bold text-gray-900">
                Đã hủy nhận email nhắc học
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Chúc bạn học tốt. Bạn vẫn có thể ôn tập bất cứ lúc nào trên K-Tutor.
              </p>
              <Link
                to="/"
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-emerald-800 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900"
              >
                Về trang chủ
              </Link>
            </>
          )}

          {state.status === "error" && (
            <>
              <h1 className="text-2xl font-bold text-gray-900">
                Không hủy được
              </h1>
              <p role="alert" className="mt-2 text-sm text-gray-600">
                {state.message}
              </p>
              <Link
                to="/"
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-emerald-800 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900"
              >
                Về trang chủ
              </Link>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
