import { ApiError, apiFetch } from "./client";

export function getLevelsRequest() {
  return apiFetch("/levels");
}

export function createLevelRequest(body) {
  return apiFetch("/levels", { method: "POST", body });
}

export function updateLevelRequest(id, body) {
  return apiFetch(`/levels/${id}`, { method: "PATCH", body });
}

export function deleteLevelRequest(id) {
  return apiFetch(`/levels/${id}`, { method: "DELETE" });
}

// Backend messages are English codes; the UI shows Vietnamese.
export function getLevelErrorMessage(error) {
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
    return "Bạn không có quyền thực hiện thao tác này.";
  }
  if (error.status === 404 && error.message.includes("LEVEL_NOT_FOUND")) {
    return "Cấp độ không còn tồn tại. Vui lòng tải lại trang.";
  }
  if (error.status === 409 && error.message.includes("LEVEL_NAME_EXISTS")) {
    return "Đã có cấp độ cùng tên này.";
  }
  if (error.status === 400) {
    return "Thông tin không hợp lệ. Vui lòng kiểm tra lại.";
  }
  return "Đã có lỗi xảy ra. Vui lòng thử lại.";
}
