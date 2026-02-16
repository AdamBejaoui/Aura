import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package,
    Search,
    Eye,
    Trash2
} from 'lucide-react';

export interface OrderItem {
    productId: string;
    quantity: number;
    price: number;
}

export interface Order {
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

interface Product {
    _id: string;
    name: string;
    images: string[];
}

interface OrderManagementProps {
    orders: Order[];
    products: Product[];
    pagination: any;
    activeDropdownId: string | null;
    setActiveDropdownId: (id: string | null) => void;
    updateOrderStatus: (orderId: string, status: string) => Promise<void>;
    handleDeleteOrder: (orderId: string) => void;
    setSelectedOrder: (order: Order) => void;
    setIsOrderModalOpen: (isOpen: boolean) => void;
    isFullAdmin: boolean;
    orderStatusFilter: string;
    setOrderStatusFilter: (status: any) => void;
    orderSortMode: 'newest' | 'status';
    setOrderSortMode: (mode: 'newest' | 'status') => void;
    setOrderPage: (page: number) => void;
    getStatusConfig: (status: string) => any;
    getImageUrl: (path: string) => string;
    Pagination: React.FC<{ pagination: any, onPageChange: (page: number) => void }>;
}

const OrderManagement: React.FC<OrderManagementProps> = ({
    orders,
    products,
    pagination,
    activeDropdownId,
    setActiveDropdownId,
    updateOrderStatus,
    handleDeleteOrder,
    setSelectedOrder,
    setIsOrderModalOpen,
    isFullAdmin,
    orderStatusFilter,
    setOrderStatusFilter,
    orderSortMode,
    setOrderPage,
    getStatusConfig,
    getImageUrl,
    Pagination
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredAndSearchedOrders = orders.filter(order => {
        const matchesStatus = orderStatusFilter === 'all' || order.status === orderStatusFilter;
        const matchesSearch =
            order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.email?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const sortedOrders = [...filteredAndSearchedOrders].sort((a, b) => {
        if (orderSortMode === 'newest') {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return a.status.localeCompare(b.status);
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Standardized Header */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8 bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-gray-100 dark:border-neutral-800 shadow-sm relative z-20">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-black flex items-center justify-center shadow-lg shadow-stone-900/10 dark:shadow-none">
                        <Package className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Order Management</h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                            Processing {orders.length} unique fulfillments
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                    <div className="relative w-full sm:w-64 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-stone-900 dark:group-focus-within:text-white transition-colors" />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-black border border-gray-100 dark:border-neutral-800 rounded-xl text-[13px] outline-none focus:ring-2 focus:ring-stone-500/20 transition-all font-medium"
                        />
                    </div>

                    <div className="flex items-center gap-2 p-1 bg-gray-50 dark:bg-black/40 rounded-2xl border border-gray-100 dark:border-neutral-800">
                        {['all', 'pending', 'confirmed'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setOrderStatusFilter(status)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${orderStatusFilter === status
                                    ? 'bg-stone-900 dark:bg-white text-white dark:text-black shadow-md'
                                    : 'text-gray-400 hover:text-stone-900 dark:hover:text-white'
                                    }`}
                            >
                                {status === 'all' ? 'All' : status}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {sortedOrders.length === 0 ? (
                <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] p-20 border border-gray-100 dark:border-neutral-800 text-center shadow-sm">
                    <div className="w-24 h-24 bg-gray-50 dark:bg-neutral-800 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <Package className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No results found</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">We couldn't find any orders matching your current filters. Try adjusting your search criteria or selecting a different status.</p>
                </div>
            ) : (
                <>
                    {/* PC VIEW: High-Density Table */}
                    <div className="hidden lg:block bg-white dark:bg-neutral-900 rounded-[2.5rem] border border-gray-100 dark:border-neutral-800 shadow-sm overflow-visible">
                        <div className="overflow-x-auto overflow-y-visible">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 dark:bg-neutral-800/50 border-b border-gray-100 dark:border-neutral-800">
                                        <th className="px-8 py-6 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Order / Customer</th>
                                        <th className="px-8 py-6 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Items</th>
                                        <th className="px-8 py-6 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Total Amount</th>
                                        <th className="px-8 py-6 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                        <th className="px-8 py-6 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Timestamp</th>
                                        <th className="px-8 py-6 text-right text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-neutral-800">
                                    <AnimatePresence>
                                        {sortedOrders.map((order, index) => {
                                            const statusConfig = getStatusConfig(order.status);
                                            const isLastItems = index >= sortedOrders.length - 2;
                                            return (
                                                <motion.tr
                                                    key={order._id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    whileInView={{ opacity: 1, x: 0 }}
                                                    viewport={{ once: true }}
                                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                                    className="hover:bg-gray-50/50 dark:hover:bg-neutral-800/30 transition-colors group"
                                                >
                                                    <td className="px-8 py-5">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">#{order._id.substring(order._id.length - 8).toUpperCase()}</span>
                                                            <span className="text-xs text-stone-500 font-medium mt-0.5">{order.fullName}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className="flex flex-col gap-2">
                                                            <div className="flex -space-x-2.5">
                                                                {order.items.slice(0, 3).map((item, idx) => {
                                                                    const product = products.find(p => p._id === item.productId);
                                                                    return (
                                                                        <div key={idx} className="w-9 h-9 rounded-xl border-[2.5px] border-white dark:border-neutral-900 bg-gray-100 overflow-hidden shadow-sm relative group/thumb">
                                                                            {product?.images?.[0] ? (
                                                                                <img src={getImageUrl(product.images[0])} className="w-full h-full object-cover" />
                                                                            ) : (
                                                                                <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-400">IMG</div>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                                {order.items.length > 3 && (
                                                                    <div className="w-9 h-9 rounded-xl border-[2.5px] border-white dark:border-neutral-900 bg-stone-900 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                                                                        +{order.items.length - 3}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{order.items.length} Product{order.items.length !== 1 ? 's' : ''}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <span className="text-base font-black text-gray-900 dark:text-white">${order.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className="relative">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setActiveDropdownId(activeDropdownId === order._id ? null : order._id);
                                                                }}
                                                                className={`aura-dropdown-toggle flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusConfig.bg} ${statusConfig.text} border border-transparent hover:border-current/20 shadow-sm`}
                                                            >
                                                                {statusConfig.icon}
                                                                {order.status}
                                                                <svg className={`w-3 h-3 transition-transform ${activeDropdownId === order._id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                                                            </button>

                                                            {activeDropdownId === order._id && (
                                                                <div className={`aura-dropdown !block ${isLastItems ? 'bottom-full mb-3' : 'top-full pt-3'} left-0 min-w-[160px] z-50`}>
                                                                    <div className="aura-dropdown-content">
                                                                        {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((status) => {
                                                                            const config = getStatusConfig(status);
                                                                            return (
                                                                                <button
                                                                                    key={status}
                                                                                    onClick={(e) => { e.stopPropagation(); updateOrderStatus(order._id, status); }}
                                                                                    className={`aura-dropdown-item ${order.status === status ? 'bg-stone-50 dark:bg-neutral-800 text-stone-900 dark:text-white' : ''}`}
                                                                                >
                                                                                    <div className={`w-4 h-4 flex items-center justify-center ${config.text}`}>
                                                                                        {config.icon}
                                                                                    </div>
                                                                                    {status}
                                                                                </button>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className="flex flex-col">
                                                            <span className="text-[11px] font-bold text-gray-900 dark:text-white uppercase tracking-tight">{new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                            <span className="text-[10px] text-gray-400 font-medium">{new Date(order.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedOrder(order);
                                                                    setIsOrderModalOpen(true);
                                                                }}
                                                                className="w-9 h-9 rounded-xl bg-gray-50/50 dark:bg-neutral-800/50 text-stone-400 hover:text-stone-900 dark:hover:text-white transition-all flex items-center justify-center border border-gray-100 dark:border-neutral-800 hover:border-stone-200 shadow-sm hover:scale-110 active:scale-95"
                                                                title="Order Details"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                            {isFullAdmin && (
                                                                <button
                                                                    onClick={() => handleDeleteOrder(order._id)}
                                                                    className="w-9 h-9 rounded-xl bg-red-50/50 dark:bg-red-900/10 text-stone-400 hover:text-red-500 transition-all flex items-center justify-center border border-transparent hover:border-red-100 dark:hover:border-red-900/30 shadow-sm hover:scale-110 active:scale-95"
                                                                    title="Delete Order"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            );
                                        })}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                        <Pagination pagination={pagination} onPageChange={setOrderPage} />
                    </div>

                    {/* MOBILE VIEW: SLEEK INTERACTIVE CARDS */}
                    <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-6">
                        {sortedOrders.map((order) => {
                            const statusConfig = getStatusConfig(order.status);
                            return (
                                <div
                                    key={order._id}
                                    onClick={() => {
                                        setSelectedOrder(order);
                                        setIsOrderModalOpen(true);
                                    }}
                                    className="bg-white dark:bg-neutral-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-neutral-800 shadow-sm overflow-hidden relative group transition-all active:scale-[0.98] cursor-pointer hover:border-stone-200 dark:hover:border-neutral-700"
                                >
                                    <div className="flex items-start justify-between mb-8">
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-gray-900 dark:text-white text-xl leading-none">#{order._id.substring(order._id.length - 8).toUpperCase()}</h3>
                                            <p className="text-sm font-bold text-stone-900 dark:text-white mt-2 truncate">{order.fullName}</p>
                                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1 opacity-70">{new Date(order.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="relative flex-shrink-0">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveDropdownId(activeDropdownId === order._id ? null : order._id);
                                                }}
                                                className={`aura-dropdown-toggle inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${statusConfig.bg} ${statusConfig.text} shadow-sm active:scale-90 transition-all`}
                                            >
                                                {statusConfig.icon}
                                                {order.status}
                                                <svg className={`w-3 h-3 transition-transform ${activeDropdownId === order._id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                                            </button>

                                            {activeDropdownId === order._id && (
                                                <div className="aura-dropdown !block top-full right-0 pt-3 min-w-[160px]">
                                                    <div className="aura-dropdown-content">
                                                        {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((status) => (
                                                            <button
                                                                key={status}
                                                                onClick={(e) => { e.stopPropagation(); updateOrderStatus(order._id, status); }}
                                                                className={`aura-dropdown-item ${order.status === status ? 'bg-stone-50 dark:bg-neutral-800 text-stone-900 dark:text-white' : ''}`}
                                                            >
                                                                <div className={`w-1.5 h-1.5 rounded-full ${getStatusConfig(status).bg.replace('100', '500')}`} />
                                                                {status}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                                            <div className="w-10 h-10 rounded-2xl bg-gray-50 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0 text-stone-400 border border-gray-100 dark:border-neutral-700">
                                                <svg className="w-4 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                            </div>
                                            <span className="font-bold tracking-tight text-gray-900 dark:text-white">{order.phone}</span>
                                        </div>
                                        <div className="flex items-start gap-4 text-sm text-gray-600 dark:text-gray-300">
                                            <div className="w-10 h-10 rounded-2xl bg-gray-50 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0 text-stone-400 mt-0.5 border border-gray-100 dark:border-neutral-700">
                                                <svg className="w-4 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                            </div>
                                            <span className="leading-relaxed font-medium mt-1">{order.address}</span>
                                        </div>
                                    </div>

                                    <div className="bg-stone-50 dark:bg-neutral-800/50 rounded-3xl p-5 mb-8 border border-gray-100 dark:border-neutral-800">
                                        <div className="flex items-center justify-between mb-4">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.25em]">Cart Contents</p>
                                            <span className="text-[10px] font-bold text-stone-900 dark:text-white px-2 py-0.5 bg-white dark:bg-neutral-700 rounded-full shadow-sm">{order.items.length} ITM</span>
                                        </div>
                                        <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
                                            {order.items.map((item, idx) => {
                                                const product = products.find(p => p._id === item.productId);
                                                return (
                                                    <div key={idx} className="flex-shrink-0 w-14 h-14 rounded-2xl border-2 border-white dark:border-neutral-700 bg-white overflow-hidden relative shadow-sm">
                                                        {product?.images?.[0] ? (
                                                            <img src={getImageUrl(product.images[0])} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-400">?</div>
                                                        )}
                                                        <div className="absolute top-0 right-0 w-6 h-6 bg-stone-900 text-white flex items-center justify-center text-[10px] font-bold rounded-bl-xl border-t-0 border-r-0 border-l border-b border-white shadow-sm">
                                                            {item.quantity}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between border-t border-gray-100 dark:border-neutral-800 pt-7">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-1">Charge Total</span>
                                            <span className="text-3xl font-black text-gray-900 dark:text-white leading-none">${order.total.toFixed(2)}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedOrder(order);
                                                    setIsOrderModalOpen(true);
                                                }}
                                                className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-neutral-800 text-stone-900 dark:text-white flex items-center justify-center active:scale-95 transition-transform border border-gray-100 dark:border-neutral-700"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                            {isFullAdmin && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteOrder(order._id);
                                                    }}
                                                    className="w-12 h-12 rounded-2xl bg-white dark:bg-neutral-800 text-red-500 flex items-center justify-center active:scale-95 transition-transform border border-red-50 dark:border-red-900/30 shadow-sm"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

export default OrderManagement;
