"use client";

import { useState } from "react";
import { useAppState } from "@/components/providers/app-provider";
import { PasswordInput, PrimaryButton, TextInput } from "@/components/ui/primitives";

export function UsersAdmin() {
  const {
    householdUsers,
    currentUserId,
    createHouseholdUser,
    updateHouseholdUser,
    resetHouseholdUserPassword,
    removeHouseholdUser,
  } = useAppState();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  return (
    <div>
      <p className="text-label-md font-semibold text-on-surface">Usuarios del hogar</p>
      <p className="mt-1 text-body-sm text-on-surface-variant">
        Solo tú puedes crear cuentas, cambiar datos y asignar una contraseña nueva.
      </p>

      <ul className="mt-3 space-y-2">
        {householdUsers.map((user) => {
          const isSelf = user.userId === currentUserId;
          const open = editingId === user.userId;
          return (
            <li className="rounded-2xl border border-outline-variant/30 p-3" key={user.userId}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-body-sm font-semibold text-on-surface">
                    {user.displayName || user.email}
                  </p>
                  <p className="truncate text-label-sm text-on-surface-variant">{user.email}</p>
                  <p className="text-label-sm text-secondary">
                    {user.role === "owner" ? "Administrador" : "Familiar"}
                  </p>
                </div>
                <button
                  className="text-label-sm font-semibold text-primary"
                  onClick={() => {
                    if (open) {
                      setEditingId(null);
                      setNewPassword("");
                      return;
                    }
                    setEditingId(user.userId);
                    setEditName(user.displayName);
                    setEditEmail(user.email);
                    setNewPassword("");
                  }}
                  type="button"
                >
                  {open ? "Cerrar" : "Editar"}
                </button>
              </div>

              {open ? (
                <div className="mt-3 flex flex-col gap-2">
                  <TextInput
                    aria-label="Nombre"
                    onChange={(event) => setEditName(event.target.value)}
                    placeholder="Nombre"
                    value={editName}
                  />
                  <TextInput
                    aria-label="Correo"
                    autoComplete="off"
                    onChange={(event) => setEditEmail(event.target.value)}
                    placeholder="Correo"
                    type="email"
                    value={editEmail}
                  />
                  <PrimaryButton
                    className="w-full"
                    onClick={() => {
                      void updateHouseholdUser({
                        userId: user.userId,
                        displayName: editName,
                        email: editEmail,
                      }).then(() => setEditingId(null));
                    }}
                  >
                    Guardar cambios
                  </PrimaryButton>
                  <PasswordInput
                    aria-label="Nueva contraseña"
                    autoComplete="new-password"
                    onChange={(event) => setNewPassword(event.target.value)}
                    placeholder="Nueva contraseña"
                    value={newPassword}
                  />
                  <button
                    className="text-label-md font-semibold text-primary"
                    onClick={() => {
                      void resetHouseholdUserPassword(user.userId, newPassword).then((ok) => {
                        if (ok) setNewPassword("");
                      });
                    }}
                    type="button"
                  >
                    Asignar contraseña
                  </button>
                  {isSelf ? null : (
                    <button
                      className="text-label-md font-semibold text-error"
                      onClick={() => {
                        if (window.confirm(`¿Eliminar a ${user.email}? Ya no podrá entrar.`)) {
                          void removeHouseholdUser(user.userId);
                        }
                      }}
                      type="button"
                    >
                      Eliminar usuario
                    </button>
                  )}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      <p className="mt-4 text-label-md font-semibold text-on-surface">Crear usuario</p>
      <div className="mt-2 flex flex-col gap-2">
        <TextInput
          aria-label="Nombre del familiar"
          onChange={(event) => setName(event.target.value)}
          placeholder="Nombre"
          value={name}
        />
        <TextInput
          aria-label="Correo del familiar"
          autoComplete="off"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="familiar@correo.com"
          type="email"
          value={email}
        />
        <PasswordInput
          aria-label="Contraseña inicial"
          autoComplete="new-password"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Contraseña inicial"
          value={password}
        />
        <PrimaryButton
          className="w-full"
          onClick={() => {
            void createHouseholdUser({ displayName: name, email, password }).then((ok) => {
              if (!ok) return;
              setName("");
              setEmail("");
              setPassword("");
            });
          }}
        >
          Crear usuario
        </PrimaryButton>
      </div>
    </div>
  );
}
