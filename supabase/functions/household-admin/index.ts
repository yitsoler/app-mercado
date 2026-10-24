import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Body = {
  action: "needs_bootstrap" | "bootstrap" | "list" | "create" | "update" | "reset_password" | "remove";
  email?: string;
  password?: string;
  display_name?: string;
  user_id?: string;
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

function adminClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Falta configuración del servidor");
  return createClient(url, key);
}

async function firstHousehold(admin: ReturnType<typeof adminClient>) {
  const { data, error } = await admin.from("households").select("id").order("created_at").limit(1).maybeSingle();
  if (error || !data) throw new Error("No hay un hogar configurado");
  return data.id as string;
}

async function memberCount(admin: ReturnType<typeof adminClient>) {
  const { count, error } = await admin.from("household_members").select("*", { count: "exact", head: true });
  if (error) throw new Error(error.message);
  return count ?? 0;
}

async function requireOwner(req: Request, admin: ReturnType<typeof adminClient>) {
  const header = req.headers.get("Authorization") ?? "";
  const token = header.replace(/^Bearer\s+/i, "");
  if (!token || token.startsWith("sb_publishable_") || token.startsWith("eyJ") === false) {
    throw new Error("Inicia sesión como administrador");
  }
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) throw new Error("Inicia sesión como administrador");
  const { data: membership, error: memberError } = await admin
    .from("household_members")
    .select("household_id, role")
    .eq("user_id", data.user.id)
    .maybeSingle();
  if (memberError || !membership || membership.role !== "owner") {
    throw new Error("Solo el administrador puede gestionar usuarios");
  }
  return { user: data.user, householdId: membership.household_id as string };
}

async function listMembers(admin: ReturnType<typeof adminClient>, householdId: string) {
  const { data: members, error } = await admin
    .from("household_members")
    .select("user_id, role")
    .eq("household_id", householdId);
  if (error) throw new Error(error.message);
  const { data: profiles } = await admin
    .from("profiles")
    .select("user_id, display_name")
    .eq("household_id", householdId);
  const names = new Map((profiles ?? []).map((row) => [row.user_id, row.display_name]));
  const users = [];
  for (const member of members ?? []) {
    const { data } = await admin.auth.admin.getUserById(member.user_id);
    users.push({
      userId: member.user_id,
      email: data.user?.email ?? "",
      displayName: names.get(member.user_id) ?? "",
      role: member.role,
    });
  }
  return users.toSorted((a, b) => a.email.localeCompare(b.email, "es"));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);

  try {
    const admin = adminClient();
    const body = (await req.json()) as Body;

    if (body.action === "needs_bootstrap") {
      return json({ needed: (await memberCount(admin)) === 0 });
    }

    if (body.action === "bootstrap") {
      if ((await memberCount(admin)) > 0) {
        return json({ error: "Ya existe un administrador" }, 403);
      }
      const email = body.email?.trim().toLowerCase() ?? "";
      const password = body.password ?? "";
      const displayName = body.display_name?.trim() || email.split("@")[0];
      if (!email.includes("@") || password.length < 6) {
        return json({ error: "Correo y una contraseña de al menos 6 caracteres" }, 400);
      }
      const householdId = await firstHousehold(admin);
      const created = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (created.error || !created.data.user) {
        return json({ error: created.error?.message ?? "No se pudo crear el administrador" }, 400);
      }
      const userId = created.data.user.id;
      const { data: orphan } = await admin
        .from("profiles")
        .select("id")
        .eq("household_id", householdId)
        .is("user_id", null)
        .limit(1)
        .maybeSingle();
      const writes = await Promise.all([
        admin.from("household_members").insert({ household_id: householdId, user_id: userId, role: "owner" }),
        admin.from("allowed_emails").insert({ household_id: householdId, email }),
        orphan
          ? admin.from("profiles").update({ user_id: userId, display_name: displayName }).eq("id", orphan.id)
          : admin.from("profiles").insert({ household_id: householdId, user_id: userId, display_name: displayName }),
      ]);
      const failed = writes.find((item) => item.error);
      if (failed?.error) {
        await admin.auth.admin.deleteUser(userId);
        return json({ error: failed.error.message }, 400);
      }
      return json({ ok: true });
    }

    const owner = await requireOwner(req, admin);

    if (body.action === "list") {
      return json({ users: await listMembers(admin, owner.householdId) });
    }

    if (body.action === "create") {
      const email = body.email?.trim().toLowerCase() ?? "";
      const password = body.password ?? "";
      const displayName = body.display_name?.trim() || email.split("@")[0];
      if (!email.includes("@") || password.length < 6) {
        return json({ error: "Correo y una contraseña de al menos 6 caracteres" }, 400);
      }
      const created = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (created.error || !created.data.user) {
        return json({ error: created.error?.message ?? "No se pudo crear el usuario" }, 400);
      }
      const userId = created.data.user.id;
      const writes = await Promise.all([
        admin.from("household_members").insert({
          household_id: owner.householdId,
          user_id: userId,
          role: "member",
        }),
        admin.from("allowed_emails").insert({ household_id: owner.householdId, email }),
        admin.from("profiles").insert({
          household_id: owner.householdId,
          user_id: userId,
          display_name: displayName,
        }),
      ]);
      const failed = writes.find((item) => item.error);
      if (failed?.error) {
        await admin.auth.admin.deleteUser(userId);
        return json({ error: failed.error.message }, 400);
      }
      return json({ users: await listMembers(admin, owner.householdId) });
    }

    if (body.action === "update") {
      if (!body.user_id) return json({ error: "Falta el usuario" }, 400);
      const { data: membership } = await admin
        .from("household_members")
        .select("user_id")
        .eq("household_id", owner.householdId)
        .eq("user_id", body.user_id)
        .maybeSingle();
      if (!membership) return json({ error: "Ese usuario no pertenece al hogar" }, 404);
      const { data: previous } = await admin.auth.admin.getUserById(body.user_id);
      const previousEmail = previous.user?.email?.toLowerCase();
      const patch: { email?: string; password?: string; email_confirm?: boolean } = {};
      if (body.email?.trim()) {
        patch.email = body.email.trim().toLowerCase();
        patch.email_confirm = true;
      }
      if (body.password) {
        if (body.password.length < 6) return json({ error: "La contraseña debe tener al menos 6 caracteres" }, 400);
        patch.password = body.password;
      }
      if (Object.keys(patch).length > 0) {
        const updated = await admin.auth.admin.updateUserById(body.user_id, patch);
        if (updated.error) return json({ error: updated.error.message }, 400);
      }
      if (body.display_name?.trim()) {
        await admin
          .from("profiles")
          .update({ display_name: body.display_name.trim() })
          .eq("user_id", body.user_id);
      }
      if (patch.email && patch.email !== previousEmail) {
        if (previousEmail) {
          await admin
            .from("allowed_emails")
            .delete()
            .eq("household_id", owner.householdId)
            .eq("email", previousEmail);
        }
        await admin.from("allowed_emails").insert({ household_id: owner.householdId, email: patch.email });
      }
      return json({ users: await listMembers(admin, owner.householdId) });
    }

    if (body.action === "reset_password") {
      if (!body.user_id || !body.password || body.password.length < 6) {
        return json({ error: "Indica el usuario y una contraseña nueva de al menos 6 caracteres" }, 400);
      }
      const { data: membership } = await admin
        .from("household_members")
        .select("user_id")
        .eq("household_id", owner.householdId)
        .eq("user_id", body.user_id)
        .maybeSingle();
      if (!membership) return json({ error: "Ese usuario no pertenece al hogar" }, 404);
      const updated = await admin.auth.admin.updateUserById(body.user_id, { password: body.password });
      if (updated.error) return json({ error: updated.error.message }, 400);
      return json({ ok: true });
    }

    if (body.action === "remove") {
      if (!body.user_id) return json({ error: "Falta el usuario" }, 400);
      if (body.user_id === owner.user.id) return json({ error: "No puedes eliminarte a ti mismo" }, 400);
      const { data: target } = await admin
        .from("household_members")
        .select("user_id, role")
        .eq("household_id", owner.householdId)
        .eq("user_id", body.user_id)
        .maybeSingle();
      if (!target) return json({ error: "Ese usuario no pertenece al hogar" }, 404);
      const { data: user } = await admin.auth.admin.getUserById(body.user_id);
      await admin.from("household_members").delete().eq("user_id", body.user_id);
      if (user.user?.email) {
        await admin
          .from("allowed_emails")
          .delete()
          .eq("household_id", owner.householdId)
          .eq("email", user.user.email.toLowerCase());
      }
      await admin.auth.admin.deleteUser(body.user_id);
      return json({ users: await listMembers(admin, owner.householdId) });
    }

    return json({ error: "Acción no válida" }, 400);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Error inesperado" }, 400);
  }
});
