import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Package, Truck, ArrowRight, ShoppingBag, Globe } from 'lucide-react';
import axios from 'axios';
import { useCurrencyStore } from '../store/currencyStore';
import Plasma from '../components/ui/Plasma';

const OrderSuccess = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { formatPrice } = useCurrencyStore();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await axios.get(`/api/orders/${id}`);
                setOrder(response.data);
            } catch (err) {
                console.error('Failed to fetch order:', err);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchOrder();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-12 h-12 bg-stone-200 dark:bg-neutral-800 rounded-full" />
                    <div className="h-4 w-32 bg-stone-200 dark:bg-neutral-800 rounded" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black text-stone-900 dark:text-white relative overflow-hidden flex items-center justify-center p-4">
            <div className="absolute inset-0 pointer-events-none opacity-40">
                <Plasma color="#ffffff" speed={0.3} scale={2} opacity={0.5} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl w-full bg-white dark:bg-neutral-900 rounded-[3rem] shadow-2xl border border-stone-100 dark:border-neutral-800 overflow-hidden relative z-10"
            >
                <div className="p-8 md:p-12 text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 10, stiffness: 100 }}
                        className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-emerald-100 dark:border-emerald-900/20"
                    >
                        <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                    </motion.div>

                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">Acquisition Confirmed</h1>
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] mb-12">Order #{id?.slice(-8).toUpperCase()}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                        {[
                            { icon: Package, label: 'Processing', active: true },
                            { icon: Truck, label: 'Logistics', active: false },
                            { icon: Globe, label: 'Delivery', active: false },
                        ].map((step, i) => (
                            <div key={i} className={`p-6 rounded-3xl border transition-all ${step.active ? 'bg-stone-900 dark:bg-white text-white dark:text-black border-transparent shadow-xl' : 'bg-stone-50 dark:bg-neutral-800/50 border-stone-100 dark:border-neutral-800 text-stone-400'}`}>
                                <step.icon className="w-6 h-6 mx-auto mb-3" />
                                <p className="text-[10px] font-black uppercase tracking-widest">{step.label}</p>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-4 mb-12 text-left bg-stone-50 dark:bg-neutral-800/50 rounded-3xl p-8 border border-stone-100 dark:border-neutral-800">
                        <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] mb-4">Investment Summary</h3>
                        {order?.items.map((item: any, i: number) => (
                            <div key={i} className="flex justify-between items-center text-sm font-bold">
                                <span className="text-stone-500">{item.quantity}x {item.productId?.name || 'Archive Piece'}</span>
                                <span>{formatPrice(item.price * item.quantity)}</span>
                            </div>
                        ))}
                        <div className="h-px bg-stone-200 dark:bg-neutral-700 my-4" />
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest">Total Transaction</span>
                            <span className="text-xl font-black">{formatPrice(order?.total)}</span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="flex-1 py-5 bg-stone-900 dark:bg-white text-white dark:text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                        >
                            <ShoppingBag className="w-4 h-4" />
                            Continue Exploring
                        </button>
                        <button
                            onClick={() => navigate('/my-orders')}
                            className="px-8 py-5 bg-stone-50 dark:bg-neutral-800 text-stone-900 dark:text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border border-stone-100 dark:border-neutral-800 hover:bg-stone-100 dark:hover:bg-neutral-700 transition-all flex items-center justify-center gap-3"
                        >
                            Order Details
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default OrderSuccess;
