import { NextResponse } from "next/server";
import {
  createQueuedSalesCall,
  updateSalesCall
} from "@/server/calls/store";
import { getVapiConfigStatus, startVapiSalesCall } from "@/server/vapi/client";

type StartCallBody = {
  leadName?: unknown;
  phone?: unknown;
  interest?: unknown;
};

function validateBody(body: StartCallBody) {
  const leadName = typeof body.leadName === "string" ? body.leadName.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const interest = typeof body.interest === "string" ? body.interest.trim() : "";

  if (leadName.length < 2) {
    return { error: "שם הליד חייב להכיל לפחות 2 תווים." };
  }

  if (phone.length < 9) {
    return { error: "מספר הטלפון קצר מדי." };
  }

  if (interest.length < 2) {
    return { error: "צריך לתאר בקצרה במה הליד מתעניין." };
  }

  return { leadName, phone, interest };
}

export async function POST(request: Request) {
  const parsed = validateBody((await request.json().catch(() => ({}))) as StartCallBody);

  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const call = createQueuedSalesCall(parsed);

  try {
    const result = await startVapiSalesCall({
      ...parsed,
      localCallId: call.id
    });

    const updated = updateSalesCall(call.id, {
      providerCallId: result.providerCallId,
      status: "queued"
    });

    return NextResponse.json({
      call: updated ?? call,
      provider: result.raw
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Vapi error";
    const updated = updateSalesCall(call.id, {
      status: "failed",
      summary: message
    });

    return NextResponse.json(
      {
        error: message,
        call: updated ?? call,
        config: getVapiConfigStatus()
      },
      { status: 502 }
    );
  }
}
