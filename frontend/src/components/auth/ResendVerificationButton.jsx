import React, { useEffect, useState } from "react";
import { getAuthErrorMessage, resendVerificationRequest } from "../../api/auth";

// Same as the server's wait time between two emails.
const COOLDOWN_SECONDS = 60;

// "Gửi lại email xác nhận" with a short countdown so it cannot be spammed.
export default function ResendVerificationButton({ email }) {
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [message, setMessage] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (secondsLeft <= 0) return undefined;
    const timer = setTimeout(() => setSecondsLeft((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  async function handleResend() {
    setStatus("sending");
    setMessage("");
    try {
      await resendVerificationRequest(email);
      // The server gives the same answer for every email, so the wording is
      // careful not to confirm that the address exists.
      setStatus("sent");
      setMessage(
        "Nếu email này đã đăng ký và chưa xác nhận, chúng tôi vừa gửi lại liên kết. Hãy kiểm tra cả mục Spam.",
      );
      setSecondsLeft(COOLDOWN_SECONDS);
    } catch (error) {
      setStatus("error");
      setMessage(getAuthErrorMessage(error));
    }
  }

  const waiting = secondsLeft > 0;

  return (
    <div>
      <button
        type="button"
        onClick={handleResend}
        disabled={status === "sending" || waiting}
        className="w-full rounded-xl border border-emerald-700 bg-white py-2.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "sending"
          ? "Đang gửi..."
          : waiting
            ? `Gửi lại sau ${secondsLeft}s`
            : "Gửi lại email xác nhận"}
      </button>
      {message && (
        <p
          role={status === "error" ? "alert" : "status"}
          className={`mt-3 rounded-xl px-3 py-2 text-xs ${
            status === "error"
              ? "border border-red-100 bg-red-50 text-red-600"
              : "border border-emerald-100 bg-emerald-50 text-emerald-800"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
