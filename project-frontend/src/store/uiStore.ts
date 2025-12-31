import { create } from 'zustand';

type UIState = {
    isMobileSearchOpen: boolean;
    setMobileSearchOpen: (isOpen: boolean) => void;
};

export const useUIStore = create<UIState>()((set) => ({
    isMobileSearchOpen: false,
    setMobileSearchOpen: (isOpen) => set({ isMobileSearchOpen: isOpen }),
}));
