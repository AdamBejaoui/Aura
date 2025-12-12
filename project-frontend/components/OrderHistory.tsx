import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { Package, Calendar, MapPin, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Plasma from './Plasma';

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

const OrderHistory = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { isAuthenticated } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/');
            return;
        }

        const fetchOrders = async () => {
            try {
                // Ensure auth header is set (should be by store interpolator, but safe to check)
                const response = await axios.get('/api/orders/my-orders');
                setOrders(response.data);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to fetch orders');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [isAuthenticated, navigate]);

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
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950 text-gray-900 dark:text-white relative">
            <div className="fixed inset-0 pointer-events-none opacity-20 dark:opacity-30 z-0">
                <Plasma color="#808080" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/" className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-3xl font-bold">My Orders</h1>
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
                    <div className="text-center py-20 bg-gray-50 dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800">
                        <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 dark:text-neutral-700 mb-4" />
                        <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">Looks like you haven't bought anything yet.</p>
                        <Link to="/" className="px-6 py-2 bg-stone-900 dark:bg-white text-white dark:text-black rounded-xl font-medium hover:opacity-90 transition-opacity">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order._id} className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gray-100 dark:bg-neutral-800 rounded-full flex items-center justify-center">
                                            <Package className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">Order #{order._id.slice(-6).toUpperCase()}</p>
                                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(order.createdAt)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                        <span className="font-bold text-lg">
                                            ${order.total.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 dark:border-neutral-800 pt-4 flex flex-col sm:flex-row justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white mb-1">Items ({order.items.reduce((acc, item) => acc + item.quantity, 0)})</p>
                                        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                                            {/* We don't have product details populated in my-orders endpoint yet, 
                                                we only have productId. Ideally backend should populate. 
                                                For now we just show count. 
                                                Actually, let's update backend to populate items.product if possible, 
                                                but for MVP just listing count is okay or using productId if available. 
                                            */}
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2 max-w-xs">
                                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <p className="truncate">{order.address}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderHistory;
