import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PlusCircle,
    Settings,
    Trash2,
    Package,
    X,
    ChevronDown,
    TrendingUp
} from 'lucide-react';

export interface Product {
    _id: string;
    name: string;
    category: string;
    price: number;
    currency: string;
    inStock: boolean;
    images: string[];
    description: string;
}

interface ProductManagementProps {
    products: Product[];
    inventoryView: 'list' | 'form';
    setInventoryView: (view: 'list' | 'form') => void;
    newProduct: any;
    setNewProduct: (product: any) => void;
    isEditing: boolean;
    setIsEditing: (isEditing: boolean) => void;
    imagePreviews: string[];
    setImagePreviews: (previews: any) => void;
    isAdding: boolean;
    handleFormSubmit: (e: React.FormEvent) => Promise<void>;
    handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    startEditing: (product: Product) => void;
    cancelEditing: () => void;
    handleDeleteProduct: (productId: string) => Promise<void>;
    getImageUrl: (path: string) => string;
    categories: string[];
    fileInputRef: React.RefObject<HTMLInputElement>;
    Pagination: React.FC<{ pagination: any, onPageChange: (page: number) => void }>;
    productsPagination: any;
    setProductPage: (page: number) => void;
    setSelectedFiles: (files: any) => void;
}

const ProductManagement: React.FC<ProductManagementProps> = ({
    products,
    inventoryView,
    setInventoryView,
    newProduct,
    setNewProduct,
    isEditing,
    imagePreviews,
    setImagePreviews,
    isAdding,
    handleFormSubmit,
    handleImageChange,
    startEditing,
    cancelEditing,
    handleDeleteProduct,
    getImageUrl,
    categories,
    fileInputRef,
    Pagination,
    productsPagination,
    setProductPage
}) => {
    const [activeDropdownId, setActiveDropdownId] = React.useState<string | null>(null);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            {/* Standardized Header/Actions Bar */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8 bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-gray-100 dark:border-neutral-800 shadow-sm relative z-20">
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${isEditing ? 'bg-amber-500 shadow-amber-500/20' : 'bg-stone-900 dark:bg-white dark:text-black shadow-stone-900/10'} shadow-lg`}>
                        {isEditing ? <Settings className="w-5 h-5 animate-pulse" /> : <PlusCircle className="w-5 h-5" />}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {inventoryView === 'list' ? 'Inventory Catalog' : (isEditing ? 'Edit Asset' : 'Create New Asset')}
                        </h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                            {inventoryView === 'list'
                                ? `Managing ${products.length} Items`
                                : (isEditing ? 'Updating SKU Details' : 'Initialize Storefront Object')}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    {inventoryView === 'form' && (
                        <button
                            onClick={cancelEditing}
                            className="px-6 py-2.5 bg-gray-50 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gray-100 dark:hover:bg-neutral-700 transition-all border border-gray-100 dark:border-neutral-700 shadow-sm"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        onClick={() => setInventoryView(inventoryView === 'list' ? 'form' : 'list')}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg ${inventoryView === 'list'
                            ? 'bg-stone-900 hover:bg-black text-white shadow-stone-900/20'
                            : 'bg-white dark:bg-neutral-800 text-stone-900 dark:text-white border border-gray-100 dark:border-neutral-700 shadow-sm'
                            }`}
                    >
                        {inventoryView === 'list' ? (
                            <>
                                <PlusCircle className="w-4 h-4" />
                                Add New Item
                            </>
                        ) : (
                            <>
                                <Package className="w-4 h-4" />
                                View Inventory
                            </>
                        )}
                    </button>
                    <div className="w-px h-10 bg-gray-100 dark:bg-neutral-800 hidden lg:block mx-1"></div>
                    <button className="p-2.5 bg-white dark:bg-neutral-900 text-gray-400 hover:text-stone-900 dark:hover:text-white rounded-xl border border-gray-100 dark:border-neutral-800 transition-colors shadow-sm">
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {inventoryView === 'list' ? (
                /* INVENTORY LIST VIEW */
                <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] border border-gray-100 dark:border-neutral-800 shadow-sm overflow-hidden">
                    {/* Desktop Table */}
                    <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead className="bg-gray-50/50 dark:bg-neutral-800/50 border-b border-gray-100 dark:border-neutral-800">
                                <tr>
                                    <th className="px-8 py-6 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Product</th>
                                    <th className="px-8 py-6 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Category</th>
                                    <th className="px-8 py-6 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Price</th>
                                    <th className="px-8 py-6 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                    <th className="px-8 py-6 text-right text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-neutral-800">
                                <AnimatePresence>
                                    {products.map((product, idx) => (
                                        <motion.tr
                                            key={product._id}
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.3, delay: idx * 0.05 }}
                                            className="hover:bg-gray-50/50 dark:hover:bg-neutral-800/30 transition-colors group"
                                        >
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-16 rounded-lg bg-gray-100 dark:bg-neutral-800 overflow-hidden relative border border-gray-100 dark:border-neutral-700">
                                                        {product.images?.[0] ? (
                                                            <img src={getImageUrl(product.images[0])} alt={product.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-[9px] text-gray-400 font-bold">NO IMG</div>
                                                        )}
                                                    </div>
                                                    <div className="font-bold text-gray-900 dark:text-white">{product.name}</div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="text-xs font-medium text-stone-50 bg-stone-900 dark:bg-neutral-800 px-3 py-1 rounded-full border border-stone-100 dark:border-neutral-700">
                                                    {product.category}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="font-bold text-gray-900 dark:text-white">
                                                    {product.currency} {product.price.toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${product.inStock
                                                    ? 'bg-green-50 text-green-600 ring-1 ring-green-100 dark:bg-green-900/10 dark:text-green-400 dark:ring-green-900/30'
                                                    : 'bg-red-50 text-red-600 ring-1 ring-red-100 dark:bg-red-900/10 dark:text-red-400 dark:ring-red-900/30'
                                                    }`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${product.inStock ? 'bg-green-600 dark:bg-green-400' : 'bg-red-600 dark:bg-red-400'}`}></div>
                                                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => startEditing(product)}
                                                        className="w-9 h-9 rounded-xl bg-gray-50/50 dark:bg-neutral-800/50 text-stone-400 hover:text-stone-900 dark:hover:text-white transition-all flex items-center justify-center border border-gray-100 dark:border-neutral-800 hover:border-stone-200 shadow-sm hover:scale-110 active:scale-95"
                                                        title="Edit"
                                                    >
                                                        <Settings className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProduct(product._id)}
                                                        className="w-9 h-9 rounded-xl bg-red-50/50 dark:bg-red-900/10 text-stone-400 hover:text-red-500 transition-all flex items-center justify-center border border-transparent hover:border-red-100 dark:hover:border-red-900/30 shadow-sm hover:scale-110 active:scale-95"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile List (Cards) */}
                    <div className="lg:hidden p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <AnimatePresence>
                            {products.map((product, idx) => (
                                <motion.div
                                    key={product._id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                                    className="bg-white dark:bg-neutral-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-neutral-800 shadow-sm overflow-hidden relative group transition-all cursor-pointer hover:border-stone-200 dark:hover:border-neutral-700"
                                >
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="min-w-0 pr-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{product.category}</span>
                                            </div>
                                            <h3 className="font-bold text-gray-900 dark:text-white text-xl leading-tight line-clamp-2">{product.name}</h3>
                                            <p className="text-stone-500 text-xs mt-1 font-medium truncate max-w-[200px]">{product._id}</p>
                                        </div>
                                        <div className="flex gap-2 flex-shrink-0">
                                            <button
                                                onClick={() => startEditing(product)}
                                                className="w-10 h-10 rounded-2xl bg-gray-50/50 dark:bg-neutral-800/50 text-stone-400 hover:text-stone-900 dark:hover:text-white transition-all flex items-center justify-center border border-gray-100 dark:border-neutral-800 hover:border-stone-200 shadow-sm hover:scale-110"
                                            >
                                                <Settings className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProduct(product._id)}
                                                className="w-10 h-10 rounded-2xl bg-red-50/50 dark:bg-red-900/10 text-stone-400 hover:text-red-500 transition-all flex items-center justify-center border border-transparent hover:border-red-100 dark:hover:border-red-900/30 shadow-sm hover:scale-110"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 mb-8">
                                        <div className="w-24 h-32 rounded-2xl bg-gray-50 dark:bg-neutral-800 overflow-hidden flex-shrink-0 border border-gray-100 dark:border-neutral-700">
                                            {product.images?.[0] ? (
                                                <img src={getImageUrl(product.images[0])} alt={product.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 font-bold">NO IMG</div>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <div>
                                                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Price</span>
                                                <span className="text-2xl font-black text-gray-900 dark:text-white">{product.currency} {product.price.toFixed(2)}</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Stock Status</span>
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${product.inStock
                                                    ? 'bg-green-50 text-green-600 dark:bg-green-900/10 dark:text-green-400'
                                                    : 'bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400'
                                                    }`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${product.inStock ? 'bg-green-600 dark:bg-green-400' : 'bg-red-600 dark:bg-red-400'}`}></div>
                                                    {product.inStock ? 'In Stock' : 'Out'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                                            <div className="w-2 h-2 rounded-full bg-stone-300 dark:bg-neutral-700"></div>
                                            In Catalog
                                        </div>
                                        <span className="text-[10px] font-bold text-stone-900 dark:text-white uppercase tracking-widest px-3 py-1 bg-stone-100 dark:bg-neutral-800 rounded-lg">Product Item</span>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                    <Pagination pagination={productsPagination} onPageChange={setProductPage} />
                </div>
            ) : (
                /* ADD/EDIT FORM VIEW */
                <form onSubmit={handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10 pb-12">
                    {/* Left Panel: Primary Details */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 border border-gray-100 dark:border-neutral-800 shadow-sm relative overflow-hidden">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-neutral-800 text-stone-900 dark:text-gray-400 flex items-center justify-center">
                                    <Package className="w-4 h-4" />
                                </div>
                                Product Details
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Name</label>
                                    <input
                                        type="text"
                                        value={newProduct.name}
                                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-stone-500/20 focus:border-stone-500 outline-none transition-all"
                                        placeholder="e.g. LUXURY SILK KIMONO"
                                        required
                                    />
                                </div>

                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setActiveDropdownId(activeDropdownId === 'category' ? null : 'category')}
                                            className="aura-dropdown-toggle w-full px-4 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-xl flex items-center justify-between focus:ring-2 focus:ring-stone-500/20 outline-none transition-all group"
                                        >
                                            <span className="text-sm font-bold uppercase tracking-widest">{newProduct.category}</span>
                                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${activeDropdownId === 'category' ? 'rotate-180' : ''}`} />
                                        </button>

                                        <AnimatePresence>
                                            {activeDropdownId === 'category' && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    className="aura-dropdown !block top-full left-0 pt-2 w-full z-10"
                                                >
                                                    <div className="aura-dropdown-content !p-1.5 !rounded-xl max-h-64 overflow-y-auto">
                                                        {categories.map(cat => (
                                                            <button
                                                                key={cat}
                                                                type="button"
                                                                onClick={() => {
                                                                    setNewProduct({ ...newProduct, category: cat });
                                                                    setActiveDropdownId(null);
                                                                }}
                                                                className={`aura-dropdown-item w-full ${newProduct.category === cat ? 'bg-stone-900 dark:bg-white text-white dark:text-black' : ''}`}
                                                            >
                                                                {cat}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price</label>
                                        <div className="relative">
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
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Currency</label>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setActiveDropdownId(activeDropdownId === 'currency' ? null : 'currency')}
                                                className="aura-dropdown-toggle w-full px-4 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-xl flex items-center justify-between focus:ring-2 focus:ring-stone-500/20 outline-none transition-all group"
                                            >
                                                <span className="text-sm font-bold">{newProduct.currency}</span>
                                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${activeDropdownId === 'currency' ? 'rotate-180' : ''}`} />
                                            </button>

                                            <AnimatePresence>
                                                {activeDropdownId === 'currency' && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: 10 }}
                                                        className="aura-dropdown !block top-full left-0 pt-2 w-full z-10"
                                                    >
                                                        <div className="aura-dropdown-content !p-1.5 !rounded-xl">
                                                            {[
                                                                { code: 'USD', symbol: '$' },
                                                                { code: 'EUR', symbol: '€' },
                                                                { code: 'GBP', symbol: '£' },
                                                                { code: 'JPY', symbol: '¥' },
                                                                { code: 'TND', symbol: 'DT' }
                                                            ].map(curr => (
                                                                <button
                                                                    key={curr.code}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setNewProduct({ ...newProduct, currency: curr.code });
                                                                        setActiveDropdownId(null);
                                                                    }}
                                                                    className={`aura-dropdown-item w-full ${newProduct.currency === curr.code ? 'bg-stone-900 dark:bg-white text-white dark:text-black' : ''}`}
                                                                >
                                                                    {curr.code} ({curr.symbol})
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </div>

                                <div className="md:col-span-2">
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

                            <div className="mt-8 pt-8 border-t border-gray-50 dark:border-neutral-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${newProduct.inStock ? 'bg-green-500' : 'bg-red-500'} shadow-sm animate-pulse`}></div>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">{newProduct.inStock ? 'In Stock' : 'Out of Stock'}</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={newProduct.inStock}
                                        onChange={(e) => setNewProduct({ ...newProduct, inStock: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 dark:bg-neutral-800 rounded-full peer peer-checked:bg-stone-900 dark:peer-checked:bg-white transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-neutral-900 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full after:shadow-sm"></div>
                                </label>
                            </div>
                        </div>

                        {/* Media Management */}
                        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 border border-gray-100 dark:border-neutral-800 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Product Media</h3>

                            <div className="space-y-6">
                                <div className="relative group/upload">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageChange}
                                        multiple
                                        accept="image/*"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="border-2 border-dashed border-gray-100 dark:border-neutral-800 rounded-2xl p-10 text-center group-hover/upload:border-stone-400 dark:group-hover/upload:border-neutral-600 transition-colors bg-gray-50/50 dark:bg-black/20">
                                        <div className="w-12 h-12 bg-white dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 dark:border-neutral-700">
                                            <PlusCircle className="w-6 h-6 text-stone-900 dark:text-white" />
                                        </div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">Click to Upload Images</p>
                                        <p className="text-xs text-gray-400 mt-1">PNG, WEBP or JPG • MAX 10 IMAGES</p>
                                    </div>
                                </div>

                                {imagePreviews.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                                        {imagePreviews.map((preview, index) => {
                                            const isNewUpload = preview.startsWith('blob:');
                                            const previewUrl = isNewUpload ? preview : getImageUrl(preview);
                                            return (
                                                <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 dark:bg-black border border-gray-200 dark:border-neutral-800 group/item">
                                                    <img src={previewUrl} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            const newPreviews = [...imagePreviews];
                                                            const removedPreview = newPreviews[index];
                                                            newPreviews.splice(index, 1);
                                                            setImagePreviews(newPreviews);
                                                            if (typeof removedPreview === 'string' && !removedPreview.startsWith('blob:')) {
                                                                setNewProduct({ ...newProduct, images: newProduct.images.filter((img: any) => img !== removedPreview) });
                                                            }
                                                        }}
                                                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity shadow-lg"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                    {index === 0 && (
                                                        <div className="absolute top-1 left-1 bg-stone-900/90 dark:bg-white/90 text-white dark:text-black text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-sm">
                                                            Primary
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Augmented Preview */}
                    <div className="lg:col-span-4 lg:sticky lg:top-8 space-y-6">
                        <div className="bg-gray-50/50 dark:bg-neutral-800/20 p-6 rounded-[2rem] border border-gray-100 dark:border-neutral-800">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 px-2">Live Preview</h3>

                            <div className="bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-neutral-800 shadow-xl relative group/preview">
                                <div className="aspect-[4/5] bg-gray-50 dark:bg-neutral-800 relative overflow-hidden">
                                    {imagePreviews.length > 0 ? (
                                        <img
                                            src={imagePreviews[0].startsWith('blob:') ? imagePreviews[0] : getImageUrl(imagePreviews[0])}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 dark:text-neutral-700">
                                            <Package className="w-10 h-10 opacity-20" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Awaiting Data</span>
                                        </div>
                                    )}
                                    {newProduct.category === 'New Arrivals' && (
                                        <div className="absolute top-3 left-3 bg-stone-900 dark:bg-white text-white dark:text-black text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-wider">
                                            New
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">{newProduct.category || 'Category'}</p>
                                    <h4 className="text-base font-bold text-gray-900 dark:text-white truncate">{newProduct.name || 'Product Name'}</h4>
                                    <div className="mt-3 pt-3 border-t border-gray-50 dark:border-neutral-800 flex items-center justify-between">
                                        <span className="text-sm font-black text-gray-900 dark:text-white">
                                            {newProduct.currency} {Number(newProduct.price || 0).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <button
                                type="submit"
                                disabled={isAdding}
                                className="w-full py-4 bg-stone-900 hover:bg-black dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-black rounded-xl font-bold text-sm shadow-xl shadow-stone-500/10 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isAdding ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white dark:border-black/10 dark:border-t-black rounded-full animate-spin"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        {isEditing ? 'Update Product' : 'Publish Product'}
                                        <TrendingUp className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={cancelEditing}
                                className="w-full py-4 bg-white dark:bg-neutral-900 text-gray-600 dark:text-gray-400 rounded-xl font-bold text-sm border border-gray-100 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
};

export default ProductManagement;
