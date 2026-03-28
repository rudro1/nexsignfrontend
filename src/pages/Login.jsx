

// import React, { useEffect, useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { api } from '@/api/apiClient';
// import { useAuth } from '@/lib/AuthContext'; 
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { toast } from 'sonner';
// import { LogIn, Loader2, Eye, EyeOff } from 'lucide-react';
// import { FcGoogle } from "react-icons/fc";

// export default function Login({ toggle }) {
//   const navigate = useNavigate();
//   const { login, googleLogin, user, resetPassword} = useAuth(); 
//   const [formData, setFormData] = useState({ email: '', password: '' });
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);

//     //  Redirect immediately if user already logged in
//   useEffect(() => {
//     if (user) {
//       navigate('/dashboard', { replace: true });
//     }
//   }, [user, navigate]);


//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   // const handleSubmit = async (e) => {
//   //   e.preventDefault();
//   //   setLoading(true);
//   //   try {
//   //     const payload = { email: formData.email.toLowerCase().trim(), password: formData.password };
//   //     const res = await api.post('/auth/login', payload);
//   //     if (res.data.token) {
//   //       login(res.data.user, res.data.token); 
//   //       toast.success('Successfully loging!');
//   //       const userRole = res.data.user.role;
//   //       navigate(userRole === 'super_admin' || userRole === 'admin' ? '/admin' : '/dashboard');
//   //     }
//   //   } catch (err) {
//   //     toast.error(err.response?.data?.message || 'লগইন করতে সমস্যা হয়েছে।');
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };



// // Login.jsx এর handleSubmit ফাংশনটি এটি দিয়ে রিপ্লেস করুন

// const handleSubmit = async (e) => {
//   e.preventDefault();
//   setLoading(true);

//   const email = formData.email.toLowerCase().trim();
//   const password = formData.password;

//   try {
//     // ১. সাধারণ লগইন চেষ্টা
//     const res = await api.post('/auth/login', { email, password });
//     if (res.data.token) {
//       login(res.data.user, res.data.token);
//       toast.success('Successfully logged in!');
//       navigate(res.data.user.role === 'admin' || res.data.user.role === 'super_admin' ? '/admin' : '/dashboard');
//     }
//   } catch (err) {
//     // ২. যদি 401 আসে (পাসওয়ার্ড ভুল বা রিসেট করা হয়েছে)
//     if (err.response?.status === 401) {
//       try {
//         const { signInWithEmailAndPassword } = await import("firebase/auth");
//         const { auth } = await import("../firebase.config.js");
        
//         // Firebase এ চেক করুন
//         const firebaseResult = await signInWithEmailAndPassword(auth, email, password);
        
//         if (firebaseResult.user) {
//           // ৩. Firebase ঠিক থাকলে DB সিঙ্ক করুন
//           const syncRes = await api.post('/auth/sync-password', { email, password });
//           if (syncRes.data.token) {
//             login(syncRes.data.user, syncRes.data.token);
//             toast.success("Password Updated & Logged In!");
//             navigate(syncRes.data.user.role === 'admin' ? '/admin' : '/dashboard');
//           }
//         }
//       } catch (error) {
//         toast.error("Invalid email or password.");
//       }
//     } else {
//       toast.error(err.response?.data?.message || 'Login Faild');
//     }
//   } finally {
//     setLoading(false);
//   }
// };

// //google login

//   const handleGoogleLogin = async () => {
//     try {
//       setLoading(true);
//       const result = await googleLogin();
//       const user = result.user;
//       const res = await api.post("/auth/google", {
//         name: user.displayName,
//          email: user.email 
//       });
//       if (res.status === 200 || res.status === 201) {
//         login(res.data.user, res.data.token); 
//          navigate(res.data.user.role === 'admin' ? '/admin' : '/dashboard',  { replace: true }), 
   
      
//         toast.success("Google Login Successful!");
       
//       }
//     } catch (error) {
//       toast.error("Google Login Failed!");
//     } finally {
//       setLoading(false);
//     }
//   };

//   //fortgot password
// // const handleForgotPassword = async () => {
// //     if (!formData.email) {
// //       toast.error("Please enter your email first.");
// //       return;
// //     }
// //     try {
// //       await resetPassword(formData.email);
// //     } catch (err) {
// //       // Error handles inside resetPassword via toast
// //     }
// //   };


// const handleForgotPassword = async () => {
//   if (!formData.email) {
//     toast.error("Please enter your email first.");
//     return;
//   }
//   try {
//     await resetPassword(formData.email); // Firebase password reset email sent
//     //toast.success("Check your inbox to reset your password.");
    
//     // Optionally redirect to login page
//     setFormData({ ...formData, password: '' }); // clear password field
//     navigate("/login");
    
//   } catch (err) {
//     // Error handled in resetPassword
//   }
// };


//   return (
//     <div className="w-full h-full p-8 flex flex-col justify-center bg-white dark:bg-slate-900">
//       <div className="text-center mb-6">
//         <div className="w-12 h-12 bg-sky-50 dark:bg-sky-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
//           <Link to="/"><LogIn className="h-6 w-6 text-sky-500" /></Link>
//         </div>
//         <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sign In</h1>
//         <p className="text-slate-500 text-sm mt-1">Welcome back to NeXsign</p>
//       </div>

//       <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto w-full text-left">
//         <div className="space-y-1">
//           <Label className="text-sm">Email</Label>
//           <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="name@example.com" className="h-10 rounded-xl" required />
//         </div>
//         <div className="space-y-1">
//           {/* <div className="flex justify-between items-center">
//             <Label className="text-sm">Password</Label>
//             <Link to="/forgot-password" size="sm" className="text-xs text-sky-500 hover:underline">Forgot password?</Link>
//           </div> */}

//           <div className="flex justify-between items-center">
//       <Label className="text-sm">Password</Label>
//       <button 
//         type="button" 
//         onClick={handleForgotPassword} 
//         className="text-xs text-sky-500 hover:underline bg-transparent border-none cursor-pointer"
//       >
//         Forgot password?
//       </button>
//     </div>
//           <div className="relative">
//             <Input name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} placeholder="••••••••" className="h-10 rounded-xl pr-10" required />
//             <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
//               {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//             </button>
//           </div>
//         </div>
//         <Button type="submit" className="w-full h-10 bg-sky-500 hover:bg-sky-600 text-white rounded-xl shadow-lg" disabled={loading}>
//           {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
//         </Button>
//       </form>

//       <div className="max-w-sm mx-auto w-full">
//         <Button onClick={handleGoogleLogin} className="w-full mt-3 flex items-center justify-center gap-2 bg-white border border-slate-200 text-black py-2 rounded-xl hover:bg-gray-50">
//           <FcGoogle size={18} /> Continue with Google
//         </Button>
//         <p className="text-center mt-4 text-slate-500 text-xs md:hidden">
//           New here? <button onClick={toggle} className="text-sky-500 font-bold">Sign Up</button>
//         </p>
//       </div>
//     </div>
//   );
// }

// src/pages/Login.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { api } from '@/api/apiClient';
import { useAuth } from '@/lib/AuthContext';
import { Button }   from '@/components/ui/button';
import { Input }    from '@/components/ui/input';
import { Label }    from '@/components/ui/label';
import { toast }    from 'sonner';
import {
  LogIn, Loader2, Eye, EyeOff,
  Mail, Lock, AlertCircle, CheckCircle2,
} from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

// ── Validation ───────────────────────────────────────────────────
const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

const validatePassword = (pw) => pw.length >= 6;

export default function Login({ toggle }) {
  const navigate        = useNavigate();
  const [searchParams]  = useSearchParams();
  const {
    login, googleLogin,
    loginWithEmail, resetPassword,
    user,
  } = useAuth();

  const [formData, setFormData]     = useState({ email: '', password: '' });
  const [errors,   setErrors]       = useState({});
  const [showPw,   setShowPw]       = useState(false);
  const [loading,  setLoading]      = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetSent, setResetSent]   = useState(false);

  // ── Redirect if already logged in ───────────────────────────
  useEffect(() => {
    if (user) {
      const role = user?.role;
      navigate(
        role === 'admin' || role === 'super_admin'
          ? '/admin'
          : '/dashboard',
        { replace: true }
      );
    }
  }, [user, navigate]);

  // ── Show messages from URL params ───────────────────────────
  useEffect(() => {
    if (searchParams.get('expired') === 'true') {
      toast.error('Session expired. Please sign in again.');
    }
    if (searchParams.get('verified') === 'true') {
      toast.success('Email verified! You can now sign in.');
    }
    if (searchParams.get('reset') === 'true') {
      toast.success('Password reset successful! Please sign in.');
    }
  }, [searchParams]);

  // ── Input change ─────────────────────────────────────────────
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error on type
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  // ── Client-side validation ───────────────────────────────────
  const validate = () => {
    const newErrors = {};
    if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email.';
    }
    if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 6 characters.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Email/Password Submit ────────────────────────────────────
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const email    = formData.email.toLowerCase().trim();
    const password = formData.password;

    try {
      // Step 1: Backend login
      const res = await api.post('/auth/login', { email, password });

      if (res.data?.token) {
        login(res.data.user, res.data.token);
        toast.success('Welcome back! 👋');
        const role = res.data.user?.role;
        navigate(
          role === 'admin' || role === 'super_admin'
            ? '/admin'
            : '/dashboard',
          { replace: true }
        );
      }
    } catch (err) {
      const status = err.status || err.response?.status;

      // Step 2: 401 — try Firebase then sync
      if (status === 401) {
        try {
          const { signInWithEmailAndPassword } = await import('firebase/auth');
          const { auth }                        = await import('../firebase.config.js');

          const fbResult = await signInWithEmailAndPassword(
            auth, email, password
          );

          if (fbResult.user) {
            const syncRes = await api.post('/auth/sync-password', {
              email, password,
            });
            if (syncRes.data?.token) {
              login(syncRes.data.user, syncRes.data.token);
              toast.success('Signed in successfully!');
              const role = syncRes.data.user?.role;
              navigate(
                role === 'admin' ? '/admin' : '/dashboard',
                { replace: true }
              );
              return;
            }
          }
        } catch {
          // Firebase also failed
        }
        toast.error('Invalid email or password.');
      } else if (status === 403) {
        toast.error('Account suspended. Contact support.');
      } else if (err.__network || err.__offline) {
        toast.error('No internet connection. Please check and retry.');
      } else {
        toast.error(
          err.message || 'Login failed. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  }, [formData, login, navigate]);

  // ── Google Login ─────────────────────────────────────────────
  const handleGoogleLogin = useCallback(async () => {
    setGoogleLoading(true);
    try {
      const result = await googleLogin();
      if (!result) return; // Popup closed

      const { displayName, email } = result.user;
      const res = await api.post('/auth/google', {
        name:  displayName,
        email,
      });

      if (res.data?.token) {
        login(res.data.user, res.data.token);
        toast.success('Google login successful! 🎉');
        const role = res.data.user?.role;
        navigate(
          role === 'admin' || role === 'super_admin'
            ? '/admin'
            : '/dashboard',
          { replace: true }
        );
      }
    } catch (err) {
      if (!err.__cancelled) {
        toast.error('Google login failed. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  }, [googleLogin, login, navigate]);

  // ── Forgot Password ──────────────────────────────────────────
  const handleForgotPassword = useCallback(async () => {
    if (!formData.email) {
      setErrors(prev => ({
        ...prev,
        email: 'Enter your email above first.',
      }));
      return;
    }
    if (!validateEmail(formData.email)) {
      setErrors(prev => ({
        ...prev,
        email: 'Please enter a valid email.',
      }));
      return;
    }

    setLoading(true);
    try {
      await resetPassword(formData.email.toLowerCase().trim());
      setResetSent(true);
    } catch {
      // Error toast handled in AuthContext
    } finally {
      setLoading(false);
    }
  }, [formData.email, resetPassword]);

  const isFormLoading = loading || googleLoading;

  // ── Reset sent screen ────────────────────────────────────────
  if (resetSent) {
    return (
      <div className="w-full h-full p-8 flex flex-col 
                      justify-center items-center 
                      bg-white dark:bg-slate-900">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 
                          rounded-2xl flex items-center justify-center 
                          mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 
                         dark:text-white mb-2">
            Check Your Email
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            We sent a password reset link to{' '}
            <span className="font-semibold text-slate-700 
                             dark:text-slate-300">
              {formData.email}
            </span>
          </p>
          <Button
            onClick={() => setResetSent(false)}
            className="w-full h-10 bg-sky-500 hover:bg-sky-600 
                       text-white rounded-xl"
          >
            Back to Sign In
          </Button>
        </div>
      </div>
    );
  }

  // ── Main Login Form ──────────────────────────────────────────
  return (
    <div className="w-full h-full p-6 sm:p-8 flex flex-col 
                    justify-center bg-white dark:bg-slate-900">

      {/* Header */}
      <div className="text-center mb-6">
        <Link to="/">
          <div className="w-12 h-12 bg-sky-50 dark:bg-sky-900/20 
                          rounded-2xl flex items-center justify-center 
                          mx-auto mb-3 hover:scale-105 
                          transition-transform cursor-pointer">
            <LogIn className="h-5 w-5 text-sky-500" />
          </div>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 
                       dark:text-white">
          Welcome Back
        </h1>
        <p className="text-slate-500 dark:text-slate-400 
                      text-sm mt-1">
          Sign in to your NeXsign account
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 max-w-sm mx-auto w-full"
        noValidate
      >
        {/* Email */}
        <div className="space-y-1.5">
          <Label
            htmlFor="email"
            className="text-sm font-medium 
                       text-slate-700 dark:text-slate-300"
          >
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 
                             w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              autoComplete="email"
              disabled={isFormLoading}
              className={`h-11 pl-10 rounded-xl border 
                          transition-colors duration-150
                          ${errors.email
                            ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
                            : 'border-slate-200 dark:border-slate-700 focus:border-sky-400 focus:ring-sky-400'
                          }`}
              required
            />
          </div>
          {errors.email && (
            <p className="flex items-center gap-1.5 
                          text-xs text-red-500 mt-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              {errors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <Label
              htmlFor="password"
              className="text-sm font-medium 
                         text-slate-700 dark:text-slate-300"
            >
              Password
            </Label>
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={isFormLoading}
              className="text-xs text-sky-500 hover:text-sky-600 
                         font-medium hover:underline 
                         transition-colors disabled:opacity-50"
            >
              Forgot password?
            </button>
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 
                             w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              id="password"
              name="password"
              type={showPw ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={isFormLoading}
              className={`h-11 pl-10 pr-10 rounded-xl border 
                          transition-colors duration-150
                          ${errors.password
                            ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
                            : 'border-slate-200 dark:border-slate-700 focus:border-sky-400 focus:ring-sky-400'
                          }`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPw(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 
                         text-slate-400 hover:text-slate-600 
                         dark:hover:text-slate-300 transition-colors"
              tabIndex={-1}
            >
              {showPw
                ? <EyeOff className="w-4 h-4" />
                : <Eye    className="w-4 h-4" />
              }
            </button>
          </div>
          {errors.password && (
            <p className="flex items-center gap-1.5 
                          text-xs text-red-500 mt-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              {errors.password}
            </p>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isFormLoading}
          className="w-full h-11 bg-sky-500 hover:bg-sky-600 
                     active:bg-sky-700 text-white rounded-xl 
                     font-semibold shadow-lg shadow-sky-500/25 
                     transition-all duration-150 active:scale-[0.98]
                     disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading
            ? <Loader2 className="w-5 h-5 animate-spin" />
            : 'Sign In'
          }
        </Button>
      </form>

      {/* Divider */}
      <div className="max-w-sm mx-auto w-full mt-4">
        <div className="relative flex items-center gap-3 my-2">
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          <span className="text-xs text-slate-400 font-medium">
            OR
          </span>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
        </div>

        {/* Google */}
        <Button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isFormLoading}
          variant="outline"
          className="w-full h-11 flex items-center justify-center 
                     gap-2.5 rounded-xl border border-slate-200 
                     dark:border-slate-700 bg-white dark:bg-slate-800 
                     text-slate-700 dark:text-slate-200 
                     hover:bg-slate-50 dark:hover:bg-slate-700 
                     font-semibold transition-all duration-150 
                     active:scale-[0.98] shadow-sm 
                     disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {googleLoading
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <FcGoogle className="w-5 h-5 shrink-0" />
          }
          {googleLoading ? 'Signing in...' : 'Continue with Google'}
        </Button>

        {/* Mobile toggle to Register */}
        {toggle && (
          <p className="text-center mt-5 text-slate-500 
                        dark:text-slate-400 text-sm md:hidden">
            New here?{' '}
            <button
              type="button"
              onClick={toggle}
              className="text-sky-500 hover:text-sky-600 
                         font-semibold hover:underline"
            >
              Create account
            </button>
          </p>
        )}

        {/* Desktop link */}
        <p className="text-center mt-5 text-slate-500 
                      dark:text-slate-400 text-sm hidden md:block">
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="text-sky-500 hover:text-sky-600 
                       font-semibold hover:underline"
          >
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}