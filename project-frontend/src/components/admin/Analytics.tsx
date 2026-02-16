import React from 'react';
import { motion } from 'framer-motion';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import {
    TrendingUp,
    Activity
} from 'lucide-react';

interface AnalyticsProps {
    data: {
        revenueTrends: Array<{ label: string; revenue: number; orders: number }>;
        categoryDistribution: Array<{ name: string; value: number }>;
        topProducts: Array<{ name: string; category: string; quantity: number; revenue: number }>;
    } | null;
    isLoading: boolean;
    timeRange: string;
    setTimeRange: (range: any) => void;
}

const COLORS = ['#000000', '#404040', '#737373', '#a3a3a3', '#d4d4d4'];

const Analytics: React.FC<AnalyticsProps> = ({ data, isLoading, timeRange, setTimeRange }) => {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-neutral-900 rounded-[2.5rem] border border-gray-100 dark:border-neutral-800 shadow-sm min-h-[400px]">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-stone-100 dark:border-neutral-800 rounded-full"></div>
                    <div className="absolute inset-0 w-16 h-16 border-4 border-stone-900 dark:border-white rounded-full border-t-transparent animate-spin"></div>
                </div>
                <p className="mt-6 text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] animate-pulse">Analyzing Market Dynamics...</p>
            </div>
        );
    }

    if (!data) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
        >
            {/* Header & Filter */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8 bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-gray-100 dark:border-neutral-800 shadow-sm relative z-20">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-black flex items-center justify-center shadow-lg shadow-stone-900/10 dark:shadow-none">
                        <Activity className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Deep Intelligence</h2>
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">Comprehensive analytics across sectors</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 p-1 bg-gray-50 dark:bg-black/40 rounded-2xl border border-gray-100 dark:border-neutral-800">
                    {['7d', '30d', '90d', '1y', 'all'].map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${timeRange === range
                                ? 'bg-stone-900 dark:bg-white text-white dark:text-black shadow-md'
                                : 'text-gray-400 hover:text-stone-900 dark:hover:text-white'
                                }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {/* Top Row: Revenue Performance & Sector Exposure */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Revenue Chart */}
                <div className="lg:col-span-8 bg-white dark:bg-neutral-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-neutral-800 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Revenue Performance</h3>
                            <p className="text-xs text-gray-400 font-medium">Daily trends and conversion velocity</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-stone-900 dark:bg-white"></div>
                                Revenue
                            </div>
                        </div>
                    </div>

                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.revenueTrends}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="currentColor" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="currentColor" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                                <XAxis
                                    dataKey="label"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#888', fontWeight: 600 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#888', fontWeight: 600 }}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        borderRadius: '16px',
                                        border: 'none',
                                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                        padding: '12px'
                                    }}
                                    itemStyle={{ fontWeight: 'bold' }}
                                    labelStyle={{ color: '#888', marginBottom: '4px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="currentColor"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                    className="text-stone-900 dark:text-white"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Distribution */}
                <div className="lg:col-span-4 bg-white dark:bg-neutral-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-neutral-800 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Sector Exposure</h3>
                    <div className="h-[300px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.categoryDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.categoryDistribution.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-2xl font-bold">100%</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Inventory</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        {data.categoryDistribution.map((entry, index) => (
                            <div key={entry.name} className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                <span className="text-xs text-gray-500 font-medium">{entry.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Row: Top Products */}
            <div className="bg-white dark:bg-neutral-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-neutral-800 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">High Velocity</h3>
                        <p className="text-xs text-gray-400 font-medium">Top performing assets by volume and value</p>
                    </div>
                    <TrendingUp className="w-5 h-5 text-gray-400" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.topProducts.map((product, index) => (
                        <div key={index} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-neutral-800/50 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors group border border-gray-100/50 dark:border-neutral-700/50">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-900 flex items-center justify-center font-bold text-xs text-gray-400 border border-gray-100 dark:border-neutral-800 group-hover:bg-stone-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
                                    {index + 1}
                                </div>
                                <div>
                                    <p className="text-sm font-bold truncate max-w-[150px]">{product.name}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{product.category}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold">${product.revenue.toLocaleString()}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{product.quantity} units</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default Analytics;
