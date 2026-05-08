import "server-only";

export type AvailableSlot = {
  id: string;
  label: string;
  startsAt: string | null;
  endsAt: string | null;
};

export type BookedSlot = AvailableSlot & {
  bookedFor: string;
  notes?: string;
};

export type ListAvailableSlotsInput = {
  businessId: string;
  from?: Date;
  to?: Date;
  limit?: number;
};

export type BookSlotInput = {
  businessId: string;
  slotId: string;
  bookedFor: string;
  notes?: string;
};

export interface CalendarProvider {
  listAvailableSlots(input: ListAvailableSlotsInput): Promise<AvailableSlot[]>;
  bookSlot(input: BookSlotInput): Promise<BookedSlot>;
}
