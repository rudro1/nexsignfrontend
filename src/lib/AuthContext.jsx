// src/lib/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import {
  auth,
  googleProvider,
} from '../firebase.config.js';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  onIdTokenChanged,
} from 'firebase/auth';
import { toast } from 'sonner';
import { api, apiCache } from '@/api/apiClient';

// ════════════════════════════════════════════════════════════════
// CONTEXT
// ════════════════════════════════════════════════════════════════
const AuthContext = createContext(null);

// ════════════════════════════════════════════════════════════════
// FIREBASE ERROR → Human readable message
// ════════════════════════════════════════════════════════════════
const getFirebaseError = (code) => {
  const errors = {
    'auth/user-not-found':       'No account found with this email.',
    'auth/wrong-password':       'Incorrect password. Please try again.',
    'auth/email-already-in-use': 'This email is already registered.',
    'auth/weak-password':        'Password must be at least 6 characters.',
    'auth/invalid-email':        'Please enter a valid email address.',
    'auth/too-many-requests':    'Too many attempts. Please try again later.',
    'auth/user-disabled':        'This account has been disabled.',
    'auth/popup-closed-by-user': 'Login popup was closed. Please try again.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'auth/invalid-credential':   'Invalid email or password.',
    'auth/operation-not-allowed':'This sign-in method is not enabled.',
    'auth/expired-action-code':  'This link has expired. Please request a new one.',
    'auth/invalid-action-code':  'Invalid link. Please request a new one.',
  };
  return errors[code] || 'Something went wrong. Please try again.';
};

// ════════════════════════════════════════════════════════════════
// STORAGE HELPERS — safe JSON parse
// ════════════════════════════════════════════════════════════════
const storage = {
  get: (key, fallback = null) => {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : fallback;
    } catch {
      return fallback;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, 
        typeof value === 'string' 
          ? value 
          : JSON.stringify(value)
      );
    } catch (e) {
      console.warn('Storage write failed:', e.message);
    }
  },
  remove: (...keys) => {
    keys.forEach(k => {
      try { localStorage.removeItem(k); } catch {}
    });
  },
};

// ════════════════════════════════════════════════════════════════
// AUTH PROVIDER
// ════════════════════════════════════════════════════════════════
export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(null);
  const [loading, setLoading] = useState(true);

  // Firebase user ref — Firebase state সবসময় track করার জন্য
  const firebaseUserRef = useRef(null);
  // Token refresh timer
  const tokenRefreshRef = useRef(null);

  // ── Load saved auth on mount ───────────────────────────────
  useEffect(() => {
    const savedUser  = storage.get('nexsign_user');
    const savedToken = localStorage.getItem('token');

    if (savedUser && savedToken) {
      setUser(savedUser);
      setToken(savedToken);
      // api interceptor কে token দাও
      api.defaults.headers.common['Authorization'] =
        `Bearer ${savedToken}`;
    }
  }, []);

  // ── Firebase Auth State Listener ──────────────────────────
  // Token expire / logout সব এখানে catch হবে
  useEffect(() => {
    // onIdTokenChanged — token refresh হলেও trigger হয়
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      firebaseUserRef.current = firebaseUser;

      if (!firebaseUser) {
        // Firebase logout হয়ে গেছে
        // কিন্তু আমাদের backend token এ logged in থাকলে চলবে
        setLoading(false);
        return;
      }

      try {
        // Firebase token refresh (auto)
        const freshToken = await firebaseUser.getIdToken(false);

        // Token পরিবর্তন হলে update করো
        const currentToken = localStorage.getItem('token');
        if (freshToken && freshToken !== currentToken) {
          // এটা শুধু Firebase token —
          // আমাদের backend JWT আলাদা
          // তাই শুধু Firebase user info update করো
        }
      } catch (err) {
        console.warn('Token refresh error:', err.message);
      }

      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (tokenRefreshRef.current) {
        clearTimeout(tokenRefreshRef.current);
      }
    };
  }, []);

  // ── Token expiry check ────────────────────────────────────
  // JWT decode করে expiry চেক করো
  const isTokenExpired = useCallback((jwtToken) => {
    if (!jwtToken) return true;
    try {
      const payload = JSON.parse(
        atob(jwtToken.split('.')[1])
      );
      // 30s buffer দাও
      return payload.exp * 1000 < Date.now() + 30_000;
    } catch {
      return true;
    }
  }, []);

  // ── Core: save auth state ─────────────────────────────────
  const saveAuth = useCallback((userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    storage.set('nexsign_user', userData);
    localStorage.setItem('token', userToken);
    // axios default header
    api.defaults.headers.common['Authorization'] =
      `Bearer ${userToken}`;
  }, []);

  // ── Clear auth state ──────────────────────────────────────
  const clearAuth = useCallback(() => {
    setUser(null);
    setToken(null);
    storage.remove('nexsign_user', 'token');
    delete api.defaults.headers.common['Authorization'];
    apiCache.clear(); // Cache clear — stale data দেখাবে না
  }, []);

  // ════════════════════════════════════════════════════════════
  // LOGIN — Backend JWT
  // ════════════════════════════════════════════════════════════
  const login = useCallback((userData, userToken) => {
    saveAuth(userData, userToken);
  }, [saveAuth]);

  // ════════════════════════════════════════════════════════════
  // LOGOUT
  // ════════════════════════════════════════════════════════════
  const logout = useCallback(async (options = {}) => {
    const { redirect = true, showToast = false } = options;

    try {
      // Firebase sign out (if Firebase user exists)
      if (auth.currentUser) {
        await signOut(auth);
      }
    } catch (err) {
      // Firebase logout fail হলেও app logout করো
      console.warn('Firebase logout warning:', err.message);
    } finally {
      clearAuth();

      if (showToast) {
        toast.success('Logged out successfully!');
      }

      if (redirect && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
  }, [clearAuth]);

  // ════════════════════════════════════════════════════════════
  // GOOGLE LOGIN
  // ════════════════════════════════════════════════════════════
  const googleLogin = useCallback(async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result;
    } catch (error) {
      const message = getFirebaseError(error.code);

      // Popup closed — silent fail (user intentionally closed)
      if (error.code === 'auth/popup-closed-by-user') {
        return null;
      }

      toast.error(message);
      throw new Error(message);
    }
  }, []);

  // ════════════════════════════════════════════════════════════
  // EMAIL REGISTER
  // ════════════════════════════════════════════════════════════
  const registerWithEmail = useCallback(async (email, password) => {
    try {
      const result = await createUserWithEmailAndPassword(
        auth, email, password
      );

      // Verification email পাঠাও
      await sendEmailVerification(result.user, {
        // Verification এর পর redirect করো
        url: `${window.location.origin}/login?verified=true`,
      });

      return result;
    } catch (error) {
      const message = getFirebaseError(error.code);
      throw new Error(message);
    }
  }, []);

  // ════════════════════════════════════════════════════════════
  // EMAIL LOGIN
  // ════════════════════════════════════════════════════════════
  const loginWithEmail = useCallback(async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(
        auth, email, password
      );
      return result;
    } catch (error) {
      const message = getFirebaseError(error.code);
      throw new Error(message);
    }
  }, []);

  // ════════════════════════════════════════════════════════════
  // EMAIL VERIFICATION CHECK
  // ════════════════════════════════════════════════════════════
  const checkEmailVerified = useCallback(async (firebaseUser) => {
    const fbUser = firebaseUser || auth.currentUser;
    if (!fbUser) return false;

    try {
      await fbUser.reload();
      return fbUser.emailVerified;
    } catch (err) {
      console.warn('Email verify check error:', err.message);
      return false;
    }
  }, []);

  // ════════════════════════════════════════════════════════════
  // RESEND VERIFICATION EMAIL
  // ════════════════════════════════════════════════════════════
  const resendVerificationEmail = useCallback(async () => {
    const fbUser = auth.currentUser;
    if (!fbUser) {
      toast.error('No user found. Please register again.');
      return;
    }

    try {
      await sendEmailVerification(fbUser, {
        url: `${window.location.origin}/login?verified=true`,
      });
      toast.success('Verification email sent! Check your inbox.');
    } catch (error) {
      if (error.code === 'auth/too-many-requests') {
        toast.error('Too many requests. Wait a moment and try again.');
      } else {
        toast.error('Failed to send email. Please try again.');
      }
      throw error;
    }
  }, []);

  // ════════════════════════════════════════════════════════════
  // RESET PASSWORD
  // ════════════════════════════════════════════════════════════
  const resetPassword = useCallback(async (email) => {
    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/login?reset=true`,
      });
      toast.success('Reset email sent! Check your inbox.');
    } catch (error) {
      const message = getFirebaseError(error.code);
      toast.error(message);
      throw new Error(message);
    }
  }, []);

  // ════════════════════════════════════════════════════════════
  // UPDATE USER — local state update (after profile edit)
  // ════════════════════════════════════════════════════════════
  const updateUser = useCallback((updates) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      storage.set('nexsign_user', updated);
      return updated;
    });
  }, []);

  // ════════════════════════════════════════════════════════════
  // TOKEN VALID CHECK — component থেকে call করা যাবে
  // ════════════════════════════════════════════════════════════
  const checkAuth = useCallback(() => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken || isTokenExpired(savedToken)) {
      clearAuth();
      return false;
    }
    return true;
  }, [isTokenExpired, clearAuth]);

  // ════════════════════════════════════════════════════════════
  // COMPUTED VALUES
  // ════════════════════════════════════════════════════════════
  const isAdmin       = user?.role === 'admin' || 
                        user?.role === 'super_admin';
  const isSuperAdmin  = user?.role === 'super_admin';
  const isAuthenticated = !!user && !!token;

  // ════════════════════════════════════════════════════════════
  // CONTEXT VALUE — memoize করা হয়নি কারণ
  // user/token change হলে সব re-render দরকার
  // ════════════════════════════════════════════════════════════
  const value = {
    // State
    user,
    token,
    loading,

    // Auth methods
    login,
    logout,
    googleLogin,
    loginWithEmail,
    registerWithEmail,
    checkEmailVerified,
    resendVerificationEmail,
    resetPassword,
    updateUser,
    checkAuth,

    // Computed
    isAdmin,
    isSuperAdmin,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ════════════════════════════════════════════════════════════════
// HOOKS
// ════════════════════════════════════════════════════════════════

/** Main auth hook */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
};

/** শুধু user দরকার হলে */
export const useUser = () => {
  const { user, loading } = useAuth();
  return { user, loading };
};

/** শুধু admin check দরকার হলে */
export const useIsAdmin = () => {
  const { isAdmin, isSuperAdmin } = useAuth();
  return { isAdmin, isSuperAdmin };
};

export default AuthContext;
