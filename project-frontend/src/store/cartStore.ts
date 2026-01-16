import { create } from "zustand";
import type { Product } from '../types';

export type CartItem = {
  product: Product;
  quantity: number;
  size?: string;
};

type CartState = {
  items: CartItem[];
  checkoutOpen: boolean;
  confirmationMessage: string | null;
  addItem: (product: Product, size?: string, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number, size?: string) => void;
  toggleCheckout: (isOpen: boolean) => void;
  setConfirmationMessage: (message: string | null) => void;
  resetCart: () => void;
};

export const useCartStore = create<CartState>((set) => ({
  items: [],
  checkoutOpen: false,
  confirmationMessage: null,
  addItem: (product, size, quantity = 1) =>
    set((state) => {
      const existing = state.items.find(
        (item) => item.product.id === product.id && item.size === size
      );
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.product.id === product.id && item.size === size
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        };
      }
      return { items: [...state.items, { product, quantity, size }] };
    }),
  updateQuantity: (productId, quantity, size) =>
    set((state) => ({
      items: state.items
        .map((item) =>
          item.product.id === productId && item.size === size
            ? { ...item, quantity }
            : item
        )
        .filter((item) => item.quantity > 0),
    })),
  toggleCheckout: (isOpen) => set({ checkoutOpen: isOpen }),
  setConfirmationMessage: (message) => set({ confirmationMessage: message }),
  resetCart: () => set({ items: [] }),
}));
