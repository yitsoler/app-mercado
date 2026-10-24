"use client";

import Link from "next/link";
import { Screen, TopBar } from "@/components/layout/app-shell";
import { useAppState, useMonthSummary } from "@/components/providers/app-provider";
import { Icon } from "@/components/ui/icon";
import { formatCOP } from "@/lib/format";

export function HomeScreen() {
  const { market, currentMonth, month } = useAppState();
  const summary = useMonthSummary(currentMonth || month);
  const pending = market?.items.filter((item) => !item.purchased).length ?? 0;
  const prepareHref = market ? "/mercado" : "/preparar";

  return (
    <Screen padded={false}>
      <TopBar />
      <main className="flex-1 space-y-5 px-space-md pt-space-sm">
        <div>
          <h1 className="text-headline-md font-bold text-on-surface">¿Qué haces hoy?</h1>
          <p className="text-body-sm text-on-surface-variant">
            Desde aquí armas la compra. El detalle de meses y recibos está en las otras pantallas.
          </p>
        </div>

        <Link
          className="flex min-h-[72px] items-center justify-between rounded-2xl bg-primary px-5 py-4 text-on-primary shadow-sm"
          href={prepareHref}
        >
          <div>
            <p className="text-label-lg font-bold">
              {market ? "Seguir la compra de hoy" : "Armar la compra de hoy"}
            </p>
            <p className="text-label-sm text-on-primary/80">
              {market
                ? `${pending} productos por marcar en ${market.store}`
                : "Elige productos de tu lista y empieza"}
            </p>
          </div>
          <Icon name="arrow_forward" />
        </Link>

        <Link
          className="flex items-center justify-between rounded-2xl border border-outline-variant/40 bg-surface-container-lowest px-4 py-3.5"
          href="/lista"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-container/50 text-primary">
              <Icon className="text-[22px]" name="checklist" />
            </div>
            <div>
              <p className="text-label-lg font-semibold text-on-surface">Mi lista</p>
              <p className="text-body-sm text-on-surface-variant">Lo que sueles comprar</p>
            </div>
          </div>
          <Icon className="text-outline" name="chevron_right" />
        </Link>

        <section className="grid grid-cols-2 gap-3">
          <Link
            className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-4"
            href="/gastos"
          >
            <p className="text-label-sm text-on-surface-variant">Este mes</p>
            <p className="mt-1 text-headline-sm font-bold text-primary tabular">
              {formatCOP(summary.total)}
            </p>
            <p className="mt-2 text-label-sm font-medium text-primary">Ver gastos</p>
          </Link>
          <Link
            className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-4"
            href="/historial"
          >
            <p className="text-label-sm text-on-surface-variant">Compras hechas</p>
            <p className="mt-1 text-headline-sm font-bold text-on-surface">{summary.markets}</p>
            <p className="mt-2 text-label-sm font-medium text-primary">Ver historial</p>
          </Link>
        </section>
      </main>
    </Screen>
  );
}
