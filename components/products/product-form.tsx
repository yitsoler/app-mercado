"use client";

import { useState } from "react";
import { Field, PrimaryButton, SecondaryButton, SelectInput, TextInput } from "@/components/ui/primitives";
import { CATEGORIES, UNITS } from "@/lib/catalog";
import type { CategoryId, Product, ProductDraft, UnitId } from "@/lib/types";

export function ProductForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: Product;
  submitLabel: string;
  onSubmit: (draft: ProductDraft) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [categoryId, setCategoryId] = useState<CategoryId>(initial?.categoryId ?? "frutas");
  const [note, setNote] = useState(initial?.note ?? "");
  const [habitualQuantity, setHabitualQuantity] = useState(String(initial?.habitualQuantity ?? 1));
  const [unit, setUnit] = useState<UnitId>(initial?.unit ?? "unidades");
  const [error, setError] = useState("");

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        const quantity = Number(habitualQuantity.replace(",", "."));
        if (!name.trim()) {
          setError("Escribe el nombre del producto.");
          return;
        }
        if (!Number.isFinite(quantity) || quantity <= 0) {
          setError("La cantidad habitual debe ser mayor a cero.");
          return;
        }
        onSubmit({
          name: name.trim(),
          categoryId,
          note: note.trim(),
          habitualQuantity: quantity,
          unit,
        });
      }}
    >
      <Field label="Nombre">
        <TextInput onChange={(event) => setName(event.target.value)} value={name} />
      </Field>
      <Field label="Categoría">
        <SelectInput
          onChange={(event) => setCategoryId(event.target.value as CategoryId)}
          value={categoryId}
        >
          {CATEGORIES.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </SelectInput>
      </Field>
      <Field label="Nota">
        <TextInput
          onChange={(event) => setNote(event.target.value)}
          placeholder="Ej. Bolsa familiar"
          value={note}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Cantidad habitual">
          <TextInput
            inputMode="decimal"
            onChange={(event) => setHabitualQuantity(event.target.value)}
            value={habitualQuantity}
          />
        </Field>
        <Field label="Unidad">
          <SelectInput onChange={(event) => setUnit(event.target.value as UnitId)} value={unit}>
            {UNITS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </SelectInput>
        </Field>
      </div>
      {error ? <p className="text-body-sm text-error">{error}</p> : null}
      <div className="mt-2 flex flex-col gap-2">
        <PrimaryButton type="submit">{submitLabel}</PrimaryButton>
        <SecondaryButton onClick={onCancel} type="button">
          Cancelar
        </SecondaryButton>
      </div>
    </form>
  );
}
