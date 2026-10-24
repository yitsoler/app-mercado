"use client";

import { Screen, TopBar } from "@/components/layout/app-shell";
import { useAppState } from "@/components/providers/app-provider";
import { Icon } from "@/components/ui/icon";
import { EmptyState } from "@/components/ui/primitives";
import { historyProductCount, historyTotal } from "@/lib/data";
import { formatCOP, formatLongDate } from "@/lib/format";

export function HistoryDetailScreen({ id }: { id: string }) {
  const { history } = useAppState();
  const entry = history.find((item) => item.id === id);

  if (!entry) {
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

  return (
    <Screen padded={false}>
      <TopBar backHref="/historial" title="Detalle de compra" />
      <main className="space-y-4 px-space-md pt-4">
        <section className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-4">
          <p className="text-label-sm text-on-surface-variant">{formatLongDate(entry.date)}</p>
          <h1 className="text-headline-md font-bold text-on-surface">{entry.store}</h1>
          <div className="mt-3 flex items-center justify-between border-t border-outline-variant/20 pt-3">
            <span className="text-body-sm text-on-surface-variant">
              {historyProductCount(entry)} productos
            </span>
            <span className="text-headline-sm font-bold text-primary tabular">
              {formatCOP(historyTotal(entry))} COP
            </span>
          </div>
          <p className="mt-2 text-label-sm text-secondary">{entry.payment}</p>
        </section>
        <section className="space-y-2">
          {entry.items.map((item) => (
            <article
              className="flex items-center justify-between rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-4"
              key={`${item.productId}-${item.name}`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-container text-primary">
                  <Icon className="text-[20px]" name="shopping_bag" />
                </div>
                <div>
                  <p className="text-label-lg font-semibold text-on-surface">{item.name}</p>
                  <p className="text-body-sm text-on-surface-variant">
                    {item.quantity} {item.unit}
                  </p>
                </div>
              </div>
              <span className="text-label-lg font-bold text-primary tabular">{formatCOP(item.total)}</span>
            </article>
          ))}
          {entry.extraItemsCount > 0 ? (
            <div className="rounded-2xl bg-surface-container-low p-4 text-body-sm text-on-surface-variant">
              Hay {entry.extraItemsCount} productos adicionales por {formatCOP(entry.extraItemsTotal)} COP.
            </div>
          ) : null}
        </section>
      </main>
    </Screen>
  );
}
