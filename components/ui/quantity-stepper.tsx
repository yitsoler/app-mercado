import { Icon } from "./icon";

export function QuantityStepper({
  value,
  unit,
  onChange,
  step = 1,
}: {
  value: number;
  unit: string;
  onChange: (value: number) => void;
  step?: number;
}) {
  const display = Number.isInteger(value) ? String(value) : value.toFixed(1);

  return (
    <div className="flex shrink-0 items-center rounded-xl border border-outline-variant/30 bg-surface-container-low p-1">
      <button
        aria-label="Restar"
        className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-container-lowest text-primary shadow-sm active:scale-90"
        onClick={() => onChange(Math.max(step, Number((value - step).toFixed(2))))}
        type="button"
      >
        <Icon className="text-[16px]" name="remove" />
      </button>
      <div className="min-w-[54px] px-2 text-center">
        <span className="block text-label-md leading-tight font-bold text-on-surface tabular">
          {display}
        </span>
        <span className="text-[10px] font-medium tracking-tight text-outline">{unit}</span>
      </div>
      <button
        aria-label="Sumar"
        className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-container-lowest text-primary shadow-sm active:scale-90"
        onClick={() => onChange(Number((value + step).toFixed(2)))}
        type="button"
      >
        <Icon className="text-[16px]" name="add" />
      </button>
    </div>
  );
}
