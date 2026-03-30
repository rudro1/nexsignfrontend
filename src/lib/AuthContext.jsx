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
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onIdTokenChanged,
} from 'firebase/auth';
import { toast } from 'sonner';
import { api, apiCache } from '@/api/apiClient';

// ════════════════════════════════════════════════════════════════
// CONTEXT
// ════════════════════════════════════════════════════════════════
const AuthContext = createContext(null);

// ════════════════════════════════════════════════════════════════
// FIREBASE ERROR MESSAGES
// ════════════════════════════════════════════════════════════════
const getFirebaseError = (code) => {
  const errors = {
    'auth/user-not-found':         'No account found with this email.',
    'auth/wrong-password':         'Incorrect password. Please try again.',
    'auth/email-already-in-use':   'This email is already registered.',
    'auth/weak-password':          'Password must be at least 6 characters.',
    'auth/invalid-email':          'Please enter a valid email address.',
    'auth/too-many-requests':      'Too many attempts. Please try again later.',
    'auth/user-disabled':          'This account has been disabled.',
    'auth/popup-closed-by-user':   'Login popup was closed. Please try again.',
    'auth/popup-blocked':          'Popup blocked. Please allow popups.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'auth/invalid-credential':     'Invalid email or password.',
    'auth/operation-not-allowed':  'This sign-in method is not enabled.',
    'auth/expired-action-code':    'This link has expired. Request a new one.',
    'auth/invalid-action-code':    'Invalid link. Request a new one.',
  };
  return errors[code] || 'Something went wrong. Please try again.';
};

// ════════════════════════════════════════════════════════════════
// STORAGE HELPERS
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
      localStorage.setItem(
        key,
        typeof value === 'string' ? value : JSON.stringify(value),
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
// ROLE REDIRECT HELPER
// ════════════════════════════════════════════════════════════════
const getRoleRedirect = (role) =>
  role === 'admin' || role === 'super_admin'
    ? '/admin'
    : '/dashboard';

// ════════════════════════════════════════════════════════════════
// AUTH PROVIDER
// ════════════════════════════════════════════════════════════════
export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(null);
  const [loading, setLoading] = useState(true);

  const firebaseUserRef = useRef(null);
  const tokenRefreshRef = useRef(null);

  // ── Core: save auth ──────────────────────────────────────
  const saveAuth = useCallback((userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    storage.set('nexsign_user', userData);
    localStorage.setItem('token', userToken);
    api.defaults.headers.common['Authorization'] =
      `Bearer ${userToken}`;
  }, []);

  // ── Core: clear auth ─────────────────────────────────────
  const clearAuth = useCallback(() => {
    setUser(null);
    setToken(null);
    storage.remove('nexsign_user', 'token');
    delete api.defaults.headers.common['Authorization'];
    apiCache.clear();
  }, []);

  // ── Load saved auth on mount ─────────────────────────────
  useEffect(() => {
    const savedUser  = storage.get('nexsign_user');
    const savedToken = localStorage.getItem('token');

    if (savedUser && savedToken) {
      setUser(savedUser);
      setToken(savedToken);
      api.defaults.headers.common['Authorization'] =
        `Bearer ${savedToken}`;
      setLoading(false);
    }
  }, []);

  // ── Handle Google Redirect Result ────────────────────────
  // signInWithRedirect এর পর page reload হলে এখানে result আসে
  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);

        if (!result?.user) return; // No redirect result

        const firebaseUser = result.user;
        const name  = firebaseUser.displayName
                      || firebaseUser.email?.split('@')[0]
                      || 'User';
        const email = firebaseUser.email;

        if (!email) return;

        // Backend call
        const res = await api.post('/auth/google', {
          name,
          email,
          photoURL: firebaseUser.photoURL || '',
        });

        if (res.data?.token) {
          saveAuth(res.data.user, res.data.token);
          toast.success('Google login successful! 🎉');
          // Redirect
          window.location.href =
            getRoleRedirect(res.data.user?.role);
        }
      } catch (err) {
        // No redirect result — normal, ignore
        if (err?.code !== 'auth/no-current-user') {
          console.warn('Redirect result:', err?.message);
        }
      }
    };

    handleRedirect();
  }, [saveAuth]);

  // ── Firebase Auth State Listener ─────────────────────────
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(
      auth,
      async (firebaseUser) => {
        firebaseUserRef.current = firebaseUser;

        if (!firebaseUser) {
          setLoading(false);
          return;
        }

        try {
          await firebaseUser.getIdToken(false);
        } catch (err) {
          console.warn('Token refresh error:', err.message);
        }

        setLoading(false);
      },
    );

    return () => {
      unsubscribe();
      if (tokenRefreshRef.current) {
        clearTimeout(tokenRefreshRef.current);
      }
    };
  }, []);

  // ── Token expiry ─────────────────────────────────────────
  const isTokenExpired = useCallback((jwtToken) => {
    if (!jwtToken) return true;
    try {
      const payload = JSON.parse(atob(jwtToken.split('.')[1]));
      return payload.exp * 1000 < Date.now() + 30_000;
    } catch {
      return true;
    }
  }, []);

  // ════════════════════════════════════════════════════════
  // LOGIN
  // ════════════════════════════════════════════════════════
  const login = useCallback((userData, userToken) => {
    saveAuth(userData, userToken);
  }, [saveAuth]);

  // ════════════════════════════════════════════════════════
  // LOGOUT
  // ════════════════════════════════════════════════════════
  const logout = useCallback(async (options = {}) => {
    const { redirect = true, showToast = false } = options;

    try {
      if (auth.currentUser) {
        await signOut(auth);
      }
    } catch (err) {
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

  // ════════════════════════════════════════════════════════
  // GOOGLE LOGIN — Popup with Redirect fallback
  // ════════════════════════════════════════════════════════
  const googleLogin = useCallback(async () => {
    try {
      // ✅ Try popup first
      const result = await signInWithPopup(auth, googleProvider);
      return result;

    } catch (error) {
      const code = error.code || '';
      const msg  = error.message || '';

      // ✅ Silent exit — user closed popup intentionally
      if (code === 'auth/popup-closed-by-user') {
        return null;
      }

      // ✅ COOP / popup blocked → use redirect
      if (
        code === 'auth/popup-blocked'         ||
        msg.includes('Cross-Origin-Opener-Policy') ||
        msg.includes('window.closed')
      ) {
        try {
          toast.info('Redirecting to Google sign-in...');
          await signInWithRedirect(auth, googleProvider);
          // Page will reload — result handled in useEffect above
          return null;
        } catch (redirectErr) {
          toast.error('Google login failed. Please try again.');
          throw redirectErr;
        }
      }

      // Other errors
      const message = getFirebaseError(code);
      toast.error(message);
      throw new Error(message);
    }
  }, []);

  // ════════════════════════════════════════════════════════
  // EMAIL REGISTER
  // ════════════════════════════════════════════════════════
  const registerWithEmail = useCallback(async (email, password) => {
    try {
      const result = await createUserWithEmailAndPassword(
        auth, email, password,
      );
      await sendEmailVerification(result.user, {
        url: `${window.location.origin}/login?verified=true`,
      });
      return result;
    } catch (error) {
      const message = getFirebaseError(error.code);
      throw new Error(message);
    }
  }, []);

  // ════════════════════════════════════════════════════════
  // EMAIL LOGIN
  // ════════════════════════════════════════════════════════
  const loginWithEmail = useCallback(async (email, password) => {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw new Error(getFirebaseError(error.code));
    }
  }, []);

  // ════════════════════════════════════════════════════════
  // EMAIL VERIFICATION
  // ════════════════════════════════════════════════════════
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
        toast.error('Too many requests. Wait a moment.');
      } else {
        toast.error('Failed to send email. Try again.');
      }
      throw error;
    }
  }, []);

  // ════════════════════════════════════════════════════════
  // RESET PASSWORD
  // ════════════════════════════════════════════════════════
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

  // ════════════════════════════════════════════════════════
  // UPDATE USER
  // ════════════════════════════════════════════════════════
  const updateUser = useCallback((updates) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      storage.set('nexsign_user', updated);
      return updated;
    });
    if (updates.token) {
      localStorage.setItem('token', updates.token);
      setToken(updates.token);
      api.defaults.headers.common['Authorization'] =
        `Bearer ${updates.token}`;
    }
  }, []);

  // ════════════════════════════════════════════════════════
  // CHECK AUTH
  // ════════════════════════════════════════════════════════
  const checkAuth = useCallback(() => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken || isTokenExpired(savedToken)) {
      clearAuth();
      return false;
    }
    const savedUser = storage.get('nexsign_user');
    if (savedUser && !user) {
      setUser(savedUser);
      setToken(savedToken);
    }
    return true;
  }, [isTokenExpired, clearAuth, user]);

  // ════════════════════════════════════════════════════════
  // COMPUTED
  // ════════════════════════════════════════════════════════
  const isAdmin       = user?.role === 'admin' ||
                        user?.role === 'super_admin';
  const isSuperAdmin  = user?.role === 'super_admin';
  const isAuthenticated = !!user && !!token;

  const value = {
    user, token, loading,
    login, logout,
    googleLogin,
    loginWithEmail,
    registerWithEmail,
    checkEmailVerified,
    resendVerificationEmail,
    resetPassword,
    updateUser,
    checkAuth,
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
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
};

export const useUser = () => {
  const { user, loading } = useAuth();
  return { user, loading };
};

export const useIsAdmin = () => {
  const { isAdmin, isSuperAdmin } = useAuth();
  return { isAdmin, isSuperAdmin };
};

export default AuthContext;