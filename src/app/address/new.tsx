import { AppText } from "@/components/app-text";
import { env } from "@/config/env";
import { useUserLocation } from "@/hooks/use-user-location";
import { Ionicons } from "@expo/vector-icons";
import { Href, useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── CravingsNow design tokens ──────────────────────────────────────────────
// TODO: extract into a shared `@/constants/theme` file.
const COLORS = {
  ink: "#1B1B1F",
  paper: "#F7F6F3",
  surface: "#FFFFFF",
  n600: "#6E6E76",
  n200: "#E7E4DE",
  n100: "#F1EFEA",
} as const;

// TODO: move into app config — the EXPO_PUBLIC_ prefix is required for Expo
// to expose an env var to the client bundle at all. Google's Places
// Autocomplete now requires a funded billing account with no meaningful
// free tier (the $200/mo credit was discontinued Feb 2025, and legacy
// Autocomplete was deprecated for new projects in March 2025) — switched
// to LocationIQ instead: 5,000 requests/day free, no credit card. This key
// is still visible in the client bundle either way — restrict it by
// package name / bundle ID in the LocationIQ dashboard.
const LOCATIONIQ_API_KEY = env.location.location_iq;

// LocationIQ's autocomplete response already includes lat/lon per result —
// unlike Google's two-call Autocomplete + Place Details flow, there's
// nothing further to fetch once a result is tapped.
interface Prediction {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
}

export default function AddressSearchScreen() {
  const router = useRouter();
  const { lat, lng } = useLocalSearchParams<{ lat?: string; lng?: string }>();

  const { coords, status, place, openSettings } = useUserLocation();

  const [query, setQuery] = useState("");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // A stable per-visit session token keeps Google's autocomplete + details
  // calls billed together as one session instead of as separate requests.
  const sessionTokenRef = useRef<string>(Math.random().toString(36).slice(2));
  const viewbox = [
    3.25, // west longitude
    6.75, // north latitude
    3.5, // east longitude
    6.45, // south latitude
  ].join(",");
  const fetchPredictions = async (text: string) => {
    setIsSearching(true);
    try {
      const params = new URLSearchParams({
        input: text,
        key: LOCATIONIQ_API_KEY,
        sessiontoken: sessionTokenRef.current,
      });
      if (lat && lng) {
        params.set("location", `${lat},${lng}`);
        params.set("radius", "20000");
      }
      const response = await fetch(
        `https://us1.locationiq.com/v1/search?` +
          `key=${LOCATIONIQ_API_KEY}` +
          `&q=${encodeURIComponent(isSearching)}` +
          `&format=json` +
          `&countrycodes=ng` +
          `&viewbox=${viewbox}` +
          `&addressdetails=1` +
          `&normalizeaddress=1` +
          `&limit=10`,
      );
      const json = await response.json();

      setPredictions(json ?? []);
    } catch (error) {
      console.error("Address search failed:", error);
      setPredictions([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleChangeQuery = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (text.trim().length < 3) {
      setPredictions([]);
      return;
    }

    debounceRef.current = setTimeout(() => fetchPredictions(text), 350);
  };

  const handleSelect = async (prediction: Prediction) => {
    try {
      const params = new URLSearchParams({
        place_id: prediction.place_id,
        key: LOCATIONIQ_API_KEY,
        sessiontoken: sessionTokenRef.current,
        fields: "geometry,formatted_address",
      });
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?${params.toString()}`,
      );
      const json = await response.json();
      const location = json.result?.geometry?.location;
      const formattedAddress: string =
        json.result?.formatted_address ?? prediction.display_name;

      if (!location) return;

      router.push({
        pathname: "/address/details",
        params: {
          description: formattedAddress,
          lat: String(location.lat),
          lng: String(location.lng),
        },
      });
    } catch (error) {
      console.error("Fetching place details failed:", error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.paper }}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.paper} />

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 14,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: COLORS.n100,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="chevron-back" size={16} color={COLORS.ink} />
        </TouchableOpacity>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            backgroundColor: COLORS.surface,
            borderWidth: 1,
            borderColor: COLORS.n200,
            borderRadius: 14,
            paddingHorizontal: 14,
            paddingVertical: 11,
          }}
        >
          <Ionicons name="search-outline" size={16} color={COLORS.n600} />
          <TextInput
            value={query}
            onChangeText={handleChangeQuery}
            placeholder="Search for your address"
            placeholderTextColor={COLORS.n600}
            autoFocus
            style={{ flex: 1, fontSize: 13, color: COLORS.ink, padding: 0 }}
          />
          {isSearching && (
            <ActivityIndicator size="small" color={COLORS.n600} />
          )}
        </View>
      </View>

      <FlatList
        data={predictions}
        keyExtractor={(item) => item.place_id}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleSelect(item)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              paddingHorizontal: 20,
              paddingVertical: 14,
              borderBottomWidth: 1,
              borderBottomColor: COLORS.n100,
            }}
          >
            <Ionicons name="location-outline" size={18} color="black" />
            <Text style={{ flex: 1, fontSize: 13, color: "black" }}>
              {place?.name}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          query.trim().length >= 3 && !isSearching ? (
            <AppText
              style={{
                fontSize: 12,
                color: COLORS.n600,
                textAlign: "center",
                marginTop: 24,
              }}
            >
              No matches found.
            </AppText>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
