// import { useColorScheme } from "@/hooks/use-color-scheme.web";
// import { QueryClientProvider } from "@tanstack/react-query";
// import { useFonts } from "expo-font";
// import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
// import * as SplashScreen from "expo-splash-screen";
// import { useEffect } from "react";
// import { View } from "react-native";
// import "react-native-reanimated";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { queryClient } from "../../api/queryClient";

// export {
//   // Catch any errors thrown by the Layout component.
//   ErrorBoundary,
// } from "expo-router";

// export const unstable_settings = {
//   // Ensure that reloading on `/modal` keeps a back button present.
//   initialRouteName: "(tabs)",
// };

// // Prevent the splash screen from auto-hiding before asset loading is complete.
// SplashScreen.preventAutoHideAsync();

// export default function RootLayout() {
//   // const [loaded, error] = useFonts({
//   //   SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
//   // });

//   // // Expo Router uses Error Boundaries to catch errors in the navigation tree.
//   // useEffect(() => {
//   //   if (error) throw error;
//   // }, [error]);

//   // useEffect(() => {
//   //   if (loaded) {
//   //     SplashScreen.hideAsync();
//   //   }
//   // }, [loaded]);

//   // if (!loaded) {
//   //   return null;
//   // }

//   return <RootLayoutNav />;
// }

// function RootLayoutNav() {
//   const colorScheme = useColorScheme();
//   const insets = useSafeAreaInsets();

//   return (
//     <QueryClientProvider client={queryClient}>
//       <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
//         <View
//           style={{
//             flex: 1,
//             paddingTop: Math.max(insets.bottom - 30, 0),
//           }}
//         >
//           <Stack>
//             {/* <Stack.Screen name="index" options={{ headerShown: false }} /> */}
//             <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
//             <Stack.Screen name="cart" options={{ headerShown: false }} />
//             {/* <Stack.Screen name="proceed" options={{ headerShown: false }} />
//             <Stack.Screen name="checkout" options={{ headerShown: false }} />
//             <Stack.Screen name="login" options={{ headerShown: false }} /> */}

//             {/* ✅ hides "brand" header */}
//             <Stack.Screen name="+not-found" />
//           </Stack>
//         </View>
//         {/* <StatusBar style="auto" /> */}
//       </ThemeProvider>
//     </QueryClientProvider>
//   );
// }
import { useColorScheme } from "@/hooks/use-color-scheme";
import { QueryClientProvider } from "@tanstack/react-query";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { queryClient } from "../api/queryClient";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { configureGoogleSignIn } from "@/lib/googleAuth";
import { useAuthStore } from "../../store/authStore";

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

  useEffect(() => {
    SplashScreen.hideAsync();
    configureGoogleSignIn();
    useAuthStore.getState().hydrate();
  }, []);

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    // The single SafeAreaProvider for the whole app. Every screen inside
    // the Stack below — and, critically, every React Native <Modal> (which
    // mounts into its own native root on iOS, outside this component
    // tree) — needs a provider reachable via context to get real,
    // freshly-measured insets instead of stale/zeroed ones. This is the
    // one place it should live; individual screens/modals should call
    // useSafeAreaInsets() or use SafeAreaView themselves rather than
    // padding being forced on them globally here.
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
            <Stack.Screen name="brand/[id]" options={{ headerShown: false }} />
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
