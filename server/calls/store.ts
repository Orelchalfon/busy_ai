import "server-only";

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

type Store = {
  calls: SalesCallRecord[];
};

const globalStore = globalThis as typeof globalThis & {
  leadPilotCallsStore?: Store;
};

const store = globalStore.leadPilotCallsStore ?? { calls: [] };
globalStore.leadPilotCallsStore = store;

export function listSalesCalls() {
  return [...store.calls].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function createQueuedSalesCall(input: {
  leadName: string;
  phone: string;
  interest: string;
}) {
  const now = new Date().toISOString();
  const record: SalesCallRecord = {
    id: crypto.randomUUID(),
    leadName: input.leadName,
    phone: input.phone,
    interest: input.interest,
    status: "queued",
    createdAt: now,
    updatedAt: now
  };

  store.calls.unshift(record);
  return record;
}

export function updateSalesCall(
  id: string,
  patch: Partial<Omit<SalesCallRecord, "id" | "createdAt">>
) {
  const record = store.calls.find((call) => call.id === id);

  if (!record) {
    return null;
  }

  Object.assign(record, patch, { updatedAt: new Date().toISOString() });
  return record;
}

export function updateSalesCallByProviderId(
  providerCallId: string,
  patch: Partial<Omit<SalesCallRecord, "id" | "createdAt">>
) {
  const record = store.calls.find((call) => call.providerCallId === providerCallId);

  if (!record) {
    return null;
  }

  Object.assign(record, patch, { updatedAt: new Date().toISOString() });
  return record;
}
