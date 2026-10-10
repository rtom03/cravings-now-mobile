// stores/useLocationStore.ts  ← renamed from useAddressStore.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type SelectedLocation = {
  city: string;
  area: string;
  method: "delivery" | "pickup";
};

type LocationStore = {
  location: SelectedLocation | null;
  setLocation: (location: SelectedLocation) => void;
  updateLocation: (partial: Partial<SelectedLocation>) => void;
  removeLocation: () => void;
};

export const useLocationStore = create<LocationStore>()(
  persist(
    (set) => ({
      location: null,
      setLocation: (location) => set({ location }),
      updateLocation: (partial) =>
        set((state) => ({
          location: state.location ? { ...state.location, ...partial } : null,
        })),
      removeLocation: () => set({ location: null }),
    }),
    {
      name: "location-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
