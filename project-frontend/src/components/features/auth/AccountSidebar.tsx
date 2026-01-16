import React, { useState, useEffect } from 'react';
import { User, ShoppingBag, Loader2, Save, Key, Mail, MapPin, Phone, Camera, LogOut, X, Trash2 } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import axios from 'axios';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmationModal from '../../common/ConfirmationModal';

type AccountSidebarProps = {
    isOpen: boolean;
    onClose: () => void;
};

const AccountSidebar = ({ isOpen, onClose }: AccountSidebarProps) => {
    const { user, login, logout, setOrdersOpen } = useAuthStore();

    const [activeTab, setActiveTab] = useState<'info' | 'security'>('info');
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Form States
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        avatar: user?.avatar || '',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
                avatar: user.avatar || '',
            });
        }
    }, [user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await axios.put('/api/auth/me', {
                name: formData.name,
                phone: formData.phone,
                address: formData.address,
                avatar: formData.avatar,
            });
            const token = useAuthStore.getState().token;
            if (token) {
                login(res.data, token);
            }
            toast.success('IDENTITY SYNCHRONIZED');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'SYNCHRONIZATION FAILED');
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 500000) { // 500KB limit
                toast.error('IMAGE TOO LARGE: MAX 500KB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, avatar: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveAvatar = () => {
        setFormData({ ...formData, avatar: '' });
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("SECURITY PROTOCOL: PASSWORDS MISMATCH");
            return;
        }
        setIsLoading(true);
        try {
            await axios.put('/api/auth/me/password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });
            toast.success('SECURITY CREDENTIALS UPDATED');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'PROTOCOL BREACH: UPDATE FAILED');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex justify-end">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/20 backdrop-blur-md"
            />

            {/* Sidebar Container */}
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
                className="relative w-full max-w-md bg-white dark:bg-neutral-900 h-full shadow-premium flex flex-col border-l border-stone-200 dark:border-neutral-800 md:rounded-l-3xl pt-safe overflow-hidden"
            >
                {/* Header Section */}
                <div className="flex items-center justify-between border-b border-stone-100 dark:border-neutral-800 p-6 md:p-8">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-stone-50 dark:bg-neutral-800 rounded-xl border border-stone-200 dark:border-neutral-800">
                            <User className="w-4 h-4 text-black dark:text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-black dark:text-white uppercase tracking-tighter">Member Protocol</h2>
                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{user?.role || 'Client'}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 text-stone-400 hover:text-black dark:hover:text-white bg-stone-50 dark:bg-neutral-800 rounded-xl border border-stone-200 dark:border-neutral-800 transition-all hover:scale-110 hover:rotate-90 duration-300"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Navigation Tabs */}
                <div className="px-6 md:px-8 pt-6 flex gap-2">
                    <button
                        onClick={() => setActiveTab('info')}
                        className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'info'
                            ? 'bg-stone-900 dark:bg-white text-white dark:text-black shadow-xl'
                            : 'text-stone-400 hover:text-stone-900 dark:hover:text-white bg-stone-50 dark:bg-neutral-800'
                            }`}
                    >
                        Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'security'
                            ? 'bg-stone-900 dark:bg-white text-white dark:text-black shadow-xl'
                            : 'text-stone-400 hover:text-stone-900 dark:hover:text-white bg-stone-50 dark:bg-neutral-800'
                            }`}
                    >
                        Security
                    </button>
                    <button
                        onClick={() => {
                            onClose();
                            setOrdersOpen(true);
                        }}
                        className="px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-stone-900 dark:hover:text-white bg-stone-50 dark:bg-neutral-800 transition-all ml-auto"
                    >
                        <ShoppingBag className="w-4 h-4" />
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-8 pt-4">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            {activeTab === 'info' ? (
                                <form onSubmit={handleUpdateProfile} className="space-y-6">
                                    <div className="flex flex-col items-center mb-6 group">
                                        <div className="relative p-1 bg-stone-100 dark:bg-neutral-800 rounded-2xl">
                                            <div className="w-20 h-20 bg-white dark:bg-neutral-950 rounded-xl flex items-center justify-center relative overflow-hidden">
                                                {formData.avatar ? (
                                                    <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-2xl font-black text-black dark:text-white">{user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}</span>
                                                )}
                                                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer z-10">
                                                    <Camera className="w-5 h-5 text-white" />
                                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                                </label>
                                            </div>
                                        </div>
                                        {formData.avatar && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setIsDeleteModalOpen(true);
                                                }}
                                                className="mt-3 flex items-center gap-2 text-[10px] font-bold text-red-500 hover:text-red-600 uppercase tracking-widest transition-colors bg-red-50 dark:bg-red-900/10 px-3 py-1.5 rounded-full"
                                                title="Remove Profile Picture"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                                Remove
                                            </button>
                                        )}
                                    </div>

                                    <ConfirmationModal
                                        isOpen={isDeleteModalOpen}
                                        onClose={() => setIsDeleteModalOpen(false)}
                                        onConfirm={handleRemoveAvatar}
                                        title="Remove Avatar"
                                        message="Are you sure you want to remove your profile picture?"
                                        confirmText="Remove"
                                        isDestructive={true}
                                    />

                                    <div className="flex flex-col gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest pl-1">Identity</label>
                                            <div className="relative group">
                                                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
                                                <input
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full pl-14 pr-6 py-3 rounded-xl border border-stone-200 dark:border-neutral-800 bg-stone-50 dark:bg-neutral-950 focus:ring-4 focus:ring-black/5 dark:focus:ring-white/5 focus:border-stone-400 dark:focus:border-neutral-600 outline-none transition-all text-xs font-bold tracking-tight text-black dark:text-white"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest pl-1">Archives</label>
                                            <div className="relative">
                                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                                                <input
                                                    type="email"
                                                    value={formData.email}
                                                    disabled
                                                    className="w-full pl-14 pr-6 py-3 rounded-xl border border-stone-200 dark:border-neutral-800 bg-stone-100 dark:bg-neutral-950 text-stone-400 cursor-not-allowed text-xs font-bold tracking-tight"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest pl-1">Link (Phone)</label>
                                            <div className="relative group">
                                                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
                                                <input
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    className="w-full pl-14 pr-6 py-3 rounded-xl border border-stone-200 dark:border-neutral-800 bg-stone-50 dark:bg-neutral-950 focus:ring-4 focus:ring-black/5 dark:focus:ring-white/5 focus:border-stone-400 dark:focus:border-neutral-600 outline-none transition-all text-xs font-bold tracking-tight text-black dark:text-white"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest pl-1">Anchor (Address)</label>
                                            <div className="relative group">
                                                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
                                                <input
                                                    type="text"
                                                    value={formData.address}
                                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                    className="w-full pl-14 pr-6 py-3 rounded-xl border border-stone-200 dark:border-neutral-800 bg-stone-50 dark:bg-neutral-950 focus:ring-4 focus:ring-black/5 dark:focus:ring-white/5 focus:border-stone-400 dark:focus:border-neutral-600 outline-none transition-all text-xs font-bold tracking-tight text-black dark:text-white"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-4 bg-stone-900 dark:bg-white text-white dark:text-black font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-2xl flex items-center justify-center gap-4 mt-4"
                                    >
                                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Update Identity
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleChangePassword} className="space-y-6">
                                    <div className="flex flex-col gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest pl-1">Current Key</label>
                                            <div className="relative group">
                                                <Key className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300 group-focus-within:text-stone-900 dark:group-focus-within:text-white transition-colors" />
                                                <input
                                                    type="password"
                                                    required
                                                    value={passwordData.currentPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                    className="w-full pl-14 pr-6 py-2.5 rounded-2xl border border-stone-100 dark:border-neutral-800 bg-stone-50/50 dark:bg-neutral-950 focus:ring-0 focus:border-stone-900 dark:focus:border-white transition-all text-[12px] font-bold tracking-tight"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest pl-1">New Layer</label>
                                            <div className="relative group">
                                                <Key className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300 group-focus-within:text-stone-900 dark:group-focus-within:text-white transition-colors" />
                                                <input
                                                    type="password"
                                                    required
                                                    value={passwordData.newPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                    className="w-full pl-14 pr-6 py-2.5 rounded-2xl border border-stone-100 dark:border-neutral-800 bg-stone-50/50 dark:bg-neutral-950 focus:ring-0 focus:border-stone-900 dark:focus:border-white transition-all text-[12px] font-bold tracking-tight"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest pl-1">Confirm Layer</label>
                                            <div className="relative group">
                                                <Key className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300 group-focus-within:text-stone-900 dark:group-focus-within:text-white transition-colors" />
                                                <input
                                                    type="password"
                                                    required
                                                    value={passwordData.confirmPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                    className="w-full pl-14 pr-6 py-2.5 rounded-2xl border border-stone-100 dark:border-neutral-800 bg-stone-50/50 dark:bg-neutral-950 focus:ring-0 focus:border-stone-900 dark:focus:border-white transition-all text-[12px] font-bold tracking-tight"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-4 bg-stone-900 dark:bg-white text-white dark:text-black font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-2xl flex items-center justify-center gap-4 mt-4"
                                    >
                                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                                        Upgrade Security
                                    </button>
                                </form>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Secure Badge Bottom */}
                <div className="p-6 md:p-8 flex flex-col items-center gap-4 bg-stone-50/50 dark:bg-black/20 border-t border-stone-100 dark:border-neutral-800 mt-auto">
                    <button
                        onClick={() => {
                            logout();
                            onClose();
                        }}
                        className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-rose-500 hover:text-rose-600 transition-all active:scale-95"
                    >
                        <LogOut className="w-4 h-4" />
                        Terminate Link
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default AccountSidebar;
