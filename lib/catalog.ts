import { formatMonthLabel, formatMonthShort } from "./format";
import type { CategoryId, UnitId } from "./types";

export const CATEGORIES: Array<{
  id: CategoryId;
  label: string;
  shortLabel: string;
  icon: string;
}> = [
  { id: "frutas", label: "Frutas y verduras", shortLabel: "Frutas", icon: "nutrition" },
  { id: "carnes", label: "Carnes y pescados", shortLabel: "Carnes", icon: "restaurant" },
  { id: "lacteos", label: "Lácteos y huevos", shortLabel: "Lácteos", icon: "egg" },
  { id: "despensa", label: "Despensa", shortLabel: "Despensa", icon: "kitchen" },
  { id: "bebidas", label: "Bebidas", shortLabel: "Bebidas", icon: "local_cafe" },
  { id: "aseo", label: "Aseo del hogar", shortLabel: "Aseo", icon: "cleaning_services" },
  { id: "cuidado", label: "Cuidado personal", shortLabel: "Cuidado", icon: "spa" },
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
  return CATEGORIES.find((category) => category.id === id) ?? CATEGORIES[0];
}

export function monthOption(key: string) {
  return {
    key,
    label: formatMonthLabel(key),
    shortLabel: formatMonthShort(key),
  };
}
