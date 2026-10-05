import { Product, ProductModifier } from "./product";

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
