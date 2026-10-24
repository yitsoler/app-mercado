"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Screen, TopBar } from "@/components/layout/app-shell";
import { useAppState } from "@/components/providers/app-provider";
import { Icon } from "@/components/ui/icon";
import { ChipScroller } from "@/components/ui/chip-scroller";
import { EmptyState } from "@/components/ui/primitives";
import { monthOption } from "@/lib/catalog";
import { historyProductCount, historyTotal } from "@/lib/data";
import { formatCOP, formatLongDate, monthKey } from "@/lib/format";

export function HistoryScreen() {
  const { history, currentMonth } = useAppState();
  const [filter, setFilter] = useState("todos");
  const months = useMemo(() => {
    const keys = new Set(history.map((entry) => monthKey(entry.date)));
    if (currentMonth) keys.add(currentMonth);
    return [...keys].toSorted().toReversed().map((key) => monthOption(key));
  }, [currentMonth, history]);
  const filtered = useMemo(
    () => (filter === "todos" ? history : history.filter((entry) => monthKey(entry.date) === filter)),
    [filter, history],
  );

  return (
    <Screen padded={false}>
      <TopBar />
      <main className="flex-1 space-y-4 px-space-md pt-4 pb-8">
        <section>
          <h1 className="text-headline-md font-bold text-on-surface">Historial</h1>
          <p className="text-body-sm text-on-surface-variant">
            Cada visita al supermercado, con fecha, lugar y total.
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
            description="Cuando termines una compra, el recibo aparece aquí."
            icon="receipt_long"
            title="No hay compras"
          />
        ) : (
          <ul className="divide-y divide-outline-variant/30 overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-container-lowest">
            {filtered.map((entry) => (
              <li key={entry.id}>
                <Link
                  className="flex items-center justify-between gap-3 px-4 py-3.5"
                  href={`/historial/${entry.id}`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-body-md font-semibold text-on-surface">{entry.store}</p>
                    <p className="text-label-sm text-on-surface-variant">
                      {formatLongDate(entry.date)} · {historyProductCount(entry)} productos
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-label-lg font-bold text-primary tabular">
                      {formatCOP(historyTotal(entry))}
                    </span>
                    <Icon className="text-outline" name="chevron_right" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </Screen>
  );
}
