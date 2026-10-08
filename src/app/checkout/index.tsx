import { AppText } from "@/components/app-text";

import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
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
import AddressModal from "@/components/address-modal";
import { useAddresses } from "@/hooks/cravings-now-api/address-query";
import { useCreateOrder } from "@/hooks/cravings-now-api/order-mutation";
import { getCurrentCoords } from "@/lib/location";
import { buildOrderPayload } from "@/lib/buildOrderPayload";
import { useAuthStore } from "../../../store/authStore";
import * as Crypto from "expo-crypto";
import Loading from "@/components/ui/loading";

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
} as const;

// TODO: source from a real delivery-pricing calculation (distance/brand
// based) once one exists — flat placeholders for now, matching the amounts
// already shown in the design frame.
const DELIVERY_FEE = 500;
const SERVICE_FEE = 150;

// Hermes without the full ICU build doesn't support toLocaleString grouping,
// so comma-separate manually rather than risk "15300" instead of "15,300".
function formatPrice(amount: number): string {
  return `₦${Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

interface InfoCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}

function InfoCard({ icon, title, subtitle, onPress }: InfoCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.n200,
        borderRadius: 14,
        padding: 14,
        marginTop: 12,
      }}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          backgroundColor: COLORS.n100,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name={icon} size={16} color={COLORS.ink} />
      </View>
      <View style={{ flex: 1 }}>
        <AppText
          style={{ fontSize: 12.5, fontWeight: "700", color: COLORS.ink }}
        >
          {title}
        </AppText>
        <AppText
          numberOfLines={1}
          style={{ fontSize: 11, color: COLORS.n600, marginTop: 2 }}
        >
          {subtitle}
        </AppText>
      </View>
      <Ionicons name="chevron-forward" size={16} color={COLORS.n200} />
    </TouchableOpacity>
  );
}

interface SummaryRowProps {
  label: string;
  value: string;
  emphasize?: boolean;
}

function SummaryRow({ label, value, emphasize = false }: SummaryRowProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: emphasize ? 10 : 5,
        borderTopWidth: emphasize ? 1 : 0,
        borderTopColor: COLORS.n200,
        marginTop: emphasize ? 6 : 0,
      }}
    >
      <AppText
        style={{
          fontSize: emphasize ? 14 : 12,
          fontWeight: emphasize ? "700" : "400",
          color: emphasize ? COLORS.ink : COLORS.n600,
        }}
      >
        {label}
      </AppText>
      <AppText
        style={{
          fontSize: emphasize ? 14 : 12,
          fontWeight: emphasize ? "700" : "400",
          color: emphasize ? COLORS.ink : COLORS.n600,
        }}
      >
        {value}
      </AppText>
    </View>
  );
}

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { items, totalPrice, incrementQty, decrementQty, removeFromCart } =
    useCartStore();

  const naira = (kobo: number) =>
    (kobo / 100).toLocaleString("en-NG", {
      style: "currency",
      currency: "NGN",
    });

  const {
    subtotalKobo,
    deliveryFeeKobo,
    paystackServiceKobo,
    totalKobo,
    taxKobo,
  } = useLocalSearchParams<{
    subtotalKobo: number;
    deliveryFeeKobo: number;
    paystackServiceKobo: number;
    totalKobo: number;
    taxKobo: number;
  }>();

  const { data } = useAddresses();
  // console.log(data);
  const address = data?.[0];

  const { user } = useAuthStore();

  // console.log(user);

  const location = {
    latitude: Number(address?.latitude),
    longitude: Number(address?.longitude),
  };

  const createOrder = useCreateOrder();
  // items, total, customerId, customerAddressId, chargeIds, paymentMethodId, clearCart come from your cart/auth state

  const idemKeyRef = useRef<string | null>(null);

  // reset when the cart changes
  useEffect(() => {
    idemKeyRef.current = null;
  }, [items, totalPrice]);

  const onPlaceOrder = async () => {
    if (createOrder.isPending) return;
    idemKeyRef.current ??= Crypto.randomUUID();

    try {
      const payload = buildOrderPayload({
        items,
        location,
        amount: total,
        idempotencyKey: idemKeyRef.current,
        customerEmail: user?.email ?? "",
      });

      const order = await createOrder.mutateAsync(payload);

      router.push({
        pathname: "/payment",
        params: { url: order.paystackAuthUrl, orderId: order.id },
      });
    } catch (e) {
      Alert.alert(
        "Couldn't place order",
        e instanceof Error ? e.message : "Please try again",
      );
    }
  };
  const [addressModalVisible, setAddressModalVisible] =
    useState<boolean>(false);

  // TODO: AddressModal doesn't yet report back which address was picked —
  // it only closes itself on selection. Once addresses live in a shared
  // store/context, read the selected one from there instead of this local
  // placeholder.
  const selectedAddressLabel = "Mobolaji Bank Anthony Way, 3a";

  // TODO: same gap on the payment side — no payment-method store/API yet,
  // so this is a static placeholder rather than a real selection.
  const selectedPaymentLabel = "Visa •••• 4821";

  const subtotal: number = totalPrice();
  const total: number = subtotal + DELIVERY_FEE + SERVICE_FEE;
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    router.replace("/(auth)/login");
    return;
  }

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
          Checkout
        </AppText>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 110 + insets.bottom,
        }}
      >
        {/* ── Order items ── */}
        <AppText
          style={{
            fontSize: 13.5,
            fontWeight: "700",
            color: COLORS.ink,
            marginBottom: 4,
          }}
        >
          Your order
        </AppText>
        {items.map((item) => (
          <View
            key={item.id}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: COLORS.n100,
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
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
                <Text style={{ fontSize: 18 }}>🍽️</Text>
              )}
            </View>

            <View style={{ flex: 1 }}>
              <AppText
                numberOfLines={1}
                style={{ fontSize: 12.5, fontWeight: "700", color: COLORS.ink }}
              >
                {item.name}
              </AppText>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 9,
                  marginTop: 6,
                }}
              >
                <TouchableOpacity
                  onPress={() =>
                    item.quantity === 1
                      ? removeFromCart(item.id)
                      : decrementQty(item.id)
                  }
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: COLORS.n200,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {item.quantity === 1 ? (
                    <Ionicons
                      name="trash-outline"
                      size={10}
                      color={COLORS.ink}
                    />
                  ) : (
                    <Ionicons name="remove" size={12} color={COLORS.ink} />
                  )}
                </TouchableOpacity>
                <AppText
                  style={{
                    fontSize: 11.5,
                    fontWeight: "600",
                    color: COLORS.ink,
                  }}
                >
                  {item.quantity}
                </AppText>
                <TouchableOpacity
                  onPress={() => incrementQty(item.id)}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 6,
                    backgroundColor: COLORS.ink,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="add" size={12} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            <AppText
              style={{ fontSize: 12.5, fontWeight: "700", color: COLORS.ink }}
            >
              {formatPrice(item.price * item.quantity)}
            </AppText>
          </View>
        ))}

        {/* ── Delivery address ── */}
        <InfoCard
          icon="location-outline"
          title="Deliver to Home"
          subtitle={selectedAddressLabel}
          onPress={() => setAddressModalVisible(true)}
        />

        {/* ── Payment method ── */}
        <InfoCard
          icon="card-outline"
          title="Pay with Paystack"
          subtitle={selectedPaymentLabel}
          onPress={() => {
            // TODO: open a payment-method picker once one exists.
          }}
        />

        {/* ── Order summary ── */}
        <View style={{ marginTop: 20 }}>
          <SummaryRow label="Subtotal" value={naira(subtotalKobo)} />
          <SummaryRow label="Delivery fee" value={naira(0)} />
          <SummaryRow label="Service fee" value={naira(paystackServiceKobo)} />
          <SummaryRow label="Total" value={naira(totalKobo)} emphasize />
        </View>
      </ScrollView>

      {/* ── Place order CTA ── */}
      <TouchableOpacity
        onPress={onPlaceOrder}
        activeOpacity={0.85}
        style={{
          position: "absolute",
          left: 16,
          right: 16,
          bottom: 16 + insets.bottom,
          backgroundColor: COLORS.signal,
          borderRadius: 16,
          paddingVertical: 15,
          alignItems: "center",
          shadowColor: COLORS.signal,
          shadowOpacity: 0.35,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
          elevation: 6,
        }}
      >
        <AppText style={{ color: "#fff", fontSize: 13.5, fontWeight: "700" }}>
          {createOrder.isPending ? (
            <Loading />
          ) : (
            `Place order · ${naira(totalKobo)}`
          )}
        </AppText>
      </TouchableOpacity>

      <AddressModal
        visible={addressModalVisible}
        onClose={() => setAddressModalVisible(false)}
      />
    </SafeAreaView>
  );
}
