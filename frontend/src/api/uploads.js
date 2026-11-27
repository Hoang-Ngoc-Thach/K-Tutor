import { apiFetch } from "./client";

function upload(path, file) {
  const body = new FormData();
  body.append("file", file);
  return apiFetch(path, { method: "POST", body });
}

export function uploadImage(file) {
  return upload("/admin/uploads/image", file);
}

export function uploadAudio(file) {
  return upload("/admin/uploads/audio", file);
}

export function deleteUpload(publicId, kind) {
  return apiFetch("/admin/uploads", {
    method: "DELETE",
    body: { publicId, kind },
  });
}
