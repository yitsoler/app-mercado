"use client";

import Link from "next/link";
import { Screen, TopBar } from "@/components/layout/app-shell";
import { useAppState, useMonthSummary } from "@/components/providers/app-provider";
import { Icon } from "@/components/ui/icon";
import { CATEGORIES } from "@/lib/catalog";
import { formatCOP, formatMonthLabel, formatMonthShort, percent, shiftMonth } from "@/lib/format";

const CATEGORY_COLORS: Record<string, string> = {
  carnes: "bg-primary",
  frutas: "bg-primary-container",
  lacteos: "bg-secondary",
  aseo: "bg-tertiary-container",
  otros: "bg-secondary-fixed-dim",
};

export function ExpensesScreen() {
  const { month, setMonth } = useAppState();
  const summary = useMonthSummary(month);
  const snapshot = summary.snapshot;
  const available = Math.max(summary.budget - summary.total, 0);
  const previous = summary.previous ?? 0;
  const delta = previous ? ((previous - summary.total) / previous) * 100 : 0;
  const categories = snapshot?.categories ?? summary.categories;

  return (
    <Screen padded={false}>
      <TopBar backHref="/" title="Gastos" />
      <div className="px-space-md pt-3">
        <div className="flex items-center justify-between rounded-full border border-outline-variant/30 bg-surface-container-lowest px-3 py-1.5">
          <button
            aria-label="Mes anterior"
            className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container"
            onClick={() => setMonth(shiftMonth(month, -1))}
            type="button"
          >
            <Icon className="text-[20px]" name="chevron_left" />
          </button>
          <div className="flex items-center gap-1.5">
            <Icon className="text-[18px] text-primary" name="calendar_today" />
            <span className="text-label-lg font-semibold text-on-surface">
              {month ? formatMonthLabel(month) : "Este mes"}
            </span>
          </div>
          <button
            aria-label="Mes siguiente"
            className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container"
            onClick={() => setMonth(shiftMonth(month, 1))}
            type="button"
          >
            <Icon className="text-[20px]" name="chevron_right" />
          </button>
        </div>
      </div>

      <div className="mt-2 flex flex-col gap-space-lg px-space-md pb-8">
        <p className="text-body-sm text-on-surface-variant">
          Resumen del mes: total, presupuesto y en qué categorías se fue el dinero.
        </p>
        <section className="flex flex-col gap-4 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-space-md">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-label-sm font-semibold tracking-wider text-outline uppercase">
                Total gastado
              </span>
              <div className="mt-0.5 text-display-lg tracking-tight text-primary tabular">
                {formatCOP(summary.total)}{" "}
                <span className="text-body-sm font-normal text-outline">COP</span>
              </div>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-secondary-container/60 px-2.5 py-1 text-secondary">
              <Icon className="text-[15px]" filled name="shopping_bag" />
              <span className="text-label-sm font-semibold">{summary.markets} compras</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 rounded-xl bg-surface-container-low/70 p-3">
            <div className="flex items-center justify-between text-body-sm">
              <span className="text-on-surface-variant">Presupuesto mensual</span>
              <span className="font-semibold text-on-surface">{formatCOP(summary.budget)} COP</span>
            </div>
            <div className="flex h-3 items-center overflow-hidden rounded-full bg-surface-variant p-0.5">
              <div
                className="h-full rounded-full bg-primary-container"
                style={{ width: `${Math.min(summary.usage, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between pt-0.5 text-label-sm text-outline">
              <span>{summary.usage}% utilizado</span>
              <span className="font-medium text-primary">Disponible: {formatCOP(available)} COP</span>
            </div>
          </div>
          {previous ? (
            <div className="flex items-center gap-2.5 rounded-xl border border-secondary-container bg-secondary-container/40 p-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary-container text-primary">
                <Icon className="text-[18px]" name={delta >= 0 ? "trending_down" : "trending_up"} />
              </div>
              <p className="text-body-sm leading-snug text-on-surface">
                <span className="font-semibold text-primary">
                  {Math.abs(delta).toFixed(1)}% {delta >= 0 ? "menos" : "más"}
                </span>{" "}
                que el mes anterior ({formatCOP(previous)} COP)
              </p>
            </div>
          ) : null}
        </section>

        <section className="flex flex-col gap-3 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-space-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className="text-[20px] text-primary" name="bar_chart" />
              <h2 className="text-headline-sm text-on-surface">Tendencia mensual</h2>
            </div>
            <span className="text-label-sm text-outline">Últimos 4 meses</span>
          </div>
          <div className="flex h-36 items-end justify-between gap-4 px-2 pt-5 pb-2">
            {summary.snapshots.map((item) => {
              const active = item.key === month;
              return (
                <button
                  className="flex h-full flex-1 flex-col items-end justify-end gap-2"
                  key={item.key}
                  onClick={() => setMonth(item.key)}
                  type="button"
                >
                  <span className={`text-label-sm ${active ? "font-bold text-primary" : "text-outline"}`}>
                    ${Math.round(item.total / 1000)}k
                  </span>
                  <div
                    className={`w-full max-w-[42px] rounded-t-lg ${active ? "bg-primary-container" : "bg-surface-container"}`}
                    style={{ height: `${item.chartHeight}%` }}
                  />
                  <span className={`text-label-md ${active ? "font-bold text-primary" : "text-on-surface-variant"}`}>
                    {formatMonthShort(item.key)}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-space-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className="text-[20px] text-primary" name="donut_small" />
              <h2 className="text-headline-sm text-on-surface">Gastos por categoría</h2>
            </div>
            <span className="text-label-sm font-semibold text-primary">
              {categories.length} rubros
            </span>
          </div>
          {categories.length === 0 ? (
            <p className="text-body-sm text-on-surface-variant">
              Cuando termines compras este mes, aquí verás cómo se reparte el gasto.
            </p>
          ) : (
            <div className="flex flex-col gap-3.5">
              {categories.map((item) => {
                const label =
                  item.categoryId === "otros"
                    ? "Otros"
                    : CATEGORIES.find((category) => category.id === item.categoryId)?.label ??
                      item.categoryId;
                const share = percent(item.amount, summary.total);
                return (
                  <div className="flex flex-col gap-1.5" key={item.categoryId}>
                    <div className="flex items-center justify-between text-body-sm">
                      <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${CATEGORY_COLORS[item.categoryId] ?? "bg-outline"}`} />
                        <span className="font-medium text-on-surface">{label}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-on-surface">{formatCOP(item.amount)}</span>
                        <span className="ml-1 text-label-sm text-outline">({share}%)</span>
                      </div>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-surface-container-low">
                      <div
                        className={`h-full rounded-full ${CATEGORY_COLORS[item.categoryId] ?? "bg-outline"}`}
                        style={{ width: `${share}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <Link className="text-center text-label-md font-semibold text-primary" href="/historial">
          Ver recibos en Historial
        </Link>
      </div>
    </Screen>
  );
}
