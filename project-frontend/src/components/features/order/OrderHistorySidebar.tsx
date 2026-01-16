import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../../store/authStore';
import { Package, Calendar, X, ShoppingBag } from 'lucide-react';
import { useCurrencyStore } from '../../../store/currencyStore';

interface Order {
    _id: string;
    items: {
        productId: string;
        quantity: number;
        price: number;
    }[];
    total: number;
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
    createdAt: string;
    paymentMethod: 'cod' | 'card';
    address: string;
}

type OrderHistorySidebarProps = {
    isOpen: boolean;
    onClose: () => void;
};

const OrderHistorySidebar = ({ isOpen, onClose }: OrderHistorySidebarProps) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { isAuthenticated } = useAuthStore();
    const { formatPrice } = useCurrencyStore();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchOrders = async (silent = false) => {
        if (!isAuthenticated) return;
        if (!silent) setLoading(true);
        else setIsRefreshing(true);
        try {
            const response = await axios.get('/api/orders/my-orders');
            setOrders(response.data);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch orders');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchOrders();
        }
    }, [isOpen, isAuthenticated]);

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'pending': return { label: 'Processing', class: 'bg-stone-50 text-stone-400 border-stone-100 dark:bg-neutral-800 dark:text-stone-500 dark:border-neutral-700' };
            case 'confirmed': return { label: 'Confirmed', class: 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' };
            case 'shipped': return { label: 'In Transit', class: 'bg-white text-black border-black dark:bg-neutral-900 dark:text-white dark:border-white' };
            case 'delivered': return { label: 'Delivered', class: 'bg-stone-100 text-black border-stone-200 dark:bg-neutral-800 dark:text-white dark:border-neutral-700' };
            case 'cancelled': return { label: 'Cancelled', class: 'bg-stone-50 text-stone-300 border-stone-100 dark:bg-neutral-900 dark:text-stone-700 dark:border-neutral-800 line-through' };
            default: return { label: status, class: 'bg-stone-50 text-stone-600 dark:bg-stone-900/20 dark:text-stone-400 border-stone-100 dark:border-stone-900/20' };
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="fixed inset-0 z-[70] flex justify-end">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/20 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Sidebar */}
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative w-full max-w-md bg-white dark:bg-neutral-900 h-full shadow-premium flex flex-col border-l border-stone-200 dark:border-neutral-800 md:rounded-l-3xl p-8 md:p-10 pt-safe overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-stone-50 dark:bg-neutral-800 rounded-xl border border-stone-200 dark:border-neutral-800">
                            <Package className="w-4 h-4 text-black dark:text-white" />
                        </div>
                        <h2 className="text-xl font-black text-black dark:text-white uppercase tracking-tighter">My Orders</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => fetchOrders(true)}
                            title="Refresh Records"
                            className={`p-3 text-stone-400 hover:text-black dark:hover:text-white bg-stone-50 dark:bg-neutral-800 rounded-xl border border-stone-200 dark:border-neutral-800 transition-all ${isRefreshing ? 'animate-spin' : 'hover:scale-110'}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                        </button>
                        <button
                            onClick={onClose}
                            className="p-3 text-stone-400 hover:text-black dark:hover:text-white bg-stone-50 dark:bg-neutral-800 rounded-xl border border-stone-200 dark:border-neutral-800 transition-all hover:scale-110 hover:rotate-90 duration-300"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto no-scrollbar">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center">
                            <div className="w-12 h-12 border-2 border-stone-200 dark:border-stone-800 border-t-stone-900 dark:border-t-white rounded-full animate-spin mb-4" />
                            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Searching Archives...</p>
                        </div>
                    ) : error ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-rose-50 dark:bg-rose-900/10 rounded-[2.5rem] border border-rose-100 dark:border-rose-900/20">
                            <p className="text-sm font-black text-rose-600 dark:text-rose-400 uppercase tracking-tight">{error}</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                            <div className="w-20 h-20 bg-stone-50 dark:bg-neutral-800 rounded-2xl flex items-center justify-center border border-stone-200 dark:border-neutral-800">
                                <ShoppingBag className="w-8 h-8 text-stone-200 dark:text-stone-700" />
                            </div>
                            <div>
                                <p className="text-lg font-black text-black dark:text-white uppercase tracking-tight">No orders found</p>
                                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-2">Time to acquire your first piece</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-xl shadow-premium hover:scale-105 transition-all"
                            >
                                Explorer Collection
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {orders.map((order) => {
                                const status = getStatusConfig(order.status);
                                return (
                                    <div key={order._id} className="group relative bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm hover:shadow-premium hover:-translate-y-1 transition-all duration-500">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-stone-300 uppercase tracking-widest">Ref.</span>
                                                    <p className="font-black text-xs text-black dark:text-white uppercase tracking-tight">#{order._id.slice(-8).toUpperCase()}</p>
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                                                    <Calendar className="w-3" />
                                                    {formatDate(order.createdAt)}
                                                </div>
                                            </div>
                                            <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border ${status.class}`}>
                                                {status.label}
                                            </span>
                                        </div>

                                        {order.status === 'pending' && (
                                            <div className="mt-6 flex justify-end">
                                                <button
                                                    onClick={async () => {
                                                        if (window.confirm('Are you sure you want to cancel this order?')) {
                                                            try {
                                                                await axios.put(`/api/orders/${order._id}/cancel`);
                                                                fetchOrders(true);
                                                            } catch (err: any) {
                                                                alert(err.response?.data?.message || 'Failed to cancel order');
                                                            }
                                                        }
                                                    }}
                                                    className="px-6 py-2 bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 text-[9px] font-black uppercase tracking-widest rounded-xl border border-rose-100 dark:border-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-all"
                                                >
                                                    Cancel Acquisition
                                                </button>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between border-t border-stone-200 dark:border-neutral-800 pt-6 mt-6">
                                            <div className="space-y-1">
                                                <p className="text-[8px] font-black text-stone-400 uppercase tracking-[0.3em]">Investment</p>
                                                <p className="text-xl font-black text-black dark:text-white tracking-widest leading-none">
                                                    {formatPrice(order.total)}
                                                </p>
                                            </div>
                                            <div className="text-right space-y-1">
                                                <p className="text-[8px] font-black text-stone-400 uppercase tracking-[0.3em]">Quantity</p>
                                                <p className="font-black text-black dark:text-white text-sm uppercase tracking-tight">
                                                    {order.items.reduce((acc, item) => acc + item.quantity, 0)} Pieces
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="pt-10 pb-32 md:pb-0">
                    <button
                        onClick={onClose}
                        className="w-full py-5 bg-black dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-xl shadow-premium hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        Return to Store
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default OrderHistorySidebar;
