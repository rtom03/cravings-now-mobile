// stores/useUserAddressStore.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type UserAddress = {
  street: string;
  landmark?: string;
  city: string;
};

type UserAddressStore = {
  userAddress: UserAddress | null;
  setUserAddress: (address: UserAddress) => void;
  updateUserAddress: (partial: Partial<UserAddress>) => void;
  removeUserAddress: () => void;
};

export const useUserAddressStore = create<UserAddressStore>()(
  persist(
    (set) => ({
      userAddress: null,
      setUserAddress: (address) => set({ userAddress: address }),
      updateUserAddress: (partial) =>
        set((state) => ({
          userAddress: state.userAddress
            ? { ...state.userAddress, ...partial }
            : null,
        })),
      removeUserAddress: () => set({ userAddress: null }),
    }),
    {
      name: "user-address-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
