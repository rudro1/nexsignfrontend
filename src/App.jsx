// import React, { createContext, useContext, useEffect, useState } from 'react';
// import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
// import { QueryClientProvider } from '@tanstack/react-query';
// import { queryClientInstance } from '@/lib/query-client';
// import { AuthProvider, useAuth } from '@/lib/AuthContext';
// import { pagesConfig } from './pages.config';
// import { Toaster } from "sonner";

// // Pages
// import { Landing } from "@/pages/Landing";
// import SignerView from '@/pages/SignerView';
// import PageNotFound from './lib/PageNotFound';
// import Pricing from './pages/Pricing';
// import Auth from './pages/Auth';

// const { Pages, Layout } = pagesConfig;

// // ১. থিম ম্যানেজমেন্ট
// const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} });
// export const useTheme = () => useContext(ThemeContext);

// function ThemeProvider({ children }) {
//   const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
//   useEffect(() => {
//     const root = window.document.documentElement;
//     root.classList.remove('light', 'dark');
//     root.classList.add(theme);
//     localStorage.setItem('theme', theme);
//   }, [theme]);
//   const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
//   return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
// }

// // ২. প্রোটেক্টেড রাউট লজিক
// const ProtectedRoute = ({ children, requiredRole }) => {
//   const { user, loading } = useAuth();
  
//   if (loading) return null;
//   if (!user) return <Navigate to="/login" replace />;

//   if (requiredRole === 'admin') {
//     const hasAccess = user.role === 'admin' || user.role === 'super_admin';
//     if (!hasAccess) return <Navigate to="/dashboard" replace />;
//   }

//   return children;
// };

// const LayoutWrapper = ({ children, currentPageName }) => {
//   return Layout ? <Layout currentPageName={currentPageName}>{children}</Layout> : <>{children}</>;
// };

// // ৩. মেইন অ্যাপ রাউটিং
// const AuthenticatedApp = () => {
//   const { loading, isAuthenticated } = useAuth();
//   // publicRoutes-এ 'sign' রাউটটি ডাইনামিক হবে তাই এখান থেকে বাদ দিলেও চলে
//   const publicRoutes = ['landing', 'login', 'register', 'pricing'];

//   if (loading) {
//     return (
//       <div className="h-screen flex flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-950">
//         <div className="w-12 h-12 border-4 border-[#28ABDF] border-t-transparent rounded-full animate-spin"></div>
//         <p className="text-slate-500 font-medium animate-pulse">NeXsign is loading...</p>
//       </div>
//     );
//   }

//   return (
//     <Routes>
//       {/* পাবলিক রাউটস */}
//       <Route path="/" element={<Landing />} />
//       <Route path="/pricing" element={<Pricing />} />

//       {/* অথ রাউটস (লগইন থাকলে ড্যাশবোর্ডে পাঠাবে) */}
//       <Route 
//         path="/login" 
//         element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Auth initialMode="login" />} 
//       />
//       <Route 
//         path="/register" 
//         element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Auth initialMode="register" />} 
//       />
      
//       {/* 🌟 ফিক্সড: ডাইনামিক সাইনিং রাউট (টোকেন সহ) */}
//       <Route path="/sign/:token" element={<SignerView />} />

//       {/* ৪. অটোমেটেড প্রোটেক্টেড রাউটস (Dashboard, Admin ইত্যাদি) */}
//       {Object.entries(Pages).map(([path, PageComponent]) => {
//         if (publicRoutes.includes(path)) return null;

//         const isAdminPage = path.toLowerCase().includes('admin');

//         return (
//           <Route
//             key={path}
//             path={`/${path}`}
//             element={
//               <ProtectedRoute requiredRole={isAdminPage ? 'admin' : null}>
//                 <LayoutWrapper currentPageName={path}>
//                   <PageComponent />
//                 </LayoutWrapper>
//               </ProtectedRoute>
//             }
//           />
//         );
//       })}
      
//       <Route path="*" element={<PageNotFound />} />
//     </Routes>
//   );
// };

// export default function App() {
//   return (
//     <ThemeProvider>
//       <AuthProvider>
//         <QueryClientProvider client={queryClientInstance}>
//           <Router>
//             <Toaster
//               position="top-right"
//               richColors
//               toastOptions={{
//                  duration: 1000,
//                 style: { zIndex: 9999 } 
//               }}
//             /> 
//             <AuthenticatedApp />
//           </Router>
//         </QueryClientProvider>
//       </AuthProvider>
//     </ThemeProvider>
//   );
// }
// import React, {
//   createContext, useContext, useEffect, useState,
// } from 'react';
// import {
//   BrowserRouter as Router, Route, Routes, Navigate,
// } from 'react-router-dom';
// import { QueryClientProvider } from '@tanstack/react-query';
// import { queryClientInstance } from '@/lib/query-client';
// import { AuthProvider, useAuth } from '@/lib/AuthContext';
// import { Toaster } from 'sonner';

// // Pages
// import { Landing }    from '@/pages/Landing';
// import SignerView     from '@/pages/SignerView';
// import PageNotFound   from './lib/PageNotFound';
// import Pricing        from './pages/Pricing';
// import Auth           from './pages/Auth';
// import NewTemplate    from '@/pages/NewTemplate'; // ✅ New
// import Dashboard      from '@/pages/Dashboard';
// import DocumentEditor from '@/pages/DocumentEditor';
// import Templates      from '@/pages/Templates';
// import AdminDashboard from '@/pages/AdminDashboard';
// import Audit          from '@/pages/Audit';

// // ── Theme ────────────────────────────────────────────────────────
// const ThemeContext = createContext({
//   theme: 'light', toggleTheme: () => {},
// });
// export const useTheme = () => useContext(ThemeContext);

// function ThemeProvider({ children }) {
//   const [theme, setTheme] = useState(
//     () => localStorage.getItem('theme') || 'light'
//   );
//   useEffect(() => {
//     document.documentElement.classList.remove('light','dark');
//     document.documentElement.classList.add(theme);
//     localStorage.setItem('theme', theme);
//   }, [theme]);

//   return (
//     <ThemeContext.Provider value={{
//       theme,
//       toggleTheme: () =>
//         setTheme(p => p === 'light' ? 'dark' : 'light'),
//     }}>
//       {children}
//     </ThemeContext.Provider>
//   );
// }

// // ── Protected Route ──────────────────────────────────────────────
// const ProtectedRoute = ({ children, adminOnly = false }) => {
//   const { user, loading } = useAuth();
//   if (loading) return null;
//   if (!user) return <Navigate to="/login" replace />;
//   if (adminOnly) {
//     const ok =
//       user.role === 'admin' || user.role === 'super_admin';
//     if (!ok) return <Navigate to="/dashboard" replace />;
//   }
//   return children;
// };

// // ── Main App ─────────────────────────────────────────────────────
// function AppRoutes() {
//   const { loading, isAuthenticated } = useAuth();

//   if (loading) return (
//     <div className="h-screen flex flex-col items-center
//                     justify-center gap-4 bg-slate-50
//                     dark:bg-slate-950">
//       <div className="w-12 h-12 border-4 border-[#28ABDF]
//                       border-t-transparent rounded-full
//                       animate-spin" />
//       <p className="text-slate-500 font-medium animate-pulse">
//         NeXsign is loading...
//       </p>
//     </div>
//   );

//   return (
//     <Routes>
//       {/* Public */}
//       <Route path="/"        element={<Landing />} />
//       <Route path="/pricing" element={<Pricing />} />

//       {/* Auth */}
//       <Route path="/login"
//         element={isAuthenticated
//           ? <Navigate to="/dashboard" replace />
//           : <Auth initialMode="login" />
//         }
//       />
//       <Route path="/register"
//         element={isAuthenticated
//           ? <Navigate to="/dashboard" replace />
//           : <Auth initialMode="register" />
//         }
//       />

//       {/* Public signing */}
//       <Route path="/sign/:token" element={<SignerView />} />

//       {/* Protected */}
//       <Route path="/dashboard"
//         element={
//           <ProtectedRoute>
//             <Dashboard />
//           </ProtectedRoute>
//         }
//       />
//       <Route path="/DocumentEditor"
//         element={
//           <ProtectedRoute>
//             <DocumentEditor />
//           </ProtectedRoute>
//         }
//       />
//       <Route path="/templates"
//         element={
//           <ProtectedRoute>
//             <Templates />
//           </ProtectedRoute>
//         }
//       />
//       {/* ✅ New Template route */}
//       <Route path="/new-template"
//         element={
//           <ProtectedRoute>
//             <NewTemplate />
//           </ProtectedRoute>
//         }
//       />
//       <Route path="/audit"
//         element={
//           <ProtectedRoute>
//             <Audit />
//           </ProtectedRoute>
//         }
//       />

//       {/* Admin */}
//       <Route path="/admin"
//         element={
//           <ProtectedRoute adminOnly>
//             <AdminDashboard />
//           </ProtectedRoute>
//         }
//       />

//       <Route path="*" element={<PageNotFound />} />
//     </Routes>
//   );
// }

// export default function App() {
//   return (
//     <ThemeProvider>
//       <AuthProvider>
//         <QueryClientProvider client={queryClientInstance}>
//           <Router>
//             <Toaster
//               position="top-right"
//               richColors
//               toastOptions={{
//                 duration: 3000,
//                 style: { zIndex: 9999 },
//               }}
//             />
//             <AppRoutes />
//           </Router>
//         </QueryClientProvider>
//       </AuthProvider>
//     </ThemeProvider>
//   );
// }
// src/App.jsx
import React, {
  createContext, useContext, useEffect,
  useState, useCallback, Suspense, lazy,
} from 'react';
import {
  BrowserRouter as Router,
  Route, Routes, Navigate,
  useLocation,
} from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { Toaster } from 'sonner';
import { FileSignature } from 'lucide-react';

// ─── cn helper ───────────────────────────────────────────────────
const cn = (...c) => c.filter(Boolean).join(' ');

// ════════════════════════════════════════════════════════════════
// LAZY IMPORTS — code splitting
// ════════════════════════════════════════════════════════════════
const Landing        = lazy(() => import('@/pages/Landing'));
const Pricing        = lazy(() => import('@/pages/Pricing'));
const Auth           = lazy(() => import('@/pages/Auth'));
const Dashboard      = lazy(() => import('@/pages/Dashboard'));
const DocumentEditor = lazy(() => import('@/pages/DocumentEditor'));
const DocumentDetail = lazy(() => import('@/pages/DocumentDetail'));
const SignerView      = lazy(() => import('@/pages/SignerView'));
const Templates      = lazy(() => import('@/pages/Templates'));
const NewTemplate    = lazy(() => import('@/pages/NewTemplate'));
const TemplateDetail = lazy(() => import('@/pages/TemplateDetail'));
const TemplateSigner = lazy(() => import('@/pages/TemplateSigner'));
const Audit          = lazy(() => import('@/pages/Audit'));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const PageNotFound   = lazy(() => import('@/lib/PageNotFound'));

// ════════════════════════════════════════════════════════════════
// THEME CONTEXT
// ════════════════════════════════════════════════════════════════
const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} });
export const useTheme = () => useContext(ThemeContext);

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Sync with what Navbar already set
    if (document.documentElement.classList.contains('dark')) return 'dark';
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(
    () => setTheme(p => (p === 'light' ? 'dark' : 'light')),
    [],
  );

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ════════════════════════════════════════════════════════════════
// SCROLL TO TOP on route change
// ════════════════════════════════════════════════════════════════
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

// ════════════════════════════════════════════════════════════════
// LOADING SCREENS
// ════════════════════════════════════════════════════════════════

// Full-page app boot loader
function AppLoader() {
  return (
    <div className="h-screen flex flex-col items-center justify-center gap-5 bg-white dark:bg-slate-950">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-2">
        <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-sky-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/30">
          <FileSignature size={20} className="text-white" />
        </div>
        <span className="font-extrabold text-2xl text-slate-900 dark:text-white tracking-tight">
          NeX<span className="text-sky-500">sign</span>
        </span>
      </div>

      {/* Spinner */}
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-800" />
        <div className="absolute inset-0 rounded-full border-4 border-t-sky-500 animate-spin" />
      </div>

      <p className="text-sm text-slate-400 font-medium animate-pulse">
        Loading…
      </p>
    </div>
  );
}

// Lazy-chunk loader (Suspense fallback)
function PageLoader() {
  return (
    <div className="h-screen flex items-center justify-center bg-white dark:bg-slate-950">
      <div className="relative w-8 h-8">
        <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-800" />
        <div className="absolute inset-0 rounded-full border-4 border-t-sky-500 animate-spin" />
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// PROTECTED ROUTE
// ════════════════════════════════════════════════════════════════
function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  // Show skeleton while auth resolves
  if (loading) return <PageLoader />;

  // Not logged in
  if (!user) return <Navigate to="/login" replace />;

  // Admin check
  if (adminOnly) {
    const isAdmin = user.role === 'admin' || user.role === 'super_admin';
    if (!isAdmin) return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// ── Redirect if already logged in ────────────────────────────────
function GuestRoute({ children }) {
  const { user, loading, isAuthenticated } = useAuth();
  if (loading) return <PageLoader />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

// ════════════════════════════════════════════════════════════════
// ROUTES
// ════════════════════════════════════════════════════════════════
function AppRoutes() {
  const { loading } = useAuth();
  if (loading) return <AppLoader />;

  return (
    <>
      <ScrollToTop />
      <Routes>

        {/* ── Public ──────────────────────────────────────── */}
        <Route path="/"        element={<Landing  />} />
        <Route path="/pricing" element={<Pricing  />} />

        {/* ── Auth (guest only) ────────────────────────────── */}
        <Route
          path="/login"
          element={
            <GuestRoute>
              <Auth initialMode="login" />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <Auth initialMode="register" />
            </GuestRoute>
          }
        />

        {/* ── Public signing ───────────────────────────────── */}
        <Route path="/sign/:token"          element={<SignerView     />} />
        <Route path="/template-sign/:token" element={<TemplateSigner />} />

        {/* ── Protected: Dashboard ─────────────────────────── */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* ── Protected: Documents ─────────────────────────── */}
        <Route
          path="/document-editor"
          element={
            <ProtectedRoute>
              <DocumentEditor />
            </ProtectedRoute>
          }
        />
        {/* Legacy URL support */}
        <Route
          path="/DocumentEditor"
          element={<Navigate to="/document-editor" replace />}
        />
        <Route
          path="/editor/:id"
          element={
            <ProtectedRoute>
              <DocumentEditor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents/:id"
          element={
            <ProtectedRoute>
              <DocumentDetail />
            </ProtectedRoute>
          }
        />
        {/* Legacy manage route */}
        <Route
          path="/manage/:id"
          element={
            <ProtectedRoute>
              <DocumentDetail />
            </ProtectedRoute>
          }
        />

        {/* ── Protected: Templates ─────────────────────────── */}
        <Route
          path="/templates"
          element={
            <ProtectedRoute>
              <Templates />
            </ProtectedRoute>
          }
        />
        <Route
          path="/templates/new"
          element={
            <ProtectedRoute>
              <NewTemplate />
            </ProtectedRoute>
          }
        />
        {/* Legacy */}
        <Route
          path="/new-template"
          element={<Navigate to="/templates/new" replace />}
        />
        <Route
          path="/templates/:id"
          element={
            <ProtectedRoute>
              <TemplateDetail />
            </ProtectedRoute>
          }
        />

        {/* ── Protected: Audit ─────────────────────────────── */}
        <Route
          path="/audit/:id"
          element={
            <ProtectedRoute>
              <Audit />
            </ProtectedRoute>
          }
        />

        {/* ── Admin only ───────────────────────────────────── */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* ── 404 ─────────────────────────────────────────── */}
        <Route path="*" element={<PageNotFound />} />

      </Routes>
    </>
  );
}

// ════════════════════════════════════════════════════════════════
// ROOT APP
// ════════════════════════════════════════════════════════════════
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <Suspense fallback={<PageLoader />}>
              <Toaster
                position="top-right"
                richColors
                expand={false}
                toastOptions={{
                  duration: 3500,
                  style: { zIndex: 9999 },
                  classNames: {
                    toast:       'rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl',
                    title:       'font-bold text-sm',
                    description: 'text-xs text-slate-500',
                  },
                }}
              />
              <AppRoutes />
            </Suspense>
          </Router>
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}