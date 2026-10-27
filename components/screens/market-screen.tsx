"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Screen, TopBar } from "@/components/layout/app-shell";
import { useAppState, useMarketTotals } from "@/components/providers/app-provider";
import { StorePicker } from "@/components/ui/store-picker";
import { EmptyState, PrimaryButton } from "@/components/ui/primitives";
import { formatCOP, formatCOPPlain, parseCOPInput, shortUnit } from "@/lib/format";

export function MarketScreen() {
  const router = useRouter();
  const {
    market,
    getProduct,
    markPurchased,
    returnToPending,
    updateMarketPrice,
    updateMarketStore,
    finishMarket,
    endMarket,
  } = useAppState();
  const { purchased, pending, subtotal } = useMarketTotals();
  const items = market ? [...pending, ...purchased] : [];

  if (!market) {
    return (
      <Screen padded={false}>
        <TopBar />
        <main className="px-space-md pt-6">
          <EmptyState
            description="Elige productos en Mi lista y arma la compra de hoy."
            icon="shopping_cart"
            title="No hay una compra en curso"
          />
          <Link
            className="mt-4 flex min-h-[50px] items-center justify-center rounded-2xl bg-primary text-label-lg font-semibold text-on-primary"
            href="/preparar"
          >
            Armar mercado
          </Link>
        </main>
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <TopBar title="Mi Mercado" />
      <main className="flex-1 space-y-4 px-space-md pt-4 pb-40">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-headline-md font-bold text-on-surface">Compra de hoy</h1>
            <p className="text-body-sm text-on-surface-variant">
              {purchased.length} de {items.length} comprados en este lugar
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3 rounded-2xl bg-primary px-3 py-2 text-on-primary shadow-lg">
            <div>
              <p className="text-label-sm text-on-primary/80">Total de lo comprado</p>
              <p className="text-headline-sm font-bold tabular">{formatCOP(subtotal)}</p>
            </div>
            {purchased.length > 0 ? (
              <PrimaryButton
                className="min-h-10 bg-surface-container-lowest px-4 text-label-md text-primary hover:bg-surface"
                onClick={() => {
                  void finishMarket();
                }}
              >
                Guardar esta tienda
              </PrimaryButton>
            ) : null}
          </div>
        </div>

        <StorePicker
          label="Dónde compras ahora"
          menu="down"
          onChange={updateMarketStore}
          value={market.store}
        />
        <p className="text-body-sm text-on-surface-variant">
          Guarda lo de esta tienda y sigue mercando en otra. Cuando ya no vayas a más lugares, finaliza el
          mercado.
        </p>

        {items.length === 0 ? (
          <EmptyState
            description="Esta tienda ya quedó guardada. Agrega más productos o finaliza el mercado."
            icon="storefront"
            title="Lista de esta tienda vacía"
          />
        ) : (
          <ul className="divide-y divide-outline-variant/30 overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-container-lowest">
            {items.map((item) => {
              const product = getProduct(item.productId);
              if (!product) return null;
              const bought = item.purchased;

              return (
                <li
                  className={`flex items-center gap-3 px-3 py-3 ${bought ? "bg-secondary-container/20" : ""}`}
                  key={item.productId}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body-md font-semibold text-on-surface">{product.name}</p>
                    <p className="text-label-sm text-on-surface-variant">
                      {item.quantity} {shortUnit(product.unit)}
                    </p>
                  </div>
                  <div className="flex items-center rounded-xl border border-outline-variant/40 bg-surface px-2 py-1">
                    <span className="text-label-md font-bold text-primary">$</span>
                    <input
                      aria-label={`Precio de ${product.name}`}
                      className="w-16 border-0 bg-transparent p-0 text-right text-label-lg font-bold text-on-surface focus:ring-0 focus:outline-none tabular"
                      onChange={(event) =>
                        updateMarketPrice(item.productId, parseCOPInput(event.target.value))
                      }
                      value={formatCOPPlain(item.unitPrice)}
                    />
                  </div>
                  <button
                    aria-label={
                      bought ? `Quitar ${product.name} de comprados` : `Marcar ${product.name} como comprado`
                    }
                    className={`inline-flex min-h-10 min-w-[88px] shrink-0 items-center justify-center rounded-full px-3 text-label-md font-semibold ${
                      bought
                        ? "bg-primary text-on-primary"
                        : "border border-outline text-on-surface-variant"
                    }`}
                    onClick={() =>
                      bought ? returnToPending(item.productId) : markPurchased(item.productId)
                    }
                    type="button"
                  >
                    {bought ? "Listo" : "Compré"}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      <div className="fixed right-0 bottom-16 left-0 z-40 mx-auto flex max-w-3xl gap-2 border-t border-outline-variant/20 bg-surface/95 px-space-md py-3 lg:bottom-0">
        <Link
          className="inline-flex min-h-[50px] flex-1 items-center justify-center rounded-2xl bg-secondary-container/70 px-4 text-label-md font-semibold text-primary"
          href="/preparar"
        >
          Añadir
        </Link>
        <PrimaryButton
          className="flex-1"
          onClick={() => {
            void endMarket().then((done) => {
              if (done) router.push("/historial");
            });
          }}
        >
          Finalizar mercado
        </PrimaryButton>
      </div>
    </Screen>
  );
}
