import "server-only";

import { localSlotsProvider } from "./local-slots-provider";
import type { CalendarProvider } from "./provider";

// MVP-0: only the local provider exists. Phase MVP-1 adds GoogleCalendarProvider
// behind an OAuth-token check on the agent's connections.
export function getCalendarProvider(_businessId: string): CalendarProvider {
  // _businessId reserved for MVP-1 when provider selection becomes per-business
  void _businessId;
  return localSlotsProvider;
}

export type { CalendarProvider, AvailableSlot, BookedSlot } from "./provider";
