import "server-only";

import { getCalendarProvider } from "@/server/calendar";
import { updateSalesCallByProviderId, updateSalesCall } from "@/server/calls/store";

/**
 * Vapi tool schemas — embedded in assistantOverrides.tools when starting a call.
 * Vapi POSTs tool-call events to the same webhook URL as status/end-of-call events.
 */
export const VAPI_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "listAvailableSlots",
      description:
        "Returns up to 10 available appointment slots for the business. Call this whenever the customer wants to schedule.",
      parameters: {
        type: "object",
        properties: {
          dateRangeNote: {
            type: "string",
            description: "Free-text note about the customer's preferred date range. Optional."
          }
        },
        required: []
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "bookCalendarSlot",
      description:
        "Book a previously-listed slot for the current lead. Use the slotId returned by listAvailableSlots.",
      parameters: {
        type: "object",
        properties: {
          slotId: { type: "string", description: "The slot id from listAvailableSlots." },
          notes: {
            type: "string",
            description: "Optional notes for the business owner about this booking."
          }
        },
        required: ["slotId"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "recordCallOutcome",
      description:
        "Call this once, before ending the call, to record the structured outcome of the conversation.",
      parameters: {
        type: "object",
        properties: {
          outcome: {
            type: "string",
            enum: [
              "booked_appointment",
              "callback_requested",
              "not_interested",
              "escalation_required",
              "answered_question_only"
            ]
          },
          interestLevel: { type: "string", enum: ["high", "medium", "low"] },
          escalationNote: {
            type: "string",
            description:
              "If outcome is escalation_required, describe what the business owner should follow up on. Optional otherwise."
          }
        },
        required: ["outcome", "interestLevel"]
      }
    }
  }
];

type ToolContext = {
  businessId: string;
  agentId?: string;
  localCallId?: string;
  providerCallId?: string;
  leadName: string;
  phone: string;
};

type ToolCallRequest = {
  id: string;
  function: { name: string; arguments: unknown };
};

type ToolCallResult = {
  toolCallId: string;
  result: string;
};

function parseArgs(raw: unknown): Record<string, unknown> {
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  if (raw && typeof raw === "object") return raw as Record<string, unknown>;
  return {};
}

async function runListAvailableSlots(
  context: ToolContext,
  args: Record<string, unknown>
): Promise<string> {
  const calendar = getCalendarProvider(context.businessId);
  const slots = await calendar.listAvailableSlots({ businessId: context.businessId });
  const note = typeof args.dateRangeNote === "string" ? args.dateRangeNote : null;
  return JSON.stringify({
    note,
    count: slots.length,
    slots: slots.map((s) => ({ id: s.id, label: s.label, startsAt: s.startsAt }))
  });
}

async function runBookCalendarSlot(
  context: ToolContext,
  args: Record<string, unknown>
): Promise<string> {
  const slotId = typeof args.slotId === "string" ? args.slotId : "";
  const notes = typeof args.notes === "string" ? args.notes : undefined;
  if (!slotId) {
    return JSON.stringify({ ok: false, error: "Missing slotId." });
  }
  const calendar = getCalendarProvider(context.businessId);
  try {
    const booked = await calendar.bookSlot({
      businessId: context.businessId,
      slotId,
      bookedFor: context.leadName,
      notes
    });
    return JSON.stringify({
      ok: true,
      booked: { id: booked.id, label: booked.label, bookedFor: booked.bookedFor }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown booking error";
    return JSON.stringify({ ok: false, error: message });
  }
}

async function runRecordCallOutcome(
  context: ToolContext,
  args: Record<string, unknown>
): Promise<string> {
  const outcome = typeof args.outcome === "string" ? args.outcome : "unknown";
  const interestLevel =
    typeof args.interestLevel === "string" ? args.interestLevel : "unknown";
  const escalationNote =
    typeof args.escalationNote === "string" ? args.escalationNote : "";

  const summary = [
    `[outcome=${outcome} interest=${interestLevel}]`,
    escalationNote ? `Escalation: ${escalationNote}` : null
  ]
    .filter(Boolean)
    .join("\n");

  if (context.localCallId) {
    await updateSalesCall(context.localCallId, { summary });
  } else if (context.providerCallId) {
    await updateSalesCallByProviderId(context.providerCallId, { summary });
  }

  return JSON.stringify({ ok: true, recorded: { outcome, interestLevel } });
}

export async function dispatchToolCalls(
  context: ToolContext,
  toolCalls: ToolCallRequest[]
): Promise<{ results: ToolCallResult[] }> {
  const results: ToolCallResult[] = [];

  for (const call of toolCalls) {
    const args = parseArgs(call.function?.arguments);
    let result: string;
    try {
      switch (call.function?.name) {
        case "listAvailableSlots":
          result = await runListAvailableSlots(context, args);
          break;
        case "bookCalendarSlot":
          result = await runBookCalendarSlot(context, args);
          break;
        case "recordCallOutcome":
          result = await runRecordCallOutcome(context, args);
          break;
        default:
          result = JSON.stringify({
            ok: false,
            error: `Unknown tool: ${call.function?.name}`
          });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown tool error";
      result = JSON.stringify({ ok: false, error: message });
    }
    results.push({ toolCallId: call.id, result });
  }

  return { results };
}
