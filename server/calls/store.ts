import "server-only";

import { DEFAULT_BUSINESS_ID, getSupabaseServerClient } from "@/server/db/client";
import type { Database } from "@/server/db/types";

export type SalesCallStatus =
  | "queued"
  | "ringing"
  | "in-progress"
  | "ended"
  | "failed";

export type SalesCallRecord = {
  id: string;
  providerCallId?: string;
  leadName: string;
  phone: string;
  interest: string;
  status: SalesCallStatus;
  summary?: string;
  transcript?: string;
  recordingUrl?: string;
  endedReason?: string;
  createdAt: string;
  updatedAt: string;
};

type SalesCallRow = Database["public"]["Tables"]["sales_calls"]["Row"];
type SalesCallUpdate = Database["public"]["Tables"]["sales_calls"]["Update"];

function mapSalesCall(row: SalesCallRow): SalesCallRecord {
  return {
    id: row.id,
    providerCallId: row.provider_call_id ?? undefined,
    leadName: row.lead_name,
    phone: row.phone,
    interest: row.interest,
    status: row.status as SalesCallStatus,
    summary: row.summary ?? undefined,
    transcript: row.transcript ?? undefined,
    recordingUrl: row.recording_url ?? undefined,
    endedReason: row.ended_reason ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapPatch(patch: Partial<Omit<SalesCallRecord, "id" | "createdAt">>): SalesCallUpdate {
  return {
    provider_call_id: patch.providerCallId,
    lead_name: patch.leadName,
    phone: patch.phone,
    interest: patch.interest,
    status: patch.status,
    summary: patch.summary,
    transcript: patch.transcript,
    recording_url: patch.recordingUrl,
    ended_reason: patch.endedReason
  };
}

function handleError(context: string, error: { message: string }) {
  throw new Error(`${context}: ${error.message}`);
}

export async function listSalesCalls(businessId = DEFAULT_BUSINESS_ID) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("sales_calls")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (error) {
    handleError("Failed to list sales calls", error);
  }

  return (data ?? []).map(mapSalesCall);
}

export async function createQueuedSalesCall(input: {
  leadName: string;
  phone: string;
  interest: string;
}) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("sales_calls")
    .insert({
      business_id: DEFAULT_BUSINESS_ID,
      lead_name: input.leadName,
      phone: input.phone,
      interest: input.interest,
      status: "queued"
    })
    .select("*")
    .single();

  if (error) {
    handleError("Failed to create queued sales call", error);
  }

  if (!data) {
    throw new Error("Failed to create queued sales call: no call row returned.");
  }

  return mapSalesCall(data);
}

export async function updateSalesCall(
  id: string,
  patch: Partial<Omit<SalesCallRecord, "id" | "createdAt">>
) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("sales_calls")
    .update(mapPatch(patch))
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    handleError("Failed to update sales call", error);
  }

  return data ? mapSalesCall(data) : null;
}

export async function updateSalesCallByProviderId(
  providerCallId: string,
  patch: Partial<Omit<SalesCallRecord, "id" | "createdAt">>
) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("sales_calls")
    .update(mapPatch(patch))
    .eq("provider_call_id", providerCallId)
    .select("*")
    .maybeSingle();

  if (error) {
    handleError("Failed to update sales call by provider id", error);
  }

  return data ? mapSalesCall(data) : null;
}
