import { AppText } from "@/components/app-text";
import { fmt } from "@/utils";
import { Href, Link } from "expo-router";
import { TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCartStore } from "../store/cartStore";

// TODO: swap for `@/constants/theme` once the token migration happens.
const COLORS = {
  support: "#0F5257",
};

// Space the bar occupies (bar height + its gap), before the bottom inset.
// Screens add this (plus insets.bottom) to their scroll content's
// paddingBottom so the last row never hides behind the bar.
export const CART_BAR_FOOTPRINT = 92;

interface CartBarProps {
  /** Distance from the bottom edge (before the safe-area inset). */
  bottomOffset?: number;
  /** Add the device's bottom inset. Turn off on screens whose parent (e.g.
   * the tab bar) already sits above the home indicator. */
  respectSafeArea?: boolean;
}

export default function CartBar({
  bottomOffset = 16,
  respectSafeArea = true,
}: CartBarProps) {
  const insets = useSafeAreaInsets();
  const { items, totalPrice } = useCartStore();

  if (items.length === 0) return null;

  return (
    <Link href={"/cart" as Href} asChild>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="View cart"
        style={{
          position: "absolute",
          left: 16,
          right: 16,
          bottom: bottomOffset + (respectSafeArea ? insets.bottom : 0),
          backgroundColor: COLORS.support,
          borderRadius: 16,
          paddingVertical: 14,
          paddingHorizontal: 18,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          shadowColor: COLORS.support,
          shadowOpacity: 0.35,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
          elevation: 6,
        }}
      >
        <AppText style={{ color: "#fff", fontSize: 12.5, fontWeight: "600" }}>
          {items.length} {items.length === 1 ? "item" : "items"} ·{" "}
          {fmt(totalPrice())}
        </AppText>
        <AppText style={{ color: "#fff", fontSize: 12.5, fontWeight: "700" }}>
          View cart →
        </AppText>
      </TouchableOpacity>
    </Link>
  );
}
