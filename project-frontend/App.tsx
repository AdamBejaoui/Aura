import React from "react";
import { useEffect, useMemo, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Search, ShoppingBag, ShoppingCart } from "lucide-react";
import axios from "axios";
import ElectricBorder from "./components/ElectricBorder";
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
              "https://placehold.co/800x1000/f9fafb/9ca3af?text=LuxeLayer",
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-6 h-6 border-2 border-pink-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* 🔮 Background Plasma Animation */}
      <div className="absolute inset-0 -z-10">
        <Plasma
          color="#ec4899"
          speed={0.5}
          direction="forward"
          scale={1.2}
          opacity={0.4}
          mouseInteractive={true}
        />
      </div>

      {/* Header */}
      <div className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
              Aura
            </h1>
          </div>

          {/* Cart Button with gradient icon */}
          <button
            onClick={() => toggleCheckout(true)}
            className="relative p-2 -m-2 rounded-full hover:bg-gray-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth={2}
              className="h-6 w-6"
            >
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#f43f5e" />
                </linearGradient>
              </defs>
              <ShoppingCart stroke="url(#gradient)" />
            </svg>

            {cartCount > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>
      </div>

      <main className="pt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 tracking-tight mb-6">
            Clothing designed for the way you move
          </h1>
          <p className="text-lg text-gray-600">
            Timeless pieces, thoughtfully crafted. Discover our new collection.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-16">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-5 py-2 text-sm font-medium rounded-full transition-colors ${
                activeCategory === category
                  ? "text-white bg-gray-900"
                  : "text-gray-600 hover:text-gray-900"
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
              className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-full border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
          </div>
        </div>

        {/* Products */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No pieces found. Explore our full collection.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-20">
            {filteredProducts.map((product) => (
                <div
                  className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-md transition-transform duration-500 hover:scale-[1.02]"
                  onClick={() => handleOpenModal(product)}
                >
                  <div className="relative aspect-[3/4] overflow-hidden mb-4 bg-gray-50 rounded-t-2xl">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) =>
                        ((e.target as HTMLImageElement).src =
                          "https://placehold.co/800x1000/f9fafb/9ca3af?text=LuxeLayer")
                      }
                    />
                    <div className="absolute top-3 left-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-pink-600 bg-pink-50 px-2 py-1 rounded-full">
                        {product.category}
                      </span>
                    </div>
                  </div>

                  <div className="text-center pb-4">
                    <h3 className="font-light text-gray-900 text-lg mb-1">
                      {product.name}
                    </h3>
                    <div className="text-sm text-gray-600">
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
        onSubmitOrder={() => {}}
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
