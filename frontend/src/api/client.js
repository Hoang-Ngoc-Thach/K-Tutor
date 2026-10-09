const BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api/v1";

const TOKEN_KEY = "kt_access_token";

// "Remember me" ON  -> localStorage (survives closing the browser)
// "Remember me" OFF -> sessionStorage (cleared when the tab is closed)
export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

export function saveToken(token, remember = false) {
  clearToken();
  (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "ApiError";
    this.status = status; // 0 = network error (server unreachable)
  }
}

function normalizeMessage(message) {
  if (Array.isArray(message)) return message.join(", ");
  return message || "Unknown error";
}

export async function apiFetch(
  path,
  { method = "GET", body, auth = true } = {},
) {
  const token = auth ? getToken() : null;

  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR");
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    // An authenticated request got 401: the token is expired or invalid.
    if (response.status === 401 && token) {
      clearToken();
      window.dispatchEvent(new Event("auth:unauthorized"));
    }
    throw new ApiError(response.status, normalizeMessage(payload?.message));
  }

  return payload?.data;
}
