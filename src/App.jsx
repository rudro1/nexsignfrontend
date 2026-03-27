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
import React, {
  createContext, useContext, useEffect, useState,
} from 'react';
import {
  BrowserRouter as Router, Route, Routes, Navigate,
} from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { Toaster } from 'sonner';

// Pages
import { Landing }    from '@/pages/Landing';
import SignerView     from '@/pages/SignerView';
import PageNotFound   from './lib/PageNotFound';
import Pricing        from './pages/Pricing';
import Auth           from './pages/Auth';
import NewTemplate    from '@/pages/NewTemplate'; // ✅ New
import Dashboard      from '@/pages/Dashboard';
import DocumentEditor from '@/pages/DocumentEditor';
import Templates      from '@/pages/Templates';
import AdminDashboard from '@/pages/AdminDashboard';
import Audit          from '@/pages/Audit';

// ── Theme ────────────────────────────────────────────────────────
const ThemeContext = createContext({
  theme: 'light', toggleTheme: () => {},
});
export const useTheme = () => useContext(ThemeContext);

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') || 'light'
  );
  useEffect(() => {
    document.documentElement.classList.remove('light','dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{
      theme,
      toggleTheme: () =>
        setTheme(p => p === 'light' ? 'dark' : 'light'),
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ── Protected Route ──────────────────────────────────────────────
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly) {
    const ok =
      user.role === 'admin' || user.role === 'super_admin';
    if (!ok) return <Navigate to="/dashboard" replace />;
  }
  return children;
};

// ── Main App ─────────────────────────────────────────────────────
function AppRoutes() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) return (
    <div className="h-screen flex flex-col items-center
                    justify-center gap-4 bg-slate-50
                    dark:bg-slate-950">
      <div className="w-12 h-12 border-4 border-[#28ABDF]
                      border-t-transparent rounded-full
                      animate-spin" />
      <p className="text-slate-500 font-medium animate-pulse">
        NeXsign is loading...
      </p>
    </div>
  );

  return (
    <Routes>
      {/* Public */}
      <Route path="/"        element={<Landing />} />
      <Route path="/pricing" element={<Pricing />} />

      {/* Auth */}
      <Route path="/login"
        element={isAuthenticated
          ? <Navigate to="/dashboard" replace />
          : <Auth initialMode="login" />
        }
      />
      <Route path="/register"
        element={isAuthenticated
          ? <Navigate to="/dashboard" replace />
          : <Auth initialMode="register" />
        }
      />

      {/* Public signing */}
      <Route path="/sign/:token" element={<SignerView />} />

      {/* Protected */}
      <Route path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/DocumentEditor"
        element={
          <ProtectedRoute>
            <DocumentEditor />
          </ProtectedRoute>
        }
      />
      <Route path="/templates"
        element={
          <ProtectedRoute>
            <Templates />
          </ProtectedRoute>
        }
      />
      {/* ✅ New Template route */}
      <Route path="/new-template"
        element={
          <ProtectedRoute>
            <NewTemplate />
          </ProtectedRoute>
        }
      />
      <Route path="/audit"
        element={
          <ProtectedRoute>
            <Audit />
          </ProtectedRoute>
        }
      />

      {/* Admin */}
      <Route path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <Toaster
              position="top-right"
              richColors
              toastOptions={{
                duration: 3000,
                style: { zIndex: 9999 },
              }}
            />
            <AppRoutes />
          </Router>
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}