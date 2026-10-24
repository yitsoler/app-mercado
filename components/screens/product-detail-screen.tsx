"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Screen, TopBar } from "@/components/layout/app-shell";
import { ProductForm } from "@/components/products/product-form";
import { useAppState } from "@/components/providers/app-provider";
import { Icon } from "@/components/ui/icon";
import { Modal } from "@/components/ui/modal";
import { EmptyState, Field, PrimaryButton, SecondaryButton, TextInput } from "@/components/ui/primitives";
import { getCategory } from "@/lib/catalog";
import { formatCOP, formatLongDate, formatQuantity } from "@/lib/format";

export function ProductDetailScreen({ id }: { id: string }) {
  const router = useRouter();
  const { getProduct, updateProduct, toggleSelected, selectedIds, showToast } = useAppState();
  const product = getProduct(id);
  const [editing, setEditing] = useState(false);
  const [favorite, setFavorite] = useState(true);
  const [frequencyOpen, setFrequencyOpen] = useState(false);
  const [frequency, setFrequency] = useState(String(product?.frequencyDays ?? 8));

  if (!product) {
    return (
      <Screen padded={false}>
        <TopBar backHref="/lista" title="Detalle del producto" />
        <main className="px-space-md pt-6">
          <EmptyState
            description="El producto no existe en los datos de esta sesión."
            icon="inventory_2"
            title="Producto no encontrado"
          />
        </main>
      </Screen>
    );
  }

  const category = getCategory(product.categoryId);
  const unitPrice =
    product.habitualQuantity > 0 ? Math.round(product.lastPrice / product.habitualQuantity) : product.lastPrice;
  const selected = selectedIds.includes(product.id);

  return (
    <Screen padded={false}>
      <TopBar
        backHref="/lista"
        title="Detalle del producto"
        trailing={
          <>
            <button
              aria-label="Guardar en favoritos"
              className="flex h-10 w-10 items-center justify-center rounded-full text-primary hover:bg-surface-container"
              onClick={() => {
                setFavorite((value) => !value);
                showToast(favorite ? "Eliminado de favoritos" : "Guardado en tus favoritos");
              }}
              type="button"
            >
              <Icon className="text-[24px]" filled={favorite} name="favorite" />
            </button>
            <button
              aria-label="Editar producto"
              className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container"
              onClick={() => setEditing(true)}
              type="button"
            >
              <Icon className="text-[22px]" name="edit" />
            </button>
          </>
        }
      />

      <main className="space-y-space-md px-space-md pt-space-sm pb-8">
        <section className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-space-md">
          <div className="flex items-start gap-space-md">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-outline-variant/20 bg-surface-container-low text-primary">
              <Icon className="text-[40px]" filled name={category.icon} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full border border-secondary-container/60 bg-secondary-container/40 px-2.5 py-1 text-label-sm text-on-secondary-container">
                <Icon className="text-[13px]" name={category.icon} />
                {category.label}
              </div>
              <h2 className="truncate text-headline-md font-bold tracking-tight text-on-surface">
                {product.name}
              </h2>
              <div className="mt-2.5 flex items-center justify-between border-t border-outline-variant/25 pt-2">
                <div>
                  <span className="block text-label-sm text-on-surface-variant">Cantidad habitual</span>
                  <span className="text-label-lg font-semibold text-on-surface">
                    {formatQuantity(product.habitualQuantity, product.unit)}
                  </span>
                </div>
                <button
                  className="inline-flex items-center gap-1 rounded-xl bg-surface-container px-3 py-1.5 text-label-md text-primary"
                  onClick={() => setEditing(true)}
                  type="button"
                >
                  <Icon className="text-[16px]" name="tune" />
                  Modificar
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-space-md">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-container/50 text-primary">
                <Icon className="text-[18px]" name="receipt_long" />
              </div>
              <div>
                <p className="text-label-sm text-on-surface-variant">Último precio pagado</p>
                <h3 className="text-headline-lg font-bold tracking-tight text-on-surface">
                  {product.lastPrice ? formatCOP(product.lastPrice) : "Sin registro"}{" "}
                  <span className="text-label-md font-normal text-on-surface-variant">COP</span>
                </h3>
              </div>
            </div>
            {product.lastPrice ? (
              <div className="rounded-xl border border-outline-variant/20 bg-surface-container-low px-2.5 py-1.5 text-right">
                <span className="block text-label-sm text-on-surface-variant">Precio individual</span>
                <span className="text-label-md font-semibold text-primary">
                  {formatCOP(unitPrice)} / {product.unit === "unidades" ? "unidad" : product.unit}
                </span>
              </div>
            ) : null}
          </div>
          {product.lastPurchasedAt ? (
            <div className="flex items-center justify-between rounded-xl border border-outline-variant/15 bg-surface-container-low p-2.5">
              <div className="flex items-center gap-2">
                <Icon className="text-[18px] text-primary" name="store" />
                <div>
                  <span className="block text-label-sm font-semibold text-on-surface">{product.lastStore}</span>
                  <span className="text-body-sm text-on-surface-variant">
                    {formatLongDate(product.lastPurchasedAt)}
                  </span>
                </div>
              </div>
              <Icon className="text-[18px] text-outline" name="verified" />
            </div>
          ) : null}
        </section>

        <section className="rounded-2xl border border-outline-variant/35 bg-surface-container-low p-space-md">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Icon className="text-[20px] text-primary" name="autorenew" />
              <h4 className="text-headline-sm text-on-surface">Frecuencia de compra</h4>
            </div>
            <span className="rounded-full bg-primary-fixed px-2 py-0.5 text-label-sm font-bold text-on-primary-fixed-variant">
              Inteligente
            </span>
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <span className="text-display-lg tracking-tight text-primary">Cada {product.frequencyDays}</span>
            <span className="text-headline-md font-semibold text-on-surface">días</span>
            {product.nextPurchaseDate ? (
              <span className="ml-auto text-body-sm text-on-surface-variant">
                Próxima: {formatLongDate(product.nextPurchaseDate)}
              </span>
            ) : null}
          </div>
          <div className="mb-2.5 h-2 overflow-hidden rounded-full bg-surface-container-highest/60">
            <div className="h-full rounded-full bg-primary-container" style={{ width: "72%" }} />
          </div>
          <p className="mb-3 flex items-center gap-1.5 text-body-sm text-on-surface-variant">
            <Icon className="text-[15px] text-secondary" name="info" />
            Calculada con base en tus últimos mercados de prueba.
          </p>
          <button
            className="flex min-h-[42px] w-full items-center justify-center gap-1.5 rounded-xl border border-outline-variant/40 px-3 py-2 text-label-md text-on-surface"
            onClick={() => setFrequencyOpen(true)}
            type="button"
          >
            <Icon className="text-[18px] text-secondary" name="settings_suggest" />
            Modificar frecuencia manualmente
          </button>
        </section>

        <section className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-space-md">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h4 className="text-headline-sm text-on-surface">Historial de compras</h4>
              <span className="text-body-sm text-on-surface-variant">Tendencia de precio</span>
            </div>
          </div>
          {product.priceHistory.length === 0 ? (
            <p className="text-body-sm text-on-surface-variant">Aún no hay compras registradas.</p>
          ) : (
            <div className="relative space-y-4 before:absolute before:top-2 before:bottom-2 before:left-2.5 before:w-0.5 before:bg-outline-variant/40">
              {product.priceHistory.map((point, index) => (
                <div className="relative pl-6" key={`${point.date}-${index}`}>
                  <span
                    className={`absolute top-1.5 -left-[1px] h-3 w-3 rounded-full ${
                      index === 0 ? "bg-primary ring-4 ring-secondary-container" : "bg-outline-variant"
                    }`}
                  />
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-label-md font-semibold text-on-surface">{formatLongDate(point.date)}</p>
                      <p className="text-body-sm text-on-surface-variant">
                        {point.quantity} {product.unit} • {point.store}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="block text-label-lg font-bold text-on-surface">{formatCOP(point.total)}</span>
                      <span className="text-label-sm text-primary font-semibold">
                        {formatCOP(point.unitPrice)} c/u
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-2 pt-1 pb-4">
          <PrimaryButton
            className="w-full"
            onClick={() => {
              if (!selected) toggleSelected(product.id);
              showToast(
                selected
                  ? "Este producto ya estaba listo para el próximo mercado"
                  : `${formatQuantity(product.habitualQuantity, product.unit)} de ${product.name} agregadas a tu mercado`,
              );
              router.push("/preparar");
            }}
          >
            <Icon className="text-[20px]" name="add_shopping_cart" />
            Agregar a la próxima compra
          </PrimaryButton>
          <SecondaryButton className="w-full" onClick={() => setEditing(true)}>
            <Icon className="text-[18px]" name="done_all" />
            Guardar cambios
          </SecondaryButton>
        </section>
      </main>

      {editing ? (
        <Modal onClose={() => setEditing(false)} title="Editar producto">
          <ProductForm
            initial={product}
            onCancel={() => setEditing(false)}
            onSubmit={(draft) => {
              updateProduct(product.id, draft);
              setEditing(false);
            }}
            submitLabel="Guardar cambios"
          />
        </Modal>
      ) : null}

      {frequencyOpen ? (
        <Modal onClose={() => setFrequencyOpen(false)} title="Frecuencia de compra">
          <form
            className="flex flex-col gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              const days = Number(frequency);
              if (!Number.isFinite(days) || days <= 0) return;
              updateProduct(product.id, { frequencyDays: days });
              setFrequencyOpen(false);
            }}
          >
            <Field label="Días entre compras">
              <TextInput onChange={(event) => setFrequency(event.target.value)} value={frequency} />
            </Field>
            <PrimaryButton type="submit">Actualizar frecuencia</PrimaryButton>
          </form>
        </Modal>
      ) : null}
    </Screen>
  );
}
