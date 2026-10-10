import type { Item, SelectedOption } from "@/app/brand/[id]";
import { toCartItem } from "@/lib/toCartItems";
import { useCallback, useState } from "react";
import { useCartStore } from "../store/cartStore";

// modifierId -> optionId -> quantity (what ItemDetailSheet hands back)
type SelectedQuantities = Record<string, Record<string, number>>;

/**
 * Owns the state + cart logic for ItemDetailSheet so any screen can open it
 * with `open(item)` and spread `sheetProps` onto the sheet.
 */
export function useItemSheet() {
  const { addToCart } = useCartStore();
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [visible, setVisible] = useState(false);

  const open = useCallback((item: Item) => {
    setSelectedItem({ ...item, quantity: 1 });
    setVisible(true);
  }, []);

  const close = useCallback(() => setVisible(false), []);

  // Single quantity field: what the stepper shows is what gets added.
  const onQuantityChange = useCallback((quantity: number) => {
    setSelectedItem((prev) => (prev ? { ...prev, quantity } : null));
  }, []);

  const onAddToCart = useCallback(
    (selectedQuantities: SelectedQuantities) => {
      if (selectedItem) {
        // Only what was actually picked, with how many of each.
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
      setVisible(false);
    },
    [selectedItem, addToCart],
  );

  return {
    open,
    sheetProps: {
      deal: selectedItem,
      visible,
      onClose: close,
      onQuantityChange,
      onAddToCart,
    },
  };
}
