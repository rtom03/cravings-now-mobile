import { apiFetch } from "@/services/api";
import { signInWithGoogle, signOutGoogle } from "../googleAuth";
import * as SecureStore from "expo-secure-store";
import { useAuthStore } from "../../store/authStore";

type GoogleAuthResponse = {
  token: string;

  user: {
    id: string;
    name: string;
    email: string;
  };
};

export async function loginWithGoogle(): Promise<GoogleAuthResponse> {
  const idToken = await signInWithGoogle();

  const res = await apiFetch<GoogleAuthResponse>("/customer/auth/google", {
    method: "POST",
    body: JSON.stringify({ idToken }),
  });

  await SecureStore.setItemAsync("authToken", res.token);
  useAuthStore.getState().setAuth(res.user, res.token);

  return res;
}

export async function logout(): Promise<void> {
  try {
    await signOutGoogle();
  } catch (err) {
    // Not fatal — token cleanup below still needs to happen even if
    // Google's local session clear fails (e.g. already signed out)
    console.error("signOutGoogle failed:", err);
  }

  await SecureStore.deleteItemAsync("authToken");
  useAuthStore.getState().logout();
}
