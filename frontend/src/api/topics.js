import { ApiError, apiFetch } from "./client";

// GET /topics requires a levelId: it lists the topics of ONE level.
export function getTopicsRequest(levelId) {
  return apiFetch(`/topics?levelId=${encodeURIComponent(levelId)}`);
}

export function getTopicRequest(id) {
  return apiFetch(`/topics/${encodeURIComponent(id)}`);
}

export function createTopicRequest(body) {
  return apiFetch("/topics", { method: "POST", body });
}

export function updateTopicRequest(id, body) {
  return apiFetch(`/topics/${id}`, { method: "PATCH", body });
}

export function deleteTopicRequest(id) {
  return apiFetch(`/topics/${id}`, { method: "DELETE" });
}

// Backend messages are English codes; the UI shows Vietnamese.
export function getTopicErrorMessage(error) {
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
  if (error.status === 404 && error.message.includes("TOPIC_NOT_FOUND")) {
    return "Chủ đề không còn tồn tại. Vui lòng tải lại trang.";
  }
  if (error.status === 409 && error.message.includes("TOPIC_NAME_EXISTS")) {
    return "Cấp độ này đã có chủ đề cùng tên.";
  }
  if (error.status === 400) {
    return "Thông tin không hợp lệ. Vui lòng kiểm tra lại.";
  }
  return "Đã có lỗi xảy ra. Vui lòng thử lại.";
}
