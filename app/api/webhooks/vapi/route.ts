import { NextResponse } from "next/server";
import {
  updateSalesCall,
  updateSalesCallByProviderId
} from "@/server/calls/store";
import type { SalesCallStatus } from "@/server/calls/store";
import type { VapiWebhookPayload } from "@/server/vapi/types";

function toSalesCallStatus(status?: string): SalesCallStatus | undefined {
  if (status === "ringing" || status === "in-progress" || status === "ended") {
    return status;
  }

  if (status === "queued" || status === "scheduled") {
    return "queued";
  }

  return undefined;
}

function getLocalCallId(payload: VapiWebhookPayload) {
  const metadata = payload.message?.call?.metadata;
  const localCallId = metadata?.localCallId;
  return typeof localCallId === "string" ? localCallId : undefined;
}

function getProviderCallId(payload: VapiWebhookPayload) {
  return payload.message?.call?.id;
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as VapiWebhookPayload;
  const message = payload.message;

  if (!message) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const localCallId = getLocalCallId(payload);
  const providerCallId = getProviderCallId(payload);

  if (message.type === "status-update") {
    const status = toSalesCallStatus(message.status);

    if (status && localCallId) {
      updateSalesCall(localCallId, { status, providerCallId });
    } else if (status && providerCallId) {
      updateSalesCallByProviderId(providerCallId, { status });
    }

    return NextResponse.json({ ok: true });
  }

  if (message.type === "end-of-call-report") {
    const recordingUrl =
      message.artifact?.recording?.stereoUrl ??
      message.artifact?.recording?.mono?.combinedUrl;
    const summary =
      message.summary ??
      "השיחה הסתיימה. סיכום מפורט יתווסף כאשר Vapi יחזיר summary באירוע.";
    const transcript = message.artifact?.transcript;
    const patch = {
      status: "ended" as const,
      endedReason: message.endedReason,
      providerCallId,
      recordingUrl,
      summary,
      transcript
    };

    if (localCallId) {
      updateSalesCall(localCallId, patch);
    } else if (providerCallId) {
      updateSalesCallByProviderId(providerCallId, patch);
    }

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true, ignored: true });
}
