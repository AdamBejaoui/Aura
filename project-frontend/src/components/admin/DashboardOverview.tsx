import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock,
    PlusCircle,
    Package,
    ArrowUpRight
} from 'lucide-react';
import DashboardStats from './DashboardStats';

interface Activity {
    id: string;
    type: string;
    title: string;
    subtitle: string;
    time: string;
    status: string;
}

import { Product } from './ProductManagement';

interface DashboardOverviewProps {
    recentActivity: Activity[];
    pendingOrdersCount: number;
    setActiveSection: (section: any) => void;
    products: Product[];
    getImageUrl: (path: string) => string;
    startEditing: (product: Product) => void;
    handleDeleteProduct: (productId: string) => Promise<void>;
    ProductImageCarouselAdmin: React.FC<{ images: string[]; productName: string; getImageUrl: (path: string) => string }>;
    stats: any;
    onRetry: () => void;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({
    recentActivity,
    pendingOrdersCount,
    setActiveSection,
    products,
    getImageUrl,
    startEditing,
    handleDeleteProduct,
    ProductImageCarouselAdmin,
    stats,
    onRetry
}) => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* New Unified Performance Hub */}
            <DashboardStats stats={stats} products={products} onRetry={onRetry} setActiveSection={setActiveSection} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Activity Feed */}
                <div className="lg:col-span-1 bg-white dark:bg-neutral-900 rounded-3xl p-8 border border-gray-100 dark:border-neutral-800 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Clock className="w-5 h-5 text-stone-400" />
                            Recent Activity
                        </h3>
                        <button className="text-[10px] font-bold text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors uppercase tracking-[0.2em]">
                            All Log
                        </button>
                    </div>

                    <div className="space-y-6">
                        <AnimatePresence>
                            {recentActivity.map((activity, idx) => (
                                <motion.div
                                    key={activity.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                                    className="relative pl-6 border-l border-gray-100 dark:border-neutral-800 last:border-0 pb-6 last:pb-0"
                                >
                                    <div className="absolute left-0 top-0 -translate-x-1/2 w-2 h-2 rounded-full bg-stone-900 dark:bg-white shadow-[0_0_10px_rgba(0,0,0,0.1)]"></div>
                                    <div className="flex items-start justify-between">
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{activity.title}</p>
                                            <p className="text-[10px] text-gray-500 mt-0.5 font-medium uppercase tracking-tighter">{activity.subtitle}</p>
                                        </div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter ml-2 whitespace-nowrap">
                                            {new Date(activity.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Quick Launch Shortcuts */}
                <div className="lg:col-span-2 bg-stone-50 dark:bg-neutral-800/30 rounded-3xl p-8 border border-gray-100 dark:border-neutral-800 flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Quick Launch</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                                onClick={() => setActiveSection('addProduct')}
                                className="flex items-center gap-4 p-5 bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 hover:shadow-xl hover:-translate-y-1 transition-all text-left group"
                            >
                                <div className="w-12 h-12 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <PlusCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">New Product</p>
                                    <p className="text-xs text-gray-500">Add to inventory</p>
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveSection('orders')}
                                className="flex items-center gap-4 p-5 bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 hover:shadow-xl hover:-translate-y-1 transition-all text-left group"
                            >
                                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 flex items-center justify-center group-hover:bg-stone-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
                                    <Package className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">Active Orders</p>
                                    <p className="text-xs text-gray-500">{pendingOrdersCount} pending tasks</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-200 dark:border-neutral-800 flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">API Gateway: Online</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                            <Clock className="w-3.5 h-3.5" />
                            Last sync: Just now
                        </div>
                    </div>
                </div>
            </div>

            {/* Inventory Grid Header */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-gray-100 dark:border-neutral-800 shadow-sm relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-black flex items-center justify-center shadow-lg shadow-stone-900/10 dark:shadow-none">
                        <Package className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Inventory Overview</h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                            Tracking {products.length} unique market assets
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 p-1 bg-gray-50 dark:bg-black/40 rounded-2xl border border-gray-100 dark:border-neutral-800">
                    <button
                        onClick={() => setActiveSection('addProduct')}
                        className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-stone-900 dark:bg-white text-white dark:text-black shadow-md hover:scale-105 active:scale-95"
                    >
                        Add Asset
                    </button>
                </div>
            </div>

            <div className="flex overflow-x-auto pb-6 gap-6 snap-x snap-mandatory no-scrollbar -mx-4 px-4 sm:-mx-8 sm:px-8">
                {products.map(product => (
                    <div key={product._id} className="flex-shrink-0 w-[280px] sm:w-[320px] snap-start bg-white dark:bg-neutral-900 rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-neutral-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                        <div className="h-72 bg-gray-100 dark:bg-neutral-800 relative overflow-hidden">
                            {product.images.length > 0 ? (
                                product.images.length > 1 ? (
                                    <ProductImageCarouselAdmin images={product.images} productName={product.name} getImageUrl={getImageUrl} />
                                ) : (
                                    <img
                                        src={getImageUrl(product.images[0])}
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                )
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <span className="text-sm font-bold uppercase tracking-widest">No Assets</span>
                                </div>
                            )}
                            <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                                <button
                                    onClick={() => startEditing(product)}
                                    className="w-9 h-9 rounded-xl bg-gray-50/90 dark:bg-neutral-800/90 backdrop-blur-xl text-stone-400 hover:text-stone-900 dark:hover:text-white transition-all flex items-center justify-center border border-gray-100 dark:border-neutral-800 hover:border-stone-200 shadow-sm hover:scale-110 active:scale-95"
                                    title="Edit Product"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                </button>
                                <button
                                    onClick={() => handleDeleteProduct(product._id)}
                                    className="w-9 h-9 rounded-xl bg-red-50/90 dark:bg-red-900/40 backdrop-blur-xl text-stone-400 hover:text-red-500 transition-all flex items-center justify-center border border-transparent hover:border-red-100 dark:hover:border-red-900/30 shadow-sm hover:scale-110 active:scale-95"
                                    title="Archive Product"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{product.category}</p>
                                {!product.inStock && (
                                    <span className="px-2 py-0.5 bg-red-50 text-red-500 text-[8px] font-black uppercase rounded-full border border-red-100">
                                        Sold Out
                                    </span>
                                )}
                            </div>
                            <h4 className="font-bold text-gray-900 dark:text-white text-base mb-4 truncate">{product.name}</h4>
                            <div className="flex items-center justify-between border-t border-gray-50 dark:border-neutral-800 pt-4 mt-2">
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Current Price</span>
                                    <span className="text-xl font-black text-gray-900 dark:text-white">
                                        {product.currency} {product.price.toFixed(2)}
                                    </span>
                                </div>
                                <button
                                    onClick={() => startEditing(product)}
                                    className="w-9 h-9 rounded-xl bg-gray-50/50 dark:bg-neutral-800/50 text-stone-400 hover:text-stone-900 dark:hover:text-white transition-all flex items-center justify-center border border-gray-100 dark:border-neutral-800 hover:border-stone-200 shadow-sm hover:scale-110 active:scale-95"
                                >
                                    <ArrowUpRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DashboardOverview;
