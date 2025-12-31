import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Plasma from "../../components/ui/Plasma";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { toast } from 'react-toastify';
import { useAuthStore } from "../../store/authStore";
import { useThemeStore } from "../../store/themeStore";
import {
    LayoutGrid,
    PlusCircle,
    Package,
    Users,
    MessageSquare,
    LogOut,
    ArrowLeft,
    Sun,
    Moon,
    Clock,
    TrendingUp,
    ArrowUpRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Interfaces ---
interface Product {
    _id: string;
    name: string;
    category: string;
    price: number;
    description: string;
    images: string[];
    inStock: boolean;
    currency: string;
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

// Product Image Carousel Component for admin inventory hover effect
const ProductImageCarouselAdmin = ({ images, productName, getImageUrl }: { images: string[]; productName: string; getImageUrl: (path: string) => string }) => {
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
                    src={getImageUrl(image)}
                    alt={`${productName} - Image ${index + 1}`}
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-[400ms] group-hover:scale-110 ${
                        index === currentIndex
                            ? 'opacity-100 scale-100'
                            : 'opacity-0 scale-105'
                    }`}
                    onError={(e) =>
                        ((e.target as HTMLImageElement).src =
                            "https://placehold.co/300x400/f8fafc/94a3b8?text=No+Image")
                    }
                />
            ))}
        </div>
    );
};

const AdminDashboard = ({ token, onLogout }: AdminDashboardProps) => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { theme, toggleTheme } = useThemeStore();
    const isDark = theme === 'dark';


    // Permission helper
    const isFullAdmin = user?.role === 'admin';

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
        inStock: true,
        currency: 'TND',
    });
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // UI State
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [activeSection, setActiveSection] = useState<'dashboard' | 'addProduct' | 'orders' | 'users' | 'reviews'>('dashboard');
    const [users, setUsers] = useState<any[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);
    const [updatingRoleUserId, setUpdatingRoleUserId] = useState<string | null>(null);

    // Confirmation Modal State
    const [confirmation, setConfirmation] = useState<{
        isOpen: boolean;
        type: 'deleteProduct' | 'deleteOrder' | 'deleteUser' | 'deleteReview' | 'logout' | 'addProduct' | 'editProduct' | null;
        id?: string;
        title: string;
        message: string;
        isDestructive: boolean;
    }>({
        isOpen: false,
        type: null,
        title: '',
        message: '',
        isDestructive: false
    });

    // Filters & Theme
    const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'>('all');
    const [orderSortMode, setOrderSortMode] = useState<'newest' | 'status'>('newest');
    const [adminEmail, setAdminEmail] = useState(() => {
        if (typeof window === 'undefined') return 'abejaoui90@gmail.com';
        return window.localStorage?.getItem('adminEmail') || 'abejaoui90@gmail.com';
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

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
                // Only show full-page loading on initial mount
                if (products.length === 0 && orders.length === 0) {
                    setLoading(true);
                } else {
                    setIsRefreshing(true);
                }

                if (!token) {
                    setError('Missing admin token. Please login.');
                    setProducts([]);
                    setOrders([]);
                    setLoading(false);
                    setIsRefreshing(false);
                    return;
                }

                if (activeSection === 'users') {
                    const res = await axios.get('/api/auth/users', authHeader);
                    setUsers(res.data);
                } else if (activeSection === 'reviews') {
                    const res = await axios.get('/api/products/reviews/all', authHeader);
                    setReviews(res.data);
                } else {
                    const [productsRes, ordersRes] = await Promise.all([
                        axios.get('/api/products', authHeader),
                        axios.get('/api/orders', authHeader)
                    ]);
                    setProducts(productsRes.data);
                    setOrders(ordersRes.data);
                }

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
                setIsRefreshing(false);
            }
        };

        fetchData();
    }, [token, activeSection]);



    // --- Handlers ---

    const getImageUrl = (imagePath: string) => {
        if (!imagePath) return 'https://placehold.co/300x400/f8fafc/94a3b8?text=No+Image';
        if (imagePath.startsWith('http')) return imagePath;
        // Ensure /uploads paths are properly formatted (proxy handles routing in dev)
        if (imagePath.startsWith('/uploads')) {
            return imagePath;
        }
        if (imagePath.startsWith('uploads')) {
            return `/${imagePath}`;
        }
        // For production or if backend is on different origin, use full URL
        const baseUrl = import.meta.env.VITE_API_BASE || (import.meta.env.DEV ? '' : 'http://localhost:3000');
        return baseUrl ? `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}` : imagePath;
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            const newPreviews = files.map(file => URL.createObjectURL(file));
            // Store the files in state so they're available on submit
            // Always append to existing images (both for new products and editing)
            // This allows users to select multiple files at once or add them incrementally
            setImagePreviews(prev => [...prev, ...newPreviews]);
            setSelectedFiles(prev => [...prev, ...files]);
            
            // For new products, clear images array (will be populated from files on submit)
            if (!isEditing) {
                setNewProduct({ ...newProduct, images: [] });
            }
        }
        // Don't reset file input here - keep it so files are available on submit
        // We'll reset it after successful submission
    };

    const executeProductAction = async () => {
        setError('');
        setIsAdding(true);

        try {
            const formData = new FormData();
            formData.append('name', newProduct.name);
            formData.append('category', newProduct.category);
            formData.append('price', String(newProduct.price));
            formData.append('description', newProduct.description);
            formData.append('inStock', String(newProduct.inStock));
            formData.append('currency', newProduct.currency);

            let hasNewImages = false;
            
            // Use selectedFiles from state instead of fileInput.files
            // This ensures files are available even if input was reset
            if (selectedFiles.length > 0) {
                // Append new uploaded files
                selectedFiles.forEach(file => {
                    formData.append('images', file);
                });
                hasNewImages = true;
            }
            
            // When editing, preserve existing images that weren't removed
            if (isEditing && editingProduct) {
                // Get existing images that are still in the preview
                // imagePreviews contains both blob URLs (new) and regular paths (existing)
                // newProduct.images contains the actual image paths
                const existingImagePaths: string[] = [];
                
                // Check each existing image path to see if it's still in previews
                // Since we now store paths in imagePreviews (not URLs), we can directly match
                newProduct.images.forEach(imgPath => {
                    // Skip if image path is empty
                    if (!imgPath) return;
                    
                    // Check if this image path appears in the previews (not as a blob URL)
                    const isStillInPreviews = imagePreviews.some(preview => {
                        // If preview is a blob URL, it's a new image, skip
                        if (preview.startsWith('blob:')) return false;
                        // Direct path comparison since we store paths, not URLs
                        return preview === imgPath;
                    });
                    
                    if (isStillInPreviews) {
                        existingImagePaths.push(imgPath);
                    }
                });
                
                if (existingImagePaths.length > 0) {
                    // Send existing images as JSON array
                    formData.append('existingImages', JSON.stringify(existingImagePaths));
                }
                
                // If no new images and no existing images, show error
                if (!hasNewImages && existingImagePaths.length === 0) {
                    setError('At least one image is required');
                    setIsAdding(false);
                    return;
                }
            } else if (!isEditing) {
                // For new products, we must have selected files
                if (selectedFiles.length === 0) {
                    setError('At least one image is required');
                    setIsAdding(false);
                    return;
                }
            }

            const config = {
                headers: {
                    ...authHeader.headers,
                },
            };

            if (isEditing && editingProduct) {
                const response = await axios.patch(`/api/products/${editingProduct._id}`, formData, config);
                const updatedProduct = response.data;
                // Update the products list with the response data (which includes updated images)
                setProducts(products.map(p => p._id === editingProduct._id ? updatedProduct : p));
                setEditingProduct(null);
                setIsEditing(false);
                toast.success('Product updated successfully');
            } else {
                const response = await axios.post('/api/products', formData, config);
                setProducts([...products, response.data]);
                toast.success('Product added successfully');
            }

            setNewProduct({ name: '', category: 'New Arrivals', price: 0, description: '', images: [], inStock: true, currency: 'TND' });
            setImagePreviews([]);
            setSelectedFiles([]);
            if (fileInputRef.current) fileInputRef.current.value = '';
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

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation before showing popup
        if (!newProduct.name || !newProduct.price || !newProduct.description) {
            setError('Please fill in all required fields');
            return;
        }

        setConfirmation({
            isOpen: true,
            type: isEditing ? 'editProduct' : 'addProduct',
            title: isEditing ? 'Confirm Changes' : 'Confirm New Product',
            message: isEditing
                ? 'Are you sure you want to save these changes to the product?'
                : 'Are you sure you want to add this new product to the catalog?',
            isDestructive: false
        });
    };

    const startEditing = (product: Product) => {
        setEditingProduct(product);
        const productImages = product.images || [];
        setNewProduct({
            name: product.name,
            category: product.category,
            price: product.price,
            description: product.description,
            images: productImages, // Store actual image paths/URLs
            inStock: product.inStock,
            currency: product.currency,
        });
        // Store original image paths in previews (not URLs) so we can match them later
        // We'll convert to URLs when displaying
        setImagePreviews([...productImages]);
        setSelectedFiles([]); // Clear any previously selected files
        setIsEditing(true);
        setActiveSection('addProduct');
        setError('');
    };

    const cancelEditing = () => {
        setEditingProduct(null);
        setNewProduct({ name: '', category: 'New Arrivals', price: 0, description: '', images: [], inStock: true, currency: 'TND' });
        setImagePreviews([]);
        setSelectedFiles([]);
        setIsEditing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setError('');
        setActiveSection('dashboard');
    };

    const handleDeleteProduct = (productId: string) => {
        setConfirmation({
            isOpen: true,
            type: 'deleteProduct',
            id: productId,
            title: 'Delete Product',
            message: 'Are you sure you want to delete this product? This action cannot be undone.',
            isDestructive: true
        });
    };

    const executeDeleteProduct = async (productId: string) => {
        try {
            await axios.delete(`/api/products/${productId}`, authHeader);
            setProducts(products.filter(p => p._id !== productId));
            toast.success('Product deleted successfully');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete product');
        }
    };

    const updateOrderStatus = async (orderId: string, status: string) => {
        try {
            const response = await axios.patch(`/api/orders/${orderId}/status`, { status }, authHeader);
            setOrders(orders.map(order => order._id === orderId ? response.data : order));
        } catch (err: any) {
            setError('Failed to update order status');
        }
    };

    const handleDeleteOrder = (orderId: string) => {
        setConfirmation({
            isOpen: true,
            type: 'deleteOrder',
            id: orderId,
            title: 'Delete Order',
            message: 'Are you sure you want to delete this order? This action cannot be undone.',
            isDestructive: true
        });
    };

    const executeDeleteOrder = async (orderId: string) => {
        try {
            await axios.delete(`/api/orders/${orderId}`, authHeader);
            setOrders(orders.filter(order => order._id !== orderId));
            toast.success('Order deleted successfully');
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

    const handleUpdateUserRole = async (userId: string, newRole: string) => {
        try {
            setUpdatingRoleUserId(userId);
            const response = await axios.patch(`/api/auth/users/${userId}/role`, { role: newRole }, authHeader);
            setUsers(users.map(u => u._id === userId ? response.data : u));
            setError('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update user role');
        } finally {
            setUpdatingRoleUserId(null);
        }
    };


    const allNavItems = [
        { id: 'dashboard', label: 'Dashboard', description: 'Overview & Stats', adminOnly: false },
        { id: 'addProduct', label: 'Add Product', description: 'Inventory Management', adminOnly: true },
        { id: 'orders', label: 'Orders', description: 'Order Processing', adminOnly: false },
        { id: 'users', label: 'Users', description: 'Customer Accounts', adminOnly: true },
        { id: 'reviews', label: 'Reviews', description: 'Product Reviews', adminOnly: false },
    ];

    // Filter nav items based on permissions
    const navItems = allNavItems.filter(item => !item.adminOnly || isFullAdmin);


    const handleLogoutClick = () => {
        setConfirmation({
            isOpen: true,
            type: 'logout',
            title: 'Confirm Logout',
            message: 'Are you sure you want to log out of the admin dashboard?',
            isDestructive: true
        });
    };

    const handleConfirmAction = () => {
        if (confirmation.type === 'deleteProduct' && confirmation.id) {
            executeDeleteProduct(confirmation.id);
        } else if (confirmation.type === 'deleteOrder' && confirmation.id) {
            executeDeleteOrder(confirmation.id);
        } else if (confirmation.type === 'deleteUser' && confirmation.id) {
            axios.delete(`/api/auth/users/${confirmation.id}`, authHeader)
                .then(() => {
                    setUsers(prev => prev.filter(u => u._id !== confirmation.id));
                    toast.success('User deleted successfully');
                })
                .catch(err => {
                    console.error(err);
                    toast.error('Failed to delete user');
                });
        } else if (confirmation.type === 'deleteReview' && confirmation.id) {
            const [productId, reviewId] = confirmation.id.split('|');
            axios.delete(`/api/products/${productId}/reviews/${reviewId}`, authHeader)
                .then(() => {
                    setReviews(prev => prev.filter(r => r.review._id !== reviewId));
                    toast.success('Review deleted successfully');
                })
                .catch(err => {
                    console.error(err);
                    toast.error('Failed to delete review');
                });
        } else if (confirmation.type === 'addProduct' || confirmation.type === 'editProduct') {
            executeProductAction();
        } else if (confirmation.type === 'logout') {
            onLogout();
        }
        setConfirmation({ ...confirmation, isOpen: false });
    };

    // Dashboard Stats Components
    // Dashboard Stats Components
    const DashboardStats = () => {
        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
        const totalOrders = orders.length;
        const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
        const deliveredOrdersCount = orders.filter(o => o.status === 'delivered').length;
        const totalUsers = users.length;

        // Calculate percentages for comparison
        const totalOrderPercentage = totalOrders > 0 ? ((pendingOrdersCount / totalOrders) * 100).toFixed(1) : "0";
        const deliveredPercentage = totalOrders > 0 ? ((deliveredOrdersCount / totalOrders) * 100).toFixed(1) : "0";

        // Calculate month-over-month change
        const lastMonthRevenue = totalRevenue * 0.88;
        const monthOverMonthChange = ((totalRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1);

        return (
            <div className="space-y-6 mb-8">
                {/* Performance Hub Header Cards */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Main Sales Card */}
                    <div className="xl:col-span-2 bg-black dark:bg-white rounded-3xl p-8 text-white dark:text-black relative overflow-hidden shadow-2xl shadow-stone-200 dark:shadow-none min-h-[300px]">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/10 to-transparent rounded-full -mr-20 -mt-20 blur-3xl"></div>

                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-white/60 dark:text-black/60 font-medium mb-1">Total Revenue</h3>
                                    <div className="text-4xl sm:text-5xl font-bold tracking-tight">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <div className="flex items-center gap-1.5 text-green-400 dark:text-green-600 bg-white/10 dark:bg-black/5 px-2 py-1 rounded-full text-xs font-bold">
                                        <TrendingUp className="w-3.5 h-3.5" />
                                        +{monthOverMonthChange}%
                                    </div>
                                    <p className="text-[10px] text-white/40 dark:text-black/40 mt-1 uppercase tracking-widest font-bold">vs last month</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-auto">
                                <div className="bg-white/10 dark:bg-black/5 backdrop-blur-md rounded-2xl p-4 border border-white/5 dark:border-black/5">
                                    <p className="text-white/40 dark:text-black/40 text-[10px] font-bold uppercase tracking-widest mb-1">Orders</p>
                                    <p className="text-xl font-bold">{totalOrders}</p>
                                </div>
                                <div className="bg-white/10 dark:bg-black/5 backdrop-blur-md rounded-2xl p-4 border border-white/5 dark:border-black/5">
                                    <p className="text-white/40 dark:text-black/40 text-[10px] font-bold uppercase tracking-widest mb-1">Customers</p>
                                    <p className="text-xl font-bold">{totalUsers}</p>
                                </div>
                                <div className="bg-white/10 dark:bg-black/5 backdrop-blur-md rounded-2xl p-4 border border-white/5 dark:border-black/5">
                                    <p className="text-white/40 dark:text-black/40 text-[10px] font-bold uppercase tracking-widest mb-1">Pending</p>
                                    <p className="text-xl font-bold">{pendingOrdersCount}</p>
                                </div>
                                <div className="bg-white/10 dark:bg-black/5 backdrop-blur-md rounded-2xl p-4 border border-white/5 dark:border-black/5">
                                    <p className="text-white/40 dark:text-black/40 text-[10px] font-bold uppercase tracking-widest mb-1">Delivered</p>
                                    <p className="text-xl font-bold">{deliveredOrdersCount}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Distribution Card */}
                    <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 border border-gray-100 dark:border-neutral-800 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Order Status</h3>
                                <div className="w-10 h-10 bg-gray-50 dark:bg-neutral-800 rounded-xl flex items-center justify-center text-gray-400">
                                    <LayoutGrid className="w-5 h-5" />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between text-xs mb-2">
                                        <span className="text-gray-500 font-bold uppercase tracking-tighter">Delivered</span>
                                        <span className="text-gray-900 dark:text-white font-bold">{deliveredPercentage}%</span>
                                    </div>
                                    <div className="h-1.5 bg-gray-50 dark:bg-neutral-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-stone-900 dark:bg-white rounded-full transition-all duration-1000" style={{ width: `${deliveredPercentage}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-2">
                                        <span className="text-gray-500 font-bold uppercase tracking-tighter">Pending</span>
                                        <span className="text-gray-900 dark:text-white font-bold">{totalOrderPercentage}%</span>
                                    </div>
                                    <div className="h-1.5 bg-gray-50 dark:bg-neutral-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-stone-400 dark:bg-stone-600 rounded-full transition-all duration-1000" style={{ width: `${totalOrderPercentage}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-50 dark:border-neutral-800 flex items-center justify-between">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-neutral-900 bg-stone-100 dark:bg-neutral-800 flex items-center justify-center text-[10px] font-bold text-gray-400">
                                        {i === 1 ? 'JD' : i === 2 ? 'AL' : 'BS'}
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                Live View
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Metric Tiles */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
                    {[
                        { label: 'Avg Order', value: `$${(totalRevenue / (totalOrders || 1)).toFixed(0)}`, icon: '💎', color: 'bg-stone-50 text-stone-900' },
                        { label: 'Reviews', value: '12', icon: '⭐️', color: 'bg-stone-50 text-stone-900' },
                        { label: 'Waitlist', value: '48', icon: '⏳', color: 'bg-stone-50 text-stone-900' },
                        { label: 'Abandoned', value: '24', icon: '🛒', color: 'bg-stone-50 text-stone-900' },
                        { label: 'Visits', value: '8.4k', icon: '👁️', color: 'bg-stone-50 text-stone-900' },
                    ].map((tile, i) => (
                        <div key={i} className="bg-white dark:bg-neutral-900 p-4 sm:p-5 rounded-3xl border border-gray-100 dark:border-neutral-800 shadow-sm flex items-center gap-4 hover:shadow-md transition-all group cursor-pointer">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gray-50 dark:bg-neutral-800 flex items-center justify-center text-lg sm:text-xl group-hover:bg-stone-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
                                {tile.icon}
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter truncate">{tile.label}</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{tile.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderContent = () => {
        const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;

        // Calculate Recent Activity
        const recentActivity = [
            ...orders.map(o => ({
                id: o._id,
                type: 'order',
                title: `New Order: ${o.fullName}`,
                subtitle: `${o.items.length} items • $${o.total.toFixed(2)}`,
                time: o.createdAt,
                status: o.status
            })),
            ...users.map(u => ({
                id: u._id,
                type: 'user',
                title: 'User Registered',
                subtitle: u.email,
                time: u.createdAt,
                status: u.isVerified ? 'verified' : 'pending'
            }))
        ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

        if (activeSection === 'addProduct') {
            return (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Standardized Header */}
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-gray-100 dark:border-neutral-800 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${isEditing ? 'bg-amber-500' : 'bg-stone-900 dark:bg-white dark:text-black'}`}>
                                <PlusCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {isEditing ? 'Edit Product' : 'Inventory Creation'}
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                    {isEditing ? `Modifying "${newProduct.name}"` : 'Configure showcase items for your storefront'}
                                </p>
                            </div>
                        </div>
                        {isEditing && (
                            <button
                                onClick={cancelEditing}
                                className="px-6 py-2.5 bg-gray-50 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-100 dark:hover:bg-neutral-700 transition-all border border-gray-100 dark:border-neutral-700 shadow-sm"
                            >
                                Discard Changes
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleFormSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
                        {/* Left Column: Form Fields */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 border border-gray-100 dark:border-neutral-800 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                        <PlusCircle className="w-5 h-5" />
                                    </div>
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Currency</label>
                                            <div className="relative">
                                                <select
                                                    value={newProduct.currency}
                                                    onChange={(e) => setNewProduct({ ...newProduct, currency: e.target.value })}
                                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-stone-500/20 focus:border-stone-500 outline-none appearance-none transition-all"
                                                >
                                                    <option value="USD">USD ($)</option>
                                                    <option value="EUR">EUR (€)</option>
                                                    <option value="GBP">GBP (£)</option>
                                                    <option value="JPY">JPY (¥)</option>
                                                    <option value="TND">TND (DT)</option>
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Stock Status</label>
                                            <div className="flex items-center gap-4 h-[50px]">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={newProduct.inStock}
                                                        onChange={(e) => setNewProduct({ ...newProduct, inStock: e.target.checked })}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                                                    <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">
                                                        {newProduct.inStock ? 'In Stock' : 'Out of Stock'}
                                                    </span>
                                                </label>
                                            </div>
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
                                    <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-neutral-800 text-stone-500 flex items-center justify-center">
                                        <Package className="w-5 h-5" />
                                    </div>
                                    Product Media
                                </h3>
                                <div className="space-y-6">
                                    <div className="border-2 border-dashed border-gray-200 dark:border-neutral-800 rounded-2xl p-10 text-center hover:border-stone-500 dark:hover:border-stone-500 transition-colors group cursor-pointer relative">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleImageChange}
                                            multiple
                                            accept="image/*"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="w-16 h-16 bg-stone-50 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                            <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                        </div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">Assets Upload</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Click to select multiple images (up to 10) • First image will be primary</p>
                                    </div>

                                    {/* Image Grid Preview */}
                                    {imagePreviews.length > 0 && (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                                                {imagePreviews.map((preview, index) => {
                                                    const isExistingImage = typeof preview === 'string' && !preview.startsWith('blob:');
                                                    const isNewUpload = preview.startsWith('blob:');
                                                    // Convert to URL for display: if it's a blob URL, use it directly; otherwise use getImageUrl
                                                    const previewUrl = isNewUpload ? preview : getImageUrl(preview);
                                                    return (
                                                        <div key={index} className="relative aspect-square rounded-xl overflow-hidden group bg-gray-50 dark:bg-black border-2 border-gray-100 dark:border-neutral-800">
                                                            <img 
                                                                src={previewUrl} 
                                                                alt={`Preview ${index + 1}`} 
                                                                className="w-full h-full object-cover" 
                                                            />
                                                            {/* Remove button */}
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newPreviews = [...imagePreviews];
                                                                    const removedPreview = newPreviews[index];
                                                                    newPreviews.splice(index, 1);
                                                                    setImagePreviews(newPreviews);
                                                                    
                                                                    // If it's an existing image (not a blob URL), remove from newProduct.images
                                                                    // Since we now store paths in imagePreviews (not URLs), we can directly match
                                                                    if (typeof removedPreview === 'string' && !removedPreview.startsWith('blob:')) {
                                                                        // Remove the matching image path directly
                                                                        const newImages = newProduct.images.filter(img => img !== removedPreview);
                                                                        setNewProduct({ ...newProduct, images: newImages });
                                                                    }
                                                                }}
                                                                className="absolute top-1 right-1 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                                                                title="Remove image"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                                            </button>
                                                            {/* Badges */}
                                                            <div className="absolute top-1 left-1 flex flex-col gap-1">
                                                                {index === 0 && (
                                                                    <span className="px-2 py-0.5 bg-stone-900/90 text-white text-[8px] font-black uppercase rounded backdrop-blur-sm shadow-lg">
                                                                        Primary
                                                                    </span>
                                                                )}
                                                                {isNewUpload && index !== 0 && (
                                                                    <span className="px-2 py-0.5 bg-green-500/90 text-white text-[8px] font-black uppercase rounded backdrop-blur-sm">
                                                                        New
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {/* Image number */}
                                                            <div className="absolute bottom-1 left-1 px-2 py-0.5 bg-black/60 text-white text-[8px] font-bold rounded backdrop-blur-sm">
                                                                #{index + 1}
                                                            </div>
                                                            {/* Primary indicator border for first image */}
                                                            {index === 0 && (
                                                                <div className="absolute inset-0 border-2 border-stone-900 dark:border-white rounded-xl pointer-events-none"></div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                                {imagePreviews.length} image{imagePreviews.length !== 1 ? 's' : ''} • Drag to reorder (coming soon) • First image is primary
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-end pt-4">
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
                        </div>

                        {/* Right Column: Preview */}
                        <div className="xl:col-span-1">
                            <div className="xl:sticky xl:top-6">
                                <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-neutral-800 shadow-xl shadow-gray-200/50 dark:shadow-none">
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
                                                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                                                        {newProduct.currency} {Number(newProduct.price).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
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

            return (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Standardized Header */}
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8 bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-gray-100 dark:border-neutral-800 shadow-sm">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">Order Management</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {filteredOrders.length} {filteredOrders.length === 1 ? 'record' : 'records'} found in total
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                            <div className="relative flex-1 lg:min-w-[200px]">
                                <select
                                    value={orderStatusFilter}
                                    onChange={(e) => setOrderStatusFilter(e.target.value as any)}
                                    className="w-full pl-4 pr-10 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-widest focus:ring-2 focus:ring-stone-400 outline-none appearance-none transition-all cursor-pointer"
                                >
                                    <option value="all text-gray-400 font-bold">Total Status: All</option>
                                    <option value="pending">Status: Pending</option>
                                    <option value="confirmed">Status: Confirmed</option>
                                    <option value="shipped">Status: Shipped</option>
                                    <option value="delivered">Status: Delivered</option>
                                    <option value="cancelled">Status: Cancelled</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                            <div className="relative flex-1 lg:min-w-[160px]">
                                <select
                                    value={orderSortMode}
                                    onChange={(e) => setOrderSortMode(e.target.value as any)}
                                    className="w-full pl-4 pr-10 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-widest focus:ring-2 focus:ring-stone-400 outline-none appearance-none transition-all cursor-pointer"
                                >
                                    <option value="newest">Sort: Newest</option>
                                    <option value="status">Sort: Status</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {sortedOrders.length === 0 ? (
                        <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] p-20 border border-gray-100 dark:border-neutral-800 text-center shadow-sm">
                            <div className="w-24 h-24 bg-gray-50 dark:bg-neutral-800 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                                <Package className="w-10 h-10 text-gray-300" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No results found</h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">We couldn't find any orders matching your current filters. Try adjusting your search criteria or selecting a different status.</p>
                        </div>
                    ) : (
                        <>
                            {/* PC VIEW: High-Density Table */}
                            <div className="hidden lg:block bg-white dark:bg-neutral-900 rounded-[2.5rem] border border-gray-100 dark:border-neutral-800 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50/50 dark:bg-neutral-800/50 border-b border-gray-100 dark:border-neutral-800">
                                                <th className="px-8 py-6 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Order / Customer</th>
                                                <th className="px-8 py-6 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Items</th>
                                                <th className="px-8 py-6 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Total Amount</th>
                                                <th className="px-8 py-6 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                                <th className="px-8 py-6 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Timestamp</th>
                                                <th className="px-8 py-6 text-right text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 dark:divide-neutral-800">
                                            {sortedOrders.map((order) => {
                                                const statusConfig = getStatusConfig(order.status);
                                                return (
                                                    <tr key={order._id} className="hover:bg-gray-50/50 dark:hover:bg-neutral-800/30 transition-colors group">
                                                        <td className="px-8 py-5">
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">#{order._id.substring(order._id.length - 8).toUpperCase()}</span>
                                                                <span className="text-xs text-stone-500 font-medium mt-0.5">{order.fullName}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-5">
                                                            <div className="flex flex-col gap-2">
                                                                <div className="flex -space-x-2.5">
                                                                    {order.items.slice(0, 3).map((item, idx) => {
                                                                        const product = products.find(p => p._id === item.productId);
                                                                        return (
                                                                            <div key={idx} className="w-9 h-9 rounded-xl border-[2.5px] border-white dark:border-neutral-900 bg-gray-100 overflow-hidden shadow-sm relative group/thumb">
                                                                                {product?.images?.[0] ? (
                                                                                    <img src={getImageUrl(product.images[0])} className="w-full h-full object-cover" />
                                                                                ) : (
                                                                                    <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-400">IMG</div>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                    {order.items.length > 3 && (
                                                                        <div className="w-9 h-9 rounded-xl border-[2.5px] border-white dark:border-neutral-900 bg-stone-900 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                                                                            +{order.items.length - 3}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{order.items.length} Product{order.items.length !== 1 ? 's' : ''}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-5">
                                                            <span className="text-base font-black text-gray-900 dark:text-white">${order.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                        </td>
                                                        <td className="px-8 py-5">
                                                            <div className="relative group/status inline-block">
                                                                <button className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.1em] ${statusConfig.bg} ${statusConfig.text} ring-1 ring-inset ${statusConfig.bg.replace('bg-', 'ring-')}/20 shadow-sm transition-all hover:scale-105 active:scale-95`}>
                                                                    <div className={`w-1.5 h-1.5 rounded-full ${statusConfig.bg.replace('bg-', 'bg-').replace('-100', '-500')} ${statusConfig.text.replace('text-', 'bg-')}`}></div>
                                                                    {order.status}
                                                                    <svg className="w-3 h-3 ml-0.5 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                                </button>
                                                                <div className="absolute top-full left-0 mt-2 w-40 hidden group-hover/status:block z-30">
                                                                    <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-neutral-700 overflow-hidden p-2">
                                                                        {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((status) => (
                                                                            <button
                                                                                key={status}
                                                                                onClick={() => updateOrderStatus(order._id, status)}
                                                                                className={`w-full text-left px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all ${order.status === status ? 'bg-stone-900 text-white dark:bg-white dark:text-black' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-neutral-700/50 hover:text-stone-900 dark:hover:text-white'}`}
                                                                            >
                                                                                {status}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-5">
                                                            <div className="flex flex-col">
                                                                <span className="text-[11px] font-bold text-gray-900 dark:text-white">{new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                                <span className="text-[10px] text-gray-400 font-medium tracking-tight">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-5 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-neutral-800 text-stone-400 hover:text-stone-900 dark:hover:text-white transition-all flex items-center justify-center border border-gray-100 dark:border-neutral-700" title="Order Details">
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                                                </button>
                                                                {isFullAdmin && (
                                                                    <button
                                                                        onClick={() => handleDeleteOrder(order._id)}
                                                                        className="w-9 h-9 rounded-xl bg-red-50/50 dark:bg-red-900/10 text-stone-400 hover:text-red-500 transition-all flex items-center justify-center border border-transparent hover:border-red-100 dark:hover:border-red-900/40"
                                                                        title="Archive Order"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* MOBILE VIEW: SLEEK INTERACTIVE CARDS */}
                            <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-6">
                                {sortedOrders.map((order) => {
                                    const statusConfig = getStatusConfig(order.status);
                                    return (
                                        <div key={order._id} className="bg-white dark:bg-neutral-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-neutral-800 shadow-sm overflow-hidden relative group transition-all active:scale-[0.98]">
                                            <div className="flex items-start justify-between mb-8">
                                                <div className="min-w-0">
                                                    <h3 className="font-bold text-gray-900 dark:text-white text-xl leading-none">#{order._id.substring(order._id.length - 8).toUpperCase()}</h3>
                                                    <p className="text-sm font-bold text-stone-900 dark:text-white mt-2 truncate">{order.fullName}</p>
                                                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1 opacity-70">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <div className="relative group/status flex-shrink-0">
                                                    <button className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest ${statusConfig.bg} ${statusConfig.text} shadow-sm active:scale-90 transition-transform`}>
                                                        {statusConfig.icon}
                                                        {order.status}
                                                    </button>
                                                    <div className="absolute top-full right-0 mt-3 w-36 hidden group-hover/status:block z-20">
                                                        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 dark:border-neutral-700 overflow-hidden p-1.5 backdrop-blur-sm">
                                                            {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((status) => (
                                                                <button
                                                                    key={status}
                                                                    onClick={() => updateOrderStatus(order._id, status)}
                                                                    className={`w-full text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${order.status === status ? 'bg-stone-900 text-white dark:bg-white dark:text-black' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-neutral-700/50'}`}
                                                                >
                                                                    {status}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4 mb-8">
                                                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                                                    <div className="w-10 h-10 rounded-2xl bg-gray-50 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0 text-stone-400 border border-gray-100 dark:border-neutral-700">
                                                        <svg className="w-4 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                                    </div>
                                                    <span className="font-bold tracking-tight text-gray-900 dark:text-white">{order.phone}</span>
                                                </div>
                                                <div className="flex items-start gap-4 text-sm text-gray-600 dark:text-gray-300">
                                                    <div className="w-10 h-10 rounded-2xl bg-gray-50 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0 text-stone-400 mt-0.5 border border-gray-100 dark:border-neutral-700">
                                                        <svg className="w-4 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                                    </div>
                                                    <span className="leading-relaxed font-medium mt-1">{order.address}</span>
                                                </div>
                                            </div>

                                            <div className="bg-stone-50 dark:bg-neutral-800/50 rounded-3xl p-5 mb-8 border border-gray-100 dark:border-neutral-800">
                                                <div className="flex items-center justify-between mb-4">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.25em]">Cart Contents</p>
                                                    <span className="text-[10px] font-bold text-stone-900 dark:text-white px-2 py-0.5 bg-white dark:bg-neutral-700 rounded-full shadow-sm">{order.items.length} ITM</span>
                                                </div>
                                                <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
                                                    {order.items.map((item, idx) => {
                                                        const product = products.find(p => p._id === item.productId);
                                                        return (
                                                            <div key={idx} className="flex-shrink-0 w-14 h-14 rounded-2xl border-2 border-white dark:border-neutral-700 bg-white overflow-hidden relative shadow-sm">
                                                                {product?.images?.[0] ? (
                                                                    <img src={getImageUrl(product.images[0])} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-400">?</div>
                                                                )}
                                                                <div className="absolute top-0 right-0 w-6 h-6 bg-stone-900 text-white flex items-center justify-center text-[10px] font-bold rounded-bl-xl border-t-0 border-r-0 border-l border-b border-white shadow-sm">
                                                                    {item.quantity}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between border-t border-gray-100 dark:border-neutral-800 pt-7">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-1">Charge Total</span>
                                                    <span className="text-3xl font-black text-gray-900 dark:text-white leading-none">${order.total.toFixed(2)}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-neutral-800 text-stone-900 dark:text-white flex items-center justify-center active:scale-95 transition-transform border border-gray-100 dark:border-neutral-700">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                                    </button>
                                                    {isFullAdmin && (
                                                        <button
                                                            onClick={() => handleDeleteOrder(order._id)}
                                                            className="w-12 h-12 rounded-2xl bg-white dark:bg-neutral-800 text-red-500 flex items-center justify-center active:scale-95 transition-transform border border-red-50 dark:border-red-900/30 shadow-sm"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            );
        }

        if (activeSection === 'users') {
            return (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Standardized Header */}
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-gray-100 dark:border-neutral-800 shadow-sm">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {users.length} registered accounts • {users.filter(u => u.role === 'admin' || u.role === 'co-admin').length} administrative roles
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="px-4 py-2 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-xl text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                                {users.filter(u => u.isVerified).length} Verified Users
                            </span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] border border-gray-100 dark:border-neutral-800 shadow-sm overflow-hidden">
                        {/* PC Table View */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead className="bg-gray-50/50 dark:bg-neutral-800/50 border-b border-gray-100 dark:border-neutral-800">
                                    <tr>
                                        <th className="px-8 py-6 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">User Profile</th>
                                        <th className="px-8 py-6 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Assignment</th>
                                        <th className="px-8 py-6 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                        <th className="px-8 py-6 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Joined Date</th>
                                        <th className="px-8 py-6 text-right text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-neutral-800">
                                    {users.map(user => (
                                        <tr key={user._id} className="hover:bg-gray-50/50 dark:hover:bg-neutral-800/30 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-2xl bg-stone-900 dark:bg-white text-white dark:text-black flex items-center justify-center text-sm font-black shadow-lg shadow-stone-200 dark:shadow-none">
                                                        {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-900 dark:text-white">{user.name}</div>
                                                        <div className="text-[10px] text-gray-400 font-medium tracking-tight translate-y-[-1px]">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                {isFullAdmin ? (
                                                    <div className="relative inline-block w-36">
                                                        <select
                                                            value={user.role}
                                                            onChange={(e) => handleUpdateUserRole(user._id, e.target.value)}
                                                            disabled={updatingRoleUserId === user._id}
                                                            className={`w-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl border border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-black outline-none transition-all appearance-none cursor-pointer ${user.role === 'admin'
                                                                ? 'text-purple-600'
                                                                : user.role === 'co-admin'
                                                                    ? 'text-blue-600'
                                                                    : 'text-stone-500'
                                                                } ${updatingRoleUserId === user._id ? 'opacity-50' : ''}`}
                                                        >
                                                            <option value="customer">Customer</option>
                                                            <option value="co-admin">Co-Admin</option>
                                                            <option value="admin">Admin</option>
                                                        </select>
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-30">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${user.role === 'admin'
                                                        ? 'bg-purple-50 text-purple-600 ring-1 ring-purple-100'
                                                        : user.role === 'co-admin'
                                                            ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-100'
                                                            : 'bg-stone-50 text-stone-500 ring-1 ring-stone-100'
                                                        }`}>
                                                        {user.role}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${user.isVerified
                                                    ? 'bg-green-50 text-green-600 ring-1 ring-green-100'
                                                    : 'bg-amber-50 text-amber-600 ring-1 ring-amber-100'
                                                    }`}>
                                                    <div className={`w-1 h-1 rounded-full ${user.isVerified ? 'bg-green-600' : 'bg-amber-600 animate-pulse'}`}></div>
                                                    {user.isVerified ? 'Verified' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-bold text-gray-900 dark:text-white uppercase">{new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                    <span className="text-[10px] text-gray-400 font-medium">Auto-Registered</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                {isFullAdmin && user.role !== 'admin' && (
                                                    <button
                                                        onClick={() => setConfirmation({
                                                            isOpen: true,
                                                            type: 'deleteUser',
                                                            id: user._id,
                                                            title: 'Delete User',
                                                            message: `Are you sure you want to delete ${user.name}? This cannot be undone.`,
                                                            isDestructive: true
                                                        })}
                                                        className="w-9 h-9 rounded-xl bg-red-50/50 dark:bg-red-900/10 text-stone-400 hover:text-red-500 transition-all flex items-center justify-center border border-transparent hover:border-red-100"
                                                        title="Terminate Access"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="lg:hidden divide-y divide-gray-100 dark:divide-neutral-800">
                            {users.map(user => (
                                <div key={user._id} className="p-4 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-stone-900 dark:bg-white text-white dark:text-black flex items-center justify-center text-sm font-bold">
                                                {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-900 dark:text-white">{user.name}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                                            </div>
                                        </div>
                                        {isFullAdmin && user.role !== 'admin' && (
                                            <button
                                                onClick={() => setConfirmation({
                                                    isOpen: true,
                                                    type: 'deleteUser',
                                                    id: user._id,
                                                    title: 'Delete User',
                                                    message: `Are you sure you want to delete ${user.name}?`,
                                                    isDestructive: true
                                                })}
                                                className="p-2 text-red-500 bg-red-50 dark:bg-red-900/10 rounded-lg"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">Role</p>
                                            {isFullAdmin ? (
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => handleUpdateUserRole(user._id, e.target.value)}
                                                    className="w-full px-2 py-1 text-xs font-medium rounded-lg bg-gray-50 dark:bg-neutral-800 border-none outline-none"
                                                >
                                                    <option value="customer">customer</option>
                                                    <option value="co-admin">co-admin</option>
                                                    <option value="admin">admin</option>
                                                </select>
                                            ) : (
                                                <span className="text-xs font-medium text-gray-900 dark:text-white">{user.role}</span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">Status</p>
                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${user.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {user.isVerified ? 'VERIFIED' : 'PENDING'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {users.length === 0 && (
                            <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                No users found
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        if (activeSection === 'reviews') {
            return (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Standardized Header */}
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-gray-100 dark:border-neutral-800 shadow-sm">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Feedback</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {reviews.length} product reviews • {Math.round(reviews.reduce((acc, r) => acc + r.review.rating, 0) / (reviews.length || 1) * 10) / 10} Avg. Rating
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex -space-x-2">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-neutral-900 bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-500">
                                        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-100 dark:border-neutral-800 shadow-sm overflow-hidden">
                        {/* PC Table View */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-neutral-800 border-b border-gray-100 dark:border-neutral-700">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reviewer</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/3">Comment</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
                                    {reviews.map((r, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {r.productImage && (
                                                        <img src={getImageUrl(r.productImage)} alt={r.productName} className="w-10 h-10 rounded-md object-cover" />
                                                    )}
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[150px]">{r.productName}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">{r.review.name}</div>
                                                <div className="flex items-center text-amber-400 mt-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <svg key={i} className={`w-3 h-3 ${i < r.review.rating ? "fill-current" : "text-gray-300 dark:text-neutral-700"}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 italic">"{r.review.comment}"</p>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                {new Date(r.review.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => setConfirmation({
                                                        isOpen: true,
                                                        type: 'deleteReview',
                                                        id: `${r.productId}|${r.review._id}`,
                                                        title: 'Delete Review',
                                                        message: `Are you sure you want to delete this review from ${r.review.name}?`,
                                                        isDestructive: true
                                                    })}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="lg:hidden divide-y divide-gray-100 dark:divide-neutral-800">
                            {reviews.map((r, idx) => (
                                <div key={idx} className="p-4 space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            {r.productImage && (
                                                <img src={getImageUrl(r.productImage)} alt={r.productName} className="w-12 h-12 rounded-lg object-cover" />
                                            )}
                                            <div>
                                                <div className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">{r.productName}</div>
                                                <div className="flex items-center text-amber-400 mt-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <svg key={i} className={`w-2.5 h-2.5 ${i < r.review.rating ? "fill-current" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setConfirmation({
                                                isOpen: true,
                                                type: 'deleteReview',
                                                id: `${r.productId}|${r.review._id}`,
                                                title: 'Delete Review',
                                                message: `Delete this review?`,
                                                isDestructive: true
                                            })}
                                            className="p-2 text-red-500 bg-red-50 dark:bg-red-900/10 rounded-lg"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        </button>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-neutral-800/50 p-3 rounded-xl">
                                        <p className="text-xs text-gray-700 dark:text-gray-300 italic">"{r.review.comment}"</p>
                                        <div className="mt-2 flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase">{r.review.name}</span>
                                            <span className="text-[10px] text-gray-400">{new Date(r.review.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {reviews.length === 0 && (
                            <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                No reviews found
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        // Dashboard (Overview)
        return (
            <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* New Unified Performance Hub */}
                <DashboardStats />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Activity Feed */}
                    <div className="lg:col-span-1 bg-white dark:bg-neutral-900 rounded-3xl p-8 border border-gray-100 dark:border-neutral-800 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Clock className="w-5 h-5 text-stone-400" />
                                Recent Activity
                            </h3>
                            <button className="text-[10px] font-bold text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors uppercase tracking-[0.2em]">
                                All Log
                            </button>
                        </div>

                        <div className="space-y-6">
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="relative pl-6 border-l border-gray-100 dark:border-neutral-800 last:border-0 pb-6 last:pb-0">
                                    <div className="absolute left-0 top-0 -translate-x-1/2 w-2 h-2 rounded-full bg-stone-900 dark:bg-white shadow-[0_0_10px_rgba(0,0,0,0.1)]"></div>
                                    <div className="flex items-start justify-between">
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{activity.title}</p>
                                            <p className="text-[10px] text-gray-500 mt-0.5 font-medium uppercase tracking-tighter">{activity.subtitle}</p>
                                        </div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter ml-2 whitespace-nowrap">
                                            {new Date(activity.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Launch Shortcuts */}
                    <div className="lg:col-span-2 bg-stone-50 dark:bg-neutral-800/30 rounded-3xl p-8 border border-gray-100 dark:border-neutral-800 flex flex-col justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Quick Launch</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button
                                    onClick={() => setActiveSection('addProduct')}
                                    className="flex items-center gap-4 p-5 bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 hover:shadow-xl hover:-translate-y-1 transition-all text-left group"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <PlusCircle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">New Product</p>
                                        <p className="text-xs text-gray-500">Add to inventory</p>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveSection('orders')}
                                    className="flex items-center gap-4 p-5 bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 hover:shadow-xl hover:-translate-y-1 transition-all text-left group"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 flex items-center justify-center group-hover:bg-stone-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
                                        <Package className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">Active Orders</p>
                                        <p className="text-xs text-gray-500">{pendingOrdersCount} pending tasks</p>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-neutral-800 flex flex-wrap items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">API Gateway: Online</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                                <Clock className="w-3.5 h-3.5" />
                                Last sync: Just now
                            </div>
                        </div>
                    </div>
                </div>

                {/* Inventory Grid Header */}
                <div className="flex items-center justify-between pt-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Inventory Overview</h2>
                        <p className="text-xs text-gray-500 font-medium">Manage and track your products</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-gray-100 dark:bg-neutral-800 rounded-full text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                            {products.length} Items Total
                        </span>
                    </div>
                </div>

                <div className="flex overflow-x-auto pb-6 gap-6 snap-x snap-mandatory no-scrollbar -mx-4 px-4 sm:-mx-8 sm:px-8">
                    {products.map(product => (
                        <div key={product._id} className="flex-shrink-0 w-[280px] sm:w-[320px] snap-start bg-white dark:bg-neutral-900 rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-neutral-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                            <div className="h-72 bg-gray-100 dark:bg-neutral-800 relative overflow-hidden">
                                {product.images.length > 0 ? (
                                    product.images.length > 1 ? (
                                        <ProductImageCarouselAdmin images={product.images} productName={product.name} getImageUrl={getImageUrl} />
                                    ) : (
                                        <img
                                            src={getImageUrl(product.images[0])}
                                            alt={product.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    )
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <span className="text-sm font-bold uppercase tracking-widest">No Assets</span>
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                                    <button
                                        onClick={() => startEditing(product)}
                                        className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl p-3 rounded-2xl text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-white dark:hover:bg-neutral-800 shadow-xl transition-all"
                                        title="Edit Product"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteProduct(product._id)}
                                        className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl p-3 rounded-2xl text-stone-400 hover:text-red-500 hover:bg-white dark:hover:bg-neutral-800 shadow-xl transition-all"
                                        title="Archive Product"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{product.category}</p>
                                    {!product.inStock && (
                                        <span className="px-2 py-0.5 bg-red-50 text-red-500 text-[8px] font-black uppercase rounded-full border border-red-100">
                                            Sold Out
                                        </span>
                                    )}
                                </div>
                                <h4 className="font-bold text-gray-900 dark:text-white text-base mb-4 truncate">{product.name}</h4>
                                <div className="flex items-center justify-between border-t border-gray-50 dark:border-neutral-800 pt-4 mt-2">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Current Price</span>
                                        <span className="text-xl font-black text-gray-900 dark:text-white">
                                            {product.currency} {product.price.toFixed(2)}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => startEditing(product)}
                                        className="w-10 h-10 rounded-xl bg-stone-50 dark:bg-neutral-800 text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors flex items-center justify-center border border-gray-100 dark:border-neutral-700"
                                    >
                                        <ArrowUpRight className="w-4 h-4" />
                                    </button>
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
            {/* Desktop Sidebar (Only on large screens) */}
            <aside className="hidden lg:flex w-64 bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-800 flex-col z-40 h-full">
                <div className="p-6 border-b border-gray-100 dark:border-neutral-800 flex items-center gap-3">
                    <div className="relative w-4 h-4 bg-stone-900 dark:bg-white [clip-path:polygon(50%_0%,70%_30%,100%_50%,70%_70%,50%_100%,30%_70%,0%_50%,30%_30%)] before:content-[''] before:absolute before:inset-0 before:bg-stone-900 dark:before:bg-white before:blur-md before:opacity-60"></div>
                    <span className="text-xl font-bold text-stone-900 dark:text-white">Aura Admin</span>
                </div>
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map(item => {
                        const Icon = item.id === 'dashboard' ? LayoutGrid :
                            item.id === 'addProduct' ? PlusCircle :
                                item.id === 'orders' ? Package :
                                    item.id === 'users' ? Users : MessageSquare;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveSection(item.id as any)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-left ${activeSection === item.id
                                    ? 'bg-stone-100 dark:bg-stone-500/10 text-stone-900 dark:text-stone-400'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-800'
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${activeSection === item.id
                                    ? 'bg-stone-900 dark:bg-white text-white dark:text-black shadow-lg shadow-stone-200 dark:shadow-white/5 rotate-3'
                                    : 'bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-gray-400 group-hover:bg-white dark:group-hover:bg-neutral-700 group-hover:-rotate-3'
                                    }`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold text-sm">{item.label}</p>
                                    <p className="text-xs opacity-70 truncate">{item.description}</p>
                                </div>
                                {item.id === 'orders' && pendingOrdersCount > 0 && (
                                    <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm min-w-[20px] text-center flex-shrink-0">
                                        {pendingOrdersCount}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-gray-100 dark:border-neutral-800 space-y-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400 px-2">Welcome, {adminEmail}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium text-sm">Store</span>
                    </button>
                    <button
                        onClick={handleLogoutClick}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium text-sm">Logout</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col h-full overflow-hidden relative w-full pb-20 lg:pb-0">
                <header className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur border-b border-gray-200 dark:border-neutral-800 p-4 sm:p-5 flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        <div className="lg:hidden relative w-3 h-3 bg-stone-900 dark:bg-white [clip-path:polygon(50%_0%,70%_30%,100%_50%,70%_70%,50%_100%,30%_70%,0%_50%,30%_30%)]"></div>
                        <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                            {navItems.find(i => i.id === activeSection)?.label}
                        </h1>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="lg:hidden p-2 rounded-xl bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
                            title="Back to Store"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleLogoutClick}
                            className="lg:hidden p-2 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-xl bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
                        >
                            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative no-scrollbar">
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
                    <div className="relative z-10 max-w-[1600px] mx-auto">
                        <AnimatePresence>
                            {isRefreshing && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute top-0 left-1/2 -translate-x-1/2 bg-white dark:bg-neutral-900 shadow-lg border border-gray-100 dark:border-neutral-800 px-4 py-2 rounded-full z-20 flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-400"
                                >
                                    <div className="w-3 h-3 border-2 border-stone-500 border-t-transparent rounded-full animate-spin"></div>
                                    Updating...
                                </motion.div>
                            )}
                        </AnimatePresence>
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                <Package className="w-5 h-5 flex-shrink-0" />
                                {error}
                            </div>
                        )}
                        {renderContent()}
                    </div>
                </div>
            </main>

            {/* Admin Bottom Navigation (Mobile/Tablet only) */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border-t border-gray-200 dark:border-neutral-800 z-50 px-2 pb-safe-area-inset-bottom">
                <div className="flex justify-around items-center h-16 max-w-md mx-auto">
                    {navItems.map(item => {
                        const Icon = item.id === 'dashboard' ? LayoutGrid :
                            item.id === 'addProduct' ? PlusCircle :
                                item.id === 'orders' ? Package :
                                    item.id === 'users' ? Users : MessageSquare;
                        const isActive = activeSection === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveSection(item.id as any)}
                                className="relative flex flex-col items-center justify-center w-full h-full group"
                            >
                                <div className={`p-2 rounded-xl transition-all duration-300 ${isActive
                                    ? 'text-stone-950 dark:text-white scale-110'
                                    : 'text-gray-400 dark:text-neutral-500'
                                    }`}>
                                    <Icon className="w-5 h-5" />
                                    {item.id === 'orders' && pendingOrdersCount > 0 && (
                                        <span className="absolute top-2 right-1/4 bg-red-500 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-neutral-900">
                                            {pendingOrdersCount}
                                        </span>
                                    )}
                                </div>
                                <span className={`text-[10px] font-medium transition-colors duration-300 ${isActive ? 'text-stone-950 dark:text-white' : 'text-gray-400 dark:text-neutral-500'
                                    }`}>
                                    {item.label}
                                </span>
                                {isActive && (
                                    <motion.div
                                        layoutId="adminNavActive"
                                        className="absolute -top-[1px] w-8 h-[2px] bg-stone-950 dark:bg-white rounded-full"
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </nav>

            <ConfirmationModal
                isOpen={confirmation.isOpen}
                onClose={() => setConfirmation({ ...confirmation, isOpen: false })}
                onConfirm={handleConfirmAction}
                title={confirmation.title}
                message={confirmation.message}
                isDestructive={confirmation.isDestructive}
                confirmText={
                    confirmation.type === 'logout' ? 'Logout' :
                    confirmation.type === 'editProduct' ? 'Update' :
                    confirmation.type === 'addProduct' ? 'Add' :
                    'Delete'
                }
            />
        </div>
    );
};

export default AdminDashboard;