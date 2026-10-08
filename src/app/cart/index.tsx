import { Href, Link, Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import {
  Button,
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useCartStore } from "../../../store/cartStore";
import { AppText } from "@/components/app-text";
import { useCreateOrderQuote } from "@/hooks/cravings-now-api/order-mutation";
import { buildOrderPayload } from "@/lib/buildOrderPayload";
import { useAddresses } from "@/hooks/cravings-now-api/address-query";
import Loading from "@/components/ui/loading";
import { useUserLocation } from "@/hooks/use-user-location";

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
  // NOTE: SafeAreaView (below) only pads normal in-flow children. The
  // checkout bar further down is `position: "absolute"`, which is laid out
  // relative to the screen's raw edges regardless of any parent's padding
  // — so it needs insets.bottom added explicitly or it sits flush against
  // (or under) the home indicator on notched devices.
  const insets = useSafeAreaInsets();
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

  const { data } = useAddresses();

  const address = data?.[0];
  const { coords, status, openSettings } = useUserLocation();

  if (status === "blocked")
    return (
      <Button title="Enable location in Settings" onPress={openSettings} />
    );
  if (coords) console.log(coords.lat, coords.lng);
  // console.log(items);

  const location = {
    latitude: Number(coords?.lat),
    longitude: Number(coords?.lng),
  };

  // console.log(location);
  const createOrderQuote = useCreateOrderQuote();

  const onProceedToCheckout = async () => {
    if (createOrderQuote.isPending) return;
    try {
      const payload = buildOrderPayload({
        items,
        location,
      });

      const orderQuote = await createOrderQuote.mutateAsync(payload);

      router.push({
        pathname: "/checkout",
        params: {
          subtotalKobo: orderQuote.subtotalKobo,
          // discountKobo: orderQuote.discountKobo
          // couponCode: string | null;
          taxKobo: orderQuote.taxKobo,
          taxRatePct: orderQuote.taxRatePct,
          deliveryFeeKobo: orderQuote.deliveryFeeKobo,
          paystackServiceKobo: orderQuote.paystackServiceKobo,
          totalKobo: orderQuote.totalKobo,
        },
      });
    } catch (error) {}
  };

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
          <Link href={"/(tabs)/discover" as Href} asChild>
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
              // Room for the floating checkout bar below PLUS the same
              // bottom inset it needs — otherwise the last cart row still
              // ends up hidden behind it on notched devices.
              paddingBottom: 120 + insets.bottom,
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
                  alignItems: "flex-start",
                  gap: 14,
                  paddingVertical: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: COLORS.n100,
                }}
              >
                {/* Bold image, same treatment as MenuItemCard — this was
                    56x56 before; the whole row's flex direction changed
                    from centered to flex-start to fit it properly. */}
                <View
                  style={{
                    width: 104,
                    height: 104,
                    borderRadius: 16,
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
                    <Text style={{ fontSize: 34 }}>🍽️</Text>
                  )}
                </View>

                <View style={{ flex: 1 }}>
                  <AppText
                    numberOfLines={2}
                    style={{
                      fontSize: 13.5,
                      fontWeight: "700",
                      color: COLORS.ink,
                      lineHeight: 18,
                    }}
                  >
                    {item.name}
                  </AppText>
                  <AppText
                    style={{
                      fontSize: 12.5,
                      fontWeight: "700",
                      color: COLORS.ink,
                      marginTop: 6,
                    }}
                  >
                    {formatPrice(item.price)}
                  </AppText>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      gap: 10,
                      marginTop: 12,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() =>
                        item.quantity === 1
                          ? removeFromCart(item.lineId)
                          : decrementQty(item.lineId)
                      }
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 15,
                        borderWidth: 1,
                        borderColor: COLORS.n200,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {item.quantity === 1 ? (
                        <Ionicons
                          name="trash-outline"
                          size={13}
                          color={COLORS.ink}
                        />
                      ) : (
                        <Ionicons name="remove" size={16} color={COLORS.ink} />
                      )}
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
                      onPress={() => incrementQty(item.lineId)}
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 15,
                        backgroundColor: COLORS.ink,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Ionicons name="add" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}

            {/* TODO: confirm the Brands tab's actual route segment. */}
            <Link href={"/discover" as Href} asChild>
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
          <TouchableOpacity
            onPress={onProceedToCheckout}
            style={{
              position: "absolute",
              left: 16,
              right: 16,
              // The actual fix: without + insets.bottom, this sits
              // exactly 16px from the physical screen edge, ignoring the
              // home indicator entirely.
              bottom: 16 + insets.bottom,
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
            {createOrderQuote.isPending ? (
              <Loading />
            ) : (
              <View>
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
              </View>
            )}
          </TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
}
