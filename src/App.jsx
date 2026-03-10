// import { Toaster } from "@/components/ui/toaster"
// import { QueryClientProvider } from '@tanstack/react-query'
// import { queryClientInstance } from '@/lib/query-client'
// import { pagesConfig } from './pages.config'
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import PageNotFound from './lib/PageNotFound';
// import { AuthProvider, useAuth } from '@/lib/AuthContext';
// import { LandingPage } from '@/pages/LandingPage'; // ল্যান্ডিং পেজ ইমপোর্ট

// const { Pages, Layout, mainPage } = pagesConfig;
// const mainPageKey = mainPage ?? Object.keys(Pages)[0];
// const MainPage = Pages[mainPageKey] || (() => <></>);

// const LayoutWrapper = ({ children, currentPageName }) => {
//   return Layout ? (
//     <Layout currentPageName={currentPageName}>{children}</Layout>
//   ) : (
//     <>{children}</>
//   );
// };

// const AuthenticatedApp = () => {
//   const { loading } = useAuth();

//   if (loading) {
//     return (
//       <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-slate-950">
//         <div className="w-10 h-10 border-4 border-slate-200 border-t-sky-500 rounded-full animate-spin"></div>
//       </div>
//     );
//   }

//   return (
//     <Routes>
//       {/* ১. হোম রুট হিসেবে এখন ল্যান্ডিং পেজ দেখাবে */}
//       <Route path="/" element={<LandingPage />} />

//       {/* ২. ডাইনামিক পেজগুলো সবার জন্য এক্সেসিবল */}
//       {Object.entries(Pages).map(([path, PageComponent]) => (
//         <Route
//           key={path}
//           path={`/${path}`}
//           element={
//             <LayoutWrapper currentPageName={path}>
//               <PageComponent />
//             </LayoutWrapper>
//           }
//         />
//       ))}

//       {/* ৩. ৪-০-৪ রুট */}
//       <Route path="*" element={<PageNotFound />} />
//     </Routes>
//   );
// };

// function App() {
//   return (
//     <AuthProvider>
//       <QueryClientProvider client={queryClientInstance}>
//         <Router>
//           <AuthenticatedApp />
//         </Router>
//         <Toaster />
//       </QueryClientProvider>
//     </AuthProvider>
//   );
// }

// export default App;

// import { Toaster } from "@/components/ui/toaster";
// import { QueryClientProvider } from '@tanstack/react-query';
// import { queryClientInstance } from '@/lib/query-client';
// import { pagesConfig } from './pages.config';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import PageNotFound from './lib/PageNotFound';
// import { AuthProvider, useAuth } from '@/lib/AuthContext';
// // ফাইলের নাম অনুযায়ী ইম্পোর্ট ঠিক করা হলো
// import { LandingPage } from "@/pages/Landing"; 

// const { Pages, Layout, mainPage } = pagesConfig;
// const mainPageKey = mainPage ?? Object.keys(Pages)[0];
// const MainPage = Pages[mainPageKey] || (() => <></>);

// const LayoutWrapper = ({ children, currentPageName }) => {
//   return Layout ? (
//     <Layout currentPageName={currentPageName}>{children}</Layout>
//   ) : (
//     <>{children}</>
//   );
// };

// const AuthenticatedApp = () => {
//   const { loading } = useAuth();

//   if (loading) {
//     return (
//       <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-slate-950">
//         <div className="w-10 h-10 border-4 border-slate-200 border-t-sky-500 rounded-full animate-spin"></div>
//       </div>
//     );
//   }

//   return (
//     <Routes>
//       {/* ল্যান্ডিং পেজ পাথ */}
//       <Route path="/" element={<LandingPage />} />

//       {Object.entries(Pages).map(([path, PageComponent]) => (
//         <Route
//           key={path}
//           path={`/${path}`}
//           element={
//             <LayoutWrapper currentPageName={path}>
//               <PageComponent />
//             </LayoutWrapper>
//           }
//         />
//       ))}

//       <Route path="*" element={<PageNotFound />} />
//     </Routes>
//   );
// };

// function App() {
//   return (
//     <AuthProvider>
//       <QueryClientProvider client={queryClientInstance}>
//         <Router>
//           <AuthenticatedApp />
//         </Router>
//         <Toaster />
//       </QueryClientProvider>
//     </AuthProvider>
//   );
// }

// export default App;
// import React, { createContext, useContext, useEffect, useState } from 'react';
// import { Toaster } from "@/components/ui/toaster";
// import { QueryClientProvider } from '@tanstack/react-query';
// import { queryClientInstance } from '@/lib/query-client';
// import { pagesConfig } from './pages.config';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import PageNotFound from './lib/PageNotFound';
// import { AuthProvider, useAuth } from '@/lib/AuthContext';
// import { Landing } from "@/pages/Landing";

// // --- Theme Context ---
// const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} });

// function ThemeProvider({ children }) {
//   const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

//   useEffect(() => {
//     const root = document.documentElement;
//     if (theme === 'dark') {
//       root.classList.add('dark');
//     } else {
//       root.classList.remove('dark');
//     }
//     localStorage.setItem('theme', theme);
//   }, [theme]);

//   const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

//   return (
//     <ThemeContext.Provider value={{ theme, toggleTheme }}>
//       {children}
//     </ThemeContext.Provider>
//   );
// }

// export const useTheme = () => useContext(ThemeContext);

// // --- Layout Wrapper ---
// const { Pages, Layout } = pagesConfig;

// const LayoutWrapper = ({ children, currentPageName }) => {
//   return Layout ? (
//     <Layout currentPageName={currentPageName}>{children}</Layout>
//   ) : (
//     <>{children}</>
//   );
// };

// // --- Authenticated App ---
// const AuthenticatedApp = () => {
//   const { loading } = useAuth();

//   if (loading) {
//     return (
//       <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-slate-950">
//         <div className="w-10 h-10 border-4 border-slate-200 border-t-sky-500 rounded-full animate-spin"></div>
//       </div>
//     );
//   }

//   return (
//     <Routes>
//       <Route path="/" element={<Landing />} />
//       {Object.entries(Pages).map(([path, PageComponent]) => (
//         <Route
//           key={path}
//           path={`/${path}`}
//           element={
//             <LayoutWrapper currentPageName={path}>
//               <PageComponent />
//             </LayoutWrapper>
//           }
//         />
//       ))}
//       <Route path="*" element={<PageNotFound />} />
//     </Routes>
//   );
// };

// // --- Main App ---
// export default function App() {
//   return (
//     <ThemeProvider>
//       <AuthProvider>
//         <QueryClientProvider client={queryClientInstance}>
//           <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
//             <AuthenticatedApp />
//           </Router>
//           <Toaster />
//         </QueryClientProvider>
//       </AuthProvider>
//     </ThemeProvider>
//   );
// }
// import React, { createContext, useContext, useEffect, useState } from 'react';
// import { Toaster } from "@/components/ui/toaster";
// import { QueryClientProvider } from '@tanstack/react-query';
// import { queryClientInstance } from '@/lib/query-client';
// import { pagesConfig } from './pages.config';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import PageNotFound from './lib/PageNotFound';
// import { AuthProvider, useAuth } from '@/lib/AuthContext';
// import { Landing } from "@/pages/Landing";
// import SignerView from '@/pages/SignerView'; // নিশ্চিত করুন এই পাথটি সঠিক

// const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} });

// function ThemeProvider({ children }) {
//   const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
//   useEffect(() => {
//     const root = document.documentElement;
//     theme === 'dark' ? root.classList.add('dark') : root.classList.remove('dark');
//     localStorage.setItem('theme', theme);
//   }, [theme]);
//   const toggleTheme = () => setTheme(p => p === 'light' ? 'dark' : 'light');
//   return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
// }

// const { Pages, Layout } = pagesConfig;

// const LayoutWrapper = ({ children, currentPageName }) => {
//   return Layout ? <Layout currentPageName={currentPageName}>{children}</Layout> : <>{children}</>;
// };

// const AuthenticatedApp = () => {
//   const { loading } = useAuth();

//   if (loading) return <div className="h-screen flex items-center justify-center animate-pulse">Loading...</div>;

//   return (
//     <Routes>
//       <Route path="/" element={<Landing />} />
      
//       {/* ✅ ইমেইল লিঙ্কের জন্য রাউট */}
//       <Route path="/sign" element={<SignerView />} />

//       {Object.entries(Pages).map(([path, PageComponent]) => (
//         <Route
//           key={path}
//           path={`/${path}`}
//           element={
//             <LayoutWrapper currentPageName={path}>
//               <PageComponent />
//             </LayoutWrapper>
//           }
//         />
//       ))}
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
//             <AuthenticatedApp />
//           </Router>
//           <Toaster />
//         </QueryClientProvider>
//       </AuthProvider>
//     </ThemeProvider>
//   );
// }

// import React, { createContext, useContext, useEffect, useState } from 'react';
// import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
// import { QueryClientProvider } from '@tanstack/react-query';
// import { queryClientInstance } from '@/lib/query-client';
// import { AuthProvider, useAuth } from '@/lib/AuthContext';
// import { Toaster } from "@/components/ui/toaster";
// import { pagesConfig } from './pages.config';

// // Pages
// import { Landing } from "@/pages/Landing";
// import SignerView from '@/pages/SignerView';
// import PageNotFound from './lib/PageNotFound';
// import Login from '@/pages/Login';
// import Register from '@/pages/Register';

// const { Pages, Layout } = pagesConfig;

// // ১. থিম ম্যানেজমেন্ট (Context)
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

// // ২. প্রোটেক্টেড রাউট কম্পোনেন্ট (Security)
// const ProtectedRoute = ({ children }) => {
//   const { user, loading } = useAuth();
  
//   if (loading) return null; // AuthContext এর লোডিং হ্যান্ডেল করা হচ্ছে
//   if (!user) return <Navigate to="/login" replace />;
  
//   return children;
// };

// const LayoutWrapper = ({ children, currentPageName }) => {
//   return Layout ? <Layout currentPageName={currentPageName}>{children}</Layout> : <>{children}</>;
// };

// const AuthenticatedApp = () => {
//   const { loading } = useAuth();

//   if (loading) {
//     return (
//       <div className="h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
//         <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
//         <p className="text-slate-500 font-medium animate-pulse">NexSign লোড হচ্ছে...</p>
//       </div>
//     );
//   }

//   return (
//     <Routes>
//       {/* 🔓 পাবলিক রাউটস (সবার জন্য উন্মুক্ত) */}
//       <Route path="/" element={<Landing />} />
//       <Route path="/login" element={<Login />} />
//       <Route path="/register" element={<Register />} />
//       <Route path="/sign" element={<SignerView />} />

//       {/* 🔒 প্রাইভেট রাউটস (শুধুমাত্র লগইন করা ইউজারদের জন্য) */}
//       {Object.entries(Pages).map(([path, PageComponent]) => (
//         <Route
//           key={path}
//           path={`/${path}`}
//           element={
//             <ProtectedRoute>
//               <LayoutWrapper currentPageName={path}>
//                 <PageComponent />
//               </LayoutWrapper>
//             </ProtectedRoute>
//           }
//         />
//       ))}
      
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
//             <AuthenticatedApp />
//           </Router>
//           <Toaster />
//         </QueryClientProvider>
//       </AuthProvider>
//     </ThemeProvider>
//   );
// }
// import React, { createContext, useContext, useEffect, useState } from 'react';
// import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
// import { QueryClientProvider } from '@tanstack/react-query';
// import { queryClientInstance } from '@/lib/query-client';
// import { AuthProvider, useAuth } from '@/lib/AuthContext';
// import { Toaster } from "@/components/ui/toaster";
// import { pagesConfig } from './pages.config';

// // Pages
// import { Landing } from "@/pages/Landing";
// import SignerView from '@/pages/SignerView';
// import PageNotFound from './lib/PageNotFound';
// import Login from '@/pages/Login';
// import Register from '@/pages/Register';

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

// // ২. প্রোটেক্টেড রাউট কম্পোনেন্ট
// const ProtectedRoute = ({ children }) => {
//   const { user, loading } = useAuth();
//   if (loading) return null;
//   if (!user) return <Navigate to="/login" replace />;
//   return children;
// };

// const LayoutWrapper = ({ children, currentPageName }) => {
//   return Layout ? <Layout currentPageName={currentPageName}>{children}</Layout> : <>{children}</>;
// };

// const AuthenticatedApp = () => {
//   const { loading } = useAuth();

//   // পাবলিক রাউটগুলোর লিস্ট যা লুপ থেকে বাদ যাবে
//   const publicRoutes = ['landing', 'login', 'register', 'sign'];

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
//       {/* 🔓 ম্যানুয়াল পাবলিক রাউটস */}
//       <Route path="/" element={<Landing />} />
//       <Route path="/login" element={<Login />} />
//       <Route path="/register" element={<Register />} />
//       <Route path="/sign" element={<SignerView />} />

//       {/* 🔒 লুপের মাধ্যমে ডায়নামিক প্রাইভেট রাউটস */}
//       {Object.entries(Pages).map(([path, PageComponent]) => {
//         // যদি পেজটি পাবলিক লিস্টে থাকে, তবে লুপে রেন্ডার করার দরকার নেই
//         if (publicRoutes.includes(path)) return null;

//         return (
//           <Route
//             key={path}
//             path={`/${path}`}
//             element={
//               <ProtectedRoute>
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
//             <AuthenticatedApp />
//           </Router>
//           <Toaster />
//         </QueryClientProvider>
//       </AuthProvider>
//     </ThemeProvider>
//   );
// }
// import React, { createContext, useContext, useEffect, useState } from 'react';
// import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
// import { QueryClientProvider } from '@tanstack/react-query';
// import { queryClientInstance } from '@/lib/query-client';
// import { AuthProvider, useAuth } from '@/lib/AuthContext';
// import { Toaster } from "@/components/ui/toaster";
// import { pagesConfig } from './pages.config';

// // Pages (Manual Imports for special routes)
// import { Landing } from "@/pages/Landing";
// import SignerView from '@/pages/SignerView';
// import PageNotFound from './lib/PageNotFound';
// import Login from '@/pages/Login';
// import Register from '@/pages/Register';

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

// // ২. ফিক্সড প্রোটেক্টেড রাউট (Role-Based)
// const ProtectedRoute = ({ children, requiredRole }) => {
//   const { user, loading } = useAuth();
  
//   if (loading) return null;
//   if (!user) return <Navigate to="/login" replace />;

//   // যদি রাউটটি অ্যাডমিনদের জন্য হয়, তবে check if user is admin OR super_admin
//   if (requiredRole === 'admin') {
//     const hasAccess = user.role === 'admin' || user.role === 'super_admin';
//     if (!hasAccess) {
//       return <Navigate to="/dashboard" replace />;
//     }
//   }

//   return children;
// };

// const LayoutWrapper = ({ children, currentPageName }) => {
//   return Layout ? <Layout currentPageName={currentPageName}>{children}</Layout> : <>{children}</>;
// };

// const AuthenticatedApp = () => {
//   const { loading } = useAuth();
//   const publicRoutes = ['landing', 'login', 'register', 'sign'];

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

//       {Object.entries(Pages).map(([path, PageComponent]) => {
//         if (publicRoutes.includes(path)) return null;

//         // ✅ অটো-ডিটেক্ট অ্যাডমিন রাউট (কি-তে 'admin' থাকলে)
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
//             <AuthenticatedApp />
//           </Router>
//           <Toaster />
//         </QueryClientProvider>
//       </AuthProvider>
//     </ThemeProvider>
//   );
// }
//google ai

import React, { createContext, useContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { Toaster } from "@/components/ui/toaster";
import { pagesConfig } from './pages.config';

// Pages (Manual Imports for special routes)
import { Landing } from "@/pages/Landing";
import SignerView from '@/pages/SignerView';
import PageNotFound from './lib/PageNotFound';
import Login from '@/pages/Login';
import Register from '@/pages/Register';

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

const AuthenticatedApp = () => {
  const { loading } = useAuth();
  const publicRoutes =['landing', 'login', 'register', 'sign'];

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-950">
        <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">NexSign লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/sign" element={<SignerView />} />

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

// 🌟 IMPORTANT: এই এক্সপোর্ট ডিফল্ট অংশটি যেন মিস না হয়!
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}