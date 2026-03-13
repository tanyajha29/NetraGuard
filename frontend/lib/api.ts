export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const TOKEN_KEY = "netraguard_token";

export type ApiOptions = {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  skipAuth?: boolean;
};

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

export async function apiFetch<T = any>(path: string, options: ApiOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {}, skipAuth = false } = options;
  const token = !skipAuth ? getToken() : null;

  const finalHeaders: Record<string, string> = { ...headers };
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;
  if (!isForm) finalHeaders["Content-Type"] = finalHeaders["Content-Type"] || "application/json";
  if (token) finalHeaders["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: finalHeaders,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });

  if (response.status === 401) {
    clearToken();
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with ${response.status}`);
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return (await response.json()) as T;
  }
  // @ts-expect-error allow non-json
  return (await response.text()) as T;
}
