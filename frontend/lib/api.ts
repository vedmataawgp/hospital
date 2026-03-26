import type {
  User, Doctor, Department, Appointment, Message, Report,
  Invoice, Patient, AdminOverview, PatientDashboardData,
  DoctorDashboardData, PaginatedResponse, DoctorFilter,
  CreateAppointmentPayload, ContactPayload, RegisterPayload,
  Prescription, Consultation,
} from "./types";

const BASE_URL = "/api";
const REQUEST_TIMEOUT_MS = 15_000;
const MAX_RETRIES = 3;

/* ── Chat types ──────────────────────────────────────────────────────── */
export interface UserBrief {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface ChatMsg {
  id: number;
  sender: number;
  sender_name: string;
  sender_role: string;
  message_type: string;
  text: string;
  file_url?: string;
  file_name?: string;
  is_read: boolean;
  created_at: string;
}

export interface ChatConversation {
  id: number;
  other_user: UserBrief;
  last_message: { text: string; created_at: string; sender_name: string } | null;
  unread_count: number;
  updated_at: string;
}

/* ── Token storage (sessionStorage scoped to tab, cleared on close) ─── */
const TOKEN_KEY = "mc_access_token";

function setCookie(name: string, value: string, days = 1): void {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function clearCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

export const tokenStore = {
  get: (): string | null => {
    try { return sessionStorage.getItem(TOKEN_KEY); } catch { return null; }
  },
  set: (token: string): void => {
    try {
      sessionStorage.setItem(TOKEN_KEY, token);
      setCookie("mc_access_token", token);
    } catch {}
  },
  clear: (): void => {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
      clearCookie("mc_access_token");
    } catch {}
  },
};

const USER_KEY = "mc_user";
export const userStore = {
  get: (): UserBrief | null => {
    try {
      const raw = sessionStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as UserBrief) : null;
    } catch { return null; }
  },
  set: (user: UserBrief): void => {
    try {
      sessionStorage.setItem(USER_KEY, JSON.stringify(user));
      setCookie("mc_user_role", user.role);
    } catch {}
  },
  clear: (): void => {
    try {
      sessionStorage.removeItem(USER_KEY);
      clearCookie("mc_user_role");
    } catch {}
  },
};

/* ── CSRF token (Django sets csrftoken cookie on first request) ────── */
function getCSRFToken(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie
    .split(";")
    .map(c => c.trim())
    .find(c => c.startsWith("csrftoken="));
  return match ? decodeURIComponent(match.split("=")[1]) : "";
}

/* ── Request deduplication for concurrent identical GET calls ────── */
const pending = new Map<string, Promise<unknown>>();

/* ── Sanitise string inputs to strip HTML/script injection ──────── */
export function sanitise(value: string): string {
  return value
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .trim();
}

/* ── Build query string from filter object ──────────────────────── */
function toQuery(params?: Record<string, unknown>): string {
  if (!params) return "";
  const q = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");
  return q ? `?${q}` : "";
}

/* ── Sleep helper for exponential back-off ──────────────────────── */
const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

/* ── Core fetch wrapper ──────────────────────────────────────────── */
async function request<T>(
  endpoint: string,
  options: RequestInit & { retries?: number } = {},
  attempt = 0,
): Promise<T> {
  const { retries = MAX_RETRIES, ...init } = options;
  const method = (init.method ?? "GET").toUpperCase();
  const token = tokenStore.get();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(method !== "GET" && method !== "HEAD"
      ? { "X-CSRFToken": getCSRFToken() }
      : {}),
    ...(init.headers as Record<string, string> | undefined),
  };

  const cacheKey = `${method}:${endpoint}:${String(init.body ?? "")}`;

  /* Deduplicate concurrent identical GETs */
  if (method === "GET") {
    const inFlight = pending.get(cacheKey);
    if (inFlight) return inFlight as Promise<T>;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const run = fetch(`${BASE_URL}${endpoint}`, {
    ...init,
    headers,
    signal: controller.signal,
  })
    .then(async (res) => {
      if (res.status === 401) {
        tokenStore.clear();
        if (typeof window !== "undefined") window.location.href = "/auth/login";
        throw new Error("Session expired. Please sign in again.");
      }

      if (res.status === 429) {
        const retryAfter = parseInt(res.headers.get("Retry-After") ?? "2", 10);
        if (attempt < retries) {
          await sleep(retryAfter * 1000);
          return request<T>(endpoint, options, attempt + 1);
        }
        throw new Error("Too many requests. Please slow down.");
      }

      if (res.status === 204) return {} as T;

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          body?.detail ?? body?.message ?? `Request failed (${res.status})`,
        );
      }

      return res.json() as Promise<T>;
    })
    .catch(async (err: Error) => {
      if (err.name === "AbortError") throw new Error("Request timed out.");
      if (attempt < retries && !err.message.includes("Session expired")) {
        await sleep(300 * Math.pow(2, attempt));
        return request<T>(endpoint, options, attempt + 1);
      }
      throw err;
    })
    .finally(() => {
      clearTimeout(timer);
      pending.delete(cacheKey);
    }) as Promise<T>;

  if (method === "GET") pending.set(cacheKey, run);
  return run;
}

/* ═══════════════════════════════════════════════════════════════════
   PUBLIC API SURFACE
═══════════════════════════════════════════════════════════════════ */
export const api = {
  /* ── Authentication ─────────────────────────────────────────── */
  auth: {
    login(email: string, password: string) {
      return request<{ token: string; user: User }>("/auth/login/", {
        method: "POST",
        body: JSON.stringify({
          email: sanitise(email),
          password, /* password intentionally not sanitised to allow special chars */
        }),
      }).then((data) => {
        tokenStore.set(data.token);
        userStore.set(data.user as unknown as UserBrief);
        return data;
      });
    },

    register(payload: RegisterPayload) {
      return request<{ token: string; user: User }>("/auth/register/", {
        method: "POST",
        body: JSON.stringify({
          name: sanitise(payload.name),
          email: sanitise(payload.email),
          phone: sanitise(payload.phone ?? ""),
          password: payload.password,
          role: payload.role ?? "patient",
        }),
      }).then((data) => {
        tokenStore.set(data.token);
        userStore.set(data.user);
        return data;
      });
    },

    logout() {
      tokenStore.clear();
      userStore.clear();
    },

    me: () => request<User>("/auth/profile/").then((u) => { userStore.set(u); return u; }),

    forgotPassword: (email: string) =>
      request<{ message: string }>("/auth/forgot-password/", {
        method: "POST",
        body: JSON.stringify({ email }),
      }),

    resetPassword: (email: string, token: string, password: string) =>
      request<{ message: string }>("/auth/reset-password/", {
        method: "POST",
        body: JSON.stringify({ email, token, new_password: password }),
      }),

    changePassword: (old_password: string, new_password: string) =>
      request<{ message: string }>("/auth/change-password/", {
        method: "POST",
        body: JSON.stringify({ old_password, new_password }),
      }),

    uploadAvatar: (file: File) => {
      const form = new FormData();
      form.append("avatar", file);
      const token = tokenStore.get();
      return fetch(`${BASE_URL}/auth/avatar/`, {
        method: "POST",
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: form,
      }).then(async r => {
        if (!r.ok) { const b = await r.json().catch(() => ({})); throw new Error(b?.message ?? `Upload failed (${r.status})`); }
        return r.json() as Promise<{ avatar_url: string }>;
      });
    },
  },

  /* ── Chat ───────────────────────────────────────────────────── */
  chat: {
    conversations: () =>
      request<ChatConversation[]>("/chat/conversations/"),
    startConversation: (userId: number) =>
      request<ChatConversation>("/chat/conversations/start/", {
        method: "POST",
        body: JSON.stringify({ user_id: userId }),
      }),
    messages: (convoId: number) =>
      request<ChatMsg[]>(`/chat/conversations/${convoId}/messages/`),
    send: (convoId: number, text: string, messageType = "text") =>
      request<ChatMsg>(`/chat/conversations/${convoId}/send/`, {
        method: "POST",
        body: JSON.stringify({ text: sanitise(text), message_type: messageType }),
      }),
    searchUsers: (query: string, role?: string) =>
      request<UserBrief[]>(`/chat/users/search/${toQuery({ q: query, role })}`),
  },

  /* ── Doctors ────────────────────────────────────────────────── */
  doctors: {
    list: (filters?: DoctorFilter) =>
      request<PaginatedResponse<Doctor>>(`/doctors/${toQuery(filters as Record<string, unknown>)}`),
    get: (id: number) => request<Doctor>(`/doctors/${id}/`),
    availability: (id: number) =>
      request<{ slots: string[] }>(`/doctors/${id}/availability/`),
  },

  /* ── Departments ─────────────────────────────────────────────── */
  departments: {
    list: () => request<Department[]>("/departments/"),
    get: (id: number) => request<Department>(`/departments/${id}/`),
  },

  /* ── Appointments ────────────────────────────────────────────── */
  appointments: {
    list: (filters?: Record<string, string>) =>
      request<PaginatedResponse<Appointment>>(`/appointments/${toQuery(filters as Record<string, unknown>)}`),
    create: (payload: CreateAppointmentPayload) =>
      request<Appointment>("/appointments/", {
        method: "POST",
        body: JSON.stringify({
          doctorId: payload.doctorId,
          date: payload.date,
          time: payload.time,
          notes: payload.notes ? sanitise(payload.notes) : undefined,
        }),
      }),
    get: (id: number) => request<Appointment>(`/appointments/${id}/`),
    cancel: (id: number) =>
      request<Appointment>(`/appointments/${id}/cancel/`, { method: "POST" }),
    confirm: (id: number) =>
      request<Appointment>(`/appointments/${id}/confirm/`, { method: "POST" }),
    contacts: () =>
      request<(UserBrief & { appointment_status: string; appointment_date: string })[]>("/chat/appointment-contacts/"),
  },

  /* ── Consultation / Chat ─────────────────────────────────────── */
  consultation: {
    start: (appointmentId: number) =>
      request<Consultation>("/consultations/", {
        method: "POST",
        body: JSON.stringify({ appointment_id: appointmentId }),
      }),
    messages: (id: number) =>
      request<Message[]>(`/consultations/${id}/messages/`),
    send: (id: number, text: string) =>
      request<Message>(`/consultations/${id}/messages/`, {
        method: "POST",
        body: JSON.stringify({ text: sanitise(text) }),
      }),
  },

  /* ── Patient portal ──────────────────────────────────────────── */
  patient: {
    dashboard: () => request<PatientDashboardData>("/patient/dashboard/"),
    reports: () => request<Report[]>("/patient/reports/"),
    invoices: () => request<Invoice[]>("/patient/invoices/"),
    profile: () => request<User>("/patient/profile/"),
    updateProfile: (data: Partial<User>) =>
      request<User>("/patient/profile/", {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
  },

  /* ── Doctor portal ───────────────────────────────────────────── */
  doctor: {
    dashboard: () => request<DoctorDashboardData>("/doctor/dashboard/"),
    patients: () => request<Patient[]>("/doctor/patients/"),
    prescriptions: () => request<Prescription[]>("/doctor/prescriptions/"),
    profile: () => request<Doctor>("/doctor/profile/"),
    updateProfile: (data: Partial<Doctor & { experience: number }>) =>
      request<Doctor>("/doctor/profile/", {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    savePrescription: (patientId: number, notes: string, diagnosis?: string) =>
      request<Prescription>("/doctor/prescriptions/", {
        method: "POST",
        body: JSON.stringify({
          patient_id: patientId,
          notes: sanitise(notes),
          diagnosis: diagnosis ? sanitise(diagnosis) : undefined,
        }),
      }),
  },

  /* ── Admin portal ────────────────────────────────────────────── */
  admin: {
    overview: () => request<AdminOverview>("/admin/overview/"),
    doctors: () => request<Doctor[]>("/admin/doctors/"),
    patients: () => request<Patient[]>("/admin/patients/"),
    appointments: () => request<PaginatedResponse<Appointment>>("/admin/appointments/"),
    addDoctor: (data: Partial<Doctor>) =>
      request<Doctor>("/admin/doctors/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    removeDoctor: (id: number) =>
      request<void>(`/admin/doctors/${id}/`, { method: "DELETE" }),
  },

  /* ── Prescriptions ───────────────────────────────────────────── */
  prescriptions: {
    list: (filters?: Record<string, unknown>) =>
      request<Prescription[]>(`/appointments/prescriptions/${toQuery(filters)}`),
    create: (payload: Record<string, unknown>) =>
      request<Prescription>("/appointments/prescriptions/", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    update: (id: number, payload: Record<string, unknown>) =>
      request<Prescription>(`/appointments/prescriptions/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    delete: (id: number) =>
      request<void>(`/appointments/prescriptions/${id}/`, { method: "DELETE" }),
  },

  /* ── Doctor schedule ─────────────────────────────────────────── */
  schedule: {
    get: (doctorId: number) =>
      request<unknown[]>(`/doctors/${doctorId}/schedule/`),
    save: (doctorId: number, payload: Record<string, unknown>) =>
      request<unknown>(`/doctors/${doctorId}/schedule/`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    availability: (doctorId: number, date: string) =>
      request<{ date: string; slots: { time: string; available: boolean }[] }>(
        `/doctors/${doctorId}/availability/?date=${encodeURIComponent(date)}`
      ),
  },

  /* ── File upload ─────────────────────────────────────────────── */
  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    const token = tokenStore.get();
    return fetch(`${BASE_URL}/upload/`, {
      method: "POST",
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: form,
    }).then(async r => {
      if (!r.ok) { const b = await r.json().catch(() => ({})); throw new Error(b?.message ?? `Upload failed (${r.status})`); }
      return r.json() as Promise<{ url: string; name: string; size: number; type: string }>;
    });
  },

  /* ── Contact ─────────────────────────────────────────────────── */
  contact: {
    send: (payload: ContactPayload) =>
      request<{ message: string }>("/contact/", {
        method: "POST",
        body: JSON.stringify({
          name: sanitise(payload.name),
          email: sanitise(payload.email),
          subject: sanitise(payload.subject),
          message: sanitise(payload.message),
        }),
      }),
  },
};
