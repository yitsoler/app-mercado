"use client";

import { Screen, TopBar } from "@/components/layout/app-shell";
import { useHistoryTrips } from "@/components/providers/app-provider";
import { Icon } from "@/components/ui/icon";
import { EmptyState } from "@/components/ui/primitives";
import { tripProductCount, tripStoreCount, tripStores, tripTotal } from "@/lib/data";
import { formatCOP, formatLongDate, formatQuantity } from "@/lib/format";

export function HistoryDetailScreen({ id }: { id: string }) {
  const trips = useHistoryTrips();
  const trip = trips.find((entry) => entry.id === id);

  if (!trip) {
    return (
      <Screen padded={false}>
        <TopBar backHref="/historial" title="Detalle de compra" />
        <main className="px-space-md pt-6">
          <EmptyState
            description="Esta compra no está en el historial guardado."
            icon="receipt_long"
            title="Compra no encontrada"
          />
        </main>
      </Screen>
    );
  }

  const stores = tripStores(trip);
  const storeCount = tripStoreCount(trip);
  const productCount = tripProductCount(trip);

  return (
    <Screen padded={false}>
      <TopBar backHref="/historial" title="Detalle de compra" />
      <main className="space-y-4 px-space-md pt-4 pb-8">
        <section className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-4">
          <p className="text-label-sm text-on-surface-variant">{formatLongDate(trip.date)}</p>
          <h1 className="text-headline-md font-bold text-on-surface">Mercado del día</h1>
          <div className="mt-3 flex items-center justify-between border-t border-outline-variant/20 pt-3">
            <span className="text-body-sm text-on-surface-variant">
              {storeCount} {storeCount === 1 ? "tienda" : "tiendas"} · {productCount}{" "}
              {productCount === 1 ? "producto" : "productos"}
            </span>
            <span className="text-headline-sm font-bold text-primary tabular">
              {formatCOP(tripTotal(trip))}
            </span>
          </div>
        </section>

        {stores.map((place) => (
          <section
            className="overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest"
            key={place.store}
          >
            <div className="flex items-center justify-between gap-3 border-b border-outline-variant/20 px-4 py-3">
              <div className="flex min-w-0 items-center gap-2">
                <Icon className="text-[20px] text-primary" name="storefront" />
                <h2 className="truncate text-label-lg font-semibold text-on-surface">{place.store}</h2>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-label-sm text-on-surface-variant">Total gastado</p>
                <p className="text-headline-sm font-bold text-primary tabular">{formatCOP(place.total)}</p>
              </div>
            </div>
            <ul className="divide-y divide-outline-variant/20">
              {place.items.map((item, index) => (
                <li
                  className="flex items-center justify-between gap-3 px-4 py-3"
                  key={`${place.store}-${item.productId}-${index}`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-body-md font-semibold text-on-surface">{item.name}</p>
                    <p className="text-label-sm text-on-surface-variant">
                      {formatQuantity(item.quantity, item.unit)}
                    </p>
                  </div>
                  <span className="text-label-md font-bold text-on-surface tabular">
                    {formatCOP(item.total)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between border-t border-outline-variant/20 bg-secondary-container/40 px-4 py-3">
              <span className="text-label-md font-semibold text-on-surface">
                Total gastado en {place.store}
              </span>
              <span className="text-label-lg font-bold text-primary tabular">
                {formatCOP(place.total)}
              </span>
            </div>
          </section>
        ))}
      </main>
    </Screen>
  );
}
