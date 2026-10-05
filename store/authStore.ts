import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { apiFetch } from "@/services/api";

type User = {
  id: string;
  name: string;
  email: string;
};

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setAuth: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isHydrated: false,

  setAuth: async (user, token) => {
    await SecureStore.setItemAsync("authToken", token);
    set({ user, token, isAuthenticated: true });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync("authToken");
    set({ user: null, token: null, isAuthenticated: false });
  },

  hydrate: async () => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      if (!token) return;
      const { user } = await apiFetch<{ user: User }>("/customer/me");
      set({ user, token, isAuthenticated: true });
    } catch {
      await SecureStore.deleteItemAsync("authToken");
      set({ user: null, token: null, isAuthenticated: false });
    } finally {
      set({ isHydrated: true });
    }
  },
}));
