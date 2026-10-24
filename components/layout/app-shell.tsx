"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState, type ReactNode } from "react";
import { useAppState } from "@/components/providers/app-provider";
import { Icon } from "@/components/ui/icon";
import { UsersAdmin } from "@/components/layout/users-admin";
import { Modal } from "@/components/ui/modal";
import { PrimaryButton, TextInput } from "@/components/ui/primitives";

const TABS = [
  { href: "/", label: "Inicio", icon: "home" },
  { href: "/lista", label: "Mi lista", icon: "checklist" },
  { href: "/mercado", label: "Mi mercado", icon: "shopping_cart" },
  { href: "/historial", label: "Historial", icon: "history" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/mercado") return pathname.startsWith("/mercado") || pathname.startsWith("/preparar");
  if (href === "/lista") return pathname.startsWith("/lista") || pathname.startsWith("/productos");
  if (href === "/historial") return pathname.startsWith("/historial") || pathname.startsWith("/gastos");
  return pathname.startsWith(href);
}

function NavLinks({ variant }: { variant: "side" | "bottom" }) {
  const pathname = usePathname();
  return <NavMarkup pathname={pathname} variant={variant} />;
}

function NavMarkup({
  pathname,
  variant,
}: {
  pathname: string;
  variant: "side" | "bottom";
}) {
  if (variant === "side") {
    return (
      <nav className="flex flex-col gap-2">
        {TABS.map((tab) => {
          const active = isActive(pathname, tab.href);
          return (
            <a
              className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-label-md transition-colors ${
                active
                  ? "bg-secondary-container font-semibold text-primary"
                  : "text-on-surface-variant hover:bg-surface-container"
              }`}
              href={tab.href}
              key={tab.href}
            >
              <Icon filled={active} name={tab.icon} />
              {tab.label}
            </a>
          );
        })}
      </nav>
    );
  }

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed right-0 bottom-0 left-0 z-50 mx-auto flex h-16 max-w-md items-center justify-around border-t border-outline-variant/40 bg-surface-container-lowest px-space-sm shadow-[0_-4px_16px_rgba(39,48,41,0.06)] lg:hidden"
    >
      {TABS.map((tab) => {
        const active = isActive(pathname, tab.href);
        return (
          <a
            aria-current={active ? "page" : undefined}
            aria-label={tab.label}
            className={`flex flex-col items-center justify-center gap-1 px-3 py-1 transition-transform duration-150 active:scale-90 ${
              active
                ? "rounded-full bg-secondary-container font-semibold text-primary"
                : "text-on-surface-variant hover:text-primary"
            }`}
            href={tab.href}
            key={tab.href}
          >
            <Icon className="text-[22px]" filled={active} name={tab.icon} />
            <span className="text-label-sm">{tab.label}</span>
          </a>
        );
      })}
    </nav>
  );
}

function SignOutButton({ className = "" }: { className?: string }) {
  const { signOut } = useAppState();
  return (
    <button
      className={`rounded-2xl border-2 border-primary bg-surface-container-lowest text-label-md font-semibold text-primary hover:bg-secondary-container ${className}`}
      onClick={() => void signOut()}
      type="button"
    >
      Cerrar sesión
    </button>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { toast, notificationsOpen, setNotificationsOpen, userName } = useAppState();

  if (pathname.startsWith("/ingresar")) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-dvh bg-surface text-on-surface">
      <div className="mx-auto flex min-h-dvh w-full max-w-6xl">
        <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-outline-variant/30 bg-surface-container-lowest px-4 py-6 lg:flex">
          <div className="mb-8 px-2">
            <p className="text-label-sm text-secondary">¡Hola, {userName}!</p>
            <p className="text-headline-sm font-bold text-primary">Mi Mercado</p>
          </div>
          <Suspense fallback={null}>
            <NavLinks variant="side" />
          </Suspense>
          <SignOutButton className="mt-auto px-3 py-3 text-left" />
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      </div>
      {pathname.startsWith("/preparar") || pathname.startsWith("/mercado") ? null : (
        <SignOutButton className="fixed right-4 bottom-[4.75rem] left-4 z-50 mx-auto flex h-11 max-w-md items-center justify-center lg:hidden" />
      )}
      <Suspense fallback={null}>
        <NavLinks variant="bottom" />
      </Suspense>

      {notificationsOpen ? (
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-inverse-surface/30 p-4 pt-20">
          <button className="absolute inset-0" onClick={() => setNotificationsOpen(false)} type="button" />
          <div className="relative w-full max-w-md rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-4 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-headline-sm text-on-surface">Notificaciones</h2>
              <button
                className="rounded-full p-1 text-outline hover:bg-surface-container"
                onClick={() => setNotificationsOpen(false)}
                type="button"
              >
                <Icon className="text-[20px]" name="close" />
              </button>
            </div>
            <p className="text-body-sm text-on-surface-variant">
              En esta versión de prueba no hay avisos persistentes. Los recordatorios de frecuencia se mostrarán cuando conectemos una base de datos.
            </p>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="pointer-events-none fixed bottom-32 left-1/2 z-[80] flex max-w-[340px] -translate-x-1/2 items-center gap-2 rounded-full bg-inverse-surface px-4 py-2.5 text-label-md text-inverse-on-surface shadow-lg">
          <Icon className="text-[18px] text-primary-fixed" name="check_circle" />
          <span>{toast.message}</span>
        </div>
      ) : null}
    </div>
  );
}

export function TopBar({
  title = "Mi Mercado",
  subtitle,
  backHref,
  trailing,
}: {
  title?: string;
  subtitle?: string;
  backHref?: string;
  trailing?: ReactNode;
}) {
  const {
    setNotificationsOpen,
    userName,
    setUserName,
    isAdmin,
  } = useAppState();
  const [editingName, setEditingName] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [draft, setDraft] = useState(userName);
  const initial = userName.trim().charAt(0).toUpperCase() || "?";

  useEffect(() => {
    if (editingName) setDraft(userName);
  }, [editingName, userName]);

  return (
    <>
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-outline-variant/30 bg-surface/95 px-space-md backdrop-blur-md">
      <div className="flex min-w-0 items-center gap-3">
        {backHref ? (
          <Link
            aria-label="Volver"
            className="flex h-10 w-10 items-center justify-center rounded-full text-primary hover:bg-surface-container"
            href={backHref}
          >
            <Icon className="text-[24px]" name="arrow_back" />
          </Link>
        ) : (
          <button
            aria-label="Tu cuenta"
            className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-secondary-container text-label-lg font-bold text-primary ring-2 ring-primary/20 hover:bg-secondary-container/80"
            onClick={() => setAccountOpen(true)}
            type="button"
          >
            {initial}
          </button>
        )}
        <div className="min-w-0">
          {backHref ? (
            subtitle ? <p className="text-label-sm text-secondary">{subtitle}</p> : null
          ) : (
            <button
              className="flex max-w-full items-center gap-1 text-left"
              onClick={() => {
                setDraft(userName);
                setEditingName(true);
              }}
              type="button"
            >
              <p className="truncate text-label-sm text-secondary">¡Hola, {userName}!</p>
              <Icon className="text-[14px] text-outline" name="edit" />
            </button>
          )}
          <p className="text-headline-sm font-bold tracking-tight text-primary">{title}</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {trailing}
        <button
          aria-label="Notificaciones"
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-primary hover:bg-surface-container"
          onClick={() => setNotificationsOpen(true)}
          type="button"
        >
          <Icon className="text-[22px]" name="notifications" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary ring-2 ring-surface" />
        </button>
      </div>
    </header>
    {editingName ? (
      <Modal onClose={() => setEditingName(false)} title="Tu nombre">
        <p className="mb-3 text-body-sm text-on-surface-variant">
          Así te saludará la app. Puedes cambiarlo cuando quieras.
        </p>
        <TextInput
          aria-label="Tu nombre"
          autoComplete="name"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void setUserName(draft).then(() => {
                if (draft.trim()) setEditingName(false);
              });
            }
          }}
          placeholder="Ej. Camila"
          value={draft}
        />
        <PrimaryButton
          className="mt-4 w-full"
          onClick={() => {
            void setUserName(draft).then(() => {
              if (draft.trim()) setEditingName(false);
            });
          }}
        >
          Guardar
        </PrimaryButton>
      </Modal>
    ) : null}
    {accountOpen ? (
      <Modal onClose={() => setAccountOpen(false)} title="Tu cuenta">
        {isAdmin ? (
          <UsersAdmin />
        ) : (
          <p className="text-body-sm text-on-surface-variant">
            Si no puedes entrar, pide al administrador que te asigne una contraseña nueva.
          </p>
        )}
      </Modal>
    ) : null}
    </>
  );
}

export function Screen({
  children,
  className = "",
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div className={`mx-auto flex min-h-dvh w-full max-w-3xl flex-col bg-surface pb-40 ${className}`}>
      {padded ? <main className="flex-1 px-space-md pt-space-sm">{children}</main> : children}
    </div>
  );
}
