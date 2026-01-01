import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import axios from "axios";
import { useAuthStore } from "./store/authStore";
import { useThemeStore } from "./store/themeStore";
import Home from "./pages/Home";
import VerifyEmail from "./components/features/auth/VerifyEmail";
import AdminDashboard from "./pages/admin/Dashboard";
import MobileNav from "./components/layout/MobileNav";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
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
      <Toaster position="top-center" richColors />
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
