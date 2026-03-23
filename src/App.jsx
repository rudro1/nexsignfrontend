

import React, { createContext, useContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
//import { Toaster } from "@/components/ui/toaster";
import { pagesConfig } from './pages.config';
import { Toaster, toast } from "sonner";

// Pages (Manual Imports for special routes)
import { Landing } from "@/pages/Landing";
import SignerView from '@/pages/SignerView';
import PageNotFound from './lib/PageNotFound';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Pricing from './pages/Pricing';
import Auth from './pages/Auth';

const { Pages, Layout } = pagesConfig;

// ১. থিম ম্যানেজমেন্ট
const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} });
export const useTheme = () => useContext(ThemeContext);

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

// ২. ফিক্সড প্রোটেক্টেড রাউট (Role-Based)
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  
  // 🌟 FIX: লগআউট করলে বা আনঅথোরাইজড ইউজার হলে সরাসরি Landing Page (/) এ পাঠাবে
  if (!user) return <Navigate to="/" replace />;

  // যদি রাউটটি অ্যাডমিনদের জন্য হয়, তবে check if user is admin OR super_admin
  if (requiredRole === 'admin') {
    const hasAccess = user.role === 'admin' || user.role === 'super_admin';
    if (!hasAccess) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

const LayoutWrapper = ({ children, currentPageName }) => {
  return Layout ? <Layout currentPageName={currentPageName}>{children}</Layout> : <>{children}</>;
};

// const AuthenticatedApp = () => {
//   const { loading } = useAuth();
//   const publicRoutes =['landing', 'login', 'register', 'sign'];

//   if (loading) {
//     return (
//       <div className="h-screen flex flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-950">
//         <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
//         <p className="text-slate-500 font-medium animate-pulse">NexSign লোড হচ্ছে...</p>
//       </div>
//     );
//   }

//   return (
//     <Routes>
//       <Route path="/" element={<Landing />} />
//       <Route path="/login" element={<Login />} />
//       <Route path="/register" element={<Register />} />
//       <Route path="/sign" element={<SignerView />} />
//       <Route path="/pricing" element={<Pricing/> }/>

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

// 🌟 IMPORTANT: এই এক্সপোর্ট ডিফল্ট অংশটি যেন মিস না হয়!
const AuthenticatedApp = () => {
  // 1. IMPORTANT: Destructure 'user' and 'isAuthenticated'
  const { loading, user, isAuthenticated } = useAuth();
  const publicRoutes = ['landing', 'login', 'register', 'sign'];

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-950">
        <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">NexSign is loading...</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* 2. ALWAYS PUBLIC: Home Page */}
      <Route path="/" element={<Landing />} />

      {/* 3. REDIRECT LOGIC: Prevent logged-in users from seeing Login/Register */}



      {/* <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <AuthPage initialMode="login" />} 
      /> */}
      {/* <Route 
        path="/register" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <AuthPage initialMode="register" />} 
      /> */}

      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Auth initialMode= "login"></Auth>} 
      />
      <Route 
        path="/register" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Auth initialMode="register"></Auth>} 
      />
      
      <Route path="/sign" element={<SignerView />} />
      <Route path="/pricing" element={<Pricing />} />

      {/* 4. PROTECTED ROUTES: Handles Admin vs User logic */}
      {Object.entries(Pages).map(([path, PageComponent]) => {
        if (publicRoutes.includes(path)) return null;

        const isAdminPage = path.toLowerCase().includes('admin');

        return (
          <Route
            key={path}
            path={`/${path}`}
            element={
              <ProtectedRoute requiredRole={isAdminPage ? 'admin' : null}>
                <LayoutWrapper currentPageName={path}>
                  <PageComponent />
                </LayoutWrapper>
              </ProtectedRoute>
            }
          />
        );
      })}
      
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
               {/* Toaster should be at the top level, but inside Router */}
         <Toaster
  position="top-right"
  richColors
  toastOptions={{
    style: { zIndex: 9999 } // ensure on top of everything
  }}
/> 
            <AuthenticatedApp />
          </Router>
        
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}