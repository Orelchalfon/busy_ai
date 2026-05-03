import "server-only";

import { DEFAULT_BUSINESS_ID, getSupabaseServerClient } from "./client";
import type { Database } from "./types";

type LeadRow = Database["public"]["Tables"]["leads"]["Row"];
type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type CalendarSlotRow = Database["public"]["Tables"]["calendar_slots"]["Row"];
type SalesCallRow = Database["public"]["Tables"]["sales_calls"]["Row"];
type BusinessRow = Database["public"]["Tables"]["businesses"]["Row"];
type BusinessSettingsRow = Database["public"]["Tables"]["business_settings"]["Row"];

export type LeadStatus =
  | "חדש"
  | "נוצר קשר"
  | "מתעניין"
  | "מעקב"
  | "נקבעה פגישה"
  | "נסגר"
  | "אבוד";

export type Lead = {
  id: string;
  name: string;
  phone: string;
  source: string;
  status: LeadStatus;
  value: string;
  interestNotes?: string;
};

export type CallRecord = {
  id: string;
  leadName: string;
  status: "ממתינה" | "בתהליך" | "הושלמה" | "נכשלה";
  summary: string;
  createdAt: string;
};

export type CalendarSlot = {
  id: string;
  title: string;
  window: string;
  status: "פנוי" | "שמור" | "הושלם";
  owner: string;
};

export type Product = {
  id: string;
  name: string;
  price: string;
  stock: number;
  tag: string;
};

export type DashboardStat = {
  label: string;
  value: string;
  change: string;
};

export type BusinessSettings = {
  business: {
    name: string;
    industry: string;
    phone: string;
    whatsapp: string;
  };
  automationItems: string[];
};

function assertKnownValue<T extends string>(
  value: string,
  allowed: readonly T[],
  fallback: T
) {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function formatCurrency(agorot: number) {
  return `${Math.round(agorot / 100).toLocaleString("he-IL")} ₪`;
}

function formatCreatedAt(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const time = new Intl.DateTimeFormat("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(date);

  if (isToday) {
    return `היום, ${time}`;
  }

  return new Intl.DateTimeFormat("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(date);
}

const leadStatuses = [
  "חדש",
  "נוצר קשר",
  "מתעניין",
  "מעקב",
  "נקבעה פגישה",
  "נסגר",
  "אבוד"
] as const;

const calendarStatuses = ["פנוי", "שמור", "הושלם"] as const;

function mapLead(row: LeadRow): Lead {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    source: row.source,
    status: assertKnownValue(row.status, leadStatuses, "חדש"),
    value: formatCurrency(row.estimated_value_agorot),
    interestNotes: row.interest_notes ?? undefined
  };
}

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    price: formatCurrency(row.price_agorot),
    stock: row.stock,
    tag: row.tag
  };
}

function mapCalendarSlot(row: CalendarSlotRow): CalendarSlot {
  return {
    id: row.id,
    title: row.title,
    window: row.window_label,
    status: assertKnownValue(row.status, calendarStatuses, "פנוי"),
    owner: row.owner
  };
}

function mapCallStatus(status: string): CallRecord["status"] {
  if (status === "ended") {
    return "הושלמה";
  }

  if (status === "failed") {
    return "נכשלה";
  }

  if (status === "queued" || status === "ringing") {
    return "ממתינה";
  }

  return "בתהליך";
}

function mapCall(row: SalesCallRow): CallRecord {
  return {
    id: row.id,
    leadName: row.lead_name,
    status: mapCallStatus(row.status),
    summary: row.summary ?? "השיחה ממתינה לסיכום.",
    createdAt: formatCreatedAt(row.created_at)
  };
}

function handleError(context: string, error: { message: string }) {
  throw new Error(`${context}: ${error.message}`);
}

export async function getLeads(businessId = DEFAULT_BUSINESS_ID) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: true });

  if (error) {
    handleError("Failed to load leads", error);
  }

  return (data ?? []).map(mapLead);
}

export async function getProducts(businessId = DEFAULT_BUSINESS_ID) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: true });

  if (error) {
    handleError("Failed to load products", error);
  }

  return (data ?? []).map(mapProduct);
}

export async function getCalendarSlots(businessId = DEFAULT_BUSINESS_ID) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("calendar_slots")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: true });

  if (error) {
    handleError("Failed to load calendar slots", error);
  }

  return (data ?? []).map(mapCalendarSlot);
}

export async function getCallRecords(businessId = DEFAULT_BUSINESS_ID) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("sales_calls")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (error) {
    handleError("Failed to load call records", error);
  }

  return (data ?? []).map(mapCall);
}

export async function getDashboardData(businessId = DEFAULT_BUSINESS_ID) {
  const [leads, calls, slots] = await Promise.all([
    getLeads(businessId),
    getCallRecords(businessId),
    getCalendarSlots(businessId)
  ]);

  const closedLeads = leads.filter((lead) => lead.status === "נסגר").length;
  const closeRate = leads.length > 0 ? Math.round((closedLeads / leads.length) * 100) : 0;
  const meetings = slots.filter((slot) => slot.status === "שמור" || slot.status === "הושלם").length;

  const dashboardStats: DashboardStat[] = [
    { label: "לידים חדשים השבוע", value: String(leads.length), change: "+0%" },
    { label: "שיחות AI שבוצעו", value: String(calls.length), change: "+0" },
    { label: "פגישות שנקבעו", value: String(meetings), change: "+0" },
    { label: "יחס סגירה משוער", value: `${closeRate}%`, change: "+0%" }
  ];

  return {
    dashboardStats,
    leads,
    calls,
    slots
  };
}

export async function getBusinessSettings(
  businessId = DEFAULT_BUSINESS_ID
): Promise<BusinessSettings> {
  const supabase = getSupabaseServerClient();
  const [businessResult, settingsResult] = await Promise.all([
    supabase
    .from("businesses")
      .select("*")
    .eq("id", businessId)
      .single(),
    supabase
      .from("business_settings")
      .select("*")
      .eq("business_id", businessId)
      .maybeSingle()
  ]);

  if (businessResult.error) {
    handleError("Failed to load business", businessResult.error);
  }

  if (!businessResult.data) {
    throw new Error("Failed to load business: no business row returned.");
  }

  if (settingsResult.error) {
    handleError("Failed to load business settings", settingsResult.error);
  }

  const business: BusinessRow = businessResult.data;
  const settings: BusinessSettingsRow | null = settingsResult.data;

  return {
    business: {
      name: business.name,
      industry: business.industry,
      phone: business.phone,
      whatsapp: business.whatsapp
    },
    automationItems: settings?.automation_items ?? []
  };
}
