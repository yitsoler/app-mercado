import { getSupabase } from "@/lib/supabase/client";
import type { HouseholdUser } from "@/lib/types";

type AdminAction =
  | "needs_bootstrap"
  | "bootstrap"
  | "list"
  | "create"
  | "update"
  | "reset_password"
  | "remove";

type AdminBody = {
  action: AdminAction;
  email?: string;
  password?: string;
  display_name?: string;
  user_id?: string;
};

async function callAdmin<T>(body: AdminBody): Promise<T> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error("Falta la configuración de Supabase");
  }
  const { data } = await getSupabase().auth.getSession();
  const token = data.session?.access_token ?? key;
  const response = await fetch(`${url}/functions/v1/household-admin`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => null)) as
    | ({ error?: string } & T)
    | null;
  if (payload?.error) throw new Error(payload.error);
  if (!response.ok || !payload) {
    throw new Error("No se pudo completar la acción");
  }
  return payload;
}

export async function needsHouseholdBootstrap() {
  const result = await callAdmin<{ needed: boolean }>({ action: "needs_bootstrap" });
  return Boolean(result.needed);
}

export async function bootstrapHouseholdAdmin(input: {
  email: string;
  password: string;
  displayName: string;
}) {
  await callAdmin<{ ok: true }>({
    action: "bootstrap",
    email: input.email,
    password: input.password,
    display_name: input.displayName,
  });
}

export async function listHouseholdUsers() {
  const result = await callAdmin<{ users: HouseholdUser[] }>({ action: "list" });
  return result.users ?? [];
}

export async function createHouseholdUser(input: {
  email: string;
  password: string;
  displayName: string;
}) {
  const result = await callAdmin<{ users: HouseholdUser[] }>({
    action: "create",
    email: input.email,
    password: input.password,
    display_name: input.displayName,
  });
  return result.users ?? [];
}

export async function updateHouseholdUser(input: {
  userId: string;
  email?: string;
  displayName?: string;
  password?: string;
}) {
  const result = await callAdmin<{ users: HouseholdUser[] }>({
    action: "update",
    user_id: input.userId,
    email: input.email,
    display_name: input.displayName,
    password: input.password,
  });
  return result.users ?? [];
}

export async function resetHouseholdUserPassword(userId: string, password: string) {
  await callAdmin<{ ok: true }>({
    action: "reset_password",
    user_id: userId,
    password,
  });
}

export async function removeHouseholdUser(userId: string) {
  const result = await callAdmin<{ users: HouseholdUser[] }>({
    action: "remove",
    user_id: userId,
  });
  return result.users ?? [];
}
