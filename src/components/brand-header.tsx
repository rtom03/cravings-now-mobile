import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Animated,
  LayoutChangeEvent,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "./app-text";

const HERO_HEIGHT = 200;

interface BrandHeaderProps {
  brandName: string;
  scrollY: Animated.Value;
  /** Fires once (and whenever the header's real rendered height changes,
   * e.g. on rotation) — this is the actual measured height, not a guessed
   * constant, so anything positioning itself relative to this header (the
   * category tab bar overlay) is always correct regardless of device
   * notch/status-bar size. */
  onHeightChange?: (height: number) => void;
  /** Fires when the search icon is tapped. */
  onSearchPress?: () => void;
}

const BrandHeader = ({
  brandName,
  scrollY,
  onHeightChange,
  onSearchPress,
}: BrandHeaderProps) => {
  const insets = useSafeAreaInsets();

  const backgroundColor = scrollY.interpolate({
    inputRange: [HERO_HEIGHT - 10, HERO_HEIGHT],
    outputRange: ["rgba(255,255,255,0)", "rgba(255,255,255,1)"],
    extrapolate: "clamp",
  });

  // Same crossfade window as the background color — the clip-line and the
  // solid background appear together, not on separate/mismatched timings.
  const clipLineOpacity = scrollY.interpolate({
    inputRange: [HERO_HEIGHT - 10, HERO_HEIGHT],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const handleLayout = (event: LayoutChangeEvent) => {
    onHeightChange?.(event.nativeEvent.layout.height);
  };

  return (
    <Animated.View
      onLayout={handleLayout}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor,
        paddingTop: insets.top + 15,
        paddingBottom: 8,
        paddingHorizontal: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          backgroundColor: "#f2f2f2",
          borderRadius: 20,
          width: 36,
          height: 36,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="chevron-back" size={22} color="#1a1a1a" />
      </TouchableOpacity>

      <Animated.View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 14,
          alignItems: "center",
          justifyContent: "center",
          opacity: clipLineOpacity,
        }}
      >
        <AppText>{brandName}</AppText>
      </Animated.View>

      {/* Top-right: search, heart, more */}
      <View
        style={{
          position: "absolute",
          right: 16,
          bottom: 8,
          flexDirection: "row",
          gap: 8,
        }}
      >
        {(
          [
            { icon: "search", onPress: onSearchPress },
            { icon: "heart-outline", onPress: undefined }, // TODO: favourites
          ] as const
        ).map(({ icon, onPress }) => (
          <TouchableOpacity
            key={icon}
            onPress={onPress}
            style={{
              backgroundColor: "#f2f2f2",
              borderRadius: 20,
              width: 36,
              height: 36,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name={icon} size={18} color="#1a1a1a" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Clip line — a defined bottom edge once the header goes solid, so
          content scrolling underneath is cleanly cut off rather than
          disappearing under a flat, edgeless rectangle. */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 1,
          backgroundColor: "#e5e5e5",
          opacity: clipLineOpacity,
        }}
      />
    </Animated.View>
  );
};

export default BrandHeader;
