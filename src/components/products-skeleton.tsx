import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  AccessibilityInfo,
  Animated,
  DimensionValue,
  Easing,
  StyleProp,
  View,
  ViewStyle,
} from "react-native";

// TODO: swap for `@/constants/theme` once the token migration happens.
const COLORS = {
  paper: "#F7F6F3",
  n200: "#E7E4DE",
};

const PULSE_DURATION_MS = 850;
const PULSE_MIN_OPACITY = 0.45;

// ─── One shared pulse for the whole tree ───────────────────────────────────
// Every Bone reads the same Animated.Value, so they all breathe in sync and
// there is exactly one native-driven loop no matter how many bones render.
const PulseContext = createContext<Animated.Value | null>(null);

export function SkeletonProvider({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) return;

    let cancelled = false;
    let loop: Animated.CompositeAnimation | null = null;

    // Respect the OS "reduce motion" setting: bones stay static.
    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (cancelled || reduceMotion) return;

      const step = (toValue: number) =>
        Animated.timing(pulse, {
          toValue,
          duration: PULSE_DURATION_MS,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        });

      loop = Animated.loop(Animated.sequence([step(1), step(0)]));
      loop.start();
    });

    return () => {
      cancelled = true;
      loop?.stop();
      pulse.setValue(0);
    };
  }, [active, pulse]);

  return (
    <PulseContext.Provider value={pulse}>{children}</PulseContext.Provider>
  );
}

// ─── Bone: the only primitive ──────────────────────────────────────────────
export function Bone({
  width = "100%",
  height,
  radius = 8,
  style,
}: {
  width?: DimensionValue;
  height: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const pulse = useContext(PulseContext);

  const opacity = useMemo(
    () =>
      pulse
        ? pulse.interpolate({
            inputRange: [0, 1],
            outputRange: [1, PULSE_MIN_OPACITY],
          })
        : 1,
    [pulse],
  );

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: COLORS.n200,
          opacity,
        },
        style,
      ]}
    />
  );
}

// ─── Composed skeletons for DetailsScreen ──────────────────────────────────

const TAB_WIDTHS = [64, 88, 72, 80];
const SECTION_ITEM_COUNTS = [3, 2, 2];

export const CategoryTabsSkeleton = React.memo(function CategoryTabsSkeleton() {
  return (
    <View
      style={{ flexDirection: "row", paddingHorizontal: 12 }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {TAB_WIDTHS.map((width, i) => (
        <View
          key={i}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 2.5,
            borderBottomColor: "transparent",
            marginRight: 4,
          }}
        >
          <Bone width={width} height={16} radius={6} />
        </View>
      ))}
    </View>
  );
});

function ItemRowSkeleton() {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 10,
        gap: 14,
      }}
    >
      <View style={{ flex: 1, gap: 8, paddingTop: 4 }}>
        <Bone width="70%" height={14} radius={6} />
        <Bone width="95%" height={10} radius={5} />
        <Bone width="60%" height={10} radius={5} />
        <Bone width={56} height={14} radius={6} style={{ marginTop: 6 }} />
      </View>
      <Bone width={104} height={104} radius={14} />
    </View>
  );
}

export const MenuSectionsSkeleton = React.memo(function MenuSectionsSkeleton() {
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Loading menu"
    >
      {SECTION_ITEM_COUNTS.map((count, s) => (
        <View key={s} style={{ paddingTop: 20 }}>
          <View style={{ paddingHorizontal: 20, marginBottom: 8 }}>
            <Bone width={120} height={14} radius={6} />
          </View>
          <View style={{ paddingHorizontal: 10, paddingVertical: 5, gap: 12 }}>
            {Array.from({ length: count }, (_, i) => (
              <ItemRowSkeleton key={i} />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
});
