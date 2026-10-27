import { requireHouseholdId } from "@/lib/household";
import { getSupabase } from "@/lib/supabase/client";
import type { ActiveMarket, CategoryId, HistoryMarket, Product, Store, UnitId } from "@/lib/types";

export type HouseholdState = {
  currentUserId: string;
  isAdmin: boolean;
  userName: string;
  userEmail: string;
  userRole: "owner" | "member";
  monthlyBudget: number;
  stores: Store[];
  products: Product[];
  selectedIds: string[];
  market: ActiveMarket | null;
  history: HistoryMarket[];
};

function asUnit(value: string): UnitId {
  return value as UnitId;
}

function asCategory(value: string): CategoryId {
  return value as CategoryId;
}

export async function loadHouseholdState(): Promise<HouseholdState | null> {
  const supabase = getSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const household = await requireHouseholdId();

  const [profileRes, householdRes, storesRes, productsRes, historyRes, marketsRes, itemsRes, memberRes] =
    await Promise.all([
      supabase.from("profiles").select("display_name").eq("user_id", user.id).maybeSingle(),
      supabase.from("households").select("monthly_budget, display_name").eq("id", household).maybeSingle(),
      supabase.from("stores").select("id, name").eq("household_id", household).order("name"),
      supabase.from("products").select("*").eq("household_id", household).order("name"),
      supabase.from("price_history").select("*").eq("household_id", household).order("purchased_on", { ascending: false }),
      supabase.from("markets").select("*").eq("household_id", household).order("market_date", { ascending: false }),
      supabase.from("market_items").select("*").eq("household_id", household),
      supabase.from("household_members").select("role").eq("user_id", user.id).maybeSingle(),
    ]);

  const firstError =
    profileRes.error ||
    householdRes.error ||
    storesRes.error ||
    productsRes.error ||
    historyRes.error ||
    marketsRes.error ||
    itemsRes.error ||
    memberRes.error;
  if (firstError) {
    throw new Error(firstError.message);
  }

  const historyByProduct = new Map<string, Product["priceHistory"]>();
  for (const point of historyRes.data ?? []) {
    const list = historyByProduct.get(point.product_id) ?? [];
    list.push({
      date: point.purchased_on,
      store: point.store_name,
      quantity: Number(point.quantity),
      unitPrice: point.unit_price,
      total: point.total,
    });
    historyByProduct.set(point.product_id, list);
  }

  const products: Product[] = (productsRes.data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    categoryId: asCategory(row.category_id),
    note: row.note,
    habitualQuantity: Number(row.habitual_quantity),
    unit: asUnit(row.unit),
    lastPrice: row.last_price,
    lastPurchasedAt: row.last_purchased_at ?? "",
    lastStore: row.last_store,
    frequencyDays: row.frequency_days,
    nextPurchaseDate: row.next_purchase_date ?? "",
    priceHistory: historyByProduct.get(row.id) ?? [],
  }));

  const itemsByMarket = new Map<string, typeof itemsRes.data>();
  for (const item of itemsRes.data ?? []) {
    const list = itemsByMarket.get(item.market_id) ?? [];
    list.push(item);
    itemsByMarket.set(item.market_id, list);
  }

  const active = (marketsRes.data ?? []).find((row) => row.status === "active");
  const completed = (marketsRes.data ?? []).filter((row) => row.status === "completed");

  return {
    currentUserId: user.id,
    isAdmin: memberRes.data?.role === "owner",
    userName:
      profileRes.data?.display_name ||
      user.email?.split("@")[0] ||
      householdRes.data?.display_name ||
      "Usuario",
    userEmail: user.email ?? "",
    userRole: memberRes.data?.role === "owner" ? "owner" : "member",
    monthlyBudget: householdRes.data?.monthly_budget ?? 950_000,
    stores: (storesRes.data ?? []).map((row) => ({ id: row.id, name: row.name })),
    products,
    selectedIds: (productsRes.data ?? []).filter((row) => row.selected).map((row) => row.id),
    market: active
      ? {
          id: active.id,
          tripId: active.trip_id || active.id,
          store: active.store_name,
          date: active.market_date,
          status: "active",
          items: (itemsByMarket.get(active.id) ?? []).map((item) => ({
            id: item.id,
            productId: item.product_id ?? item.id,
            quantity: Number(item.quantity),
            unitPrice: item.unit_price,
            purchased: item.purchased,
          })),
        }
      : null,
    history: completed.map((row) => {
      const items = itemsByMarket.get(row.id) ?? [];
      return {
        id: row.id,
        tripId: row.trip_id || `dia-${row.market_date}`,
        store: row.store_name,
        date: row.market_date,
        payment: row.payment,
        ticket: row.ticket ?? undefined,
        extraItemsCount: row.extra_items_count,
        extraItemsTotal: row.extra_items_total,
        items: items
          .filter((item) => item.purchased)
          .map((item) => ({
            productId: item.product_id ?? item.id,
            name: item.product_name,
            quantity: Number(item.quantity),
            unit: asUnit(item.unit),
            total: item.unit_price,
          })),
      };
    }),
  };
}
