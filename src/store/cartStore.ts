import { SelectedOption } from "@/app/brand/[id]";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type CartItem = {
  lineId: string; // product + selected options: identifies this exact cart line
  id: string;
  foodicsId: string;
  foodicsSandBoxId: string;
  name: string;
  price: number;
  img?: string;
  desc: string;
  quantity: number;
  groupName: string | null; // NEW — which brand this line belongs to, drives the split
  options: SelectedOption[];
};

type CartStore = {
  items: CartItem[];
  addToCart: (
    item: Omit<CartItem, "quantity" | "lineId">,
    quantity?: number,
  ) => void;
  removeFromCart: (lineId: string) => void;
  incrementQty: (lineId: string) => void;
  decrementQty: (lineId: string) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
};

const makeLineId = (id: string, options: SelectedOption[]) =>
  `${id}|${options
    .map((o) => `${o.id}x${o.quantity}`)
    .sort()
    .join(",")}`;

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addToCart: (item, quantity = 1) =>
        set((state) => {
          const lineId = makeLineId(item.id, item.options);
          const existing = state.items.find((i) => i.lineId === lineId);
          if (existing) {
            return {
              items: state.items.map(
                (i) =>
                  i.lineId === lineId
                    ? { ...i, quantity: i.quantity + quantity }
                    : i, // we searching that particular item inside the items we av in cart to increment the quantity
              ),
            };
          }
          return { items: [...state.items, { ...item, lineId, quantity }] };
        }),
      removeFromCart: (lineId) =>
        set((state) => ({
          items: state.items.filter((i) => i.lineId !== lineId),
        })),

      incrementQty: (lineId) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.lineId === lineId ? { ...i, quantity: i.quantity + 1 } : i,
          ),
        })),

      decrementQty: (lineId) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.lineId === lineId ? { ...i, quantity: i.quantity - 1 } : i,
            )
            .filter((i) => i.quantity > 0),
        })),

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () =>
        get().items.reduce((sum, i) => {
          const optionsTotal = i.options.reduce(
            (s, o) => s + o.price * o.quantity,
            0,
          );
          return sum + (i.price + optionsTotal) * i.quantity;
        }, 0),
    }),
    {
      name: "cart-storage",
      version: 2,
      migrate: () => ({ items: [] }), // old-shape carts are discarded
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
