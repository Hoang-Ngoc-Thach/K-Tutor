// "T4", "CN"... theo ngày dương lịch YYYY-MM-DD (không phụ thuộc múi giờ trình duyệt).
export function weekdayLabel(date) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("vi-VN", {
    weekday: "short",
    timeZone: "UTC",
  });
}
