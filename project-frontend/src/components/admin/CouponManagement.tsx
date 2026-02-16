import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, XCircle } from 'lucide-react';

interface Coupon {
    _id: string;
    code: string;
    discountPercent: number;
    expiryDate: string;
    useCount?: number;
}

interface CouponManagementProps {
    coupons: Coupon[];
    newCoupon: { code: string; discountPercent: number; expiryDate: string };
    setNewCoupon: (coupon: any) => void;
    handleCreateCoupon: (e: React.FormEvent) => Promise<void>;
    handleDeleteCoupon: (id: string) => Promise<void>;
}

const CouponManagement: React.FC<CouponManagementProps> = ({
    coupons,
    newCoupon,
    setNewCoupon,
    handleCreateCoupon,
    handleDeleteCoupon
}) => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Standardized Header */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-gray-100 dark:border-neutral-800 shadow-sm relative z-20">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-black flex items-center justify-center shadow-lg shadow-stone-900/10 dark:shadow-none">
                        <Ticket className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Privilege Management</h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                            Generating and monitoring {coupons.length} discount tokens
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-black/40 border border-gray-100 dark:border-neutral-800 rounded-xl">
                    <span className="text-[10px] font-black text-stone-900 dark:text-white uppercase tracking-widest">
                        Status: Operational
                    </span>
                </div>
            </div>

            {/* Creation Form */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-stone-50 dark:bg-neutral-800/30 p-8 rounded-[2.5rem] border border-gray-100 dark:border-neutral-800 relative z-10"
            >
                <form onSubmit={handleCreateCoupon} className="flex flex-col lg:flex-row items-stretch lg:items-end gap-4 md:gap-6">
                    <div className="flex-1 space-y-2">
                        <label className="text-[9px] md:text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Privilege Code</label>
                        <input
                            type="text"
                            required
                            placeholder="E.G. AURA_ELITE"
                            value={newCoupon.code}
                            onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                            className="w-full bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-bold focus:outline-none focus:ring-4 focus:ring-stone-900/5 transition-all dark:text-white uppercase tracking-widest"
                        />
                    </div>
                    <div className="flex-1 space-y-2">
                        <label className="text-[9px] md:text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Percent (%)</label>
                        <input
                            type="number"
                            required
                            min="1"
                            max="100"
                            value={newCoupon.discountPercent}
                            onChange={(e) => setNewCoupon({ ...newCoupon, discountPercent: parseInt(e.target.value) })}
                            className="w-full bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-bold focus:outline-none focus:ring-4 focus:ring-stone-900/5 transition-all dark:text-white"
                        />
                    </div>
                    <div className="flex-1 space-y-2">
                        <label className="text-[9px] md:text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Expiry Date</label>
                        <input
                            type="date"
                            required
                            value={newCoupon.expiryDate}
                            onChange={(e) => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })}
                            className="w-full bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-bold focus:outline-none focus:ring-4 focus:ring-stone-900/5 transition-all dark:text-white"
                        />
                    </div>
                    <button type="submit" className="px-6 md:px-10 py-3 md:py-4 bg-stone-900 dark:bg-white text-white dark:text-black rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all">
                        Authorize
                    </button>
                </form>
            </motion.div>

            {/* Coupons Grid */}
            <div className="bg-white dark:bg-neutral-900 rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 dark:border-neutral-800 shadow-sm overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 p-4 md:p-8">
                    <AnimatePresence>
                        {coupons.map((coupon) => (
                            <motion.div
                                key={coupon._id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="group relative bg-stone-50 dark:bg-neutral-800/30 rounded-3xl md:rounded-[2rem] p-4 md:p-6 border border-gray-100 dark:border-neutral-800 hover:shadow-xl transition-all overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-3 md:p-4 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all">
                                    <button
                                        onClick={() => handleDeleteCoupon(coupon._id)}
                                        className="w-9 h-9 rounded-xl bg-red-50/50 dark:bg-red-900/10 text-stone-400 hover:text-red-500 transition-all flex items-center justify-center border border-transparent hover:border-red-100 dark:hover:border-red-900/30 shadow-sm hover:scale-110 active:scale-95"
                                        title="Delete Coupon"
                                    >
                                        <XCircle className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white dark:bg-neutral-900 flex items-center justify-center border border-gray-100 dark:border-neutral-800 text-stone-900 dark:text-white shadow-sm">
                                        <Ticket className="w-5 h-5 md:w-6 md:h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[8px] md:text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Mag: {coupon.discountPercent}%</p>
                                        <h4 className="font-black text-sm md:text-lg text-gray-900 dark:text-white tracking-widest uppercase truncate max-w-[120px] md:max-w-none">{coupon.code}</h4>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-gray-200/50 dark:border-neutral-800">
                                    <div className="flex flex-col">
                                        <span className="text-[7px] md:text-[8px] font-black text-gray-400 uppercase tracking-widest">Activations</span>
                                        <span className="text-[10px] md:text-xs font-bold text-gray-900 dark:text-white mt-0.5">{coupon.useCount || 0} Uses</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[7px] md:text-[8px] font-black text-gray-400 uppercase tracking-widest">Valid Until</span>
                                        <span className="text-[10px] md:text-xs font-bold text-stone-900 dark:text-white mt-0.5">
                                            {new Date(coupon.expiryDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {coupons.length === 0 && (
                    <div className="p-20 text-center">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                            <Ticket className="w-10 h-10" />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-tighter">No Active Privileges</h3>
                        <p className="text-xs text-gray-500 mt-2">Generate a new code to initiate customer incentives</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CouponManagement;
