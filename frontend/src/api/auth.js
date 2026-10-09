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
  if (error.status === 409) {
    return "Email này đã được đăng ký.";
  }
  if (error.status === 400) {
    return "Thông tin không hợp lệ. Vui lòng kiểm tra lại.";
  }
  return "Đã có lỗi xảy ra. Vui lòng thử lại.";
}
