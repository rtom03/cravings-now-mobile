import { env } from "@/config/env";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";

let configured = false;
// console.log(env.web.client_id);
export function configureGoogleSignIn() {
  if (configured) return;
  GoogleSignin.configure({
    webClientId: env.web.client_id,
    offlineAccess: false,
  });
  configured = true;
}

export async function signInWithGoogle(): Promise<string> {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  await GoogleSignin.signIn();
  const { idToken } = await GoogleSignin.getTokens();
  if (!idToken) throw new Error("No idToken returned from Google sign-in");
  return idToken;
}

export async function signOutGoogle() {
  await GoogleSignin.signOut();
}
