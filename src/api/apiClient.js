
// import axios from 'axios';

// // ✅ FIX: strip trailing slash to prevent double-slash bugs
// const BASE = (import.meta.env.VITE_API_BASE_URL || 'https://nextsignbackendfinal.vercel.app/api').replace(/\/$/, '');

// export const api = axios.create({
//   baseURL: BASE,
//   withCredentials: true,
//   timeout: 60000,
// });

// /**
//  * ✅ CORE FIX — Cloudinary Proxy URL Builder
//  *
//  * BUG BEFORE: replace(/\//g, '_') destroyed version numbers like "v1774334567"
//  * because backend's replace(/_/g, '/') turned ALL underscores back to slashes,
//  * making "v1774334567" → "v1774334567" (fine) but "nexsign_docs" → "nexsign/docs" ✓
//  * — ACTUALLY the real problem: Vercel strips the path after the last dot
//  * if there is a .pdf extension in the middle of a URL segment.
//  *
//  * FIX: encode "/" as "~~" (double tilde) — safe in URL paths, never appears
//  * in Cloudinary public IDs, and easy to decode on the backend.
//  *
//  * ⚠️  You must also update your backend proxy route decoder:
//  *     const cloudPath = req.params.path.replace(/~~/g, '/');
//  */
// // export function buildProxyUrl(cloudinaryUrl) {
// //   if (!cloudinaryUrl) return '';
// //   if (cloudinaryUrl.startsWith('blob:') || cloudinaryUrl.startsWith('data:')) {
// //     return cloudinaryUrl;
// //   }
// //   const parts = cloudinaryUrl.split('/upload/');
// //   if (parts.length < 2) return cloudinaryUrl;
// //   // Encode slashes as ~~ so express wildcard captures the full path safely
// //   const encoded = parts[1].replace(/\//g, '~~');
// //   return `${BASE}/documents/proxy/${encoded}`;
// // }
// /**
//  * ✅ CORE FIX — Cloudinary Proxy URL Builder with Cache Buster
//  * * কেন এই পরিবর্তন? 
//  * ব্রাউজার অনেক সময় একই URL দেখে পুরনো ফাইল ক্যাশ থেকে দেখায়। 
//  * শেষে ?t=[timestamp] যোগ করলে ব্রাউজার বাধ্য হয়ে সার্ভার থেকে লেটেস্ট ফাইল লোড করে।
//  */
// export function buildProxyUrl(cloudinaryUrl) {
//   if (!cloudinaryUrl) return '';
//   if (cloudinaryUrl.startsWith('blob:') || cloudinaryUrl.startsWith('data:')) {
//     return cloudinaryUrl;
//   }
  
//   const parts = cloudinaryUrl.split('/upload/');
//   if (parts.length < 2) return cloudinaryUrl;

//   // ১. স্ল্যাশগুলোকে '~~' দিয়ে এনকোড করা (আগের মতোই)
//   const encoded = parts[1].replace(/\//g, '~~');

//   // ২. ✅ ফিক্স: শেষে একটি ইউনিক টাইমস্ট্যাম্প যোগ করা
//   const cacheBuster = `?t=${new Date().getTime()}`;

//   // ৩. ফাইনাল প্রক্সি ইউআরএল রিটার্ন করা
//   return `${BASE}/documents/proxy/${encoded}${cacheBuster}`;
// }
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     if (config.data instanceof FormData) {
//       delete config.headers['Content-Type'];
//     } else if (!config.headers['Content-Type']) {
//       config.headers['Content-Type'] = 'application/json';
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (!error.response) {
//       console.error('Network Error: Check backend CORS or internet connection.');
//     }
//     if (error.response?.status === 401) {
//       if (window.location.pathname !== '/login') {
//         localStorage.removeItem('token');
//         window.location.href = '/login?expired=true';
//       }
//     }
//     return Promise.reject(error);
//   }
// );
// src/api/apiClient.js
import axios from 'axios';

// ════════════════════════════════════════════════════════════════
// CONFIG
// ════════════════════════════════════════════════════════════════
const BASE = (
  import.meta.env.VITE_API_BASE_URL ||
  'https://nextsignbackendfinal.vercel.app/api'
).replace(/\/$/, '');

const TIMEOUT_NORMAL  = 15000;  // 15s — normal requests
const TIMEOUT_UPLOAD  = 60000;  // 60s — file upload
const MAX_RETRIES     = 3;
const RETRY_DELAY_MS  = 1000;   // 1s base (exponential)
const CACHE_TTL_MS    = 30000;  // 30s cache

// ════════════════════════════════════════════════════════════════
// IN-MEMORY CACHE — re-render এ data হারায় না
// ════════════════════════════════════════════════════════════════
const requestCache   = new Map(); // { key: { data, timestamp } }
const inflightMap    = new Map(); // deduplication
const retryCountMap  = new Map(); // retry tracking

// ════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const getBackoffDelay = (attempt) =>
  RETRY_DELAY_MS * Math.pow(2, attempt) + Math.random() * 500;

const isUploadRequest = (config) =>
  config.data instanceof FormData ||
  config.url?.includes('upload') ||
  config.url?.includes('sign');

const isRetryable = (error) => {
  if (axios.isCancel(error)) return false;
  if (!error.response)       return true;  // network/timeout
  return [408, 429, 502, 503, 504].includes(error.response.status);
};

const getCacheKey = (config) => {
  const params = config.params
    ? JSON.stringify(config.params)
    : '';
  return `${config.method?.toUpperCase()}:${config.url}${params}`;
};

// ════════════════════════════════════════════════════════════════
// AXIOS INSTANCE
// ════════════════════════════════════════════════════════════════
export const api = axios.create({
  baseURL:         BASE,
  withCredentials: true,
  timeout:         TIMEOUT_NORMAL,
  headers: {
    'Accept':       'application/json',
    'Content-Type': 'application/json',
  },
});

// ════════════════════════════════════════════════════════════════
// REQUEST INTERCEPTOR
// ════════════════════════════════════════════════════════════════
api.interceptors.request.use(
  (config) => {
    // Auth token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // FormData — browser নিজেই Content-Type set করবে
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    // Upload timeout বাড়াও
    if (isUploadRequest(config)) {
      config.timeout = TIMEOUT_UPLOAD;
    }

    // GET requests এ cache check
    if (config.method === 'get' && !config.noCache) {
      const key    = getCacheKey(config);
      const cached = requestCache.get(key);
      const now    = Date.now();

      if (cached && now - cached.timestamp < CACHE_TTL_MS) {
        // Cancel request — cached data return করব
        config.__fromCache = cached.data;
        config.cancelToken = new axios.CancelToken((c) =>
          c('__CACHE_HIT__')
        );
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ════════════════════════════════════════════════════════════════
// RESPONSE INTERCEPTOR — retry + cache + error normalize
// ════════════════════════════════════════════════════════════════
api.interceptors.response.use(
  // ── Success ──────────────────────────────────────────────────
  (response) => {
    // Cache GET responses
    if (response.config.method === 'get') {
      const key = getCacheKey(response.config);
      requestCache.set(key, {
        data:      response.data,
        timestamp: Date.now(),
      });
    }
    // Reset retry count on success
    retryCountMap.delete(response.config.url);
    return response;
  },

  // ── Error ─────────────────────────────────────────────────────
  async (error) => {
    const config = error.config;

    // ── Cache hit (not a real error) ─────────────────────────
    if (
      axios.isCancel(error) &&
      error.message === '__CACHE_HIT__'
    ) {
      return Promise.resolve({
        data:        config.__fromCache,
        status:      200,
        __fromCache: true,
      });
    }

    // ── Real cancel ──────────────────────────────────────────
    if (axios.isCancel(error)) {
      return Promise.reject({ __cancelled: true });
    }

    // ── 401 — token expired ──────────────────────────────────
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?expired=true';
      }
      return Promise.reject(normalizeError(error));
    }

    // ── 403 — forbidden ───────────────────────────────────────
    if (error.response?.status === 403) {
      return Promise.reject(normalizeError(error));
    }

    // ── Retry logic ──────────────────────────────────────────
    if (config && isRetryable(error)) {
      const retryKey   = getCacheKey(config);
      const retryCount = retryCountMap.get(retryKey) || 0;

      if (retryCount < MAX_RETRIES) {
        retryCountMap.set(retryKey, retryCount + 1);

        const delay = getBackoffDelay(retryCount);
        console.warn(
          `🔁 Retry ${retryCount + 1}/${MAX_RETRIES}:`,
          config.url,
          `(${Math.round(delay)}ms delay)`
        );

        await sleep(delay);

        // Stale cache return করো while retrying
        const cached = requestCache.get(retryKey);
        if (cached && config.method === 'get') {
          // Background retry
          api(config).catch(() => {});
          return Promise.resolve({
            data:        cached.data,
            status:      200,
            __fromCache: true,
            __stale:     true,
          });
        }

        return api(config);
      }
    }

    // ── Final error normalize ────────────────────────────────
    retryCountMap.delete(config?.url);
    return Promise.reject(normalizeError(error));
  }
);

// ════════════════════════════════════════════════════════════════
// ERROR NORMALIZER — consistent error shape
// ════════════════════════════════════════════════════════════════
function normalizeError(error) {
  const isOffline = !navigator.onLine;

  if (!error.response) {
    return {
      __network:  true,
      __offline:  isOffline,
      __timeout:  error.code === 'ECONNABORTED',
      message: isOffline
        ? 'No internet connection.'
        : error.code === 'ECONNABORTED'
          ? 'Request timed out. Please try again.'
          : 'Cannot reach server. Please try again.',
      status:      0,
      retry:       true,
      originalError: error,
    };
  }

  const message =
    error.response.data?.message ||
    error.response.data?.error   ||
    `Error ${error.response.status}`;

  return {
    message,
    status:        error.response.status,
    data:          error.response.data,
    originalError: error,
  };
}

// ════════════════════════════════════════════════════════════════
// PROXY URL BUILDER
// ════════════════════════════════════════════════════════════════
export function buildProxyUrl(cloudinaryUrl) {
  if (!cloudinaryUrl) return '';

  // Blob/data URLs — সরাসরি ব্যবহার করো
  if (
    cloudinaryUrl.startsWith('blob:') ||
    cloudinaryUrl.startsWith('data:')
  ) return cloudinaryUrl;

  // Already a proxy URL
  if (cloudinaryUrl.includes('/documents/proxy/')) 
    return cloudinaryUrl;

  const parts = cloudinaryUrl.split('/upload/');
  if (parts.length < 2) return cloudinaryUrl;

  const encoded = parts[1]
    .split('?')[0]         // query string remove
    .replace(/\//g, '~~'); // slash encode

  return `${BASE}/documents/proxy/${encoded}`;
  // Note: cache-busting বাদ দিলাম — same URL = browser cache ব্যবহার করবে
}

// ════════════════════════════════════════════════════════════════
// CACHE UTILITIES — component থেকে ব্যবহার করা যাবে
// ════════════════════════════════════════════════════════════════
export const apiCache = {
  /** নির্দিষ্ট URL এর cache মুছো */
  invalidate: (url, params = {}) => {
    const key = `GET:${url}${JSON.stringify(params)}`;
    requestCache.delete(key);
  },

  /** সব cache মুছো */
  clear: () => {
    requestCache.clear();
    console.log('🗑️ API cache cleared');
  },

  /** Cache এ কী আছে দেখো (debug) */
  inspect: () => {
    const result = {};
    requestCache.forEach((v, k) => {
      result[k] = {
        age:  `${Math.round((Date.now() - v.timestamp) / 1000)}s`,
        size: JSON.stringify(v.data).length + ' bytes',
      };
    });
    return result;
  },

  /** Background এ prefetch করো */
  prefetch: (url, params = {}) => {
    api.get(url, { params, noCache: false }).catch(() => {});
  },
};

// ════════════════════════════════════════════════════════════════
// ONLINE/OFFLINE — reconnect হলে auto retry
// ════════════════════════════════════════════════════════════════
let pendingRequests = [];

window.addEventListener('offline', () => {
  console.warn('📵 Network offline');
});

window.addEventListener('online', () => {
  console.log('✅ Network restored — retrying pending requests');
  // Cache clear করো — fresh data আসবে
  apiCache.clear();
  // Pending requests retry
  const pending = [...pendingRequests];
  pendingRequests = [];
  pending.forEach(({ config, resolve, reject }) => {
    api(config).then(resolve).catch(reject);
  });
});

// ════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════
export default api;

/* 
  ── Usage Examples ────────────────────────────────────────────

  // Normal GET (auto-cached 30s):
  const res = await api.get('/documents', { params: { page: 1 } });

  // Skip cache:
  const res = await api.get('/documents', { noCache: true });

  // Invalidate after mutation:
  apiCache.invalidate('/documents');
  await api.post('/documents', data);

  // Check cache (debug):
  console.log(apiCache.inspect());

  // Proxy URL:
  const url = buildProxyUrl(cloudinaryUrl);
*/