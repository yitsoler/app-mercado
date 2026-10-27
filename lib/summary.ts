import { historyProductCount, historyTotal } from "@/lib/data";
import { lastFourMonths, monthKey, shiftMonth } from "@/lib/format";
import type { CategoryId, HistoryMarket, MonthlySnapshot, Product } from "@/lib/types";

const BUCKETS = new Set<CategoryId | "otros">(["frutas", "carnes", "lacteos", "aseo", "otros"]);

function categoryBucket(categoryId?: CategoryId): CategoryId | "otros" {
  if (categoryId && BUCKETS.has(categoryId)) return categoryId;
  return "otros";
}

export function categoryTotals(
  history: HistoryMarket[],
  products: Product[],
  month: string,
): MonthlySnapshot["categories"] {
  const productById = new Map(products.map((product) => [product.id, product]));
  const amounts = new Map<CategoryId | "otros", number>();

  for (const market of history) {
    if (monthKey(market.date) !== month) continue;
    for (const item of market.items) {
      const bucket = categoryBucket(productById.get(item.productId)?.categoryId);
      amounts.set(bucket, (amounts.get(bucket) ?? 0) + item.total);
    }
    if (market.extraItemsTotal > 0) {
      amounts.set("otros", (amounts.get("otros") ?? 0) + market.extraItemsTotal);
    }
  }

  return [...amounts.entries()]
    .filter(([, amount]) => amount > 0)
    .map(([categoryId, amount]) => ({ categoryId, amount }))
    .toSorted((a, b) => b.amount - a.amount);
}

export function deriveMonthSnapshots(
  history: HistoryMarket[],
  products: Product[],
  budget: number,
  currentMonth: string,
): MonthlySnapshot[] {
  const keys = lastFourMonths(currentMonth);
  const totals = keys.map((key) =>
    history
      .filter((entry) => monthKey(entry.date) === key)
      .reduce((sum, entry) => sum + historyTotal(entry), 0),
  );
  const peak = Math.max(...totals, 1);

  return keys.map((key, index) => {
    const finished = history.filter((entry) => monthKey(entry.date) === key);
    const total = totals[index];
    const previousKey = shiftMonth(key, -1);
    const previousTotal = history
      .filter((entry) => monthKey(entry.date) === previousKey)
      .reduce((sum, entry) => sum + historyTotal(entry), 0);
    return {
      key,
      label: key,
      shortLabel: key,
      total,
      markets: new Set(finished.map((entry) => entry.tripId || entry.date)).size,
      budget,
      previousTotal,
      categories: categoryTotals(history, products, key),
      chartHeight: total > 0 ? Math.max(12, Math.round((total / peak) * 100)) : 8,
    };
  });
}

export function monthSummaryFromHistory(
  history: HistoryMarket[],
  products: Product[],
  month: string,
  budget: number,
) {
  const finished = history.filter((entry) => monthKey(entry.date) === month);
  const total = finished.reduce((sum, entry) => sum + historyTotal(entry), 0);
  const previous = history
    .filter((entry) => monthKey(entry.date) === shiftMonth(month, -1))
    .reduce((sum, entry) => sum + historyTotal(entry), 0);
  return {
    finished,
    total,
    markets: new Set(finished.map((entry) => entry.tripId || entry.date)).size,
    budget,
    previous,
    productCount: finished.reduce((sum, entry) => sum + historyProductCount(entry), 0),
    categories: categoryTotals(history, products, month),
  };
}
