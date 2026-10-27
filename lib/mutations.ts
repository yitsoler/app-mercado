import { requireHouseholdId } from "@/lib/household";
import { getSupabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";
import { todayKey } from "@/lib/format";
import type { HistoryMarket, MarketItem, Product, ProductDraft, Store } from "@/lib/types";

type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];

function throwIf(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

export async function persistUserName(name: string) {
  const supabase = getSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Inicia sesión para guardar tu nombre");
  const { error } = await supabase.from("profiles").update({ display_name: name }).eq("user_id", user.id);
  throwIf(error);
}

export async function persistSelected(id: string, selected: boolean) {
  const supabase = getSupabase();
  const { error } = await supabase.from("products").update({ selected }).eq("id", id);
  throwIf(error);
}

export async function persistProduct(draft: ProductDraft): Promise<Product> {
  const supabase = getSupabase();
  const householdId = await requireHouseholdId();
  const { data, error } = await supabase
    .from("products")
    .insert({
      household_id: householdId,
      name: draft.name.trim(),
      category_id: draft.categoryId,
      note: draft.note,
      habitual_quantity: draft.habitualQuantity,
      unit: draft.unit,
      selected: false,
    })
    .select()
    .single();
  throwIf(error);
  if (!data) throw new Error("No se pudo crear el producto");
  return {
    id: data.id,
    name: data.name,
    categoryId: data.category_id as Product["categoryId"],
    note: data.note,
    habitualQuantity: Number(data.habitual_quantity),
    unit: data.unit as Product["unit"],
    lastPrice: data.last_price,
    lastPurchasedAt: data.last_purchased_at ?? "",
    lastStore: data.last_store,
    frequencyDays: data.frequency_days,
    nextPurchaseDate: data.next_purchase_date ?? "",
    priceHistory: [],
  };
}

export async function persistProductUpdate(
  id: string,
  draft: Partial<ProductDraft> & { frequencyDays?: number },
) {
  const supabase = getSupabase();
  const payload: ProductUpdate = {};
  if (draft.name !== undefined) payload.name = draft.name.trim();
  if (draft.categoryId !== undefined) payload.category_id = draft.categoryId;
  if (draft.note !== undefined) payload.note = draft.note;
  if (draft.habitualQuantity !== undefined) payload.habitual_quantity = draft.habitualQuantity;
  if (draft.unit !== undefined) payload.unit = draft.unit;
  if (draft.frequencyDays !== undefined) payload.frequency_days = draft.frequencyDays;
  if (Object.keys(payload).length === 0) return;
  const { error } = await supabase.from("products").update(payload).eq("id", id);
  throwIf(error);
}

export async function persistProductDelete(id: string) {
  const supabase = getSupabase();
  const items = await supabase.from("market_items").delete().eq("product_id", id);
  throwIf(items.error);
  const { error } = await supabase.from("products").delete().eq("id", id);
  throwIf(error);
}

export async function persistStore(name: string): Promise<Store> {
  const supabase = getSupabase();
  const householdId = await requireHouseholdId();
  const { data, error } = await supabase
    .from("stores")
    .insert({ household_id: householdId, name })
    .select("id, name")
    .single();
  throwIf(error);
  if (!data) throw new Error("No se pudo crear el lugar");
  return data;
}

export async function persistStoreUpdate(id: string, name: string) {
  const supabase = getSupabase();
  const store = await supabase.from("stores").update({ name }).eq("id", id);
  throwIf(store.error);
  const markets = await supabase.from("markets").update({ store_name: name }).eq("store_id", id);
  throwIf(markets.error);
}

export async function persistStoreDelete(id: string) {
  const supabase = getSupabase();
  const { error } = await supabase.from("stores").delete().eq("id", id);
  throwIf(error);
}

export async function persistMarketStore(marketId: string, storeId: string | null, storeName: string) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("markets")
    .update({ store_id: storeId, store_name: storeName })
    .eq("id", marketId);
  throwIf(error);
}

export async function persistMarketItem(
  itemId: string,
  patch: { quantity?: number; unitPrice?: number; purchased?: boolean },
) {
  const supabase = getSupabase();
  const payload: { quantity?: number; unit_price?: number; purchased?: boolean } = {};
  if (patch.quantity !== undefined) payload.quantity = patch.quantity;
  if (patch.unitPrice !== undefined) payload.unit_price = patch.unitPrice;
  if (patch.purchased !== undefined) payload.purchased = patch.purchased;
  const { error } = await supabase.from("market_items").update(payload).eq("id", itemId);
  throwIf(error);
}

export async function persistStartMarket(
  items: Array<{ productId: string; quantity: number; name: string; unit: string; unitPrice: number }>,
  store: Store | { id: string | null; name: string },
  previousMarketId?: string | null,
): Promise<{ id: string; tripId: string; date: string; items: MarketItem[] }> {
  const supabase = getSupabase();
  const householdId = await requireHouseholdId();
  if (previousMarketId) {
    throwIf((await supabase.from("markets").delete().eq("id", previousMarketId)).error);
  }
  const tripId = crypto.randomUUID();

  const { data: market, error } = await supabase
    .from("markets")
    .insert({
      household_id: householdId,
      store_id: store.id,
      store_name: store.name,
      market_date: todayKey(),
      status: "active",
      trip_id: tripId,
    })
    .select("id, market_date, trip_id")
    .single();
  throwIf(error);
  if (!market) throw new Error("No se pudo iniciar el mercado");

  const { data: rows, error: itemsError } = await supabase
    .from("market_items")
    .insert(
      items.map((item) => ({
        household_id: householdId,
        market_id: market.id,
        product_id: item.productId,
        product_name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unitPrice,
        purchased: false,
      })),
    )
    .select("id, product_id, quantity, unit_price, purchased");
  throwIf(itemsError);

  return {
    id: market.id,
    tripId: market.trip_id || tripId,
    date: market.market_date,
    items: (rows ?? []).map((row) => ({
      id: row.id,
      productId: row.product_id ?? "",
      quantity: Number(row.quantity),
      unitPrice: row.unit_price,
      purchased: row.purchased,
    })),
  };
}

export async function persistAddMarketItems(
  marketId: string,
  items: Array<{ productId: string; quantity: number; name: string; unit: string; unitPrice: number }>,
): Promise<MarketItem[]> {
  if (items.length === 0) return [];
  const supabase = getSupabase();
  const householdId = await requireHouseholdId();
  const { data: rows, error } = await supabase
    .from("market_items")
    .insert(
      items.map((item) => ({
        household_id: householdId,
        market_id: marketId,
        product_id: item.productId,
        product_name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unitPrice,
        purchased: false,
      })),
    )
    .select("id, product_id, quantity, unit_price, purchased");
  throwIf(error);
  return (rows ?? []).map((row) => ({
    id: row.id,
    productId: row.product_id ?? "",
    quantity: Number(row.quantity),
    unitPrice: row.unit_price,
    purchased: row.purchased,
  }));
}

export async function persistEndMarket(marketId: string) {
  const supabase = getSupabase();
  throwIf((await supabase.from("market_items").delete().eq("market_id", marketId)).error);
  throwIf((await supabase.from("markets").delete().eq("id", marketId)).error);
}

export async function persistSaveStoreVisit(input: {
  activeMarketId: string;
  tripId: string;
  storeId: string;
  storeName: string;
  date: string;
  purchased: Array<{
    id: string;
    productId: string;
    name: string;
    quantity: number;
    unit: Product["unit"];
    total: number;
  }>;
}): Promise<HistoryMarket> {
  const supabase = getSupabase();
  const householdId = await requireHouseholdId();
  const bought = input.purchased.filter((item) => item.productId);
  const tripId = input.tripId || crypto.randomUUID();
  const { data: completed, error: createError } = await supabase
    .from("markets")
    .insert({
      household_id: householdId,
      store_id: input.storeId,
      store_name: input.storeName,
      market_date: input.date,
      status: "completed",
      payment: "Registro",
      trip_id: tripId,
    })
    .select("id")
    .single();
  throwIf(createError);
  if (!completed) throw new Error("No se pudo guardar la compra de esta tienda");

  const moved = await supabase
    .from("market_items")
    .update({ market_id: completed.id, purchased: true })
    .in(
      "id",
      bought.map((item) => item.id),
    );
  throwIf(moved.error);

  const historyRows = bought.map((item) => ({
    household_id: householdId,
    product_id: item.productId,
    purchased_on: input.date,
    store_name: input.storeName,
    quantity: item.quantity,
    unit_price: Math.round(item.total / Math.max(item.quantity, 1)),
    total: item.total,
  }));

  const writes = [
    historyRows.length > 0
      ? supabase.from("price_history").insert(historyRows)
      : Promise.resolve({ error: null }),
    ...bought.map((item) =>
      supabase
        .from("products")
        .update({
          last_price: item.total,
          last_purchased_at: input.date,
          last_store: input.storeName,
          selected: false,
        })
        .eq("id", item.productId),
    ),
  ];
  const results = await Promise.all(writes);
  for (const result of results) {
    throwIf(result.error);
  }

  throwIf(
    (
      await supabase
        .from("markets")
          .update({ store_id: null, store_name: "", trip_id: tripId })
          .eq("id", input.activeMarketId)
    ).error,
  );

  return {
    id: completed.id,
    tripId,
    store: input.storeName,
    date: input.date,
    payment: "Registro",
    extraItemsCount: 0,
    extraItemsTotal: 0,
    items: bought.map((item) => ({
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      total: item.total,
    })),
  };
}
