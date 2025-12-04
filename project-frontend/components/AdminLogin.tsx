import React, { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import axios from "axios";
import Plasma from "./Plasma";

interface AdminLoginProps {
  onLogin: (token: string) => void;
}

const AdminLogin = ({ onLogin }: AdminLoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    const stored = window.localStorage?.getItem("auraTheme");
    if (stored === "light" || stored === "dark") return stored;
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  });
  const isDark = theme === "dark";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("/api/auth/login", {
        email,
        password,
      });
      localStorage.setItem("adminEmail", email.trim());
      onLogin(response.data.token);
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    window.localStorage?.setItem("auraTheme", theme);
  }, [theme, isDark]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center p-4 dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
      {/* Plasma Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-70 dark:opacity-40">
        <Plasma
          color={isDark ? "#ffffff" : "#1c1917"}
          speed={0.5}
          direction="forward"
          scale={1.5}
          opacity={isDark ? 0.2 : 0.15}
          mouseInteractive={false}
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          className="absolute right-0 top-0 flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors duration-200"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Header: Star + Aura + Subtitle */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2">
            {/* Glowing ✦ Star */}
            <div className="relative w-4 h-4 
              bg-stone-900 dark:bg-white
              [clip-path:polygon(50%_0%,70%_30%,100%_50%,70%_70%,50%_100%,30%_70%,0%_50%,30%_30%)]
              before:content-[''] before:absolute before:inset-0
              before:bg-stone-900 dark:before:bg-white before:blur-md before:opacity-60 animate-pulse">
            </div>

            {/* Aura Text */}
            <span className="text-xl font-bold text-stone-900 dark:text-white">
              Aura admin
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg border border-gray-100 dark:border-neutral-800 p-8 transition-all duration-300 hover:shadow-xl">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-6">
            Welcome Back
          </h2>

          {error && (
            <div className="mb-5 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-xl text-sm flex items-start">
              <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-neutral-800 bg-white dark:bg-black text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-stone-500/20 focus:border-stone-500 outline-none transition"
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-neutral-800 bg-white dark:bg-black text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-stone-500/20 focus:border-stone-500 outline-none transition"
                required
                autoComplete="current-password"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-stone-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black font-medium py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-neutral-800">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} Aura. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
