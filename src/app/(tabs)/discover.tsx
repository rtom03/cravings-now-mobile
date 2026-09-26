import { AppText } from "@/components/app-text";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
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
import { useGroups } from "../../api/groupQuery";

// ─── CravingsNow design tokens ──────────────────────────────────────────────
// TODO: extract into a shared `@/constants/theme` file — duplicated here and
// in HomeScreen until that migration happens.
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

// Same lookup tables as HomeScreen — keep in sync (or extract) as new brands
// are added.
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

// TODO: replace with a real cross-brand "featured products" endpoint —
// these placeholders exist to keep the layout in step with the design
// frame until that data is available.
const MOST_LOVED = [
  {
    id: "ml1",
    name: "Original Glazed Dozen",
    brand: "Krispy Kreme",
    price: 4500,
    emoji: "🍩",
    tint: "#FCE3C6",
  },
  {
    id: "ml2",
    name: "Double Cheese Stack",
    brand: "Burger Nation",
    price: 3200,
    emoji: "🍔",
    tint: "#F6D9DE",
  },
  {
    id: "ml3",
    name: "Cookies & Cream Tub",
    brand: "Scoopd",
    price: 2800,
    emoji: "🍦",
    tint: "#D9ECE0",
  },
];

const OCCASIONS = [
  { label: "Christmas", emoji: "🎄" },
  { label: "Eid", emoji: "🌙" },
  { label: "Thanksgiving", emoji: "🦃" },
  { label: "Valentine", emoji: "💝" },
];

// TODO: same placeholder caveat as MOST_LOVED — swap in the real endpoint,
// likely filterable by the OCCASIONS chips above.
const SEASON_SPECIALS = [
  {
    id: "ss1",
    name: "Christmas Sprinkle Box",
    brand: "Krispy Kreme",
    price: 5200,
    emoji: "🍩",
    tint: "#F3D9DC",
    occasion: "🎄",
  },
  {
    id: "ss2",
    name: "Eid Family Bundle",
    brand: "Burger Nation",
    price: 9900,
    emoji: "🍔",
    tint: "#E9E3D8",
    occasion: "🌙",
  },
  {
    id: "ss3",
    name: "Valentine Duo Sundae",
    brand: "Scoopd",
    price: 3400,
    emoji: "🍦",
    tint: "#F6D9E4",
    occasion: "💝",
  },
];

// Hermes without the full ICU build doesn't support toLocaleString grouping,
// so comma-separate manually rather than risk "4500" instead of "4,500".
function formatNaira(amount: number) {
  return `₦${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

export default function BrandsScreen() {
  const { data } = useGroups();
  const groups: Group[] = data ?? [];

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: COLORS.paper }}
      edges={["top"]}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.paper} />

      <View
        style={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 10 }}
      >
        <AppText style={{ fontSize: 20, fontWeight: "800", color: COLORS.ink }}>
          Brands
        </AppText>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* ── Brand list ────────────────────────────────────────── */}
        {!data ? (
          <View style={{ paddingVertical: 24, alignItems: "center" }}>
            <ActivityIndicator color={COLORS.signal} />
          </View>
        ) : groups.length === 0 ? (
          <View style={{ paddingHorizontal: 20 }}>
            <AppText style={{ fontSize: 12, color: COLORS.n600 }}>
              No brands available right now.
            </AppText>
          </View>
        ) : (
          groups.map((group, index) => (
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
                  gap: 14,
                  paddingHorizontal: 20,
                  paddingVertical: 14,
                  borderBottomWidth: index === groups.length - 1 ? 0 : 1,
                  borderBottomColor: COLORS.n100,
                }}
              >
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 16,
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
                    <Text style={{ fontSize: 22 }}>
                      {BRAND_EMOJI[group.name] ?? "🍽️"}
                    </Text>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <AppText
                    style={{
                      fontSize: 14,
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
                  size={18}
                  color={COLORS.n300}
                />
              </TouchableOpacity>
            </Link>
          ))
        )}

        {/* ── Most Loved ───────────────────────────────────────── */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "baseline",
            paddingHorizontal: 20,
            marginTop: 20,
            marginBottom: 10,
          }}
        >
          <AppText
            style={{ fontSize: 14.5, fontWeight: "700", color: COLORS.ink }}
          >
            Most Loved
          </AppText>
          <AppText
            style={{ fontSize: 11.5, fontWeight: "600", color: COLORS.n600 }}
          >
            See all
          </AppText>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            gap: 12,
            paddingBottom: 22,
          }}
        >
          {MOST_LOVED.map((item) => (
            <View
              key={item.id}
              style={{
                width: 128,
                backgroundColor: COLORS.surface,
                borderWidth: 1,
                borderColor: COLORS.n200,
                borderRadius: 16,
                padding: 10,
              }}
            >
              <View
                style={{
                  width: "100%",
                  height: 74,
                  borderRadius: 12,
                  backgroundColor: item.tint,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 8,
                }}
              >
                <Text style={{ fontSize: 28 }}>{item.emoji}</Text>
              </View>
              <AppText
                numberOfLines={2}
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: COLORS.ink,
                  lineHeight: 15,
                }}
              >
                {item.name}
              </AppText>
              <AppText
                style={{ fontSize: 9.5, color: COLORS.n600, marginTop: 3 }}
              >
                {item.brand}
              </AppText>
              <AppText
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: COLORS.ink,
                  marginTop: 7,
                }}
              >
                {formatNaira(item.price)}
              </AppText>
            </View>
          ))}
        </ScrollView>

        {/* ── Season Specials ──────────────────────────────────── */}
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
            Season Specials
          </AppText>
          <AppText
            style={{ fontSize: 11.5, fontWeight: "600", color: COLORS.n600 }}
          >
            See all
          </AppText>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            gap: 7,
            paddingBottom: 12,
          }}
        >
          {OCCASIONS.map((occasion) => (
            <View
              key={occasion.label}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                paddingHorizontal: 11,
                paddingVertical: 6,
                borderRadius: 16,
                backgroundColor: COLORS.n100,
              }}
            >
              <Text style={{ fontSize: 12 }}>{occasion.emoji}</Text>
              <AppText
                style={{
                  fontSize: 11,
                  fontWeight: "600",
                  color: COLORS.n600,
                }}
              >
                {occasion.label}
              </AppText>
            </View>
          ))}
        </ScrollView>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
        >
          {SEASON_SPECIALS.map((item) => (
            <View
              key={item.id}
              style={{
                width: 128,
                backgroundColor: COLORS.surface,
                borderWidth: 1,
                borderColor: COLORS.n200,
                borderRadius: 16,
                padding: 10,
              }}
            >
              <View style={{ position: "relative", marginBottom: 8 }}>
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    zIndex: 1,
                    backgroundColor: "rgba(255,255,255,0.92)",
                    borderRadius: 8,
                    paddingHorizontal: 5,
                    paddingVertical: 2,
                  }}
                >
                  <Text style={{ fontSize: 12 }}>{item.occasion}</Text>
                </View>
                <View
                  style={{
                    width: "100%",
                    height: 74,
                    borderRadius: 12,
                    backgroundColor: item.tint,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 28 }}>{item.emoji}</Text>
                </View>
              </View>
              <AppText
                numberOfLines={2}
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: COLORS.ink,
                  lineHeight: 15,
                }}
              >
                {item.name}
              </AppText>
              <AppText
                style={{ fontSize: 9.5, color: COLORS.n600, marginTop: 3 }}
              >
                {item.brand}
              </AppText>
              <AppText
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: COLORS.ink,
                  marginTop: 7,
                }}
              >
                {formatNaira(item.price)}
              </AppText>
            </View>
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}
