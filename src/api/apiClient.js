// src/api/apiClient.js
import axios from 'axios';

// ═══════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════
const BASE = (
  import.meta.env.VITE_API_BASE_URL ||
  'https://nextsignbackendfinal.vercel.app/api'
).replace(/\/$/, '');

const TIMEOUT_NORMAL  = 15_000;  // 15s
const TIMEOUT_UPLOAD  = 60_000;  // 60s
const TIMEOUT_SIGN    = 45_000;  // 45s (PDF processing)
const MAX_RETRIES     = 1;
const RETRY_DELAY_MS  = 2_000;
const CACHE_TTL_MS    = 30_000;  // 30s

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function getTimeout(config) {
  const url = config.url || '';
  if (config.data instanceof FormData)     return TIMEOUT_UPLOAD;
  if (url.includes('upload'))              return TIMEOUT_UPLOAD;
  if (url.includes('sign/submit'))         return TIMEOUT_SIGN;
  if (url.includes('template'))            return TIMEOUT_SIGN;
  return TIMEOUT_NORMAL;
}

function isRetryable(error) {
  if (axios.isCancel(error))  return false;
  if (!error.response)        return true; // network error
  return [408, 429, 502, 503, 504].includes(error.response.status);
}

function getCacheKey(config) {
  const params = config.params ? JSON.stringify(config.params) : '';
  return `${(config.method || 'get').toUpperCase()}:${config.url || ''}${params}`;
}

// ═══════════════════════════════════════════════════════════════
// CACHE + DEDUP
// ═══════════════════════════════════════════════════════════════
const requestCache = new Map();  // { key → { data, timestamp } }
const inflightMap  = new Map();  // { key → Promise } dedup

export const apiCache = {
  // Invalidate specific URL
  invalidate(url, params = {}) {
    const key = `GET:${url}${JSON.stringify(params)}`;
    requestCache.delete(key);
    inflightMap.delete(key);
  },

  // Invalidate by pattern (e.g. all /documents)
  invalidatePattern(pattern) {
    for (const key of requestCache.keys()) {
      if (key.includes(pattern)) {
        requestCache.delete(key);
        inflightMap.delete(key);
      }
    }
  },

  // Clear all cache
  clear() {
    requestCache.clear();
    inflightMap.clear();
  },

  // Prefetch (warm cache)
  prefetch(url, params = {}) {
    api.get(url, { params }).catch(() => {});
  },

  // Debug
  inspect() {
    const result = {};
    requestCache.forEach((v, k) => {
      result[k] = {
        age:  `${Math.round((Date.now() - v.timestamp) / 1000)}s`,
        size: `${JSON.stringify(v.data).length} bytes`,
      };
    });
    return result;
  },
};

// ═══════════════════════════════════════════════════════════════
// ERROR NORMALIZER
// ═══════════════════════════════════════════════════════════════
function normalizeError(error) {
  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;

  // Network / timeout
  if (!error.response) {
    return {
      __network: true,
      __offline: isOffline,
      __timeout: error.code === 'ECONNABORTED',
      message:   isOffline
        ? 'No internet connection. Please check your network.'
        : error.code === 'ECONNABORTED'
          ? 'Request timed out. Please try again.'
          : 'Cannot reach server. Please try again.',
      status: 0,
      retry:  true,
    };
  }

  // Server error
  const data = error.response.data;
  return {
    message: data?.message || data?.error || `Server error (${error.response.status})`,
    code:    data?.code    || null,
    status:  error.response.status,
    data,
    retry:   isRetryable(error),
  };
}

// ═══════════════════════════════════════════════════════════════
// AXIOS INSTANCE
// ═══════════════════════════════════════════════════════════════
export const api = axios.create({
  baseURL:         BASE,
  withCredentials: true,
  timeout:         TIMEOUT_NORMAL,
  headers: {
    Accept:         'application/json',
    'Content-Type': 'application/json',
  },
});

// ═══════════════════════════════════════════════════════════════
// REQUEST INTERCEPTOR
// ═══════════════════════════════════════════════════════════════
api.interceptors.request.use(
  (config) => {
    // ── Auth token ─────────────────────────────────────────
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ── FormData → let browser set Content-Type ────────────
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    // ── Dynamic timeout ────────────────────────────────────
    config.timeout = getTimeout(config);

    return config;
  },
  (error) => Promise.reject(error),
);

// ═══════════════════════════════════════════════════════════════
// RESPONSE INTERCEPTOR
// ═══════════════════════════════════════════════════════════════
api.interceptors.response.use(
  // ── Success ──────────────────────────────────────────────
  (response) => {
    const config = response.config;

    // Cache GET responses
    if (config?.method?.toLowerCase() === 'get') {
      const key = getCacheKey(config);
      requestCache.set(key, {
        data:      response.data,
        timestamp: Date.now(),
      });
      inflightMap.delete(key);
    }

    return response;
  },

  // ── Error ─────────────────────────────────────────────────
  async (error) => {
    if (axios.isCancel(error)) {
      return Promise.reject({ __cancelled: true });
    }

    const config = error.config;
    if (!config) return Promise.reject(normalizeError(error));

    const key    = getCacheKey(config);
    const status = error.response?.status;

    // ── 401 → logout ───────────────────────────────────────
    if (status === 401) {
      localStorage.removeItem('token');
      inflightMap.delete(key);

      if (
        typeof window !== 'undefined' &&
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/sign/')
      ) {
        window.location.href = '/login?expired=true';
      }
      return Promise.reject(normalizeError(error));
    }

    // ── Non-retryable ──────────────────────────────────────
    if ([400, 403, 404, 409, 410, 422].includes(status)) {
      inflightMap.delete(key);
      return Promise.reject(normalizeError(error));
    }

    // ── Retry ──────────────────────────────────────────────
    if (isRetryable(error)) {
      config.__retryCount = (config.__retryCount || 0) + 1;

      if (config.__retryCount <= MAX_RETRIES) {
        console.warn(`🔁 Retry ${config.__retryCount}/${MAX_RETRIES}: ${config.url}`);

        // Stale-while-revalidate for GET
        const cached = requestCache.get(key);
        if (cached && config.method?.toLowerCase() === 'get') {
          // Return stale immediately, refresh in background
          setTimeout(() => api(config).catch(() => {}), RETRY_DELAY_MS);
          return Promise.resolve({
            data:        cached.data,
            status:      200,
            __fromCache: true,
            __stale:     true,
          });
        }

        await sleep(RETRY_DELAY_MS);
        return api(config);
      }
    }

    inflightMap.delete(key);
    return Promise.reject(normalizeError(error));
  },
);

// ═══════════════════════════════════════════════════════════════
// OVERRIDE api.get — cache + dedup
// ═══════════════════════════════════════════════════════════════
const _originalGet = api.get.bind(api);

api.get = function cachedGet(url, config = {}) {
  const mergedConfig = { ...config, url, method: 'get' };
  const key          = getCacheKey(mergedConfig);

  // ── Fresh cache hit ───────────────────────────────────────
  if (!config.noCache) {
    const cached = requestCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return Promise.resolve({
        data:        cached.data,
        status:      200,
        __fromCache: true,
      });
    }
  }

  // ── Dedup: same request already in-flight ─────────────────
  if (inflightMap.has(key)) {
    return inflightMap.get(key);
  }

  // ── New request ───────────────────────────────────────────
  const promise = _originalGet(url, config).finally(() => {
    inflightMap.delete(key);
  });

  inflightMap.set(key, promise);
  return promise;
};

// ═══════════════════════════════════════════════════════════════
// NAMED API METHODS (typed, clean)
// ═══════════════════════════════════════════════════════════════

// ── Auth ──────────────────────────────────────────────────────
export const authApi = {
  login:          (data)   => api.post('/auth/login',           data),
  register:       (data)   => api.post('/auth/register',        data),
  googleAuth:     (data)   => api.post('/auth/google',          data),
  getMe:          ()       => api.get('/auth/me'),
  updateProfile:  (data)   => api.put('/auth/profile',          data),
  changePassword: (data)   => api.put('/auth/change-password',  data),
  logout:         ()       => api.post('/auth/logout'),
};

// ── Documents ─────────────────────────────────────────────────
export const documentApi = {
  // Dashboard list
  getAll: (params = {}) =>
    api.get('/documents', { params }),

  // Single document
  getOne: (id) =>
    api.get(`/documents/${id}`),

  // Audit log
  getAudit: (id) =>
    api.get(`/documents/${id}/audit`, { noCache: true }),

  // Upload PDF only
  upload: (formData) =>
    api.post('/documents/upload', formData),

  // Upload logo
  uploadLogo: (formData) =>
    api.post('/documents/upload-logo', formData),

  // Save draft
  update: (id, data) =>
    api.put(`/documents/${id}`, data),

  // Send for signing
  send: (formData) =>
    api.post('/documents/upload-and-send', formData),

  // Delete
  delete: (id) =>
    api.delete(`/documents/${id}`),

  // ── Signing (public — no auth) ──────────────────────────
  validateToken: (token) =>
    api.get(`/documents/sign/validate/${token}`, { noCache: true }),

  submitSignature: (data) =>
    api.post('/documents/sign/submit', data),

  getPdfProxy: (token) =>
    `${BASE}/documents/sign/${token}/pdf`,
};

// ── Templates ─────────────────────────────────────────────────
export const templateApi = {
  getAll: (params = {}) =>
    api.get('/templates', { params }),

  getOne: (id) =>
    api.get(`/templates/${id}`),

  create: (formData) =>
    api.post('/templates', formData),

  update: (id, data) =>
    api.put(`/templates/${id}`, data),

  delete: (id) =>
    api.delete(`/templates/${id}`),

  // Boss signs
  bossSign: (id, data) =>
    api.post(`/templates/${id}/boss-sign`, data),

  // Send to employees
  distribute: (id, data) =>
    api.post(`/templates/${id}/distribute`, data),

  // Get sessions (employee tracking)
  getSessions: (id) =>
    api.get(`/templates/${id}/sessions`, { noCache: true }),

  // Employee signing (public)
  validateEmployeeToken: (token) =>
    api.get(`/templates/sign/validate/${token}`, { noCache: true }),

  submitEmployeeSignature: (data) =>
    api.post('/templates/sign/submit', data),
};

// ── Admin ─────────────────────────────────────────────────────
export const adminApi = {
  getStats:       ()           => api.get('/admin/stats',     { noCache: true }),
  getUsers:       (params = {})=> api.get('/admin/users',     { params }),
  getUser:        (id)         => api.get(`/admin/users/${id}`),
  updateRole:     (id, role)   => api.put(`/admin/users/${id}/role`, { role }),
  toggleStatus:   (id)         => api.put(`/admin/users/${id}/toggle-status`),
  deleteUser:     (id)         => api.delete(`/admin/users/${id}`),
  getDocuments:   (params = {})=> api.get('/admin/documents', { params }),
  deleteDocument: (id)         => api.delete(`/admin/documents/${id}`),
  getAuditLogs:   (params = {})=> api.get('/admin/audit-logs',{ params, noCache: true }),
};

// ── Feedback ──────────────────────────────────────────────────
export const feedbackApi = {
  submit: (data) => api.post('/feedback', data),
};

// ═══════════════════════════════════════════════════════════════
// PROXY URL BUILDER
// ═══════════════════════════════════════════════════════════════
export function buildProxyUrl(cloudinaryUrl) {
  if (!cloudinaryUrl) return '';
  if (
    cloudinaryUrl.startsWith('blob:') ||
    cloudinaryUrl.startsWith('data:')
  ) return cloudinaryUrl;

  return cloudinaryUrl; // Cloudinary URL সরাসরি use করবে
}

// ═══════════════════════════════════════════════════════════════
// ONLINE / OFFLINE
// ═══════════════════════════════════════════════════════════════
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('✅ Network restored');
    apiCache.clear(); // Fresh data আনবে
  });

  window.addEventListener('offline', () => {
    console.warn('📵 Network offline — serving from cache');
  });
}

export default api;