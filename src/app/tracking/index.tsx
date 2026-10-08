import { AppText } from "@/components/app-text";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  Linking,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── CravingsNow design tokens — from the style-guide cover frame ──────────
// TODO: extract into a shared `@/constants/theme` file — duplicated across
// every screen/component that references them until that migration happens.
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
} as const;

// ─── Types ──────────────────────────────────────────────────────────────────

type StepStatus = "done" | "upcoming";

interface TrackingStep {
  id: string;
  title: string;
  time: string;
  status: StepStatus;
}

interface Courier {
  name: string;
  vehicle: string;
  rating: number;
  phone?: string;
}

interface TrackingData {
  etaMinutes: number;
  arrivalTime: string;
  courier: Courier;
  steps: TrackingStep[];
}

interface Point {
  x: number;
  y: number;
}

// TODO: no order-tracking source exists yet — replace with real data
// (polling or a socket subscription, keyed by the order being tracked).
// This mirrors the sample content in the design frame so the layout can be
// built and checked in the meantime.
const TRACKING: TrackingData = {
  etaMinutes: 12,
  arrivalTime: "9:53 PM",
  courier: { name: "Tunde A.", vehicle: "Honda", rating: 4.9 },
  steps: [
    {
      id: "confirmed",
      title: "Order confirmed",
      time: "9:31 PM",
      status: "done",
    },
    {
      id: "preparing",
      title: "Preparing your order",
      time: "9:34 PM",
      status: "done",
    },
    {
      id: "picked-up",
      title: "Courier picked up",
      time: "9:44 PM",
      status: "done",
    },
    {
      id: "delivered",
      title: "Delivered",
      time: "Est. 9:53 PM",
      status: "upcoming",
    },
  ],
};

const MAP_HEIGHT = 280;
const GRID_SIZE = 26;
const PIN_SIZE = 30;
const SCREEN_WIDTH = Dimensions.get("window").width;

// Pin positions as fractions of the map, so they sit in the same place on
// any screen width instead of the fixed pixel offsets the 300px-wide design
// frame used.
const COURIER_PIN: Point = { x: SCREEN_WIDTH * 0.14, y: 62 };
const DESTINATION_PIN: Point = { x: SCREEN_WIDTH * 0.58, y: 205 };

// ─── Map pieces ─────────────────────────────────────────────────────────────

// Flat grid standing in for a real map, as in the design frame. Memoized —
// it never changes, so there's no reason to rebuild ~25 views on every
// re-render of the screen.
const MapGrid = React.memo(function MapGrid() {
  const columns = Math.ceil(SCREEN_WIDTH / GRID_SIZE);
  const rows = Math.ceil(MAP_HEIGHT / GRID_SIZE);

  return (
    <>
      {Array.from({ length: columns }, (_, i) => (
        <View
          key={`v${i}`}
          style={{
            position: "absolute",
            left: i * GRID_SIZE,
            top: 0,
            bottom: 0,
            width: 1,
            backgroundColor: COLORS.n200,
          }}
        />
      ))}
      {Array.from({ length: rows }, (_, i) => (
        <View
          key={`h${i}`}
          style={{
            position: "absolute",
            top: i * GRID_SIZE,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: COLORS.n200,
          }}
        />
      ))}
    </>
  );
});

// A straight line between two pin centers — length and angle are computed
// from the points, so it always connects them regardless of screen width.
function RouteLine({ from, to }: { from: Point; to: Point }) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx);
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;

  return (
    <View
      style={{
        position: "absolute",
        left: midX - length / 2,
        top: midY - 1.25,
        width: length,
        height: 2.5,
        borderRadius: 2,
        backgroundColor: COLORS.support,
        opacity: 0.5,
        transform: [{ rotate: `${angle}rad` }],
      }}
    />
  );
}

interface PinProps {
  position: Point;
  emoji: string;
  color: string;
}

function Pin({ position, emoji, color }: PinProps) {
  return (
    <View
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        width: PIN_SIZE,
        height: PIN_SIZE,
        borderRadius: PIN_SIZE / 2,
        borderBottomLeftRadius: 0,
        backgroundColor: color,
        alignItems: "center",
        justifyContent: "center",
        transform: [{ rotate: "-45deg" }],
        shadowColor: color,
        shadowOpacity: 0.4,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
      }}
    >
      <Text style={{ fontSize: 13, transform: [{ rotate: "45deg" }] }}>
        {emoji}
      </Text>
    </View>
  );
}

// ─── Card pieces ────────────────────────────────────────────────────────────

interface ActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

function ActionButton({ icon, onPress }: ActionButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: COLORS.ink,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Ionicons name={icon} size={15} color="#fff" />
    </TouchableOpacity>
  );
}

interface TimelineItemProps {
  step: TrackingStep;
  isLast: boolean;
}

function TimelineItem({ step, isLast }: TimelineItemProps) {
  const done = step.status === "done";

  return (
    <View
      style={{ flexDirection: "row", gap: 12, paddingBottom: isLast ? 0 : 18 }}
    >
      {/* Connector to the next step */}
      {!isLast && (
        <View
          style={{
            position: "absolute",
            left: 8,
            top: 20,
            bottom: 0,
            width: 2,
            backgroundColor: COLORS.n200,
          }}
        />
      )}

      <View
        style={{
          width: 18,
          height: 18,
          borderRadius: 9,
          backgroundColor: done ? COLORS.success : COLORS.n200,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {done && <Ionicons name="checkmark" size={11} color="#fff" />}
      </View>

      <View>
        <AppText
          style={{
            fontSize: 12.5,
            fontWeight: "700",
            color: done ? COLORS.ink : COLORS.n300,
          }}
        >
          {step.title}
        </AppText>
        <AppText
          style={{
            fontSize: 10.5,
            marginTop: 2,
            color: done ? COLORS.n600 : COLORS.n300,
          }}
        >
          {step.time}
        </AppText>
      </View>
    </View>
  );
}

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function TrackingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { etaMinutes, arrivalTime, courier, steps } = TRACKING;

  const handleCall = () => {
    // TODO: courier phone comes from the real tracking data once it exists.
    if (courier.phone) Linking.openURL(`tel:${courier.phone}`);
  };

  const handleMessage = () => {
    // TODO: no courier chat exists yet.
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.paper }}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />

      {/* ── Map ── */}
      <View
        style={{
          height: MAP_HEIGHT,
          backgroundColor: COLORS.n100,
          overflow: "hidden",
        }}
      >
        {/* TODO: swap for a real map once there's a free tile source — kept
            as the same flat grid used in the design frame for now. */}
        <MapGrid />
        <RouteLine
          from={{
            x: COURIER_PIN.x + PIN_SIZE / 2,
            y: COURIER_PIN.y + PIN_SIZE / 2,
          }}
          to={{
            x: DESTINATION_PIN.x + PIN_SIZE / 2,
            y: DESTINATION_PIN.y + PIN_SIZE / 2,
          }}
        />
        <Pin position={COURIER_PIN} emoji="🛵" color={COLORS.signal} />
        <Pin position={DESTINATION_PIN} emoji="🏠" color={COLORS.support} />

        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            position: "absolute",
            top: insets.top + 16,
            left: 16,
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: "rgba(255,255,255,0.92)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="chevron-back" size={16} color={COLORS.ink} />
        </TouchableOpacity>
      </View>

      {/* ── Tracking card ── */}
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.surface,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          marginTop: -22,
        }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 24 + insets.bottom,
          }}
        >
          {/* ETA */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}
            >
              <AppText
                style={{
                  fontSize: 34,
                  fontWeight: "700",
                  color: COLORS.ink,
                  lineHeight: 36,
                }}
              >
                {etaMinutes}
              </AppText>
              <AppText
                style={{ fontSize: 13, fontWeight: "600", color: COLORS.n600 }}
              >
                min
              </AppText>
            </View>
            <AppText style={{ fontSize: 11, color: COLORS.n600 }}>
              Arriving {arrivalTime}
            </AppText>
          </View>

          {/* Courier */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              backgroundColor: COLORS.n100,
              borderRadius: 16,
              padding: 14,
              marginTop: 18,
            }}
          >
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                backgroundColor: COLORS.warn,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 18 }}>🙂</Text>
            </View>
            <View style={{ flex: 1 }}>
              <AppText
                style={{ fontSize: 13, fontWeight: "700", color: COLORS.ink }}
              >
                {courier.name}
              </AppText>
              <AppText
                style={{ fontSize: 11, color: COLORS.n600, marginTop: 2 }}
              >
                {courier.vehicle} · ★ {courier.rating.toFixed(1)}
              </AppText>
            </View>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <ActionButton icon="call-outline" onPress={handleCall} />
              <ActionButton icon="chatbubble-outline" onPress={handleMessage} />
            </View>
          </View>

          {/* Timeline */}
          <View style={{ marginTop: 20 }}>
            {steps.map((step, index) => (
              <TimelineItem
                key={step.id}
                step={step}
                isLast={index === steps.length - 1}
              />
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
