import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Moon, Sun, Menu, X, LogOut } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import Logo from "@/components/ui/Logo";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("");

  // Theme
  const [isDark, setIsDark] = useState(() => {
    return (
      document.documentElement.classList.contains("dark") ||
      localStorage.getItem("theme") === "dark"
    );
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  // Scroll to section
const scrollToSection = (id) => {
  if (location.pathname !== "/") {
    navigate("/", { state: { scrollTo: id } });

    // wait for navigation then scroll
    setTimeout(() => {
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: "smooth" });
    }, 200);
  } else {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth" });
  }

  setActiveLink(id);
};
  // Update active link
  useEffect(() => {
    const path = location.pathname;

    if (path === "/") {
      if (location.state?.scrollTo) {
        setActiveLink(location.state.scrollTo);
      }
    } else if (path === "/pricing") {
      setActiveLink("pricing");
    } else if (path === "/dashboard") {
      setActiveLink("dashboard");
    } else if (path === "/login") {
      setActiveLink("login");
    } else if (path === "/register") {
      setActiveLink("register");
    } else {
      setActiveLink("");
    }
  }, [location.pathname, location.state]);

  const handleLinkClick = (linkName, route) => {
    setActiveLink(linkName);
    if (route) navigate(route);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Logo />

          {/* Center Links */}
          <div className="hidden md:flex items-center gap-8 font-semibold text-slate-500 dark:text-blue-600">
            <button
              onClick={() => scrollToSection("features")}
              className={`hover:text-sky-500 ${activeLink === "features" ? "text-sky-500 font-bold border-0" : ""}`}
            >
              Features
            </button>

            <button
              onClick={() => scrollToSection("how-it-works")}
              className={`hover:text-sky-500 ${activeLink === "how-it-works" ? "text-sky-500 font-bold" : ""}`}
            >
              How It Works
            </button>

            <Link
              to="/pricing"
              onClick={() => handleLinkClick("pricing", "/pricing")}
              className={`hover:text-sky-500 ${activeLink === "pricing" ? "text-sky-500 font-bold" : ""}`}
            >
              Pricing
            </Link>

            {isAuthenticated && (
              <Link
                to="/dashboard"
                onClick={() => handleLinkClick("dashboard", "/dashboard")}
                className={`hover:text-sky-500 ${activeLink === "dashboard" ? "text-sky-500 font-bold" : ""}`}
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* Right Buttons */}
          <div className="flex items-center gap-3">

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-blue-600" />
              ) : (
                <Moon className="w-5 h-5 text-blue-300" />
              )}
            </button>

            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => handleLinkClick("login", "/login")}
                  className={`px-4 py-2 rounded-lg bg-gray-100 text-blue-600 hover:bg-gray-300 ${activeLink === "login" ? "text-blue-600 font-bold" : ""}`}
                >
                  Sign In
                </button>

                <button
                  onClick={() => handleLinkClick("register", "/register")}
                  className={`px-4 py-2 rounded-lg bg-sky-500 text-white hover:bg-sky-600 ${activeLink === "register" ? "text-blue-600 font-bold" : ""}`}
                >
                  Get Started
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                  setActiveLink(""); // remove active on logout
                }}
                className="p-2 text-slate-500 hover:text-red-500"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}

            {/* mobile menu */}
            <button
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X /> : <Menu />}
            </button>

          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-3">
            <button
              onClick={() => scrollToSection("features")}
              className={`block w-full text-left ${activeLink === "features" ? "text-blue-600 font-bold" : ""}`}
            >
              Features
            </button>

            <button
              onClick={() => scrollToSection("how-it-works")}
              className={`block w-full text-left ${activeLink === "how-it-works" ? "text-blue-600 font-bold" : ""}`}
            >
              How It Works
            </button>

            <Link
              to="/pricing"
              onClick={() => handleLinkClick("pricing", "/pricing")}
              className={`block ${activeLink === "pricing" ? "text-blue-600 font-bold" : ""}`}
            >
              Pricing
            </Link>

            {isAuthenticated && (
              <Link
                to="/dashboard"
                onClick={() => handleLinkClick("dashboard", "/dashboard")}
                className={`block ${activeLink === "dashboard" ? "text-blue-600 font-bold" : ""}`}
              >
                Dashboard
              </Link>
            )}

          </div>
        )}
      </div>
    </nav>
  );
}