import React, { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import axios from 'axios';
import Plasma from "./Plasma";

interface AdminLoginProps {
  onLogin: (token: string) => void;
}

const AdminLogin = ({ onLogin }: AdminLoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    const stored = window.localStorage?.getItem('auraTheme');
    if (stored === 'light' || stored === 'dark') return stored;
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  });
  const isDark = theme === 'dark';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });
      localStorage.setItem('adminEmail', email.trim());
      onLogin(response.data.token);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    window.localStorage?.setItem('auraTheme', theme);
  }, [theme, isDark]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center p-4 dark:bg-slate-950 text-gray-900 dark:text-slate-100 transition-colors duration-300">
      {/* Plasma Background - Ensure it fills the container and is behind content */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 pointer-events-none opacity-70 dark:opacity-60">
          <Plasma
            color={isDark ? '#6366f1' : '#3b82f6'} // Blue colors for both modes
            speed={0.5}
            direction="forward"
            scale={1.5}
            opacity={isDark ? 0.5 : 0.25}
            mouseInteractive={false}
          />
        </div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          className="absolute right-0 top-0 flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors duration-200"
          aria-label="Toggle theme"
        >

          {isDark ? (
            <>
              <Sun className="h-4 w-4" />
              
            </>
          ) : (
            <>
              <Moon className="h-4 w-4" />
              
            </>
          )}
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
            Aura
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-2">Admin Portal</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 p-8 transition-all duration-300 hover:shadow-xl">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 text-center mb-6">Welcome Back</h2>

          {error && (
            <div className="mb-5 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-xl text-sm flex items-start">
              <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}


          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none transition"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                  Password
                </label>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none transition"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-700">
            <p className="text-center text-sm text-gray-500 dark:text-slate-400">
              © {new Date().getFullYear()} Aura. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;