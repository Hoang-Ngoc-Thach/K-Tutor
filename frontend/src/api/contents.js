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
}) {
  const body =
    type === "vocabulary"
      ? { korean, meaning, pronunciation, topicId }
      : { title: korean, content: meaning, topicId };
  const path = `/${getResource(type)}`;

  return id
    ? apiFetch(`${path}/${id}`, { method: "PATCH", body })
    : apiFetch(path, { method: "POST", body });
}

export const MAX_IMPORT_FILE_SIZE = 2 * 1024 * 1024; // khớp giới hạn của backend

// type: "vocabulary" | "grammar". file: File (.xlsx)
export function importContentRequest({ type, topicId, file }) {
  const body = new FormData();
  body.append("topicId", topicId);
  body.append("file", file);

  return apiFetch(`/${getResource(type)}/import`, { method: "POST", body });
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

const IMPORT_FIELD_LABELS = {
  korean: "Từ tiếng Hàn",
  pronunciation: "Phát âm",
  meaning: "Nghĩa tiếng Việt",
  title: "Ngữ pháp",
  content: "Giải thích",
};

const IMPORT_ROW_ERROR_TEXT = {
  REQUIRED: "không được để trống",
  TOO_LONG: "quá dài",
  DUPLICATE_IN_FILE: "bị trùng với một dòng khác trong tệp",
  DUPLICATE_EXISTING: "đã có trong chủ đề này",
};

// Returns { message, rows }: a summary plus one line per invalid Excel row.
export function getImportError(error) {
  if (!(error instanceof ApiError)) {
    return { message: "Đã có lỗi xảy ra. Vui lòng thử lại.", rows: [] };
  }

  const details = error.details ?? {};

  if (error.status === 413) {
    return { message: "Tệp quá lớn (tối đa 2 MB).", rows: [] };
  }
  if (error.message.includes("IMPORT_INVALID_FILE")) {
    return {
      message: "Tệp không hợp lệ. Chỉ nhận tệp Excel định dạng .xlsx.",
      rows: [],
    };
  }
  if (error.message.includes("IMPORT_FILE_REQUIRED")) {
    return { message: "Vui lòng chọn tệp Excel.", rows: [] };
  }
  if (error.message.includes("IMPORT_EMPTY")) {
    return { message: "Tệp không có dòng dữ liệu nào.", rows: [] };
  }
  if (error.message.includes("IMPORT_MISSING_COLUMNS")) {
    const names = (details.columns ?? [])
      .map((field) => IMPORT_FIELD_LABELS[field] ?? field)
      .join(", ");
    return {
      message: `Tệp thiếu cột bắt buộc: ${names}. Hãy dùng đúng tệp mẫu.`,
      rows: [],
    };
  }
  if (error.message.includes("IMPORT_TOO_MANY_ROWS")) {
    return {
      message: `Tệp có quá ${details.max ?? 500} dòng dữ liệu. Hãy chia nhỏ tệp.`,
      rows: [],
    };
  }
  if (error.message.includes("IMPORT_INVALID_ROWS")) {
    return {
      message: `Tệp có ${details.total ?? 0} lỗi nên chưa thêm dòng nào. Hãy sửa rồi tải lên lại.`,
      rows: (details.errors ?? []).map(
        ({ row, field, code }) =>
          `Dòng ${row} (${IMPORT_FIELD_LABELS[field] ?? field}): ${
            IMPORT_ROW_ERROR_TEXT[code] ?? "không hợp lệ"
          }`,
      ),
    };
  }

  return { message: getContentErrorMessage(error), rows: [] };
}
