"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Screen, TopBar } from "@/components/layout/app-shell";
import { ProductForm } from "@/components/products/product-form";
import { useAppState } from "@/components/providers/app-provider";
import { Icon } from "@/components/ui/icon";
import { Modal } from "@/components/ui/modal";
import { ChipScroller } from "@/components/ui/chip-scroller";
import { Checkbox, EmptyState, SearchField } from "@/components/ui/primitives";
import { CATEGORIES, getCategory } from "@/lib/catalog";
import { formatQuantity } from "@/lib/format";
import type { CategoryId, Product } from "@/lib/types";

export function ListScreen() {
  const { products, selectedIds, toggleSelected, addProduct, updateProduct, deleteProduct, market } =
    useAppState();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryId | "todas">("todas");
  const [editing, setEditing] = useState<Product | null>(null);
  const [creatingIn, setCreatingIn] = useState<CategoryId | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);

  const groups = useMemo(() => {
    const needle = query.toLowerCase();
    return CATEGORIES.map((item) => ({
      category: item,
      items: products.filter((product) => {
        const matchesQuery = product.name.toLowerCase().includes(needle);
        return product.categoryId === item.id && matchesQuery;
      }),
    })).filter((group) => {
      if (category !== "todas" && group.category.id !== category) return false;
      if (query.trim()) return group.items.length > 0;
      return true;
    });
  }, [category, products, query]);

  return (
    <Screen padded={false}>
      <TopBar />
      <main className="flex flex-1 flex-col px-space-md pt-space-sm">
        <section className="mt-2 mb-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-headline-md font-bold tracking-tight text-on-surface">
                Mi lista habitual
              </h1>
              <div className="mt-0.5 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary-container" />
                <p className="text-label-md font-semibold text-primary">
                  {products.length} productos guardados
                </p>
              </div>
            </div>
            <Link
              className="inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-2xl bg-primary px-3.5 text-label-md font-semibold text-on-primary shadow-lg"
              href="/preparar"
            >
              <Icon className="text-[18px]" name={market ? "shopping_cart" : "shopping_cart_checkout"} />
              {market
                ? "Añadir"
                : `Armar mercado${selectedIds.length ? ` (${selectedIds.length})` : ""}`}
            </Link>
          </div>
        </section>

        <section className="mb-4">
          <div className="flex items-start gap-3 rounded-2xl border border-outline-variant/40 bg-surface-container-low p-3 shadow-[0_2px_8px_rgba(39,48,41,0.02)]">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary-container/70">
              <Icon className="text-lg text-primary" filled name="checklist" />
            </div>
            <p className="text-body-sm leading-snug text-on-surface-variant">
              Aquí guardas lo que compras siempre. Al guardar una tienda, lo comprado se desmarca
              solo. Lo que falte sigue listo para otra.
            </p>
          </div>
        </section>

        <section className="mb-4">
          <SearchField
            onChange={setQuery}
            placeholder="Buscar en tu lista permanente..."
            value={query}
          />
        </section>

        <ChipScroller className="mb-4">
          <Chip
            active={category === "todas"}
            label="Todas"
            onClick={() => setCategory("todas")}
          />
          {CATEGORIES.map((item) => (
            <Chip
              active={category === item.id}
              key={item.id}
              label={item.label}
              onClick={() => setCategory(item.id)}
            />
          ))}
        </ChipScroller>

        <section className="flex flex-col gap-6 pb-8">
          {groups.length === 0 ? (
            <EmptyState
              description="Prueba con otro término o agrega un producto desde su categoría."
              icon="search_off"
              title="No hay productos para esta búsqueda"
            />
          ) : (
            groups.map((group) => (
              <div className="flex flex-col gap-2.5" key={group.category.id}>
                <div className="flex items-center justify-between gap-3 px-1">
                  <div className="flex min-w-0 items-center gap-2">
                    <Icon className="text-[20px] text-primary" name={group.category.icon} />
                    <h2 className="truncate text-[16px] font-bold text-on-surface">
                      {group.category.label}
                    </h2>
                    <span className="text-label-sm font-semibold text-outline">
                      {group.items.length}
                    </span>
                  </div>
                  <button
                    className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-full bg-primary px-3 text-label-md font-semibold text-on-primary"
                    onClick={() => setCreatingIn(group.category.id)}
                    type="button"
                  >
                    <Icon className="text-[18px]" name="add" />
                    Agregar
                  </button>
                </div>
                {group.items.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-outline-variant/50 px-4 py-3 text-body-sm text-on-surface-variant">
                    Aún no hay productos en {group.category.label.toLowerCase()}.
                  </p>
                ) : (
                  group.items.map((product) => {
                    const selected = selectedIds.includes(product.id);
                    return (
                      <article
                        className={`flex items-center justify-between rounded-2xl border p-3.5 shadow-[0_2px_8px_rgba(39,48,41,0.03)] ${
                          selected
                            ? "border-primary/25 bg-secondary-container/30"
                            : "border-outline-variant/40 bg-surface-container-lowest"
                        }`}
                        key={product.id}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <Checkbox
                            checked={selected}
                            label={`Incluir ${product.name} en el próximo mercado`}
                            onChange={() => toggleSelected(product.id)}
                          />
                          <Link className="min-w-0" href={`/productos/${product.id}`}>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="truncate text-body-md font-semibold text-on-surface">
                                {product.name}
                              </h3>
                              {selected ? (
                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-label-sm font-semibold text-primary">
                                  Para el mercado
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-0.5 text-body-sm text-outline">
                              Cantidad habitual:{" "}
                              <span className="font-semibold text-primary">
                                {formatQuantity(product.habitualQuantity, product.unit)}
                              </span>
                            </p>
                          </Link>
                        </div>
                        <div className="flex shrink-0 items-center gap-0.5 pl-2">
                          <button
                            aria-label={`Editar ${product.name}`}
                            className="flex h-8 w-8 items-center justify-center rounded-xl text-outline hover:bg-surface-container-low hover:text-primary"
                            onClick={() => setEditing(product)}
                            type="button"
                          >
                            <Icon className="text-lg" name="edit" />
                          </button>
                          <button
                            aria-label={`Eliminar ${product.name}`}
                            className="flex h-8 w-8 items-center justify-center rounded-xl text-outline hover:bg-error-container/40 hover:text-error"
                            onClick={() => setPendingDelete(product)}
                            type="button"
                          >
                            <Icon className="text-lg" name="delete" />
                          </button>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            ))
          )}
        </section>
      </main>

      {creatingIn ? (
        <Modal
          onClose={() => setCreatingIn(null)}
          title={`Agregar en ${getCategory(creatingIn).label}`}
        >
          <ProductForm
            key={creatingIn}
            onCancel={() => setCreatingIn(null)}
            onSubmit={(draft) => {
              void addProduct(draft).then((id) => {
                if (id) setCreatingIn(null);
              });
            }}
            presetCategory={creatingIn}
            submitLabel="Guardar producto"
          />
        </Modal>
      ) : null}

      {editing ? (
        <Modal onClose={() => setEditing(null)} title="Editar producto">
          <ProductForm
            initial={editing}
            onCancel={() => setEditing(null)}
            onSubmit={(draft) => {
              void updateProduct(editing.id, draft).then(() => setEditing(null));
            }}
            submitLabel="Guardar cambios"
          />
        </Modal>
      ) : null}

      {pendingDelete ? (
        <Modal onClose={() => setPendingDelete(null)} title="Eliminar producto">
          <p className="mb-4 text-body-md text-on-surface-variant">
            ¿Quieres eliminar {pendingDelete.name} de la lista habitual? También se quitará de una
            compra en curso si estaba incluido.
          </p>
          <div className="flex flex-col gap-2">
            <button
              className="min-h-[50px] rounded-2xl bg-error text-label-lg font-semibold text-on-error"
              onClick={() => {
                void deleteProduct(pendingDelete.id).then(() => setPendingDelete(null));
              }}
              type="button"
            >
              Sí, eliminar
            </button>
            <button
              className="h-12 rounded-2xl bg-surface-container text-label-md text-on-surface-variant"
              onClick={() => setPendingDelete(null)}
              type="button"
            >
              Cancelar
            </button>
          </div>
        </Modal>
      ) : null}
    </Screen>
  );
}

function Chip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`h-9 shrink-0 rounded-full px-3.5 text-label-md transition-all ${
        active
          ? "bg-primary text-on-primary shadow-sm"
          : "border border-outline-variant/50 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container"
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}
