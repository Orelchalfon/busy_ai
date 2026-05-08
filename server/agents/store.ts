import "server-only";

import { revalidateTag, unstable_cache } from "next/cache";
import { getSupabaseServerClient } from "@/server/db/client";
import type { Database } from "@/server/db/types";

export type AgentRecord = {
  id: string;
  businessId: string;
  name: string;
  persona: string;
  servicesText: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type AgentRow = Database["public"]["Tables"]["agents"]["Row"];
type AgentUpdate = Database["public"]["Tables"]["agents"]["Update"];

function agentsCacheTag(businessId: string) {
  return `agents-${businessId}`;
}

function mapAgent(row: AgentRow): AgentRecord {
  return {
    id: row.id,
    businessId: row.business_id,
    name: row.name,
    persona: row.persona,
    servicesText: row.services_text,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapPatch(patch: Partial<Omit<AgentRecord, "id" | "businessId" | "createdAt" | "updatedAt">>): AgentUpdate {
  return {
    name: patch.name,
    persona: patch.persona,
    services_text: patch.servicesText,
    is_active: patch.isActive
  };
}

function handleError(context: string, error: { message: string }): never {
  throw new Error(`${context}: ${error.message}`);
}

async function queryAgents(businessId: string) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (error) handleError("Failed to list agents", error);
  return (data ?? []).map(mapAgent);
}

export function listAgents(businessId: string) {
  const cached = unstable_cache(
    () => queryAgents(businessId),
    ["agents", businessId],
    { tags: [agentsCacheTag(businessId)], revalidate: 60 }
  );
  return cached();
}

export async function getAgent(id: string, businessId: string): Promise<AgentRecord | null> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .eq("id", id)
    .eq("business_id", businessId)
    .maybeSingle();

  if (error) handleError("Failed to load agent", error);
  return data ? mapAgent(data) : null;
}

export async function createAgent(input: {
  businessId: string;
  name: string;
  persona: string;
  servicesText: string;
}): Promise<AgentRecord> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("agents")
    .insert({
      business_id: input.businessId,
      name: input.name,
      persona: input.persona,
      services_text: input.servicesText
    })
    .select("*")
    .single();

  if (error) handleError("Failed to create agent", error);
  if (!data) throw new Error("Failed to create agent: no row returned.");

  revalidateTag(agentsCacheTag(input.businessId), { expire: 0 });
  return mapAgent(data);
}

export async function updateAgent(
  id: string,
  businessId: string,
  patch: Partial<Omit<AgentRecord, "id" | "businessId" | "createdAt" | "updatedAt">>
): Promise<AgentRecord | null> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("agents")
    .update(mapPatch(patch))
    .eq("id", id)
    .eq("business_id", businessId)
    .select("*")
    .maybeSingle();

  if (error) handleError("Failed to update agent", error);

  revalidateTag(agentsCacheTag(businessId), { expire: 0 });
  return data ? mapAgent(data) : null;
}

export async function deleteAgent(id: string, businessId: string): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("agents")
    .delete()
    .eq("id", id)
    .eq("business_id", businessId);

  if (error) handleError("Failed to delete agent", error);
  revalidateTag(agentsCacheTag(businessId), { expire: 0 });
}
