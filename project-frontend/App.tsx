import React from "react";
import { useEffect, useMemo, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Search, ShoppingBag } from "lucide-react";
import axios from "axios";

import ProductDetailModal from "./components/ProductDetailModal";
import CartCheckout from "./components/CartCheckout";
import { useCartStore } from "./store/cartStore";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

// your Product type unchanged
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
    resetCart,
  } = useCartStore();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE}/api/products`);
        const formattedProducts = response.data.map((product: any) => {
          // keep your logic, but ensure images array exists
          let images: string[] = [];
          if (Array.isArray(product.images) && product.images.length > 0) {
            images = product.images.map((img: string) => img.startsWith('http') ? img : `${API_BASE}${img}`);
          } else if (product.image) {
            images = [product.image.startsWith('http') ? product.image : `${API_BASE}${product.image}`];
          } else {
            images = ['https://placehold.co/600x800/cccccc/999999?text=No+Image'];
          }
          return {
            id: product._id,
            name: product.name,
            category: product.category,
            price: product.price,
            description: product.description,
            rating: product.rating || 0,
            reviews: product.reviews || 0,
            images
          };
        });

        setProducts(formattedProducts);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory = activeCategory === "All" || product.category === activeCategory;
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

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-slate-950">
        <div className="text-white text-xl">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-slate-950">
        <div className="text-white text-xl bg-red-500 p-4 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-slate-950">
      <div
        className="relative min-h-dvh bg-gradient-to-br from-rose-50 via-white to-slate-100 text-slate-900"
        style={{
          paddingTop: "calc(env(safe-area-inset-top) + 1rem)",
          paddingBottom: "calc(env(safe-area-inset-bottom) + 2rem)",
          paddingLeft: "calc(env(safe-area-inset-left) + 1rem)",
          paddingRight: "calc(env(safe-area-inset-right) + 1rem)",
        }}
      >
        <div className="mx-auto flex min-h-[calc(100dvh-2rem)] max-w-7xl flex-col gap-10 rounded-[32px] bg-white/70 px-4 py-10 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.65)] backdrop-blur sm:px-8 lg:px-12">
         <header className="flex flex-col gap-6">
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      {/* Logo Image */}
      <div className="w-100 h-40 sm:w340 sm:h-14">
        <img
          src="http://localhost:5000/uploads/aura-removebg-preview.png" // <-- your image path
          className="w-full h-full object-contain"
        />
      </div>

      <button
        type="button"
        onClick={() => toggleCheckout(true)}
        className="inline-flex min-h-touch items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-rose-200 hover:text-slate-900"
      >
        <ShoppingBag className="h-4 w-4" aria-hidden="true" />
        Cart ({items.reduce((count, item) => count + item.quantity, 0)})
      </button>
    </div>
    <div className="max-w-3xl space-y-4">
      <h1 className="text-3xl font-semibold leading-tight text-slate-900 mobile-lg:text-4xl lg:text-5xl">
        Discover refined silhouettes crafted for modern movement.
      </h1>
      <p className="text-base text-slate-600 lg:text-lg">
        Explore a curated selection of elevated essentials, runway-ready statements, and versatile streetwear designed for effortless layering across every season.
      </p>
    </div>
  </header>

          <section className="flex flex-col gap-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <label className="relative flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm transition focus-within:border-rose-300 focus-within:ring-2 focus-within:ring-rose-200 lg:max-w-xl">
                <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
                <span className="sr-only">Search catalog</span>
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search for silhouettes, fabrics, or colors"
                  className="w-full border-0 bg-transparent text-base focus:outline-none focus:ring-0"
                />
              </label>

              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    aria-pressed={activeCategory === category}
                    onClick={() => setActiveCategory(category)}
                    className={`min-h-touch rounded-full px-4 py-2 text-sm font-medium transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400 ${
                      activeCategory === category
                        ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

<div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
  {filteredProducts.length === 0 ? (
    <div className="col-span-full text-center py-20">
      <div className="text-stone-300 mb-4">—</div>
      <p className="text-stone-500 max-w-md mx-auto">
        No pieces match your search. Explore our curated collections for timeless elegance.
      </p>
    </div>
  ) : (
    filteredProducts.map((product) => (
      <article
        key={product.id}
        className="luxury-card group"
      >
        <div className="relative h-80 overflow-hidden bg-stone-100">
          <img
            src={product.images[0]} // <-- fixed: uses images[0]
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="p-6">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-xs font-medium uppercase tracking-widest text-amber-600">
                {product.category}
              </span>
              <h3 className="mt-1 text-xl font-light text-stone-900 leading-tight">
                {product.name}
              </h3>
            </div>
            <span className="text-lg font-serif font-light text-stone-900">
              {formatCurrency(product.price)}
            </span>
          </div>
          
          <p className="text-stone-600 text-sm mb-4 line-clamp-2">
            {product.description}
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => handleOpenModal(product)}
              className="luxury-btn-secondary flex-1"
            >
              Details
            </button>
            <button
              onClick={() => handleAddToCart(product)}
              className="luxury-btn-primary flex-1"
            >
              Add
            </button>
          </div>
        </div>
      </article>
    ))
  )}
</div>
          </section>
        </div>
        <ProductDetailModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onAddToCart={(product) => {
            handleAddToCart(product);
            handleCloseModal();
          }}
        />
        <CartCheckout
          isOpen={checkoutOpen}
          items={items}
          confirmationMessage={confirmationMessage}
          onClose={() => toggleCheckout(false)}
          onUpdateQuantity={updateQuantity}
          onSubmitOrder={(details) => {
            // This will be handled in CartCheckout.tsx
          }}
        />
      </div>
    </div>
  );
}

function App() {
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    const token = localStorage.getItem('adminToken');
    // set axios default header if token exists so AdminDashboard axios calls include it
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    return token;
  });

  const handleAdminLogin = (token: string) => {
    setAdminToken(token);
    localStorage.setItem('adminToken', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`; // set default for subsequent requests
  };

  const handleAdminLogout = () => {
    setAdminToken(null);
    localStorage.removeItem('adminToken');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Store />} />
        {/* accept both /login and /admin/login */}
        <Route path="/login" element={<Navigate to="/admin/login" replace />} />
        <Route 
          path="/admin/login" 
          element={
            adminToken ? 
              <Navigate to="/admin" replace /> : 
              <AdminLogin onLogin={handleAdminLogin} />
          } 
        />
        <Route 
          path="/admin" 
          element={
            adminToken ? 
              <AdminDashboard token={adminToken} onLogout={handleAdminLogout} /> : 
              <Navigate to="/admin/login" replace />
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
