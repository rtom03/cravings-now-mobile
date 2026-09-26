import { create } from "zustand";

type LocationState = {
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  setLocation: (data: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
};

export const useLocationStore = create<LocationState>((set) => ({
  latitude: null,
  longitude: null,
  address: null,

  setLocation: (data) =>
    set({
      latitude: data.latitude,
      longitude: data.longitude,
      address: data.address,
    }),
}));
