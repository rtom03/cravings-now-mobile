import Ionicons from "@react-native-vector-icons/ionicons/static";
import { Href, Link, Stack, useRouter } from "expo-router";
import {
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCartStore } from "../../../store/cartStore";
import { AppText } from "@/components/app-text";

// ─── CravingsNow design tokens — from the style-guide cover frame ──────────
// TODO: extract into a shared `@/constants/theme` file — duplicated across
// every screen/component that references them until that migration happens.
const COLORS = {
  ink: "#1B1B1F",
  paper: "#F7F6F3",
  surface: "#FFFFFF",
  signal: "#E63462",
  n600: "#6E6E76",
  n200: "#E7E4DE",
  n100: "#F1EFEA",
};

// Hermes without the full ICU build doesn't support toLocaleString grouping,
// so comma-separate manually rather than risk "15300" instead of "15,300".
function formatPrice(amount: number) {
  return `₦${Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

export default function CartScreen() {
  const router = useRouter();
  const {
    items,
    totalPrice,
    removeFromCart,
    incrementQty,
    decrementQty,
    clearCart,
  } = useCartStore();

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const isEmpty = items.length === 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.paper }}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.paper} />

      {/* ── Header ── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
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
        <AppText style={{ fontSize: 16, fontWeight: "700", color: COLORS.ink }}>
          Your cart
        </AppText>
        {isEmpty ? (
          <View style={{ width: 34 }} />
        ) : (
          <TouchableOpacity
            onPress={clearCart}
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: COLORS.n100,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="trash-outline" size={15} color={COLORS.signal} />
          </TouchableOpacity>
        )}
      </View>

      {isEmpty ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 40,
          }}
        >
          <Text style={{ fontSize: 40, marginBottom: 12 }}>🛒</Text>
          <AppText
            style={{
              fontSize: 15,
              fontWeight: "700",
              color: COLORS.ink,
              marginBottom: 6,
            }}
          >
            Your cart is empty
          </AppText>
          <AppText
            style={{
              fontSize: 12,
              color: COLORS.n600,
              textAlign: "center",
              marginBottom: 20,
              lineHeight: 18,
            }}
          >
            Add items from your favorite brands to get started.
          </AppText>
          {/* TODO: confirm the Brands tab's actual route segment. */}
          <Link href={"/discover" as Href} asChild>
            <TouchableOpacity
              style={{
                backgroundColor: COLORS.signal,
                borderRadius: 14,
                paddingHorizontal: 22,
                paddingVertical: 13,
              }}
            >
              <AppText
                style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}
              >
                Browse brands
              </AppText>
            </TouchableOpacity>
          </Link>
        </View>
      ) : (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingBottom: 120,
            }}
          >
            <AppText
              style={{ fontSize: 12, color: COLORS.n600, marginBottom: 14 }}
            >
              {totalItems} {totalItems === 1 ? "item" : "items"} in your cart
            </AppText>

            {items.map((item) => (
              <View
                key={item.lineId}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  paddingVertical: 14,
                  borderBottomWidth: 1,
                  borderBottomColor: COLORS.n100,
                }}
              >
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    backgroundColor: COLORS.n100,
                    overflow: "hidden",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {item.img ? (
                    <Image
                      source={{ uri: item.img }}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={{ fontSize: 22 }}>🍽️</Text>
                  )}
                </View>

                <View style={{ flex: 1 }}>
                  <AppText
                    numberOfLines={1}
                    style={{
                      fontSize: 13.5,
                      fontWeight: "700",
                      color: COLORS.ink,
                    }}
                  >
                    {item.name}
                  </AppText>
                  <AppText
                    style={{
                      fontSize: 12.5,
                      fontWeight: "700",
                      color: COLORS.ink,
                      marginTop: 4,
                    }}
                  >
                    {formatPrice(item.price)}
                  </AppText>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <TouchableOpacity
                    onPress={() =>
                      item.quantity === 1
                        ? removeFromCart(item.id)
                        : decrementQty(item.id)
                    }
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: COLORS.n200,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: item.quantity === 1 ? 12 : 15,
                        color: COLORS.ink,
                      }}
                    >
                      {item.quantity === 1 ? "🗑" : "−"}
                    </Text>
                  </TouchableOpacity>
                  <AppText
                    style={{
                      fontSize: 13,
                      fontWeight: "700",
                      color: COLORS.ink,
                      minWidth: 16,
                      textAlign: "center",
                    }}
                  >
                    {item.quantity}
                  </AppText>
                  <TouchableOpacity
                    onPress={() => incrementQty(item.id)}
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: COLORS.n200,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: 15, color: COLORS.ink }}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* TODO: confirm the Brands tab's actual route segment. */}
            <Link href={"/(tabs)/brands" as Href} asChild>
              <TouchableOpacity
                style={{
                  alignSelf: "flex-end",
                  marginTop: 16,
                  backgroundColor: COLORS.n100,
                  borderRadius: 20,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                }}
              >
                <AppText
                  style={{ fontSize: 12, fontWeight: "700", color: COLORS.ink }}
                >
                  + Add more items
                </AppText>
              </TouchableOpacity>
            </Link>
          </ScrollView>

          {/* TODO: this repo's existing checkout route is "/proceed" — kept
              as-is rather than guessing a "/checkout" rename. */}
          <Link href={"/checkout" as Href} asChild>
            <TouchableOpacity
              style={{
                position: "absolute",
                left: 16,
                right: 16,
                bottom: 16,
                backgroundColor: COLORS.signal,
                borderRadius: 16,
                paddingVertical: 15,
                paddingHorizontal: 20,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                shadowColor: COLORS.signal,
                shadowOpacity: 0.35,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 6 },
                elevation: 6,
              }}
            >
              <AppText
                style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}
              >
                {formatPrice(totalPrice())}
              </AppText>
              <AppText
                style={{ color: "#fff", fontSize: 13.5, fontWeight: "700" }}
              >
                Proceed to checkout →
              </AppText>
            </TouchableOpacity>
          </Link>
        </>
      )}
    </SafeAreaView>
  );
}
