import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Sun,
    Moon,
    User,
    Package,
    LayoutDashboard,
    ShoppingCart,
    Globe,
    ChevronDown,
    Menu,
    Sparkles,
    Heart,
    LogOut
} from "lucide-react";
import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";
import { useAuthStore } from "../../store/authStore";
import { useThemeStore } from "../../store/themeStore";
import { useUIStore } from '../../store/uiStore';
import { useCurrencyStore, Currency } from "../../store/currencyStore";
import Magnetic from '../common/Magnetic';

const Navbar = () => {
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);

    const {
        user,
        isAuthenticated,
        logout,
        setAuthOpen,
    } = useAuthStore();

    const { theme, toggleTheme } = useThemeStore();
    const isDark = theme === "dark";

    const { currency, setCurrency } = useCurrencyStore();

    const { items: cartItems } = useCartStore();
    const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

    const { items: wishlistItems } = useWishlistStore();

    const isAdmin = user?.role === "admin" || user?.role === "co-admin";

    const { toggleNav, toggleCart, toggleWishlist, toggleProfile, toggleOrders } = useUIStore();

    // Click outside to close dropdowns
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;

            if (showUserMenu && !target.closest(".aura-dropdown") && !target.closest(".aura-dropdown-toggle")) {
                setShowUserMenu(false);
            }
            if (showCurrencyMenu && !target.closest(".aura-currency-dropdown") && !target.closest(".aura-currency-toggle")) {
                setShowCurrencyMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showUserMenu, showCurrencyMenu]);

    return (
        <header className="fixed top-0 left-0 right-0 z-[40] px-4 sm:px-6 lg:px-10 py-5 pt-safe md:pt-6">
            <div className="max-w-7xl mx-auto flex justify-between items-center premium-blur bg-white/70 dark:bg-black/70 backdrop-blur-2xl rounded-[2.5rem] border border-stone-100/50 dark:border-neutral-800/50 px-4 sm:px-8 py-4 shadow-2xl shadow-stone-200/50 dark:shadow-none">
                {/* LEFT: Star + Aura */}
                <Magnetic strength={0.2}>
                    <Link to="/" className="relative group flex items-center gap-2">
                        <motion.div
                            whileHover={{ rotate: 180 }}
                            transition={{ duration: 0.6, ease: "circOut" }}
                            className="relative w-8 h-8 flex items-center justify-center border border-black dark:border-white rounded-full overflow-hidden"
                        >
                            <Sparkles className="w-4 h-4 text-black dark:text-white" />
                            {/* Animated "frame" lines */}
                            <motion.div
                                initial={{ width: 0 }}
                                whileHover={{ width: '100%' }}
                                className="absolute top-0 left-0 h-[1px] bg-black dark:bg-white"
                            />
                            <motion.div
                                initial={{ height: 0 }}
                                whileHover={{ height: '100%' }}
                                className="absolute top-0 left-0 w-[1px] bg-black dark:bg-white"
                            />
                        </motion.div>
                        <div className="flex flex-col text-black dark:text-white">
                            <span className="text-xl font-black tracking-tighter uppercase leading-none relative">
                                Aura
                                <motion.span
                                    initial={{ width: 0 }}
                                    whileHover={{ width: '100%' }}
                                    className="absolute -bottom-1 left-0 h-[2px] bg-black dark:bg-white"
                                />
                            </span>
                            <span className="text-[8px] font-black tracking-[0.3em] uppercase opacity-50">Studio</span>
                        </div>
                    </Link>
                </Magnetic>

                <div className="flex items-center gap-2 sm:gap-4">

                    {/* Currency Selector */}
                    <div className="relative">
                        <Magnetic strength={0.2}>
                            <button
                                onClick={() => setShowCurrencyMenu(!showCurrencyMenu)}
                                className="aura-currency-toggle p-2.5 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white transition-all bg-white dark:bg-neutral-900 rounded-xl border border-stone-200 dark:border-neutral-800 hover:shadow-premium flex items-center gap-1.5"
                                aria-label="Select currency"
                            >
                                <Globe className="h-4 w-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">{currency}</span>
                                <ChevronDown className={`h-3 w-3 transition-transform ${showCurrencyMenu ? 'rotate-180' : ''}`} />
                            </button>
                        </Magnetic>

                        {showCurrencyMenu && (
                            <div className="aura-currency-dropdown absolute top-full right-0 pt-4 z-50">
                                <div className="bg-white dark:bg-neutral-900 rounded-[2rem] border border-stone-100 dark:border-neutral-800 shadow-2xl p-2 min-w-[120px]">
                                    {(['TND', 'USD', 'EUR', 'GBP'] as Currency[]).map((cur) => (
                                        <button
                                            key={cur}
                                            onClick={() => {
                                                setCurrency(cur);
                                                setShowCurrencyMenu(false);
                                            }}
                                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currency === cur ? 'bg-stone-900 dark:bg-white text-white dark:text-black' : 'text-stone-400 hover:bg-stone-50 dark:hover:bg-neutral-800 hover:text-stone-900 dark:hover:text-white'}`}
                                        >
                                            {cur}
                                            {currency === cur && <div className="w-1 h-1 bg-current rounded-full" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Theme Toggle */}
                    <Magnetic strength={0.2}>
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white transition-all bg-white dark:bg-neutral-900 rounded-xl border border-stone-200 dark:border-neutral-800 hover:shadow-premium"
                            aria-label="Toggle theme"
                        >
                            {isDark ? (
                                <Sun className="h-4 w-4" />
                            ) : (
                                <Moon className="h-4 w-4" />
                            )}
                        </button>
                    </Magnetic>

                    {/* Desktop Only Actions */}
                    {isAuthenticated && (
                        <Magnetic strength={0.2}>
                            <button
                                onClick={() => toggleOrders()}
                                className="hidden md:block relative p-2.5 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white transition-all bg-white dark:bg-neutral-900 rounded-xl border border-stone-200 dark:border-neutral-800 hover:shadow-premium"
                                aria-label="Order History"
                            >
                                <Package className="h-4 w-4" />
                            </button>
                        </Magnetic>
                    )}

                    <Magnetic strength={0.2}>
                        <button
                            onClick={() => toggleWishlist()}
                            className="hidden md:block relative p-2.5 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white transition-all bg-white dark:bg-neutral-900 rounded-xl border border-stone-200 dark:border-neutral-800 hover:shadow-premium"
                        >
                            <Heart className="h-4 w-4" />
                            {wishlistItems.length > 0 && (
                                <span className="absolute -top-1 -right-1 h-4 w-4 bg-black dark:bg-white rounded-full text-[8px] font-black text-white dark:text-black flex items-center justify-center border border-white dark:border-neutral-900">
                                    {wishlistItems.length}
                                </span>
                            )}
                        </button>
                    </Magnetic>

                    <Magnetic strength={0.2}>
                        <button
                            onClick={() => toggleCart()}
                            className="hidden md:block relative p-2.5 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white transition-all bg-white dark:bg-neutral-900 rounded-xl border border-stone-200 dark:border-neutral-800 hover:shadow-premium"
                            aria-label="Cart"
                        >
                            <ShoppingCart className="h-4 w-4 text-stone-900 dark:text-white" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-black dark:bg-white text-white dark:text-black text-[8px] font-black rounded-full flex items-center justify-center border border-white dark:border-neutral-900">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    </Magnetic>

                    <div className="relative">
                        <Magnetic strength={0.2}>
                            <button
                                onClick={() =>
                                    isAuthenticated ? setShowUserMenu(!showUserMenu) : setAuthOpen(true)
                                }
                                className="aura-dropdown-toggle p-2.5 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white transition-all bg-white dark:bg-neutral-900 rounded-xl border border-stone-200 dark:border-neutral-800 hover:shadow-premium"
                                aria-label="User account"
                            >
                                {isAuthenticated ? (
                                    <div className="w-4 h-4 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-[9px] font-black uppercase pointer-events-none overflow-hidden">
                                        {user?.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt={user.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            user?.name?.charAt(0) || user?.email?.charAt(0) || "U"
                                        )}
                                    </div>
                                ) : (
                                    <User className="h-4 w-4 pointer-events-none" />
                                )}
                            </button>
                        </Magnetic>

                        {/* User Dropdown */}
                        {showUserMenu && isAuthenticated && (
                            <div className="aura-dropdown !block top-full right-0 pt-4">
                                <div className="aura-dropdown-content">
                                    <div className="p-4 bg-stone-50 dark:bg-neutral-800/50 rounded-2xl mb-2">
                                        <p className="text-xs font-black text-stone-900 dark:text-white uppercase tracking-widest truncate">
                                            {user?.name}
                                        </p>
                                        <p className="text-[10px] text-stone-400 font-bold truncate">
                                            {user?.email}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <button
                                            onClick={() => {
                                                toggleProfile();
                                                setShowUserMenu(false);
                                            }}
                                            className="aura-dropdown-item"
                                        >
                                            <User className="w-4 h-4" />
                                            Profile
                                        </button>
                                        <button
                                            onClick={() => {
                                                toggleOrders();
                                                setShowUserMenu(false);
                                            }}
                                            className="aura-dropdown-item"
                                        >
                                            <Package className="w-4 h-4" />
                                            Acquisitions
                                        </button>
                                        {isAdmin && (
                                            <button
                                                onClick={() => {
                                                    navigate("/admin");
                                                    setShowUserMenu(false);
                                                }}
                                                className="aura-dropdown-item"
                                            >
                                                <LayoutDashboard className="w-4 h-4" />
                                                Dashboard
                                            </button>
                                        )}
                                        <div className="h-px bg-stone-100 dark:bg-neutral-800 mx-2 my-1" />
                                        <button
                                            onClick={() => {
                                                logout();
                                                setShowUserMenu(false);
                                            }}
                                            className="aura-dropdown-item !text-red-500 hover:!bg-red-50 dark:hover:!bg-red-900/10"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <Magnetic strength={0.2}>
                        <button
                            onClick={() => toggleNav(true)}
                            className="md:hidden p-2.5 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white transition-all bg-white dark:bg-neutral-900 rounded-xl border border-stone-200 dark:border-neutral-800 hover:shadow-premium"
                            aria-label="Open navigation menu"
                        >
                            <Menu className="h-4 w-4" />
                        </button>
                    </Magnetic>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
