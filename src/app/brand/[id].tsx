import { AppText } from "@/components/app-text";
import BrandHeader from "@/components/brand-header";
import ItemDetailSheet from "@/components/product-details";
import {
  Href,
  Link,
  Stack,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Image,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useCartStore } from "../../../store/cartStore";
import MenuItemCard from "@/components/menu-item-card";
import { ProductProps } from "@/types/brands";
import { useProductsByGroupById } from "@/hooks/cravings-now-api/groupQuery";
import { fmt } from "@/utils";
import { toCartItem } from "@/lib/toCartItems";
import { ProductModifier } from "@/types/product";

// ─── CravingsNow design tokens — from the style-guide cover frame ──────────
// TODO: extract into a shared `@/constants/theme` file — duplicated across
// HomeScreen / BrandsScreen / this file until that migration happens.
const COLORS = {
  ink: "#1B1B1F",
  paper: "#F7F6F3",
  surface: "#FFFFFF",
  signal: "#E63462",
  support: "#0F5257",
  warn: "#E8A33D",
  n600: "#6E6E76",
  n300: "#B9B7B2",
  n200: "#E7E4DE",
  n100: "#F1EFEA",
};

// ─── Real API shape (matches the JSON you pasted) ──────────────────────────

export interface ProductOption {
  id: string;
  foodicsId: string;
  sku: string;
  name: string;
  image: string | null;
  isActive: boolean;
  isInStock: boolean;
  price: number;
}

export type SelectedOption = ProductOption & { quantity: number };

// ─── UI shapes ──────────────────────────────────────────────────────────────

export interface Item {
  id: string;
  lineId: string; // product + selected options: identifies this exact cart line
  foodicsId: string;
  foodicsSandBoxId: string;
  name: string;
  price: number;
  img?: string;
  desc: string;
  category?: string;
  groupName: string;
  quantity: number;
  option: ProductModifier[];
}

interface CategorySection {
  categoryId: string;
  categoryName: string;
  items: Item[];
}

// Every field on Item is used somewhere downstream — foodicsId and
// groupName flow into toCartItem, quantity is what actually gets added.
// This used to return an object missing all three, which is the root of
// the "quantity doesn't work for plain items" bug: a quick-added item's
// `.quantity` was `undefined`, not 1, because nothing here ever set it.
function toMenuItem(product: ProductProps, groupName: string): Item {
  return {
    id: product.id,
    foodicsId: product.foodicsId,
    foodicsSandBoxId: product.foodicsSandBoxId,
    name: product.name,
    price: product.price,
    img: product.image ?? undefined,
    desc: product.description ?? "",
    category: product.category?.id,
    groupName,
    quantity: 1,
    // Not every product has modifiers — default to an empty array so
    // ItemDetailSheet can key off `.length` without extra null checks.
    option: product.modifiers ?? [],
  };
}

function groupProductsByCategory(
  products: ProductProps[],
  groupName: string,
): CategorySection[] {
  const sectionsByCategory = new Map<string, CategorySection>();

  for (const product of products) {
    if (!product.category?.id) continue;

    const existing = sectionsByCategory.get(product.category.id);
    const item = toMenuItem(product, groupName);

    if (existing) {
      existing.items.push(item);
    } else {
      sectionsByCategory.set(product.category.id, {
        categoryId: product.category.id,
        categoryName: product.category.name,
        items: [item],
      });
    }
  }

  return Array.from(sectionsByCategory.values());
}

const TAB_BAR_FALLBACK_HEIGHT = 48;
// Fallback only — covers the edge case where the computed target offset
// gets clamped by content bounds and is never actually reached (so the
// arrival check below would never fire). Set generously above a normal
// scrollTo animation's duration so it doesn't race a real one.
const PROGRAMMATIC_SCROLL_SAFETY_MS = 900;
// How close (in px) currentY needs to be to the scrollTo target before we
// trust that the animation has actually arrived, rather than guessing from
// a timer that has no idea how long the animation will really take.
const SCROLL_ARRIVAL_EPSILON = 4;

// ─── Extracted + memoized so it doesn't re-render on every scroll tick ─────
const CategoryTabs = React.memo(function CategoryTabs({
  sections,
  activeCategoryId,
  onSelect,
}: {
  sections: CategorySection[];
  activeCategoryId: string | null;
  onSelect: (categoryId: string) => void;
}) {
  const scrollRef = useRef<Animated.ScrollView>(null);
  const tabOffsets = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!activeCategoryId) return;
    const x = tabOffsets.current[activeCategoryId];
    if (x === undefined) return;
    scrollRef.current?.scrollTo({ x: Math.max(x - 24, 0), animated: true });
  }, [activeCategoryId]);

  return (
    <Animated.ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 12 }}
    >
      {sections.map((section) => {
        const active = activeCategoryId === section.categoryId;
        return (
          <TouchableOpacity
            key={section.categoryId}
            onPress={() => onSelect(section.categoryId)}
            onLayout={(event) => {
              tabOffsets.current[section.categoryId] =
                event.nativeEvent.layout.x;
            }}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderBottomWidth: 2.5,
              borderBottomColor: active ? COLORS.signal : "transparent",
              marginRight: 4,
            }}
          >
            <AppText
              style={{
                fontSize: 14,
                fontWeight: active ? "700" : "500",
                color: active ? COLORS.ink : COLORS.n600,
              }}
            >
              {section.categoryName}
            </AppText>
          </TouchableOpacity>
        );
      })}
    </Animated.ScrollView>
  );
});

const MenuSections = React.memo(function MenuSections({
  sections,
  onSectionLayout,
  onItemPress,
  onAdd,
}: {
  sections: CategorySection[];
  onSectionLayout: (categoryId: string) => (e: LayoutChangeEvent) => void;
  onItemPress: (item: Item) => void;
  onAdd: (item: Item) => void;
}) {
  return (
    <>
      {sections.map((section) => (
        <View
          key={section.categoryId}
          onLayout={onSectionLayout(section.categoryId)}
          style={{ paddingTop: 20 }}
        >
          <View style={{ paddingHorizontal: 20, marginBottom: 8 }}>
            <AppText
              style={{ fontSize: 14, fontWeight: "700", color: COLORS.ink }}
            >
              {section.categoryName}
            </AppText>
          </View>

          <View style={{ paddingHorizontal: 10, paddingVertical: 5, gap: 12 }}>
            {section.items.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                onPress={() => onItemPress(item)}
                onAdd={() => onAdd(item)}
              />
            ))}
          </View>
        </View>
      ))}
    </>
  );
});

function InfoCol({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ alignItems: "center" }}>
      <AppText style={{ fontSize: 13, fontWeight: "700", color: COLORS.ink }}>
        {value}
      </AppText>
      <AppText style={{ fontSize: 10, color: COLORS.n600, marginTop: 2 }}>
        {label}
      </AppText>
    </View>
  );
}

const CART_BAR_FOOTPRINT = 92;

export default function DetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id, name, hero_img, ratings } = useLocalSearchParams<{
    id: string;
    name: string;
    hero_img: string;
    brand_icon: string;
    ratings: string;
    desc: string;
  }>();

  const [sheetVisible, setSheetVisible] = useState(false);
  // One quantity field, not two. selectedItem IS an Item, and Item already
  // owns `quantity` — there's no second `qty` sitting next to it that
  // something could read instead by mistake.
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const { addToCart, items: cartItems, totalPrice } = useCartStore();

  // TODO: wire to whatever the checkout flow expects — this only drives the
  // info-strip content below for now.
  const [fulfillment, setFulfillment] = useState<"delivery" | "pickup">(
    "delivery",
  );

  const { data } = useProductsByGroupById(id);

  const sections = useMemo(
    () => groupProductsByCategory(data ?? [], name),
    [data, name],
  );

  // ─── Scrollspy state ────────────────────────────────────────────────────
  const scrollViewRef = useRef<Animated.ScrollView>(null);
  const sectionOffsets = useRef<Record<string, number>>({});
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [tabBarNaturalOffset, setTabBarNaturalOffset] = useState<number | null>(
    null,
  );
  const scrollY = useRef(new Animated.Value(0)).current;

  const [scrolledPastTabBar, setScrolledPastTabBar] = useState(false);

  const [headerHeight, setHeaderHeight] = useState(0);
  const [tabBarHeight, setTabBarHeight] = useState(TAB_BAR_FALLBACK_HEIGHT);
  const fixedOverlayHeight = headerHeight + tabBarHeight;

  const isProgrammaticScroll = useRef(false);
  const programmaticScrollTarget = useRef<number | null>(null);
  const programmaticScrollTimeout = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  const releaseProgrammaticScrollLock = useCallback(() => {
    isProgrammaticScroll.current = false;
    programmaticScrollTarget.current = null;
    if (programmaticScrollTimeout.current) {
      clearTimeout(programmaticScrollTimeout.current);
      programmaticScrollTimeout.current = null;
    }
  }, []);

  const handleHeightChange = useCallback((height: number) => {
    const rounded = Math.round(height);
    setHeaderHeight((prev) => (prev === rounded ? prev : rounded));
  }, []);

  const handleTabBarLayout = useCallback((event: LayoutChangeEvent) => {
    const { y, height } = event.nativeEvent.layout;
    const roundedY = Math.round(y);
    const roundedHeight = Math.round(height);
    setTabBarNaturalOffset((prev) => (prev === roundedY ? prev : roundedY));
    setTabBarHeight((prev) => (prev === roundedHeight ? prev : roundedHeight));
  }, []);

  const overlayOpacity =
    tabBarNaturalOffset === null
      ? 0
      : scrollY.interpolate({
          inputRange: [
            Math.max(tabBarNaturalOffset - 1, 0),
            tabBarNaturalOffset,
          ],
          outputRange: [0, 1],
          extrapolate: "clamp",
        });

  const handleSectionLayout = useCallback(
    (categoryId: string) => (event: LayoutChangeEvent) => {
      sectionOffsets.current[categoryId] = event.nativeEvent.layout.y;
      setActiveCategoryId((prev) => prev ?? categoryId);
    },
    [],
  );

  const findActiveCategoryId = useCallback(
    (currentY: number): string | null => {
      const entries = Object.entries(sectionOffsets.current).sort(
        (a, b) => a[1] - b[1],
      );

      let current: string | null = null;
      for (const [categoryId, offsetY] of entries) {
        if (currentY + fixedOverlayHeight >= offsetY) {
          current = categoryId;
        } else {
          break;
        }
      }
      return current;
    },
    [fixedOverlayHeight],
  );

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const currentY = event.nativeEvent.contentOffset.y;

        if (tabBarNaturalOffset !== null) {
          const next = currentY >= tabBarNaturalOffset;
          setScrolledPastTabBar((prev) => (prev === next ? prev : next));
        }

        if (isProgrammaticScroll.current) {
          const target = programmaticScrollTarget.current;
          if (
            target === null ||
            Math.abs(currentY - target) > SCROLL_ARRIVAL_EPSILON
          ) {
            return;
          }
          releaseProgrammaticScrollLock();
        }

        const current = findActiveCategoryId(currentY);
        if (current && current !== activeCategoryId) {
          setActiveCategoryId(current);
        }
      },
    },
  );

  const scrollToCategory = useCallback(
    (categoryId: string) => {
      setActiveCategoryId(categoryId);

      const offsetY = sectionOffsets.current[categoryId];
      if (offsetY === undefined) return;

      const target = Math.max(offsetY - fixedOverlayHeight, 0);

      isProgrammaticScroll.current = true;
      programmaticScrollTarget.current = target;
      if (programmaticScrollTimeout.current) {
        clearTimeout(programmaticScrollTimeout.current);
      }

      scrollViewRef.current?.scrollTo({ y: target, animated: true });

      programmaticScrollTimeout.current = setTimeout(
        releaseProgrammaticScrollLock,
        PROGRAMMATIC_SCROLL_SAFETY_MS,
      );
    },
    [fixedOverlayHeight, releaseProgrammaticScrollLock],
  );

  // Updates the one real quantity field. ItemDetailSheet's stepper calls
  // this, and because selectedItem.quantity is the SAME field that gets
  // read when the item is actually added to the cart, what you see on the
  // stepper is guaranteed to be what gets added — there's no second,
  // silently-stale field for the cart logic to read from instead.
  const handleQuantityChange = (newQuantity: number) => {
    setSelectedItem((prev) =>
      prev ? { ...prev, quantity: newQuantity } : null,
    );
  };

  const handleItemPress = useCallback((item: Item) => {
    setSelectedItem({ ...item, quantity: 1 });
    setSheetVisible(true);
  }, []);

  // Quick-add path for items with no required modifiers (MenuItemCard
  // decides when this is safe to call directly instead of opening the
  // sheet). item.quantity is reliably 1 here because toMenuItem sets it —
  // before that fix this was undefined, and addToCart was being called
  // with no quantity at all.
  const handleAddItem = useCallback(
    (item: Item) => {
      addToCart(toCartItem(item), item.quantity);
    },
    [addToCart],
  );

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={{ flex: 1, backgroundColor: COLORS.paper }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <BrandHeader
        brandName={name}
        scrollY={scrollY}
        onHeightChange={handleHeightChange}
      />

      <Animated.ScrollView
        ref={scrollViewRef}
        onScroll={handleScroll}
        onMomentumScrollEnd={releaseProgrammaticScrollLock}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingBottom:
            cartItems.length > 0 ? CART_BAR_FOOTPRINT + insets.bottom : 0,
        }}
      >
        <View style={{ width: "100%", height: 200 }}>
          <Image
            source={{ uri: hero_img }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
          <View
            style={{
              position: "absolute",
              top: 16,
              left: 16,
              right: 16,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          ></View>
        </View>

        <View
          style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 }}
        >
          <AppText
            style={{ fontSize: 19, fontWeight: "700", color: COLORS.ink }}
          >
            {name}
          </AppText>
          {!!ratings && (
            <AppText
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: COLORS.warn,
                marginTop: 4,
              }}
            >
              ★ {ratings}
            </AppText>
          )}
        </View>

        <View
          style={{
            flexDirection: "row",
            backgroundColor: COLORS.n100,
            borderRadius: 12,
            padding: 4,
            marginHorizontal: 20,
            marginTop: 14,
          }}
        >
          {(["delivery", "pickup"] as const).map((mode) => {
            const active = fulfillment === mode;
            return (
              <TouchableOpacity
                key={mode}
                onPress={() => setFulfillment(mode)}
                style={{
                  flex: 1,
                  alignItems: "center",
                  paddingVertical: 8,
                  borderRadius: 9,
                  backgroundColor: active ? COLORS.surface : "transparent",
                }}
              >
                <AppText
                  style={{
                    fontSize: 12.5,
                    fontWeight: "600",
                    color: active ? COLORS.ink : COLORS.n600,
                  }}
                >
                  {mode === "delivery" ? "Delivery" : "Pickup"}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* TODO: placeholder values — wire to real ETA/fee/distance once
            the group/product API exposes them. */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            backgroundColor: COLORS.n100,
            borderRadius: 14,
            marginHorizontal: 20,
            marginTop: 14,
            paddingVertical: 12,
            paddingHorizontal: 16,
          }}
        >
          {fulfillment === "delivery" ? (
            <>
              <InfoCol value="25–35" label="min" />
              <InfoCol value="₦500" label="delivery" />
              <InfoCol value="2.1 km" label="away" />
            </>
          ) : (
            <>
              <InfoCol value="10–15" label="min" />
              <InfoCol value="2.1 km" label="away" />
            </>
          )}
        </View>

        <View
          onLayout={handleTabBarLayout}
          style={{
            marginTop: 6,
            backgroundColor: COLORS.paper,
            borderBottomWidth: 1,
            borderBottomColor: COLORS.n200,
          }}
        >
          <CategoryTabs
            sections={sections}
            activeCategoryId={activeCategoryId}
            onSelect={scrollToCategory}
          />
        </View>

        <MenuSections
          sections={sections}
          onSectionLayout={handleSectionLayout}
          onItemPress={handleItemPress}
          onAdd={handleAddItem}
        />
      </Animated.ScrollView>

      <Animated.View
        pointerEvents={scrolledPastTabBar ? "box-none" : "none"}
        style={{
          position: "absolute",
          top: headerHeight,
          left: 0,
          right: 0,
          zIndex: 15,
          backgroundColor: COLORS.paper,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.n200,
          opacity: overlayOpacity,
        }}
      >
        <CategoryTabs
          sections={sections}
          activeCategoryId={activeCategoryId}
          onSelect={scrollToCategory}
        />
      </Animated.View>

      <ItemDetailSheet
        deal={selectedItem}
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onQuantityChange={handleQuantityChange}
        onAddToCart={(selectedQuantities) => {
          if (selectedItem) {
            // Build the list of what was ACTUALLY picked, with how many of
            // each — not every option that exists. Previously this used
            // `.flatMap((o) => o.options!)`, which ignored selection
            // entirely and sent every option from every modifier regardless
            // of whether the person chose it.
            const chosenOptions: SelectedOption[] = selectedItem.option.flatMap(
              (modifier) => {
                const quantities = selectedQuantities[modifier.id] ?? {};
                return modifier.options
                  .filter((option) => (quantities[option.id] ?? 0) > 0)
                  .map((option) => ({
                    ...option,
                    quantity: quantities[option.id],
                  }));
              },
            );

            addToCart(
              toCartItem(selectedItem, chosenOptions),
              selectedItem.quantity,
            );
          }
          setSheetVisible(false);
        }}
      />

      {cartItems.length > 0 && (
        <Link href={"/cart" as Href} asChild>
          <TouchableOpacity
            style={{
              position: "absolute",
              left: 16,
              right: 16,
              bottom: 16 + insets.bottom,
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
            <AppText
              style={{ color: "#fff", fontSize: 12.5, fontWeight: "600" }}
            >
              {cartItems.length} {cartItems.length === 1 ? "item" : "items"} ·{" "}
              {fmt(totalPrice())}
            </AppText>
            <AppText
              style={{ color: "#fff", fontSize: 12.5, fontWeight: "700" }}
            >
              View cart →
            </AppText>
          </TouchableOpacity>
        </Link>
      )}
    </SafeAreaView>
  );
}
