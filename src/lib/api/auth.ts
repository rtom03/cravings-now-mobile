import { apiFetch } from "@/services/api";
import { signInWithGoogle } from "../googleAuth";
import * as SecureStore from "expo-secure-store";
import { useAuthStore } from "../../../store/authStore";

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

  const res = await apiFetch<GoogleAuthResponse>("/user/auth/google", {
    method: "POST",
    body: JSON.stringify({ idToken }),
  });

  await SecureStore.setItemAsync("authToken", res.token);
  useAuthStore.getState().setAuth(res.user, res.token);

  return res;
}
