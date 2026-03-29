// src/api/apiClient.js
import axios from 'axios';

// ════════════════════════════════════════════════════════════════
// CONFIG
// ════════════════════════════════════════════════════════════════
const BASE = (
  import.meta.env.VITE_API_BASE_URL ||
  'https://nextsignbackendfinal.vercel.app/api'
).replace(/\/$/, '');

const TIMEOUT_NORMAL = 15000;  // 15s
const TIMEOUT_UPLOAD = 60000;  // 60s
const MAX_RETRIES    = 1;      // Dashboard hang fix
const RETRY_DELAY_MS = 2000;   // 2s base
const CACHE_TTL_MS   = 30000;  // 30s

// ════════════════════════════════════════════════════════════════
// CACHE — memory তে data রাখে
// ════════════════════════════════════════════════════════════════
const requestCache  = new Map();
const inflightMap   = new Map(); // Deduplication — same request দুবার যাবে না

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const isUploadRequest = (config) =>
  config.data instanceof FormData ||
  (config.url || '').includes('upload') ||
  (config.url || '').includes('sign');

const isRetryable = (error) => {
  if (axios.isCancel(error)) return false;
  if (!error.response)       return true;
  return [408, 429, 502, 503, 504].includes(
    error.response?.status
  );
};

const getCacheKey = (config) => {
  const params = config.params
    ? JSON.stringify(config.params) : '';
  return `${(config.method || 'get').toUpperCase()}:${config.url || ''}${params}`;
};

// ════════════════════════════════════════════════════════════════
// AXIOS INSTANCE
// ════════════════════════════════════════════════════════════════
export const api = axios.create({
  baseURL:         BASE,
  withCredentials: true,
  timeout:         TIMEOUT_NORMAL,
  headers: {
    Accept:         'application/json',
    'Content-Type': 'application/json',
  },
});

// ════════════════════════════════════════════════════════════════
// REQUEST INTERCEPTOR
// ════════════════════════════════════════════════════════════════
api.interceptors.request.use(
  (config) => {
    // ── Auth token ──────────────────────────────────────────
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ── FormData — browser নিজেই Content-Type set করবে ──────
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    // ── Upload timeout ───────────────────────────────────────
    if (isUploadRequest(config)) {
      config.timeout = TIMEOUT_UPLOAD;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ════════════════════════════════════════════════════════════════
// RESPONSE INTERCEPTOR
// ════════════════════════════════════════════════════════════════
api.interceptors.response.use(
  // ── Success ────────────────────────────────────────────────
  (response) => {
    const config = response.config;

    // GET responses cache করো
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

  // ── Error ──────────────────────────────────────────────────
  async (error) => {
    // Cancel — ignore করো
    if (axios.isCancel(error)) {
      return Promise.reject({ __cancelled: true });
    }

    const config = error.config;
    if (!config) return Promise.reject(normalizeError(error));

    const key = getCacheKey(config);

    // ── 401 — logout ────────────────────────────────────────
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      inflightMap.delete(key);
      if (
        typeof window !== 'undefined' &&
        window.location.pathname !== '/login'
      ) {
        window.location.href = '/login?expired=true';
      }
      return Promise.reject(normalizeError(error));
    }

    // ── 400, 404, 403 — retry করব না ───────────────────────
    if ([400, 403, 404, 422].includes(error.response?.status)) {
      inflightMap.delete(key);
      return Promise.reject(normalizeError(error));
    }

    // ── Retry logic ─────────────────────────────────────────
    if (isRetryable(error)) {
      config.__retryCount = (config.__retryCount || 0) + 1;

      if (config.__retryCount <= MAX_RETRIES) {
        console.warn(
          `🔁 Retry ${config.__retryCount}/${MAX_RETRIES}:`,
          config.url
        );

        // Stale cache থাকলে সেটা দিয়ে দাও, background এ retry
        const cached = requestCache.get(key);
        if (cached && config.method?.toLowerCase() === 'get') {
          // Background এ fresh data আনো
          setTimeout(() => {
            api(config).catch(() => {});
          }, RETRY_DELAY_MS);

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
  }
);

// ════════════════════════════════════════════════════════════════
// API GET — cache + deduplication সহ
// ════════════════════════════════════════════════════════════════
const originalGet = api.get.bind(api);
api.get = async function cachedGet(url, config = {}) {
  const mergedConfig = { ...config, url, method: 'get' };
  const key          = getCacheKey(mergedConfig);

  // ── Cache hit ───────────────────────────────────────────
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

  // ── Deduplication — একই request চলছে? ──────────────────
  if (inflightMap.has(key)) {
    return inflightMap.get(key);
  }

  // ── Fresh request ───────────────────────────────────────
  const promise = originalGet(url, config).finally(() => {
    inflightMap.delete(key);
  });

  inflightMap.set(key, promise);
  return promise;
};

// ════════════════════════════════════════════════════════════════
// ERROR NORMALIZER
// ════════════════════════════════════════════════════════════════
function normalizeError(error) {
  const isOffline =
    typeof navigator !== 'undefined' && !navigator.onLine;

  if (!error.response) {
    return {
      __network: true,
      __offline: isOffline,
      __timeout: error.code === 'ECONNABORTED',
      message:   isOffline
        ? 'No internet connection.'
        : error.code === 'ECONNABORTED'
          ? 'Request timed out. Please try again.'
          : 'Cannot reach server. Please try again.',
      status: 0,
      retry:  true,
    };
  }

  return {
    message:
      error.response.data?.message ||
      error.response.data?.error   ||
      `Server error (${error.response.status})`,
    status: error.response.status,
    data:   error.response.data,
  };
}

// ════════════════════════════════════════════════════════════════
// PROXY URL BUILDER
// ════════════════════════════════════════════════════════════════
export function buildProxyUrl(cloudinaryUrl) {
  if (!cloudinaryUrl) return '';

  if (
    cloudinaryUrl.startsWith('blob:') ||
    cloudinaryUrl.startsWith('data:')
  ) return cloudinaryUrl;

  if (cloudinaryUrl.includes('/documents/proxy/'))
    return cloudinaryUrl;

  const parts = cloudinaryUrl.split('/upload/');
  if (parts.length < 2) return cloudinaryUrl;

  const encoded = parts[1]
    .split('?')[0]
    .replace(/\//g, '~~');

  return `${BASE}/documents/proxy/${encoded}`;
}

// ════════════════════════════════════════════════════════════════
// CACHE UTILITIES
// ════════════════════════════════════════════════════════════════
export const apiCache = {
  invalidate: (url, params = {}) => {
    const key = `GET:${url}${JSON.stringify(params)}`;
    requestCache.delete(key);
    inflightMap.delete(key);
  },

  clear: () => {
    requestCache.clear();
    inflightMap.clear();
  },

  inspect: () => {
    const result = {};
    requestCache.forEach((v, k) => {
      result[k] = {
        age:  `${Math.round((Date.now() - v.timestamp) / 1000)}s`,
        size: `${JSON.stringify(v.data).length} bytes`,
      };
    });
    return result;
  },

  prefetch: (url, params = {}) => {
    api.get(url, { params }).catch(() => {});
  },
};

// ════════════════════════════════════════════════════════════════
// ONLINE/OFFLINE EVENTS — SSR safe
// ════════════════════════════════════════════════════════════════
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('✅ Network restored');
    apiCache.clear();
  });

  window.addEventListener('offline', () => {
    console.warn('📵 Network offline');
  });
}

export default api;
