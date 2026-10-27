export type CategoryId =
  | "frutas"
  | "carnes"
  | "lacteos"
  | "despensa"
  | "bebidas"
  | "aseo"
  | "cuidado";

export type UnitId =
  | "unidades"
  | "kg"
  | "litros"
  | "bandeja"
  | "bolsas"
  | "botella"
  | "galon"
  | "g";

export type Product = {
  id: string;
  name: string;
  categoryId: CategoryId;
  note: string;
  habitualQuantity: number;
  unit: UnitId;
  lastPrice: number;
  lastPurchasedAt: string;
  lastStore: string;
  frequencyDays: number;
  nextPurchaseDate: string;
  priceHistory: PricePoint[];
};

export type PricePoint = {
  date: string;
  store: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type MarketItem = {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  purchased: boolean;
};

export type MarketStatus = "idle" | "active" | "completed";

export type ActiveMarket = {
  id: string;
  tripId: string;
  store: string;
  date: string;
  status: MarketStatus;
  items: MarketItem[];
};

export type HistoryMarketItem = {
  productId: string;
  name: string;
  quantity: number;
  unit: UnitId;
  total: number;
};

export type HistoryMarket = {
  id: string;
  tripId: string;
  store: string;
  date: string;
  payment: string;
  ticket?: string;
  items: HistoryMarketItem[];
  extraItemsCount: number;
  extraItemsTotal: number;
};

export type HistoryTripStore = {
  store: string;
  items: HistoryMarketItem[];
  total: number;
};

export type HistoryTrip = {
  id: string;
  date: string;
  visits: HistoryMarket[];
};

export type MonthlySnapshot = {
  key: string;
  label: string;
  shortLabel: string;
  total: number;
  markets: number;
  budget: number;
  previousTotal?: number;
  categories: Array<{
    categoryId: CategoryId | "otros";
    amount: number;
  }>;
  chartHeight: number;
};

export type Store = {
  id: string;
  name: string;
};

export type HouseholdUser = {
  userId: string;
  email: string;
  displayName: string;
  role: "owner" | "member" | string;
};

export type ProductDraft = {
  name: string;
  categoryId: CategoryId;
  note: string;
  habitualQuantity: number;
  unit: UnitId;
};
