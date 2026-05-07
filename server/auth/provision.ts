import "server-only";

import { getSupabaseServerClient } from "@/server/db/client";
import type { User } from "@supabase/supabase-js";

function deriveBusinessName(user: User): string {
  const fromMetadata =
    typeof user.user_metadata?.business_name === "string"
      ? user.user_metadata.business_name.trim()
      : "";
  if (fromMetadata) return fromMetadata;

  const email = user.email ?? "";
  const localPart = email.split("@")[0] ?? "";
  if (localPart) return localPart;

  return "העסק שלי";
}

/**
 * Ensures the authenticated user is linked to a business. Idempotent.
 * On first signin: creates a businesses row, business_settings row, and the
 * business_users link. Returns the resolved business_id.
 *
 * Uses the service role client because a brand-new user has no business_users
 * row yet, so RLS would block the user-scoped client from inserting.
 */
export async function ensureBusinessForUser(user: User): Promise<string> {
  const admin = getSupabaseServerClient();

  const { data: existing } = await admin
    .from("business_users")
    .select("business_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existing) return existing.business_id;

  const name = deriveBusinessName(user);
  const { data: business, error: insertBusinessError } = await admin
    .from("businesses")
    .insert({
      name,
      industry: "אחר",
      phone: "",
      whatsapp: ""
    })
    .select("id")
    .single();

  if (insertBusinessError || !business) {
    throw new Error(
      `Failed to provision business for user ${user.id}: ${insertBusinessError?.message ?? "unknown error"}`
    );
  }

  const { error: insertSettingsError } = await admin
    .from("business_settings")
    .insert({ business_id: business.id });

  if (insertSettingsError) {
    throw new Error(
      `Failed to create business_settings for ${business.id}: ${insertSettingsError.message}`
    );
  }

  const { error: insertLinkError } = await admin
    .from("business_users")
    .insert({ user_id: user.id, business_id: business.id, role: "owner" });

  if (insertLinkError) {
    throw new Error(
      `Failed to link user ${user.id} to business ${business.id}: ${insertLinkError.message}`
    );
  }

  return business.id;
}
