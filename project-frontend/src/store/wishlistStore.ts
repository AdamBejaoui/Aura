import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '../types';

type WishlistStore = {
    items: Product[];
    isOpen: boolean;
    addItem: (product: Product) => void;
    removeItem: (productId: string) => void;
    toggleItem: (product: Product) => void;
    clearWishlist: () => void;
    toggleWishlist: () => void;
    setWishlistOpen: (isOpen: boolean) => void;
};

export const useWishlistStore = create<WishlistStore>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,
            addItem: (product) => {
                const { items } = get();
                if (!items.find((i) => i.id === product.id)) {
                    set({ items: [...items, product] });
                }
            },
            removeItem: (productId) => {
                set({ items: get().items.filter((i) => i.id !== productId) });
            },
            toggleItem: (product) => {
                const { items } = get();
                const exists = items.find((i) => i.id === product.id);
                if (exists) {
                    set({ items: items.filter((i) => i.id !== product.id) });
                } else {
                    set({ items: [...items, product] });
                }
            },
            clearWishlist: () => set({ items: [] }),
            toggleWishlist: () => set({ isOpen: !get().isOpen }),
            setWishlistOpen: (isOpen) => set({ isOpen }),
        }),
        {
            name: 'aura-wishlist',
            partialize: (state) => ({ items: state.items }), // Only persist items, not UI state
        }
    )
);
