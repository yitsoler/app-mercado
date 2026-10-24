"use client";

import { useEffect, useRef, useState } from "react";
import { useAppState } from "@/components/providers/app-provider";
import { Icon } from "@/components/ui/icon";
import { SecondaryButton, TextInput } from "@/components/ui/primitives";

export function StorePicker({
  value,
  onChange,
  error,
  label = "Lugar de compra",
  menu = "up",
}: {
  value: string;
  onChange: (store: string) => void;
  error?: string;
  label?: string;
  menu?: "up" | "down";
}) {
  const { stores, addStore, updateStore, deleteStore } = useAppState();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");

  const closeMenu = () => {
    setOpen(false);
    setAdding(false);
    setEditingId(null);
  };

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        closeMenu();
      }
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [open]);

  const submitNew = () => {
    void addStore(draft).then((store) => {
      if (!store) return;
      onChange(store.name);
      setDraft("");
      setAdding(false);
      setOpen(false);
    });
  };

  const saveEdit = (id: string) => {
    const previous = stores.find((store) => store.id === id);
    void updateStore(id, editDraft).then((store) => {
      if (!store) return;
      if (previous && previous.name === value) {
        onChange(store.name);
      }
      setEditingId(null);
    });
  };

  return (
    <div ref={rootRef}>
      <p className="mb-1.5 text-label-md text-on-surface-variant">{label}</p>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3 text-primary">
          <Icon className="text-[20px]" name="storefront" />
        </span>
        <button
          aria-expanded={open}
          aria-haspopup="listbox"
          className="flex h-[50px] w-full items-center rounded-[14px] border border-outline-variant/40 bg-surface-container-lowest pr-10 pl-10 text-left text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
          onClick={() => setOpen((current) => !current)}
          type="button"
        >
          <span className={value ? "truncate" : "truncate text-outline"}>
            {value || "¿Dónde compras? Ej. Éxito, Carulla..."}
          </span>
        </button>
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-outline">
          <Icon className="text-[20px]" name={open ? "expand_less" : "expand_more"} />
        </span>

        {open ? (
          <div
            className={`absolute right-0 left-0 z-50 overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-container-lowest shadow-lg ${
              menu === "up" ? "bottom-[calc(100%+6px)]" : "top-[calc(100%+6px)]"
            }`}
          >
            <ul className="max-h-56 overflow-y-auto py-1" role="listbox">
              {stores.length === 0 ? (
                <li className="px-4 py-3 text-body-sm text-on-surface-variant">
                  Aún no hay lugares. Agrega el primero.
                </li>
              ) : (
                stores.map((store) => {
                  const active = store.name === value;
                  if (editingId === store.id) {
                    return (
                      <li className="flex items-center gap-2 px-2 py-1.5" key={store.id}>
                        <TextInput
                          aria-label={`Nuevo nombre de ${store.name}`}
                          className="h-10"
                          onChange={(event) => setEditDraft(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              saveEdit(store.id);
                            }
                          }}
                          value={editDraft}
                        />
                        <button
                          aria-label="Guardar nombre"
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-primary hover:bg-surface-container"
                          onClick={() => saveEdit(store.id)}
                          type="button"
                        >
                          <Icon className="text-[18px]" name="check" />
                        </button>
                      </li>
                    );
                  }
                  return (
                    <li className="flex items-center gap-0.5 pr-1" key={store.id}>
                      <button
                        aria-selected={active}
                        className={`flex min-w-0 flex-1 items-center justify-between px-4 py-2.5 text-left text-body-md ${
                          active
                            ? "bg-secondary-container/60 font-semibold text-primary"
                            : "text-on-surface hover:bg-surface-container"
                        }`}
                        onClick={() => {
                          onChange(store.name);
                          closeMenu();
                        }}
                        role="option"
                        type="button"
                      >
                        <span className="truncate">{store.name}</span>
                        {active ? <Icon className="text-[18px]" name="check" /> : null}
                      </button>
                      <button
                        aria-label={`Editar ${store.name}`}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-outline hover:bg-surface-container hover:text-primary"
                        onClick={(event) => {
                          event.stopPropagation();
                          setEditingId(store.id);
                          setEditDraft(store.name);
                          setAdding(false);
                        }}
                        type="button"
                      >
                        <Icon className="text-[18px]" name="edit" />
                      </button>
                      <button
                        aria-label={`Eliminar ${store.name}`}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-outline hover:bg-surface-container hover:text-error"
                        onClick={(event) => {
                          event.stopPropagation();
                          deleteStore(store.id);
                          if (active) onChange("");
                        }}
                        type="button"
                      >
                        <Icon className="text-[18px]" name="delete" />
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
            <div className="border-t border-outline-variant/30 p-2">
              {adding ? (
                <div className="flex gap-2">
                  <TextInput
                    aria-label="Nombre del nuevo lugar"
                    autoComplete="off"
                    className="h-11"
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        submitNew();
                      }
                    }}
                    placeholder="Nombre del lugar"
                    value={draft}
                  />
                  <SecondaryButton className="h-11 shrink-0 px-4" onClick={submitNew}>
                    Guardar
                  </SecondaryButton>
                </div>
              ) : (
                <button
                  className="flex h-11 w-full items-center justify-center gap-1 rounded-xl text-label-md font-semibold text-primary hover:bg-surface-container"
                  onClick={() => {
                    setAdding(true);
                    setEditingId(null);
                  }}
                  type="button"
                >
                  <Icon className="text-[18px]" name="add" />
                  Agregar lugar
                </button>
              )}
            </div>
          </div>
        ) : null}
      </div>
      {error ? <p className="mt-1 text-body-sm text-error">{error}</p> : null}
    </div>
  );
}
