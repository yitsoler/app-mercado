import type { HistoryMarket, HistoryTrip, HistoryTripStore } from "./types";

export function historyTotal(market: HistoryMarket): number {
  const listed = market.items.reduce((sum, item) => sum + item.total, 0);
  return listed + market.extraItemsTotal;
}

export function historyProductCount(market: HistoryMarket): number {
  return market.items.length + market.extraItemsCount;
}

export function tripTotal(trip: HistoryTrip): number {
  return trip.visits.reduce((sum, visit) => sum + historyTotal(visit), 0);
}

export function tripProductCount(trip: HistoryTrip): number {
  return trip.visits.reduce((sum, visit) => sum + historyProductCount(visit), 0);
}

export function tripStoreCount(trip: HistoryTrip): number {
  return new Set(trip.visits.map((visit) => visit.store)).size;
}

export function tripStores(trip: HistoryTrip): HistoryTripStore[] {
  const byStore = new Map<string, HistoryMarket[]>();
  for (const visit of trip.visits) {
    const list = byStore.get(visit.store) ?? [];
    list.push(visit);
    byStore.set(visit.store, list);
  }
  return [...byStore.entries()]
    .map(([store, visits]) => ({
      store,
      items: visits.flatMap((visit) => visit.items),
      total: visits.reduce((sum, visit) => sum + historyTotal(visit), 0),
    }))
    .toSorted((a, b) => a.store.localeCompare(b.store, "es"));
}

export function groupHistoryTrips(
  history: HistoryMarket[],
  activeTripId?: string | null,
): HistoryTrip[] {
  const groups = new Map<string, HistoryMarket[]>();
  for (const visit of history) {
    const tripId = visit.tripId || `dia-${visit.date}`;
    if (activeTripId && tripId === activeTripId) continue;
    const list = groups.get(tripId) ?? [];
    list.push(visit);
    groups.set(tripId, list);
  }
  return [...groups.entries()]
    .map(([id, visits]) => ({
      id,
      date: visits[0]?.date ?? "",
      visits,
    }))
    .toSorted((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
}
