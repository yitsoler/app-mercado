import type { UnitId } from "./types";

function formatThousands(value: number): string {
  const rounded = Math.round(Math.abs(value));
  const grouped = String(rounded).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return value < 0 ? `-${grouped}` : grouped;
}

export function formatCOP(value: number): string {
  return `$${formatThousands(value)}`;
}

export function formatCOPPlain(value: number): string {
  return formatThousands(value);
}

export function parseCOPInput(value: string): number {
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return 0;
  return Number.parseInt(digits, 10);
}

export function formatQuantity(quantity: number, unit: UnitId): string {
  const amount =
    Number.isInteger(quantity) ? String(quantity) : quantity.toFixed(1).replace(".", ",");
  return `${amount} ${unitLabel(unit, quantity)}`;
}

export function unitLabel(unit: UnitId, quantity = 1): string {
  switch (unit) {
    case "unidades":
      return quantity === 1 ? "unidad" : "unidades";
    case "kg":
      return "kg";
    case "litros":
      return quantity === 1 ? "litro" : "litros";
    case "bandeja":
      return quantity === 1 ? "bandeja" : "bandejas";
    case "bolsas":
      return quantity === 1 ? "bolsa" : "bolsas";
    case "botella":
      return quantity === 1 ? "botella" : "botellas";
    case "galon":
      return quantity === 1 ? "galón" : "galones";
    case "g":
      return "g";
  }
}

export function shortUnit(unit: UnitId): string {
  switch (unit) {
    case "unidades":
      return "un";
    case "litros":
      return "L";
    case "bandeja":
      return "bnd";
    case "bolsas":
      return "bolsas";
    case "botella":
      return "bot";
    case "galon":
      return "gal";
    default:
      return unit;
  }
}

const WEEKDAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MONTH_NAMES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

function parseIsoDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return { year, month, day, utc: new Date(Date.UTC(year, month - 1, day)) };
}

export function formatLongDate(isoDate: string): string {
  const { year, month, day, utc } = parseIsoDate(isoDate);
  const text = `${WEEKDAYS[utc.getUTCDay()]}, ${day} de ${MONTH_NAMES[month - 1]} de ${year}`;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatShortDate(isoDate: string): string {
  const { month, day } = parseIsoDate(isoDate);
  return `${day} de ${MONTH_NAMES[month - 1]}`;
}

export function formatMonthLabel(isoMonth: string): string {
  const [year, month] = isoMonth.split("-").map(Number);
  const label = `${MONTH_NAMES[month - 1]} ${year}`;
  return label.charAt(0).toUpperCase() + label.slice(1);
}

const MONTH_SHORT = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export function formatMonthShort(isoMonth: string): string {
  const [, month] = isoMonth.split("-").map(Number);
  return MONTH_SHORT[month - 1] ?? isoMonth;
}

export function lastFourMonths(current: string): string[] {
  return [3, 2, 1, 0].map((offset) => shiftMonth(current, -offset));
}

export function todayKey(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function currentMonthKey(): string {
  return todayKey().slice(0, 7);
}

export function monthKey(isoDate: string): string {
  return isoDate.slice(0, 7);
}

export function shiftMonth(isoMonth: string, delta: number): string {
  const [year, month] = isoMonth.split("-").map(Number);
  const date = new Date(year, month - 1 + delta, 1);
  const nextYear = date.getFullYear();
  const nextMonth = String(date.getMonth() + 1).padStart(2, "0");
  return `${nextYear}-${nextMonth}`;
}

export function percent(part: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((part / total) * 100);
}

export function createId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}
