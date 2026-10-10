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
import { useGroups } from "../../hooks/cravings-now-api/groupQuery";
import { useProducts } from "@/hooks/cravings-now-api/product-query";
import React, { useCallback, useMemo } from "react";
import { Product, ProductWithOptions } from "@/types/product";
import { useItemSheet } from "@/hooks/use-item-sheet";
import { Item, toMenuItem } from "../brand/[id]";
import ItemDetailSheet from "@/components/product-details";

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

// Hermes without the full ICU build doesn't support toLocaleString grouping,
// so comma-separate manually rather than risk "4500" instead of "4,500".
function formatNaira(amount: number) {
  return `₦${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}
// Only the fields this screen reads. TODO: move into "@/types/brands" (or
// reuse ProductProps) once it carries mostLoved / isPromotion / groupName.

const RAIL_CARD_WIDTH = 132;
function toItem(product: ProductWithOptions): Item {
  return {
    id: product.id,
    foodicsId: product.foodicsId,
    foodicsSandBoxId: product.foodicsSandBoxId,
    name: product.name,
    price: product.price,
    img: product.image ?? undefined,
    desc: product.description ?? "",
    category: product.category.id ?? undefined,
    groupName: product.groupName!,
    quantity: 1,
    option: product.modifiers ?? [],
  };
}

const ProductCard = React.memo(function ProductCard({
  product,
  onPress,
}: {
  product: Product;
  onPress: (product: ProductWithOptions) => void;
}) {
  const tint = BRAND_TINT[product.groupName!] ?? COLORS.n100;

  return (
    <View style={{ width: RAIL_CARD_WIDTH }}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => onPress(product)}
        accessibilityLabel={`View ${product.name}`}
        style={{ width: RAIL_CARD_WIDTH }}
      >
        {" "}
        <View
          style={{
            width: RAIL_CARD_WIDTH,
            height: RAIL_CARD_WIDTH,
            borderRadius: 16,
            backgroundColor: tint,
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {product.image ? (
            <Image
              source={{ uri: product.image }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          ) : (
            <Text style={{ fontSize: 34 }}>
              {BRAND_EMOJI[product.groupName!] ?? "🍽️"}
            </Text>
          )}
        </View>
        {/* TODO: wire to quick-add / open the product once a product can be
            resolved to its group (groupId is null in the products payload). */}
        <View
          style={{
            position: "absolute",
            right: 8,
            bottom: 8,
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: COLORS.surface,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOpacity: 0.12,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 },
            elevation: 3,
          }}
        >
          <Ionicons name="add" size={20} color={COLORS.ink} />
        </View>
      </TouchableOpacity>

      <AppText
        numberOfLines={2}
        style={{
          fontSize: 13,
          fontWeight: "600",
          color: COLORS.ink,
          lineHeight: 17,
          marginTop: 10,
        }}
      >
        {product.name}
      </AppText>
      <AppText
        style={{
          fontSize: 12.5,
          fontWeight: "500",
          color: COLORS.ink,
          marginTop: 4,
        }}
      >
        {formatNaira(product.price)}
      </AppText>
    </View>
  );
});
function ProductRail({
  title,
  products,
  onProductPress,
}: {
  title: string;
  products: ProductWithOptions[];
  onProductPress: (product: ProductWithOptions) => void;
}) {
  // No products, no section: no empty header sitting over nothing.
  if (products.length === 0) return null;

  return (
    <View style={{ marginTop: 20 }}>
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
          {title}
        </AppText>
        {/* TODO: wire "See all" once a full-list screen exists. */}
        {/* <AppText
          style={{ fontSize: 11.5, fontWeight: "600", color: COLORS.n600 }}
        >
          See all
        </AppText> */}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onPress={onProductPress}
          />
        ))}
      </ScrollView>
    </View>
  );
}

export default function BrandsScreen() {
  const { data } = useGroups();
  const { data: productsData } = useProducts();
  const groups: Group[] = data ?? [];
  const mostLoved = useMemo(
    () => (productsData ?? []).filter((p) => p.isActive && p.mostLoved),
    [productsData],
  );

  const promotions = useMemo(
    () => (productsData ?? []).filter((p) => p.isActive && p.isPromotion),
    [productsData],
  );
  const { open, sheetProps } = useItemSheet();
  const handleProductPress = useCallback(
    (product: ProductWithOptions) => open(toItem(product)),
    [open],
  );
  // console.log(productsData);

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
        <ProductRail
          title="Most Loved"
          products={mostLoved}
          onProductPress={handleProductPress}
        />
        <ProductRail
          title="Promotions"
          products={promotions}
          onProductPress={handleProductPress}
        />
      </ScrollView>
      <ItemDetailSheet {...sheetProps} />
    </SafeAreaView>
  );
}
