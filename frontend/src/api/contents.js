import { ApiError, apiFetch } from "./client";

// type: "vocabulary" | "grammar" | undefined (undefined = both)
export function getContentsRequest({
  current = 1,
  pageSize = 10,
  search,
  type,
  topicId,
} = {}) {
  const params = new URLSearchParams({
    current: String(current),
    pageSize: String(pageSize),
  });

  if (search) params.set("search", search);
  if (type) params.set("type", type);
  if (topicId) params.set("topicId", topicId);

  return apiFetch(`/admin/contents?${params.toString()}`);
}

export function getGrammarRequest(id) {
  return apiFetch(`/grammars/${id}`);
}

function getResource(type) {
  return type === "vocabulary" ? "vocabularies" : "grammars";
}

// The form works with one shape; the backend has two resources:
// grammar's `korean` is its title and `meaning` is its content.
export function saveContentRequest({
  id,
  type,
  korean,
  pronunciation,
  meaning,
  topicId,
  examples,
}) {
  const body =
    type === "vocabulary"
      ? { korean, meaning, pronunciation, topicId }
      : {
          title: korean,
          content: meaning,
          topicId,
          ...(examples !== undefined
            ? {
                examples: examples.map((example) => ({
                  korean: example.korean.trim(),
                  meaning: example.meaning.trim(),
                })),
              }
            : {}),
        };
  const path = `/${getResource(type)}`;

  return id
    ? apiFetch(`${path}/${id}`, { method: "PATCH", body })
    : apiFetch(path, { method: "POST", body });
}

export function deleteContentRequest({ id, type }) {
  return apiFetch(`/${getResource(type)}/${id}`, { method: "DELETE" });
}

// Backend messages are English codes; the UI shows Vietnamese.
export function getContentErrorMessage(error) {
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
  if (error.status === 404 && error.message.includes("TOPIC_NOT_FOUND")) {
    return "Chủ đề không còn tồn tại. Vui lòng tải lại trang.";
  }
  if (
    error.status === 404 &&
    (error.message.includes("VOCABULARY_NOT_FOUND") ||
      error.message.includes("GRAMMAR_NOT_FOUND"))
  ) {
    return "Nội dung không còn tồn tại. Vui lòng tải lại trang.";
  }
  if (error.status === 400) {
    return "Thông tin không hợp lệ. Vui lòng kiểm tra lại.";
  }
  return "Đã có lỗi xảy ra. Vui lòng thử lại.";
}
