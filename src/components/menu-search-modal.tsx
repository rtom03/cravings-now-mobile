import { AppText } from "@/components/app-text";
import MenuItemCard from "@/components/menu-item-card";
import type { Item } from "@/app/brand/[id]";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { FlatList, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SafeModal from "./shared/safe-modal";

// TODO: swap for `@/constants/theme` once the token migration happens.
const COLORS = {
  ink: "#1B1B1F",
  paper: "#F7F6F3",
  surface: "#FFFFFF",
  n600: "#6E6E76",
  n300: "#B9B7B2",
  n100: "#F1EFEA",
};

const SOFT_SHADOW = {
  shadowColor: "#000",
  shadowOpacity: 0.08,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 6 },
  elevation: 4,
} as const;

interface MenuSearchModalProps {
  visible: boolean;
  brandName: string;
  items: Item[];
  onClose: () => void;
  onItemPress: (item: Item) => void;
  onAdd: (item: Item) => void;
  children?: React.ReactNode;
}

// Thin shell: renders only the modal so the Content below calls
// useSafeAreaInsets() INSIDE SafeModal's provider (same pattern as
// AddressModal / ItemDetailSheet).
export default function MenuSearchModal({
  children,
  ...props
}: MenuSearchModalProps) {
  return (
    <SafeModal
      visible={props.visible}
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={props.onClose}
    >
      <MenuSearchContent {...props} />
      {children}
    </SafeModal>
  );
}

function MenuSearchContent({
  brandName,
  items,
  onClose,
  onItemPress,
  onAdd,
}: MenuSearchModalProps) {
  const insets = useSafeAreaInsets();
  // Modal unmounts its children when hidden, so this resets on every open.
  const [query, setQuery] = useState("");

  const trimmed = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!trimmed) return [];
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(trimmed) ||
        item.desc.toLowerCase().includes(trimmed),
    );
  }, [items, trimmed]);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.paper }}>
      {/* Search pill + close */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingTop: insets.top + 8,
          paddingBottom: 12,
          paddingHorizontal: 16,
        }}
      >
        <View
          style={{
            flex: 1,
            height: 48,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: COLORS.surface,
            borderRadius: 34,
            paddingHorizontal: 16,
            gap: 10,
            ...SOFT_SHADOW,
          }}
        >
          <Ionicons name="search" size={18} color={COLORS.ink} />
          <TextInput
            autoFocus
            value={query}
            onChangeText={setQuery}
            placeholder={`Search in ${brandName}`}
            placeholderTextColor={COLORS.n600}
            returnKeyType="search"
            autoCorrect={false}
            style={{ flex: 1, fontSize: 15, color: COLORS.ink, height: 48 }}
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => setQuery("")}
              hitSlop={10}
              accessibilityLabel="Clear search"
            >
              <Ionicons name="close-circle" size={18} color={COLORS.n300} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          onPress={onClose}
          accessibilityLabel="Close search"
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: COLORS.surface,
            ...SOFT_SHADOW,
          }}
        >
          <Ionicons name="close" size={22} color={COLORS.ink} />
        </TouchableOpacity>
      </View>

      {results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={{
            paddingHorizontal: 10,
            paddingTop: 8,
            paddingBottom: insets.bottom + 16,
            gap: 12,
          }}
          renderItem={({ item }) => (
            <MenuItemCard
              item={item}
              onPress={() => onItemPress(item)}
              onAdd={() => onAdd(item)}
            />
          )}
        />
      ) : (
        <EmptyState
          title={trimmed ? "No matches found" : "Looking for something?"}
          subtitle={
            trimmed
              ? `Nothing in ${brandName} matches “${query.trim()}”.`
              : "Search for it and we’ll help you find it."
          }
        />
      )}
    </View>
  );
}

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 32,
        // Lifts the block above the keyboard's footprint.
        paddingBottom: 220,
      }}
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
        <Ionicons name="search" size={36} color={COLORS.n300} />
      </View>
      <AppText style={{ fontSize: 16, fontWeight: "700", color: COLORS.ink }}>
        {title}
      </AppText>
      <AppText
        style={{
          fontSize: 13,
          color: COLORS.n600,
          marginTop: 6,
          textAlign: "center",
        }}
      >
        {subtitle}
      </AppText>
    </View>
  );
}
