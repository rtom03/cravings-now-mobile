export interface ProductOption {
  id: string;
  foodicsId: string;
  sku: string;
  name: string;
  image: string | null;
  nameLocalized: string | null;
  isActive: boolean;
  isInStock: boolean;
  price: number;
}

export interface ProductModifier {
  id: string;
  name: string;
  options: ProductOption[];
}

type Category = {
  id: string;
  foodicsId: string;
  name: string;
  nameLocalized: string | null;
  reference: string | null;
  image: string | null;
};

export interface Product {
  id: string;
  sku: string;
  barcode: string | null;
  name: string;
  nameLocalized: string | null;
  description: string | null;
  descriptionLocalized: string | null;
  image: string | null;
  isActive: boolean;
  isStockProduct: boolean;
  isNonRevenue: boolean;
  isReady: boolean;
  pricingMethod: number;
  sellingMethod: number;
  costingMethod: number;
  price: number;
  cost: number | null;
  calories: number | null;
  walkingMinutesToBurnCalories: number | null;
  isHighSalt: boolean;
  meta: Record<string, unknown> | null;
  ingredients: unknown[];
  reactivateAt: string | null;
  category?: Category;
  modifiers: ProductModifier[];
}
