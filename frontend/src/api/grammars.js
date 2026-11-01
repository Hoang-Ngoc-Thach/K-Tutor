import { ApiError, apiFetch } from "./client";

export function getGrammarsRequest(topicId) {
  return apiFetch(`/grammars?topicId=${encodeURIComponent(topicId)}`);
}

export function getGrammarErrorMessage(error) {
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
    return "Bạn không có quyền xem nội dung này.";
  }
  if (error.status === 404 && error.message.includes("TOPIC_NOT_FOUND")) {
    return "Chủ đề không còn tồn tại. Vui lòng quay lại danh sách chủ đề.";
  }
  if (error.status === 404 && error.message.includes("GRAMMAR_NOT_FOUND")) {
    return "Ngữ pháp không còn tồn tại. Vui lòng tải lại trang.";
  }
  if (error.status === 400) {
    return "Thông tin chủ đề không hợp lệ. Vui lòng quay lại danh sách chủ đề.";
  }
  return "Đã có lỗi xảy ra. Vui lòng thử lại.";
}
