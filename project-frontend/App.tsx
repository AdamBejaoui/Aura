import React from "react";
import { useEffect, useMemo, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Search, ShoppingCart, Sun, Moon } from "lucide-react";
import axios from "axios";
import Plasma from "./components/Plasma";
import ProductDetailModal from "./components/ProductDetailModal";
import CartCheckout from "./components/CartCheckout";
import { useCartStore } from "./store/cartStore";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  rating: number;
  reviews: number;
  images: string[];
};

const categories = [
  "All",
  "New Arrivals",
  "Wardrobe Staples",
  "Statement Pieces",
  "Streetwear",
  "Evening Luxe",
] as const;

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

function Store() {
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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE}/api/products`);
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
            reviews: product.reviews || 0,
            images,
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
  }, []);

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
  }, [activeCategory, searchTerm, products]);

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
        <div className="absolute inset-0 -z-10 opacity-30">
          <Plasma
            color={isDark ? '#3b82f6' : '#3b82f6'}
            speed={0.5}
            direction="forward"
            scale={1.2}
            opacity={isDark ? 0.2 : 0.35}
            mouseInteractive={true}
          />
        </div>
        <div className="relative text-xl font-medium flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          Loading store...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 font-sans transition-colors duration-300 relative overflow-hidden">
      {/* Plasma Background Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-60 dark:opacity-50">
        <Plasma
          color={isDark ? '#3b82f6' : '#3b82f6'}
          speed={0.5}
          direction="forward"
          scale={1.5}
          opacity={isDark ? 0.5 : 0.6}
          mouseInteractive={false}
        />
      </div>

      {/* Header */}
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-gray-200 dark:border-slate-800 px-4 sm:px-6 lg:px-10 py-4">
  <div className="max-w-7xl mx-auto flex justify-between items-center">
    
    {/* LEFT: Star + Aura */}
    <div className="flex items-center gap-2">
      
      {/* Glow Star */}
      <div className="relative w-4 h-4 
          bg-blue-500 
          [clip-path:polygon(50%_0%,70%_30%,100%_50%,70%_70%,50%_100%,30%_70%,0%_50%,30%_30%)]
          before:content-[''] before:absolute before:inset-0 
          before:bg-blue-500 before:blur-md before:opacity-60">
      </div>

      {/* Text */}
      <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-600">
        Aura
      </span>

    </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => toggleCheckout(true)}
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ShoppingCart className="h-6 w-6 text-blue-500" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
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
        <div className="flex flex-wrap justify-center gap-2 mb-16">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-200 ${activeCategory === category
                  ? "text-white bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700"
                }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-16">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search pieces..."
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Products */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-gray-500 dark:text-gray-400">
            No pieces found. Explore our full collection.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-blue-500/20 hover:border-blue-500/30 transition-all duration-500 hover:-translate-y-2"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-50 dark:bg-slate-800">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) =>
                    ((e.target as HTMLImageElement).src =
                      "https://placehold.co/800x1000/f8fafc/94a3b8?text=No+Image")
                    }
                  />
                  <div className="absolute top-3 left-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full">
                      {product.category}
                    </span>
                  </div>

                  {/* Quick View Button */}
                  <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <button
                      onClick={() => handleOpenModal(product)}
                      className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl text-gray-900 dark:text-white py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-white dark:hover:bg-slate-900 transition-all shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Quick View
                    </button>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2 truncate">
                    {product.name}
                  </h3>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(product.price)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

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
