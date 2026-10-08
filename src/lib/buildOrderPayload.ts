// lib/buildOrderPayload.ts
import { CartItem, CreateOrderPayload } from "@/types/order";

export function buildOrderPayload(args: {
  items: CartItem[];

  location: { latitude: number; longitude: number };
  customerId?: string;
  customerAddressId?: string;
  customerEmail?: string;
  idempotencyKey?: string;
  chargeIds?: string[];
  paymentMethodId?: string;
  amount?: number;
}): CreateOrderPayload {
  return {
    customerId: args.customerId,
    customerAddressId: args.customerAddressId,
    idempotencyKey: args.idempotencyKey!,
    customerEmail: args.customerEmail!,
    location: args.location,
    products: args.items.map((i) => ({
      productId: i.id,
      quantity: i.quantity,
      foodicsId: i.foodicsId,
      foodicsSandBoxId: i.foodicsSandBoxId,

      groupName: i.groupName, // NEW — which brand this line belongs to, drives the split
      options: i.modifiers?.flatMap((o) =>
        o.options.map((opt) => ({
          modifierOptionId: opt.id,
          quantity: opt.quantity,
          foodicsId: opt.foodicsId,
          foodicsSandBoxId: opt.foodicsSandBoxId,
        })),
      ),
    })),
    // charges: args?.chargeIds.map((chargeId) => ({ chargeId })),
    // payment: { paymentMethodId: args.paymentMethodId, amount: args.amount },
  };
}
