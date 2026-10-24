"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "./icon";

export function ChipScroller({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const update = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onChange = () => update();
    el.addEventListener("scroll", onChange, { passive: true });
    const observer = new ResizeObserver(onChange);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", onChange);
      observer.disconnect();
    };
  }, [update]);

  const move = (direction: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: el.scrollLeft + direction * 180, behavior: "smooth" });
    window.setTimeout(update, 220);
  };

  return (
    <div className={`flex w-full min-w-0 items-center gap-1 ${className}`}>
      <button
        aria-label="Ver opciones anteriores"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-outline-variant/40 bg-surface-container-lowest text-primary disabled:opacity-30"
        disabled={!canLeft}
        onClick={() => move(-1)}
        type="button"
      >
        <Icon className="text-[20px]" name="chevron_left" />
      </button>
      <div
        className="no-scrollbar flex min-w-0 flex-1 items-center gap-2 overflow-x-auto scroll-smooth"
        ref={scrollerRef}
      >
        {children}
      </div>
      <button
        aria-label="Ver más opciones"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-outline-variant/40 bg-surface-container-lowest text-primary disabled:opacity-30"
        disabled={!canRight}
        onClick={() => move(1)}
        type="button"
      >
        <Icon className="text-[20px]" name="chevron_right" />
      </button>
    </div>
  );
}
