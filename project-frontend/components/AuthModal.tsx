import React, { useState } from 'react';
import { X, Mail, Lock, User, Check, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

type AuthModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });

    const { login } = useAuthStore();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
            const payload = isLogin
                ? { email: formData.email, password: formData.password }
                : formData;

            const response = await axios.post(endpoint, payload);
            const { user, token } = response.data;

            login(user, token);
            onClose();
            // Reset form
            setFormData({ name: '', email: '', password: '' });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden transform transition-all animate-in fade-in scale-95 duration-200">

                {/* Header */}
                <div className="p-8 pb-0 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {isLogin ? 'Welcome Back' : 'Join Aura'}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                        {isLogin
                            ? 'Enter your details to access your account'
                            : 'Create an account to unlock exclusive features'}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-4">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-500 p-3 rounded-lg text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    {!isLogin && (
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    required
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl py-3 pl-10 pr-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-stone-900 dark:focus:ring-white outline-none transition-all"
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                required
                                placeholder="hello@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl py-3 pl-10 pr-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-stone-900 dark:focus:ring-white outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="password"
                                required
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl py-3 pl-10 pr-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-stone-900 dark:focus:ring-white outline-none transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-stone-900 dark:bg-white text-white dark:text-black font-bold rounded-xl py-3.5 mt-4 hover:shadow-lg hover:shadow-stone-900/20 dark:hover:shadow-white/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            isLogin ? 'Sign In' : 'Create Account'
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className="p-6 pt-0 text-center">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError(null);
                            }}
                            className="font-bold text-stone-900 dark:text-white hover:underline"
                        >
                            {isLogin ? 'Sign up' : 'Log in'}
                        </button>
                    </p>
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-full transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default AuthModal;
