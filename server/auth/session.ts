import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServerClient } from "@/server/db/client";

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentBusinessId(): Promise<string | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  // Service role lookup avoids any RLS recursion when reading the join row.
  const admin = getSupabaseServerClient();
  const { data, error } = await admin
    .from("business_users")
    .select("business_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data.business_id;
}

export async function requireBusinessId(): Promise<string> {
  const businessId = await getCurrentBusinessId();
  if (!businessId) {
    throw new Error("Not authenticated or no business associated with this user.");
  }
  return businessId;
}
