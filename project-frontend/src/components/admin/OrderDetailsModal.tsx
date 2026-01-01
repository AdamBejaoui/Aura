import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, MapPin, Package, Calendar, CreditCard, Hash, Ruler } from 'lucide-react';

interface OrderItem {
    productId: string;
    quantity: number;
    price: number;
}

interface Product {
    _id: string;
    name: string;
    images: string[];
}

interface Order {
    _id: string;
    fullName: string;
    email?: string;
    phone: string;
    address: string;
    size: string;
    items: OrderItem[];
    total: number;
    status: string;
    paymentMethod?: string;
    createdAt: string;
}

interface OrderDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: Order | null;
    products: Product[];
    getImageUrl: (path: string) => string;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
    isOpen,
    onClose,
    order,
    products,
    getImageUrl
}) => {
    if (!order) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-stone-950/40 backdrop-blur-xl"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.15)] overflow-hidden border border-stone-100 dark:border-neutral-800 flex flex-col max-h-[90vh]"
                        role="dialog"
                        aria-modal="true"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between bg-gray-50/50 dark:bg-neutral-800/50">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-stone-900 dark:bg-white text-white dark:text-black flex items-center justify-center shadow-lg transform -rotate-3">
                                    <Package className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-stone-900 dark:text-white uppercase tracking-tighter">
                                        Order Details
                                    </h3>
                                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mt-0.5">
                                        #{order._id.toUpperCase()}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-stone-400 hover:text-stone-900 dark:hover:text-white transition-all hover:rotate-90 duration-300 bg-white dark:bg-neutral-900 rounded-xl border border-gray-100 dark:border-neutral-800 shadow-sm"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-8 overflow-y-auto no-scrollbar space-y-8">
                            {/* Customer & Shipping Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-100 dark:border-amber-900/30">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Customer Info</p>
                                            <p className="text-sm font-bold text-stone-900 dark:text-white">{order.fullName}</p>
                                            {order.email && <p className="text-[10px] text-stone-400 font-medium">{order.email}</p>}
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 border border-blue-100 dark:border-blue-900/30">
                                            <Phone className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Phone Number</p>
                                            <p className="text-sm font-bold text-stone-900 dark:text-white">{order.phone}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-100 dark:border-emerald-900/30">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Shipping Address</p>
                                            <p className="text-sm font-bold text-stone-900 dark:text-white leading-relaxed">{order.address}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/10 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0 border border-purple-100 dark:border-purple-900/30">
                                            <Ruler className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Preferred Size</p>
                                            <p className="text-sm font-bold text-stone-900 dark:text-white uppercase">{order.size || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="bg-stone-50 dark:bg-neutral-800/50 rounded-[2rem] p-6 border border-gray-100 dark:border-neutral-800">
                                <div className="flex items-center justify-between mb-6">
                                    <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.25em] flex items-center gap-2">
                                        <Hash className="w-3 h-3" /> Items Breakdown
                                    </h4>
                                    <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-neutral-900 rounded-full border border-gray-100 dark:border-neutral-800 shadow-sm">
                                        <CreditCard className="w-3 h-3 text-stone-400" />
                                        <span className="text-[9px] font-black text-stone-900 dark:text-white uppercase tracking-widest">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Via Card'}</span>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {order.items.map((item, idx) => {
                                        const product = products.find(p => p._id === item.productId);
                                        return (
                                            <div key={idx} className="flex items-center justify-between gap-4 p-3 bg-white dark:bg-neutral-900 rounded-2xl border border-gray-50 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 rounded-xl border border-gray-100 dark:border-neutral-800 overflow-hidden bg-gray-50">
                                                        {product?.images?.[0] ? (
                                                            <img src={getImageUrl(product.images[0])} alt={product.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-300 uppercase text-[8px] font-black">?</div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-stone-900 dark:text-white">{product?.name || 'Unknown Product'}</p>
                                                        <p className="text-[10px] text-stone-400 font-bold mt-0.5 uppercase tracking-tighter">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-black text-stone-900 dark:text-white">${(item.quantity * item.price).toFixed(2)}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-neutral-800 flex flex-col gap-3">
                                    <div className="flex justify-between items-center px-2">
                                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Pricing Meta</p>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">Tax & Shipping incl.</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center bg-stone-900 dark:bg-white p-5 rounded-2xl shadow-xl shadow-stone-900/10 dark:shadow-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white/10 dark:bg-stone-900/10 rounded-lg">
                                                <CreditCard className="w-4 h-4 text-white dark:text-stone-900" />
                                            </div>
                                            <p className="text-xs font-black text-white dark:text-stone-900 uppercase tracking-[0.2em]">Acquisition Total</p>
                                        </div>
                                        <p className="text-2xl font-black text-white dark:text-stone-900 tracking-tight">${order.total.toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Order Context */}
                            <div className="flex items-center justify-between px-4">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-stone-400" />
                                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                                        Recorded on {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1 bg-stone-100 dark:bg-neutral-800 rounded-full border border-stone-200 dark:border-neutral-700">
                                    <div className="w-1.5 h-1.5 rounded-full bg-stone-900 dark:bg-white animate-pulse" />
                                    <span className="text-[9px] font-black text-stone-900 dark:text-white uppercase tracking-widest">{order.status}</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer / Actions */}
                        <div className="p-6 border-t border-gray-100 dark:border-neutral-800 bg-gray-50/30 dark:bg-neutral-800/20">
                            <button
                                onClick={onClose}
                                className="w-full py-4 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
                            >
                                Dismiss Details
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default OrderDetailsModal;
