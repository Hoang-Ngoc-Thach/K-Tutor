import { ApiError, apiFetch } from "./client";

export function registerRequest({ email, password }) {
  return apiFetch("/auth/register", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
}

export function loginRequest({ email, password }) {
  return apiFetch("/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
}

// Opened from the link in the confirmation email.
export function verifyEmailRequest(token) {
  return apiFetch("/auth/verify-email", {
    method: "POST",
    body: { token },
    auth: false,
  });
}

// The server always answers the same way, whether or not the email exists.
export function resendVerificationRequest(email) {
  return apiFetch("/auth/resend-verification", {
    method: "POST",
    body: { email },
    auth: false,
  });
}

// Opened from the link in a study reminder email.
export function unsubscribeRequest(token) {
  return apiFetch("/reminders/unsubscribe", {
    method: "POST",
    body: { token },
    auth: false,
  });
}

export function getMeRequest() {
  return apiFetch("/auth/me");
}

// Backend messages are English; the UI shows Vietnamese.
export function getAuthErrorMessage(error) {
  if (!(error instanceof ApiError)) {
    return "Đã có lỗi xảy ra. Vui lòng thử lại.";
  }
  if (error.status === 0) {
    return "Không thể kết nối tới máy chủ. Vui lòng thử lại sau.";
  }
  if (error.status === 401) {
    return "Email hoặc mật khẩu không đúng.";
  }
  if (error.status === 403 && error.message.includes("ACCOUNT_LOCKED")) {
    return "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.";
  }
  if (error.status === 403 && error.message.includes("EMAIL_NOT_VERIFIED")) {
    return "Email của bạn chưa được xác nhận. Hãy mở liên kết trong email, hoặc gửi lại email xác nhận.";
  }
  if (error.status === 409) {
    return "Email này đã được đăng ký.";
  }
  if (error.status === 400 && error.message.includes("INVALID_OR_EXPIRED_TOKEN")) {
    return "Liên kết xác nhận không hợp lệ hoặc đã hết hạn.";
  }
  if (error.status === 400 && error.message.includes("INVALID_UNSUBSCRIBE_TOKEN")) {
    return "Liên kết hủy nhận email không hợp lệ.";
  }
  if (error.status === 400) {
    return "Thông tin không hợp lệ. Vui lòng kiểm tra lại.";
  }
  return "Đã có lỗi xảy ra. Vui lòng thử lại.";
}
