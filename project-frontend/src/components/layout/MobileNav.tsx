import React from 'react';
import { Home, Search, ShoppingBag, Heart, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';

const MobileNav: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isMobileSearchOpen, setMobileSearchOpen, isProductDetailOpen } = useUIStore();
    const { items: cartItems, checkoutOpen, toggleCheckout } = useCartStore();
    const { items: wishlistItems, isOpen: isWishlistOpen, toggleWishlist: toggleWishlistSidebar } = useWishlistStore();
    const { isOrdersOpen, setOrdersOpen, setProfileOpen, setAuthOpen, isProfileOpen, isAuthOpen } = useAuthStore();

    // Close all sidebars when location changes
    React.useEffect(() => {
        closeAll();
    }, [location.pathname]);

    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const wishlistCount = wishlistItems.length;

    const closeAll = () => {
        setMobileSearchOpen(false);
        toggleCheckout(false);
        if (isWishlistOpen) toggleWishlistSidebar();
        setProfileOpen(false);
        setAuthOpen(false);
        setOrdersOpen(false);
    };

    const navItems = [
        {
            id: 'home',
            label: 'Home',
            icon: Home,
            path: '/',
            action: () => {
                closeAll();
                if (location.pathname === '/') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                    navigate('/');
                }
            }
        },
        {
            id: 'search',
            label: 'Search',
            icon: Search,
            path: '/',
            action: () => {
                closeAll();
                if (location.pathname !== '/') {
                    navigate('/');
                    setTimeout(() => {
                        window.dispatchEvent(new Event('scrollToMainSearch'));
                    }, 100);
                } else {
                    window.dispatchEvent(new Event('scrollToMainSearch'));
                }
            }
        },
        {
            id: 'cart',
            label: 'Cart',
            icon: ShoppingBag,
            path: '/',
            action: () => {
                const wasOpen = checkoutOpen;
                closeAll();
                if (!wasOpen) toggleCheckout(true);
            },
            badge: cartCount
        },
        {
            id: 'wishlist',
            label: 'Wishlist',
            icon: Heart,
            path: '/',
            action: () => {
                const wasOpen = isWishlistOpen;
                closeAll();
                if (!wasOpen) toggleWishlistSidebar();
            },
            badge: wishlistCount
        },
        {
            id: 'orders',
            label: 'Orders',
            icon: Package,
            path: '/',
            action: () => {
                const wasOpen = isOrdersOpen;
                closeAll();
                if (!wasOpen) setOrdersOpen(true);
            }
        },
    ];

    if (isProfileOpen || isProductDetailOpen || isAuthOpen || checkoutOpen || isWishlistOpen || isOrdersOpen) return null;

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-[100] lg:hidden px-6 pb-8 pt-2 pointer-events-none mb-safe">
            <div className="max-w-md mx-auto pointer-events-auto">
                <div className="bg-white/70 dark:bg-black/70 backdrop-blur-2xl border border-stone-100/50 dark:border-neutral-800/50 rounded-[2.5rem] shadow-2xl shadow-stone-200/50 dark:shadow-none flex items-center justify-around p-2 premium-blur luxury-grain">
                    {navItems.map((item) => {
                        const isSearchActive = item.id === 'search' && isMobileSearchOpen;
                        const isCartActive = item.id === 'cart' && checkoutOpen;
                        const isWishlistActive = item.id === 'wishlist' && isWishlistOpen;
                        const isOrdersActive = item.id === 'orders' && isOrdersOpen;
                        const isHomeActive = item.id === 'home' && location.pathname === '/' && !isSearchActive && !isCartActive && !isWishlistActive && !isOrdersActive;

                        const isActive = isHomeActive || isSearchActive || isCartActive || isWishlistActive || isOrdersActive;
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
                                    whileTap={{ scale: 0.9 }}
                                    className={`relative z-10 transition-all duration-500 ${isActive
                                        ? 'text-black dark:text-white scale-110'
                                        : 'text-stone-400 dark:text-stone-600 group-hover:text-black dark:group-hover:text-white'
                                        }`}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2px]' : 'stroke-1.5'}`} />

                                    {item.badge !== undefined && item.badge > 0 && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute -top-1 -right-1 bg-black dark:bg-white text-white dark:text-black text-[7px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white dark:border-neutral-900"
                                        >
                                            {item.badge}
                                        </motion.span>
                                    )}
                                </motion.div>

                                {isActive && (
                                    <motion.div
                                        layoutId="mobileNavActive"
                                        className="absolute inset-x-1 inset-y-1 bg-stone-50 dark:bg-neutral-800/80 rounded-2xl -z-0"
                                        transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
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
