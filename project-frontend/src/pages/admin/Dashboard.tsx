import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ConfirmationModal from "../../components/common/ConfirmationModal";
import OrderDetailsModal from "../../components/admin/OrderDetailsModal";
import { toast } from 'sonner';
import { useAuthStore } from "../../store/authStore";
import { useThemeStore } from "../../store/themeStore";
import {
    LayoutGrid,
    PlusCircle,
    Package,
    Ticket,
    Users,
    MessageSquare,
    LogOut,
    ArrowLeft,
    Sun,
    Moon,
    Clock,
    ShieldCheck,
    Truck,
    Box,
    XCircle,
    HelpCircle,
    Shield,
    User,
    ShieldAlert,
    Settings,
    BarChart3,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AccountSidebar from "../../components/features/auth/AccountSidebar";
import LoadingScreen from "../../components/common/LoadingScreen";

// Modular Components
import ProductManagement, { Product } from "../../components/admin/ProductManagement";
import OrderManagement, { Order } from "../../components/admin/OrderManagement";
import UserManagement from "../../components/admin/UserManagement";
import ProductImageCarouselAdmin from "../../components/admin/ProductImageCarouselAdmin";
import DashboardOverview from "../../components/admin/DashboardOverview";
import ReviewManagement from "../../components/admin/ReviewManagement";
import CouponManagement from "../../components/admin/CouponManagement";
import Analytics from "../../components/admin/Analytics";

// --- Interfaces ---
interface AdminDashboardProps {
    token: string;
    onLogout: () => void;
}

// --- Shared Sub-components ---
const Pagination = ({ pagination, onPageChange }: { pagination: any, onPageChange: (page: number) => void }) => {
    if (!pagination || pagination.pages <= 1) return null;

    return (
        <div className="flex items-center justify-center gap-2 mt-8">
            <button
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-2 rounded-xl bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1">
                {[...Array(pagination.pages)].map((_, i) => (
                    <button
                        key={i}
                        onClick={() => onPageChange(i + 1)}
                        className={`w-10 h-10 rounded-xl font-bold text-xs transition-all ${pagination.page === i + 1
                            ? 'bg-stone-900 dark:bg-white text-white dark:text-black'
                            : 'bg-white dark:bg-neutral-900 text-gray-500 hover:bg-gray-50 dark:hover:bg-neutral-800'
                            }`}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>
            <button
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="p-2 rounded-xl bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
            >
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
    );
};

// --- Constants ---
const categories = [
    "New Arrivals",
    "Wardrobe Staples",
    "Statement Pieces",
    "Streetwear",
    "Evening Luxe"
];


const AdminDashboard = ({ token, onLogout }: AdminDashboardProps) => {
    const navigate = useNavigate();
    const { user, isProfileOpen, setProfileOpen } = useAuthStore();
    const { theme, toggleTheme } = useThemeStore();
    const isDark = theme === 'dark';


    // Permission helper
    const isFullAdmin = user?.role === 'admin';

    // --- State ---
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [productsPagination, setProductsPagination] = useState({ total: 0, page: 1, pages: 1 });
    const [ordersPagination, setOrdersPagination] = useState({ total: 0, page: 1, pages: 1 });
    const [productPage, setProductPage] = useState(1);
    const [orderPage, setOrderPage] = useState(1);

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

    const [activeSection, setActiveSection] = useState<'dashboard' | 'analytics' | 'addProduct' | 'orders' | 'users' | 'reviews' | 'coupons' | 'waitlist'>('dashboard');
    const [inventoryView, setInventoryView] = useState<'list' | 'form'>('list'); // New state for Inventory Management
    const [users, setUsers] = useState<any[]>([]);
    const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
    const [reviews, setReviews] = useState<any[]>([]);
    const [coupons, setCoupons] = useState<any[]>([]);
    const [newCoupon, setNewCoupon] = useState({
        code: '',
        discountPercent: 0,
        expiryDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0] // Default 1 month
    });
    const [updatingRoleUserId, setUpdatingRoleUserId] = useState<string | null>(null);
    const [stats, setStats] = useState<any>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

    // Analytics State
    const [analyticsData, setAnalyticsData] = useState<any>(null);
    const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>('30d');

    // Confirmation Modal State
    const [confirmation, setConfirmation] = useState<{
        isOpen: boolean;
        type: 'deleteProduct' | 'deleteOrder' | 'deleteUser' | 'deleteReview' | 'deleteCoupon' | 'logout' | 'addProduct' | 'editProduct' | null;
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


    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    // Derived State (For Notification Badge)
    const pendingOrdersCount = stats?.pendingOrdersCount || 0;

    // --- API Headers ---
    const authHeader = useMemo(() => ({
        headers: {
            Authorization: token ? `Bearer ${token}` : ''
        },
        timeout: 10000 // 10s timeout to prevent hanging requests
    }), [token]);



    // Click outside to close dropdowns
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (!activeDropdownId) return;

            const target = e.target as HTMLElement;
            // If click is not inside a dropdown AND not on a toggle button, close it
            if (!target.closest('.aura-dropdown') && !target.closest('.aura-dropdown-toggle')) {
                setActiveDropdownId(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activeDropdownId]);

    const fetchData = useCallback(async () => {
        let mounted = true;
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

            if (activeSection === 'analytics') {
                setIsAnalyticsLoading(true);
                try {
                    const res = await axios.get(`/api/admin/analytics?range=${timeRange}`, authHeader);
                    setAnalyticsData(res.data);
                } catch (err) {
                    console.error('Analytics fetch error:', err);
                    toast.error('Failed to load deep intelligence');
                } finally {
                    setIsAnalyticsLoading(false);
                }
            }

            if (activeSection === 'users') {
                const res = await axios.get('/api/auth/users', authHeader);
                setUsers(res.data);
            } else if (activeSection === 'reviews') {
                const res = await axios.get('/api/products/reviews/all', authHeader);
                setReviews(res.data);
            } else if (activeSection === 'coupons') {
                const res = await axios.get('/api/coupons', authHeader);
                setCoupons(res.data);
            } else if (activeSection === 'addProduct') {
                const res = await axios.get(`/api/products?page=${productPage}&limit=10`, authHeader);
                setProducts(res.data.products || []);
                setProductsPagination(res.data.pagination);
            } else if (activeSection === 'orders') {
                const res = await axios.get(`/api/orders?page=${orderPage}&limit=10`, authHeader);
                setOrders(res.data.orders || []);
                setOrdersPagination(res.data.pagination);
            } else {
                // Dashboard or other sections - resilient loading
                const results = await Promise.allSettled([
                    axios.get(`/api/products?page=1&limit=5`, authHeader),
                    axios.get(`/api/orders?page=1&limit=5`, authHeader),
                    activeSection === 'dashboard' ? axios.get('/api/admin/stats', authHeader) : Promise.resolve(null),
                ]);

                // Handle Products
                if (results[0].status === 'fulfilled') {
                    setProducts(results[0].value.data.products || []);
                } else {
                    console.error('Products fetch failed:', results[0].reason);
                }

                // Handle Orders
                if (results[1].status === 'fulfilled') {
                    setOrders(results[1].value.data.orders || []);
                } else {
                    console.error('Orders fetch failed:', results[1].reason);
                }

                // Handle Stats
                if (results[2].status === 'fulfilled' && results[2].value) {
                    setStats(results[2].value.data);
                } else if (results[2].status === 'rejected') {
                    console.error('Stats fetch failed:', results[2].reason);
                    if (activeSection === 'dashboard') {
                        setStats('error');
                    }
                }
            }

            if (!error || !error.includes('Restricted')) {
                setError('');
            }
        } catch (err: any) {
            console.error('Admin data fetch error:', err);
            const status = err?.response?.status;
            if (status === 403 || status === 401) {
                toast.error('Session expired or access denied. Please login again.');
                onLogout();
            } else {
                if (mounted) {
                    setError('Failed to load admin data. Check if server is running.');
                }
            }
        } finally {
            if (mounted) {
                setLoading(false);
                setIsRefreshing(false);
            }
        }

        return () => {
            mounted = false;
        };
    }, [token, activeSection, productPage, orderPage, authHeader, onLogout, timeRange]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);



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
            // Stay in addProduct section but switch to list view
            setInventoryView('list');
            setActiveSection('addProduct');
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

    const handleFormSubmit = async (e: React.FormEvent) => {
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
        setInventoryView('form'); // Switch to form view
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
        setInventoryView('list'); // Return to list view
    };

    const handleDeleteProduct = async (productId: string) => {
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
        const promise = axios.patch(`/api/orders/${orderId}/status`, { status }, authHeader);

        toast.promise(promise, {
            loading: `Updating order status to ${status.toUpperCase()}...`,
            success: (response) => {
                setOrders(orders.map(order => order._id === orderId ? response.data : order));
                setActiveDropdownId(null);
                return `Order effectively moved to ${status.toUpperCase()} phase.`;
            },
            error: (err) => {
                console.error('Update Error:', err);
                return err.response?.data?.message || 'Failed to update order fulfillment status.';
            }
        });

        try {
            await promise;
        } catch (err: any) {
            // Already handled in toast.promise
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

    const handleCreateCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/coupons', newCoupon, authHeader);
            setCoupons([...coupons, response.data]);
            setNewCoupon({
                code: '',
                discountPercent: 0,
                expiryDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
            });
            toast.success('Coupon created successfully');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to create coupon');
        }
    };

    const handleDeleteCoupon = async (id: string) => {
        setConfirmation({
            isOpen: true,
            type: 'deleteCoupon',
            id,
            title: 'Delete Coupon',
            message: 'Are you sure you want to delete this coupon? This action cannot be undone.',
            isDestructive: true
        });
    };

    const executeDeleteCoupon = async (id: string) => {
        try {
            await axios.delete(`/api/coupons/${id}`, authHeader);
            setCoupons(coupons.filter(c => c._id !== id));
            toast.success('Coupon deleted successfully');
        } catch (err: any) {
            toast.error('Failed to delete coupon');
        }
    };

    const getStatusConfig = useCallback((status: string) => {
        switch (status) {
            case 'pending':
                return { bg: 'bg-amber-100 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-400', icon: <Clock className="w-4 h-4" /> };
            case 'confirmed':
                return { bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-400', icon: <ShieldCheck className="w-4 h-4" /> };
            case 'shipped':
                return { bg: 'bg-purple-100 dark:bg-purple-900/20', text: 'text-purple-700 dark:text-purple-400', icon: <Truck className="w-4 h-4" /> };
            case 'delivered':
                return { bg: 'bg-emerald-100 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', icon: <Box className="w-4 h-4" /> };
            case 'cancelled':
                return { bg: 'bg-rose-100 dark:bg-rose-900/20', text: 'text-rose-700 dark:text-rose-400', icon: <XCircle className="w-4 h-4" /> };
            default:
                return { bg: 'bg-gray-100 dark:bg-neutral-900/20', text: 'text-gray-700 dark:text-gray-400', icon: <HelpCircle className="w-4 h-4" /> };
        }
    }, []);

    const getRoleConfig = useCallback((role: string) => {
        switch (role) {
            case 'admin':
                return { bg: 'bg-purple-100 dark:bg-purple-900/20', text: 'text-purple-700 dark:text-purple-400', icon: <ShieldAlert className="w-3 h-3" /> };
            case 'co-admin':
                return { bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-400', icon: <Shield className="w-3 h-3" /> };
            case 'customer':
            case 'user':
                return { bg: 'bg-stone-100 dark:bg-neutral-800', text: 'text-stone-700 dark:text-stone-400', icon: <User className="w-3 h-3" /> };
            default:
                return { bg: 'bg-gray-100 dark:bg-neutral-800', text: 'text-gray-700 dark:text-gray-400', icon: <HelpCircle className="w-3 h-3" /> };
        }
    }, []);

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
        { id: 'analytics', label: 'Analytics', description: 'Deep Insights', adminOnly: true },
        { id: 'coupons', label: 'Coupons', description: 'Privilege Management', adminOnly: true },
        { id: 'addProduct', label: 'Inventory', description: 'Product Management', adminOnly: true },
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
        } else if (confirmation.type === 'deleteCoupon' && confirmation.id) {
            executeDeleteCoupon(confirmation.id);
        } else if (confirmation.type === 'addProduct' || confirmation.type === 'editProduct') {
            executeProductAction();
        } else if (confirmation.type === 'logout') {
            onLogout();
        }
        setConfirmation({ ...confirmation, isOpen: false });
    };


    const renderContent = () => {

        // Calculate Recent Activity
        const recentActivity = [
            ...(orders || []).map(o => ({
                id: o._id,
                type: 'order',
                title: `New Order: ${o.fullName || 'Guest User'}`,
                subtitle: `${o.items?.length || 0} items • $${(o.total || 0).toFixed(2)}`,
                time: o.createdAt || new Date().toISOString(),
                status: o.status || 'pending'
            })),
            ...(users || []).map(u => ({
                id: u._id,
                type: 'user',
                title: 'User Registered',
                subtitle: u.email || 'No email',
                time: u.createdAt || new Date().toISOString(),
                status: u.isVerified ? 'verified' : 'pending'
            }))
        ].sort((a, b) => new Date(b.time || 0).getTime() - new Date(a.time || 0).getTime()).slice(0, 5);

        switch (activeSection) {
            case 'addProduct':
                return (
                    <ProductManagement
                        products={products}
                        inventoryView={inventoryView}
                        setInventoryView={setInventoryView}
                        newProduct={newProduct}
                        setNewProduct={setNewProduct}
                        isEditing={isEditing}
                        setIsEditing={setIsEditing}
                        imagePreviews={imagePreviews}
                        setImagePreviews={setImagePreviews}
                        isAdding={isAdding}
                        handleFormSubmit={async (e) => await handleFormSubmit(e)}
                        handleImageChange={handleImageChange}
                        startEditing={startEditing}
                        cancelEditing={cancelEditing}
                        handleDeleteProduct={async (productId) => await handleDeleteProduct(productId)}
                        getImageUrl={getImageUrl}
                        categories={categories}
                        fileInputRef={fileInputRef}
                        Pagination={Pagination}
                        productsPagination={productsPagination}
                        setProductPage={setProductPage}
                        setSelectedFiles={setSelectedFiles}
                    />
                );
            case 'orders':
                return (
                    <OrderManagement
                        orders={orders}
                        products={products}
                        pagination={ordersPagination}
                        activeDropdownId={activeDropdownId}
                        setActiveDropdownId={setActiveDropdownId}
                        updateOrderStatus={updateOrderStatus}
                        handleDeleteOrder={handleDeleteOrder}
                        setSelectedOrder={(order: Order) => setSelectedOrder(order)}
                        setIsOrderModalOpen={setIsOrderModalOpen}
                        isFullAdmin={isFullAdmin}
                        orderStatusFilter={orderStatusFilter}
                        setOrderStatusFilter={setOrderStatusFilter}
                        orderSortMode={orderSortMode}
                        setOrderSortMode={setOrderSortMode}
                        setOrderPage={setOrderPage}
                        getStatusConfig={getStatusConfig}
                        getImageUrl={getImageUrl}
                        Pagination={Pagination}
                    />
                );
            case 'users':
                return (
                    <UserManagement
                        users={users}
                        handleUpdateUserRole={handleUpdateUserRole}
                        setConfirmation={setConfirmation}
                        activeDropdownId={activeDropdownId}
                        setActiveDropdownId={setActiveDropdownId}
                        updatingRoleUserId={updatingRoleUserId}
                        getRoleConfig={getRoleConfig}
                        isFullAdmin={isFullAdmin}
                    />
                );
            case 'reviews':
                return (
                    <ReviewManagement
                        reviews={reviews}
                        getImageUrl={getImageUrl}
                        setConfirmation={setConfirmation}
                    />
                );
            case 'coupons':
                return (
                    <CouponManagement
                        coupons={coupons}
                        newCoupon={newCoupon}
                        setNewCoupon={setNewCoupon}
                        handleCreateCoupon={handleCreateCoupon}
                        handleDeleteCoupon={handleDeleteCoupon}
                    />
                );
            case 'analytics':
                return (
                    <Analytics
                        data={analyticsData}
                        isLoading={isAnalyticsLoading}
                        timeRange={timeRange}
                        setTimeRange={setTimeRange}
                    />
                );
            default:
                return (
                    <DashboardOverview
                        recentActivity={recentActivity}
                        pendingOrdersCount={pendingOrdersCount}
                        setActiveSection={(section: string) => setActiveSection(section as any)}
                        products={products}
                        getImageUrl={getImageUrl}
                        startEditing={startEditing}
                        handleDeleteProduct={async (productId: string) => await handleDeleteProduct(productId)}
                        ProductImageCarouselAdmin={ProductImageCarouselAdmin}
                        stats={stats}
                        onRetry={() => fetchData()}
                    />
                );
        }
    };

    if (loading) {
        return <LoadingScreen message="Accessing Secure Archives..." />;
    }

    return (
        <div className="h-screen text-gray-900 dark:text-white font-sans transition-colors duration-300 overflow-hidden flex">
            {/* Desktop Sidebar (Only on large screens) */}
            <aside className="hidden lg:flex w-64 bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-800 flex-col z-40 h-full">
                <div className="p-6 border-b border-gray-100 dark:border-neutral-800 flex items-center gap-3">
                    <div className="relative w-4 h-4 bg-stone-900 dark:bg-white [clip-path:polygon(50%_0%,70%_30%,100%_50%,70%_70%,50%_100%,30%_70%,0%_50%,30%_30%)] before:content-[''] before:absolute before:inset-0 before:bg-stone-900 dark:before:bg-white before:blur-md before:opacity-60"></div>
                    <span className="text-xl font-bold text-stone-900 dark:text-white">Aura Admin</span>
                </div>
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map(item => {
                        const Icon = item.id === 'dashboard' ? LayoutGrid :
                            item.id === 'analytics' ? BarChart3 :
                                item.id === 'coupons' ? Ticket :
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
                <div className="p-4 border-t border-gray-100 dark:border-neutral-800 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-stone-900 dark:bg-white text-white dark:text-black flex items-center justify-center text-sm font-black shadow-lg shadow-stone-200 dark:shadow-none transition-transform hover:rotate-3 overflow-hidden">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    user?.name ? user.name.charAt(0).toUpperCase() : 'A'
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest leading-tight">Admin Console</p>
                                <p className="text-sm font-bold text-stone-900 dark:text-white truncate">Welcome, {user?.name || 'Administrator'}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setProfileOpen(true)}
                            className="p-2 text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-white dark:hover:bg-neutral-800 rounded-xl transition-all hover:rotate-90 duration-500"
                        >
                            <Settings className="w-4 h-4" />
                        </button>
                    </div>
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
                <header className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur border-b border-gray-200 dark:border-neutral-800 px-4 pb-4 pt-[calc(1rem+env(safe-area-inset-top))] sm:px-5 sm:pb-5 sm:pt-[calc(1.25rem+env(safe-area-inset-top))] flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        <div className="lg:hidden relative w-3 h-3 bg-stone-900 dark:bg-white [clip-path:polygon(50%_0%,70%_30%,100%_50%,70%_70%,50%_100%,30%_70%,0%_50%,30%_30%)]"></div>
                        <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                            {navItems.find(i => i.id === activeSection)?.label}
                        </h1>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Mobile Welcome Pill */}
                        <div className="lg:hidden flex items-center gap-2 px-2.5 py-1.5 bg-stone-50 dark:bg-neutral-800 rounded-full border border-stone-100 dark:border-neutral-700 shadow-sm">
                            <div className="w-5 h-5 rounded-full bg-stone-900 dark:bg-white text-white dark:text-black flex items-center justify-center text-[10px] font-black overflow-hidden">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    user?.name ? user.name.charAt(0).toUpperCase() : 'A'
                                )}
                            </div>
                            <span className="text-[10px] font-black text-stone-900 dark:text-white uppercase tracking-tight max-w-[70px] truncate">
                                {user?.name?.split(' ')[0] || 'Admin'}
                            </span>
                            <button
                                onClick={() => setProfileOpen(true)}
                                className="ml-1 p-0.5 text-stone-400 hover:text-stone-900 dark:hover:text-white transition-all hover:rotate-90 duration-500"
                            >
                                <Settings className="w-3 h-3" />
                            </button>
                        </div>

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
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeSection}
                                initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
                                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
                                transition={{ duration: 0.4, ease: "easeInOut" }}
                            >
                                {renderContent()}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </main>

            {/* Admin Bottom Navigation (Mobile/Tablet only) */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border-t border-gray-200 dark:border-neutral-800 z-50 px-2 pb-safe">
                <div className="flex justify-around items-center h-16 max-w-md mx-auto">
                    {navItems.map(item => {
                        const Icon = item.id === 'dashboard' ? LayoutGrid :
                            item.id === 'analytics' ? BarChart3 :
                                item.id === 'coupons' ? Ticket :
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

            <AccountSidebar
                isOpen={isProfileOpen}
                onClose={() => setProfileOpen(false)}
            />

            <OrderDetailsModal
                isOpen={isOrderModalOpen}
                onClose={() => setIsOrderModalOpen(false)}
                order={selectedOrder}
                products={products}
                getImageUrl={getImageUrl}
            />

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
