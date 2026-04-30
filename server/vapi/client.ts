import "server-only";

import type { StartSalesCallInput, StartSalesCallResult } from "./types";
import { buildHebrewSalesPrompt } from "./playbook";
import { normalizePhoneNumber } from "./phone";

const VAPI_CALL_URL = "https://api.vapi.ai/call";

export function getVapiConfigStatus() {
  return {
    hasApiKey: Boolean(process.env.VAPI_API_KEY),
    hasAssistantId: Boolean(process.env.VAPI_ASSISTANT_ID),
    hasPhoneNumberId: Boolean(process.env.VAPI_PHONE_NUMBER_ID),
    hasAppBaseUrl: Boolean(process.env.APP_BASE_URL)
  };
}

export function assertVapiConfig() {
  const missing = [
    ["VAPI_API_KEY", process.env.VAPI_API_KEY],
    ["VAPI_ASSISTANT_ID", process.env.VAPI_ASSISTANT_ID],
    ["VAPI_PHONE_NUMBER_ID", process.env.VAPI_PHONE_NUMBER_ID],
    ["APP_BASE_URL", process.env.APP_BASE_URL]
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missing.length > 0) {
    throw new Error(`Missing Vapi configuration: ${missing.join(", ")}`);
  }
}

export async function startVapiSalesCall(
  input: StartSalesCallInput & { localCallId: string }
): Promise<StartSalesCallResult> {
  assertVapiConfig();

  const response = await fetch(VAPI_CALL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      assistantId: process.env.VAPI_ASSISTANT_ID,
      phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID,
      customer: {
        name: input.leadName,
        number: normalizePhoneNumber(input.phone)
      },
      assistantOverrides: {
        firstMessage: `שלום ${input.leadName}, מדברת נציגת המכירות של LeadPilot AI. זה זמן נוח לדבר רגע?`,
        model: {
          messages: [
            {
              role: "system",
              content: buildHebrewSalesPrompt(input)
            }
          ]
        },
        server: {
          url: `${process.env.APP_BASE_URL}/api/webhooks/vapi`
        },
        serverMessages: ["status-update", "end-of-call-report"]
      },
      metadata: {
        localCallId: input.localCallId,
        leadName: input.leadName,
        interest: input.interest
      }
    })
  });

  const payload = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    throw new Error(
      `Vapi call failed with ${response.status}: ${JSON.stringify(payload)}`
    );
  }

  const providerCallId =
    typeof payload === "object" &&
    payload !== null &&
    "id" in payload &&
    typeof payload.id === "string"
      ? payload.id
      : input.localCallId;

  return {
    providerCallId,
    raw: payload
  };
}
