import { create } from 'zustand';

type UIState = {
    isMobileSearchOpen: boolean;
    setMobileSearchOpen: (isOpen: boolean) => void;
    isProductDetailOpen: boolean;
    setProductDetailOpen: (isOpen: boolean) => void;
};

export const useUIStore = create<UIState>()((set) => ({
    isMobileSearchOpen: false,
    setMobileSearchOpen: (isOpen) => set({ isMobileSearchOpen: isOpen }),
    isProductDetailOpen: false,
    setProductDetailOpen: (isOpen) => set({ isProductDetailOpen: isOpen }),
}));
