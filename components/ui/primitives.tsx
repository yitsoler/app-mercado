"use client";

import { useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react";
import { Icon } from "@/components/ui/icon";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-outline-variant/40 bg-surface-container-lowest shadow-[0_2px_8px_rgba(39,48,41,0.03)] ${className}`}
    >
      {children}
    </div>
  );
}

export function PrimaryButton({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex min-h-[50px] items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-label-lg font-semibold text-on-primary shadow-sm transition-all duration-150 hover:bg-secondary active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-secondary-container/70 px-4 text-label-md font-semibold text-primary transition-colors hover:bg-secondary-container active:scale-[0.98] disabled:opacity-50 ${className}`}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-1.5 text-label-md text-on-surface-variant transition-colors hover:bg-surface-container active:scale-95 ${className}`}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}

export function IconButton({
  children,
  label,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      aria-label={label}
      className={`flex h-10 w-10 items-center justify-center rounded-full text-primary transition-all duration-150 hover:bg-surface-container active:scale-95 ${className}`}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}

export function Checkbox({
  checked,
  onChange,
  label,
  size = "sm",
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  size?: "sm" | "lg";
}) {
  const box =
    size === "lg"
      ? "h-11 w-11 rounded-xl border-2"
      : "h-[22px] w-[22px] rounded-[6px] border-2";

  return (
    <button
      aria-checked={checked}
      aria-label={label}
      className={`${box} flex shrink-0 items-center justify-center transition-colors ${
        checked
          ? "border-primary bg-primary text-on-primary"
          : "border-outline bg-transparent text-transparent"
      }`}
      onClick={onChange}
      role="checkbox"
      type="button"
    >
      <span className="material-symbols-outlined text-[16px] font-bold">check</span>
    </button>
  );
}

export function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="relative block">
      <span className="sr-only">{placeholder}</span>
      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-outline">
        <span className="material-symbols-outlined text-xl">search</span>
      </span>
      <input
        className="h-12 w-full rounded-2xl border border-outline-variant/40 bg-surface-container-lowest pr-3 pl-10 text-body-md text-on-surface shadow-[0_2px_8px_rgba(39,48,41,0.03)] placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type="search"
        value={value}
      />
    </label>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-label-md text-on-surface-variant">{label}</span>
      {children}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-[50px] w-full rounded-[14px] border border-outline-variant/40 bg-surface-container-lowest px-3 text-body-md text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none ${props.className ?? ""}`}
    />
  );
}

export function PasswordInput({
  className = "",
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [visible, setVisible] = useState(false);
  return (
    <div className={`relative ${className}`}>
      <TextInput {...props} className="pr-12" type={visible ? "text" : "password"} />
      <button
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-outline hover:text-primary"
        onClick={() => setVisible((current) => !current)}
        type="button"
      >
        <Icon className="text-[20px]" name={visible ? "visibility_off" : "visibility"} />
      </button>
    </div>
  );
}

export function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`h-[50px] w-full rounded-[14px] border border-outline-variant/40 bg-surface-container-lowest px-3 text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none ${props.className ?? ""}`}
    />
  );
}

export function EmptyState({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-outline-variant/60 bg-surface-container-low/70 px-4 py-8 text-center">
      <span className="material-symbols-outlined text-[28px] text-primary">{icon}</span>
      <p className="text-label-lg text-on-surface">{title}</p>
      <p className="text-body-sm text-on-surface-variant">{description}</p>
    </div>
  );
}

export function Badge({
  children,
  tone = "mint",
}: {
  children: ReactNode;
  tone?: "mint" | "solid" | "soft";
}) {
  const tones = {
    mint: "bg-secondary-container/60 text-secondary",
    solid: "bg-primary text-on-primary",
    soft: "bg-surface-container text-primary",
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-label-sm font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}
