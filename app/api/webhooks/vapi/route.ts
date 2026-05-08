import { NextResponse } from "next/server";
import { apiSuccess } from "@/server/api/response";
import {
  updateSalesCall,
  updateSalesCallByProviderId
} from "@/server/calls/store";
import type { SalesCallStatus } from "@/server/calls/store";
import { dispatchToolCalls } from "@/server/vapi/tools";
import type { VapiToolCall, VapiWebhookPayload } from "@/server/vapi/types";

function toSalesCallStatus(status?: string): SalesCallStatus | undefined {
  if (status === "ringing" || status === "in-progress" || status === "ended") {
    return status;
  }

  if (status === "queued" || status === "scheduled") {
    return "queued";
  }

  return undefined;
}

function getMetadata(payload: VapiWebhookPayload) {
  return payload.message?.call?.metadata ?? {};
}

function getProviderCallId(payload: VapiWebhookPayload) {
  return payload.message?.call?.id;
}

function verifyWebhookSecret(request: Request): boolean {
  const expected = process.env.VAPI_WEBHOOK_SECRET;
  if (!expected) {
    // No secret configured yet — allow but log. After secret is set in env +
    // assistantOverrides.server.secret, every Vapi request must carry it.
    console.warn("[vapi:webhook] VAPI_WEBHOOK_SECRET not set — accepting unauthenticated webhook");
    return true;
  }
  const provided = request.headers.get("x-vapi-secret");
  return provided === expected;
}

export async function POST(request: Request) {
  if (!verifyWebhookSecret(request)) {
    return NextResponse.json(
      { ok: false, error: { code: "UNAUTHORIZED", message: "Invalid webhook secret." } },
      { status: 401 }
    );
  }

  const payload = (await request.json().catch(() => ({}))) as VapiWebhookPayload;
  const message = payload.message;

  if (!message) {
    return apiSuccess({ ignored: true });
  }

  const metadata = getMetadata(payload);
  const localCallId = typeof metadata.localCallId === "string" ? metadata.localCallId : undefined;
  const providerCallId = getProviderCallId(payload);

  if (message.type === "status-update") {
    const status = toSalesCallStatus(message.status);

    if (status && localCallId) {
      await updateSalesCall(localCallId, { status, providerCallId });
    } else if (status && providerCallId) {
      await updateSalesCallByProviderId(providerCallId, { status });
    }

    return apiSuccess({ ignored: false });
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
      await updateSalesCall(localCallId, patch);
    } else if (providerCallId) {
      await updateSalesCallByProviderId(providerCallId, patch);
    }

    return apiSuccess({ ignored: false });
  }

  if (message.type === "tool-calls") {
    const toolCalls: VapiToolCall[] = message.toolCallList ?? message.toolCalls ?? [];
    if (toolCalls.length === 0) {
      return NextResponse.json({ results: [] });
    }

    const businessId = typeof metadata.businessId === "string" ? metadata.businessId : "";
    const leadName = typeof metadata.leadName === "string" ? metadata.leadName : "";
    const phone = typeof metadata.phone === "string" ? metadata.phone : "";

    if (!businessId || !leadName) {
      console.error(
        "[vapi:webhook] tool-calls received without businessId/leadName in metadata",
        metadata
      );
      return NextResponse.json(
        {
          results: toolCalls.map((c) => ({
            toolCallId: c.id,
            result: JSON.stringify({ ok: false, error: "Missing call context." })
          }))
        }
      );
    }

    const dispatched = await dispatchToolCalls(
      {
        businessId,
        agentId: typeof metadata.agentId === "string" ? metadata.agentId : undefined,
        localCallId,
        providerCallId,
        leadName,
        phone
      },
      toolCalls
        .filter((c): c is VapiToolCall & { id: string } => typeof c.id === "string")
        .map((c) => ({
          id: c.id,
          function: {
            name: c.function?.name ?? "",
            arguments: c.function?.arguments
          }
        }))
    );

    return NextResponse.json(dispatched);
  }

  return apiSuccess({ ignored: true });
}
