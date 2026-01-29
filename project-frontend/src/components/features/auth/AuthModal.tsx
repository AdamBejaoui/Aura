import React, { useState, useEffect, useRef } from 'react';
import { X, Mail, Lock, User, AlertCircle, Eye, EyeOff, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuthStore } from '../../../store/authStore';
import { toast } from 'sonner';

type AuthModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showVerification, setShowVerification] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Form States
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });

    // OTP State
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Resend Timer State
    const [resendTimer, setResendTimer] = useState(0);

    const { login } = useAuthStore();

    // Password Strength
    const getPasswordStrength = (pass: string) => {
        if (!pass) return 0;
        let score = 0;
        if (pass.length > 6) score += 1;
        if (pass.length > 10) score += 1;
        if (/[A-Z]/.test(pass)) score += 1;
        if (/[0-9]/.test(pass)) score += 1;
        if (/[^A-Za-z0-9]/.test(pass)) score += 1;
        return score; // Max 5
    };

    const passwordStrength = getPasswordStrength(formData.password);

    // Body Scroll Lock
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Timer Logic
    useEffect(() => {
        let interval: any;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);


    // Handle OTP Input
    const handleOtpChange = (index: number, value: string) => {
        if (isNaN(Number(value))) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto focus next
        if (value && index < 5) {
            otpInputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace') {
            if (!otp[index] && index > 0) {
                otpInputRefs.current[index - 1]?.focus();
            }
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = [...otp];
        pastedData.split('').forEach((char, i) => {
            if (i < 6) newOtp[i] = char;
        });
        setOtp(newOtp);
        otpInputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    };

    const handleResendCode = async () => {
        if (resendTimer > 0) return;
        try {
            await axios.post('/api/auth/resend-verification', { email: formData.email });
            setResendTimer(30);
            setError(null);
            toast.info('Verification code resent.');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to resend code');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (showVerification) {
                // Verify Email Flow
                const code = otp.join('');
                if (code.length !== 6) {
                    throw new Error("Please enter the complete 6-digit code");
                }

                const response = await axios.post('/api/auth/verify-email', {
                    email: formData.email,
                    code
                });
                const { user, token } = response.data;
                login(user, token);
                toast.success(`Welcome back, ${user.name}!`);
                handleClose();
            } else if (isLogin) {
                // Login Flow
                const response = await axios.post('/api/auth/login', {
                    email: formData.email,
                    password: formData.password
                });
                const { user, token } = response.data;
                login(user, token);
                toast.success(`Welcome back, ${user.name}!`);
                handleClose();
            } else {
                // Signup Flow
                await axios.post('/api/auth/signup', {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                });
                setShowVerification(true);
                setResendTimer(30); // Start timer on first send
                toast.success('Account created! Please verify your email.');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', email: '', password: '' });
        setOtp(['', '', '', '', '', '']);
        setShowVerification(false);
        setIsLogin(true);
        setError(null);
    };

    const handleClose = () => {
        onClose();
        resetForm();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-stone-950/40 backdrop-blur-xl"
                        onClick={handleClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg bg-white dark:bg-neutral-900 rounded-3xl shadow-[0_0_80px_rgba(0,0,0,0.15)] overflow-hidden border border-stone-200 dark:border-neutral-800"
                    >
                        {/* Header Decoration */}
                        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-transparent via-stone-200 dark:via-neutral-700 to-transparent" />

                        <div className="p-10 pb-0 flex flex-col items-center">
                            <div className="w-16 h-16 bg-stone-50 dark:bg-neutral-800 rounded-3xl flex items-center justify-center mb-6 border border-stone-100 dark:border-neutral-700 shadow-sm">
                                <ShieldCheck className="w-8 h-8 text-stone-900 dark:text-white" />
                            </div>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={showVerification ? 'verify' : (isLogin ? 'login' : 'signup')}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                                    className="flex flex-col items-center"
                                >
                                    <h2 className="text-3xl font-black text-stone-900 dark:text-white uppercase tracking-tighter mb-2">
                                        {showVerification ? 'Verification' : (isLogin ? 'Identification' : 'The Assembly')}
                                    </h2>
                                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] text-center max-w-[280px]">
                                        {showVerification
                                            ? `Authenticating access for ${formData.email}`
                                            : (isLogin ? 'Enter your credentials to access the secure archives' : 'Join our high-end community for a curated experience')
                                        }
                                    </p>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Form Content */}
                        <form onSubmit={handleSubmit} className="p-10 space-y-8">
                            <AnimatePresence mode="wait">
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 p-5 rounded-2xl text-[10px] font-black uppercase tracking-tight flex items-center gap-3 border border-rose-100 dark:border-rose-900/20"
                                    >
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={showVerification ? 'verify' : (isLogin ? 'login' : 'signup')}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                                >
                                    {showVerification ? (
                                        <div className="space-y-8">
                                            <div className="flex justify-between gap-3" onPaste={handlePaste}>
                                                {otp.map((digit, index) => (
                                                    <input
                                                        key={index}
                                                        ref={el => otpInputRefs.current[index] = el}
                                                        type="text"
                                                        maxLength={1}
                                                        value={digit}
                                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                                        className="w-full h-16 text-center text-2xl font-black bg-stone-50 dark:bg-neutral-800/50 border border-stone-200 dark:border-neutral-800 rounded-xl focus:ring-4 focus:ring-black/5 dark:focus:ring-white/5 outline-none transition-all dark:text-white"
                                                    />
                                                ))}
                                            </div>

                                            <div className="text-center">
                                                <button
                                                    type="button"
                                                    onClick={handleResendCode}
                                                    disabled={resendTimer > 0}
                                                    className="text-[10px] font-black text-stone-900 dark:text-white uppercase tracking-widest hover:underline disabled:opacity-30 disabled:no-underline"
                                                >
                                                    {resendTimer > 0 ? `Resend Signal in ${resendTimer}s` : "Emit New Signal"}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <AnimatePresence mode="wait">
                                                {!isLogin && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                                        animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                                                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                        className="space-y-2 overflow-hidden"
                                                    >
                                                        <label className="text-[8px] font-black text-stone-400 uppercase tracking-widest ml-1">Archive Identity</label>
                                                        <div className="relative group">
                                                            <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-stone-900 dark:group-focus-within:text-white transition-colors" />
                                                            <input
                                                                type="text"
                                                                required
                                                                placeholder="FULL NAME"
                                                                value={formData.name}
                                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                                className="w-full bg-stone-50 dark:bg-neutral-800/50 border border-stone-200 dark:border-neutral-800 rounded-xl py-4 pl-14 pr-6 text-[10px] font-black uppercase tracking-wider text-black dark:text-white focus:ring-4 focus:ring-black/5 outline-none transition-all placeholder:text-stone-300"
                                                            />
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            <div className="space-y-2">
                                                <label className="text-[8px] font-black text-stone-400 uppercase tracking-widest ml-1">Digital Correspondence</label>
                                                <div className="relative group">
                                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-stone-900 dark:group-focus-within:text-white transition-colors" />
                                                    <input
                                                        type="email"
                                                        required
                                                        placeholder="EMAIL ADDRESS"
                                                        value={formData.email}
                                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                        disabled={showVerification}
                                                        className="w-full bg-stone-50 dark:bg-neutral-800/50 border border-stone-200 dark:border-neutral-800 rounded-xl py-4 pl-14 pr-6 text-[10px] font-black uppercase tracking-wider text-black dark:text-white focus:ring-4 focus:ring-black/5 outline-none transition-all disabled:opacity-50 placeholder:text-stone-300"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[8px] font-black text-stone-400 uppercase tracking-widest ml-1">Security Protocol</label>
                                                <div className="relative group">
                                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-stone-900 dark:group-focus-within:text-white transition-colors" />
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        required
                                                        placeholder="PASS KEY"
                                                        value={formData.password}
                                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                        className="w-full bg-stone-50 dark:bg-neutral-800/50 border border-stone-200 dark:border-neutral-800 rounded-xl py-4 pl-14 pr-14 text-[10px] font-black uppercase tracking-wider text-black dark:text-white focus:ring-4 focus:ring-black/5 outline-none transition-all placeholder:text-stone-300"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-900 dark:hover:text-white transition-colors"
                                                    >
                                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                                <AnimatePresence>
                                                    {!isLogin && formData.password && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                                            animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                                                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                                            className="flex gap-2 h-1 px-1 overflow-hidden"
                                                        >
                                                            {[...Array(5)].map((_, i) => (
                                                                <div key={i} className={`h-full flex-1 rounded-full transition-all duration-500 ${passwordStrength > i ? (passwordStrength > 3 ? 'bg-emerald-400' : 'bg-stone-900 dark:bg-white') : 'bg-stone-100 dark:bg-neutral-800'}`} />
                                                            ))}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>

                            <div className="space-y-6 pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full h-16 rounded-[1.5rem] flex items-center justify-center gap-4 transition-all duration-500 shadow-2xl ${loading
                                        ? "bg-stone-50 dark:bg-neutral-800 text-stone-300 cursor-not-allowed"
                                        : "bg-stone-900 dark:bg-white text-white dark:text-stone-900 hover:scale-[1.02] active:scale-[0.98] group"
                                        }`}
                                    aria-label="Commit Access"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-stone-200 border-t-stone-900 rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <span className="text-[10px] font-black uppercase tracking-[0.4em]">
                                                {showVerification ? 'Commit Access' : (isLogin ? 'Establish Link' : 'Initialize Identity')}
                                            </span>
                                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                        </>
                                    )}
                                </button>

                                {/* Social Login Section */}
                                {!showVerification && (
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="w-full border-t border-stone-100 dark:border-neutral-800"></div>
                                            </div>
                                            <div className="relative flex justify-center text-[8px] font-black uppercase tracking-[0.3em]">
                                                <span className="px-4 bg-white dark:bg-neutral-900 text-stone-400">Or Continue With</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-3">
                                            {/* Google */}
                                            <button
                                                type="button"
                                                onClick={() => window.location.href = `${import.meta.env.VITE_API_BASE || ''}/api/auth/google`}
                                                className="h-14 rounded-xl bg-white dark:bg-neutral-800 border-2 border-stone-100 dark:border-neutral-700 hover:border-black dark:hover:border-white transition-all flex items-center justify-center group"
                                                aria-label="Sign in with Google"
                                            >
                                                <svg className="w-5 h-5 grayscale group-hover:grayscale-0 transition-all" viewBox="0 0 24 24">
                                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                                </svg>
                                            </button>

                                            {/* Facebook */}
                                            <button
                                                type="button"
                                                onClick={() => toast.info('Facebook OAuth setup required')}
                                                className="h-14 rounded-xl bg-white dark:bg-neutral-800 border-2 border-stone-100 dark:border-neutral-700 hover:border-black dark:hover:border-white transition-all flex items-center justify-center group"
                                                aria-label="Sign in with Facebook"
                                            >
                                                <svg className="w-5 h-5 text-stone-400 group-hover:text-black dark:group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                                </svg>
                                            </button>

                                            {/* Apple */}
                                            <button
                                                type="button"
                                                onClick={() => toast.info('Apple OAuth setup required')}
                                                className="h-14 rounded-xl bg-black dark:bg-white hover:bg-stone-800 dark:hover:bg-stone-100 border-2 border-black dark:border-white transition-all flex items-center justify-center group"
                                                aria-label="Sign in with Apple"
                                            >
                                                <svg className="w-5 h-5 text-white dark:text-black" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="text-center">
                                    {!showVerification ? (
                                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                                            {isLogin ? "Lacking entry access? " : "Already authenticated? "}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsLogin(!isLogin);
                                                    setError(null);
                                                }}
                                                className="font-black text-stone-900 dark:text-white hover:underline decoration-2"
                                            >
                                                {isLogin ? 'Apply for Entry' : 'Sign In'}
                                            </button>
                                        </p>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setShowVerification(false)}
                                            className="text-[10px] font-black text-stone-400 uppercase tracking-widest hover:text-stone-900 dark:hover:text-white underline decoration-2 underline-offset-4"
                                        >
                                            Return to Protocol
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>

                        {/* Secure Badge */}
                        <div className="bg-stone-50 dark:bg-neutral-950/50 p-6 flex justify-center items-center gap-3 border-t border-stone-100 dark:border-neutral-800">
                            <Sparkles className="w-3 h-3 text-stone-400" />
                            <span className="text-[8px] font-black text-stone-400 uppercase tracking-[0.3em]">End-to-End Secure Archives</span>
                        </div>

                        {/* Absolute Close Button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-6 right-6 p-3 text-stone-400 hover:text-stone-900 dark:hover:text-white bg-stone-50 dark:bg-neutral-800 rounded-2xl hover:scale-110 hover:rotate-90 active:scale-95 transition-all duration-300 border border-stone-100 dark:border-neutral-700 shadow-sm"
                            aria-label="Close"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AuthModal;
