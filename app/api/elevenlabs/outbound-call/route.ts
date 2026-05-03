import { NextResponse } from "next/server";
import {
  getElevenLabsConfigStatus,
  startElevenLabsOutboundCall
} from "@/server/elevenlabs/client";

type OutboundCallBody = {
  toNumber?: unknown;
  leadName?: unknown;
  interest?: unknown;
};

function validateBody(body: OutboundCallBody) {
  const toNumber = typeof body.toNumber === "string" ? body.toNumber.trim() : "";
  const leadName = typeof body.leadName === "string" ? body.leadName.trim() : "";
  const interest = typeof body.interest === "string" ? body.interest.trim() : "";

  if (!toNumber.startsWith("+") || toNumber.length < 8) {
    return { error: "Recipient phone number must be in E.164 format, for example +972501234567." };
  }

  return {
    toNumber,
    leadName: leadName || undefined,
    interest: interest || undefined
  };
}

export async function POST(request: Request) {
  console.info("[api/elevenlabs/outbound-call] Request received");

  const parsed = validateBody((await request.json().catch(() => ({}))) as OutboundCallBody);

  if ("error" in parsed) {
    console.warn("[api/elevenlabs/outbound-call] Validation failed", {
      error: parsed.error
    });

    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    console.info("[api/elevenlabs/outbound-call] Validation passed", {
      toNumberLength: parsed.toNumber.length,
      hasLeadName: Boolean(parsed.leadName),
      hasInterest: Boolean(parsed.interest)
    });

    const call = await startElevenLabsOutboundCall(parsed);

    console.info("[api/elevenlabs/outbound-call] Call started", {
      call
    });

    return NextResponse.json({
      call
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown ElevenLabs outbound call error";

    console.error("[api/elevenlabs/outbound-call] Call failed", {
      message,
      config: getElevenLabsConfigStatus()
    });

    return NextResponse.json(
      {
        error: message,
        config: getElevenLabsConfigStatus()
      },
      { status: 502 }
    );
  }
}
