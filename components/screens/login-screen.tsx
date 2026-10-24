"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { PasswordInput, PrimaryButton, TextInput } from "@/components/ui/primitives";
import { bootstrapHouseholdAdmin, needsHouseholdBootstrap } from "@/lib/admin-api";
import { clearHouseholdCache } from "@/lib/household";
import { getSupabase } from "@/lib/supabase/client";

export function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [needsBootstrap, setNeedsBootstrap] = useState(false);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    void needsHouseholdBootstrap()
      .then((needed) => {
        if (cancelled) return;
        setNeedsBootstrap(needed);
        setReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        setNeedsBootstrap(false);
        setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const enter = async (value: string, secret: string) => {
    const supabase = getSupabase();
    const { error } = await supabase.auth.signInWithPassword({
      email: value,
      password: secret,
    });
    if (error) {
      setMessage("Correo o contraseña incorrectos.");
      return;
    }
    const { error: joinError } = await supabase.rpc("join_household");
    if (joinError) {
      await supabase.auth.signOut();
      clearHouseholdCache();
      setMessage(
        joinError.message === "not allowed"
          ? "Este correo no pertenece al hogar. Pide al administrador que te cree una cuenta."
          : joinError.message,
      );
      return;
    }
    router.replace("/");
    router.refresh();
  };

  const submit = () => {
    const value = email.trim().toLowerCase();
    if (!value.includes("@")) {
      setMessage("Escribe un correo válido.");
      return;
    }
    if (password.length < 6) {
      setMessage("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    startTransition(async () => {
      setMessage("");
      if (needsBootstrap) {
        try {
          await bootstrapHouseholdAdmin({
            email: value,
            password,
            displayName,
          });
        } catch (error) {
          setMessage(error instanceof Error ? error.message : "No se pudo crear el administrador");
          return;
        }
      }
      await enter(value, password);
    });
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-surface px-space-md">
      <div className="w-full max-w-md rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-6 shadow-sm">
        <p className="text-label-sm font-semibold text-secondary">Mi Mercado</p>
        <h1 className="mt-1 text-headline-md font-bold text-on-surface">
          {!ready ? "Ingresar" : needsBootstrap ? "Crear administrador" : "Ingresar"}
        </h1>
        <p className="mt-2 text-body-sm text-on-surface-variant">
          {!ready
            ? "Revisando si el hogar ya tiene un administrador..."
            : needsBootstrap
              ? "El primer usuario queda como administrador. Solo esa cuenta podrá crear, cambiar o recuperar contraseñas del resto."
              : "Entra con el correo y la contraseña que te asignó el administrador. La sesión se queda en este dispositivo."}
        </p>

        {!ready ? (
          <p className="mt-5 text-body-sm text-on-surface-variant">Un momento...</p>
        ) : (
          <>
            <form
              className="mt-5 flex flex-col gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                submit();
              }}
            >
              {needsBootstrap ? (
                <label className="text-label-md text-on-surface-variant">
                  Tu nombre
                  <TextInput
                    autoComplete="name"
                    className="mt-1.5"
                    onChange={(event) => setDisplayName(event.target.value)}
                    placeholder="Ej. Camila"
                    value={displayName}
                  />
                </label>
              ) : null}
              <label className="text-label-md text-on-surface-variant">
                Correo
                <TextInput
                  autoComplete="email"
                  className="mt-1.5"
                  inputMode="email"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="tu@correo.com"
                  type="email"
                  value={email}
                />
              </label>
              <label className="text-label-md text-on-surface-variant">
                Contraseña
                <PasswordInput
                  autoComplete={needsBootstrap ? "new-password" : "current-password"}
                  className="mt-1.5"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                />
              </label>
              <PrimaryButton className="w-full" disabled={isPending} type="submit">
                {isPending ? "Entrando..." : needsBootstrap ? "Crear y entrar" : "Entrar"}
                <Icon className="text-[18px]" name="login" />
              </PrimaryButton>
            </form>

            {needsBootstrap ? null : (
              <p className="mt-4 text-body-sm text-on-surface-variant">
                Si olvidaste tu contraseña, pide al administrador que te asigne una nueva.
              </p>
            )}
          </>
        )}

        {message ? <p className="mt-3 text-body-sm text-on-surface-variant">{message}</p> : null}
      </div>
    </div>
  );
}
