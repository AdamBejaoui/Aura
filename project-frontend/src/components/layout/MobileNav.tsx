import React from 'react';
import { Home, Search, ShoppingBag, Heart, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { useAuthStore } from '../../store/authStore';

const MobileNav: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { items: cartItems, toggleCheckout } = useCartStore();
    const { items: wishlistItems, toggleWishlist: toggleWishlistSidebar } = useWishlistStore();
    const { isAuthenticated, setProfileOpen, setAuthOpen } = useAuthStore();

    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const wishlistCount = wishlistItems.length;

    const navItems = [
        { id: 'home', label: 'Home', icon: Home, path: '/' },
        { id: 'search', label: 'Search', icon: Search, path: '/', action: () => { navigate('/'); setTimeout(() => document.querySelector('input[placeholder*="Search"]')?.scrollIntoView({ behavior: 'smooth' }), 100); } },
        { id: 'cart', label: 'Cart', icon: ShoppingBag, path: '/', action: () => toggleCheckout(true), badge: cartCount },
        { id: 'wishlist', label: 'Wishlist', icon: Heart, path: '/', action: () => toggleWishlistSidebar(), badge: wishlistCount },
        {
            id: 'profile', label: 'Profile', icon: User, path: '/', action: () => {
                if (isAuthenticated) {
                    setProfileOpen(true);
                } else {
                    setAuthOpen(true);
                }
            }
        },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden px-6 pb-8 pt-2 pointer-events-none">
            <div className="max-w-md mx-auto pointer-events-auto">
                <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-2xl border border-stone-100 dark:border-neutral-800 rounded-[2.5rem] shadow-2xl flex items-center justify-around p-3">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path && !item.action;
                        const Icon = item.icon;

                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    if (item.action) item.action();
                                    else navigate(item.path);

                                    // Haptic feedback
                                    if (typeof window !== 'undefined' && (window as any).inAppWebview) {
                                        (window as any).inAppWebview.postMessage(JSON.stringify({ type: 'hapticFeedback', data: { type: 'light' } }));
                                    }
                                }}
                                className="relative flex flex-col items-center justify-center w-full py-2 tap-highlight-transparent group"
                            >
                                <motion.div
                                    whileTap={{ scale: 0.8 }}
                                    className={`relative z-10 transition-all duration-500 ${isActive
                                        ? 'text-stone-900 dark:text-white scale-110'
                                        : 'text-stone-300 dark:text-stone-600 group-hover:text-stone-900 dark:group-hover:text-stone-300'
                                        }`}
                                >
                                    <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />

                                    {item.badge !== undefined && item.badge > 0 && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute -top-1 -right-1 bg-stone-900 dark:bg-white text-white dark:text-black text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-neutral-900"
                                        >
                                            {item.badge}
                                        </motion.span>
                                    )}
                                </motion.div>

                                {isActive && (
                                    <motion.div
                                        layoutId="mobileNavActive"
                                        className="absolute inset-x-1 inset-y-0.5 bg-stone-50 dark:bg-neutral-800/50 rounded-[2rem] -z-0"
                                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
};

export default MobileNav;
