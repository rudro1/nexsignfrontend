
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


import axios from 'axios';

// ✅ BASE URL — trailing slash remove
const BASE = (
  import.meta.env.VITE_API_BASE_URL || 
  'https://nextsignbackendfinal.vercel.app/api'
).replace(/\/$/, '');

export const api = axios.create({
  baseURL: BASE,
  withCredentials: true,
  timeout: 60000,
});

// ✅ Cloudinary Proxy URL Builder with Cache Buster
export function buildProxyUrl(cloudinaryUrl) {
  if (!cloudinaryUrl) return '';
  
  // blob বা base64 হলে সরাসরি return
  if (
    cloudinaryUrl.startsWith('blob:') || 
    cloudinaryUrl.startsWith('data:')
  ) {
    return cloudinaryUrl;
  }

  // Cloudinary URL না হলে সরাসরি return
  const parts = cloudinaryUrl.split('/upload/');
  if (parts.length < 2) return cloudinaryUrl;

  // "/" কে "~~" দিয়ে encode করো
  const encoded = parts[1].replace(/\//g, '~~');

  // Cache buster যোগ করো
  const cacheBuster = `?t=${Date.now()}`;

  return `${BASE}/documents/proxy/${encoded}${cacheBuster}`;
}

// ✅ Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // FormData হলে Content-Type delete করো
    // Browser নিজেই multipart/form-data set করবে
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network error (CORS, internet, server down)
    if (!error.response) {
      console.error(
        '❌ Network Error: Check backend CORS or internet connection.'
      );
      return Promise.reject(error);
    }

    // 401 — Token expired বা invalid
    if (error.response.status === 401) {
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('token');
        window.location.href = '/login?expired=true';
      }
    }

    // 403 — CORS blocked বা unauthorized
    if (error.response.status === 403) {
      console.error('❌ Access Denied (403)');
    }

    // 500 — Server error
    if (error.response.status === 500) {
      console.error('❌ Server Error (500):', error.response.data);
    }

    return Promise.reject(error);
  }
);

export default api;