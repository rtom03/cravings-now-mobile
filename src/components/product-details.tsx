// import { Ionicons } from "@expo/vector-icons";
// import SafeModal from "./shared/safe-modal";

// import { Item, ProductModifier } from "@/app/brand/[id]";
// import { useEffect, useState } from "react";
// import {
//   Image,
//   ScrollView,
//   StatusBar,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import {
//   SafeAreaView,
//   useSafeAreaInsets,
// } from "react-native-safe-area-context";

// // ─── CravingsNow design tokens — from the style-guide cover frame ──────────
// // TODO: extract into a shared `@/constants/theme` file — duplicated across
// // every screen/component that references them until that migration happens.
// const COLORS = {
//   ink: "#1B1B1F",
//   paper: "#F7F6F3",
//   surface: "#FFFFFF",
//   signal: "#E63462",
//   support: "#0F5257",
//   n600: "#6E6E76",
//   n300: "#B9B7B2",
//   n200: "#E7E4DE",
//   n100: "#F1EFEA",
// };

// interface DealBottomSheetProps {
//   deal?: (Item & { qty: number }) | null;
//   visible: boolean;
//   quantity: number;
//   onClose: () => void;
//   onQuantityChange?: (qty: number) => void;
//   onAddToCart?: (selectedOptions: Record<string, string[]>) => void;
// }

// // Hermes without the full ICU build doesn't support toLocaleString grouping,
// // so comma-separate manually rather than risk "15300" instead of "15,300".
// function formatPrice(amount: number) {
//   return `₦${Math.round(amount)
//     .toString()
//     .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
// }

// // "Choose 1", "Choose 2 items", "Choose up to 3", "Choose 1–3" — whatever
// // reads most naturally for the modifier's own min/max, without inventing
// // wording the data doesn't support.
// function describeModifier(modifier: ProductModifier): string {
//   const { minimumOptions, maximumOptions } = modifier;
//   if (maximumOptions <= 1) return "Choose 1";
//   if (minimumOptions === maximumOptions)
//     return `Choose ${maximumOptions} items`;
//   if (minimumOptions > 0) return `Choose ${minimumOptions}–${maximumOptions}`;
//   return `Choose up to ${maximumOptions}`;
// }

// export default function ItemDetailSheet(props: DealBottomSheetProps) {
//   return (
//     <SafeModal
//       visible={props.visible}
//       animationType="slide"
//       presentationStyle="fullScreen"
//       onRequestClose={props.onClose}
//     >
//       {/* Rendered as SafeModal's children — i.e. actually inside the
//           SafeAreaProvider it nests inside the Modal. useSafeAreaInsets()
//           has to be called from here, not from ItemDetailSheet itself, or
//           it resolves against whatever screen is behind the modal instead
//           of the modal's own native surface. */}
//       <ItemDetailSheetContent {...props} />
//     </SafeModal>
//   );
// }

// function ItemDetailSheetContent({
//   deal,
//   onClose,
//   onQuantityChange,
//   onAddToCart,
// }: DealBottomSheetProps) {
//   const insets = useSafeAreaInsets();

//   // modifierId -> selected optionIds. A modifier with maximumOptions <= 1
//   // behaves like a radio group (picking one replaces the other); anything
//   // higher behaves like checkboxes capped at that count.
//   const [selectedOptions, setSelectedOptions] = useState<
//     Record<string, string[]>
//   >({});

//   // Pre-fill up to `minimumOptions` in-stock options per modifier whenever
//   // a new item opens — satisfies required modifiers by default and keeps
//   // the price from looking incomplete, without touching modifiers that are
//   // genuinely optional (minimumOptions 0).
//   useEffect(() => {
//     if (!deal?.option?.length) {
//       setSelectedOptions({});
//       return;
//     }
//     const defaults: Record<string, string[]> = {};
//     deal.option.forEach((modifier) => {
//       if (modifier.minimumOptions > 0) {
//         const available = modifier.options.filter((o) => o.isInStock);
//         defaults[modifier.id] = available
//           .slice(0, modifier.minimumOptions)
//           .map((o) => o.id);
//       } else {
//         defaults[modifier.id] = [];
//       }
//     });
//     setSelectedOptions(defaults);
//   }, [deal?.id]);

//   const toggleOption = (modifier: ProductModifier, optionId: string) => {
//     setSelectedOptions((prev) => {
//       const current = prev[modifier.id] ?? [];
//       const isSelected = current.includes(optionId);

//       if (modifier.maximumOptions <= 1) {
//         // Radio behavior — picking one always replaces whatever was there.
//         return { ...prev, [modifier.id]: isSelected ? [] : [optionId] };
//       }

//       if (isSelected) {
//         return {
//           ...prev,
//           [modifier.id]: current.filter((id) => id !== optionId),
//         };
//       }

//       if (current.length >= modifier.maximumOptions) {
//         // At the cap — ignore the tap rather than silently bumping an
//         // existing pick off; the person can deselect one first.
//         return prev;
//       }

//       return { ...prev, [modifier.id]: [...current, optionId] };
//     });
//   };

//   const hasOptions = !!deal?.option?.length;

//   const optionsTotal = (deal?.option ?? []).reduce((sum, modifier) => {
//     const selectedIds = selectedOptions[modifier.id] ?? [];
//     const modifierTotal = modifier.options
//       .filter((o) => selectedIds.includes(o.id))
//       .reduce((s, o) => s + o.price, 0);
//     return sum + modifierTotal;
//   }, 0);

//   const unitPrice = (deal?.price ?? 0) + optionsTotal;
//   const total = unitPrice * (deal?.qty ?? 1);

//   return (
//     <SafeAreaView
//       edges={["top", "bottom"]}
//       style={{ flex: 1, backgroundColor: COLORS.paper }}
//     >
//       <StatusBar barStyle="dark-content" />

//       <View style={{ height: 230, backgroundColor: "#fff" }}>
//         <TouchableOpacity
//           onPress={onClose}
//           style={{
//             position: "absolute",
//             top: insets.top + 16,
//             left: 16,
//             width: 34,
//             height: 34,
//             borderRadius: 17,
//             backgroundColor: COLORS.n100,
//             alignItems: "center",
//             justifyContent: "center",
//             zIndex: 10,
//           }}
//         >
//           <Ionicons name="close" size={16} color={COLORS.ink} />
//         </TouchableOpacity>

//         {deal?.img ? (
//           <Image
//             source={{ uri: deal.img }}
//             style={{ width: "100%", height: "100%" }}
//             resizeMode="contain"
//           />
//         ) : (
//           <View
//             style={{
//               width: "100%",
//               height: "100%",
//               alignItems: "center",
//               justifyContent: "center",
//             }}
//           >
//             <Text style={{ fontSize: 40 }}>🍽️</Text>
//           </View>
//         )}

//         <View
//           style={{
//             position: "absolute",
//             alignSelf: "center",
//             bottom: 10,
//             width: 44,
//             height: 5,
//             borderRadius: 3,
//             backgroundColor: "rgba(0,0,0,0.15)",
//           }}
//         />
//       </View>

//       <View
//         style={{
//           flex: 1,
//           backgroundColor: COLORS.surface,
//           borderTopLeftRadius: 24,
//           borderTopRightRadius: 24,
//           marginTop: -20,
//         }}
//       >
//         <ScrollView
//           style={{ flex: 1 }}
//           bounces={false}
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={{
//             paddingTop: 22,
//             paddingBottom: 96 + insets.bottom,
//           }}
//         >
//           <View style={{ paddingHorizontal: 20 }}>
//             <Text
//               style={{
//                 fontSize: 19,
//                 fontWeight: "700",
//                 color: COLORS.ink,
//                 marginBottom: 6,
//               }}
//             >
//               {deal?.name}
//             </Text>

//             <Text
//               style={{ fontSize: 15, fontWeight: "700", color: COLORS.ink }}
//             >
//               {formatPrice(unitPrice)}
//             </Text>

//             {!!deal?.desc && (
//               <Text
//                 style={{
//                   fontSize: 12,
//                   color: COLORS.n600,
//                   marginTop: 10,
//                   lineHeight: 18,
//                 }}
//               >
//                 {deal.desc}
//               </Text>
//             )}
//           </View>

//           {hasOptions &&
//             deal!.option.map((modifier: ProductModifier) => {
//               const isMultiSelect = modifier.maximumOptions > 1;
//               return (
//                 <View key={modifier.id}>
//                   <View
//                     style={{
//                       height: 8,
//                       backgroundColor: COLORS.n100,
//                       marginTop: 16,
//                     }}
//                   />
//                   <View
//                     style={{
//                       flexDirection: "row",
//                       justifyContent: "space-between",
//                       alignItems: "flex-start",
//                       paddingHorizontal: 20,
//                       paddingTop: 16,
//                       paddingBottom: 4,
//                     }}
//                   >
//                     <View>
//                       <Text
//                         style={{
//                           fontSize: 13.5,
//                           fontWeight: "700",
//                           color: COLORS.ink,
//                         }}
//                       >
//                         {modifier.name}
//                       </Text>
//                       <Text
//                         style={{
//                           fontSize: 11,
//                           color: COLORS.n600,
//                           marginTop: 3,
//                         }}
//                       >
//                         {describeModifier(modifier)}
//                       </Text>
//                     </View>
//                     {modifier.minimumOptions > 0 && (
//                       <View
//                         style={{
//                           backgroundColor: COLORS.n100,
//                           borderRadius: 7,
//                           paddingHorizontal: 9,
//                           paddingVertical: 4,
//                         }}
//                       >
//                         <Text
//                           style={{
//                             fontSize: 10,
//                             fontWeight: "600",
//                             color: COLORS.n600,
//                           }}
//                         >
//                           Required
//                         </Text>
//                       </View>
//                     )}
//                   </View>
//                   {modifier.options.map((option) => {
//                     const selected = (
//                       selectedOptions[modifier.id] ?? []
//                     ).includes(option.id);
//                     const disabled = !option.isActive || !option.isInStock;
//                     return (
//                       <TouchableOpacity
//                         key={option.id}
//                         disabled={disabled}
//                         onPress={() => toggleOption(modifier, option.id)}
//                         style={{
//                           flexDirection: "row",
//                           alignItems: "center",
//                           paddingHorizontal: 20,
//                           paddingVertical: 13,
//                           borderBottomWidth: 1,
//                           borderBottomColor: COLORS.n100,
//                           opacity: disabled ? 0.4 : 1,
//                         }}
//                         activeOpacity={0.7}
//                       >
//                         <View style={{ flex: 1 }}>
//                           <Text
//                             style={{
//                               fontSize: 12.5,
//                               fontWeight: "500",
//                               color: COLORS.ink,
//                             }}
//                           >
//                             {option.name}
//                           </Text>
//                           {!option.isInStock && (
//                             <Text
//                               style={{
//                                 fontSize: 10.5,
//                                 color: COLORS.signal,
//                                 marginTop: 2,
//                               }}
//                             >
//                               Unavailable
//                             </Text>
//                           )}
//                           {option.price > 0 && (
//                             <Text
//                               style={{
//                                 fontSize: 11,
//                                 color: COLORS.n600,
//                                 marginTop: 2,
//                               }}
//                             >
//                               +{formatPrice(option.price)}
//                             </Text>
//                           )}
//                         </View>
//                         <View
//                           style={{
//                             width: 24,
//                             height: 24,
//                             borderRadius: isMultiSelect ? 7 : 12,
//                             borderWidth: 1.5,
//                             borderColor: selected ? COLORS.signal : COLORS.n200,
//                             backgroundColor: selected
//                               ? COLORS.signal
//                               : "transparent",
//                             alignItems: "center",
//                             justifyContent: "center",
//                           }}
//                         >
//                           {selected && (
//                             <Text
//                               style={{
//                                 color: "#fff",
//                                 fontSize: 12,
//                                 fontWeight: "700",
//                               }}
//                             >
//                               ✓
//                             </Text>
//                           )}
//                         </View>
//                       </TouchableOpacity>
//                     );
//                   })}
//                 </View>
//               );
//             })}

//           <View
//             style={{
//               flexDirection: "row",
//               alignItems: "center",
//               justifyContent: "center",
//               gap: 16,
//               paddingTop: 20,
//             }}
//           >
//             <TouchableOpacity
//               onPress={() =>
//                 onQuantityChange?.(Math.max(1, (deal?.qty || 1) - 1))
//               }
//               style={{
//                 width: 30,
//                 height: 30,
//                 borderRadius: 9,
//                 borderWidth: 1,
//                 borderColor: COLORS.n200,
//                 alignItems: "center",
//                 justifyContent: "center",
//               }}
//             >
//               <Text style={{ fontSize: 18, color: COLORS.ink, lineHeight: 20 }}>
//                 −
//               </Text>
//             </TouchableOpacity>
//             <Text
//               style={{
//                 fontSize: 15,
//                 fontWeight: "700",
//                 color: COLORS.ink,
//                 minWidth: 20,
//                 textAlign: "center",
//               }}
//             >
//               {deal?.qty || 1}
//             </Text>
//             <TouchableOpacity
//               onPress={() =>
//                 onQuantityChange?.(Math.max(1, (deal?.qty || 1) + 1))
//               }
//               style={{
//                 width: 30,
//                 height: 30,
//                 borderRadius: 9,
//                 borderWidth: 1,
//                 borderColor: COLORS.n200,
//                 alignItems: "center",
//                 justifyContent: "center",
//               }}
//             >
//               <Text style={{ fontSize: 18, color: COLORS.ink, lineHeight: 20 }}>
//                 +
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </ScrollView>

//         <TouchableOpacity
//           onPress={() => onAddToCart?.(selectedOptions)}
//           activeOpacity={0.85}
//           style={{
//             position: "absolute",
//             left: 16,
//             right: 16,
//             // Same bug as CartScreen's checkout bar: an absolutely
//             // positioned element ignores any ancestor's safe-area padding
//             // entirely, so without + insets.bottom this sits flush against
//             // (or under) the home indicator regardless of SafeModal.
//             bottom: 16 + insets.bottom,
//             backgroundColor: COLORS.signal,
//             borderRadius: 16,
//             paddingVertical: 15,
//             alignItems: "center",
//             shadowColor: COLORS.signal,
//             shadowOpacity: 0.35,
//             shadowRadius: 12,
//             shadowOffset: { width: 0, height: 6 },
//             elevation: 6,
//           }}
//         >
//           <Text style={{ color: "#fff", fontSize: 13.5, fontWeight: "700" }}>
//             Add {deal?.qty ?? 1} for {formatPrice(total)}
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// }
import { Ionicons } from "@expo/vector-icons";
import SafeModal from "./shared/safe-modal";

import { Item, ProductModifier } from "@/app/brand/[id]";
import { useEffect, useState } from "react";
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
  deal?: (Item & { qty: number }) | null;
  visible: boolean;
  quantity: number;
  onClose: () => void;
  onQuantityChange?: (qty: number) => void;
  onAddToCart?: (selectedOptions: Record<string, string[]>) => void;
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

export default function ItemDetailSheet(props: DealBottomSheetProps) {
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

function ItemDetailSheetContent({
  deal,
  onClose,
  onQuantityChange,
  onAddToCart,
}: DealBottomSheetProps) {
  const insets = useSafeAreaInsets();

  // modifierId -> selected optionIds. A modifier with maximumOptions <= 1
  // behaves like a radio group (picking one replaces the other); anything
  // higher behaves like checkboxes capped at that count.
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string[]>
  >({});

  // Pre-fill up to `minimumOptions` in-stock options per modifier whenever
  // a new item opens — satisfies required modifiers by default and keeps
  // the price from looking incomplete, without touching modifiers that are
  // genuinely optional (minimumOptions 0).
  useEffect(() => {
    if (!deal?.option?.length) {
      setSelectedOptions({});
      return;
    }
    const defaults: Record<string, string[]> = {};
    deal.option.forEach((modifier) => {
      if (modifier.minimumOptions > 0) {
        const available = modifier.options.filter((o) => o.isInStock);
        defaults[modifier.id] = available
          .slice(0, modifier.minimumOptions)
          .map((o) => o.id);
      } else {
        defaults[modifier.id] = [];
      }
    });
    setSelectedOptions(defaults);
  }, [deal?.id]);

  const toggleOption = (modifier: ProductModifier, optionId: string) => {
    setSelectedOptions((prev) => {
      const current = prev[modifier.id] ?? [];
      const isSelected = current.includes(optionId);

      if (modifier.maximumOptions <= 1) {
        if (isSelected) {
          // Guardrail: a required single-choice modifier can't be cleared
          // to nothing by tapping its only selected option again — the
          // person has to pick a different option to change it, not
          // deselect their way into an invalid state.
          if (modifier.minimumOptions > 0) return prev;
          return { ...prev, [modifier.id]: [] };
        }
        // Radio behavior — picking one always replaces whatever was there.
        return { ...prev, [modifier.id]: [optionId] };
      }

      if (isSelected) {
        // Guardrail: same idea for checkbox-style modifiers — don't let a
        // removal drop the count below what's required.
        if (current.length <= modifier.minimumOptions) return prev;
        return {
          ...prev,
          [modifier.id]: current.filter((id) => id !== optionId),
        };
      }

      if (current.length >= modifier.maximumOptions) {
        // At the cap — ignore the tap rather than silently bumping an
        // existing pick off; the person can deselect one first.
        return prev;
      }

      return { ...prev, [modifier.id]: [...current, optionId] };
    });
  };

  const hasOptions = !!deal?.option?.length;

  // Guardrail backstop: the toggle logic above prevents deselecting below
  // a modifier's minimum through normal interaction, but it can't rescue
  // a modifier whose in-stock options never reached the minimum in the
  // first place (e.g. every option happens to be out of stock right now).
  // So this still gets checked before Add to cart is allowed to fire.
  const isModifierSatisfied = (modifier: ProductModifier): boolean =>
    (selectedOptions[modifier.id]?.length ?? 0) >= modifier.minimumOptions;

  const unsatisfiedModifiers = (deal?.option ?? []).filter(
    (modifier) => !isModifierSatisfied(modifier),
  );
  const canAddToCart = unsatisfiedModifiers.length === 0;

  const optionsTotal = (deal?.option ?? []).reduce((sum, modifier) => {
    const selectedIds = selectedOptions[modifier.id] ?? [];
    const modifierTotal = modifier.options
      .filter((o) => selectedIds.includes(o.id))
      .reduce((s, o) => s + o.price, 0);
    return sum + modifierTotal;
  }, 0);

  const unitPrice = (deal?.price ?? 0) + optionsTotal;
  const total = unitPrice * (deal?.qty ?? 1);

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
            deal!.option.map((modifier: ProductModifier) => {
              const isMultiSelect = modifier.maximumOptions > 1;
              const satisfied = isModifierSatisfied(modifier);
              return (
                <View key={modifier.id}>
                  <View
                    style={{
                      height: 8,
                      backgroundColor: COLORS.n100,
                      marginTop: 16,
                    }}
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
                        style={{
                          fontSize: 13.5,
                          fontWeight: "700",
                          color: COLORS.ink,
                        }}
                      >
                        {modifier.name}
                      </Text>
                      <Text
                        style={{
                          fontSize: 11,
                          color: COLORS.n600,
                          marginTop: 3,
                        }}
                      >
                        {describeModifier(modifier)}
                      </Text>
                    </View>
                    {modifier.minimumOptions > 0 && (
                      <View
                        style={{
                          // Signal-tinted while unsatisfied so the exact
                          // section still blocking Add to cart is obvious
                          // at a glance, not just the button going gray.
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
                    const selected = (
                      selectedOptions[modifier.id] ?? []
                    ).includes(option.id);
                    const disabled = !option.isActive || !option.isInStock;
                    return (
                      <TouchableOpacity
                        key={option.id}
                        disabled={disabled}
                        onPress={() => toggleOption(modifier, option.id)}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          paddingHorizontal: 20,
                          paddingVertical: 13,
                          borderBottomWidth: 1,
                          borderBottomColor: COLORS.n100,
                          opacity: disabled ? 0.4 : 1,
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontSize: 12.5,
                              fontWeight: "500",
                              color: COLORS.ink,
                            }}
                          >
                            {option.name}
                          </Text>
                          {!option.isInStock && (
                            <Text
                              style={{
                                fontSize: 10.5,
                                color: COLORS.signal,
                                marginTop: 2,
                              }}
                            >
                              Unavailable
                            </Text>
                          )}
                          {option.price > 0 && (
                            <Text
                              style={{
                                fontSize: 11,
                                color: COLORS.n600,
                                marginTop: 2,
                              }}
                            >
                              +{formatPrice(option.price)}
                            </Text>
                          )}
                        </View>
                        <View
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: isMultiSelect ? 7 : 12,
                            borderWidth: 1.5,
                            borderColor: selected ? COLORS.signal : COLORS.n200,
                            backgroundColor: selected
                              ? COLORS.signal
                              : "transparent",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {selected && (
                            <Text
                              style={{
                                color: "#fff",
                                fontSize: 12,
                                fontWeight: "700",
                              }}
                            >
                              ✓
                            </Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            })}

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
                onQuantityChange?.(Math.max(1, (deal?.qty || 1) - 1))
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
              {deal?.qty || 1}
            </Text>
            <TouchableOpacity
              onPress={() =>
                onQuantityChange?.(Math.max(1, (deal?.qty || 1) + 1))
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
            onAddToCart?.(selectedOptions);
          }}
          disabled={!canAddToCart}
          activeOpacity={0.85}
          style={{
            position: "absolute",
            left: 16,
            right: 16,
            // Same bug as CartScreen's checkout bar: an absolutely
            // positioned element ignores any ancestor's safe-area padding
            // entirely, so without + insets.bottom this sits flush against
            // (or under) the home indicator regardless of SafeModal.
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
              ? `Add ${deal?.qty ?? 1} for ${formatPrice(total)}`
              : `Select ${unsatisfiedModifiers[0]?.name ?? "required options"}`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
