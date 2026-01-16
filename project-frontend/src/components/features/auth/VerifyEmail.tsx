import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../../../store/authStore';
import Plasma from '../../ui/Plasma';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const login = useAuthStore(state => state.login);
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [message, setMessage] = useState('Verifying your email...');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('No verification token found.');
            return;
        }

        const verify = async () => {
            try {
                const response = await axios.post(`${import.meta.env.VITE_API_BASE || ''}/api/auth/verify-email`, { token });
                login(response.data.user, response.data.token);
                setStatus('success');
                setMessage('Email verified successfully! Redirecting...');
                setTimeout(() => navigate('/'), 2000);
            } catch (err: any) {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Verification failed. Link may be invalid or expired.');
            }
        };

        verify();
    }, [token, login, navigate]);

    return (
        <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex items-center justify-center relative overflow-hidden font-inter">
            <div className="absolute inset-0 opacity-10 dark:opacity-30">
                <Plasma color={typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? "#ffffff" : "#000000"} />
            </div>

            <div className="bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 p-10 md:p-12 rounded-3xl max-w-md w-full text-center relative z-10 shadow-premium">
                {status === 'verifying' && (
                    <div className="flex flex-col items-center gap-6">
                        <div className="w-12 h-12 border-2 border-stone-200 dark:border-stone-800 border-t-black dark:border-t-white rounded-full animate-spin"></div>
                        <h2 className="text-xl font-black uppercase tracking-tighter">Verifying Sequence</h2>
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-700">
                        <div className="w-20 h-20 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center mb-2 shadow-premium">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <h2 className="text-3xl font-black text-black dark:text-white uppercase tracking-tighter">Verified</h2>
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest leading-relaxed px-6">{message}</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-700">
                        <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/10 text-rose-500 rounded-full flex items-center justify-center mb-2 border border-rose-100 dark:border-rose-900/20">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </div>
                        <h2 className="text-2xl font-black text-black dark:text-white uppercase tracking-tighter">Verification Failed</h2>
                        <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest leading-relaxed px-6">{message}</p>
                        <button
                            onClick={() => navigate('/')}
                            className="mt-6 px-10 py-4 bg-black dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-[0.3em] rounded-xl hover:scale-105 transition-all shadow-premium"
                        >
                            Back to Core
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
