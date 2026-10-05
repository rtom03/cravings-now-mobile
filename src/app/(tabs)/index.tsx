import { Link } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "@/components/app-text";
import AddressModal from "@/components/address-modal";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../../store/authStore";
import { useGroups } from "@/hooks/cravings-now-api/groupQuery";
import { fomarlizeName, getGreeting } from "@/utils";

// ─── CravingsNow design tokens — from the style-guide cover frame ──────────
// TODO: move into `@/constants` once the rest of the app migrates off the
// old palette.
const COLORS = {
  ink: "#1B1B1F",
  paper: "#F7F6F3",
  surface: "#FFFFFF",
  signal: "#E63462",
  support: "#0F5257",
  n600: "#6E6E76",
  n300: "#B9B7B2",
  n200: "#E7E4DE",
  n100: "#F1EFEA",
};

const CATEGORY_CHIPS = [
  { label: "Donuts", emoji: "🍩" },
  { label: "Burgers", emoji: "🍔" },
  { label: "Ice cream", emoji: "🍦" },
  { label: "Specials", emoji: "🎉" },
];

// Groups whose `image` is null (Scoopd, today) still need a face on the home
// screen — keyed by name since that's the one field guaranteed on every
// group. Add new brands here as they're onboarded.
const BRAND_EMOJI: Record<string, string> = {
  Scoopd: "🍦",
  "Krispy Kreme": "🍩",
  "Burger Nation": "🍔",
};
const BRAND_TINT: Record<string, string> = {
  Scoopd: "#D9ECE0",
  "Krispy Kreme": "#FCE3C6",
  "Burger Nation": "#F6D9DE",
};

interface Group {
  id: string;
  foodicsId: string;
  name: string;
  nameLocalized: string | null;
  image: string | null;
  logo: string | null;
}

export default function HomeScreen() {
  const { data } = useGroups();
  const groups: Group[] = data ?? [];
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const user = useAuthStore((s) => s.user); // re-renders on change
  // console.log(user?.name);
  const greeting = getGreeting();

  return (
    <SafeAreaView
      edges={["top"]}
      style={{ flex: 1, backgroundColor: COLORS.paper }}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.paper} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* ── Greeting + location ──────────────────────────────── */}
        {/* TODO: wire to the real saved/device address via the existing
            location hook — placeholder text matches the design frame. */}
        <View style={{ paddingHorizontal: 20, paddingTop: 14 }}>
          <AppText style={{ fontSize: 13, color: COLORS.n600 }}>
            {`${greeting} ${fomarlizeName(user?.name)}`}
          </AppText>
          <TouchableOpacity
            onPress={() => setAddressModalVisible(true)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              marginTop: 2,
            }}
          >
            <Text style={{ fontSize: 14 }}>📍</Text>
            <AppText
              style={{ fontSize: 16, fontWeight: "700", color: COLORS.ink }}
            >
              Lekki Phase 1
            </AppText>
            <Ionicons name="chevron-down" size={14} color={COLORS.ink} />
          </TouchableOpacity>
        </View>

        {/* ── Search bar ───────────────────────────────────────── */}
        <Link href={"/(tabs)/discover"} asChild>
          <TouchableOpacity
            style={{
              marginHorizontal: 20,
              marginTop: 12,
              marginBottom: 14,
              backgroundColor: COLORS.surface,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: COLORS.n200,
              paddingHorizontal: 14,
              paddingVertical: 12,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Ionicons name="search-outline" size={16} color={COLORS.n600} />
            <AppText style={{ fontSize: 13, color: COLORS.n600 }}>
              Search Krispy Kreme, burgers…
            </AppText>
          </TouchableOpacity>
        </Link>

        {/* ── Category chips ───────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            gap: 8,
            paddingBottom: 16,
          }}
        >
          {CATEGORY_CHIPS.map((chip, index) => {
            const active = index === 0;
            return (
              <View
                key={chip.label}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  paddingHorizontal: 13,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: active ? COLORS.support : COLORS.surface,
                  borderWidth: 1,
                  borderColor: active ? COLORS.support : COLORS.n200,
                }}
              >
                <Text style={{ fontSize: 13 }}>{chip.emoji}</Text>
                <AppText
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: active ? "#fff" : COLORS.ink,
                  }}
                >
                  {chip.label}
                </AppText>
              </View>
            );
          })}
        </ScrollView>

        {/* ── Banner ────────────────────────────────────────────── */}
        <View
          style={{
            marginHorizontal: 20,
            marginBottom: 22,
            borderRadius: 18,
            padding: 18,
            backgroundColor: COLORS.signal,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              position: "absolute",
              right: -14,
              top: -14,
              width: 70,
              height: 70,
              borderRadius: 35,
              backgroundColor: "rgba(255,255,255,0.14)",
            }}
          />
          <AppText style={{ fontSize: 15, fontWeight: "700", color: "#fff" }}>
            Free delivery ×3
          </AppText>
          <AppText
            style={{
              fontSize: 11.5,
              color: "rgba(255,255,255,0.9)",
              marginTop: 4,
              maxWidth: 180,
            }}
          >
            On your first three orders this week
          </AppText>
        </View>

        {/* ── Our brands ────────────────────────────────────────── */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "baseline",
            paddingHorizontal: 20,
            marginBottom: 10,
          }}
        >
          <AppText
            style={{ fontSize: 14.5, fontWeight: "700", color: COLORS.ink }}
          >
            Our brands
          </AppText>
          <Link href={"/(tabs)/discover"}>
            <AppText
              style={{ fontSize: 11.5, fontWeight: "600", color: COLORS.n600 }}
            >
              See all
            </AppText>
          </Link>
        </View>

        {!data ? (
          <View
            style={{
              paddingHorizontal: 20,
              paddingVertical: 24,
              alignItems: "center",
            }}
          >
            <ActivityIndicator color={COLORS.signal} />
          </View>
        ) : groups.length === 0 ? (
          <View style={{ paddingHorizontal: 20 }}>
            <AppText style={{ fontSize: 12, color: COLORS.n600 }}>
              No brands available right now.
            </AppText>
          </View>
        ) : (
          groups.map((group) => (
            <Link
              key={group.id}
              href={{
                pathname: "/brand/[id]",
                params: {
                  id: group.id,
                  name: group.name,
                  hero_img: group.image ?? "",
                },
              }}
              asChild
            >
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  paddingHorizontal: 20,
                  paddingBottom: 16,
                }}
              >
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 14,
                    backgroundColor: BRAND_TINT[group.name] ?? COLORS.n100,
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  {group.image ? (
                    <Image
                      source={{ uri: group.logo! }}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="contain"
                    />
                  ) : (
                    <Text style={{ fontSize: 24 }}>
                      {BRAND_EMOJI[group.name] ?? "🍽️"}
                    </Text>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <AppText
                    style={{
                      fontSize: 13.5,
                      fontWeight: "700",
                      color: COLORS.ink,
                    }}
                  >
                    {group.name}
                  </AppText>
                  <AppText
                    style={{ fontSize: 11, color: COLORS.n600, marginTop: 3 }}
                  >
                    Tap to view menu
                  </AppText>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={COLORS.n300}
                />
              </TouchableOpacity>
            </Link>
          ))
        )}
      </ScrollView>

      <AddressModal
        visible={addressModalVisible}
        onClose={() => setAddressModalVisible(false)}
      />
    </SafeAreaView>
  );
}
