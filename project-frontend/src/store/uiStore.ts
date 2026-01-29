import { create } from 'zustand';
import { Product } from '../types';

type UIState = {
    isMobileSearchOpen: boolean;
    setMobileSearchOpen: (isOpen: boolean) => void;
    isProductDetailOpen: boolean;
    setProductDetailOpen: (isOpen: boolean) => void;
    selectedProduct: Product | null;
    setSelectedProduct: (product: Product | null) => void;
    isNavOpen: boolean;
    toggleNav: (isOpen?: boolean) => void;

    // New Global UI States
    isCartOpen: boolean;
    toggleCart: (isOpen?: boolean) => void;
    isWishlistOpen: boolean;
    toggleWishlist: (isOpen?: boolean) => void;
    isProfileOpen: boolean;
    toggleProfile: (isOpen?: boolean) => void;
    isOrdersOpen: boolean;
    toggleOrders: (isOpen?: boolean) => void;
    isFilterOpen: boolean;
    toggleFilter: (isOpen?: boolean) => void;
};

export const useUIStore = create<UIState>()((set) => ({
    isMobileSearchOpen: false,
    setMobileSearchOpen: (isOpen) => set({ isMobileSearchOpen: isOpen }),
    isProductDetailOpen: false,
    setProductDetailOpen: (isOpen) => set({ isProductDetailOpen: isOpen }),
    selectedProduct: null,
    setSelectedProduct: (product) => set({ selectedProduct: product }),
    isNavOpen: false,
    toggleNav: (isOpen) => set((state) => ({ isNavOpen: isOpen !== undefined ? isOpen : !state.isNavOpen })),

    isCartOpen: false,
    toggleCart: (isOpen) => set((state) => ({ isCartOpen: isOpen !== undefined ? isOpen : !state.isCartOpen })),
    isWishlistOpen: false,
    toggleWishlist: (isOpen) => set((state) => ({ isWishlistOpen: isOpen !== undefined ? isOpen : !state.isWishlistOpen })),
    isProfileOpen: false,
    toggleProfile: (isOpen) => set((state) => ({ isProfileOpen: isOpen !== undefined ? isOpen : !state.isProfileOpen })),
    isOrdersOpen: false,
    toggleOrders: (isOpen) => set((state) => ({ isOrdersOpen: isOpen !== undefined ? isOpen : !state.isOrdersOpen })),
    isFilterOpen: false,
    toggleFilter: (isOpen) => set((state) => ({ isFilterOpen: isOpen !== undefined ? isOpen : !state.isFilterOpen })),
}));
