import React, { useState } from "react";
import { X, Filter } from "lucide-react";

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
    isOpen,
    onClose,
    filters,
    onFilterChange,
    onClearFilters,
}: FilterSidebarProps) => {
    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                onClick={onClose}
            />

            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 right-0 z-50 w-full max-w-xs bg-white dark:bg-neutral-900 shadow-xl transform transition-transform duration-300 ease-in-out border-l border-gray-100 dark:border-neutral-800 ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-neutral-800">
                        <div className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-gray-900 dark:text-white" />
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Filters</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        {/* Sort */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                                Sort By
                            </h3>
                            <div className="space-y-2">
                                {[
                                    { label: "Newest Arrivals", value: "newest" },
                                    { label: "Price: Low to High", value: "price_asc" },
                                    { label: "Price: High to Low", value: "price_desc" },
                                    { label: "Top Rated", value: "rating" },
                                ].map((option) => (
                                    <label
                                        key={option.value}
                                        className="flex items-center gap-3 cursor-pointer group"
                                    >
                                        <div className="relative flex items-center justify-center w-5 h-5">
                                            <input
                                                type="radio"
                                                name="sort"
                                                value={option.value}
                                                checked={filters.sort === option.value}
                                                onChange={(e) => onFilterChange("sort", e.target.value)}
                                                className="peer appearance-none w-5 h-5 border-2 border-gray-300 dark:border-neutral-700 rounded-full checked:border-stone-900 dark:checked:border-white transition-colors"
                                            />
                                            <div className="absolute w-2.5 h-2.5 bg-stone-900 dark:bg-white rounded-full scale-0 peer-checked:scale-100 transition-transform" />
                                        </div>
                                        <span className="text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                                            {option.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <hr className="border-gray-100 dark:border-neutral-800" />

                        {/* Price Range */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                                Price Range
                            </h3>
                            <div className="flex items-center gap-3">
                                <div className="flex-1">
                                    <label className="text-xs text-gray-500 mb-1 block">Min</label>
                                    <input
                                        type="number"
                                        value={filters.minPrice}
                                        onChange={(e) => onFilterChange("minPrice", e.target.value)}
                                        placeholder="0"
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500/20 focus:border-stone-500"
                                    />
                                </div>
                                <div className="pt-5 text-gray-400">-</div>
                                <div className="flex-1">
                                    <label className="text-xs text-gray-500 mb-1 block">Max</label>
                                    <input
                                        type="number"
                                        value={filters.maxPrice}
                                        onChange={(e) => onFilterChange("maxPrice", e.target.value)}
                                        placeholder="$$$"
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500/20 focus:border-stone-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <hr className="border-gray-100 dark:border-neutral-800" />

                        {/* Availability */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                                Availability
                            </h3>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center justify-center w-5 h-5">
                                    <input
                                        type="checkbox"
                                        checked={filters.inStock}
                                        onChange={(e) => onFilterChange("inStock", e.target.checked)}
                                        className="peer appearance-none w-5 h-5 border-2 border-gray-300 dark:border-neutral-700 rounded-md checked:bg-stone-900 dark:checked:bg-white checked:border-stone-900 dark:checked:border-white transition-all"
                                    />
                                    <svg
                                        className="absolute w-3.5 h-3.5 text-white dark:text-black scale-0 peer-checked:scale-100 transition-transform"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="3"
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                                <span className="text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                                    In Stock Only
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-100 dark:border-neutral-800 space-y-3">
                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-stone-900 dark:bg-white text-white dark:text-black font-bold rounded-xl active:scale-[0.98] transition-transform"
                        >
                            Show Results
                        </button>
                        <button
                            onClick={onClearFilters}
                            className="w-full py-3 text-gray-500 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
                        >
                            Clear All Filters
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default FilterSidebar;
