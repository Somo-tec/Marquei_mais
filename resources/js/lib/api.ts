const API_BASE = (import.meta as any).env?.VITE_API_URL ?? "/api";

const TOKEN_KEY = "marquei_token";
const ORG_KEY = "marquei_org";

let _token: string | null = localStorage.getItem(TOKEN_KEY);
let _org: { id: string; name: string; slug: string; plan: string; logo_url?: string } | null = null;

try {
  const raw = localStorage.getItem(ORG_KEY);
  if (raw) _org = JSON.parse(raw);
} catch {}

export function setAuth(
  token: string,
  org: { id: string; name: string; slug: string; plan: string; logo_url?: string }
) {
  _token = token;
  _org = org;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ORG_KEY, JSON.stringify(org));
}

export function clearAuth() {
  _token = null;
  _org = null;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ORG_KEY);
}

export const getToken = () => _token;
export const getOrg = () => _org;
export const hasToken = () => _token !== null;

async function req<T = any>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (_token) headers["Authorization"] = `Bearer ${_token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return undefined as T;

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
    throw new Error(err.error ?? err.message ?? `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  auth: {
    login: (data: { slug: string; mode: "master" | "user"; password: string; email?: string }) =>
      req<{ token: string; role: string; organization: any }>("POST", "/auth/login", data),
    register: (data: { org_name: string; owner_name: string; email: string; password: string }) =>
      req<{ token: string; role: string; organization: any }>("POST", "/auth/register", data),
    me: () =>
      req<{ role: string; user: any; organization: any }>("GET", "/auth/me"),
  },
  services: {
    list: () => req<any[]>("GET", "/services"),
    create: (data: any) => req<any>("POST", "/services", data),
    update: (id: string, data: any) => req<any>("PATCH", `/services/${id}`, data),
    delete: (id: string) => req<void>("DELETE", `/services/${id}`),
  },
  professionals: {
    list: () => req<any[]>("GET", "/professionals"),
    create: (data: any) => req<any>("POST", "/professionals", data),
    update: (id: string, data: any) => req<any>("PATCH", `/professionals/${id}`, data),
    delete: (id: string) => req<void>("DELETE", `/professionals/${id}`),
  },
  clients: {
    list: (params?: { search?: string; status?: string; per_page?: number }) => {
      const qs = new URLSearchParams();
      if (params?.search) qs.set("search", params.search);
      if (params?.status) qs.set("status", params.status);
      qs.set("per_page", String(params?.per_page ?? 1000));
      return req<{ data: any[]; total: number }>("GET", `/clients?${qs}`);
    },
    create: (data: any) => req<any>("POST", "/clients", data),
    update: (id: string, data: any) => req<any>("PATCH", `/clients/${id}`, data),
    delete: (id: string) => req<void>("DELETE", `/clients/${id}`),
  },
  appointments: {
    list: (params?: { date?: string; from?: string; to?: string; professional_id?: string; status?: string }) => {
      const qs = new URLSearchParams();
      if (params?.date) qs.set("date", params.date);
      if (params?.from) qs.set("from", params.from);
      if (params?.to) qs.set("to", params.to);
      if (params?.professional_id) qs.set("professional_id", params.professional_id);
      if (params?.status) qs.set("status", params.status);
      return req<any[]>("GET", `/appointments?${qs}`);
    },
    create: (data: any) => req<any>("POST", "/appointments", data),
    update: (id: string, data: any) => req<any>("PATCH", `/appointments/${id}`, data),
    delete: (id: string) => req<void>("DELETE", `/appointments/${id}`),
    slots: (params: { professional_id: string; date: string; duration_minutes: number }) =>
      req<{ slots: string[] }>("GET", `/appointments/slots?${new URLSearchParams(params as any)}`),
  },
  notifications: {
    list: () => req<any[]>("GET", "/notifications"),
    markRead: (id: string) => req<void>("PATCH", `/notifications/${id}/read`),
    markAllRead: () => req<void>("POST", "/notifications/read-all"),
  },
};
