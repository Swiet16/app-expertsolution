import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type AppRole = "user" | "admin" | "super_admin";

export const getCurrentUserContext = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const [profileRes, rolesRes, walletRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase.from("wallets").select("*").eq("user_id", userId).maybeSingle(),
    ]);

    const roles = (rolesRes.data ?? []).map((r) => r.role as AppRole);
    return {
      userId,
      profile: profileRes.data,
      roles,
      isAdmin: roles.includes("admin") || roles.includes("super_admin"),
      isSuperAdmin: roles.includes("super_admin"),
      wallet: walletRes.data,
    };
  });