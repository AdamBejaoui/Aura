import { create } from "zustand";
import type { Product } from "../App";

export type CartItem = {
  product: Product;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  checkoutOpen: boolean;
  confirmationMessage: string | null;
  addItem: (product: Product) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  toggleCheckout: (isOpen: boolean) => void;
  setConfirmationMessage: (message: string | null) => void;
  resetCart: () => void;
};

export const useCartStore = create<CartState>((set) => ({
  items: [],
  checkoutOpen: false,
  confirmationMessage: null,
  addItem: (product) =>
    set((state) => {
      const existing = state.items.find((item) => item.product.id === product.id);
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return { items: [...state.items, { product, quantity: 1 }] };
    }),
  updateQuantity: (productId, quantity) =>
    set((state) => ({
      items: state.items
        .map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        )
        .filter((item) => item.quantity > 0),
    })),
  toggleCheckout: (isOpen) => set({ checkoutOpen: isOpen }),
  setConfirmationMessage: (message) => set({ confirmationMessage: message }),
  resetCart: () => set({ items: [] }),
}));
