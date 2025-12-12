import { useEffect, useMemo, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Sun, Moon, ShoppingBag } from "lucide-react";
import axios from "axios";
import Plasma from "./components/Plasma";
import ProductDetailModal from "./components/ProductDetailModal";
import CartCheckout from "./components/CartCheckout";
import { useCartStore } from "./store/cartStore";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import VerifyEmail from "./components/VerifyEmail";
import Footer from "./components/Footer";
import FilterSidebar from "./components/FilterSidebar";
import WishlistSidebar from "./components/WishlistSidebar";
import AuthModal from "./components/AuthModal";
import { useWishlistStore } from "./store/wishlistStore";
import { useAuthStore } from "./store/authStore";
import OrderHistory from "./components/OrderHistory";
import { Filter as FilterIcon, Heart, User, LogOut, Package } from "lucide-react";

const API_BASE = '';

export type Review = {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  rating: number;
  numReviews: number;
  reviews: Review[];
  images: string[];
  inStock: boolean;
  currency: string;
};

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

function Store() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<(typeof categories)[number]>("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    const stored = window.localStorage?.getItem('auraTheme');
    if (stored === 'light' || stored === 'dark') return stored;
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  });
  const isDark = theme === 'dark';

  // Filters State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const { user, isAuthenticated, logout } = useAuthStore();
  const isAdmin = user?.role === 'admin';
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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    document.documentElement.classList.toggle('dark', isDark);
    window.localStorage?.setItem('auraTheme', theme);
  }, [theme, isDark]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const { items: wishlistItemsList, toggleWishlist, toggleItem } = useWishlistStore();
  const wishlistedIds = wishlistItemsList.map(i => i.id);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (activeCategory !== 'All') params.append('category', activeCategory);
        if (filters.minPrice) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
        if (filters.inStock) params.append('inStock', 'true');
        if (filters.sort) params.append('sort', filters.sort);

        const response = await axios.get(`${API_BASE}/api/products?${params.toString()}`);
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
            numReviews: product.numReviews || (Array.isArray(product.reviews) ? product.reviews.length : (typeof product.reviews === 'number' ? product.reviews : 0)),
            images,
            inStock: product.inStock !== undefined ? product.inStock : true,
            currency: product.currency || 'USD',
          };
        });
        setProducts(formattedProducts);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [activeCategory, filters]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-900 dark:bg-black dark:text-white transition-colors duration-300">
        <div className="absolute inset-0 -z-10 opacity-30">
          <Plasma
            color={isDark ? '#ffffff' : '#ffffff'}
            speed={0.5}
            direction="forward"
            scale={1.2}
            opacity={isDark ? 0.2 : 0.35}
            mouseInteractive={true}
          />
        </div>
        <div className="relative text-xl font-medium flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-stone-900 dark:border-white border-t-transparent rounded-full animate-spin"></div>
          Loading store...
        </div>
      </div>
    );
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
      {/* Plasma Background Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-60 dark:opacity-50">
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
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-900/80 backdrop-blur border-b border-gray-200 dark:border-neutral-800 px-4 sm:px-6 lg:px-10 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">

          {/* LEFT: Star + Aura */}
          <div className="flex items-center gap-2">

            {/* Glow Star */}
            <div className="relative w-4 h-4 
          bg-gray-900 dark:bg-white 
          [clip-path:polygon(50%_0%,70%_30%,100%_50%,70%_70%,50%_100%,30%_70%,0%_50%,30%_30%)]
          before:content-[''] before:absolute before:inset-0 
          before:bg-gray-900 dark:before:bg-white before:blur-md before:opacity-60">
            </div>

            {/* Text */}
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-black dark:text-white">
              Aura
            </span>

          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="relative p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <button
              onClick={toggleWishlist}
              className="relative p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              <Heart className="h-5 w-5" />
              {wishlistItemsList.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                  {wishlistItemsList.length}
                </span>
              )}
            </button>

            {/* User Menu */}


            <button
              onClick={() => toggleCheckout(true)}
              className="relative p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              aria-label="Cart"
            >
              <ShoppingCart className="h-6 w-6 text-gray-900 dark:text-white" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gray-900 dark:bg-white text-white dark:text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <div className="relative">
              <button
                onClick={() => isAuthenticated ? setShowUserMenu(!showUserMenu) : setIsAuthOpen(true)}
                className="relative p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                aria-label="User account"
              >
                {isAuthenticated ? (
                  <div className="w-6 h-6 rounded-full bg-stone-900 dark:bg-white text-white dark:text-black flex items-center justify-center text-xs font-bold">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <User className="h-5 w-5" />
                )}
              </button>

              {/* User Dropdown */}
              {showUserMenu && isAuthenticated && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-gray-100 dark:border-neutral-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 border-b border-gray-100 dark:border-neutral-800">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      navigate('/my-orders');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 flex items-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    My Orders
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        navigate('/admin');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 flex items-center gap-2"
                    >
                      <Package className="w-4 h-4" />
                      Dashboard
                    </button>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      navigate('/'); // Force back to store on logout
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

      </header>


      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Hero */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 dark:text-white tracking-tight mb-6">
            Clothing designed for the way you move
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Timeless pieces, thoughtfully crafted. Discover our new collection.
          </p>
        </div>

        {/* Filters */}
        <div className="relative max-w-full mx-auto mb-16 group">
          <div className="flex flex-nowrap overflow-x-auto md:flex-wrap md:justify-center gap-2 px-4 md:px-0 pb-0 md:pb-0 scrollbar-hide snap-x" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`flex-shrink-0 snap-center px-5 py-2 text-sm font-medium rounded-full transition-all duration-200 ${activeCategory === category
                  ? "text-white bg-stone-900 dark:bg-white dark:text-black shadow-lg shadow-stone-900/25 dark:shadow-white/25"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800"
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Filters and Search Layout */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search pieces..."
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-full focus:outline-none focus:ring-2 focus:ring-stone-900/20 dark:focus:ring-white/20 focus:border-stone-900 dark:focus:border-white transition-all"
            />
          </div>

          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-full text-sm font-medium hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors shadow-sm whitespace-nowrap"
          >
            <FilterIcon className="w-4 h-4" />
            Filters & Sort
            {(filters.minPrice || filters.maxPrice || filters.inStock || filters.sort !== 'newest') && (
              <span className="ml-1 w-2 h-2 bg-stone-900 dark:bg-white rounded-full"></span>
            )}
          </button>
        </div>

        {/* Products */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-gray-500 dark:text-gray-400">
            No pieces found. Explore our full collection.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group relative bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-neutral-800 shadow-sm hover:shadow-2xl hover:shadow-gray-900/10 dark:hover:shadow-white/5 hover:border-gray-300 dark:hover:border-stone-900 dark:border-white/30 transition-all duration-500 hover:-translate-y-2"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-gray-50 dark:bg-neutral-800">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) =>
                    ((e.target as HTMLImageElement).src =
                      "https://placehold.co/800x1000/f8fafc/94a3b8?text=No+Image")
                    }
                  />
                  <div className="absolute top-4 left-4 z-10">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-stone-300 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md px-3 py-1.5 rounded-full">
                      {product.category}
                    </span>
                  </div>

                  {/* Wishlist Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleItem(product);
                    }}
                    className={`absolute top-4 right-4 z-10 p-2 rounded-full backdrop-blur-md transition-all ${wishlistedIds.includes(product.id)
                      ? "bg-red-500 text-white"
                      : "bg-white/90 dark:bg-neutral-900/90 text-gray-900 dark:text-white hover:scale-110"
                      }`}
                  >
                    <Heart className={`w-4 h-4 ${wishlistedIds.includes(product.id) ? "fill-current" : ""}`} />
                  </button>

                  {/* Quick View Button */}
                  <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <button
                      onClick={() => handleOpenModal(product)}
                      className="w-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl text-gray-900 dark:text-white py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-white dark:hover:bg-black transition-all shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Quick View
                    </button>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex flex-col gap-1 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg truncate">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-medium text-gray-400">
                        ({product.numReviews} reviews)
                      </span>
                    </div>
                  </div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(product.price, product.currency)}
                  </div>
                  {!product.inStock && (
                    <div className="mt-2 text-red-500 font-bold text-sm">Out of Stock</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />

      {/* Modals */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToCart={(product) => {
          handleAddToCart(product);
          setIsModalOpen(false);
        }}
      />
      <CartCheckout
        isOpen={checkoutOpen}
        items={items}
        confirmationMessage={confirmationMessage}
        onClose={() => toggleCheckout(false)}
        onUpdateQuantity={updateQuantity}
        onSubmitOrder={() => { }}
      />
      <FilterSidebar
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
      />
      <WishlistSidebar />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}

function App() {
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    return token;
  });

  const handleAdminLogin = (token: string) => {
    setAdminToken(token);
    localStorage.setItem("adminToken", token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  };

  const handleAdminLogout = () => {
    setAdminToken(null);
    localStorage.removeItem("adminToken");
    delete axios.defaults.headers.common["Authorization"];
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Store />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/my-orders" element={<OrderHistory />} />
        <Route path="/login" element={<Navigate to="/admin/login" replace />} />
        <Route
          path="/admin/login"
          element={
            adminToken ? (
              <Navigate to="/admin" replace />
            ) : (
              <AdminLogin onLogin={handleAdminLogin} />
            )
          }
        />
        <Route
          path="/admin"
          element={
            adminToken ? (
              <AdminDashboard
                token={adminToken}
                onLogout={handleAdminLogout}
              />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
