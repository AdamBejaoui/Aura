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
                const response = await axios.post('http://localhost:3000/api/auth/verify-email', { token });
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
        <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-30">
                <Plasma color="#ffffff" />
            </div>

            <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl max-w-md w-full text-center relative z-10 shadow-2xl">
                {status === 'verifying' && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                        <h2 className="text-xl font-bold">Verifying...</h2>
                        <p className="text-gray-400">{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-2">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white">Verified!</h2>
                        <p className="text-gray-300">{message}</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-2">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white">Verification Failed</h2>
                        <p className="text-red-400">{message}</p>
                        <button
                            onClick={() => navigate('/')}
                            className="mt-4 px-6 py-2 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Go Home
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
