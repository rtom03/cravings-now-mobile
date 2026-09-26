import { ProductModifier } from "./product";

interface BranchSettings {
  branchTaxNumber: string;
  ngBusinessPlaceFirs: string;
  displayBackgroundImage: string | null;
  branchTaxRegistrationName: string;
  isWebsocketNotificationsEnabled: boolean;
  branchCommercialRegistrationNumber: string | null;
}

interface Branch {
  id: string;
  name: string;
  foodicsId: string;
  reference: string;
  name_localized: string;
  type: number;
  latitude: string;
  longitude: string;
  phone: string | null;
  openingFrom: string;
  openingTo: string;
  inventory_end_of_day_time: string;
  receipt_header: string;
  receipt_footer: string;
  settings: BranchSettings;
  receives_online_orders: boolean;
  accepts_reservations: boolean;
  reservation_duration: number;
  reservation_times: null;
  address: string | null;
  // products: ProductBranch;
}

type Category = {
  id: string;
  foodicsId: string;
  name: string;
  nameLocalized: string | null;
  reference: string | null;
  image: string | null;
};

// ─── Raw API response type (snake_case, as Foodics sends it) ──────────────────

// ─── Internal camelCase type ────────────────────────────────────────────────

interface Product {
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

interface ProductProps extends Product {
  category: Category;
  modifiers: ProductModifier[];
}

interface BrandProducts {
  products: ProductProps[];
}

interface Groups {
  id: string;
  foodicsId: string;
  name: string;
  nameLocalized: string | null;
  image: string | null;
  logo: string | null;
}

export { Branch, Product, Groups, BrandProducts, ProductProps, Category };
