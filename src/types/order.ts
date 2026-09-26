export interface CreateOrderInput {
  customerId?: string;
  customerAddressId?: string;
  location: { latitude: number; longitude: number };
  couponCode?: string;
  dueAt?: string;

  products: Array<{
    productId: string;
    foodicsId?: string;
    groupName: string | null; // NEW — which brand this line belongs to, drives the split
    quantity: number;
    kitchenNotes?: string;
    options: Array<{
      modifierOptionId: string;
      quantity: number;
      foodicsId?: string;
    }>;
  }>;

  payment: {
    paymentMethodId: string;
    amount: number;
    tips?: number;
  };
}
