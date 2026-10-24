import { getSupabase } from "@/lib/supabase/client";

let cachedHouseholdId: string | null = null;

export function clearHouseholdCache() {
  cachedHouseholdId = null;
}

export async function requireHouseholdId(): Promise<string> {
  if (cachedHouseholdId) return cachedHouseholdId;
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc("join_household");
  if (error || !data) {
    throw new Error(
      error?.message === "not allowed"
        ? "Este correo no está autorizado para este hogar"
        : (error?.message ?? "No tienes acceso a este hogar"),
    );
  }
  cachedHouseholdId = data;
  return cachedHouseholdId;
}
