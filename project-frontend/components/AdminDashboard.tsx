// src/components/AdminDashboard.tsx
import React, { useState, useEffect, useRef } from "react";
import axios from 'axios';
import Plasma from "./Plasma";

// --- Interfaces ---
interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  images: string[];
}

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  fullName: string;
  phone: string;
  address: string;
  size: string;
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: string;
}

interface AdminDashboardProps {
  token: string;
  onLogout: () => void;
}

// --- Constants ---
const categories = [
  "New Arrivals",
  "Wardrobe Staples",
  "Statement Pieces",
  "Streetwear",
  "Evening Luxe"
];

const AdminDashboard = ({ token, onLogout }: AdminDashboardProps) => {
  // --- State ---
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'New Arrivals',
    price: 0,
    description: '',
    images: [] as string[],
  });
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // UI State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeSection, setActiveSection] = useState<'dashboard' | 'addProduct' | 'orders'>('dashboard');

  // Filters & Theme
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'>('all');
  const [orderSortMode, setOrderSortMode] = useState<'newest' | 'status'>('newest');
  const [adminEmail, setAdminEmail] = useState(() => {
    if (typeof window === 'undefined') return 'Admin';
    return window.localStorage?.getItem('adminEmail') || 'Admin';
  });
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    const stored = window.localStorage?.getItem('auraTheme');
    if (stored === 'light' || stored === 'dark') return stored;
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  });

  const isDark = theme === 'dark';
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derived State (For Notification Badge)
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;

  // --- API Headers ---
  const authHeader = {
    headers: {
      Authorization: token ? `Bearer ${token}` : ''
    }
  };

  // --- Effects ---
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setAdminEmail(window.localStorage?.getItem('adminEmail') || 'Admin');
  }, [token]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!token) {
          setError('Missing admin token. Please login.');
          setProducts([]);
          setOrders([]);
          setLoading(false);
          return;
        }
        const [productsRes, ordersRes] = await Promise.all([
          axios.get('http://localhost:5000/api/products', authHeader),
          axios.get('http://localhost:5000/api/orders', authHeader)
        ]);
        setProducts(productsRes.data);
        setOrders(ordersRes.data);
        setError('');
      } catch (err: any) {
        if (err?.response?.status === 403 || err?.response?.status === 401) {
          setError('Forbidden: invalid or expired token. Please login again.');
        } else {
          console.error('Admin data fetch error:', err);
          setError('Failed to load admin data. Check if server is running.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    document.documentElement.classList.toggle('dark', isDark);
    window.localStorage?.setItem('auraTheme', theme);
  }, [theme, isDark]);

  // --- Handlers ---

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return 'https://placehold.co/300x400/f8fafc/94a3b8?text=No+Image';
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:5000${imagePath}`;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const previews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(previews);
    } else {
      setImagePreviews([]);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsAdding(true);

    try {
      const formData = new FormData();
      formData.append('name', newProduct.name);
      formData.append('category', newProduct.category);
      formData.append('price', String(newProduct.price));
      formData.append('description', newProduct.description);

      const fileInput = fileInputRef.current;

      if (fileInput && fileInput.files && fileInput.files.length > 0) {
        Array.from(fileInput.files).forEach(file => {
          formData.append('images', file);
        });
      } else if (!isEditing) {
        setError('At least one image is required');
        setIsAdding(false);
        return;
      }

      const config = {
        headers: {
          ...authHeader.headers,
        },
      };

      if (isEditing && editingProduct) {
        const response = await axios.patch(`http://localhost:5000/api/products/${editingProduct._id}`, formData, config);
        setProducts(products.map(p => p._id === editingProduct._id ? response.data : p));
        setEditingProduct(null);
        setIsEditing(false);
      } else {
        const response = await axios.post('http://localhost:5000/api/products', formData, config);
        setProducts([...products, response.data]);
      }

      setNewProduct({ name: '', category: 'New Arrivals', price: 0, description: '', images: [] });
      setImagePreviews([]);
      if (fileInput) fileInput.value = '';
      setIsAdding(false);
      setActiveSection('dashboard');

    } catch (err: any) {
      console.error('Full Error Object:', err);
      if (err.response && err.response.status === 500) {
        setError('Server Error (500): The backend crashed. Please check your Node.js terminal/logs for details.');
      } else {
        setError(err.response?.data?.message || (isEditing ? 'Failed to update product' : 'Failed to add product'));
      }
      setIsAdding(false);
    }
  };

  const startEditing = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      category: product.category,
      price: product.price,
      description: product.description,
      images: product.images,
    });
    setImagePreviews(product.images.map(img => getImageUrl(img)));
    setIsEditing(true);
    setActiveSection('addProduct');
    setError('');
  };

  const cancelEditing = () => {
    setEditingProduct(null);
    setNewProduct({ name: '', category: 'New Arrivals', price: 0, description: '', images: [] });
    setImagePreviews([]);
    setIsEditing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setError('');
    setActiveSection('dashboard');
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/products/${productId}`, authHeader);
      setProducts(products.filter(p => p._id !== productId));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await axios.patch(`http://localhost:5000/api/orders/${orderId}/status`, { status }, authHeader);
      setOrders(orders.map(order => order._id === orderId ? response.data : order));
    } catch (err: any) {
      setError('Failed to update order status');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/orders/${orderId}`, authHeader);
      setOrders(orders.filter(order => order._id !== orderId));
    } catch (err: any) {
      setError('Failed to delete order');
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { bg: 'bg-amber-100 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-400', icon: '⏳' };
      case 'confirmed':
        return { bg: 'bg-stone-100 dark:bg-neutral-900/20', text: 'text-stone-700 dark:text-stone-400', icon: '✅' };
      case 'shipped':
        return { bg: 'bg-stone-100 dark:bg-neutral-900/20', text: 'text-stone-700 dark:text-stone-400', icon: '🚚' };
      case 'delivered':
        return { bg: 'bg-stone-100 dark:bg-neutral-900/20', text: 'text-stone-700 dark:text-stone-400', icon: '📦' };
      case 'cancelled':
        return { bg: 'bg-stone-100 dark:bg-neutral-900/20', text: 'text-stone-700 dark:text-stone-400', icon: '❌' };
      default:
        return { bg: 'bg-gray-100 dark:bg-neutral-900/20', text: 'text-gray-700 dark:text-gray-400', icon: '❓' };
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', description: 'Overview & Stats' },
    { id: 'addProduct', label: 'Add Product', description: 'Inventory Management' },
    { id: 'orders', label: 'Orders', description: 'Order Processing' },
  ];

  const renderContent = () => {
    if (activeSection === 'addProduct') {
      return (
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isEditing ? 'Edit Product' : 'Add New Product'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {isEditing ? 'Update product details and inventory' : 'Create a new product for your store'}
              </p>
            </div>
            {isEditing && (
              <button
                onClick={cancelEditing}
                className="px-4 py-2 bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
              >
                Cancel Editing
              </button>
            )}
          </div>

          <form onSubmit={handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Form Fields */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 border border-gray-100 dark:border-neutral-800 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-sm">📝</span>
                  General Information
                </h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Name</label>
                    <input
                      type="text"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-stone-500/20 focus:border-stone-500 outline-none transition-all"
                      placeholder="e.g. Midnight Velvet Dress"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                      <div className="relative">
                        <select
                          value={newProduct.category}
                          onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-stone-500/20 focus:border-stone-500 outline-none appearance-none transition-all"
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price ($)</label>
                      <input
                        type="number"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-stone-500/20 focus:border-stone-500 outline-none transition-all"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                    <textarea
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-stone-500/20 focus:border-stone-500 outline-none transition-all h-32 resize-none"
                      placeholder="Describe your product..."
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 border border-gray-100 dark:border-neutral-800 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-neutral-800 text-stone-500 flex items-center justify-center text-sm">📷</span>
                  Product Media
                </h3>

                <div className="border-2 border-dashed border-gray-200 dark:border-neutral-800 rounded-2xl p-8 text-center hover:border-stone-500 dark:hover:border-stone-500 transition-colors group cursor-pointer relative">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    multiple
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="w-16 h-16 bg-stone-50 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Click to upload images</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isAdding}
                  className="px-8 py-4 bg-stone-900 hover:bg-black text-white rounded-xl font-bold shadow-lg shadow-stone-500/30 hover:shadow-stone-500/50 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isAdding ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      {isEditing ? 'Update Product' : 'Publish Product'}
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Column: Preview */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 border border-gray-100 dark:border-neutral-800 shadow-xl shadow-gray-200/50 dark:shadow-none">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    Store Preview
                  </h3>
                  <div className="bg-gray-50 dark:bg-black rounded-2xl p-6 flex justify-center border border-dashed border-gray-200 dark:border-neutral-800">
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-neutral-800 shadow-lg w-full max-w-[280px] group relative">
                      <div className="aspect-[4/5] bg-gray-100 dark:bg-neutral-800 relative overflow-hidden">
                        {imagePreviews.length > 0 ? (
                          <img
                            src={imagePreviews[0]}
                            alt="Preview"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 dark:text-neutral-700">
                            <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            <span className="text-xs font-medium">No Image</span>
                          </div>
                        )}
                        {newProduct.category === 'New Arrivals' && (
                          <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                            New
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="text-xs font-semibold text-stone-500 mb-1 tracking-wide uppercase">{newProduct.category || 'Category'}</p>
                        <h4 className="font-bold text-gray-900 dark:text-white text-base mb-2 truncate leading-tight">{newProduct.name || 'Product Name'}</h4>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-gray-900 dark:text-white">${Number(newProduct.price).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </section>
      );
    }

    if (activeSection === 'orders') {
      const filteredOrders = orderStatusFilter === 'all'
        ? orders
        : orders.filter(o => o.status === orderStatusFilter);
      const sortedOrders = [...filteredOrders].sort((a, b) => {
        if (orderSortMode === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return a.status.localeCompare(b.status);
      });
      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
      return (
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Orders</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'} • Total Revenue: ${totalRevenue.toFixed(2)}
              </p>
            </div>
            <div className="flex gap-3">
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value as any)}
                className="px-4 py-2 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl text-sm focus:ring-2 focus:ring-stone-500/20 focus:border-stone-500 outline-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={orderSortMode}
                onChange={(e) => setOrderSortMode(e.target.value as any)}
                className="px-4 py-2 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl text-sm focus:ring-2 focus:ring-stone-500/20 focus:border-stone-500 outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="status">By Status</option>
              </select>
            </div>
          </div>
          {sortedOrders.length === 0 ? (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-12 border border-gray-100 dark:border-neutral-800 text-center">
              <p className="text-gray-500 dark:text-gray-400">No orders found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortedOrders.map((order) => {
                const statusConfig = getStatusConfig(order.status);
                return (
                  <div key={order._id} className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-gray-100 dark:border-neutral-800 shadow-sm hover:shadow-lg transition-all duration-300 group">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">{order.fullName}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                        {statusConfig.icon}
                        <span className="capitalize">{order.status}</span>
                      </span>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                        <span className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                        </span>
                        {order.phone}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                        <span className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        </span>
                        <span className="truncate">{order.address}</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-neutral-800/50 rounded-xl p-4 mb-4">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Order Items</p>
                      <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                        {order.items.map((item, idx) => {
                          const product = products.find(p => p._id === item.productId);
                          const imageUrl = product?.images?.[0] ? getImageUrl(product.images[0]) : null;
                          return (
                            <div key={idx} className="flex items-center justify-between text-sm mb-2 last:mb-0">
                              <div className="flex items-center gap-3">
                                {imageUrl ? (
                                  <img
                                    src={imageUrl}
                                    alt={product?.name || 'Product'}
                                    className="w-10 h-10 rounded-lg object-cover border border-gray-200 dark:border-neutral-700"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-neutral-700 flex items-center justify-center">
                                    <span className="text-[10px] text-gray-500">No img</span>
                                  </div>
                                )}
                                <div className="flex flex-col">
                                  <span className="text-gray-900 dark:text-white font-medium truncate max-w-[140px]">
                                    {product?.name || `Product ${item.productId.substring(0, 6)}...`}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    Qty: {item.quantity}
                                  </span>
                                </div>
                              </div>
                              <span className="text-gray-900 dark:text-white font-medium">${item.price.toFixed(2)}</span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-neutral-700 flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Total</span>
                        <span className="text-lg font-bold text-stone-900 dark:text-white">${order.total.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2">
                      <div className="relative group/status">
                        <button className="px-3 py-2 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-medium hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors flex items-center gap-2">
                          Update Status
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </button>
                        <div className="absolute bottom-full left-0 pb-2 w-32 hidden group-hover/status:block z-10">
                          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-gray-100 dark:border-neutral-700 overflow-hidden">
                            {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((status) => (
                              <button
                                key={status}
                                onClick={() => updateOrderStatus(order._id, status)}
                                className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors ${order.status === status ? 'text-stone-900 bg-stone-100 dark:bg-neutral-800' : 'text-gray-700 dark:text-gray-300'
                                  }`}
                              >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteOrder(order._id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                        title="Delete Order"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      );
    }

    // Dashboard (Overview)
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const totalProducts = products.length;

    return (
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: '💰', color: 'bg-stone-100 text-stone-600' },
            { label: 'Total Orders', value: totalOrders, icon: '🛍️', color: 'bg-stone-100 text-stone-800' },
            { label: 'Products', value: totalProducts, icon: '👗', color: 'bg-stone-200 text-stone-700' },
            { label: 'Pending Orders', value: pendingOrdersCount, icon: '⏳', color: 'bg-amber-100 text-amber-700' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${stat.color}`}>
                  {stat.icon}
                </div>
                <span className="text-xs font-medium text-gray-400 bg-gray-50 dark:bg-neutral-800 px-2 py-1 rounded-lg">+2.5%</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Products</h2>
          <button
            onClick={() => setActiveSection('addProduct')}
            className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
          >
            + Add Product
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <div key={product._id} className="bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all group">
              <div className="h-64 bg-gray-100 dark:bg-neutral-800 relative overflow-hidden">
                {product.images.length > 0 ? (
                  <img
                    src={getImageUrl(product.images[0])}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-sm">No image</span>
                  </div>
                )}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEditing(product)}
                    className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-stone-900 shadow-sm"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product._id)}
                    className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:text-red-500 shadow-sm"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
              <div className="p-5">
                <p className="text-xs font-medium text-stone-500 mb-1">{product.category}</p>
                <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-2 truncate">{product.name}</h4>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">${product.price.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-900 dark:bg-black dark:text-white transition-colors duration-300">
        <div className="absolute inset-0 -z-10 opacity-30">
          <Plasma
            color={isDark ? '#ffffff' : '#1c1917'}
            speed={0.5}
            direction="forward"
            scale={1.2}
            opacity={isDark ? 0.2 : 0.35}
            mouseInteractive={true}
          />
        </div>
        <div className="relative text-xl font-medium flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-stone-500 border-t-transparent rounded-full animate-spin"></div>
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white font-sans transition-colors duration-300 overflow-hidden flex">
      <aside className="w-64 bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-800 flex flex-col z-20 h-full">
        <div className="p-6 border-b border-gray-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="relative w-4 h-4 
       bg-stone-900 
       [clip-path:polygon(50%_0%,70%_30%,100%_50%,70%_70%,50%_100%,30%_70%,0%_50%,30%_30%)]
       before:content-[''] before:absolute before:inset-0 
       before:bg-stone-900 before:blur-md before:opacity-60
       ">
            </div>

            <span className="text-xl font-bold text-stone-900 dark:text-white">
              Aura Admin
            </span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-left ${activeSection === item.id
                ? 'bg-stone-100 dark:bg-stone-500/10 text-stone-900 dark:text-stone-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-800'
                }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${activeSection === item.id
                ? 'bg-stone-200 dark:bg-stone-500/20'
                : 'bg-gray-100 dark:bg-neutral-800 group-hover:bg-white dark:group-hover:bg-neutral-700'
                }`}>
                {item.id === 'dashboard' && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                )}
                {item.id === 'addProduct' && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                )}
                {item.id === 'orders' && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                )}
              </div>
              <div>
                <p className="font-semibold text-sm">{item.label}</p>
                <p className="text-xs opacity-70">{item.description}</p>
              </div>
              {item.id === 'orders' && pendingOrdersCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm min-w-[20px] text-center">
                  {pendingOrdersCount}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100 dark:border-neutral-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Welcome back, {adminEmail}
          </p>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur border-b border-gray-200 dark:border-neutral-800 p-6 flex items-center justify-between z-10">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {navItems.find(i => i.id === activeSection)?.label}
            </h1>

          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
              )}
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-6 relative">
          <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-30">
            <Plasma
              color={isDark ? '#ffffff' : '#1c1917'}
              speed={0.5}
              direction="forward"
              scale={1.5}
              opacity={isDark ? 0.3 : 0.25}
              mouseInteractive={false}
            />
          </div>
          <div className="relative z-10">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 flex items-center gap-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {error}
              </div>
            )}
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;