/**
 * FitZone API Client
 * Centralized fetch wrapper — reads NEXT_PUBLIC_API_URL from .env.local
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// ── Get stored token ───────────────────────────────────────────────
const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("fitzone_token");
};

// ── Core fetch wrapper ─────────────────────────────────────────────
const request = async (endpoint, options = {}) => {
  const token = getToken();

  const config = {
    credentials: "include", // Send cookies too (works in same-origin prod)
    headers: {
      "Content-Type": "application/json",
      // Send token as Bearer header — works cross-origin in dev
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  // Don't set Content-Type for FormData
  if (options.body instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, config);

  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return {};
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || `Request failed: ${res.status}`);
  }

  return data;
};

// ── HTTP methods ───────────────────────────────────────────────────
export const api = {
  get:    (url, opts = {})       => request(url, { method: "GET", ...opts }),
  post:   (url, body, opts = {}) => request(url, { method: "POST",  body: JSON.stringify(body), ...opts }),
  put:    (url, body, opts = {}) => request(url, { method: "PUT",   body: JSON.stringify(body), ...opts }),
  patch:  (url, body, opts = {}) => request(url, { method: "PATCH", body: JSON.stringify(body), ...opts }),
  delete: (url, opts = {})       => request(url, { method: "DELETE", ...opts }),
  upload: (url, formData, opts = {}) => request(url, { method: "POST", body: formData, ...opts }),
};

// ── Auth APIs ──────────────────────────────────────────────────────
export const authAPI = {
  sendOTP:         (email, type = "signup") => api.post("/auth/send-otp", { email, type }),
  verifyOTP:       (email, otp, type = "signup") => api.post("/auth/verify-otp", { email, otp, type }),
  register:        (data)            => api.post("/auth/register", data),
  login:           (email, password) => api.post("/auth/login", { email, password }),
  getMe:           ()                => api.get("/auth/me"),
  logout:          ()                => api.post("/auth/logout", {}),
  refreshToken:    ()                => api.post("/auth/refresh", {
    refreshToken: typeof window !== "undefined" ? localStorage.getItem("fitzone_refresh") : null,
  }),
  changePassword:  (data)            => api.put("/auth/change-password", data),
  forgotPassword:  (email)           => api.post("/auth/forgot-password", { email }),
  resetPassword:   (data)            => api.post("/auth/reset-password", data),
};

// ── Analytics APIs ─────────────────────────────────────────────────
export const analyticsAPI = {
  superAdminDashboard: () => api.get("/analytics/super-admin"),
  gymOwnerDashboard:   () => api.get("/analytics/gym-owner"),
};

// ── Gym APIs ───────────────────────────────────────────────────────
export const gymAPI = {
  getAll:   (params = {}) => api.get(`/gyms?${new URLSearchParams(params)}`),
  getOne:   (id)          => api.get(`/gyms/${id}`),
  create:   (data)        => api.post("/gyms", data),
  update:   (id, data)    => api.put(`/gyms/${id}`, data),
  delete:   (id)          => api.delete(`/gyms/${id}`),
  approve:  (id)          => api.post(`/gyms/${id}/approve`, {}),
  reject:   (id, reason)  => api.post(`/gyms/${id}/reject`, { reason }),
  suspend:  (id)          => api.post(`/gyms/${id}/suspend`, {}),
  stats:    ()            => api.get("/gyms/stats"),
};

// ── Member APIs ────────────────────────────────────────────────────
export const memberAPI = {
  getAll:   (params = {}) => api.get(`/members?${new URLSearchParams(params)}`),
  getOne:   (id)          => api.get(`/members/${id}`),
  create:   (data)        => api.post("/members", data),
  update:   (id, data)    => api.put(`/members/${id}`, data),
  delete:   (id)          => api.delete(`/members/${id}`),
  ban:      (id)          => api.post(`/members/${id}/ban`, {}),
  unban:    (id)          => api.post(`/members/${id}/unban`, {}),
  getQR:    (id)          => api.get(`/members/${id}/qr`),
  stats:    ()            => api.get("/members/stats"),
};

// ── Trainer APIs ───────────────────────────────────────────────────
export const trainerAPI = {
  getAll:  (params = {}) => api.get(`/trainers?${new URLSearchParams(params)}`),
  getOne:  (id)          => api.get(`/trainers/${id}`),
  create:  (data)        => api.post("/trainers", data),
  update:  (id, data)    => api.put(`/trainers/${id}`, data),
  delete:  (id)          => api.delete(`/trainers/${id}`),
  verify:  (id)          => api.post(`/trainers/${id}/verify`, {}),
};

// ── Class APIs ─────────────────────────────────────────────────────
export const classAPI = {
  getAll:    (params = {}) => api.get(`/classes?${new URLSearchParams(params)}`),
  getOne:    (id)          => api.get(`/classes/${id}`),
  getToday:  ()            => api.get("/classes/today"),
  create:    (data)        => api.post("/classes", data),
  update:    (id, data)    => api.put(`/classes/${id}`, data),
  delete:    (id)          => api.delete(`/classes/${id}`),
  enroll:    (id, memberId)   => api.post(`/classes/${id}/enroll`, { memberId }),
  unenroll:  (id, memberId)   => api.post(`/classes/${id}/unenroll`, { memberId }),
};

// ── Attendance APIs ────────────────────────────────────────────────
export const attendanceAPI = {
  getAll:   (params = {}) => api.get(`/attendance?${new URLSearchParams(params)}`),
  checkIn:  (data)        => api.post("/attendance/checkin", data),
  checkOut: (data)        => api.post("/attendance/checkout", data),
  stats:    ()            => api.get("/attendance/stats"),
};

// ── Plan APIs ──────────────────────────────────────────────────────
export const planAPI = {
  getAll:  (params = {}) => api.get(`/plans?${new URLSearchParams(params)}`),
  getOne:  (id)          => api.get(`/plans/${id}`),
  create:  (data)        => api.post("/plans", data),
  update:  (id, data)    => api.put(`/plans/${id}`, data),
  delete:  (id)          => api.delete(`/plans/${id}`),
};

// ── Payment APIs ───────────────────────────────────────────────────
export const paymentAPI = {
  getAll:              (params = {}) => api.get(`/payments?${new URLSearchParams(params)}`),
  createRazorpayOrder: (data)        => api.post("/payments/create-order", data),
  verifyRazorpay:      (data)        => api.post("/payments/verify-razorpay", data),
  createStripeIntent:  (data)        => api.post("/payments/create-stripe-intent", data),
  confirmStripe:       (data)        => api.post("/payments/confirm-stripe", data),
  createManual:        (data)        => api.post("/payments/manual", data),
  revenue:             ()            => api.get("/payments/revenue"),
};

// ── Invoice APIs ───────────────────────────────────────────────────
export const invoiceAPI = {
  getAll:  (params = {}) => api.get(`/invoices?${new URLSearchParams(params)}`),
  getOne:  (id)          => api.get(`/invoices/${id}`),
  send:    (id)          => api.post(`/invoices/${id}/send`, {}),
};

// ── Notification APIs ──────────────────────────────────────────────
export const notificationAPI = {
  getAll:      (params = {}) => api.get(`/notifications?${new URLSearchParams(params)}`),
  broadcast:   (data)        => api.post("/notifications/broadcast", data),
  markRead:    (id)          => api.patch(`/notifications/${id}/read`, {}),
  markAllRead: ()            => api.patch("/notifications/read-all", {}),
  delete:      (id)          => api.delete(`/notifications/${id}`),
};

// ── Settings APIs ──────────────────────────────────────────────────
export const settingsAPI = {
  get:    () => api.get("/settings"),
  update: (data) => api.put("/settings", data),
};

// ── Zoom APIs ──────────────────────────────────────────────────────
export const zoomAPI = {
  getAll:    (params = {}) => api.get(`/zoom?${new URLSearchParams(params)}`),
  getOne:    (id)          => api.get(`/zoom/${id}`),
  create:    (data)        => api.post("/zoom", data),
  delete:    (id)          => api.delete(`/zoom/${id}`),
  register:  (id, memberId) => api.post(`/zoom/${id}/register`, { memberId }),
};

// ── Promo APIs ─────────────────────────────────────────────────────
export const promoAPI = {
  getAll:   ()            => api.get("/promos"),
  create:   (data)        => api.post("/promos", data),
  update:   (id, data)    => api.put(`/promos/${id}`, data),
  delete:   (id)          => api.delete(`/promos/${id}`),
  validate: (code, amount) => api.post("/promos/validate", { code, amount }),
};

// ── Review APIs ────────────────────────────────────────────────────
export const reviewAPI = {
  getAll:   (params = {}) => api.get(`/reviews?${new URLSearchParams(params)}`),
  create:   (data)        => api.post("/reviews", data),
  approve:  (id)          => api.post(`/reviews/${id}/approve`, {}),
  flag:     (id, reason)  => api.post(`/reviews/${id}/flag`, { reason }),
  delete:   (id)          => api.delete(`/reviews/${id}`),
};

// ── Blog APIs ──────────────────────────────────────────────────────
export const blogAPI = {
  getAll:  (params = {}) => api.get(`/blog?${new URLSearchParams(params)}`),
  getOne:  (id)          => api.get(`/blog/${id}`),
  create:  (data)        => api.post("/blog", data),
  update:  (id, data)    => api.put(`/blog/${id}`, data),
  delete:  (id)          => api.delete(`/blog/${id}`),
};

// ── Activity Log APIs ──────────────────────────────────────────────
export const logAPI = {
  getAll:  (params = {}) => api.get(`/logs?${new URLSearchParams(params)}`),
  clear:   (before)      => api.delete("/logs", { body: JSON.stringify({ before }) }),
};

// ── Upload APIs ────────────────────────────────────────────────────
export const uploadAPI = {
  upload: (file, folder = "fitzone") => {
    const form = new FormData();
    form.append("file", file);
    // Use raw fetch for FormData — don't JSON.stringify
    const token = getToken();
    return fetch(`${BASE_URL}/uploads?folder=${folder}`, {
      method: "POST",
      credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");
      return data;
    });
  },
  delete: (publicId) => api.delete("/uploads", { body: JSON.stringify({ publicId }) }),
};
