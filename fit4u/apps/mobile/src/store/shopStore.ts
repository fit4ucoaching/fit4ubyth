import { create } from "zustand";

/** Badge panier à accès instantané (synchronisé depuis React Query à chaque mutation panier). */
interface ShopState {
  cartItemCount: number;
  selectedCategoryId: string | null;
  setCartItemCount: (count: number) => void;
  setSelectedCategoryId: (categoryId: string | null) => void;
}

export const useShopStore = create<ShopState>((set) => ({
  cartItemCount: 0,
  selectedCategoryId: null,
  setCartItemCount: (cartItemCount) => set({ cartItemCount }),
  setSelectedCategoryId: (selectedCategoryId) => set({ selectedCategoryId }),
}));
