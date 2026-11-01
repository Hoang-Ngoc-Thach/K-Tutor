import { ApiError, apiFetch } from "./client";

export function getStatsRequest() {
  return apiFetch("/admin/stats");
}

// Backend messages are English codes; the UI shows Vietnamese.
export function getStatsErrorMessage(error) {
  if (!(error instanceof ApiError)) {
    return "Đã có lỗi xảy ra. Vui lòng thử lại.";
  }
  if (error.status === 0) {
    return "Không thể kết nối tới máy chủ. Vui lòng thử lại sau.";
  }
  if (error.status === 401) {
    return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
  }
  if (error.status === 403) {
    return "Bạn không có quyền xem thống kê.";
  }
  return "Đã có lỗi xảy ra. Vui lòng thử lại.";
}
