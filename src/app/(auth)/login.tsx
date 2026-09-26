import { AppText } from "@/components/app-text";
import { loginWithGoogle } from "@/lib/api/auth";
import { Ionicons } from "@expo/vector-icons";
import { Href, Stack, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  StatusBar,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── CravingsNow design tokens — from the style-guide cover frame ──────────
// TODO: extract into a shared `@/constants/theme` file — duplicated across
// every screen/component that references them until that migration happens.
const COLORS = {
  ink: "#1B1B1F",
  paper: "#F7F6F3",
  surface: "#FFFFFF",
  signal: "#E63462",
  n600: "#6E6E76",
  n300: "#B9B7B2",
  n200: "#E7E4DE",
  n100: "#F1EFEA",
} as const;

export default function LoginScreen() {
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);

  // TODO: wire real Google OAuth — e.g. expo-auth-session/providers/google
  // or Firebase Auth, whichever this repo's backend expects — this only
  // simulates the loading state for now, no actual sign-in happens.

  async function handleGoogleLogin() {
    setIsSigningIn(true);

    try {
      await loginWithGoogle();
      router.replace("/(tabs)");
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.paper }}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.paper} />

      <View
        style={{ flex: 1, paddingHorizontal: 28, justifyContent: "center" }}
      >
        {/* ── Brand mark ── */}
        <View style={{ alignItems: "center", marginBottom: 40 }}>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              backgroundColor: COLORS.signal,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <AppText style={{ fontSize: 24, fontWeight: "700", color: "#fff" }}>
              C
            </AppText>
          </View>
          <AppText
            style={{ fontSize: 22, fontWeight: "700", color: COLORS.ink }}
          >
            CravingsNow
          </AppText>
          <AppText
            style={{
              fontSize: 12.5,
              color: COLORS.n600,
              marginTop: 6,
              textAlign: "center",
              lineHeight: 17,
            }}
          >
            Krispy Kreme, Scoop'd & Burger Nation{"\n"}delivered fast, all in
            one app.
          </AppText>
        </View>

        {/* ── Google sign-in ── */}
        <TouchableOpacity
          onPress={handleGoogleLogin}
          disabled={isSigningIn}
          activeOpacity={0.8}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            backgroundColor: COLORS.surface,
            borderWidth: 1,
            borderColor: COLORS.n200,
            borderRadius: 14,
            paddingVertical: 15,
            opacity: isSigningIn ? 0.6 : 1,
          }}
        >
          {isSigningIn ? (
            <ActivityIndicator size="small" color={COLORS.ink} />
          ) : (
            <>
              <Ionicons name="logo-google" size={18} color={COLORS.ink} />
              <AppText
                style={{ fontSize: 13.5, fontWeight: "700", color: COLORS.ink }}
              >
                Continue with Google
              </AppText>
            </>
          )}
        </TouchableOpacity>

        {/* ── Divider ── */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginVertical: 22,
          }}
        >
          <View style={{ flex: 1, height: 1, backgroundColor: COLORS.n200 }} />
          <AppText
            style={{ fontSize: 11, color: COLORS.n300, marginHorizontal: 12 }}
          >
            or
          </AppText>
          <View style={{ flex: 1, height: 1, backgroundColor: COLORS.n200 }} />
        </View>

        {/* ── Email fallback ── */}
        {/* TODO: confirm the actual email-auth route — guessed "/login/email". */}
        <TouchableOpacity
          onPress={() => router.push("/login/email" as Href)}
          activeOpacity={0.8}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            backgroundColor: COLORS.n100,
            borderRadius: 14,
            paddingVertical: 15,
          }}
        >
          <Ionicons name="mail-outline" size={18} color={COLORS.ink} />
          <AppText
            style={{ fontSize: 13.5, fontWeight: "700", color: COLORS.ink }}
          >
            Use email instead
          </AppText>
        </TouchableOpacity>

        {/* ── Legal footer ── */}
        <AppText
          style={{
            fontSize: 10.5,
            color: COLORS.n300,
            textAlign: "center",
            marginTop: 28,
            lineHeight: 15,
          }}
        >
          By continuing, you agree to CravingsNow's Terms of Service and Privacy
          Policy.
        </AppText>
      </View>
    </SafeAreaView>
  );
}
