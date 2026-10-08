import { Ionicons } from "@expo/vector-icons";
import SafeModal from "./shared/safe-modal";
import { Item, ProductOption } from "@/app/brand/[id]";
import React, { useCallback, useEffect, useState } from "react";
import {
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
import { ProductModifier } from "@/types/product";

// ─── CravingsNow design tokens — from the style-guide cover frame ──────────
// TODO: extract into a shared `@/constants/theme` file — duplicated across
// every screen/component that references them until that migration happens.
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

interface DealBottomSheetProps {
  deal?: Item | null;
  visible: boolean;
  onClose: () => void;
  onQuantityChange?: (quantity: number) => void;
  onAddToCart?: (
    selectedQuantities: Record<string, Record<string, number>>,
  ) => void;
}

// Hermes without the full ICU build doesn't support toLocaleString grouping,
// so comma-separate manually rather than risk "15300" instead of "15,300".
function formatPrice(amount: number) {
  return `₦${Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

// "Choose 1", "Choose 2 items", "Choose up to 3", "Choose 1–3" — whatever
// reads most naturally for the modifier's own min/max, without inventing
// wording the data doesn't support.
function describeModifier(modifier: ProductModifier): string {
  const { minimumOptions, maximumOptions } = modifier;
  if (maximumOptions <= 1) return "Choose 1";
  if (minimumOptions === maximumOptions)
    return `Choose ${maximumOptions} items`;
  if (minimumOptions > 0) return `Choose ${minimumOptions}–${maximumOptions}`;
  return `Choose up to ${maximumOptions}`;
}

// Stable reference for "this modifier has no selections yet" — reused
// instead of a fresh `{}` literal every render. A new object every render
// would defeat ModifierSection's memoization below: React.memo does a
// shallow prop comparison, so a brand-new (even if empty) object looks
// like "changed" every single time, and the section would re-render on
// every tap regardless of which modifier it belonged to.
const EMPTY_QUANTITIES: Record<string, number> = {};

export default function ItemDetailSheet(props: DealBottomSheetProps) {
  // console.log(props);
  return (
    <SafeModal
      visible={props.visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={props.onClose}
    >
      {/* Rendered as SafeModal's children — i.e. actually inside the
          SafeAreaProvider it nests inside the Modal. useSafeAreaInsets()
          has to be called from here, not from ItemDetailSheet itself, or
          it resolves against whatever screen is behind the modal instead
          of the modal's own native surface. */}
      <ItemDetailSheetContent {...props} />
    </SafeModal>
  );
}

// ─── Memoized leaf: a single option's row ──────────────────────────────────
// Only re-renders when ITS OWN quantity/cap/disabled state actually
// changes — not whenever a sibling option or a different modifier changes.
const OptionRow = React.memo(function OptionRow({
  option,
  quantity,
  isMultiSelect,
  atCap,
  onIncrement,
  onDecrement,
  onToggle,
}: {
  option: ProductOption;
  quantity: number;
  isMultiSelect: boolean;
  atCap: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
  onToggle: () => void;
}) {
  const selected = quantity > 0;
  const disabled = !option.isActive || !option.isInStock;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 13,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.n100,
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 12.5, fontWeight: "500", color: COLORS.ink }}>
          {option.name}
        </Text>
        {!option.isInStock && (
          <Text style={{ fontSize: 10.5, color: COLORS.signal, marginTop: 2 }}>
            Unavailable
          </Text>
        )}
        {option.price > 0 && (
          <Text style={{ fontSize: 11, color: COLORS.n600, marginTop: 2 }}>
            +{formatPrice(option.price)}
          </Text>
        )}
      </View>

      {isMultiSelect ? (
        // Repeatable: a real stepper, because the same option can be
        // picked more than once.
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <TouchableOpacity
            disabled={disabled || quantity === 0}
            onPress={onDecrement}
            style={{
              width: 24,
              height: 24,
              borderRadius: 7,
              borderWidth: 1,
              borderColor: COLORS.n200,
              alignItems: "center",
              justifyContent: "center",
              opacity: quantity === 0 ? 0.4 : 1,
            }}
          >
            <Text style={{ fontSize: 13, color: COLORS.ink }}>−</Text>
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 12.5,
              fontWeight: "700",
              color: COLORS.ink,
              minWidth: 14,
              textAlign: "center",
            }}
          >
            {quantity}
          </Text>
          <TouchableOpacity
            disabled={disabled || atCap}
            onPress={onIncrement}
            style={{
              width: 24,
              height: 24,
              borderRadius: 7,
              backgroundColor: atCap ? COLORS.n200 : COLORS.signal,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 13, color: "#fff" }}>+</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Radio: the plain checkmark circle — "choose 1" has no quantity
        // to show.
        <TouchableOpacity
          disabled={disabled}
          onPress={onToggle}
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            borderWidth: 1.5,
            borderColor: selected ? COLORS.signal : COLORS.n200,
            backgroundColor: selected ? COLORS.signal : "transparent",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {selected && (
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>
              ✓
            </Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
});

// ─── Memoized: one modifier's header + its option rows ─────────────────────
// Receives only ITS OWN slice of selections, not the whole selection
// state — so when one modifier changes, every sibling modifier's props
// stay referentially identical and React skips re-rendering them entirely.
// This, plus OptionRow above, is what actually fixes the lag: before this,
// every tap re-rendered the ENTIRE sheet — every modifier, every option,
// every inline style object recomputed from scratch. On a real device
// that's slow enough that a second tap can land before the first one's
// result has painted, which reads as "press once, nothing happens; press
// again, it jumps" — not a logic bug, a rendering-cost bug.
const ModifierSection = React.memo(function ModifierSection({
  modifier,
  quantities,
  onChange,
}: {
  modifier: ProductModifier;
  quantities: Record<string, number>;
  onChange: (modifierId: string, optionId: string, delta: 1 | -1) => void;
}) {
  const isMultiSelect = modifier.maximumOptions > 1;
  const total = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
  const satisfied = total >= modifier.minimumOptions;
  const atCap = total >= modifier.maximumOptions;

  return (
    <View>
      <View
        style={{ height: 8, backgroundColor: COLORS.n100, marginTop: 16 }}
      />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 4,
        }}
      >
        <View>
          <Text
            style={{ fontSize: 13.5, fontWeight: "700", color: COLORS.ink }}
          >
            {modifier.name}
          </Text>
          <Text style={{ fontSize: 11, color: COLORS.n600, marginTop: 3 }}>
            {describeModifier(modifier)}
          </Text>
        </View>
        {modifier.minimumOptions > 0 && (
          <View
            style={{
              // Signal-tinted while unsatisfied so the exact section
              // still blocking Add to cart is obvious at a glance.
              backgroundColor: satisfied ? COLORS.n100 : "#FBE3E9",
              borderRadius: 7,
              paddingHorizontal: 9,
              paddingVertical: 4,
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: "600",
                color: satisfied ? COLORS.n600 : COLORS.signal,
              }}
            >
              Required
            </Text>
          </View>
        )}
      </View>
      {modifier.options.map((option) => {
        const quantity = quantities[option.id] ?? 0;
        return (
          <OptionRow
            key={option.id}
            option={option}
            quantity={quantity}
            isMultiSelect={isMultiSelect}
            atCap={atCap}
            onIncrement={() => onChange(modifier.id, option.id, 1)}
            onDecrement={() => onChange(modifier.id, option.id, -1)}
            onToggle={() =>
              onChange(modifier.id, option.id, quantity > 0 ? -1 : 1)
            }
          />
        );
      })}
    </View>
  );
});

function ItemDetailSheetContent({
  deal,
  onClose,
  onQuantityChange,
  onAddToCart,
}: DealBottomSheetProps) {
  const insets = useSafeAreaInsets();

  // modifierId -> (optionId -> quantity). Each chosen option carries its
  // own count, so the same option can be picked more than once — a
  // modifier's "how many have I picked" is the sum of those counts.
  const [selectedQuantities, setSelectedQuantities] = useState<
    Record<string, Record<string, number>>
  >({});

  // Nothing is pre-selected — every option starts untouched and the person
  // picks their own. Required modifiers are enforced the other way around:
  // canAddToCart stays false, the "Required" pill stays signal-tinted, and
  // the button stays disabled with a "Select …" label until they've chosen
  // enough themselves.
  useEffect(() => {
    setSelectedQuantities({});
  }, [deal?.id]);

  // Wrapped in useCallback so its identity stays stable across renders —
  // that's what lets ModifierSection's memoization above actually work.
  // If this were redefined fresh every render (as it was before), every
  // ModifierSection would see a "new" onChange prop each time and
  // React.memo would never be able to bail out, silently undoing the
  // whole optimization.
  const changeOptionQuantity = useCallback(
    (modifierId: string, optionId: string, delta: 1 | -1) => {
      setSelectedQuantities((prev) => {
        const modifier = deal?.option.find((m) => m.id === modifierId);
        if (!modifier) return prev;

        const current = prev[modifierId] ?? EMPTY_QUANTITIES;
        const currentQty = current[optionId] ?? 0;
        const total = Object.values(current).reduce((sum, qty) => sum + qty, 0);

        // Editing is never blocked by the modifier's minimum — only by
        // what's physically possible (can't go below 0, can't exceed the
        // max). Required-ness is enforced once, at submit time, by
        // canAddToCart below. Blocking decrements at the floor used to
        // double-enforce the same rule mid-edit, which is exactly what
        // caused the gridlock: when minimumOptions === maximumOptions,
        // being at the required count also means being at the cap, so
        // every "+" was disabled (full) AND every "−" was disabled
        // (floor) at once — swapping one pick for another needs a
        // decrement-then-increment, and the decrement half was the one
        // step being refused. Letting the floor go unenforced mid-edit is
        // what makes that swap possible again.
        if (modifier.maximumOptions <= 1) {
          if (delta < 0) {
            return { ...prev, [modifierId]: {} };
          }
          return { ...prev, [modifierId]: { [optionId]: 1 } };
        }

        if (delta > 0) {
          if (total >= modifier.maximumOptions) return prev; // modifier is full
          return {
            ...prev,
            [modifierId]: { ...current, [optionId]: currentQty + 1 },
          };
        }

        // delta < 0
        if (currentQty <= 0) return prev;

        const updated = { ...current, [optionId]: currentQty - 1 };
        if (updated[optionId] === 0) delete updated[optionId];
        return { ...prev, [modifierId]: updated };
      });
    },
    [deal?.option],
  );

  const hasOptions = !!deal?.option?.length;

  const isModifierSatisfied = (modifier: ProductModifier): boolean =>
    Object.values(selectedQuantities[modifier.id] ?? EMPTY_QUANTITIES).reduce(
      (sum, qty) => sum + qty,
      0,
    ) >= modifier.minimumOptions;

  const unsatisfiedModifiers = (deal?.option ?? []).filter(
    (modifier) => !isModifierSatisfied(modifier),
  );
  const canAddToCart = unsatisfiedModifiers.length === 0;

  const optionsTotal = (deal?.option ?? []).reduce((sum, modifier) => {
    const quantities = selectedQuantities[modifier.id] ?? EMPTY_QUANTITIES;
    const modifierTotal = modifier.options.reduce((s, option) => {
      const qty = quantities[option.id] ?? 0;
      return s + option.price * qty;
    }, 0);
    return sum + modifierTotal;
  }, 0);

  const unitPrice = (deal?.price ?? 0) + optionsTotal;
  const total = unitPrice * (deal?.quantity ?? 1);

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={{ flex: 1, backgroundColor: COLORS.paper }}
    >
      <StatusBar barStyle="dark-content" />

      <View style={{ height: 230, backgroundColor: "#fff" }}>
        <TouchableOpacity
          onPress={onClose}
          style={{
            position: "absolute",
            top: insets.top + 16,
            left: 16,
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: COLORS.n100,
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          <Ionicons name="close" size={16} color={COLORS.ink} />
        </TouchableOpacity>

        {deal?.img ? (
          <Image
            source={{ uri: deal.img }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="contain"
          />
        ) : (
          <View
            style={{
              width: "100%",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 40 }}>🍽️</Text>
          </View>
        )}

        <View
          style={{
            position: "absolute",
            alignSelf: "center",
            bottom: 10,
            width: 44,
            height: 5,
            borderRadius: 3,
            backgroundColor: "rgba(0,0,0,0.15)",
          }}
        />
      </View>

      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.surface,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          marginTop: -20,
        }}
      >
        <ScrollView
          style={{ flex: 1 }}
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: 22,
            paddingBottom: 96 + insets.bottom,
          }}
        >
          <View style={{ paddingHorizontal: 20 }}>
            <Text
              style={{
                fontSize: 19,
                fontWeight: "700",
                color: COLORS.ink,
                marginBottom: 6,
              }}
            >
              {deal?.name}
            </Text>

            <Text
              style={{ fontSize: 15, fontWeight: "700", color: COLORS.ink }}
            >
              {formatPrice(unitPrice)}
            </Text>

            {!!deal?.desc && (
              <Text
                style={{
                  fontSize: 12,
                  color: COLORS.n600,
                  marginTop: 10,
                  lineHeight: 18,
                }}
              >
                {deal.desc}
              </Text>
            )}
          </View>

          {hasOptions &&
            deal!.option.map((modifier) => (
              <ModifierSection
                key={modifier.id}
                modifier={modifier}
                quantities={selectedQuantities[modifier.id] ?? EMPTY_QUANTITIES}
                onChange={changeOptionQuantity}
              />
            ))}

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              paddingTop: 20,
            }}
          >
            <TouchableOpacity
              onPress={() =>
                onQuantityChange?.(Math.max(1, (deal?.quantity || 1) - 1))
              }
              style={{
                width: 30,
                height: 30,
                borderRadius: 9,
                borderWidth: 1,
                borderColor: COLORS.n200,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 18, color: COLORS.ink, lineHeight: 20 }}>
                −
              </Text>
            </TouchableOpacity>
            <Text
              style={{
                fontSize: 15,
                fontWeight: "700",
                color: COLORS.ink,
                minWidth: 20,
                textAlign: "center",
              }}
            >
              {deal?.quantity || 1}
            </Text>
            <TouchableOpacity
              onPress={() =>
                onQuantityChange?.(Math.max(1, (deal?.quantity || 1) + 1))
              }
              style={{
                width: 30,
                height: 30,
                borderRadius: 9,
                borderWidth: 1,
                borderColor: COLORS.n200,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 18, color: COLORS.ink, lineHeight: 20 }}>
                +
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <TouchableOpacity
          onPress={() => {
            if (!canAddToCart) return;
            onAddToCart?.(selectedQuantities);
          }}
          disabled={!canAddToCart}
          activeOpacity={0.85}
          style={{
            position: "absolute",
            left: 16,
            right: 16,
            bottom: 16 + insets.bottom,
            backgroundColor: canAddToCart ? COLORS.signal : COLORS.n200,
            borderRadius: 16,
            paddingVertical: 15,
            alignItems: "center",
            shadowColor: COLORS.signal,
            shadowOpacity: canAddToCart ? 0.35 : 0,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: canAddToCart ? 6 : 0,
          }}
        >
          <Text
            style={{
              color: canAddToCart ? "#fff" : COLORS.n600,
              fontSize: 13.5,
              fontWeight: "700",
            }}
          >
            {canAddToCart
              ? `Add ${deal?.quantity ?? 1} for ${formatPrice(total)}`
              : `Select ${unsatisfiedModifiers[0]?.name ?? "required options"}`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
