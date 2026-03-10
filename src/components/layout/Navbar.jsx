// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { createPageUrl } from '@/utils';
// import { Button } from '@/components/ui/button';
// import { Moon, Sun, Menu, X, FileSignature, LayoutDashboard, Shield, LogOut } from 'lucide-react';
// import { base44 } from '@/api/base44Client';
// import { motion, AnimatePresence } from 'framer-motion';

// export default function Navbar({ currentPageName, theme, toggleTheme }) {
//   const [user, setUser] = useState(null);
//   const [mobileOpen, setMobileOpen] = useState(false);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   useEffect(() => {
//     const loadUser = async () => {
//       const authed = await base44.auth.isAuthenticated();
//       setIsAuthenticated(authed);
//       if (authed) {
//         const u = await base44.auth.me();
//         setUser(u);
//       }
//     };
//     loadUser();
//   }, []);

//   const isLanding = currentPageName === 'Landing';
//   const isSignerView = currentPageName === 'SignerView';

//   if (isSignerView) return null;

//   const navLinks = isAuthenticated ? [
//     { label: 'Dashboard', icon: LayoutDashboard, href: createPageUrl('Dashboard') },
//     ...(user?.role === 'admin' ? [{ label: 'Admin', icon: Shield, href: createPageUrl('AdminDashboard') }] : []),
//   ] : [];

//   return (
//     <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
//       isLanding ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50' 
//                 : 'bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700'
//     }`}>
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex items-center justify-between h-16">
//           <Link to={createPageUrl('Landing')} className="flex items-center gap-2.5 group">
//             <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center shadow-lg shadow-sky-500/25 group-hover:shadow-sky-500/40 transition-shadow">
//               <FileSignature className="w-5 h-5 text-white" />
//             </div>
//             <span className="text-xl font-bold bg-gradient-to-r from-sky-600 to-sky-400 bg-clip-text text-transparent">
//               Nexsign
//             </span>
//           </Link>

//           <div className="hidden md:flex items-center gap-1">
//             {navLinks.map(link => (
//               <Link key={link.label} to={link.href}>
//                 <Button variant="ghost" size="sm" className="gap-2 text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400">
//                   <link.icon className="w-4 h-4" />
//                   {link.label}
//                 </Button>
//               </Link>
//             ))}
//           </div>

//           <div className="flex items-center gap-2">
//             <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-xl text-slate-500 hover:text-sky-600">
//               {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
//             </Button>

//             {isAuthenticated ? (
//               <div className="hidden md:flex items-center gap-2">
//                 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white text-xs font-semibold">
//                   {user?.full_name?.[0]?.toUpperCase() || 'U'}
//                 </div>
//                 <Button variant="ghost" size="icon" onClick={() => base44.auth.logout()} className="text-slate-400 hover:text-red-500">
//                   <LogOut className="w-4 h-4" />
//                 </Button>
//               </div>
//             ) : !isLanding ? (
//               <Button onClick={() => base44.auth.redirectToLogin()} size="sm" className="bg-sky-500 hover:bg-sky-600 text-white rounded-xl">
//                 Sign In
//               </Button>
//             ) : null}

//             <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
//               {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
//             </Button>
//           </div>
//         </div>
//       </div>

//       <AnimatePresence>
//         {mobileOpen && (
//           <motion.div
//             initial={{ height: 0, opacity: 0 }}
//             animate={{ height: 'auto', opacity: 1 }}
//             exit={{ height: 0, opacity: 0 }}
//             className="md:hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden"
//           >
//             <div className="p-4 space-y-2">
//               {navLinks.map(link => (
//                 <Link key={link.label} to={link.href} onClick={() => setMobileOpen(false)}>
//                   <Button variant="ghost" className="w-full justify-start gap-2">
//                     <link.icon className="w-4 h-4" />
//                     {link.label}
//                   </Button>
//                 </Link>
//               ))}
//               {isAuthenticated && (
//                 <Button variant="ghost" onClick={() => base44.auth.logout()} className="w-full justify-start gap-2 text-red-500">
//                   <LogOut className="w-4 h-4" />
//                   Sign Out
//                 </Button>
//               )}
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </nav>
//   );
// }

// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { createPageUrl } from '@/utils';
// import { Button } from '@/components/ui/button';
// import { 
//   Moon, Sun, Menu, X, FileSignature, 
//   LayoutDashboard, Shield, LogOut, Settings 
// } from 'lucide-react'; // এখানে lucide-react হবে
// import { useAuth } from '@/lib/AuthContext'; 
// import { motion, AnimatePresence } from 'framer-motion';

// export default function Navbar({ currentPageName, theme, toggleTheme }) {
//   const navigate = useNavigate();
//   const { user, logout, isAdmin, isSuperAdmin, isAuthenticated } = useAuth();
//   const [mobileOpen, setMobileOpen] = useState(false);

//   const isLanding = currentPageName === 'Landing';
//   const isSignerView = currentPageName === 'SignerView';

//   if (isSignerView) return null;

//   // Navigation Links Logic
//   const navLinks = isAuthenticated ? [
//     { label: 'Dashboard', icon: LayoutDashboard, href: createPageUrl('Dashboard') },
//     ...(isAdmin ? [{ label: 'Admin', icon: Shield, href: createPageUrl('AdminDashboard') }] : []),
//     ...(isSuperAdmin ? [{ label: 'System', icon: Settings, href: '/system-settings' }] : []),
//   ] : [];

//   const handleLogout = () => {
//     logout();
//     navigate('/');
//   };

//   return (
//     <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
//       isLanding ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50' 
//                 : 'bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700'
//     }`}>
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex items-center justify-between h-16">
//           <Link to="/" className="flex items-center gap-2.5 group">
//             <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center shadow-lg shadow-sky-500/25">
//               <FileSignature className="w-5 h-5 text-white" />
//             </div>
//             <span className="text-xl font-bold bg-gradient-to-r from-sky-600 to-sky-400 bg-clip-text text-transparent">
//               Nexsign
//             </span>
//           </Link>

//           {/* Desktop Navigation */}
//           <div className="hidden md:flex items-center gap-1">
//             {navLinks.map(link => (
//               <Link key={link.label} to={link.href}>
//                 <Button variant="ghost" size="sm" className="gap-2 text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400">
//                   <link.icon className="w-4 h-4" />
//                   {link.label}
//                 </Button>
//               </Link>
//             ))}
//           </div>

//           <div className="flex items-center gap-2">
//             <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-xl">
//               {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
//             </Button>

//             {isAuthenticated ? (
//               <div className="flex items-center gap-2">
//                 <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center text-white text-xs font-bold">
//                   {user?.full_name?.[0]?.toUpperCase() || 'U'}
//                 </div>
//                 <Button variant="ghost" size="icon" onClick={handleLogout} className="text-slate-400 hover:text-red-500">
//                   <LogOut className="w-4 h-4" />
//                 </Button>
//               </div>
//             ) : (
//               <Button onClick={() => navigate('/login')} size="sm" className="bg-sky-500 hover:bg-sky-600 text-white rounded-xl px-5">
//                 Sign In
//               </Button>
//             )}

//             <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
//               {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
//             </Button>
//           </div>
//         </div>
//       </div>

//       {/* Mobile Menu */}
//       <AnimatePresence>
//         {mobileOpen && (
//           <motion.div
//             initial={{ height: 0, opacity: 0 }}
//             animate={{ height: 'auto', opacity: 1 }}
//             exit={{ height: 0, opacity: 0 }}
//             className="md:hidden border-t bg-white dark:bg-slate-900 overflow-hidden"
//           >
//             <div className="p-4 space-y-2">
//               {navLinks.map(link => (
//                 <Link key={link.label} to={link.href} onClick={() => setMobileOpen(false)}>
//                   <Button variant="ghost" className="w-full justify-start gap-2">
//                     <link.icon className="w-4 h-4" />
//                     {link.label}
//                   </Button>
//                 </Link>
//               ))}
//               {isAuthenticated && (
//                 <Button variant="ghost" onClick={handleLogout} className="w-full justify-start gap-2 text-red-500">
//                   <LogOut className="w-4 h-4" />
//                   Sign Out
//                 </Button>
//               )}
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </nav>
//   );
// }
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { 
  Moon, Sun, Menu, X, FileSignature, 
  LayoutDashboard, Shield, LogOut, Settings 
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext'; 
// সেকেন্ড ব্র্যাকেট { } সরিয়ে ফেলুন কারণ আপনি default export ব্যবহার করছেন
import Logo from '@/components/ui/Logo';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar({ currentPageName }) {
  const navigate = useNavigate();
  const { user, logout, isAdmin, isSuperAdmin, isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // আলাদা ইম্পোর্ট ছাড়াই সরাসরি থিম স্টেট এবং ইফেক্ট
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const isLanding = currentPageName === 'landing';
  const isSignerView = currentPageName === 'sign';

  if (isSignerView) return null;

  const navLinks = isAuthenticated ? [
    { label: 'Dashboard', icon: LayoutDashboard, href: createPageUrl('dashboard') },
    ...(isAdmin ? [{ label: 'Admin', icon: Shield, href: createPageUrl('admin') }] : []),
  ] : [];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isLanding 
        ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50' 
        : 'bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 group"> 
            {/* <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center shadow-lg shadow-sky-500/25">
              <FileSignature className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-sky-600 to-sky-400 bg-clip-text text-transparent">
              Nexsign
            </span> */}
<Logo></Logo>

          </Link> 




          <div className="flex items-center gap-2">
            {/* থিম টগল বাটন */}
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-xl">
              {isDark ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-slate-600 dark:text-slate-300" />}
            </Button>

            {!isAuthenticated ? (
              <Button onClick={() => navigate('/login')} size="sm" className="bg-sky-500 hover:bg-sky-600 text-white rounded-xl px-5">
                Sign In
              </Button>
            ) : (
              <Button variant="ghost" size="icon" onClick={() => { logout(); navigate('/'); }} className="text-slate-400 hover:text-red-500">
                <LogOut className="w-4 h-4" />
              </Button>
            )}

            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t bg-white dark:bg-slate-900"
          >
            <div className="p-4 space-y-2">
              {navLinks.map(link => (
                <Link key={link.label} to={link.href} onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-2">
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </Button>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}