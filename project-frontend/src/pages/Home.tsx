import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    ShoppingCart,
    Heart,
    ArrowUpRight,
    Star,
    Moon,
    Sun,
    Package,
    LogOut,
    User,
    RefreshCw,
    Filter as FilterIcon,
    LayoutDashboard,
    Eye,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import LoadingScreen from '../components/common/LoadingScreen';
import { toast } from 'sonner';
import axios from "axios";
import Plasma from "../components/ui/Plasma";
import ProductDetailModal from "../components/features/product/ProductDetailModal";
import CartCheckout from "../components/features/cart/CartCheckout";
import { useCartStore } from "../store/cartStore";
import Footer from "../components/layout/Footer";
import FilterSidebar from "../components/common/FilterSidebar";
import WishlistSidebar from "../components/features/wishlist/WishlistSidebar";
import AuthModal from "../components/features/auth/AuthModal";
import ConfirmationModal from "../components/common/ConfirmationModal";
import { useWishlistStore } from "../store/wishlistStore";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import { useUIStore } from "../store/uiStore";
import OrderHistorySidebar from "../components/features/order/OrderHistorySidebar";
import AccountSidebar from "../components/features/auth/AccountSidebar";
import { Product } from "../types";

const API_BASE = '';

const categories = [
    "All",
    "New Arrivals",
    "Wardrobe Staples",
    "Statement Pieces",
    "Streetwear",
    "Evening Luxe",
] as const;

const formatCurrency = (value: number, currency: string = 'USD') =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
        maximumFractionDigits: 0,
    }).format(value);

// Product Image Carousel Component for hover effect
const ProductImageCarousel = ({ images, productName }: { images: string[]; productName: string }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

    React.useEffect(() => {
        if (isHovered && images.length > 1) {
            intervalRef.current = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % images.length);
            }, 800); // Change image every 0.8 seconds
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            setCurrentIndex(0); // Reset to first image when not hovered
        }
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isHovered, images.length]);

    return (
        <div
            className="relative w-full h-full"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {images.map((image, index) => (
                <img
                    key={index}
                    src={image || "https://placehold.co/800x1000/f8fafc/94a3b8?text=No+Image"}
                    alt={`${productName} - Image ${index + 1}`}
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-[400ms] group-hover/card:scale-110 ${index === currentIndex
                        ? 'opacity-100 scale-100'
                        : 'opacity-0 scale-105'
                        }`}
                    onError={(e) =>
                    ((e.target as HTMLImageElement).src =
                        "https://placehold.co/800x1000/f8fafc/94a3b8?text=No+Image")
                    }
                />
            ))}
        </div>
    );
};

function Home() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const mainSearchRef = useRef<HTMLInputElement>(null);
    const mobileSearchRef = useRef<HTMLInputElement>(null);
    const categoryScrollRef = useRef<HTMLDivElement>(null);

    const scrollCategories = (direction: 'left' | 'right') => {
        if (categoryScrollRef.current) {
            const scrollAmount = direction === 'left' ? -300 : 300;
            categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState<(typeof categories)[number]>("All");
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const [isPulling, setIsPulling] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { isMobileSearchOpen, setMobileSearchOpen } = useUIStore();
    const { theme, toggleTheme } = useThemeStore();
    const isDark = theme === 'dark';

    useEffect(() => {
        if (isMobileSearchOpen) {
            setTimeout(() => {
                mobileSearchRef.current?.focus();
            }, 100);
        }
    }, [isMobileSearchOpen]);

    // Expose function to scroll to main search bar (for mobile nav)
    useEffect(() => {
        const handleScrollToSearch = () => {
            if (mainSearchRef.current) {
                mainSearchRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => {
                    mainSearchRef.current?.focus();
                }, 400);
            }
        };

        // Listen for custom event from mobile nav
        window.addEventListener('scrollToMainSearch', handleScrollToSearch);
        return () => window.removeEventListener('scrollToMainSearch', handleScrollToSearch);
    }, []);

    // Filters State
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const {
        user,
        isAuthenticated,
        logout,
        isProfileOpen,
        isOrdersOpen,
        isAuthOpen,
        setProfileOpen,
        setOrdersOpen,
        setAuthOpen
    } = useAuthStore();
    const isAdmin = user?.role === 'admin' || user?.role === 'co-admin';
    const [filters, setFilters] = useState({
        minPrice: '',
        maxPrice: '',
        inStock: false,
        sort: 'newest'
    });

    const handleFilterChange = (key: string, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            minPrice: '',
            maxPrice: '',
            inStock: false,
            sort: 'newest'
        });
    };

    const {
        items,
        addItem,
        checkoutOpen,
        toggleCheckout,
        updateQuantity,
        setConfirmationMessage,
        confirmationMessage,
    } = useCartStore();

    // Theme sync handled by themeStore or App
    useEffect(() => {
        if (typeof window === 'undefined') return;
        document.documentElement.classList.toggle('dark', isDark);
        // localStorage set by persist middleware in store
    }, [theme, isDark]);

    const { items: wishlistItemsList, toggleWishlist: toggleWishlistSidebar, toggleItem, isOpen: isWishlistOpen } = useWishlistStore();

    const handleRefresh = async () => {
        setIsRefreshing(true);
        setIsPulling(false);
        setPullDistance(0);

        try {
            const params = new URLSearchParams();
            if (activeCategory !== 'All') params.append('category', activeCategory);
            // ... re-use existing fetch logic or call it
            await fetchProducts();
            toast.success('Updated');
        } catch (err) {
            toast.error('Failed to refresh');
        } finally {
            setIsRefreshing(false);
        }
    };

    const onTouchStart = (e: React.TouchEvent) => {
        if (window.scrollY === 0) {
            setIsPulling(true);
            setStartY(e.touches[0].pageY);
        }
    };

    const [startY, setStartY] = useState(0);

    const onTouchMove = (e: React.TouchEvent) => {
        if (!isPulling) return;
        const currentY = e.touches[0].pageY;
        const distance = currentY - startY;
        if (distance > 0) {
            setPullDistance(Math.min(distance * 0.4, 80));
            if (distance > 10) {
                if (e.cancelable) e.preventDefault();
            }
        }
    };

    const onTouchEnd = () => {
        if (pullDistance > 60) {
            handleRefresh();
        } else {
            setIsPulling(false);
            setPullDistance(0);
        }
    };


    const fetchProducts = async () => {
        try {
            console.log('Fetching products from archive...');
            // Only show full-page loading on initial mount
            if (products.length === 0 && !isRefreshing) {
                setLoading(true);
            }

            const params = new URLSearchParams();
            if (activeCategory !== 'All') params.append('category', activeCategory);
            if (filters.minPrice) params.append('minPrice', filters.minPrice);
            if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
            if (filters.inStock) params.append('inStock', 'true');
            if (filters.sort) params.append('sort', filters.sort);

            const response = await axios.get(`${API_BASE}/api/products?${params.toString()}`);
            console.log(`Received ${response.data.length} items from server.`);

            const formattedProducts = response.data.map((product: any) => {
                let images: string[] = [];
                if (Array.isArray(product.images) && product.images.length > 0) {
                    images = product.images.map((img: string) =>
                        img.startsWith("http") ? img : `${API_BASE}${img}`
                    );
                } else {
                    images = [
                        "https://placehold.co/800x1000/f8fafc/94a3b8?text=No+Image",
                    ];
                }
                return {
                    id: product._id,
                    name: product.name,
                    category: product.category,
                    price: product.price,
                    description: product.description,
                    rating: product.rating || 0,
                    reviews: Array.isArray(product.reviews) ? product.reviews : [],
                    numReviews: product.numReviews || (Array.isArray(product.reviews) ? product.reviews.length : 0),
                    images,
                    inStock: product.inStock !== undefined ? product.inStock : true,
                    currency: product.currency || 'TND',
                };
            });
            console.log('Formatted products:', formattedProducts);
            setProducts(formattedProducts);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch archive items:", err);
            setError("The boutique archives are temporarily offline. Please sync your connection.");
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [activeCategory, filters]);

    // Click outside to close dropdowns
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (!showUserMenu) return;

            const target = e.target as HTMLElement;
            if (!target.closest('.aura-dropdown') && !target.closest('.aura-dropdown-toggle')) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showUserMenu]);

    const filteredProducts = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        return products.filter((product) => {
            const matchesCategory =
                activeCategory === "All" || product.category === activeCategory;
            const matchesQuery =
                !query ||
                product.name.toLowerCase().includes(query) ||
                product.description.toLowerCase().includes(query);
            return matchesCategory && matchesQuery;
        });
    }, [searchTerm, products]);

    const handleOpenModal = (product: Product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleAddToCart = (product: Product) => {
        addItem(product);
        toggleCheckout(true);
        setConfirmationMessage(null);
    };

    const cartCount = items.reduce((count, item) => count + item.quantity, 0);
    const wishlistedIds = useWishlistStore(state => state.items.map((item: Product) => item.id));

    if (loading) {
        return <LoadingScreen message="Unveiling Essentials..." />;
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black transition-colors duration-300">
                <p className="text-gray-600 dark:text-gray-400">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white font-sans transition-colors duration-300 relative">
            {/* Plasma Background Effect - Disabled on mobile for performance */}
            <div className="absolute inset-0 pointer-events-none opacity-60 dark:opacity-50 hidden md:block">
                <Plasma
                    color={isDark ? '#ffffff' : '#ffffff'}
                    speed={0.5}
                    direction="forward"
                    scale={1.5}
                    opacity={isDark ? 0.5 : 0.6}
                    mouseInteractive={false}
                />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-50 premium-blur px-4 sm:px-6 lg:px-10 py-5 pt-safe md:pt-6">
                <div className="max-w-7xl mx-auto flex justify-between items-center">

                    {/* LEFT: Star + Aura */}
                    <div className="flex items-center gap-3 group cursor-pointer" onClick={() => {
                        if (window.location.pathname === '/') {
                            window.location.reload();
                        } else {
                            navigate('/');
                        }
                    }}>
                        <div className="relative w-5 h-5 bg-stone-900 dark:bg-white [clip-path:polygon(50%_0%,70%_30%,100%_50%,70%_70%,50%_100%,30%_70%,0%_50%,30%_30%)] before:content-[''] before:absolute before:inset-0 before:bg-stone-900 dark:before:bg-white before:blur-md before:opacity-60 group-hover:scale-110 transition-transform duration-500"></div>
                        <span className="text-2xl font-black tracking-tighter text-aura-gradient uppercase">
                            Aura
                        </span>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Admin Dashboard Button (Mobile Only) */}
                        {isAuthenticated && isAdmin && (
                            <button
                                onClick={() => navigate('/admin')}
                                className="md:hidden p-2.5 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white transition-all bg-stone-50 dark:bg-neutral-800 rounded-2xl border border-stone-100 dark:border-neutral-800 hover:shadow-lg"
                                aria-label="Admin Dashboard"
                            >
                                <LayoutDashboard className="h-5 w-5" />
                            </button>
                        )}

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white transition-all bg-stone-50 dark:bg-neutral-800 rounded-2xl border border-stone-100 dark:border-neutral-800 hover:shadow-lg"
                            aria-label="Toggle theme"
                        >
                            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </button>

                        {isAuthenticated && (
                            <button
                                onClick={() => setOrdersOpen(true)}
                                className="hidden md:block relative p-2.5 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white transition-all bg-stone-50 dark:bg-neutral-800 rounded-2xl border border-stone-100 dark:border-neutral-800 hover:shadow-lg"
                                aria-label="Order History"
                            >
                                <Package className="h-5 w-5" />
                            </button>
                        )}

                        <button
                            onClick={toggleWishlistSidebar}
                            className="hidden md:block relative p-2.5 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white transition-all bg-stone-50 dark:bg-neutral-800 rounded-2xl border border-stone-100 dark:border-neutral-800 hover:shadow-lg"
                        >
                            <Heart className="h-5 w-5" />
                            {wishlistItemsList.length > 0 && (
                                <span className="absolute -top-1 -right-1 h-5 w-5 bg-stone-900 dark:bg-white rounded-full text-[10px] font-black text-white dark:text-black flex items-center justify-center border-2 border-white dark:border-neutral-900">
                                    {wishlistItemsList.length}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={() => toggleCheckout(true)}
                            className="hidden md:block relative p-2.5 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white transition-all bg-stone-50 dark:bg-neutral-800 rounded-2xl border border-stone-100 dark:border-neutral-800 hover:shadow-lg"
                            aria-label="Cart"
                        >
                            <ShoppingCart className="h-5 w-5 text-stone-900 dark:text-white" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-stone-900 dark:bg-white text-white dark:text-black text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-neutral-900">
                                    {cartCount}
                                </span>
                            )}
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => isAuthenticated ? setShowUserMenu(!showUserMenu) : setAuthOpen(true)}
                                className="aura-dropdown-toggle p-2.5 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white transition-all bg-stone-50 dark:bg-neutral-800 rounded-2xl border border-stone-100 dark:border-neutral-800 hover:shadow-lg"
                                aria-label="User account"
                            >
                                {isAuthenticated ? (
                                    <div className="w-5 h-5 rounded-full bg-stone-900 dark:bg-white text-white dark:text-black flex items-center justify-center text-[10px] font-black uppercase pointer-events-none">
                                        {user?.name.charAt(0)}
                                    </div>
                                ) : (
                                    <User className="h-5 w-5 pointer-events-none" />
                                )}
                            </button>

                            {/* User Dropdown */}
                            {showUserMenu && isAuthenticated && (
                                <div className="aura-dropdown !block top-full right-0 pt-4">
                                    <div className="aura-dropdown-content">
                                        <div className="p-4 bg-stone-50 dark:bg-neutral-800/50 rounded-2xl mb-2">
                                            <p className="text-xs font-black text-stone-900 dark:text-white uppercase tracking-widest truncate">{user?.name}</p>
                                            <p className="text-[10px] text-stone-400 font-bold truncate">{user?.email}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <button
                                                onClick={() => {
                                                    setProfileOpen(true);
                                                    setShowUserMenu(false);
                                                }}
                                                className="aura-dropdown-item"
                                            >
                                                <User className="w-4 h-4" />
                                                Profile
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setOrdersOpen(true);
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
                                                        navigate('/admin');
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
                                                    setShowLogoutConfirm(true);
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
                    </div>
                </div>

            </header>

            {/* Pull to Refresh Indicator */}
            <div
                className="fixed top-24 left-0 right-0 z-40 flex justify-center pointer-events-none"
                style={{ transform: `translateY(${pullDistance}px)` }}
            >
                <motion.div
                    animate={isRefreshing ? { rotate: 360 } : {}}
                    transition={isRefreshing ? { repeat: Infinity, duration: 1, ease: "linear" } : {}}
                    className={`bg - white dark: bg - neutral - 900 p - 3 rounded - full shadow - 2xl border border - stone - 100 dark: border - neutral - 800 transition - opacity duration - 300 ${pullDistance > 10 || isRefreshing ? 'opacity-100' : 'opacity-0'
                        } `}
                >
                    <RefreshCw className={`w - 5 h - 5 text - stone - 900 dark: text - white ${isRefreshing ? 'animate-spin' : ''} `} />
                </motion.div>
            </div>

            <div
                className="relative"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >


                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-16 relative z-10">
                    {/* Hero Section - Refined */}
                    <div className="relative mb-24 overflow-hidden rounded-[3rem] bg-stone-900 dark:bg-white text-white dark:text-black p-12 md:p-24 shadow-2xl shadow-stone-200 dark:shadow-none min-h-[500px] flex flex-col justify-center">
                        {/* Interactive Background Glow */}
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-white/10 to-transparent rounded-full -mr-32 -mt-32 blur-[100px] pointer-events-none transition-transform duration-1000 group-hover:scale-110"></div>
                        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-white/5 to-transparent rounded-full -ml-16 -mb-16 blur-[80px] pointer-events-none"></div>

                        <div className="relative z-10 max-w-2xl">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <span className="inline-block px-4 py-1.5 bg-white/10 dark:bg-black/5 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-8 border border-white/10 dark:border-black/5">
                                    New Collection 2025
                                </span>
                                <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-[0.9] uppercase">
                                    Redefining <br />
                                    <span className="text-white/40 dark:text-black/30 italic font-light lowercase">modern</span> movement
                                </h1>
                                <p className="text-lg md:text-xl text-white/60 dark:text-black/60 mb-12 max-w-lg font-medium leading-relaxed">
                                    Pieces designed to evolve with you. Timeless silhouettes, ethically crafted materials, and precision tailoring.
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <button className="px-10 py-5 bg-white dark:bg-black text-black dark:text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-xl">
                                        Explore Collection
                                    </button>
                                    <button className="px-10 py-5 bg-white/5 dark:bg-black/5 backdrop-blur-md border border-white/10 dark:border-black/10 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 dark:hover:bg-black/10 transition-all">
                                        Our Story
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Filters - Category Scroll */}
                    <div className="relative max-w-7xl mx-auto mb-16 group">
                        {/* Desktop Scroll Buttons */}
                        <button
                            onClick={() => scrollCategories('left')}
                            className="absolute -left-4 top-1/2 -translate-y-full z-10 p-3 bg-white dark:bg-neutral-900 border border-stone-100 dark:border-neutral-800 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all hidden md:flex items-center justify-center hover:scale-110 active:scale-95"
                            aria-label="Scroll left"
                        >
                            <ChevronLeft className="w-4 h-4 text-stone-900 dark:text-white" />
                        </button>

                        <div
                            ref={categoryScrollRef}
                            className="flex flex-nowrap overflow-x-auto gap-4 px-4 md:px-0 pb-6 no-scrollbar snap-x snap-mandatory"
                        >
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => {
                                        setActiveCategory(category);
                                        if (typeof window !== 'undefined' && (window as any).inAppWebview) {
                                            (window as any).inAppWebview.postMessage(JSON.stringify({ type: 'hapticFeedback', data: { type: 'light' } }));
                                        }
                                    }}
                                    className={`flex-shrink-0 snap-center px-8 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all duration-300 border ${activeCategory === category
                                        ? "text-white bg-stone-900 dark:bg-white dark:text-black shadow-2xl shadow-stone-900/20 dark:shadow-none border-transparent scale-105"
                                        : "text-stone-400 dark:text-stone-500 hover:text-stone-900 dark:hover:text-white bg-white dark:bg-neutral-900 border-stone-100 dark:border-neutral-800 hover:shadow-xl"
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => scrollCategories('right')}
                            className="absolute -right-4 top-1/2 -translate-y-full z-10 p-3 bg-white dark:bg-neutral-900 border border-stone-100 dark:border-neutral-800 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all hidden md:flex items-center justify-center hover:scale-110 active:scale-95"
                            aria-label="Scroll right"
                        >
                            <ChevronRight className="w-4 h-4 text-stone-900 dark:text-white" />
                        </button>

                        {/* Fade gradients - subtle */}
                        <div className="absolute right-0 top-0 bottom-6 w-12 bg-gradient-to-l from-gray-50/50 dark:from-black/50 to-transparent pointer-events-none" />
                        <div className="absolute left-0 top-0 bottom-6 w-12 bg-gradient-to-r from-gray-50/50 dark:from-black/50 to-transparent pointer-events-none" />
                    </div>

                    {/* Filters and Search Layout */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
                        <div className="relative flex-1 max-w-xl group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 group-focus-within:text-stone-900 dark:group-focus-within:text-white transition-colors" />
                            <input
                                ref={mainSearchRef}
                                id="main-search-input"
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search our collection..."
                                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-neutral-900 border border-stone-100 dark:border-neutral-800 rounded-3xl focus:outline-none focus:ring-4 focus:ring-stone-900/5 dark:focus:ring-white/5 focus:border-stone-400 dark:focus:border-neutral-600 transition-all font-medium text-sm shadow-sm"
                            />
                        </div>

                        <button
                            onClick={() => setIsFilterOpen(true)}
                            className="flex items-center gap-3 px-8 py-4 bg-white dark:bg-neutral-900 border border-stone-100 dark:border-neutral-800 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-stone-50 dark:hover:bg-neutral-800 transition-all shadow-sm group"
                        >
                            <FilterIcon className="w-4 h-4 text-stone-400 group-hover:text-stone-900 dark:group-hover:text-white transition-colors" />
                            Filters & Sort
                            {(filters.minPrice || filters.maxPrice || filters.inStock || filters.sort !== 'newest') && (
                                <span className="w-1.5 h-1.5 bg-stone-900 dark:bg-white rounded-full animate-pulse"></span>
                            )}
                        </button>
                    </div>

                    {/* Products Grouped by Category */}
                    {filteredProducts.length === 0 ? (
                        <div className="text-center py-20 text-stone-500 dark:text-gray-400">
                            No pieces found. Explore our full collection.
                        </div>
                    ) : (
                        <div className="space-y-24">
                            {categories.filter(cat => cat !== 'All').map((category) => {
                                const productsInCategory = filteredProducts.filter(p => p.category === category);
                                // If we are filtering by a specific category, only show that category
                                if (activeCategory !== 'All' && activeCategory !== category) return null;
                                if (productsInCategory.length === 0) return null;

                                return (
                                    <div key={category} className="relative">
                                        {/* Category Header */}
                                        <div className="flex items-end justify-between mb-8 px-4 md:px-0">
                                            <div className="space-y-1">
                                                <h3 className="text-2xl font-black text-stone-900 dark:text-white uppercase tracking-tighter">{category}</h3>
                                                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">The {category} Archives</p>
                                            </div>
                                            <button className="text-[10px] font-black text-stone-900 dark:text-white uppercase tracking-widest px-6 py-2 border border-stone-100 dark:border-neutral-800 rounded-full hover:bg-stone-50 dark:hover:bg-neutral-800 transition-all">
                                                View Collection
                                            </button>
                                        </div>

                                        {/* Horizontal Scroll Container */}
                                        <div className="relative">
                                            <div className="flex overflow-x-auto no-scrollbar gap-8 pb-8 snap-x snap-mandatory px-4 md:px-0">
                                                {productsInCategory.map((product) => (
                                                    <div
                                                        key={product.id}
                                                        onClick={() => handleOpenModal(product)}
                                                        className="flex-shrink-0 w-[280px] md:w-[340px] snap-start group/card relative bg-white dark:bg-neutral-900 rounded-[2.5rem] overflow-hidden border border-stone-100 dark:border-neutral-800 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-700 cursor-pointer"
                                                    >
                                                        <div className="relative aspect-[1/1] overflow-hidden bg-stone-50 dark:bg-neutral-800">
                                                            {product.images.length > 1 ? (
                                                                <ProductImageCarousel images={product.images} productName={product.name} />
                                                            ) : (
                                                                <img
                                                                    src={product.images[0] || "https://placehold.co/800x1000/f8fafc/94a3b8?text=No+Image"}
                                                                    alt={product.name}
                                                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover/card:scale-110"
                                                                    onError={(e) =>
                                                                    ((e.target as HTMLImageElement).src =
                                                                        "https://placehold.co/800x1000/f8fafc/94a3b8?text=No+Image")
                                                                    }
                                                                />
                                                            )}
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    toggleItem(product);
                                                                }}
                                                                className={`absolute top - 4 right - 4 z - 10 p - 2.5 rounded - 2xl backdrop - blur - md transition - all scale - 0 group - hover: scale - 100 ${wishlistedIds.includes(product.id)
                                                                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25'
                                                                    : 'bg-white/80 dark:bg-neutral-900/80 text-stone-500 hover:text-rose-500 border border-stone-200/50 dark:border-neutral-700/50'
                                                                    } `}
                                                            >
                                                                <Heart className={`w - 5 h - 5 ${wishlistedIds.includes(product.id) ? 'fill-current' : ''} `} />
                                                            </motion.button>
                                                            {/* Quick View Overlay (Desktop) */}
                                                            <div className="absolute inset-x-0 bottom-0 p-6 translate-y-2 opacity-0 group-hover/card:translate-y-0 group-hover/card:opacity-100 transition-all duration-500 hidden md:block">
                                                                <button
                                                                    onClick={() => handleOpenModal(product)}
                                                                    className="w-full bg-stone-900 dark:bg-white text-white dark:text-black py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-2xl"
                                                                >
                                                                    <Eye className="w-3.5 h-3.5" />
                                                                    Quick View
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div className="p-5">
                                                            <div className="flex flex-col gap-1.5 mb-2">
                                                                <div className="flex items-center justify-between">
                                                                    <h3 className="font-black text-stone-900 dark:text-white text-sm tracking-tight truncate flex-1 uppercase">
                                                                        {product.name}
                                                                    </h3>
                                                                    <div className="flex items-center gap-1 ml-2">
                                                                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                                                        <span className="text-[10px] font-black text-stone-400">{product.rating || '5.0'}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter">
                                                                        {product.numReviews} Client Reviews
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center justify-between border-t border-stone-100 dark:border-neutral-800 pt-3 mt-2">
                                                                <div className="flex flex-col">
                                                                    <span className="text-[8px] font-black text-stone-400 uppercase tracking-[0.3em] mb-1.5 opacity-60">Aura Edition</span>
                                                                    <div className="text-xl font-black text-stone-900 dark:text-white tracking-tighter transition-all duration-500 group-hover/card:tracking-normal">
                                                                        {formatCurrency(product.price, product.currency)}
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleOpenModal(product);
                                                                    }}
                                                                    className="w-12 h-12 rounded-2xl bg-stone-50 dark:bg-neutral-800 text-stone-400 hover:text-stone-900 dark:hover:text-white transition-all flex items-center justify-center border border-stone-100 dark:border-neutral-800 hover:shadow-xl hover:-translate-y-1"
                                                                >
                                                                    <ArrowUpRight className="w-5 h-5" />
                                                                </button>
                                                            </div>

                                                            {!product.inStock && (
                                                                <div className="absolute inset-0 flex items-center justify-center p-6 z-20 pointer-events-none">
                                                                    <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md px-6 py-3 rounded-full border border-stone-100 dark:border-neutral-800 text-rose-500 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl transform -rotate-3 group-hover/card:rotate-0 transition-transform duration-700">
                                                                        Archives Empty
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                                {/* Filler for scroll edge padding */}
                                                <div className="flex-shrink-0 w-4 md:hidden" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>

            </div>
            <Footer />

            {/* Modals */}
            {/* Account, Order & Wishlist Sidebars */}
            <AnimatePresence>
                {isProfileOpen && (
                    <AccountSidebar
                        isOpen={isProfileOpen}
                        onClose={() => setProfileOpen(false)}
                    />
                )}
                {isOrdersOpen && (
                    <OrderHistorySidebar
                        isOpen={isOrdersOpen}
                        onClose={() => setOrdersOpen(false)}
                    />
                )}
                {isWishlistOpen && (
                    <WishlistSidebar />
                )}
            </AnimatePresence>

            <ProductDetailModal
                product={selectedProduct}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAddToCart={(product) => {
                    handleAddToCart(product);
                    setIsModalOpen(false);
                }}
            />
            <AnimatePresence>
                {checkoutOpen && (
                    <CartCheckout
                        isOpen={checkoutOpen}
                        items={items}
                        confirmationMessage={confirmationMessage}
                        onClose={() => toggleCheckout(false)}
                        onUpdateQuantity={updateQuantity}
                        onSubmitOrder={() => { }}
                    />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {isFilterOpen && (
                    <FilterSidebar
                        isOpen={isFilterOpen}
                        onClose={() => setIsFilterOpen(false)}
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onClearFilters={clearFilters}
                    />
                )}
            </AnimatePresence>
            <AuthModal isOpen={isAuthOpen} onClose={() => setAuthOpen(false)} />

            {/* Mobile Search Modal */}
            <AnimatePresence>
                {isMobileSearchOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] lg:hidden"
                        onClick={() => setMobileSearchOpen(false)}
                    >
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="absolute top-0 left-0 right-0 p-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-white dark:bg-neutral-900 rounded-[2rem] shadow-2xl border border-stone-100 dark:border-neutral-800 overflow-hidden">
                                <div className="p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Search className="h-5 w-5 text-stone-400" />
                                        <input
                                            ref={mobileSearchRef}
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Search our collection..."
                                            className="flex-1 bg-transparent border-none focus:outline-none text-stone-900 dark:text-white font-medium text-lg placeholder:text-stone-400"
                                        />
                                        <button
                                            onClick={() => setMobileSearchOpen(false)}
                                            className="p-2 hover:bg-stone-50 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                                        >
                                            <span className="text-stone-600 dark:text-stone-400 font-bold text-sm">Close</span>
                                        </button>
                                    </div>
                                    {searchTerm && (
                                        <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                                            {filteredProducts.length} {filteredProducts.length === 1 ? 'result' : 'results'} found
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ConfirmationModal
                isOpen={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                onConfirm={() => {
                    logout();
                    navigate('/');
                    setShowLogoutConfirm(false);
                    toast.success('Logged out successfully');
                }}
                title="Confirm Logout"
                message="Are you sure you want to sign out?"
                isDestructive={true}
            />
        </div>
    );
}

export default Home;
