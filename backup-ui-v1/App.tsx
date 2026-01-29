import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import axios from "axios";
import { useAuthStore } from "./store/authStore";
import { useThemeStore } from "./store/themeStore";
import { lazy, Suspense } from 'react';
import { motion, useScroll, useTransform } from "framer-motion";
import Navbar from "./components/layout/Navbar";
import MobileNav from "./components/layout/MobileNav";
import LoadingScreen from "./components/common/LoadingScreen";

// Lazy Load Pages
const Home = lazy(() => import("./pages/Home"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const VerifyEmail = lazy(() => import("./components/features/auth/VerifyEmail"));

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <>
      <Navbar />
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-black dark:bg-white z-[50] origin-left"
        style={{ scaleX }}
      />
      {children}
      <MobileNav />
    </>
  );
};

const AppContent = () => {
  const { user, token: authToken, isAuthenticated, logout: authLogout } = useAuthStore();
  const navigate = useNavigate();
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    return token;
  });

  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  // Handle OAuth callback (Google login redirect)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userStr = params.get('user');
    const error = params.get('error');

    if (error) {
      toast.error('Authentication failed. Please try again.');
      window.history.replaceState({}, '', '/');
      return;
    }

    if (token) {
      try {
        const { login, checkAuth } = useAuthStore.getState();

        if (userStr) {
          const userData = JSON.parse(decodeURIComponent(userStr));
          login(userData, token);
          toast.success(`Welcome, ${userData.name}!`);
        } else {
          // If no user data in URL, just login with token and fetch user
          login({ id: '', name: '', email: '', role: 'customer' } as any, token);
          checkAuth().then(() => {
            const updatedUser = useAuthStore.getState().user;
            if (updatedUser) toast.success(`Welcome, ${updatedUser.name}!`);
          });
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
        toast.error('Login failed. Please try again.');
      } finally {
        window.history.replaceState({}, '', '/');
      }
    }
  }, []);

  // Sync authStore token with adminToken when admin user is logged in
  useEffect(() => {
    if (isAuthenticated && (user?.role === 'admin' || user?.role === 'co-admin') && authToken && authToken !== adminToken) {
      // Admin/co-admin user logged in through regular auth, sync the token
      setAdminToken(authToken);
      localStorage.setItem("adminToken", authToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;
    }
  }, [isAuthenticated, user, authToken, adminToken]);

  const handleAdminLogout = () => {
    // Clear both admin token and regular auth
    setAdminToken(null);
    localStorage.removeItem("adminToken");
    authLogout(); // Also logout from authStore
    delete axios.defaults.headers.common["Authorization"];
  };

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          className: 'toast-custom',
          style: {
            background: 'var(--toast-bg)',
            color: 'var(--toast-color)',
            border: '1px solid var(--toast-border)',
          },
        }}
        className="lg:!top-4 !bottom-24 lg:!bottom-auto"
        richColors
      />
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<MainLayout><Home /></MainLayout>} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route
            path="/admin"
            element={
              adminToken && (user?.role === 'admin' || user?.role === 'co-admin') ? (
                <AdminDashboard
                  token={adminToken}
                  onLogout={() => {
                    handleAdminLogout();
                    toast.success('Logged out successfully');
                    navigate('/');
                  }}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
