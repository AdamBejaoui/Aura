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
                        className="relative w-full max-w-lg bg-white dark:bg-neutral-900 rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.15)] overflow-hidden border border-stone-100 dark:border-neutral-800"
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
                                                        className="w-full h-16 text-center text-2xl font-black bg-stone-50 dark:bg-neutral-800/50 border border-stone-100 dark:border-neutral-800 rounded-[1.25rem] focus:ring-4 focus:ring-stone-900/5 dark:focus:ring-white/5 outline-none transition-all dark:text-white"
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
                                                                className="w-full bg-stone-50 dark:bg-neutral-800/50 border border-stone-100 dark:border-neutral-800 rounded-2xl py-4 pl-14 pr-6 text-[10px] font-black uppercase tracking-wider text-stone-900 dark:text-white focus:ring-4 focus:ring-stone-900/5 outline-none transition-all placeholder:text-stone-300"
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
                                                        className="w-full bg-stone-50 dark:bg-neutral-800/50 border border-stone-100 dark:border-neutral-800 rounded-2xl py-4 pl-14 pr-6 text-[10px] font-black uppercase tracking-wider text-stone-900 dark:text-white focus:ring-4 focus:ring-stone-900/5 outline-none transition-all disabled:opacity-50 placeholder:text-stone-300"
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
                                                        className="w-full bg-stone-50 dark:bg-neutral-800/50 border border-stone-100 dark:border-neutral-800 rounded-2xl py-4 pl-14 pr-14 text-[10px] font-black uppercase tracking-wider text-stone-900 dark:text-white focus:ring-4 focus:ring-stone-900/5 outline-none transition-all placeholder:text-stone-300"
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
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                                                {showVerification ? 'Commit Access' : (isLogin ? 'Establish Link' : 'Initialize Identity')}
                                            </span>
                                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                        </>
                                    )}
                                </button>

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
