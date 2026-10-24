import type { HistoryMarket } from "./types";

export function historyTotal(market: HistoryMarket): number {
  const listed = market.items.reduce((sum, item) => sum + item.total, 0);
  return listed + market.extraItemsTotal;
}

export function historyProductCount(market: HistoryMarket): number {
  return market.items.length + market.extraItemsCount;
}
