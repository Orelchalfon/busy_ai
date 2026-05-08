import "server-only";

import { getSupabaseServerClient } from "@/server/db/client";
import type { Database } from "@/server/db/types";
import type {
  AvailableSlot,
  BookedSlot,
  BookSlotInput,
  CalendarProvider,
  ListAvailableSlotsInput
} from "./provider";

type SlotRow = Database["public"]["Tables"]["calendar_slots"]["Row"];

const STATUS_AVAILABLE = "פנוי";
const STATUS_BOOKED = "שמור";

function mapAvailable(row: SlotRow): AvailableSlot {
  return {
    id: row.id,
    label: row.window_label,
    startsAt: row.starts_at,
    endsAt: row.ends_at
  };
}

export const localSlotsProvider: CalendarProvider = {
  async listAvailableSlots({
    businessId,
    from,
    to,
    limit = 10
  }: ListAvailableSlotsInput): Promise<AvailableSlot[]> {
    const supabase = getSupabaseServerClient();
    let query = supabase
      .from("calendar_slots")
      .select("*")
      .eq("business_id", businessId)
      .eq("status", STATUS_AVAILABLE)
      .order("starts_at", { ascending: true, nullsFirst: false })
      .limit(limit);

    if (from) query = query.gte("starts_at", from.toISOString());
    if (to) query = query.lte("starts_at", to.toISOString());

    const { data, error } = await query;
    if (error) {
      throw new Error(`Failed to list available slots: ${error.message}`);
    }
    return (data ?? []).map(mapAvailable);
  },

  async bookSlot({
    businessId,
    slotId,
    bookedFor,
    notes
  }: BookSlotInput): Promise<BookedSlot> {
    const supabase = getSupabaseServerClient();

    const { data: existing, error: lookupError } = await supabase
      .from("calendar_slots")
      .select("*")
      .eq("id", slotId)
      .eq("business_id", businessId)
      .maybeSingle();

    if (lookupError) {
      throw new Error(`Failed to look up slot: ${lookupError.message}`);
    }
    if (!existing) {
      throw new Error(`Slot ${slotId} not found.`);
    }
    if (existing.status !== STATUS_AVAILABLE) {
      throw new Error(`Slot ${slotId} is not available (status: ${existing.status}).`);
    }

    const { data: updated, error: updateError } = await supabase
      .from("calendar_slots")
      .update({
        status: STATUS_BOOKED,
        owner: bookedFor,
        title: notes ? `${existing.title} — ${notes}` : existing.title
      })
      .eq("id", slotId)
      .eq("business_id", businessId)
      .eq("status", STATUS_AVAILABLE)
      .select("*")
      .single();

    if (updateError || !updated) {
      throw new Error(
        `Failed to book slot ${slotId}: ${updateError?.message ?? "race or already booked"}`
      );
    }

    return {
      ...mapAvailable(updated),
      bookedFor,
      notes
    };
  }
};
