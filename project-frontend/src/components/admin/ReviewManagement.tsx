import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, MessageSquare } from 'lucide-react';

interface Review {
    review: {
        _id: string;
        name: string;
        rating: number;
        comment: string;
        createdAt: string;
    };
    productId: string;
    productName: string;
    productImage?: string;
}

interface ReviewManagementProps {
    reviews: Review[];
    getImageUrl: (path: string) => string;
    setConfirmation: (config: any) => void;
}

const ReviewManagement: React.FC<ReviewManagementProps> = ({
    reviews,
    getImageUrl,
    setConfirmation
}) => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Standardized Header */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-gray-100 dark:border-neutral-800 shadow-sm relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-black flex items-center justify-center shadow-lg shadow-stone-900/10 dark:shadow-none">
                        <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Customer Feedback</h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                            Moderating {reviews.length} product reviews
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-black/40 border border-gray-100 dark:border-neutral-800 rounded-xl">
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(i => (
                            <svg key={i} className="w-3 h-3 fill-amber-400" viewBox="0 0 20 20"><path d="M10 15.27L16.18 19l-1.64-7.03L20 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 4.73L3.82 19z" /></svg>
                        ))}
                    </div>
                    <span className="text-[10px] font-black text-stone-900 dark:text-white uppercase tracking-widest ml-1">
                        {Math.round(reviews.reduce((acc, r) => acc + r.review.rating, 0) / (reviews.length || 1) * 10) / 10} Avg
                    </span>
                </div>
            </div>

            <div className={`bg-white dark:bg-neutral-900 rounded-[2.5rem] border border-gray-100 dark:border-neutral-800 shadow-sm overflow-hidden`}>
                {/* PC Table View */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead className="bg-gray-50/50 dark:bg-neutral-800/50 border-b border-gray-100 dark:border-neutral-800">
                            <tr>
                                <th className="px-8 py-6 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Product</th>
                                <th className="px-8 py-6 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Reviewer</th>
                                <th className="px-8 py-6 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] w-1/3">Comment</th>
                                <th className="px-8 py-6 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Date</th>
                                <th className="px-8 py-6 text-right text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-neutral-800">
                            <AnimatePresence>
                                {reviews.map((r, index) => (
                                    <motion.tr
                                        key={r.review._id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                        className="hover:bg-gray-50/50 dark:hover:bg-neutral-800/30 transition-colors group"
                                    >
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                {r.productImage && (
                                                    <div className="w-12 h-16 rounded-lg bg-gray-100 dark:bg-neutral-800 overflow-hidden border border-gray-100 dark:border-neutral-700">
                                                        <img src={getImageUrl(r.productImage)} alt={r.productName} className="w-full h-full object-cover" />
                                                    </div>
                                                )}
                                                <div className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[150px]">{r.productName}</div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="text-sm font-bold text-gray-900 dark:text-white">{r.review.name}</div>
                                            <div className="flex items-center text-amber-400 mt-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <svg key={i} className={`w-3 h-3 ${i < r.review.rating ? "fill-current" : "text-gray-200 dark:text-neutral-700"}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 italic font-medium leading-relaxed group-hover:text-gray-900 dark:group-hover:text-white transition-colors">"{r.review.comment}"</p>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-[11px] font-bold text-gray-900 dark:text-white uppercase">{new Date(r.review.createdAt).toLocaleDateString()}</span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setConfirmation({
                                                        isOpen: true,
                                                        type: 'deleteReview',
                                                        id: `${r.productId}|${r.review._id}`,
                                                        title: 'Delete Review',
                                                        message: `Are you sure you want to delete this review from ${r.review.name}?`,
                                                        isDestructive: true
                                                    })}
                                                    className="w-9 h-9 rounded-xl bg-red-50/50 dark:bg-red-900/10 text-stone-400 hover:text-red-500 transition-all flex items-center justify-center border border-transparent hover:border-red-100 dark:hover:border-red-900/30 shadow-sm hover:scale-110 active:scale-95"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden divide-y divide-gray-100 dark:divide-neutral-800">
                    <AnimatePresence>
                        {reviews.map((r) => (
                            <motion.div
                                key={r.review._id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="p-4 space-y-4 shadow-sm"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        {r.productImage && (
                                            <img src={getImageUrl(r.productImage)} alt={r.productName} className="w-12 h-12 rounded-lg object-cover" />
                                        )}
                                        <div>
                                            <div className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">{r.productName}</div>
                                            <div className="flex items-center text-amber-400 mt-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <svg key={i} className={`w-2.5 h-2.5 ${i < r.review.rating ? "fill-current" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setConfirmation({
                                            isOpen: true,
                                            type: 'deleteReview',
                                            id: `${r.productId}|${r.review._id}`,
                                            title: 'Delete Review',
                                            message: `Delete this review?`,
                                            isDestructive: true
                                        })}
                                        className="p-2 text-rose-500 bg-rose-50 dark:bg-rose-900/10 rounded-lg"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="bg-gray-50 dark:bg-neutral-800 p-4 rounded-2xl border border-gray-100 dark:border-neutral-700">
                                    <p className="text-xs text-stone-600 dark:text-stone-300 italic font-medium leading-relaxed">"{r.review.comment}"</p>
                                    <div className="mt-3 flex items-center justify-between">
                                        <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{r.review.name}</span>
                                        <span className="text-[10px] text-stone-400 font-bold">{new Date(r.review.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {reviews.length === 0 && (
                <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] p-20 text-center border border-gray-100 dark:border-neutral-800 shadow-sm">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                        <MessageSquare className="w-10 h-10" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-tighter">No Feedback Received</h3>
                    <p className="text-xs text-gray-500 mt-2">Active reviews will materialize here once customers start sharing their thoughts</p>
                </div>
            )}
        </div>
    );
};

export default ReviewManagement;
