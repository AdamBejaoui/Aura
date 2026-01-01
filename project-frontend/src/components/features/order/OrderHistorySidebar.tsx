import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../../store/authStore';
import { Package, Calendar, X, ShoppingBag } from 'lucide-react';

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

    useEffect(() => {
        if (isOpen && isAuthenticated) {
            setLoading(true);
            const fetchOrders = async () => {
                try {
                    const response = await axios.get('/api/orders/my-orders');
                    setOrders(response.data);
                    setError(null);
                } catch (err: any) {
                    setError(err.response?.data?.message || 'Failed to fetch orders');
                } finally {
                    setLoading(false);
                }
            };
            fetchOrders();
        }
    }, [isOpen, isAuthenticated]);

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'pending': return { label: 'Processing', class: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 border-amber-100 dark:border-amber-900/20' };
            case 'confirmed': return { label: 'Confirmed', class: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border-blue-100 dark:border-blue-900/20' };
            case 'shipped': return { label: 'In Transit', class: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/20' };
            case 'delivered': return { label: 'Delivered', class: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/20' };
            case 'cancelled': return { label: 'Cancelled', class: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 border-rose-100 dark:border-rose-900/20' };
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
                className="relative w-full max-w-md bg-white dark:bg-neutral-900 h-full shadow-[0_0_50px_rgba(0,0,0,0.1)] flex flex-col border-l border-stone-100 dark:border-neutral-800 md:rounded-l-[3rem] p-8 md:p-10 pt-safe overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-stone-50 dark:bg-neutral-800 rounded-2xl border border-stone-100 dark:border-neutral-800">
                            <Package className="w-5 h-5 text-stone-900 dark:text-white" />
                        </div>
                        <h2 className="text-xl font-black text-stone-900 dark:text-white uppercase tracking-tighter">My Orders</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 text-stone-400 hover:text-stone-900 dark:hover:text-white bg-stone-50 dark:bg-neutral-800 rounded-2xl border border-stone-100 dark:border-neutral-800 transition-all hover:scale-110 hover:rotate-90 duration-300"
                    >
                        <X className="w-5 h-5" />
                    </button>
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
                            <div className="w-20 h-20 bg-stone-50 dark:bg-neutral-800 rounded-[2rem] flex items-center justify-center border border-stone-100 dark:border-neutral-800">
                                <ShoppingBag className="w-8 h-8 text-stone-200 dark:text-stone-700" />
                            </div>
                            <div>
                                <p className="text-lg font-black text-stone-900 dark:text-white uppercase tracking-tight">No orders found</p>
                                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-2">Time to acquire your first piece</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="px-8 py-4 bg-stone-900 dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl hover:scale-105 transition-all"
                            >
                                Explorer Collection
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {orders.map((order) => {
                                const status = getStatusConfig(order.status);
                                return (
                                    <div key={order._id} className="group relative bg-white dark:bg-neutral-900 border border-stone-100 dark:border-neutral-800 rounded-[2rem] p-6 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-stone-300 uppercase tracking-widest">Ref.</span>
                                                    <p className="font-black text-xs text-stone-900 dark:text-white uppercase tracking-tight">#{order._id.slice(-8).toUpperCase()}</p>
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                                                    <Calendar className="w-3 h-3 text-stone-300" />
                                                    {formatDate(order.createdAt)}
                                                </div>
                                            </div>
                                            <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.1em] border ${status.class}`}>
                                                {status.label}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between border-t border-stone-100 dark:border-neutral-800 pt-6">
                                            <div className="space-y-1">
                                                <p className="text-[8px] font-black text-stone-400 uppercase tracking-[0.2em]">Investment</p>
                                                <p className="text-lg font-black text-stone-900 dark:text-white tracking-widest leading-none">
                                                    ${order.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                            <div className="text-right space-y-1">
                                                <p className="text-[8px] font-black text-stone-400 uppercase tracking-[0.2em]">Quantity</p>
                                                <p className="font-black text-stone-900 dark:text-white text-sm uppercase tracking-tight">
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
                        className="w-full py-5 bg-stone-900 dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        Return to Store
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default OrderHistorySidebar;
