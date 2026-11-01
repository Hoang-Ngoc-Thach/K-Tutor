import { ApiError, apiFetch } from "./client";

export function getVocabulariesRequest(topicId) {
  return apiFetch(`/vocabularies?topicId=${encodeURIComponent(topicId)}`);
}

export function getVocabularyErrorMessage(error) {
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
  if (error.status === 404 && error.message.includes("VOCABULARY_NOT_FOUND")) {
    return "Từ vựng không còn tồn tại. Vui lòng tải lại trang.";
  }
  if (error.status === 400) {
    return "Thông tin chủ đề không hợp lệ. Vui lòng quay lại danh sách chủ đề.";
  }
  return "Đã có lỗi xảy ra. Vui lòng thử lại.";
}
