import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Moon, Sun, Menu, X, LogOut } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import Logo from "@/components/ui/Logo";

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // theme
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

  // scroll function
  const scrollToSection = (id) => {
    if (window.location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById(id);
        el?.scrollIntoView({ behavior: "smooth" });
      }, 200);
    } else {
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: "smooth" });
    }
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
              className="hover:text-sky-500"
            >
              Features
            </button>

            <button
              onClick={() => scrollToSection("how-it-works")}
              className="hover:text-sky-500"
            >
              How It Works
            </button>

            <Link to="/pricing" className="hover:text-sky-500">
              Pricing
            </Link>

            {isAuthenticated && (
              <Link to="/dashboard" className="hover:text-sky-500">
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
                  onClick={() => navigate("/login")}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-blue-600 hover:bg-gray-300"
                >
                  Sign In
                </button>

                <button
                  onClick={() => navigate("/register")}
                  className="px-4 py-2 rounded-lg bg-sky-500 text-white hover:bg-sky-600"
                >
                  Get Started
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  logout();
                  navigate("/");
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
              className="block w-full text-left"
            >
              Features
            </button>

            <button
              onClick={() => scrollToSection("howitworks")}
              className="block w-full text-left"
            >
              How It Works
            </button>

            <Link to="/pricing" className="block">
              Pricing
            </Link>

            {isAuthenticated && (
              <Link to="/dashboard" className="block">
                Dashboard
              </Link>
            )}

          </div>
        )}

      </div>
    </nav>
  );
}