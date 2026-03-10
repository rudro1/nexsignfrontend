// import axios from 'axios';

// export const api = axios.create({
//   baseURL: 'http://localhost:5001/api',
//   withCredentials: true,
//   headers: { 'Content-Type': 'application/json' }
// });

// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) config.headers['Authorization'] = `Bearer ${token}`;
//   return config;
// });

// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     // লগিং এবং অথরাইজেশন এরর এক জায়গায় হ্যান্ডেল করা
//     if (error.response) {
//       console.error('API Error:', error.response.status, error.response.data);
//       if (error.response.status === 401) {
//         localStorage.removeItem('token');
//         localStorage.removeItem('user');
//         window.location.href = '/login';
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// import axios from 'axios';

// // ১. বেস কনফিগারেশন
// export const api = axios.create({
//   // Vite এর জন্য import.meta.env এবং Create React App এর জন্য process.env ব্যবহার করুন
//   baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
//   withCredentials: true,
//   // headers থেকে Content-Type সরিয়ে দেওয়া ভালো, Axios নিজেই এটি হ্যান্ডেল করে
// });

// // ২. রিকোয়েস্ট ইন্টারসেপ্টর (Authorization)
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers['Authorization'] = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // ৩. রেসপন্স ইন্টারসেপ্টর (Error Handling)
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response) {
//       const { status } = error.response;

//       // টোকেন এক্সপায়ার হলে বা আনঅথরাইজড হলে
//       if (status === 401) {
//         // লুপ এড়াতে চেক করুন আপনি ইতিমধ্যে লগইন পেজে আছেন কি না
//         if (!window.location.pathname.includes('/login')) {
//           localStorage.removeItem('token');
//           localStorage.removeItem('user');
//           window.location.href = '/login';
//         }
//       }
      
//       // নেটওয়ার্ক বা সার্ভার এরর লগিং
//       console.error(`[API Error ${status}]:`, error.response.data?.message || 'Something went wrong');
//     } else if (error.request) {
//       console.error('[Network Error]: No response received from server');
//     }
    
//     return Promise.reject(error);
//   }
// );
import axios from 'axios';

// ১. বেস কনফিগারেশন
export const api = axios.create({
  // ✅ পোর্ট ৫০০১ পরিবর্তন করে ৫০০০ করা হয়েছে আপনার index.js এর সাথে মিলানোর জন্য
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api',
  withCredentials: true,
  timeout: 100000, 
});

// ২. রিকোয়েস্ট ইন্টারসেপ্টর
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ৩. রেসপন্স ইন্টারসেপ্টর
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    if (error.response) {
      const { status } = error.response;

      if (status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        if (!window.location.pathname.includes('/login')) {
          localStorage.clear();
          window.location.href = '/login?expired=true';
        }
      }
      
      console.error(`[API Error ${status}]:`, error.response.data?.message || 'Server Error');
    } else if (error.request) {
      // ✅ এটি সেই নেটওয়ার্ক/CORS এরর যা আপনি ফেস করছেন
      console.error('[Network Error]: সার্ভারের সাথে কানেক্ট করা যাচ্ছে না। পোর্ট চেক করুন।');
    }
    
    return Promise.reject(error);
  }
);