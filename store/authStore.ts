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
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  hydrate: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setAuth: (user, token) => {
    set({ user, token, isAuthenticated: true });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync("authToken");
    set({ user: null, token: null, isAuthenticated: false });
  },

  hydrate: async () => {
    const token = await SecureStore.getItemAsync("authToken");
    if (!token) return;

    try {
      const { user } = await apiFetch<{ user: User }>("/user/me");
      set({ user, token, isAuthenticated: true });
    } catch {
      await SecureStore.deleteItemAsync("authToken");
      set({ user: null, token: null, isAuthenticated: false });
    }
  },
}));
