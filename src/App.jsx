// src/api/apiClient.js
import axios from 'axios';

// ═══════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════
const BASE = (
  import.meta.env.VITE_API_BASE_URL ||
  'https://nextsignbackendfinal.vercel.app/api'
).replace(/\/$/, '');

const TIMEOUT_NORMAL = 20_000;
const TIMEOUT_UPLOAD = 90_000;
const TIMEOUT_SIGN   = 60_000;
const MAX_RETRIES    = 1;
const RETRY_DELAY_MS = 2_000;
const CACHE_TTL_MS   = 30_000;

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function getTimeout(config) {
  const url = config.url || '';
  if (config.data instanceof FormData) return TIMEOUT_UPLOAD;
  if (url.includes('upload'))          return TIMEOUT_UPLOAD;
  if (url.includes('boss-sign'))       return TIMEOUT_SIGN;
  if (url.includes('sign/submit'))     return TIMEOUT_SIGN;
  return TIMEOUT_NORMAL;
}

function isRetryable(error) {
  if (axios.isCancel(error)) return false;
  if (!error.response)       return true;
  return [408, 429, 502, 503, 504].includes(error.response.status);
}

function getCacheKey(config) {
  const params = config.params ? JSON.stringify(config.params) : '';
  return `${(config.method || 'get').toUpperCase()}:${config.url || ''}${params}`;
}

// ═══════════════════════════════════════════════════════════════
// CACHE + DEDUP
// ═══════════════════════════════════════════════════════════════
const requestCache = new Map();
const inflightMap  = new Map();

export const apiCache = {
  invalidate(url, params = {}) {
    const key = `GET:${url}${JSON.stringify(params)}`;
    requestCache.delete(key);
    inflightMap.delete(key);
  },

  invalidatePattern(pattern) {
    for (const key of requestCache.keys()) {
      if (key.includes(pattern)) {
        requestCache.delete(key);
        inflightMap.delete(key);
      }
    }
  },

  clear() {
    requestCache.clear();
    inflightMap.clear();
  },

  prefetch(url, params = {}) {
    api.get(url, { params }).catch(() => {});
  },
};

// ═══════════════════════════════════════════════════════════════
// ERROR NORMALIZER
// ═══════════════════════════════════════════════════════════════
function normalizeError(error) {
  const isOffline =
    typeof navigator !== 'undefined' && !navigator.onLine;

  if (!error.response) {
    return {
      __network: true,
      __offline: isOffline,
      __timeout: error.code === 'ECONNABORTED',
      message: isOffline
        ? 'No internet connection. Please check your network.'
        : error.code === 'ECONNABORTED'
          ? 'Request timed out. Please try again.'
          : 'Cannot reach server. Please try again.',
      status: 0,
      retry:  true,
    };
  }

  const data = error.response.data;
  return {
    message: data?.message || data?.error ||
      `Server error (${error.response.status})`,
    code:   data?.code || null,
    status: error.response.status,
    data,
    retry:  isRetryable(error),
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
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
      if (config.headers.common) {
        delete config.headers.common['Content-Type'];
      }
    }

    config.timeout = getTimeout(config);
    return config;
  },
  (error) => Promise.reject(error),
);

// ═══════════════════════════════════════════════════════════════
// RESPONSE INTERCEPTOR
// ═══════════════════════════════════════════════════════════════
api.interceptors.response.use(
  (response) => {
    const config = response.config;

    if (config?.method?.toLowerCase() === 'get') {
      const key = getCacheKey(config);
      requestCache.set(key, {
        data:      response.data,
        timestamp: Date.now(),
      });
      inflightMap.delete(key);
    }

    // POST mutations → related cache clear
    if (config?.method?.toLowerCase() === 'post') {
      const url = config?.url || '';
      if (url.includes('upload-and-send'))
        apiCache.invalidatePattern('/documents');
      if (url.includes('/templates') && !url.includes('/sign'))
        apiCache.invalidatePattern('/templates');
      if (url.includes('boss-sign'))
        apiCache.invalidatePattern('/templates');
    }

    return response;
  },

  async (error) => {
    if (axios.isCancel(error)) {
      return Promise.reject({ __cancelled: true });
    }

    const config = error.config;
    if (!config) return Promise.reject(normalizeError(error));

    const key    = getCacheKey(config);
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem('token');
      inflightMap.delete(key);

      const isPublicPage =
        window.location.pathname.includes('/login')         ||
        window.location.pathname.includes('/sign/')         ||
        window.location.pathname.includes('/template-sign') ||
        window.location.pathname.includes('/register');

      if (typeof window !== 'undefined' && !isPublicPage) {
        window.location.href = '/login?expired=true';
      }

      return Promise.reject(normalizeError(error));
    }

    if ([400, 403, 404, 409, 410, 422].includes(status)) {
      inflightMap.delete(key);
      return Promise.reject(normalizeError(error));
    }

    if (isRetryable(error)) {
      config.__retryCount = (config.__retryCount || 0) + 1;

      if (config.__retryCount <= MAX_RETRIES) {
        console.warn(`🔁 Retry ${config.__retryCount}/${MAX_RETRIES}: ${config.url}`);

        const cached = requestCache.get(key);
        if (cached && config.method?.toLowerCase() === 'get') {
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

  if (inflightMap.has(key)) return inflightMap.get(key);

  const promise = _originalGet(url, config).finally(() => {
    inflightMap.delete(key);
  });

  inflightMap.set(key, promise);
  return promise;
};

// ═══════════════════════════════════════════════════════════════
// AUTH API
// ═══════════════════════════════════════════════════════════════
export const authApi = {
  login:          (data) => api.post('/auth/login',          data),
  register:       (data) => api.post('/auth/register',       data),
  googleAuth:     (data) => api.post('/auth/google',         data),
  getMe:          ()     => api.get('/auth/me'),
  updateProfile:  (data) => api.put('/auth/profile',         data),
  changePassword: (data) => api.put('/auth/change-password', data),
  logout:         ()     => api.post('/auth/logout'),
};

// ═══════════════════════════════════════════════════════════════
// DOCUMENT API
// ═══════════════════════════════════════════════════════════════
export const documentApi = {
  getAll: (params = {}) =>
    api.get('/documents', { params }),

  getOne: (id) =>
    api.get(`/documents/${id}`),

  getAudit: (id) =>
    api.get(`/documents/${id}/audit`, { noCache: true }),

  upload: (formData) =>
    api.post('/documents/upload', formData),

  uploadLogo: (formData) =>
    api.post('/documents/upload-logo', formData),

  update: (id, data) =>
    api.put(`/documents/${id}`, data),

  send: (formData) =>
    api.post('/documents/upload-and-send', formData).then(res => {
      apiCache.invalidatePattern('/documents');
      return res;
    }),

  delete: (id) =>
    api.delete(`/documents/${id}`).then(res => {
      apiCache.invalidatePattern('/documents');
      return res;
    }),

  // Public — no auth
  validateToken: (token) =>
    api.get(`/documents/sign/validate/${token}`, { noCache: true }),

  submitSignature: (data) =>
    api.post('/documents/sign/submit', data),

  getPdfProxy: (token) =>
    `${BASE}/documents/sign/${token}/pdf`,
};

// ═══════════════════════════════════════════════════════════════
// TEMPLATE API ✅ FIXED
// ═══════════════════════════════════════════════════════════════
export const templateApi = {
  // ── Owner routes (auth required) ──────────────────────────
  getAll: (params = {}) =>
    api.get('/templates', { params }),

  getOne: (id) =>
    api.get(`/templates/${id}`, { noCache: true }),

  create: (data) =>
    api.post('/templates', data).then(res => {
      apiCache.invalidatePattern('/templates');
      return res;
    }),

  update: (id, data) =>
    api.put(`/templates/${id}`, data).then(res => {
      apiCache.invalidatePattern('/templates');
      return res;
    }),

  delete: (id) =>
    api.delete(`/templates/${id}`).then(res => {
      apiCache.invalidatePattern('/templates');
      return res;
    }),

  // Boss signs the template
  // Body: { signatureDataUrl, fieldValues[] }
  bossSign: (id, data) =>
    api.post(`/templates/${id}/boss-sign`, data).then(res => {
      apiCache.invalidatePattern('/templates');
      return res;
    }),

  // Get all employee sessions
  getSessions: (id, params = {}) =>
    api.get(`/templates/${id}/sessions`, { params, noCache: true }),

  // Resend email to specific employee
  resendEmail: (templateId, sessionId) =>
    api.post(`/templates/${templateId}/sessions/${sessionId}/resend`),

  // ── Public routes (no auth — token based) ─────────────────

  // Employee opens signing link
  validateEmployeeToken: (token) =>
    api.get(`/templates/sign/validate/${token}`, { noCache: true }),

  // Employee submits signature ✅ FIXED — token in URL
  submitEmployeeSignature: (token, data) =>
    api.post(`/templates/sign/submit/${token}`, data),

  // Employee declines signing
  declineEmployee: (token, data = {}) =>
    api.post(`/templates/sign/decline/${token}`, data),

  // PDF proxy URL builder
  getEmployeePdfUrl: (token) =>
    `${BASE}/templates/sign/${token}/pdf`,
};

// ═══════════════════════════════════════════════════════════════
// ADMIN API
// ═══════════════════════════════════════════════════════════════
export const adminApi = {
  getStats:       ()           => api.get('/admin/stats',              { noCache: true }),
  getUsers:       (params = {})=> api.get('/admin/users',              { params }),
  getUser:        (id)         => api.get(`/admin/users/${id}`),
  updateRole:     (id, role)   => api.put(`/admin/users/${id}/role`,   { role }),
  toggleStatus:   (id)         => api.put(`/admin/users/${id}/toggle-status`),
  deleteUser:     (id)         => api.delete(`/admin/users/${id}`),
  getDocuments:   (params = {})=> api.get('/admin/documents',          { params }),
  deleteDocument: (id)         => api.delete(`/admin/documents/${id}`),
  getAuditLogs:   (params = {})=> api.get('/admin/audit-logs',         { params, noCache: true }),
};

// ═══════════════════════════════════════════════════════════════
// FEEDBACK API
// ═══════════════════════════════════════════════════════════════
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
  return cloudinaryUrl;
}

// ═══════════════════════════════════════════════════════════════
// ONLINE / OFFLINE
// ═══════════════════════════════════════════════════════════════
if (typeof window !== 'undefined') {
  window.addEventListener('online',  () => {
    console.log('✅ Network restored');
    apiCache.clear();
  });
  window.addEventListener('offline', () => {
    console.warn('📵 Network offline');
  });
}

export default api;