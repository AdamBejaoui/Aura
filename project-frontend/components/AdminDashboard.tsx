// src/components/AdminDashboard.tsx
import React, { useState, useEffect, useRef } from "react";
import axios from 'axios';
import Plasma from "./Plasma";

// ... (same interfaces as before: Product, Order, etc.)
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

const categories = [
  "New Arrivals",
  "Wardrobe Staples", 
  "Statement Pieces",
  "Streetwear",
  "Evening Luxe"
];

const AdminDashboard = ({ token, onLogout }: AdminDashboardProps) => {
  // ... (all your state & refs unchanged)
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'New Arrivals',
    price: 0,
    description: '',
    images: [] as string[],
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const authHeader = {
    headers: { 
      Authorization: token ? `Bearer ${token}` : ''
    }
  };

  // ... (useEffect & all handlers unchanged — keep your working logic!)
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
          setError('Failed to load admin data');
        }
        console.error('Admin data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // === ALL YOUR HANDLERS REMAIN UNCHANGED BELOW ===
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const previews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(previews);
    } else {
      setImagePreviews([]);
    }
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setEditImagePreview(null);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('name', newProduct.name);
      formData.append('category', newProduct.category);
      formData.append('price', newProduct.price.toString());
      formData.append('description', newProduct.description);

      const fileInput = fileInputRef.current;
      if (fileInput?.files && fileInput.files.length > 0) {
        Array.from(fileInput.files).forEach(file => formData.append('images', file));
      } else if (newProduct.images.length > 0) {
        newProduct.images.forEach(url => formData.append('images', url));
      } else {
        setError('At least one image is required');
        setIsAdding(false);
        return;
      }

      const response = await axios.post('http://localhost:5000/api/products', formData, authHeader);
      setProducts([...products, response.data]);
      setNewProduct({ name: '', category: 'New Arrivals', price: 0, description: '', images: [] });
      setImagePreviews([]);
      if (fileInput) (fileInput as HTMLInputElement).value = '';
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add product');
      console.error('Add product error:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const startEditing = (product: Product) => {
    setEditingProduct(product);
    setEditImagePreview(null);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setIsEditing(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('name', editingProduct.name);
      formData.append('category', editingProduct.category);
      formData.append('price', editingProduct.price.toString());
      formData.append('description', editingProduct.description);

      const fileInput = editFileInputRef.current;
      if (fileInput?.files && fileInput.files.length > 0) {
        Array.from(fileInput.files).forEach(file => formData.append('images', file));
      }

      const response = await axios.patch(`http://localhost:5000/api/products/${editingProduct._id}`, formData, authHeader);
      setProducts(products.map(p => p._id === editingProduct._id ? response.data : p));
      setEditingProduct(null);
      setEditImagePreview(null);
      if (fileInput) (fileInput as HTMLInputElement).value = '';
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update product');
      console.error('Update product error:', err);
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/products/${productId}`, authHeader);
      setProducts(products.filter(p => p._id !== productId));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete product');
      console.error('Delete product error:', err);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await axios.patch(`http://localhost:5000/api/orders/${orderId}/status`, { status }, authHeader);
      setOrders(orders.map(order => order._id === orderId ? response.data : order));
    } catch (err: any) {
      setError('Failed to update order status');
      console.error('Update order error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-indigo-900 text-xl font-medium flex items-center gap-2">
          <div className="w-5 h-5 border-t-2 border-pink-500 rounded-full animate-spin"></div>
          Loading...
        </div>
      </div>
    );
  }

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return 'https://placehold.co/300x400/f8fafc/94a3b8?text=No+Image';
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:5000${imagePath}`;
  };

  // Stats
  const totalOrders = orders.length;
  const totalProducts = products.length;
  const totalCustomers = new Set(orders.map(o => o.fullName)).size;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { bg: string; text: string; icon: JSX.Element }> = {
      pending: {
        bg: 'bg-amber-100',
        text: 'text-amber-800',
        icon: (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        )
      },
      confirmed: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        icon: (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 7.44a1 1 0 00-1.415-1.415L9 12.586 7.293 10.879a1 1 0 00-1.415 1.415l2.707 2.707a1 1 0 001.415 0z" clipRule="evenodd" />
          </svg>
        )
      },
      shipped: {
        bg: 'bg-purple-100',
        text: 'text-purple-800',
        icon: (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 7.865c0-.249.07-.474.204-.658.135-.185.321-.324.567-.418v-1.698c-.22.071-.412.164-.567.267C7.93 5.659 7.865 5.885 7.865 6.134c0 .249.065.475.199.659.135.184.321.323.567.417V8.908z" />
            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h8V4H4zm9.982 1.247a.75.75 0 01.75.75V9a.75.75 0 01-1.5 0V6.369a.75.75 0 01.732-.753l.018-.002zM11 9a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V9.75A.75.75 0 0111 9zm3.25 1.5a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0v-1.5z" clipRule="evenodd" />
            <path d="M16 12.5a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0zm-3.5-2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
        )
      },
      delivered: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )
      },
      cancelled: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        )
      }
    };
    return configs[status] || configs.pending;
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
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
  <header className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
        Aura Admin
      </h1>
      <p className="text-sm text-gray-500 mt-0.5">Curate with confidence</p>
    </div>
    <button 
      onClick={onLogout} 
      className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md"
    >
      Logout
    </button>
  </header>
</div>


      <main className="pt-32 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-8 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-start">
            <svg className="w-5 h-5 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {[
            { title: 'Total Orders', value: totalOrders, icon: '📦' },
            { title: 'Total Products', value: totalProducts, icon: '👗' },
            { title: 'Customers', value: totalCustomers, icon: '👥' },
            { title: 'Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: '💰' },
          ].map((stat, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-pink-200 transition-all duration-200"
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
          ))}
        </section>

        {/* Add Product */}
        <section className="mb-12 bg-white rounded-2xl p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-5">Add New Product</h2>
          <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none transition"
                  required
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                <input
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none transition"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  multiple
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none transition"
                  required
                />
                {imagePreviews.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-3">
                    {imagePreviews.map((preview, idx) => (
                      <img
                        key={idx}
                        src={preview}
                        alt={`Preview ${idx}`}
                        className="h-16 w-16 object-cover rounded-lg border border-gray-200"
                      />
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none transition"
                  rows={3}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isAdding}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-medium py-3 rounded-xl transition-all duration-200 disabled:opacity-70"
              >
                {isAdding ? 'Adding...' : 'Add Product'}
              </button>
            </div>
          </form>
        </section>

        {/* Orders */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-5">Orders ({orders.length})</h2>
          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 text-gray-500">
              No orders yet. Your first customer is on their way!
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => {
                const status = getStatusConfig(order.status);
                return (
                  <div key={order._id} className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-pink-200 transition">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{order.fullName}</h3>
                        <p className="text-sm text-gray-600 mt-1">{order.phone} • {order.address}</p>
                        <p className="text-sm text-gray-600 mt-1"><span className="font-medium">Size:</span> {order.size}</p>
                        <div className="mt-3">
                          <h4 className="font-medium text-gray-800 mb-1">Items:</h4>
                          {order.items.map((item, idx) => (
                            <div key={idx} className="text-sm text-gray-600">
                              {item.quantity}× @ ${item.price.toFixed(2)}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between text-right min-w-[180px]">
                        <div>
                          <p className="text-xl font-bold text-gray-900">${order.total.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                            {status.icon}
                            <span className="ml-1">{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                          </span>
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                            className="text-sm border border-gray-200 rounded-lg px-2.5 py-1 focus:ring-pink-300 focus:border-pink-400 outline-none"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Products */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-5">Products ({products.length})</h2>
          {products.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 text-gray-500">
              No products yet. Add your first masterpiece!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map(product => (
                <div key={product._id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-pink-200 transition group">
                  <div className="h-48 bg-gray-50 flex items-center justify-center">
                    <img
                      src={getImageUrl(product.images[0] || '')}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => { 
                        (e.target as HTMLImageElement).src = 'https://placehold.co/300x400/f8fafc/94a3b8?text=No+Image'; 
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{product.category}</p>
                    <p className="font-bold text-lg mt-2 text-gray-900">${product.price.toFixed(2)}</p>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => startEditing(product)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg text-sm font-medium transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        className="flex-1 bg-rose-100 hover:bg-rose-200 text-rose-700 py-2 rounded-lg text-sm font-medium transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-gray-900">Edit Product</h3>
              <button 
                onClick={() => setEditingProduct(null)} 
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdateProduct} className="space-y-4">
              <input
                type="text"
                value={editingProduct.name}
                onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none"
                placeholder="Product name"
                required
              />
              <select
                value={editingProduct.category}
                onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none"
                required
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <input
                type="number"
                value={editingProduct.price}
                onChange={(e) => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none"
                min="0"
                step="0.01"
                required
              />
              <textarea
                value={editingProduct.description}
                onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none"
                rows={3}
                placeholder="Description"
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Image (optional)</label>
                <input
                  type="file"
                  ref={editFileInputRef}
                  onChange={handleEditImageChange}
                  accept="image/*"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none"
                />
                {(editImagePreview || editingProduct.images[0]) && (
                  <img
                    src={editImagePreview || getImageUrl(editingProduct.images[0])}
                    alt="Preview"
                    className="mt-3 h-32 object-cover rounded-lg border"
                  />
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isEditing}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white py-3 rounded-xl font-medium disabled:opacity-70"
                >
                  {isEditing ? 'Updating...' : 'Update Product'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-xl font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;