import { Filter, X } from "lucide-react";
import { motion } from "framer-motion";

type FilterSidebarProps = {
    isOpen: boolean;
    onClose: () => void;
    filters: {
        minPrice: string;
        maxPrice: string;
        inStock: boolean;
        sort: string;
    };
    onFilterChange: (key: string, value: any) => void;
    onClearFilters: () => void;
};

const FilterSidebar = ({
    isOpen: _isOpen,
    onClose,
    filters,
    onFilterChange,
    onClearFilters,
}: FilterSidebarProps) => {
    return (
        <div className="fixed inset-0 z-[70] flex justify-end">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-stone-950/40 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Sidebar */}
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
                className="relative w-full max-w-md bg-white dark:bg-neutral-900 h-full shadow-premium flex flex-col border-l border-stone-200 dark:border-neutral-800 md:rounded-l-3xl p-8 md:p-10 pt-safe overflow-hidden"
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-12">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-stone-50 dark:bg-neutral-800 rounded-xl border border-stone-200 dark:border-neutral-800">
                                <Filter className="w-4 h-4 text-black dark:text-white" />
                            </div>
                            <h2 className="text-xl font-black text-black dark:text-white uppercase tracking-tighter">Filters</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-3 text-stone-400 hover:text-black dark:hover:text-white bg-stone-50 dark:bg-neutral-800 rounded-xl border border-stone-200 dark:border-neutral-800 transition-all hover:scale-110 hover:rotate-90 duration-300"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto no-scrollbar space-y-12">
                        {/* Sort */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em]">
                                Sort By
                            </h3>
                            <div className="grid grid-cols-1 gap-3">
                                {[
                                    { label: "Newest Arrivals", value: "newest" },
                                    { label: "Price: Low to High", value: "price_asc" },
                                    { label: "Price: High to Low", value: "price_desc" },
                                    { label: "Top Rated Pieces", value: "rating" },
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => onFilterChange("sort", option.value)}
                                        className={`flex items-center justify-between px-6 py-4 rounded-xl border transition-all ${filters.sort === option.value
                                            ? "bg-black border-transparent text-white dark:bg-white dark:text-black shadow-premium"
                                            : "bg-white dark:bg-neutral-900 border-stone-200 dark:border-neutral-800 text-stone-500 hover:border-black dark:hover:border-white"
                                            }`}
                                    >
                                        <span className="text-[10px] font-black uppercase tracking-wider">{option.label}</span>
                                        {filters.sort === option.value && (
                                            <div className="w-1.5 h-1.5 bg-white dark:bg-black rounded-full" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em]">
                                Price Range
                            </h3>
                            <div className="flex items-center gap-4">
                                <div className="flex-1 space-y-2">
                                    <label className="text-[8px] font-black text-stone-400 uppercase tracking-widest ml-1">Min Price</label>
                                    <input
                                        type="number"
                                        value={filters.minPrice}
                                        onChange={(e) => onFilterChange("minPrice", e.target.value)}
                                        placeholder="0"
                                        className="w-full px-5 py-4 bg-stone-50 dark:bg-neutral-800 border border-stone-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-4 focus:ring-black/5 dark:focus:ring-white/5 focus:border-black dark:focus:border-white transition-all font-black text-xs"
                                    />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <label className="text-[8px] font-black text-stone-400 uppercase tracking-widest ml-1">Max Price</label>
                                    <input
                                        type="number"
                                        value={filters.maxPrice}
                                        onChange={(e) => onFilterChange("maxPrice", e.target.value)}
                                        placeholder="∞"
                                        className="w-full px-5 py-4 bg-stone-50 dark:bg-neutral-800 border border-stone-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-4 focus:ring-black/5 dark:focus:ring-white/5 focus:border-black dark:focus:border-white transition-all font-black text-xs"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Availability */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em]">
                                Inventory
                            </h3>
                            <button
                                onClick={() => onFilterChange("inStock", !filters.inStock)}
                                className={`w-full flex items-center justify-between px-6 py-5 rounded-xl border transition-all ${filters.inStock
                                    ? "bg-stone-50 dark:bg-neutral-800/50 border-black dark:border-white"
                                    : "bg-white dark:bg-neutral-900 border-stone-200 dark:border-neutral-800"
                                    }`}
                            >
                                <span className="text-[10px] font-black uppercase tracking-wider text-stone-900 dark:text-white">In Stock Pieces Only</span>
                                <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 ${filters.inStock ? 'bg-black dark:bg-white' : 'bg-stone-100 dark:bg-neutral-800'}`}>
                                    <div className={`w-4 h-4 rounded-full bg-white dark:bg-black transition-transform duration-300 ${filters.inStock ? 'translate-x-4' : 'translate-x-0'}`} />
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-10 space-y-4">
                        <button
                            onClick={onClose}
                            className="w-full py-5 bg-black dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-xl shadow-premium hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            Apply Filters
                        </button>
                        <button
                            onClick={onClearFilters}
                            className="w-full py-4 text-stone-400 hover:text-stone-900 dark:hover:text-white text-[8px] font-black uppercase tracking-[0.3em] transition-colors"
                        >
                            Clear Selection
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default FilterSidebar;
