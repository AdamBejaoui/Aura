import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    User,
    CheckCircle2,
    Trash2
} from 'lucide-react';

interface UserData {
    _id: string;
    name: string;
    email: string;
    role: string;
    isVerified: boolean;
    avatar?: string;
    createdAt: string;
}

interface UserManagementProps {
    users: UserData[];
    handleUpdateUserRole: (userId: string, newRole: string) => Promise<void>;
    setConfirmation: (config: any) => void;
    activeDropdownId: string | null;
    setActiveDropdownId: (id: string | null) => void;
    updatingRoleUserId: string | null;
    getRoleConfig: (role: string) => any;
    isFullAdmin: boolean;
}

const UserManagement: React.FC<UserManagementProps> = ({
    users,
    handleUpdateUserRole,
    setConfirmation,
    activeDropdownId,
    setActiveDropdownId,
    updatingRoleUserId,
    getRoleConfig,
    isFullAdmin
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Standardized Header */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-gray-100 dark:border-neutral-800 shadow-sm relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-black flex items-center justify-center shadow-lg shadow-stone-900/10 dark:shadow-none">
                        <User className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">User Management</h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                            Managing {users.length} registered profiles
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                    <div className="relative w-full sm:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-stone-900 dark:group-focus-within:text-white transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-black border border-gray-100 dark:border-neutral-800 rounded-xl text-[13px] outline-none focus:ring-2 focus:ring-stone-500/20 transition-all font-medium"
                        />
                    </div>

                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-black/40 border border-gray-100 dark:border-neutral-800 rounded-xl">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                        <span className="text-[10px] font-black text-stone-900 dark:text-white uppercase tracking-widest">
                            {users.filter(u => u.isVerified).length} Verified
                        </span>
                    </div>
                </div>
            </div>

            <div className={`bg-white dark:bg-neutral-900 rounded-[2.5rem] border border-gray-100 dark:border-neutral-800 shadow-sm ${activeDropdownId ? 'overflow-visible' : 'overflow-hidden'}`}>
                {/* PC Table View */}
                <div className="hidden lg:block overflow-x-auto overflow-y-visible">
                    <table className="w-full border-collapse">
                        <thead className="bg-gray-50/50 dark:bg-neutral-800/50 border-b border-gray-100 dark:border-neutral-800">
                            <tr>
                                <th className="px-8 py-6 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">User Profile</th>
                                <th className="px-8 py-6 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Assignment</th>
                                <th className="px-8 py-6 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-8 py-6 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Joined Date</th>
                                <th className="px-8 py-6 text-right text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-neutral-800">
                            <AnimatePresence>
                                {filteredUsers.map((user, index) => {
                                    const isLastItems = index >= filteredUsers.length - 2;
                                    return (
                                        <motion.tr
                                            key={user._id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                            className="hover:bg-gray-50/50 dark:hover:bg-neutral-800/30 transition-colors group"
                                        >
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-2xl bg-stone-900 dark:bg-white text-white dark:text-black flex items-center justify-center text-sm font-black shadow-lg shadow-stone-200 dark:shadow-none overflow-hidden">
                                                        {user.avatar ? (
                                                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            user.name ? user.name.charAt(0).toUpperCase() : '?'
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-900 dark:text-white">{user.name}</div>
                                                        <div className="text-[10px] text-gray-400 font-medium tracking-tight translate-y-[-1px]">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                {isFullAdmin ? (
                                                    <div className="relative">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setActiveDropdownId(activeDropdownId === `role-${user._id}` ? null : `role-${user._id}`);
                                                            }}
                                                            className={`aura-dropdown-toggle flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${getRoleConfig(user.role).bg} ${getRoleConfig(user.role).text} border border-transparent hover:border-current/20 shadow-sm ${updatingRoleUserId === user._id ? 'opacity-50' : ''}`}
                                                        >
                                                            {getRoleConfig(user.role).icon}
                                                            {user.role}
                                                            <svg className={`w-3 h-3 transition-transform ${activeDropdownId === `role-${user._id}` ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                                                        </button>

                                                        {activeDropdownId === `role-${user._id}` && (
                                                            <div className={`aura-dropdown !block ${isLastItems ? 'bottom-full mb-2' : 'top-full pt-2'} left-0 min-w-[140px] z-50`}>
                                                                <div className="aura-dropdown-content">
                                                                    {['customer', 'co-admin', 'admin'].map(role => {
                                                                        const config = getRoleConfig(role);
                                                                        return (
                                                                            <button
                                                                                key={role}
                                                                                onClick={() => { handleUpdateUserRole(user._id, role); setActiveDropdownId(null); }}
                                                                                className={`aura-dropdown-item w-full ${user.role === role ? 'bg-stone-50 dark:bg-neutral-800 text-stone-900 dark:text-white' : ''}`}
                                                                            >
                                                                                <div className={`w-4 h-4 flex items-center justify-center ${config.text}`}>
                                                                                    {config.icon}
                                                                                </div>
                                                                                {role}
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${getRoleConfig(user.role).bg} ${getRoleConfig(user.role).text} shadow-sm opacity-80`}>
                                                        {getRoleConfig(user.role).icon}
                                                        {user.role}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${user.isVerified
                                                    ? 'bg-green-50 text-green-600 ring-1 ring-green-100'
                                                    : 'bg-amber-50 text-amber-600 ring-1 ring-amber-100'
                                                    }`}>
                                                    <div className={`w-1 h-1 rounded-full ${user.isVerified ? 'bg-green-600' : 'bg-amber-600 animate-pulse'}`}></div>
                                                    {user.isVerified ? 'Verified' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-bold text-gray-900 dark:text-white uppercase">{new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                    <span className="text-[10px] text-gray-400 font-medium">Auto-Registered</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {isFullAdmin && user.role !== 'admin' && (
                                                        <button
                                                            onClick={() => setConfirmation({
                                                                isOpen: true,
                                                                type: 'deleteUser',
                                                                id: user._id,
                                                                title: 'Delete User',
                                                                message: `Are you sure you want to delete ${user.name}? This cannot be undone.`,
                                                                isDestructive: true
                                                            })}
                                                            className="w-9 h-9 rounded-xl bg-red-50/50 dark:bg-red-900/10 text-stone-400 hover:text-red-500 transition-all flex items-center justify-center border border-transparent hover:border-red-100 dark:hover:border-red-900/30 shadow-sm hover:scale-110 active:scale-95"
                                                            title="Terminate Access"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden divide-y divide-gray-100 dark:divide-neutral-800">
                    <AnimatePresence>
                        {filteredUsers.map((user) => (
                            <motion.div
                                key={user._id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="p-4 space-y-4"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-stone-900 dark:bg-white text-white dark:text-black flex items-center justify-center text-sm font-bold overflow-hidden">
                                            {user.avatar ? (
                                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                user.name ? user.name.charAt(0).toUpperCase() : '?'
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-gray-900 dark:text-white">{user.name}</div>
                                            <div className="text-[10px] text-gray-400 truncate max-w-[150px]">{user.email}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {isFullAdmin && user.role !== 'admin' && (
                                            <button
                                                onClick={() => setConfirmation({
                                                    isOpen: true,
                                                    type: 'deleteUser',
                                                    id: user._id,
                                                    title: 'Delete User',
                                                    message: `Are you sure you want to delete ${user.name}? This cannot be undone.`,
                                                    isDestructive: true
                                                })}
                                                className="p-2 text-rose-500 bg-rose-50 dark:bg-rose-900/10 rounded-lg"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-2">
                                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getRoleConfig(user.role).bg} ${getRoleConfig(user.role).text}`}>
                                        {getRoleConfig(user.role).icon}
                                        {user.role}
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${user.isVerified ? 'text-green-500' : 'text-amber-500'}`}>
                                        {user.isVerified ? '✓ Verified' : '○ Pending'}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
