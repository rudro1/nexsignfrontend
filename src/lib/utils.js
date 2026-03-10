// import { clsx } from "clsx"
// import { twMerge } from "tailwind-merge"

// export function cn(...inputs) {
//   return twMerge(clsx(inputs))
// } 


// export const isIframe = window.self !== window.top;

import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// ✅ Iframe Check
export const isIframe = window.self !== window.top;

// ✅ Local Storage Helper
export const localStorage = {
  get: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error('localStorage set error:', e);
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('localStorage remove error:', e);
    }
  },
  clear: () => {
    try {
      localStorage.clear();
    } catch (e) {
      console.error('localStorage clear error:', e);
    }
  }
};

// ✅ Date Format Helper
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

// ✅ API Helper
export const api = {
  get: async (url, headers = {}) => {
    const token = localStorage.get('token');
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...headers
      }
    });
    return response.json();
  },
  post: async (url, data, headers = {}) => {
    const token = localStorage.get('token');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...headers
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },
  put: async (url, data, headers = {}) => {
    const token = localStorage.get('token');
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...headers
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },
  delete: async (url, headers = {}) => {
    const token = localStorage.get('token');
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...headers
      }
    });
    return response.json();
  }
};
