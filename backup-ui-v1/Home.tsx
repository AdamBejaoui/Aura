import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Heart,
    ArrowUpRight,
    LayoutGrid,
    Sparkles,
    Shirt,
    Gem,
    Zap,
    MoonStar,
    ArrowRight,
    List,
    X
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
import { useUIStore } from "../store/uiStore";
import { useCurrencyStore } from "../store/currencyStore";
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

const categoryConfigs: Record<string, { icon: any; description: string }> = {
    "All": { icon: LayoutGrid, description: "Full Archive" },
    "New Arrivals": { icon: Sparkles, description: "Latest Drops" },
    "Wardrobe Staples": { icon: Shirt, description: "Daily Essentials" },
    "Statement Pieces": { icon: Gem, description: "Bold Character" },
    "Streetwear": { icon: Zap, description: "Urban Culture" },
    "Evening Luxe": { icon: MoonStar, description: "After Hours" },
};

const CategoryBox = ({
    category,
    isActive,
    onClick
}: {
    category: string;
    isActive: boolean;
    onClick: () => void
}) => {
    const config = categoryConfigs[category] || { icon: LayoutGrid, description: "Curated" };
    const Icon = config.icon;

    return (
        <motion.button
            whileHover={{ y: -8, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`flex-shrink-0 relative group p-4 rounded-3xl border transition-all duration-700 w-[160px] md:w-[220px] h-[70px] md:h-[85px] flex flex-row items-center gap-4 overflow-hidden snap-center ${isActive
                ? "bg-black dark:bg-white text-white dark:text-black shadow-2xl shadow-stone-300 dark:shadow-none border-transparent"
                : "bg-white/40 dark:bg-neutral-900/40 backdrop-blur-md border-stone-100 dark:border-neutral-800 text-stone-400 hover:border-stone-300 dark:hover:border-neutral-700"
                }`}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <AnimatePresence>
                {isActive && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        className="absolute top-3 right-3"
                    >
                        <div className={`w-2 h-2 rounded-full ${isActive ? "bg-white dark:bg-black" : "bg-stone-900"}`} />
                    </motion.div>
                )}
            </AnimatePresence>
            <div className={`p-3 rounded-2xl transition-all duration-500 transform group-hover:rotate-12 flex-shrink-0 ${isActive ? "bg-white/10 text-white dark:text-black" : "bg-stone-50 dark:bg-neutral-800 text-stone-400 group-hover:bg-white dark:group-hover:bg-neutral-700 group-hover:text-stone-900 dark:group-hover:text-white shadow-sm"}`}>
                <Icon className="w-5 h-5 md:w-6 h-6" />
            </div>
            <div className="text-left relative z-10 flex-1 min-w-0">
                <p className={`text-[10px] md:text-xs font-black uppercase tracking-[0.1em] truncate ${isActive ? "text-white dark:text-black" : "group-hover:text-stone-900 dark:group-hover:text-white"}`}>
                    {category}
                </p>
                <p className={`text-[8px] font-bold uppercase tracking-[0.2em] mt-1 opacity-60 truncate ${isActive ? "text-white/60 dark:text-black/60" : "text-stone-500"}`}>
                    {config.description}
                </p>
            </div>
        </motion.button>
    );
};

const ProductImageCarousel = ({ images, productName }: { images: string[]; productName: string }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

    React.useEffect(() => {
        if (isHovered && images.length > 1) {
            intervalRef.current = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % images.length);
            }, 800);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setCurrentIndex(0);
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [isHovered, images.length]);

    return (
        <div className="relative w-full h-full scanline" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            {images.map((image, index) => (
                <img
                    key={index}
                    src={image || "https://placehold.co/800x1000/f8fafc/94a3b8?text=No+Image"}
                    alt={`${productName} - Image ${index + 1}`}
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-[400ms] group-hover/card:scale-110 ${index === currentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
                    onError={(e) => ((e.target as HTMLImageElement).src = "https://placehold.co/800x1000/f8fafc/94a3b8?text=No+Image")}
                />
            ))}
            {/* Architectural Grid Overlay */}
            <div className="absolute inset-0 blueprint-grid opacity-[0.03] pointer-events-none" />
        </div>
    );
};

function Home() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const mobileSearchRef = useRef<HTMLInputElement>(null);
    const categoryScrollRef = useRef<HTMLDivElement>(null);
    const showcaseScrollRef = useRef<HTMLDivElement>(null);
    const productsRef = useRef<HTMLDivElement>(null);

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState<(typeof categories)[number]>("All");
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);


    // Filters State
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

    const { setMobileSearchOpen, setProductDetailOpen } = useUIStore();
    const { formatPrice } = useCurrencyStore();
    const { logout, isProfileOpen, isOrdersOpen, isAuthOpen, setProfileOpen, setOrdersOpen, setAuthOpen } = useAuthStore();
    const { items, addItem, checkoutOpen, toggleCheckout, updateQuantity, setConfirmationMessage, confirmationMessage } = useCartStore();
    const { toggleItem, isOpen: isWishlistOpen } = useWishlistStore();
    const wishlistedIds = useWishlistStore(state => state.items.map((item: Product) => item.id));

    const fetchProducts = async () => {
        try {
            if (products.length === 0 && !isRefreshing) setLoading(true);
            const params = new URLSearchParams();
            if (activeCategory !== 'All') params.append('category', activeCategory);
            if (filters.minPrice) params.append('minPrice', filters.minPrice);
            if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
            if (filters.inStock) params.append('inStock', 'true');
            if (filters.sort) params.append('sort', filters.sort);

            const response = await axios.get(`${API_BASE}/api/products?${params.toString()}`);
            const formattedProducts = response.data.map((product: any) => ({
                id: product._id,
                name: product.name,
                category: product.category,
                price: product.price,
                description: product.description,
                rating: product.rating || 0,
                reviews: Array.isArray(product.reviews) ? product.reviews : [],
                numReviews: product.numReviews || (Array.isArray(product.reviews) ? product.reviews.length : 0),
                images: Array.isArray(product.images) && product.images.length > 0
                    ? product.images.map((img: string) => img.startsWith("http") ? img : `${API_BASE}${img}`)
                    : ["https://placehold.co/800x1000/f8fafc/94a3b8?text=No+Image"],
                inStock: product.inStock !== undefined ? product.inStock : true,
                currency: product.currency || 'TND',
            }));
            setProducts(formattedProducts);
            setError(null);
        } catch (err) {
            setError("The boutique archives are temporarily offline.");
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => { fetchProducts(); }, [activeCategory]);

    // Listen for mobile search trigger
    useEffect(() => {
        const handleScrollToSearch = () => {
            if (mobileSearchRef.current) {
                // Focus immediately to catch the user gesture and pop the keyboard
                mobileSearchRef.current.focus();
                // Then scroll into view smoothly
                mobileSearchRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        };

        window.addEventListener('scrollToMainSearch', handleScrollToSearch);
        return () => window.removeEventListener('scrollToMainSearch', handleScrollToSearch);
    }, []);

    // Showcase Auto-scroll Logic
    useEffect(() => {
        if (loading || products.length === 0) return;

        const slider = showcaseScrollRef.current;
        if (!slider) return;

        let intervalId: NodeJS.Timeout;
        let currentIndex = 0;

        const startAutoScroll = () => {
            intervalId = setInterval(() => {
                if (!slider) return;

                const items = slider.querySelectorAll('.group\\/showcase');
                if (items.length === 0) return;

                currentIndex = (currentIndex + 1) % items.length;
                const targetItem = items[currentIndex] as HTMLElement;

                if (targetItem) {
                    slider.scrollTo({
                        left: targetItem.offsetLeft - slider.offsetLeft - 40, // Account for padding/gap
                        behavior: 'smooth'
                    });
                }

                if (currentIndex === 0) {
                    // Reset to start if we wrapped around
                    slider.scrollTo({ left: 0, behavior: 'smooth' });
                }
            }, 3000);
        };

        // Small timeout to ensure DOM is settled after loading
        const timeoutId = setTimeout(startAutoScroll, 1000);

        const handleMouseEnter = () => clearInterval(intervalId);
        const handleMouseLeave = () => startAutoScroll();

        slider.addEventListener('mouseenter', handleMouseEnter);
        slider.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            clearTimeout(timeoutId);
            clearInterval(intervalId);
            slider.removeEventListener('mouseenter', handleMouseEnter);
            slider.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [loading, products]);


    const filteredProducts = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        return products.filter((product) => {
            const matchesCategory = activeCategory === "All" || product.category === activeCategory;
            const matchesQuery = !query || product.name.toLowerCase().includes(query) || product.description.toLowerCase().includes(query);
            return matchesCategory && matchesQuery;
        });
    }, [searchTerm, products, activeCategory]);

    const handleOpenModal = (product: Product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
        setProductDetailOpen(true);
    };

    const handleAddToCart = (product: Product) => {
        addItem(product);
        toggleCheckout(true);
        setConfirmationMessage(null);
    };

    if (loading) return <LoadingScreen message="Unveiling Essentials..." />;
    if (error) return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black"><p className="text-gray-600 dark:text-gray-400">{error}</p></div>;

    return (
        <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black luxury-grain scroll-smooth">
            {/* HYPER-LUXE HERO: Kinetic Typography */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0"><Plasma /></div>
                <div className="container relative z-10 px-6 md:px-10">
                    <div className="max-w-[1400px] mx-auto">
                        <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} className="relative">
                            <h1 className="text-[14vw] md:text-[11vw] font-black leading-[0.8] tracking-tighter uppercase italic text-black dark:text-white relative">
                                <motion.span
                                    initial={{ x: -100, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                                    className="inline-block"
                                >
                                    Aura
                                </motion.span>
                                <br />
                                <motion.span
                                    initial={{ x: 100, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ duration: 1.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                    className="ml-[10vw] text-outline text-black dark:text-white inline-block"
                                >
                                    Studio
                                </motion.span>

                                {/* Architectural "Frame" Lines */}
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: '100%' }}
                                    transition={{ duration: 2, delay: 0.5 }}
                                    className="absolute -left-10 top-0 w-[1px] bg-black/10 dark:bg-white/10 hidden md:block"
                                />
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '40%' }}
                                    transition={{ duration: 2, delay: 0.8 }}
                                    className="absolute -top-10 -left-10 h-[1px] bg-black/10 dark:bg-white/10 hidden md:block"
                                />
                            </h1>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="absolute -bottom-10 right-0 md:right-20 max-w-xs text-right">
                                <p className="text-[9px] md:text-xs font-black uppercase tracking-[0.4em] text-stone-500 dark:text-stone-400">Architectural Archives<br />Phase 001 - Redefined</p>
                            </motion.div>
                        </motion.div>
                        <div className="mt-40 flex flex-col md:flex-row items-end justify-between gap-10">
                            <motion.button
                                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                onClick={() => productsRef.current?.scrollIntoView({ behavior: 'smooth' })}
                                className="group relative px-10 py-5 bg-black dark:bg-white text-white dark:text-black rounded-full text-[10px] font-black uppercase tracking-[0.4em] overflow-hidden transition-all hover:shadow-2xl"
                            >
                                <span className="relative z-10 flex items-center gap-3">Explore Archives <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" /></span>
                            </motion.button>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="hidden md:flex flex-col items-center gap-4">
                                <span className="text-[10px] uppercase tracking-[0.5em] text-stone-400 rotate-90 mb-10 origin-bottom-right">Scroll</span>
                                <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="w-[1px] h-20 bg-stone-200 dark:bg-neutral-800" />
                            </motion.div>
                        </div>
                    </div>
                </div>
                <div className="absolute bottom-10 left-0 w-full overflow-hidden whitespace-nowrap opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
                    <motion.div animate={{ x: [0, -1000] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="text-[15vw] font-black uppercase">
                        ARCHITECTURAL ARCHIVES STUDIO AURA ARCHITECTURAL ARCHIVES STUDIO AURA
                    </motion.div>
                </div>
            </section>

            {/* PRODUCT SHOWCASE: High-Impact Featured Slider */}
            <section className="py-32 overflow-hidden bg-stone-50/50 dark:bg-neutral-900/20 backdrop-blur-3xl border-y border-stone-100 dark:border-neutral-800">
                <div className="max-w-[1400px] mx-auto px-6 md:px-10 mb-24">
                    <div className="flex flex-col md:flex-row items-end justify-between gap-8">
                        <div className="flex flex-col gap-4">
                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-400">Featured</span>
                            <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.8] text-black dark:text-white">The<br /><span className="text-outline text-black dark:text-white">Editorial</span></h2>
                        </div>
                        <p className="max-w-xs text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] leading-relaxed text-right md:mb-4 relative">
                            <motion.span
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ duration: 1 }}
                            >
                                Curated selections from the AURA Studio. Each piece is a testament to architectural integrity.
                            </motion.span>
                            {/* Connecting Line to Title */}
                            <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: '200px' }}
                                transition={{ duration: 1.5, delay: 0.5 }}
                                className="absolute -top-4 right-0 h-[1px] bg-stone-200 dark:bg-neutral-800 hidden md:block"
                            />
                        </p>
                    </div>
                </div>

                <div
                    ref={showcaseScrollRef}
                    className="flex overflow-x-auto no-scrollbar gap-10 pb-10 snap-x snap-mandatory px-6 md:px-[10vw]"
                >
                    {products.slice(0, 5).map((product, idx) => (
                        <motion.div
                            key={`showcase-${product.id}`}
                            whileHover={{ y: -10 }}
                            onClick={() => handleOpenModal(product)}
                            className="flex-shrink-0 w-[85vw] md:w-[60vw] lg:w-[45vw] aspect-[16/9] relative rounded-[3rem] overflow-hidden group/showcase cursor-pointer snap-center shadow-2xl"
                        >
                            <img
                                src={product.images[0]}
                                alt={product.name}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover/showcase:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                            <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end">
                                <div className="flex items-end justify-between">
                                    <div className="flex flex-col gap-2">
                                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60">Archive {String(idx + 1).padStart(3, '0')}</span>
                                        <h3 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">{product.name}</h3>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className="text-2xl md:text-4xl font-black text-white tracking-tighter">{formatPrice(product.price)}</span>
                                        <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center group-hover/showcase:rotate-45 transition-transform duration-500">
                                            <ArrowUpRight className="w-6 h-6" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            <main className="max-w-[1800px] mx-auto px-6 md:px-10 py-20 relative z-10" ref={productsRef}>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-20">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter">Featured<br /><span className="text-outline text-black dark:text-white">Archives</span></h2>
                        <div className="w-20 h-1 bg-black dark:bg-white mt-4" />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden lg:flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-neutral-900 rounded-xl border border-stone-200 dark:border-neutral-800">
                            {(['grid', 'list'] as const).map((mode) => (
                                <button key={mode} onClick={() => setViewMode(mode)} className={`p-2 rounded-lg transition-all ${viewMode === mode ? 'bg-white dark:bg-white text-black dark:text-black shadow-premium' : 'text-stone-400 hover:text-stone-900 dark:hover:text-white'}`}>
                                    {mode === 'grid' ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Filters & Search: Command Center */}
                <div className="flex flex-col items-center justify-center mb-32 space-y-10">
                    <motion.div
                        initial={{ width: "300px", opacity: 0 }}
                        whileInView={{ width: "100%", opacity: 1 }}
                        className="relative max-w-2xl w-full group"
                    >
                        <div className="absolute -inset-1 bg-gradient-to-r from-black/5 to-transparent dark:from-white/5 dark:to-transparent rounded-[2.5rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700" />
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400 group-focus-within:text-black dark:group-focus-within:text-white transition-all duration-500 group-focus-within:scale-110" />
                        <input
                            ref={mobileSearchRef}
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search the archives..."
                            onFocus={() => setMobileSearchOpen(true)}
                            onBlur={() => setMobileSearchOpen(false)}
                            className="w-full pl-16 pr-16 py-6 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-2xl border border-stone-300 dark:border-neutral-600 rounded-[2rem] focus:outline-none focus:ring-0 focus:border-black dark:focus:border-white transition-all font-black text-sm uppercase tracking-widest shadow-2xl shadow-stone-200/50 dark:shadow-none"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-6 top-1/2 -translate-y-1/2 p-2 text-stone-400 hover:text-black dark:hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </motion.div>

                    <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.4em] text-stone-400">
                        <span className="w-10 h-[1px] bg-stone-200 dark:bg-neutral-800" />
                        Explore Collections
                        <span className="w-10 h-[1px] bg-stone-200 dark:bg-neutral-800" />
                    </div>
                </div>

                {/* Categories Scroll: Architectural Grid */}
                <div className="relative mb-32">
                    <div ref={categoryScrollRef} className="flex flex-nowrap overflow-x-auto gap-8 pb-12 no-scrollbar snap-x snap-mandatory px-4">
                        {categories.map((cat) => (
                            <CategoryBox key={cat} category={cat} isActive={activeCategory === cat} onClick={() => setActiveCategory(cat)} />
                        ))}
                    </div>
                    {/* Visual Hint for scroll */}
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-[2px] bg-stone-100 dark:bg-neutral-900 rounded-full overflow-hidden">
                        <motion.div
                            animate={{ x: [-64, 64] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="w-1/2 h-full bg-black dark:bg-white"
                        />
                    </div>
                </div>

                {filteredProducts.length === 0 ? (
                    <div className="text-center py-20 text-stone-500 uppercase font-black tracking-widest">No archives found.</div>
                ) : (
                    <div className="space-y-32">
                        {categories.filter(cat => cat !== 'All').map((category) => {
                            const productsInCategory = filteredProducts.filter(p => p.category === category);
                            if (activeCategory !== 'All' && activeCategory !== category) return null;
                            if (productsInCategory.length === 0) return null;
                            return (
                                <div key={category} className="relative">
                                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                                        <div className="relative">
                                            <div className="h-1 w-10 bg-black dark:bg-white mb-4 rounded-full" />
                                            <h3 className="text-4xl md:text-6xl font-black text-stone-900 dark:text-white uppercase tracking-tighter leading-none">{category}</h3>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-10 gap-y-24">
                                        {productsInCategory.map((product, pIdx) => (
                                            <div key={product.id} onClick={() => handleOpenModal(product)} className="group/card relative cursor-pointer">
                                                {/* Editorial Archive Number */}
                                                <div className="absolute -top-10 left-0 flex items-center gap-3 opacity-0 group-hover/card:opacity-100 transition-all duration-700 translate-y-4 group-hover/card:translate-y-0">
                                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">ARCH-{String(pIdx + 1).padStart(3, '0')}</span>
                                                    <div className="w-8 h-[1px] bg-stone-200 dark:bg-neutral-800" />
                                                </div>

                                                <div className={`relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-stone-50 dark:bg-neutral-900 border border-stone-100 dark:border-neutral-800 shadow-xl transition-all duration-700 group-hover/card:shadow-2xl group-hover/card:-translate-y-2 will-change-transform isolation-auto ${!product.inStock ? 'grayscale' : ''}`}>
                                                    <ProductImageCarousel images={product.images} productName={product.name} />

                                                    {!product.inStock && (
                                                        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                                                            <div className="px-6 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/20 transform -rotate-12 scale-110">
                                                                <span className="text-[12px] font-black uppercase tracking-[0.5em] text-white">Archived</span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Hover Reveals: Metadata & CTA */}
                                                    <div className="absolute inset-x-0 bottom-0 p-6 translate-y-full group-hover/card:translate-y-0 transition-transform duration-700 ease-[0.16,1,0.3,1] z-20">
                                                        <div className="p-4 bg-white/90 dark:bg-black/90 backdrop-blur-2xl rounded-2xl border border-white/20 flex items-center justify-between shadow-2xl">
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-[8px] font-black uppercase tracking-widest text-stone-400">Status</span>
                                                                <span className={`text-[10px] font-black uppercase tracking-wide ${product.inStock ? 'text-green-500' : 'text-stone-500'}`}>
                                                                    {product.inStock ? 'Ready for Archive' : 'Archived / Sold Out'}
                                                                </span>
                                                            </div>
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                                                onClick={(e) => { e.stopPropagation(); if (product.inStock) handleAddToCart(product); }}
                                                                className={`p-3 rounded-xl ${product.inStock ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-stone-100 text-stone-400 cursor-not-allowed'}`}
                                                                disabled={!product.inStock}
                                                            >
                                                                <ArrowRight className="w-4 h-4" />
                                                            </motion.button>
                                                        </div>
                                                    </div>

                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                                        onClick={(e) => { e.stopPropagation(); toggleItem(product); }}
                                                        className={`absolute top-6 right-6 z-10 p-3 rounded-2xl backdrop-blur-xl transition-all ${wishlistedIds.includes(product.id) ? 'bg-black text-white' : 'bg-white/80 dark:bg-neutral-900/80 text-stone-500 border border-white/20'}`}
                                                    >
                                                        <Heart className={`w-5 h-5 ${wishlistedIds.includes(product.id) ? 'fill-current' : ''}`} />
                                                    </motion.button>

                                                    {/* Category Badge */}
                                                    <div className="absolute top-6 left-6 px-4 py-1.5 bg-black/80 backdrop-blur-md rounded-full border border-white/10 opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 flex items-center gap-2">
                                                        <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white">{product.category}</span>
                                                    </div>
                                                </div>

                                                <div className="mt-8 px-2 space-y-2">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex flex-col gap-1">
                                                            <h3 className="font-black text-stone-900 dark:text-white text-lg tracking-tighter uppercase leading-none">{product.name}</h3>
                                                            <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest leading-none mt-1">Studio Archives Phase 01</span>
                                                        </div>
                                                        <div className="text-xl font-black text-stone-900 dark:text-white tracking-tighter leading-none">{formatPrice(product.price)}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            <Footer />

            {/* Sidebars & Modals */}
            <AnimatePresence>
                {isProfileOpen && <AccountSidebar isOpen={isProfileOpen} onClose={() => setProfileOpen(false)} />}
                {isOrdersOpen && <OrderHistorySidebar isOpen={isOrdersOpen} onClose={() => setOrdersOpen(false)} />}
                {isWishlistOpen && <WishlistSidebar />}
            </AnimatePresence>

            <ProductDetailModal
                product={selectedProduct} isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setProductDetailOpen(false); }}
            />

            <AnimatePresence>
                {checkoutOpen && (
                    <CartCheckout isOpen={checkoutOpen} items={items} confirmationMessage={confirmationMessage} onClose={() => toggleCheckout(false)} onUpdateQuantity={updateQuantity} onSubmitOrder={() => { }} />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isFilterOpen && (
                    <FilterSidebar isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} filters={filters} onFilterChange={handleFilterChange} onClearFilters={clearFilters} />
                )}
            </AnimatePresence>

            <AuthModal isOpen={isAuthOpen} onClose={() => setAuthOpen(false)} />


            <ConfirmationModal
                isOpen={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)}
                onConfirm={() => { logout(); navigate('/'); setShowLogoutConfirm(false); toast.success('Logged out'); }}
                title="Logout" message="Are you sure?" isDestructive={true}
            />
        </div>
    );
}

export default Home;
