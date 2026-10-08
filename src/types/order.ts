import { ProductModifier } from "./product";

// types/order.ts
export interface CartItem {
  id: string;
  foodicsId: string;
  foodicsSandBoxId?: string;
  name: string;
  price: number;
  img?: string;
  desc: string;
  quantity: number;
  groupName: string | null; // NEW — which brand this line belongs to, drives the split
  modifiers?: ProductModifier[];
}

export interface CreateOrderPayload {
  customerId?: string;
  customerAddressId?: string;
  customerEmail: string;
  idempotencyKey: string;
  location: { latitude: number; longitude: number };
  products: {
    productId: string;
    quantity: number;
    foodicsId: string;
    foodicsSandBoxId?: string;
    groupName: string | null; // NEW — which brand this line belongs to, drives the split
    options?: {
      modifierOptionId: string;
      quantity: number;
      foodicsId: string;
      foodicsSandBoxId?: string;
    }[];
  }[];
  charges?: { chargeId: string }[];
  payment?: { paymentMethodId: string; amount: number };
}

export interface CreateOrderResponse {
  id: string;
  totalPrice: number;
  paystackAuthUrl: string;
}

export interface CreateOrderQuoteResponse {
  subtotalKobo: number;
  discountKobo: number | null;
  couponCode: string | null;
  taxKobo: number;
  taxRatePct: number;
  deliveryFeeKobo: number;
  paystackServiceKobo: number;
  serviceFeeKobo?: number;
  totalKobo: number;
}
