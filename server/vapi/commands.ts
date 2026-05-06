import "server-only";

import {
  createQueuedSalesCall,
  updateSalesCall,
  type SalesCallRecord
} from "@/server/calls/store";
import { CommandError } from "@/server/commands/errors";
import { startVapiSalesCall } from "@/server/vapi/client";

type StartVapiCallCommandInput = {
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

  if (leadName.length < 2) {
    throw new CommandError("VALIDATION_ERROR", "שם הליד חייב להכיל לפחות 2 תווים.", 400);
  }

  if (phone.length < 9) {
    throw new CommandError("VALIDATION_ERROR", "מספר הטלפון קצר מדי.", 400);
  }

  if (interest.length < 2) {
    throw new CommandError("VALIDATION_ERROR", "צריך לתאר בקצרה במה הליד מתעניין.", 400);
  }

  return { leadName, phone, interest };
}

export async function startVapiCallCommand(
  input: StartVapiCallCommandInput
): Promise<StartVapiCallCommandResult> {
  const parsed = validateStartVapiCallInput(input);
  const call = await createQueuedSalesCall(parsed);

  try {
    const result = await startVapiSalesCall({
      ...parsed,
      localCallId: call.id
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
