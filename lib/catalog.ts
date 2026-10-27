import { formatMonthLabel, formatMonthShort } from "./format";
import type { CategoryId, UnitId } from "./types";

export const CATEGORIES: Array<{
  id: CategoryId;
  label: string;
  shortLabel: string;
  icon: string;
}> = [
  { id: "carnes", label: "Carnes", shortLabel: "Carnes", icon: "restaurant" },
  { id: "cuidado", label: "Aseo personal", shortLabel: "Aseo personal", icon: "spa" },
  { id: "aseo", label: "Aseo del hogar", shortLabel: "Aseo hogar", icon: "cleaning_services" },
  { id: "lacteos", label: "Lácteos y huevos", shortLabel: "Lácteos", icon: "egg" },
  { id: "frutas", label: "Frutas y verduras", shortLabel: "Frutas", icon: "nutrition" },
  { id: "despensa", label: "Despensa", shortLabel: "Despensa", icon: "kitchen" },
];

export const UNITS: Array<{ id: UnitId; label: string }> = [
  { id: "unidades", label: "Unidades" },
  { id: "kg", label: "Kilogramos" },
  { id: "litros", label: "Litros" },
  { id: "bandeja", label: "Bandeja" },
  { id: "bolsas", label: "Bolsas" },
  { id: "botella", label: "Botella" },
  { id: "galon", label: "Galón" },
  { id: "g", label: "Gramos" },
];

export function getCategory(id: CategoryId) {
  return (
    CATEGORIES.find((category) => category.id === id) ?? {
      id,
      label: id === "bebidas" ? "Bebidas" : "Otros",
      shortLabel: id === "bebidas" ? "Bebidas" : "Otros",
      icon: "grocery",
    }
  );
}

export function monthOption(key: string) {
  return {
    key,
    label: formatMonthLabel(key),
    shortLabel: formatMonthShort(key),
  };
}
