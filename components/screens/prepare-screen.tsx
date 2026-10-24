"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Screen, TopBar } from "@/components/layout/app-shell";
import { ProductForm } from "@/components/products/product-form";
import { useAppState } from "@/components/providers/app-provider";
import { Icon } from "@/components/ui/icon";
import { Modal } from "@/components/ui/modal";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { StorePicker } from "@/components/ui/store-picker";
import { Checkbox, EmptyState, PrimaryButton, SearchField } from "@/components/ui/primitives";
import { CATEGORIES, getCategory } from "@/lib/catalog";
import { formatCOP, unitLabel } from "@/lib/format";
import type { Product } from "@/lib/types";

export function PrepareScreen() {
  const router = useRouter();
  const { products, selectedIds, toggleSelected, addProduct, startMarket, market } = useAppState();
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [store, setStore] = useState(market?.store ?? "");
  const [storeError, setStoreError] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>(() =>
    Object.fromEntries(products.map((product) => [product.id, product.habitualQuantity])),
  );

  const visible = useMemo(
    () => products.filter((product) => product.name.toLowerCase().includes(query.toLowerCase())),
    [products, query],
  );

  const grouped = CATEGORIES.map((category) => ({
    category,
    items: visible.filter((product) => product.categoryId === category.id),
  })).filter((group) => group.items.length > 0);

  const selectedProducts = products.filter((product) => selectedIds.includes(product.id));
  const estimate = selectedProducts.reduce((sum, product) => sum + (product.lastPrice || 0), 0);

  return (
    <Screen padded={false}>
      <TopBar backHref="/" subtitle="Selecciona lo que necesitas hoy" title="Preparar mercado" />
      <div className="px-space-md pt-3">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <SearchField onChange={setQuery} placeholder="Buscar producto..." value={query} />
          </div>
          <button
            className="flex h-12 shrink-0 items-center gap-1.5 rounded-xl border border-outline-variant/30 bg-surface-container-high px-3.5 text-label-md text-primary hover:bg-secondary-container"
            onClick={() => setCreating(true)}
            type="button"
          >
            <Icon className="text-[18px]" name="add" />
            Producto
          </button>
        </div>
      </div>

      <main className="flex flex-1 flex-col gap-5 px-space-md pt-3 pb-56">
        {market ? (
          <div className="rounded-2xl border border-outline-variant/40 bg-surface-container p-3.5 text-body-sm text-on-surface-variant">
            Ya tienes un mercado en curso. Puedes continuar en Mi mercado o iniciar uno nuevo con
            esta selección.
          </div>
        ) : null}

        <div className="flex items-start gap-3 rounded-2xl border border-outline-variant/40 bg-surface-container p-3.5">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary-container text-primary">
            <Icon className="text-[18px]" filled name="tune" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-label-md font-bold text-primary">Lista inteligente activa</span>
              <span className="rounded-full bg-secondary-container px-2 py-0.5 text-label-sm font-bold text-on-secondary-fixed">
                {selectedIds.length} / {products.length} listos
              </span>
            </div>
            <p className="mt-0.5 text-body-sm leading-snug text-on-surface-variant">
              Los productos no marcados seguirán guardados en tu lista habitual.
            </p>
          </div>
        </div>

        {grouped.length === 0 ? (
          <EmptyState
            description="No hay coincidencias. Agrega un producto nuevo si lo necesitas hoy."
            icon="grocery"
            title="Sin productos para preparar"
          />
        ) : (
          grouped.map((group) => (
            <section className="flex flex-col gap-2.5" key={group.category.id}>
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Icon className="text-[19px] text-primary" name={group.category.icon} />
                  <h2 className="text-[16px] font-bold text-on-surface">{group.category.label}</h2>
                </div>
                <span className="text-label-sm font-semibold text-outline">
                  {group.items.filter((item) => selectedIds.includes(item.id)).length} seleccionados
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {group.items.map((product) => (
                  <PrepareRow
                    key={product.id}
                    onQuantity={(value) =>
                      setQuantities((current) => ({ ...current, [product.id]: value }))
                    }
                    onToggle={() => toggleSelected(product.id)}
                    product={product}
                    quantity={quantities[product.id] ?? product.habitualQuantity}
                    selected={selectedIds.includes(product.id)}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      <div className="fixed right-0 bottom-16 left-0 z-40 mx-auto max-w-3xl border-t border-outline-variant/20 bg-surface/95 px-space-md pt-3 pb-6 shadow-[0_-4px_20px_rgba(39,48,41,0.06)] backdrop-blur-md lg:bottom-0">
        <StorePicker
          error={storeError}
          onChange={(place) => {
            setStore(place);
            if (storeError) setStoreError("");
          }}
          value={store}
        />
        <div className="mt-2.5 mb-2.5 flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            <span className="text-label-md font-bold text-on-surface">
              {selectedIds.length} productos listos
            </span>
          </div>
          <span className="text-label-sm font-semibold text-secondary">
            Estimado: ~{formatCOP(estimate)}
          </span>
        </div>
        <PrimaryButton
          className="w-full"
          disabled={selectedIds.length === 0}
          onClick={() => {
            const place = store.trim();
            if (!place) {
              setStoreError("Indica el lugar donde vas a realizar esta compra.");
              return;
            }
            void startMarket(
              selectedProducts.map((product) => ({
                productId: product.id,
                quantity: quantities[product.id] ?? product.habitualQuantity,
              })),
              place,
            ).then((started) => {
              if (started) router.push("/mercado");
            });
          }}
        >
          Iniciar mercado
          <Icon className="text-[20px]" name="shopping_cart_checkout" />
        </PrimaryButton>
      </div>

      {creating ? (
        <Modal onClose={() => setCreating(false)} title="Nuevo producto">
          <ProductForm
            onCancel={() => setCreating(false)}
            onSubmit={(draft) => {
              void addProduct(draft).then((id) => {
                if (!id) return;
                setQuantities((current) => ({ ...current, [id]: draft.habitualQuantity }));
                if (!selectedIds.includes(id)) {
                  toggleSelected(id);
                }
                setCreating(false);
              });
            }}
            submitLabel="Agregar y seleccionar"
          />
        </Modal>
      ) : null}
    </Screen>
  );
}

function PrepareRow({
  product,
  selected,
  quantity,
  onToggle,
  onQuantity,
}: {
  product: Product;
  selected: boolean;
  quantity: number;
  onToggle: () => void;
  onQuantity: (value: number) => void;
}) {
  const category = getCategory(product.categoryId);
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-2xl border p-3 transition-all ${
        selected
          ? "border-outline-variant/40 bg-surface-container-lowest shadow-[0_2px_8px_rgba(39,48,41,0.03)]"
          : "border-outline-variant/20 bg-surface-container-lowest/60 opacity-70"
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <Checkbox checked={selected} label={`Seleccionar ${product.name}`} onChange={onToggle} />
        <div className="truncate">
          <span
            className={`block truncate text-label-lg font-semibold ${
              selected ? "text-on-surface" : "font-medium text-outline"
            }`}
          >
            {product.name}
          </span>
          <span className={`text-body-sm ${selected ? "text-on-surface-variant" : "text-outline/80"}`}>
            {selected ? product.note || category.label : "Guardado en habitual"}
          </span>
        </div>
      </div>
      {selected ? (
        <QuantityStepper
          onChange={onQuantity}
          step={product.unit === "kg" ? 0.5 : product.unit === "g" ? 50 : 1}
          unit={unitLabel(product.unit, quantity)}
          value={quantity}
        />
      ) : (
        <span className="px-3 py-1 text-label-sm text-outline">Omitido</span>
      )}
    </div>
  );
}
