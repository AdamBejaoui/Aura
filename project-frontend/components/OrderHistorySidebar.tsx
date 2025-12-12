import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'confirmed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'shipped': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
            case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Sidebar */}
            <div className="absolute inset-y-0 right-0 max-w-md w-full flex">
                <div className="w-full h-full bg-white dark:bg-neutral-900 shadow-2xl overflow-y-auto transform transition-transform animate-in slide-in-from-right duration-300">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                <Package className="w-6 h-6" />
                                My Orders
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 -mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center py-20">
                                <div className="w-8 h-8 border-4 border-stone-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : error ? (
                            <div className="text-center py-20">
                                <p className="text-red-500">{error}</p>
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="text-center py-20 bg-gray-50 dark:bg-neutral-900/50 rounded-2xl border border-gray-100 dark:border-neutral-800 border-dashed">
                                <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 dark:text-neutral-700 mb-4" />
                                <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">No orders yet</h2>
                                <p className="text-gray-500 dark:text-gray-400 mb-6">Start shopping to see your orders here.</p>
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2 bg-stone-900 dark:bg-white text-white dark:text-black rounded-xl font-medium hover:opacity-90 transition-opacity"
                                >
                                    Start Shopping
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.map((order) => (
                                    <div key={order._id} className="bg-gray-50 dark:bg-neutral-800/50 border border-gray-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <p className="font-bold text-sm text-gray-900 dark:text-white">#{order._id.slice(-6).toUpperCase()}</p>
                                                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDate(order.createdAt)}
                                                </div>
                                            </div>
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </div>

                                        <div className="border-t border-gray-200 dark:border-neutral-700 pt-3 flex items-center justify-between text-sm">
                                            <div>
                                                <p className="text-gray-500 dark:text-gray-400 text-xs mb-0.5">Total Amount</p>
                                                <p className="font-bold text-gray-900 dark:text-white text-base">${order.total.toFixed(2)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-gray-500 dark:text-gray-400 text-xs mb-0.5">Items</p>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {order.items.reduce((acc, item) => acc + item.quantity, 0)} items
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderHistorySidebar;
