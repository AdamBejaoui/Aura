import { X, ShoppingBag, Trash2, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useWishlistStore } from "../../../store/wishlistStore";
import { useCartStore } from "../../../store/cartStore";

const formatCurrency = (value: number, currency: string = 'USD') =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
        maximumFractionDigits: 0,
    }).format(value);

const WishlistSidebar = () => {
    const { items, toggleWishlist, removeItem } = useWishlistStore();
    const { addItem, toggleCheckout } = useCartStore();

    const handleAddToCart = (product: any) => {
        addItem(product);
        toggleWishlist();
        toggleCheckout(true);
    };

    return (
        <div className="fixed inset-0 z-[70] flex justify-end">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/20 backdrop-blur-md"
                onClick={toggleWishlist}
            />

            {/* Sidebar */}
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
                className="relative w-full max-w-md bg-white dark:bg-neutral-900 h-full shadow-premium flex flex-col border-l border-stone-200 dark:border-neutral-800 md:rounded-l-3xl p-8 md:p-10 pt-safe overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-stone-50 dark:bg-neutral-800 rounded-xl border border-stone-200 dark:border-neutral-800">
                            <Heart className="w-4 h-4 text-black dark:text-white" />
                        </div>
                        <h2 className="text-xl font-black text-black dark:text-white uppercase tracking-tighter flex items-center gap-2">
                            Wishlist
                            <span className="text-[10px] font-black text-stone-400 bg-stone-50 dark:bg-neutral-800 px-3 py-1 rounded-full border border-stone-200 dark:border-neutral-800">
                                {items.length}
                            </span>
                        </h2>
                    </div>
                    <button
                        onClick={toggleWishlist}
                        className="p-3 text-stone-400 hover:text-black dark:hover:text-white bg-stone-50 dark:bg-neutral-800 rounded-xl border border-stone-200 dark:border-neutral-800 transition-all hover:scale-110 hover:rotate-90 duration-300"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto no-scrollbar">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                            <div className="w-20 h-20 bg-stone-50 dark:bg-neutral-800 rounded-2xl flex items-center justify-center border border-stone-200 dark:border-neutral-800">
                                <ShoppingBag className="w-8 h-8 text-stone-200 dark:text-stone-700" />
                            </div>
                            <div>
                                <p className="text-lg font-black text-stone-900 dark:text-white uppercase tracking-tight">Your wishlist is empty</p>
                                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-2">Start saving your favorite pieces</p>
                            </div>
                            <button
                                onClick={toggleWishlist}
                                className="px-8 py-4 bg-stone-900 dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl hover:scale-105 transition-all"
                            >
                                Start Shopping
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {items.map((product) => (
                                <div key={product.id} className="group relative flex gap-6 p-4 rounded-2xl hover:bg-stone-50 dark:hover:bg-neutral-800/50 transition-all border border-transparent hover:border-stone-200 dark:hover:border-neutral-800/50">
                                    <div className="relative w-28 h-36 bg-stone-50 dark:bg-neutral-800 rounded-xl overflow-hidden flex-shrink-0 border border-stone-200 dark:border-neutral-800">
                                        <img
                                            src={product.images[0]}
                                            alt={product.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between py-2">
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-start">
                                                <h3 className="text-xs font-black text-stone-900 dark:text-white uppercase tracking-tight line-clamp-1">
                                                    {product.name}
                                                </h3>
                                                <button
                                                    onClick={() => removeItem(product.id)}
                                                    className="text-stone-300 hover:text-red-500 transition-colors p-1"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                                                {product.category}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xl font-black text-black dark:text-white tracking-tighter">
                                                {formatCurrency(product.price, product.currency)}
                                            </span>
                                            {product.inStock ? (
                                                <button
                                                    onClick={() => handleAddToCart(product)}
                                                    className="p-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl hover:shadow-xl active:scale-90 transition-all"
                                                >
                                                    <ShoppingBag className="w-4 h-4" />
                                                </button>
                                            ) : (
                                                <span className="text-[8px] font-black text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-3 py-1.5 rounded-lg uppercase">
                                                    Sold Out
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer - Optional Quick Actions */}
                {items.length > 0 && (
                    <div className="pt-10 pb-8 pb-safe md:pb-0">
                        <button
                            onClick={toggleWishlist}
                            className="w-full py-5 bg-black dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-xl shadow-premium hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            Return to Store
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default WishlistSidebar;
