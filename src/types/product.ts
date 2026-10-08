interface ProductOption {
  id: string;
  foodicsId: string;
  foodicsSandBoxId?: string;
  sku: string;
  name: string;
  image: string | null;
  nameLocalized: string | null;
  quantity: number;
  isActive: boolean;
  isInStock: boolean;
  price: number;
}

interface ProductModifier {
  id: string;
  name: string;
  minimumOptions: number;
  maximumOptions: number;
  isSplittableInHalf?: boolean;
  uniqueOptions?: boolean;
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

interface Product {
  id: string;
  foodicsId: string;
  foodicsSandBoxId: string;
  sku: string;
  barcode: string | null;

  name: string;
  nameLocalized: string | null;
  groupName: string | null; // NEW — which brand this line belongs to, drives the split
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
  preparationTime: number | null;
  price: number;
  cost: number | null;
  calories: number | null;
  walkingMinutesToBurnCalories: number | null;
  isHighSalt: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  meta: Record<string, unknown> | null;
  ingredients: unknown[];
  reactivateAt: string | null;
}

export { Product, ProductModifier, ProductOption };
