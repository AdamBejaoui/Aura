import React from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    Package,
    Gem,
    Star,
    ShoppingCart,
    Eye,
    Clock,
    AlertTriangle,
    ArrowRight
} from 'lucide-react';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';
import { useThemeStore } from '../../store/themeStore';

interface DashboardStatsProps {
    stats: any;
    products: any[];
    onRetry: () => void;
    setActiveSection: (section: string) => void;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, products, onRetry, setActiveSection }) => {
    const { theme } = useThemeStore();
    const isDark = theme === 'dark';

    if (stats === 'error') {
        return (
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-3xl p-8 text-center">
                <Package className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Metrics Unavailable</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">We couldn't reach the intelligence server to fetch latest stats.</p>
                <button
                    onClick={onRetry}
                    className="px-6 py-2 bg-stone-900 dark:bg-white text-white dark:text-black rounded-xl text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all"
                >
                    Retry Connection
                </button>
            </div>
        );
    }

    if (!stats) return (
        <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-neutral-900 rounded-[2.5rem] border border-gray-100 dark:border-neutral-800 shadow-sm">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-stone-100 dark:border-neutral-800 rounded-full"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-stone-900 dark:border-white rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="mt-6 text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] animate-pulse">Synchronizing Intelligence...</p>
        </div>
    );

    const totalRevenue = stats.totalRevenue || 0;
    const totalOrders = stats.totalOrders || 0;
    const pendingOrdersCount = stats.pendingOrdersCount || 0;
    const deliveredOrdersCount = stats.deliveredOrdersCount || 0;
    const totalUsers = stats.totalUsers || 0;
    const totalReviews = stats.totalReviews || 0;

    const lowStockProducts = products?.filter(p => p.inStock && (p.quantity !== undefined ? p.quantity < 5 : false)) || [];

    const monthOverMonthChange = stats.monthOverMonthChange || "0";
    const isPositive = parseFloat(monthOverMonthChange) >= 0;

    // Mock chart data if not provided by backend
    const chartData = stats.revenueHistory || [
        { name: 'Mon', revenue: 4000 },
        { name: 'Tue', revenue: 3000 },
        { name: 'Wed', revenue: 2000 },
        { name: 'Thu', revenue: 2780 },
        { name: 'Fri', revenue: 1890 },
        { name: 'Sat', revenue: 2390 },
        { name: 'Sun', revenue: 3490 },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 mb-8"
        >
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="xl:col-span-2 bg-black dark:bg-white rounded-3xl p-8 text-white dark:text-black relative overflow-hidden shadow-2xl shadow-stone-200 dark:shadow-none min-h-[400px] flex flex-col"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/10 to-transparent rounded-full -mr-20 -mt-20 blur-3xl"></div>

                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-white/60 dark:text-black/60 font-medium mb-1 uppercase tracking-widest text-[10px]">Total Revenue</h3>
                                <div className="text-4xl sm:text-5xl font-bold tracking-tight">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                            </div>
                            <div className="flex flex-col items-end">
                                <div className={`flex items-center gap-1.5 ${isPositive ? 'text-green-400 dark:text-green-600' : 'text-red-400 dark:text-red-600'} bg-white/10 dark:bg-black/5 px-2 py-1 rounded-full text-xs font-bold`}>
                                    <TrendingUp className={`w-3.5 h-3.5 ${!isPositive && 'rotate-180'}`} />
                                    {isPositive ? '+' : ''}{monthOverMonthChange}%
                                </div>
                                <p className="text-[10px] text-white/40 dark:text-black/40 mt-1 uppercase tracking-widest font-bold">vs last month</p>
                            </div>
                        </div>

                        {/* Revenue Visualization */}
                        <div className="flex-1 min-h-[150px] mb-8">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={isDark ? "#000" : "#fff"} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={isDark ? "#000" : "#fff"} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: isDark ? '#fff' : '#000', border: 'none', borderRadius: '12px' }}
                                        itemStyle={{ color: isDark ? '#000' : '#fff', fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase' }}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke={isDark ? "#000" : "#fff"} strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-auto">
                            <div className="bg-white/10 dark:bg-black/5 backdrop-blur-md rounded-2xl p-4 border border-white/5 dark:border-black/5">
                                <p className="text-white/40 dark:text-black/40 text-[10px] font-bold uppercase tracking-widest mb-1">Orders</p>
                                <p className="text-xl font-bold">{totalOrders}</p>
                            </div>
                            <div className="bg-white/10 dark:bg-black/5 backdrop-blur-md rounded-2xl p-4 border border-white/5 dark:border-black/5">
                                <p className="text-white/40 dark:text-black/40 text-[10px] font-bold uppercase tracking-widest mb-1">Customers</p>
                                <p className="text-xl font-bold">{totalUsers}</p>
                            </div>
                            <div className="bg-white/10 dark:bg-black/5 backdrop-blur-md rounded-2xl p-4 border border-white/5 dark:border-black/5">
                                <p className="text-white/40 dark:text-black/40 text-[10px] font-bold uppercase tracking-widest mb-1">Pending</p>
                                <p className="text-xl font-bold">{pendingOrdersCount}</p>
                            </div>
                            <div className="bg-white/10 dark:bg-black/5 backdrop-blur-md rounded-2xl p-4 border border-white/5 dark:border-black/5">
                                <p className="text-white/40 dark:text-black/40 text-[10px] font-bold uppercase tracking-widest mb-1">Delivered</p>
                                <p className="text-xl font-bold">{deliveredOrdersCount}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="space-y-6">
                    {/* Inventory Alert Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-gray-100 dark:border-neutral-800 shadow-sm flex flex-col h-full"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-50 dark:bg-amber-900/10 rounded-xl">
                                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-widest dark:text-white">Inventory Alerts</h3>
                            </div>
                            <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-600 px-2 py-0.5 rounded-full">{lowStockProducts.length} Urgent</span>
                        </div>

                        <div className="flex-1 space-y-4">
                            {lowStockProducts.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-8">
                                    <Package className="w-8 h-8 mb-2" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest">Inventory Optimized</p>
                                </div>
                            ) : (
                                lowStockProducts.slice(0, 3).map((product: any) => (
                                    <div key={product._id} className="flex items-center justify-between p-3 bg-stone-50 dark:bg-neutral-800/50 rounded-2xl border border-stone-100 dark:border-neutral-800 group transition-all hover:border-amber-200 dark:hover:border-amber-900/40">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white dark:bg-neutral-700">
                                                <img src={product.images?.[0]} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-tight dark:text-white truncate max-w-[120px]">{product.name}</p>
                                                <p className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">{product.quantity} Left</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setActiveSection('addProduct')}
                                            className="p-2 rounded-lg bg-white dark:bg-neutral-700 text-stone-400 group-hover:text-stone-900 dark:group-hover:text-white transition-all"
                                        >
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        <button
                            onClick={() => setActiveSection('addProduct')}
                            className="w-full mt-6 py-3 bg-stone-50 dark:bg-neutral-800 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-stone-100 dark:hover:bg-neutral-700 transition-all border border-stone-100 dark:border-neutral-700"
                        >
                            Review All Stock
                        </button>
                    </motion.div>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
                {[
                    { label: 'Avg Order', value: `$${stats.avgOrderValue?.toFixed(0) || 0}`, icon: <Gem className="w-5 h-5" /> },
                    { label: 'Reviews', value: totalReviews.toString(), icon: <Star className="w-5 h-5" /> },
                    { label: 'Waitlist', value: stats.waitlistCount?.toString() || '0', icon: <Clock className="w-5 h-5" /> },
                    { label: 'Abandoned', value: '24', icon: <ShoppingCart className="w-5 h-5" /> },
                    { label: 'Visits', value: '8.4k', icon: <Eye className="w-5 h-5" /> },
                ].map((tile, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 + (i * 0.05) }}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                        onClick={() => {
                            if (tile.label === 'Waitlist') setActiveSection('waitlist');
                        }}
                        className="bg-white dark:bg-neutral-900 p-4 sm:p-5 rounded-3xl border border-gray-100 dark:border-neutral-800 shadow-sm flex items-center gap-4 hover:shadow-md transition-all group cursor-pointer"
                    >
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gray-50 dark:bg-neutral-800 flex items-center justify-center text-gray-400 group-hover:bg-stone-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
                            {tile.icon}
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter truncate">{tile.label}</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{tile.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default DashboardStats;
