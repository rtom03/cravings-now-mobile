import { useColorScheme } from "@/hooks/use-color-scheme";
import { QueryClientProvider } from "@tanstack/react-query";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { configureGoogleSignIn } from "@/lib/googleAuth";
import { useAuthStore } from "../../store/authStore";
import { queryClient } from "@/hooks/cravings-now-api/queryClient";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // TODO: font loading was disabled here — re-enable this block (and the
  // hideAsync effect below can go back to depending on `loaded`) once real
  // fonts are added. Until then, hideAsync() below fires unconditionally so
  // the app doesn't sit on the splash screen forever.
  // const [loaded, error] = useFonts({
  //   SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  // });
  // useEffect(() => {
  //   if (error) throw error;
  // }, [error]);
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    SplashScreen.hideAsync();
    configureGoogleSignIn();
    hydrate();
  }, []);

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack>
            {/* <Stack.Screen name="index" options={{ headerShown: false }} /> */}
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

            <Stack.Screen
              name="(auth)/login"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="cart" options={{ headerShown: false }} />
            <Stack.Screen name="checkout" options={{ headerShown: false }} />
            <Stack.Screen name="payment" options={{ headerShown: false }} />
            <Stack.Screen name="order" options={{ headerShown: false }} />
            <Stack.Screen name="tracking" options={{ headerShown: false }} />

            <Stack.Screen name="brand/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="address/new" options={{ headerShown: false }} />
            <Stack.Screen
              name="(tabs)/discover/"
              options={{ headerShown: false }}
            />

            {/*  <Stack.Screen name="login" options={{ headerShown: false }} /> */}

            {/* ✅ hides "brand" header */}
            <Stack.Screen name="+not-found" />
          </Stack>
          {/* <StatusBar style="auto" /> */}
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
