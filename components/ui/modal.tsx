"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./icon";

export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-inverse-surface/40 p-4 sm:items-center">
      <button
        aria-label="Cerrar"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        type="button"
      />
      <div
        className="relative z-10 max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-3xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-[0_-4px_16px_rgba(39,48,41,0.08)]"
        role="dialog"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-headline-sm text-on-surface">{title}</h2>
          <button
            aria-label="Cerrar"
            className="flex h-9 w-9 items-center justify-center rounded-full text-outline hover:bg-surface-container"
            onClick={onClose}
            type="button"
          >
            <Icon className="text-[20px]" name="close" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
