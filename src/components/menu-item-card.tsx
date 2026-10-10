import { Item } from "@/app/brand/[id]";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCartStore } from "../store/cartStore";
import { AppText } from "./app-text";

// ─── CravingsNow design tokens — from the style-guide cover frame ──────────
// TODO: extract into a shared `@/constants/theme` file — duplicated across
// every screen/component that references them until that migration happens.
const COLORS = {
  ink: "#1B1B1F",
  n600: "#6E6E76",
  n200: "#E7E4DE",
  n100: "#F1EFEA",
};

// Hermes without the full ICU build doesn't support toLocaleString grouping,
// so comma-separate manually rather than risk "3200" instead of "3,200".
function formatPrice(amount: number) {
  return `₦${Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

export default function MenuItemCard({
  item,
  onPress,
  onAdd,
}: {
  item: Item;
  onPress: () => void;
  onAdd: () => void;
}) {
  const { items, incrementQty, decrementQty, removeFromCart, totalItems } =
    useCartStore();

  // console.log(items);

  const hasAnyOptions = !!item.option?.length;
  const hasRequiredOptions = !!item.option?.some((m) => m.minimumOptions > 0);

  // cartStore keys lines by item id alone — it can't tell two differently
  // configured picks of the same product apart. Only let this row drive a
  // live stepper when there's no required choice it could be misrepresenting.
  const cartLine = hasRequiredOptions
    ? undefined
    : items.find((i) => i.id === item.id);
  const qtyInCart = cartLine?.quantity ?? 0;
  const handleAddPress = () => {
    if (hasRequiredOptions) {
      onPress();
    } else {
      onAdd();
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 14,
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.n100,
      }}
    >
      {/* Bold, large image — the focal point of the row */}
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

      {/* Content column: name+price row, description, then badge+control row */}
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <AppText
            numberOfLines={2}
            style={{
              flex: 1,
              fontSize: 13.5,
              fontWeight: "700",
              color: COLORS.ink,
              lineHeight: 18,
            }}
          >
            {item.name}
          </AppText>
          <AppText
            style={{ fontSize: 12.5, fontWeight: "700", color: COLORS.ink }}
          >
            {formatPrice(item.price)}
          </AppText>
        </View>

        {!!item.desc && (
          <Text
            numberOfLines={2}
            style={{
              fontSize: 11,
              color: COLORS.n600,
              marginTop: 5,
              lineHeight: 15.5,
            }}
          >
            {item.desc}
          </Text>
        )}

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 12,
          }}
        >
          {hasAnyOptions ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                backgroundColor: COLORS.n100,
                borderRadius: 7,
                paddingHorizontal: 8,
                paddingVertical: 4,
              }}
            >
              <Ionicons name="options-outline" size={11} color={COLORS.n600} />
              <Text
                style={{ fontSize: 9.5, fontWeight: "600", color: COLORS.n600 }}
              >
                Customizable
              </Text>
            </View>
          ) : (
            <View />
          )}

          {qtyInCart > 0 ? (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <TouchableOpacity
                onPress={() =>
                  qtyInCart === 1
                    ? removeFromCart(cartLine!.lineId)
                    : decrementQty(cartLine!.lineId)
                }
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: COLORS.n200,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {qtyInCart === 1 ? (
                  <Ionicons name="trash-outline" size={14} color={COLORS.ink} />
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
                {cartLine?.quantity}
              </AppText>
              <TouchableOpacity
                onPress={() => incrementQty(cartLine!.lineId)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: COLORS.ink,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="add" size={17} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleAddPress}
              activeOpacity={0.75}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: COLORS.n100,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="add" size={20} color={COLORS.ink} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
