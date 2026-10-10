import { AppText } from "@/components/app-text";
import { Bone, SkeletonProvider } from "@/components/products-skeleton";
import { fmt } from "@/utils";
import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { FlatList, Image, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCartStore } from "../../store/cartStore";

// TODO: swap for `@/constants/theme` once the token migration happens.
const COLORS = {
  ink: "#1B1B1F",
  paper: "#F7F6F3",
  surface: "#FFFFFF",
  signal: "#E63462",
  support: "#0F5257",
  success: "#4C9A6A",
  warn: "#E8A33D",
  n600: "#6E6E76",
  n300: "#B9B7B2",
  n200: "#E7E4DE",
  n100: "#F1EFEA",
};

// ─── Order shape ────────────────────────────────────────────────────────────
// TODO: align with the real orders API once it exists. This is the shape the
// UI needs, not a confirmed contract.
type OrderStatus =
  | "pending"
  | "preparing"
  | "on_the_way"
  | "delivered"
  | "cancelled";

interface OrderSummary {
  id: string;
  brandName: string;
  createdAt: string; // ISO
  status: OrderStatus;
  total: number;
  items: { name: string; quantity: number }[];
}

// TODO: replace with the real hook (e.g. `useOrders()` from
// "@/hooks/cravings-now-api/...") — the screen only relies on
// `{ data, isPending }`. Placeholder data keeps the UI reviewable.
const PLACEHOLDER_ORDERS: OrderSummary[] = [
  {
    id: "ord_1042",
    brandName: "Krispy Kreme",
    createdAt: "2026-10-09T18:42:00Z",
    status: "on_the_way",
    total: 6200,
    items: [
      { name: "Original Glazed Dozen", quantity: 1 },
      { name: "Iced Latte", quantity: 2 },
    ],
  },
  {
    id: "ord_1031",
    brandName: "Burger Nation",
    createdAt: "2026-10-05T13:10:00Z",
    status: "delivered",
    total: 9800,
    items: [
      { name: "Classic Smash Burger", quantity: 2 },
      { name: "Loaded Fries", quantity: 1 },
    ],
  },
  {
    id: "ord_1007",
    brandName: "Scoop'd",
    createdAt: "2026-09-28T20:05:00Z",
    status: "cancelled",
    total: 3400,
    items: [{ name: "Triple Scoop Tub", quantity: 1 }],
  },
];

function useOrders(): { data: OrderSummary[] | undefined; isPending: boolean } {
  return { data: PLACEHOLDER_ORDERS, isPending: false };
}

// ─── Status presentation ────────────────────────────────────────────────────
const STATUS_META: Record<
  OrderStatus,
  { label: string; color: string; tint: string }
> = {
  pending: { label: "Pending", color: COLORS.warn, tint: "#E8A33D1F" },
  preparing: { label: "Preparing", color: COLORS.warn, tint: "#E8A33D1F" },
  on_the_way: { label: "On the way", color: COLORS.support, tint: "#0F52571A" },
  delivered: { label: "Delivered", color: COLORS.success, tint: "#4C9A6A1F" },
  cancelled: { label: "Cancelled", color: COLORS.n600, tint: COLORS.n100 },
};

function formatOrderDate(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
  const time = d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${date} · ${time}`;
}

// ─── Cart card (renders nothing when the cart is empty) ─────────────────────
function CartCard() {
  const router = useRouter();
  const { items, totalPrice } = useCartStore();

  if (items.length === 0) return null;

  // Show at most ONE item; anything beyond it collapses into "+N more".
  const first = items[0];
  const extra = items.length - 1;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push("/cart" as Href)}
      style={{
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 14,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: COLORS.n200,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Ionicons name="bag-handle" size={16} color={COLORS.support} />
          <AppText
            style={{ fontSize: 12, fontWeight: "700", color: COLORS.support }}
          >
            In your cart
          </AppText>
        </View>
        <AppText style={{ fontSize: 12, fontWeight: "700", color: COLORS.ink }}>
          {fmt(totalPrice())}
        </AppText>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        {first.img ? (
          <Image
            source={{ uri: first.img }}
            style={{ width: 56, height: 56, borderRadius: 12 }}
          />
        ) : (
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              backgroundColor: COLORS.n100,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="fast-food-outline" size={22} color={COLORS.n300} />
          </View>
        )}

        <View style={{ flex: 1 }}>
          <AppText
            numberOfLines={1}
            style={{ fontSize: 14, fontWeight: "700", color: COLORS.ink }}
          >
            {first.name}
          </AppText>
          <AppText style={{ fontSize: 12, color: COLORS.n600, marginTop: 2 }}>
            Qty {first.quantity}
            {extra > 0
              ? `  ·  +${extra} more ${extra === 1 ? "item" : "items"}`
              : ""}
          </AppText>
        </View>

        <View
          style={{
            backgroundColor: COLORS.support,
            borderRadius: 12,
            paddingVertical: 10,
            paddingHorizontal: 14,
          }}
        >
          <AppText style={{ color: "#fff", fontSize: 12.5, fontWeight: "700" }}>
            View cart
          </AppText>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Order row ──────────────────────────────────────────────────────────────
const OrderCard = React.memo(function OrderCard({
  order,
  onPress,
}: {
  order: OrderSummary;
  onPress: (order: OrderSummary) => void;
}) {
  const status = STATUS_META[order.status];
  const summary = order.items.map((i) => `${i.quantity}× ${i.name}`).join(", ");

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress(order)}
      style={{
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: COLORS.n200,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <View style={{ flex: 1, paddingRight: 12 }}>
          <AppText
            style={{ fontSize: 14, fontWeight: "700", color: COLORS.ink }}
          >
            {order.brandName}
          </AppText>
          <AppText style={{ fontSize: 11.5, color: COLORS.n600, marginTop: 2 }}>
            {formatOrderDate(order.createdAt)}
          </AppText>
        </View>

        <View
          style={{
            backgroundColor: status.tint,
            borderRadius: 20,
            paddingVertical: 4,
            paddingHorizontal: 10,
          }}
        >
          <AppText
            style={{ fontSize: 11, fontWeight: "700", color: status.color }}
          >
            {status.label}
          </AppText>
        </View>
      </View>

      <AppText
        numberOfLines={2}
        style={{ fontSize: 12.5, color: COLORS.n600, marginTop: 10 }}
      >
        {summary}
      </AppText>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 12,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: COLORS.n100,
        }}
      >
        <AppText style={{ fontSize: 13, fontWeight: "700", color: COLORS.ink }}>
          {fmt(order.total)}
        </AppText>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
          <AppText
            style={{ fontSize: 12, fontWeight: "600", color: COLORS.signal }}
          >
            {order.status === "on_the_way" ? "Track order" : "View details"}
          </AppText>
          <Ionicons name="chevron-forward" size={14} color={COLORS.signal} />
        </View>
      </View>
    </TouchableOpacity>
  );
});

// ─── Loading + empty states ─────────────────────────────────────────────────
function OrdersSkeleton() {
  return (
    <View
      style={{ gap: 12 }}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Loading orders"
    >
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={{
            backgroundColor: COLORS.surface,
            borderRadius: 16,
            padding: 14,
            gap: 10,
            borderWidth: 1,
            borderColor: COLORS.n200,
          }}
        >
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View style={{ gap: 6 }}>
              <Bone width={110} height={14} radius={6} />
              <Bone width={80} height={10} radius={5} />
            </View>
            <Bone width={72} height={22} radius={11} />
          </View>
          <Bone width="85%" height={10} radius={5} />
          <Bone width={64} height={14} radius={6} style={{ marginTop: 6 }} />
        </View>
      ))}
    </View>
  );
}

function EmptyOrders() {
  return (
    <View
      style={{ alignItems: "center", paddingTop: 56, paddingHorizontal: 32 }}
    >
      <View
        style={{
          width: 88,
          height: 88,
          borderRadius: 44,
          backgroundColor: COLORS.n100,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <Ionicons name="receipt-outline" size={34} color={COLORS.n300} />
      </View>
      <AppText style={{ fontSize: 16, fontWeight: "700", color: COLORS.ink }}>
        No orders yet
      </AppText>
      <AppText
        style={{
          fontSize: 13,
          color: COLORS.n600,
          marginTop: 6,
          textAlign: "center",
        }}
      >
        When you place an order, it will show up here.
      </AppText>
    </View>
  );
}

// ─── Screen ─────────────────────────────────────────────────────────────────
export default function OrdersScreen() {
  const { data, isPending } = useOrders();

  // Newest first, regardless of API ordering.
  const orders = useMemo(
    () =>
      [...(data ?? [])].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [data],
  );

  // TODO: route to order details / live tracking once those screens exist.
  const handleOrderPress = (_order: OrderSummary) => {};

  return (
    <SafeAreaView
      edges={["top"]}
      style={{ flex: 1, backgroundColor: COLORS.paper }}
    >
      <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 }}>
        <AppText style={{ fontSize: 22, fontWeight: "700", color: COLORS.ink }}>
          Orders
        </AppText>
      </View>

      <SkeletonProvider active={isPending}>
        <FlatList
          data={isPending ? [] : orders}
          keyExtractor={(order) => order.id}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 32,
            gap: 12,
          }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View>
              <CartCard />
              {orders.length > 0 && !isPending && (
                <AppText
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: COLORS.ink,
                    marginBottom: 12,
                  }}
                >
                  Order history
                </AppText>
              )}
              {isPending && <OrdersSkeleton />}
            </View>
          }
          renderItem={({ item }) => (
            <OrderCard order={item} onPress={handleOrderPress} />
          )}
          ListEmptyComponent={isPending ? null : <EmptyOrders />}
        />
      </SkeletonProvider>
    </SafeAreaView>
  );
}
