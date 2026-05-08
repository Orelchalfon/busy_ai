import "server-only";

import {
  createQueuedSalesCall,
  updateSalesCall,
  type SalesCallRecord
} from "@/server/calls/store";
import { CommandError } from "@/server/commands/errors";
import { startVapiSalesCall } from "@/server/vapi/client";
import { buildHebrewSalesPrompt } from "@/server/vapi/playbook";
import { getAgent } from "@/server/agents/store";
import { getBusinessSettings, getProducts } from "@/server/db/data";

type StartVapiCallCommandInput = {
  businessId: string;
  agentId?: unknown;
  leadName?: unknown;
  phone?: unknown;
  interest?: unknown;
};

export type StartVapiCallCommandResult = {
  call: SalesCallRecord;
};

function validateStartVapiCallInput(input: StartVapiCallCommandInput) {
  const leadName = typeof input.leadName === "string" ? input.leadName.trim() : "";
  const phone = typeof input.phone === "string" ? input.phone.trim() : "";
  const interest = typeof input.interest === "string" ? input.interest.trim() : "";
  const agentId = typeof input.agentId === "string" ? input.agentId.trim() : "";

  if (leadName.length < 2) {
    throw new CommandError("VALIDATION_ERROR", "שם הליד חייב להכיל לפחות 2 תווים.", 400);
  }
  if (phone.length < 9) {
    throw new CommandError("VALIDATION_ERROR", "מספר הטלפון קצר מדי.", 400);
  }
  if (interest.length < 2) {
    throw new CommandError("VALIDATION_ERROR", "צריך לתאר בקצרה במה הליד מתעניין.", 400);
  }
  if (!agentId) {
    throw new CommandError("VALIDATION_ERROR", "חסר מזהה סוכן לשיחה.", 400);
  }

  return { leadName, phone, interest, agentId };
}

export async function startVapiCallCommand(
  input: StartVapiCallCommandInput
): Promise<StartVapiCallCommandResult> {
  const parsed = validateStartVapiCallInput(input);

  const [agent, businessSettings, products] = await Promise.all([
    getAgent(parsed.agentId, input.businessId),
    getBusinessSettings(input.businessId),
    getProducts(input.businessId)
  ]);

  if (!agent) {
    throw new CommandError("VALIDATION_ERROR", "הסוכן לא נמצא בעסק שלך.", 404);
  }

  const call = await createQueuedSalesCall({
    businessId: input.businessId,
    agentId: agent.id,
    leadName: parsed.leadName,
    phone: parsed.phone,
    interest: parsed.interest
  });

  const systemPrompt = buildHebrewSalesPrompt({
    call: {
      leadName: parsed.leadName,
      phone: parsed.phone,
      interest: parsed.interest
    },
    business: businessSettings.business,
    agent,
    products
  });

  const firstMessage = `שלום ${parsed.leadName}, מדבר ${agent.name} מ${businessSettings.business.name}. זה זמן נוח לדבר רגע?`;

  try {
    const result = await startVapiSalesCall({
      leadName: parsed.leadName,
      phone: parsed.phone,
      interest: parsed.interest,
      localCallId: call.id,
      businessId: input.businessId,
      agentId: agent.id,
      agentName: agent.name,
      businessName: businessSettings.business.name,
      systemPrompt,
      firstMessage
    });

    const updated = await updateSalesCall(call.id, {
      providerCallId: result.providerCallId,
      status: "queued"
    });

    return {
      call: updated ?? call
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Vapi error";
    await updateSalesCall(call.id, {
      status: "failed",
      summary: message
    });

    throw new CommandError("PROVIDER_ERROR", message, 502);
  }
}
