import React from "react";
import { X, ShoppingBag, Trash2 } from "lucide-react";
import { useWishlistStore } from "../store/wishlistStore";
import { useCartStore } from "../store/cartStore";

const formatCurrency = (value: number, currency: string = 'USD') =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
        maximumFractionDigits: 0,
    }).format(value);

const WishlistSidebar = () => {
    const { items, isOpen, toggleWishlist, removeItem } = useWishlistStore();
    const { addItem, toggleCheckout } = useCartStore();

    if (!isOpen) return null;

    const handleAddToCart = (product: any) => {
        addItem(product);
        toggleWishlist();
        toggleCheckout(true); // Open cart to show added item
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
                onClick={toggleWishlist}
            />

            {/* Sidebar */}
            <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 h-full shadow-2xl flex flex-col transform transition-transform duration-300 animate-in slide-in-from-right">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-neutral-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        Your Wishlist
                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
                            {items.length}
                        </span>
                    </h2>
                    <button
                        onClick={toggleWishlist}
                        className="p-2 -mr-2 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-16 h-16 bg-gray-50 dark:bg-neutral-800 rounded-full flex items-center justify-center">
                                <ShoppingBag className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                            </div>
                            <div>
                                <p className="text-lg font-medium text-gray-900 dark:text-white">Your wishlist is empty</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Start saving your favorite items!</p>
                            </div>
                            <button
                                onClick={toggleWishlist}
                                className="mt-4 px-6 py-2.5 bg-stone-900 dark:bg-white text-white dark:text-black font-bold rounded-xl transition-transform active:scale-95"
                            >
                                Start Shopping
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {items.map((product) => (
                                <div key={product.id} className="group flex gap-4">
                                    <div className="relative w-24 h-32 bg-gray-100 dark:bg-neutral-800 rounded-lg overflow-hidden flex-shrink-0">
                                        <img
                                            src={product.images[0]}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between py-1">
                                        <div>
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                                                    {product.name}
                                                </h3>
                                                <button
                                                    onClick={() => removeItem(product.id)}
                                                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                    title="Remove from wishlist"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                {product.category}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between mt-4">
                                            <span className="font-bold text-gray-900 dark:text-white">
                                                {formatCurrency(product.price, product.currency)}
                                            </span>
                                            {product.inStock ? (
                                                <button
                                                    onClick={() => handleAddToCart(product)}
                                                    className="text-xs font-bold bg-stone-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg hover:shadow-lg active:scale-95 transition-all"
                                                >
                                                    Add to Cart
                                                </button>
                                            ) : (
                                                <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg">
                                                    Out of Stock
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WishlistSidebar;
