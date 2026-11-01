import { ApiError, apiFetch } from "./client";

// locked: true | false | undefined (undefined = do not filter)
export function getUsersRequest({
  current = 1,
  pageSize = 10,
  search,
  goal,
  locked,
} = {}) {
  const params = new URLSearchParams({
    current: String(current),
    pageSize: String(pageSize),
  });

  if (search) params.set("search", search);
  if (goal) params.set("goal", goal);
  if (locked !== undefined) params.set("locked", String(locked));

  return apiFetch(`/admin/users?${params.toString()}`);
}

export function setUserLockedRequest(id, locked) {
  return apiFetch(`/admin/users/${id}/lock`, {
    method: "PATCH",
    body: { locked },
  });
}

// Learning goal values from the backend enum, shown in Vietnamese.
export const GOAL_LABELS = {
  conversation: "Giao tiếp",
  topik: "TOPIK",
};

export function getGoalLabel(goal) {
  return GOAL_LABELS[goal] ?? "Chưa chọn";
}

// Backend messages are English codes; the UI shows Vietnamese.
export function getUserErrorMessage(error) {
  if (!(error instanceof ApiError)) {
    return "Đã có lỗi xảy ra. Vui lòng thử lại.";
  }
  if (error.status === 0) {
    return "Không thể kết nối tới máy chủ. Vui lòng thử lại sau.";
  }
  if (error.status === 401) {
    return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
  }
  if (error.status === 403 && error.message.includes("CANNOT_LOCK_ADMIN")) {
    return "Không thể khóa tài khoản quản trị viên.";
  }
  if (error.status === 403) {
    return "Bạn không có quyền thực hiện thao tác này.";
  }
  if (error.status === 404 && error.message.includes("USER_NOT_FOUND")) {
    return "Tài khoản không còn tồn tại. Vui lòng tải lại trang.";
  }
  if (error.status === 400) {
    return "Yêu cầu không hợp lệ. Vui lòng thử lại.";
  }
  return "Đã có lỗi xảy ra. Vui lòng thử lại.";
}
