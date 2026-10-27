"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Screen, TopBar } from "@/components/layout/app-shell";
import { useHistoryTrips, useAppState } from "@/components/providers/app-provider";
import { ChipScroller } from "@/components/ui/chip-scroller";
import { EmptyState } from "@/components/ui/primitives";
import { monthOption } from "@/lib/catalog";
import { tripProductCount, tripStoreCount, tripTotal } from "@/lib/data";
import { formatCOP, formatLongDate, monthKey } from "@/lib/format";

export function HistoryScreen() {
  const { currentMonth } = useAppState();
  const trips = useHistoryTrips();
  const [filter, setFilter] = useState("todos");
  const months = useMemo(() => {
    const keys = new Set(trips.map((entry) => monthKey(entry.date)));
    if (currentMonth) keys.add(currentMonth);
    return [...keys].toSorted().toReversed().map((key) => monthOption(key));
  }, [currentMonth, trips]);
  const filtered = useMemo(
    () => (filter === "todos" ? trips : trips.filter((entry) => monthKey(entry.date) === filter)),
    [filter, trips],
  );

  return (
    <Screen padded={false}>
      <TopBar />
      <main className="flex-1 space-y-4 px-space-md pt-4 pb-8">
        <section>
          <h1 className="text-headline-md font-bold text-on-surface">Historial</h1>
          <p className="text-body-sm text-on-surface-variant">
            Cada mercado finalizado, con fecha y total. El detalle muestra las tiendas.
          </p>
        </section>

        <ChipScroller>
          <button
            className={`h-9 shrink-0 rounded-full px-4 text-label-md ${
              filter === "todos"
                ? "bg-primary text-on-primary"
                : "border border-outline-variant/40 bg-surface-container-lowest text-on-surface-variant"
            }`}
            onClick={() => setFilter("todos")}
            type="button"
          >
            Todos
          </button>
          {months.map((item) => (
            <button
              className={`h-9 shrink-0 rounded-full px-4 text-label-md ${
                filter === item.key
                  ? "bg-primary text-on-primary"
                  : "border border-outline-variant/40 bg-surface-container-lowest text-on-surface-variant"
              }`}
              key={item.key}
              onClick={() => setFilter(item.key)}
              type="button"
            >
              {item.label.replace(/\s\d{4}$/, "")}
            </button>
          ))}
        </ChipScroller>

        {filtered.length === 0 ? (
          <EmptyState
            description="Cuando finalices un mercado, aparece aquí con su fecha y total."
            icon="receipt_long"
            title="No hay compras"
          />
        ) : (
          <ul className="divide-y divide-outline-variant/30 overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-container-lowest">
            {filtered.map((trip) => {
              const stores = tripStoreCount(trip);
              const products = tripProductCount(trip);
              return (
                <li className="flex items-center gap-3 px-4 py-3.5" key={trip.id}>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body-md font-semibold text-on-surface">
                      {formatLongDate(trip.date)}
                    </p>
                    <p className="text-label-sm text-on-surface-variant">
                      {stores} {stores === 1 ? "tienda" : "tiendas"} · {products}{" "}
                      {products === 1 ? "producto" : "productos"}
                    </p>
                  </div>
                  <span className="text-label-lg font-bold text-primary tabular">
                    {formatCOP(tripTotal(trip))}
                  </span>
                  <Link
                    className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-full bg-primary px-4 text-label-md font-semibold text-on-primary"
                    href={`/historial/${trip.id}`}
                  >
                    Detalle
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </Screen>
  );
}
