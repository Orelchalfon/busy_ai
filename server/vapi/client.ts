import "server-only";

import type {
  StartSalesCallInput,
  StartSalesCallResult,
  VapiCallMetadata
} from "./types";
import { normalizePhoneNumber } from "./phone";
import { VAPI_TOOLS } from "./tools";

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

export type StartVapiSalesCallExtras = {
  localCallId: string;
  businessId: string;
  agentId?: string;
  agentName: string;
  businessName: string;
  systemPrompt: string;
  firstMessage: string;
};

export async function startVapiSalesCall(
  input: StartSalesCallInput & StartVapiSalesCallExtras
): Promise<StartSalesCallResult> {
  assertVapiConfig();

  const metadata: VapiCallMetadata = {
    localCallId: input.localCallId,
    businessId: input.businessId,
    agentId: input.agentId,
    leadName: input.leadName,
    phone: input.phone,
    interest: input.interest
  };

  const serverConfig: { url: string; secret?: string } = {
    url: `${process.env.APP_BASE_URL}/api/webhooks/vapi`
  };
  if (process.env.VAPI_WEBHOOK_SECRET) {
    serverConfig.secret = process.env.VAPI_WEBHOOK_SECRET;
  }

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
        firstMessage: input.firstMessage,
        model: {
          messages: [{ role: "system", content: input.systemPrompt }],
          tools: VAPI_TOOLS
        },
        variableValues: {
          leadName: input.leadName,
          phone: input.phone,
          interest: input.interest,
          businessName: input.businessName,
          agentName: input.agentName
        },
        server: serverConfig,
        serverMessages: ["status-update", "end-of-call-report", "tool-calls"]
      },
      metadata
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
