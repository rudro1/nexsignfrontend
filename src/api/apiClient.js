// // import axios from 'axios';

// // export const api = axios.create({
// //   baseURL: 'http://localhost:5001/api',
// //   withCredentials: true,
// //   headers: { 'Content-Type': 'application/json' }
// // });

// // api.interceptors.request.use((config) => {
// //   const token = localStorage.getItem('token');
// //   if (token) config.headers['Authorization'] = `Bearer ${token}`;
// //   return config;
// // });

// // api.interceptors.response.use(
// //   (response) => response,
// //   (error) => {
// //     // লগিং এবং অথরাইজেশন এরর এক জায়গায় হ্যান্ডেল করা
// //     if (error.response) {
// //       console.error('API Error:', error.response.status, error.response.data);
// //       if (error.response.status === 401) {
// //         localStorage.removeItem('token');
// //         localStorage.removeItem('user');
// //         window.location.href = '/login';
// //       }
// //     }
// //     return Promise.reject(error);
// //   }
// // );

// // import axios from 'axios';

// // // ১. বেস কনফিগারেশন
// // export const api = axios.create({
// //   // Vite এর জন্য import.meta.env এবং Create React App এর জন্য process.env ব্যবহার করুন
// //   baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
// //   withCredentials: true,
// //   // headers থেকে Content-Type সরিয়ে দেওয়া ভালো, Axios নিজেই এটি হ্যান্ডেল করে
// // });

// // // ২. রিকোয়েস্ট ইন্টারসেপ্টর (Authorization)
// // api.interceptors.request.use(
// //   (config) => {
// //     const token = localStorage.getItem('token');
// //     if (token) {
// //       config.headers['Authorization'] = `Bearer ${token}`;
// //     }
// //     return config;
// //   },
// //   (error) => Promise.reject(error)
// // );

// // // ৩. রেসপন্স ইন্টারসেপ্টর (Error Handling)
// // api.interceptors.response.use(
// //   (response) => response,
// //   (error) => {
// //     if (error.response) {
// //       const { status } = error.response;

// //       // টোকেন এক্সপায়ার হলে বা আনঅথরাইজড হলে
// //       if (status === 401) {
// //         // লুপ এড়াতে চেক করুন আপনি ইতিমধ্যে লগইন পেজে আছেন কি না
// //         if (!window.location.pathname.includes('/login')) {
// //           localStorage.removeItem('token');
// //           localStorage.removeItem('user');
// //           window.location.href = '/login';
// //         }
// //       }
      
// //       // নেটওয়ার্ক বা সার্ভার এরর লগিং
// //       console.error(`[API Error ${status}]:`, error.response.data?.message || 'Something went wrong');
// //     } else if (error.request) {
// //       console.error('[Network Error]: No response received from server');
// //     }
    
// //     return Promise.reject(error);
// //   }
// // );
// import axios from 'axios';

// // ১. বেস কনফিগারেশন
// export const api = axios.create({
//   // নিশ্চিত করুন VITE_API_BASE_URL এর শেষে যেন '/' না থাকে
//   baseURL: import.meta.env.VITE_API_BASE_URL || 'https://nextsignbackendfinal.vercel.app/api',
  
//   // ✅ ব্যাকএন্ডের সাথে মিল রেখে এটি true করে দিন
//   // এটি কুকি বা অথোরাইজেশন হেডার সঠিকভাবে হ্যান্ডেল করতে সাহায্য করবে
//   withCredentials: true, 
  
//   timeout: 60000, // ১ মিনিট টাইমআউট (ভার্সেল ফ্রি টায়ারের জন্য যথেষ্ট)
// });

// // ২. রিকোয়েস্ট ইন্টারসেপ্টর
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       // টোকেন হেডার সেট করা
//       config.headers.Authorization = `Bearer ${token}`;
//     }
    
//     // কনটেন্ট টাইপ নিশ্চিত করা
//     config.headers['Content-Type'] = 'application/json';
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // ৩. রেসপন্স ইন্টারসেপ্টর
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     // নেটওয়ার্ক এরর বা টাইমআউট হ্যান্ডেল করা
//     if (!error.response) {
//       console.error('[Network Error]: Check your internet or API Server status.');
//       return Promise.reject(new Error('Server is unreachable. Please try again later.'));
//     }

//     const { status } = error.response;

//     // টোকেন এক্সপায়ার হলে লগআউট করানো
//     if (status === 401) {
//       const isLoginPage = window.location.pathname.includes('/login');
//       if (!isLoginPage) {
//         localStorage.removeItem('token');
//         localStorage.removeItem('user'); // ইউজার ডাটাও রিমুভ করুন
//         window.location.href = '/login?expired=true';
//       }
//     }
    
//     return Promise.reject(error);
//   }
// );

// import axios from 'axios';

// export const api = axios.create({
//   baseURL: import.meta.env.VITE_API_BASE_URL || 'https://nextsignbackendfinal.vercel.app/api',
//   withCredentials: true, 
//   timeout: 60000, 
// });

// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
    
//     // ১. টোকেন থাকলে সেটি হেডার-এ সেট করা
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
    
//     // ২. Content-Type হ্যান্ডলিং (CORS ফ্রেন্ডলি)
//     if (config.data instanceof FormData) {
//       // FormData হলে হেডার ডিলিট করা জরুরি যাতে ব্রাউজার সঠিক boundary সেট করতে পারে
//       delete config.headers['Content-Type'];
//     } else if (!config.headers['Content-Type']) {
//       // শুধু ডাটা থাকলে ডিফল্ট JSON সেট করা
//       config.headers['Content-Type'] = 'application/json';
//     }

//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     // ৩. নেটওয়ার্ক এরর বা টাইমআউট হ্যান্ডলিং
//     if (!error.response) {
//       console.error("Network Error: Please check your backend CORS settings or Internet.");
//     }

//     // ৪. অথেন্টিকেশন এরর (Expired Token)
//     if (error.response?.status === 401) {
//       const isLoginPage = window.location.pathname === '/login';
//       if (!isLoginPage) {
//         localStorage.removeItem('token');
//         // ইউজার যেন বারবার রিডাইরেক্ট না হয় তাই চেক করা
//         window.location.href = '/login?expired=true';
//       }
//     }
//     return Promise.reject(error);
//   }
// );
import axios from 'axios';

// ✅ FIX: strip trailing slash to prevent double-slash bugs
const BASE = (import.meta.env.VITE_API_BASE_URL || 'https://nextsignbackendfinal.vercel.app/api').replace(/\/$/, '');

export const api = axios.create({
  baseURL: BASE,
  withCredentials: true,
  timeout: 60000,
});

/**
 * ✅ CORE FIX — Cloudinary Proxy URL Builder
 *
 * BUG BEFORE: replace(/\//g, '_') destroyed version numbers like "v1774334567"
 * because backend's replace(/_/g, '/') turned ALL underscores back to slashes,
 * making "v1774334567" → "v1774334567" (fine) but "nexsign_docs" → "nexsign/docs" ✓
 * — ACTUALLY the real problem: Vercel strips the path after the last dot
 * if there is a .pdf extension in the middle of a URL segment.
 *
 * FIX: encode "/" as "~~" (double tilde) — safe in URL paths, never appears
 * in Cloudinary public IDs, and easy to decode on the backend.
 *
 * ⚠️  You must also update your backend proxy route decoder:
 *     const cloudPath = req.params.path.replace(/~~/g, '/');
 */
export function buildProxyUrl(cloudinaryUrl) {
  if (!cloudinaryUrl) return '';
  if (cloudinaryUrl.startsWith('blob:') || cloudinaryUrl.startsWith('data:')) {
    return cloudinaryUrl;
  }
  const parts = cloudinaryUrl.split('/upload/');
  if (parts.length < 2) return cloudinaryUrl;
  // Encode slashes as ~~ so express wildcard captures the full path safely
  const encoded = parts[1].replace(/\//g, '~~');
  return `${BASE}/documents/proxy/${encoded}`;
}

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error('Network Error: Check backend CORS or internet connection.');
    }
    if (error.response?.status === 401) {
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('token');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);