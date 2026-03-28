// import React, { useState, useEffect } from "react";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import { Moon, Sun, Menu, X, LogOut, LayoutDashboard, ShieldCheck, LayoutTemplate } from "lucide-react";
// import { useAuth } from "@/lib/AuthContext";
// import Logo from "@/components/ui/Logo";

// export default function Navbar() {
//   const navigate = useNavigate();
//   const location = useLocation();
// const { isAuthenticated, user, logout } = useAuth();
// const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
//   const [mobileOpen, setMobileOpen] = useState(false);
//   const [activeLink, setActiveLink] = useState("");

//   // Theme
//   const [isDark, setIsDark] = useState(() => {
//     return (
//       document.documentElement.classList.contains("dark") ||
//       localStorage.getItem("theme") === "dark"
//     );
//   });

//   useEffect(() => {
//     if (isDark) {
//       document.documentElement.classList.add("dark");
//       localStorage.setItem("theme", "dark");
//     } else {
//       document.documentElement.classList.remove("dark");
//       localStorage.setItem("theme", "light");
//     }
//   }, [isDark]);

//   const toggleTheme = () => setIsDark(!isDark);

//   // Scroll to section
// const scrollToSection = (id) => {
//   if (location.pathname !== "/") {
//     navigate("/", { state: { scrollTo: id } });

//     // wait for navigation then scroll
//     setTimeout(() => {
//       const el = document.getElementById(id);
//       el?.scrollIntoView({ behavior: "smooth" });
//     }, 200);
//   } else {
//     const el = document.getElementById(id);
//     el?.scrollIntoView({ behavior: "smooth" });
//   }

//   setActiveLink(id);
// };
//   // Update active link
//   useEffect(() => {
//     const path = location.pathname;

//     if (path === "/") {
//       if (location.state?.scrollTo) {
//         setActiveLink(location.state.scrollTo);
//       }
//     } else if (path === "/pricing") {
//       setActiveLink("pricing");
//     } else if (path === "/dashboard") {
//       setActiveLink("dashboard");
//     } else if (path === "/templates") {
//       setActiveLink("templates");
//     } else if (path === "/login") {
//       setActiveLink("login");
//     } else if (path === "/register") {
//       setActiveLink("register");
//     } else {
//       setActiveLink("");
//     }
//   }, [location.pathname, location.state]);

//   const handleLinkClick = (linkName, route) => {
//     setActiveLink(linkName);
//     if (route) navigate(route);
//   };

//   return (
//     <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
//       <div className="max-w-7xl mx-auto px-4">
//         <div className="flex items-center justify-between h-16">

//           {/* Logo */}
//           <Logo />

//           {/* Center Links */}
//           <div className="hidden md:flex items-center gap-8 font-semibold text-slate-500 dark:text-blue-600">
//             <button
//               onClick={() => scrollToSection("features")}
//               className={`hover:text-sky-500 ${activeLink === "features" ? "text-sky-500 font-bold border-0" : ""}`}
//             >
//               Features
//             </button>

//             <button
//               onClick={() => scrollToSection("how-it-works")}
//               className={`hover:text-sky-500 ${activeLink === "how-it-works" ? "text-sky-500 font-bold" : ""}`}
//             >
//               How It Works
//             </button>

//             <Link
//               to="/pricing"
//               onClick={() => handleLinkClick("pricing", "/pricing")}
//               className={`hover:text-sky-500 ${activeLink === "pricing" ? "text-sky-500 font-bold" : ""}`}
//             >
//               Pricing
//             </Link>

//             {/* {isAuthenticated && (
//               <Link
//                 to="/dashboard"
//                 onClick={() => handleLinkClick("dashboard", "/dashboard")}
//                 className={`hover:text-sky-500 ${activeLink === "dashboard" ? "text-sky-500 font-bold" : ""}`}
//               >
//                 Dashboard
//               </Link>
//             )} */}


//             {isAuthenticated && (
//               isAdmin ? (
//                 <Link
//                   to="/admin"
//                   onClick={() => handleLinkClick("admin", "/admin")}
//                   className={`flex items-center gap-1 hover:text-rose-700 text-rose-600 ${activeLink === "admin" ? "" : ""}`}
//                 >
//                   <ShieldCheck size={18}/> Admin Panel
//                 </Link>
//               ) : (
//                 <>
//                   <Link
//                     to="/dashboard"
//                     onClick={() => handleLinkClick("dashboard", "/dashboard")}
//                     className={`flex items-center gap-1 hover:text-sky-500 ${activeLink === "dashboard" ? "text-sky-500 font-bold" : ""}`}
//                   >
//                     <LayoutDashboard size={18}/> Dashboard
//                   </Link>
//                   <Link
//                     to="/templates"
//                     onClick={() => handleLinkClick("templates", "/templates")}
//                     className={`flex items-center gap-1 hover:text-sky-500 ${activeLink === "templates" ? "text-sky-500 font-bold" : ""}`}
//                   >
//                     <LayoutTemplate size={18}/> Templates
//                   </Link>
//                 </>
//               )
//             )}
//           </div>

//           {/* Right Buttons */}
//           <div className="flex items-center gap-3">

//             {/* Theme toggle */}
//             <button
//               onClick={toggleTheme}
//               className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
//             >
//               {isDark ? (
//                 <Sun className="w-5 h-5 text-blue-600" />
//               ) : (
//                 <Moon className="w-5 h-5 text-blue-300" />
//               )}
//             </button>

//             {!isAuthenticated ? (
//               <>
//                 <button
//                   onClick={() => handleLinkClick("login", "/login")}
//                   className={`px-2 py-1 sm:px-2 sm:py-1 md:px-4 md:py-2 text-xs md:text-sm rounded-lg font-bold border text-sky-400 hover:text-[#2AAAE0]`}
//                 >
//                   Sign In
//                 </button>

//                 <button
//                   onClick={() => handleLinkClick("register", "/register")}
//                   className={`px-2 py-1 sm:px-4 md:px-4 md:py-2 text-xs md:text-sm rounded-lg bg-sky-500 text-white font-bold hover:bg-sky-600 `}
//                 >
//                   Get Started
//                 </button>
//               </>
//             ) : (
//               <button
//                 onClick={() => {
//                   logout();
//                   navigate("/");
//                   setActiveLink(""); // remove active on logout
//                 }}
//                 className="p-2 text-slate-500 hover:text-red-500"
//               >
//                 <LogOut className="w-5 h-5" />
//               </button>
//             )}

//             {/* mobile menu */}
//             <button
//               className="md:hidden"
//               onClick={() => setMobileOpen(!mobileOpen)}
//             >
//               {mobileOpen ? <X /> : <Menu />}
//             </button>

//           </div>
//         </div>

//         {/* Mobile menu */}
//         {mobileOpen && (
//           <div className="md:hidden pb-4 space-y-3">
//             <button
//               onClick={() => scrollToSection("features")}
//               className={`block w-full text-left ${activeLink === "features" ? "text-blue-600 font-bold" : ""}`}
//             >
//               Features
//             </button>

//             <button
//               onClick={() => scrollToSection("how-it-works")}
//               className={`block w-full text-left ${activeLink === "how-it-works" ? "text-blue-600 font-bold" : ""}`}
//             >
//               How It Works
//             </button>

//             <Link
//               to="/pricing"
//               onClick={() => handleLinkClick("pricing", "/pricing")}
//               className={`block ${activeLink === "pricing" ? "text-blue-600 font-bold" : ""}`}
//             >
//               Pricing
//             </Link>

//             {/* {isAuthenticated && (
//               <Link
//                 to="/dashboard"
//                 onClick={() => handleLinkClick("dashboard", "/dashboard")}
//                 className={`block ${activeLink === "dashboard" ? "text-blue-600 font-bold" : ""}`}
//               >
//                 Dashboard
//               </Link>
//             )} */}
// {isAuthenticated && (
//               isAdmin ? (
//                 <Link
//                   to="/admin"
//                   onClick={() => handleLinkClick("admin", "/admin")}
//                   className={`block text-rose-600 font-black ${activeLink === "admin" ? "underline" : ""}`}
//                 >
//                   Admin Panel
//                 </Link>
//               ) : (
//                 <>
//                   <Link
//                     to="/dashboard"
//                     onClick={() => handleLinkClick("dashboard", "/dashboard")}
//                     className={`block ${activeLink === "dashboard" ? "text-blue-600 font-bold" : ""}`}
//                   >
//                     Dashboard
//                   </Link>
//                   <Link
//                     to="/templates"
//                     onClick={() => handleLinkClick("templates", "/templates")}
//                     className={`block ${activeLink === "templates" ? "text-blue-600 font-bold" : ""}`}
//                   >
//                     Templates
//                   </Link>
//                 </>
//               )
//             )}
//           </div>
//         )}
//       </div>
//     </nav>
//   );
// }



import React, {
  useState, useEffect, useCallback, useRef,
} from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Moon, Sun, Menu, X, LogOut,
  LayoutDashboard, ShieldCheck, LayoutTemplate,
  ChevronDown, User, Settings,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

// ── Logo ──────────────────────────────────────────────────────────
function Logo() {
  return (
    <Link
      to="/"
      className="flex items-center gap-2 shrink-0 group"
    >
      <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-sky-600
                      rounded-lg flex items-center justify-center
                      shadow-lg shadow-sky-500/30
                      group-hover:scale-105 transition-transform">
        <svg
          className="w-4 h-4 text-white"
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M15.232 5.232l3.536 3.536M9 11l6.5-6.5a2.121 2.121 0 013 3L12 14H9v-3z" />
        </svg>
      </div>
      <span className="font-extrabold text-xl text-slate-900
                       dark:text-white tracking-tight">
        NeX<span className="text-sky-500">sign</span>
      </span>
    </Link>
  );
}

// ── User Avatar dropdown ──────────────────────────────────────────
function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 rounded-xl
                   px-2.5 py-1.5
                   hover:bg-slate-100 dark:hover:bg-slate-800
                   transition-colors"
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br
                        from-sky-400 to-sky-600
                        flex items-center justify-center
                        text-white text-sm font-bold shrink-0">
          {initials}
        </div>
        <span className="hidden sm:block text-sm font-semibold
                         text-slate-700 dark:text-slate-300 max-w-[100px] truncate">
          {user?.full_name?.split(' ')[0]}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400
                                 transition-transform duration-200
                                 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2
                        bg-white dark:bg-slate-900
                        border border-slate-200 dark:border-slate-700
                        rounded-2xl shadow-2xl min-w-[200px]
                        overflow-hidden z-50
                        animate-in fade-in zoom-in-95 duration-150">

          {/* User info */}
          <div className="px-4 py-3 border-b border-slate-100
                          dark:border-slate-800">
            <p className="font-bold text-sm text-slate-900 dark:text-white">
              {user?.full_name}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {user?.email}
            </p>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <Link
              to="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5
                         text-sm text-slate-700 dark:text-slate-300
                         hover:bg-slate-50 dark:hover:bg-slate-800
                         transition-colors font-medium"
            >
              <LayoutDashboard className="w-4 h-4 text-slate-400" />
              Dashboard
            </Link>

            <button
              onClick={() => { setOpen(false); onLogout(); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5
                         text-sm text-red-500
                         hover:bg-red-50 dark:hover:bg-red-900/20
                         transition-colors font-medium"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// MAIN NAVBAR
// ════════════════════════════════════════════════════════════════
export default function Navbar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled,   setScrolled]   = useState(false);

  // ── Dark mode ──────────────────────────────────────────────
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark') ||
    localStorage.getItem('theme') === 'dark'
  );

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // ── Scroll shadow ──────────────────────────────────────────
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // ── Close mobile menu on route change ─────────────────────
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // ── Scroll to section ──────────────────────────────────────
  const scrollToSection = useCallback((id) => {
    setMobileOpen(false);
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: id } });
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 250);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location.pathname, navigate]);

  // ── Handle scroll-to from state ───────────────────────────
  useEffect(() => {
    if (location.state?.scrollTo) {
      setTimeout(() => {
        document.getElementById(location.state.scrollTo)
          ?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [location.state]);

  // ── Is active path ─────────────────────────────────────────
  const isActive = useCallback((path) =>
    location.pathname === path
  , [location.pathname]);

  // ── Logout ─────────────────────────────────────────────────
  const handleLogout = useCallback(async () => {
    await logout({ redirect: false, showToast: true });
    navigate('/', { replace: true });
  }, [logout, navigate]);

  // ── Nav link class ─────────────────────────────────────────
  const navLinkClass = (active) =>
    `text-sm font-semibold transition-colors duration-150
     ${active
       ? 'text-sky-500'
       : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
     }`;

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50
                       transition-all duration-300
                       ${scrolled
                         ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-sm border-b border-slate-200/80 dark:border-slate-800/80'
                         : 'bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800'
                       }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-4">

            {/* Logo */}
            <Logo />

            {/* ── Desktop Nav Links ──────────────────────────── */}
            <div className="hidden md:flex items-center gap-1">
              <button
                onClick={() => scrollToSection('features')}
                className={`px-3 py-2 rounded-xl ${navLinkClass(false)}`}
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className={`px-3 py-2 rounded-xl ${navLinkClass(false)}`}
              >
                How It Works
              </button>
              <Link
                to="/pricing"
                className={`px-3 py-2 rounded-xl ${navLinkClass(isActive('/pricing'))}`}
              >
                Pricing
              </Link>

              {/* Authenticated links */}
              {isAuthenticated && (
                isAdmin ? (
                  <Link
                    to="/admin"
                    className={`px-3 py-2 rounded-xl flex items-center gap-1.5
                                text-sm font-semibold transition-colors
                                text-rose-600 hover:text-rose-700
                                hover:bg-rose-50 dark:hover:bg-rose-900/20
                                ${isActive('/admin') ? 'bg-rose-50 dark:bg-rose-900/20' : ''}`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Admin Panel
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/dashboard"
                      className={`px-3 py-2 rounded-xl flex items-center gap-1.5
                                  ${navLinkClass(isActive('/dashboard'))}
                                  ${isActive('/dashboard')
                                    ? 'bg-sky-50 dark:bg-sky-900/20'
                                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                                  }`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <Link
                      to="/templates"
                      className={`px-3 py-2 rounded-xl flex items-center gap-1.5
                                  ${navLinkClass(isActive('/templates'))}
                                  ${isActive('/templates')
                                    ? 'bg-sky-50 dark:bg-sky-900/20'
                                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                                  }`}
                    >
                      <LayoutTemplate className="w-4 h-4" />
                      Templates
                                        </Link>
                  </>
                )
              )}
            </div>

            {/* ── Right Side ──────────────────────────────────── */}
            <div className="flex items-center gap-2 shrink-0">

              {/* Theme Toggle */}
              <button
                onClick={() => setIsDark(d => !d)}
                className="w-9 h-9 rounded-xl flex items-center
                           justify-center text-slate-500
                           hover:bg-slate-100 dark:hover:bg-slate-800
                           transition-colors"
                title={isDark ? 'Light mode' : 'Dark mode'}
              >
                {isDark
                  ? <Sun  className="w-4 h-4 text-amber-400" />
                  : <Moon className="w-4 h-4 text-slate-500" />
                }
              </button>

              {/* Auth Buttons */}
              {!isAuthenticated ? (
                <div className="hidden md:flex items-center gap-2">
                  <Link to="/login">
                    <button className="px-4 py-2 text-sm font-semibold
                                       text-sky-500 hover:text-sky-600
                                       rounded-xl hover:bg-sky-50
                                       dark:hover:bg-sky-900/20
                                       transition-colors">
                      Sign In
                    </button>
                  </Link>
                  <Link to="/register">
                    <button className="px-4 py-2 text-sm font-semibold
                                       bg-sky-500 hover:bg-sky-600
                                       active:bg-sky-700
                                       text-white rounded-xl
                                       shadow-lg shadow-sky-500/25
                                       transition-all active:scale-95">
                      Get Started
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="hidden md:block">
                  <UserMenu user={user} onLogout={handleLogout} />
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileOpen(o => !o)}
                className="md:hidden w-9 h-9 rounded-xl
                           flex items-center justify-center
                           text-slate-500 hover:bg-slate-100
                           dark:hover:bg-slate-800 transition-colors"
              >
                {mobileOpen
                  ? <X    className="w-5 h-5" />
                  : <Menu className="w-5 h-5" />
                }
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Menu ─────────────────────────────────────── */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-200
                          dark:border-slate-800 bg-white
                          dark:bg-slate-900
                          animate-in slide-in-from-top-2 duration-200">
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">

              {/* Nav links */}
              <button
                onClick={() => scrollToSection('features')}
                className="w-full flex items-center gap-3 px-4 py-3
                           text-sm font-semibold text-slate-600
                           dark:text-slate-400 rounded-xl
                           hover:bg-slate-50 dark:hover:bg-slate-800
                           transition-colors text-left"
              >
                Features
              </button>

              <button
                onClick={() => scrollToSection('how-it-works')}
                className="w-full flex items-center gap-3 px-4 py-3
                           text-sm font-semibold text-slate-600
                           dark:text-slate-400 rounded-xl
                           hover:bg-slate-50 dark:hover:bg-slate-800
                           transition-colors text-left"
              >
                How It Works
              </button>

              <Link
                to="/pricing"
                className={`flex items-center gap-3 px-4 py-3
                            text-sm font-semibold rounded-xl
                            hover:bg-slate-50 dark:hover:bg-slate-800
                            transition-colors
                            ${isActive('/pricing')
                              ? 'text-sky-500 bg-sky-50 dark:bg-sky-900/20'
                              : 'text-slate-600 dark:text-slate-400'
                            }`}
              >
                Pricing
              </Link>

              {/* Authenticated mobile links */}
              {isAuthenticated && (
                <>
                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />

                  {isAdmin ? (
                    <Link
                      to="/admin"
                      className={`flex items-center gap-3 px-4 py-3
                                  text-sm font-semibold rounded-xl
                                  text-rose-600 hover:bg-rose-50
                                  dark:hover:bg-rose-900/20 transition-colors
                                  ${isActive('/admin') ? 'bg-rose-50 dark:bg-rose-900/20' : ''}`}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Admin Panel
                    </Link>
                  ) : (
                    <>
                      <Link
                        to="/dashboard"
                        className={`flex items-center gap-3 px-4 py-3
                                    text-sm font-semibold rounded-xl
                                    hover:bg-slate-50 dark:hover:bg-slate-800
                                    transition-colors
                                    ${isActive('/dashboard')
                                      ? 'text-sky-500 bg-sky-50 dark:bg-sky-900/20'
                                      : 'text-slate-600 dark:text-slate-400'
                                    }`}
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>

                      <Link
                        to="/templates"
                        className={`flex items-center gap-3 px-4 py-3
                                    text-sm font-semibold rounded-xl
                                    hover:bg-slate-50 dark:hover:bg-slate-800
                                    transition-colors
                                    ${isActive('/templates')
                                      ? 'text-sky-500 bg-sky-50 dark:bg-sky-900/20'
                                      : 'text-slate-600 dark:text-slate-400'
                                    }`}
                      >
                        <LayoutTemplate className="w-4 h-4" />
                        Templates
                      </Link>
                    </>
                  )}
                </>
              )}

              {/* Mobile Auth */}
              <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />

              {!isAuthenticated ? (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link to="/login">
                    <button className="w-full px-4 py-2.5 text-sm
                                       font-semibold rounded-xl
                                       border border-slate-200
                                       dark:border-slate-700
                                       text-slate-700 dark:text-slate-300
                                       hover:bg-slate-50
                                       dark:hover:bg-slate-800
                                       transition-colors">
                      Sign In
                    </button>
                  </Link>
                  <Link to="/register">
                    <button className="w-full px-4 py-2.5 text-sm
                                       font-semibold rounded-xl
                                       bg-sky-500 hover:bg-sky-600
                                       text-white shadow-lg
                                       shadow-sky-500/25
                                       transition-all active:scale-95">
                      Get Started
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-1">
                  {/* User info */}
                  <div className="flex items-center gap-3 px-4 py-3
                                  bg-slate-50 dark:bg-slate-800
                                  rounded-xl">
                    <div className="w-9 h-9 rounded-full
                                    bg-gradient-to-br from-sky-400 to-sky-600
                                    flex items-center justify-center
                                    text-white text-sm font-bold shrink-0">
                      {user?.full_name
                        ?.split(' ')
                        .map(n => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase() || '?'
                      }
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm
                                    text-slate-900 dark:text-white truncate">
                        {user?.full_name}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3
                               text-sm font-semibold text-red-500
                               hover:bg-red-50 dark:hover:bg-red-900/20
                               rounded-xl transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Spacer — navbar height */}
      <div className="h-16" />
    </>
  );
}