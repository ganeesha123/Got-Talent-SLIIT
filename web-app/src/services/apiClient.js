const DEFAULT_BASE = 'http://localhost:5000/api';

export function getApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE;
}

export function getServerOrigin() {
  const apiBase = getApiBaseUrl();

  try {
    return new URL(apiBase, window.location.origin).origin;
  } catch {
    return window.location.origin;
  }
}

export function toServerAssetUrl(assetPath) {
  if (!assetPath) return null;
  if (/^https?:\/\//i.test(assetPath)) return assetPath;

  const normalizedPath = assetPath.startsWith('/') ? assetPath : `/${assetPath}`;
  return `${getServerOrigin()}${normalizedPath}`;
}

async function parseJson(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { raw: text };
  }
}

export async function request({ method, path, token, body }) {
  const base = getApiBaseUrl();
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const headers = isFormData ? {} : { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${base}${path}`, {
    method,
    headers,
    body: !body ? undefined : isFormData ? body : JSON.stringify(body)
  });

  const data = await parseJson(res);
  if (!res.ok) {
    const message = data?.message || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

export const api = {
  get: ({ path, token }) => request({ method: 'GET', path, token }),
  post: ({ path, token, body }) => request({ method: 'POST', path, token, body }),
  put: ({ path, token, body }) => request({ method: 'PUT', path, token, body }),
  del: ({ path, token }) => request({ method: 'DELETE', path, token })
};
