import "server-only";

const ELEVENLABS_AGENT_ID = "agent_0901kqqs0myteq79638e1rbk5hp1";
const ELEVENLABS_AGENT_PHONE_NUMBER = "+14709467589";
const ELEVENLABS_AGENT_PHONE_NUMBER_ID = "phnum_7601kqqsje7heyvsxyef6w85aaj7";
const ELEVENLABS_TOKEN_URL = "https://api.elevenlabs.io/v1/convai/conversation/token";
const ELEVENLABS_OUTBOUND_CALL_URL = "https://api.elevenlabs.io/v1/convai/twilio/outbound-call";

type ConversationTokenPayload = {
  token?: unknown;
};

function maskPhoneNumber(phoneNumber: string) {
  if (phoneNumber.length <= 5) {
    return phoneNumber;
  }

  return `${phoneNumber.slice(0, 3)}***${phoneNumber.slice(-2)}`;
}

function getProviderErrorMessage(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  if ("detail" in payload) {
    const detail = payload.detail;

    if (typeof detail === "string") {
      return detail;
    }

    if (detail && typeof detail === "object" && "message" in detail) {
      const message = detail.message;
      return typeof message === "string" ? message : null;
    }
  }

  if ("message" in payload && typeof payload.message === "string") {
    return payload.message;
  }

  if ("error" in payload && typeof payload.error === "string") {
    return payload.error;
  }

  return null;
}

export function getElevenLabsAgentId() {
  return ELEVENLABS_AGENT_ID;
}

export function getElevenLabsPhoneConfig() {
  return {
    phoneNumber: ELEVENLABS_AGENT_PHONE_NUMBER,
    phoneNumberId: ELEVENLABS_AGENT_PHONE_NUMBER_ID
  };
}

export function getElevenLabsConfigStatus() {
  return {
    hasApiKey: Boolean(process.env.ELEVENLABS_API_KEY),
    hasPhoneNumberId: Boolean(ELEVENLABS_AGENT_PHONE_NUMBER_ID)
  };
}

export function assertElevenLabsConfig() {
  if (!process.env.ELEVENLABS_API_KEY) {
    throw new Error("Missing ElevenLabs configuration: ELEVENLABS_API_KEY");
  }
}

export async function createElevenLabsConversationToken() {
  assertElevenLabsConfig();

  const url = new URL(ELEVENLABS_TOKEN_URL);
  url.searchParams.set("agent_id", ELEVENLABS_AGENT_ID);

  console.info("[elevenlabs:conversation-token] Requesting token", {
    agentId: ELEVENLABS_AGENT_ID,
    hasApiKey: Boolean(process.env.ELEVENLABS_API_KEY)
  });

  const requestStartedAt = Date.now();
  const response = await fetch(url, {
    headers: {
      "xi-api-key": process.env.ELEVENLABS_API_KEY ?? ""
    },
    cache: "no-store"
  });

  const payload = (await response.json().catch(() => null)) as ConversationTokenPayload | null;
  const durationMs = Date.now() - requestStartedAt;

  console.info("[elevenlabs:conversation-token] Provider response", {
    status: response.status,
    ok: response.ok,
    durationMs,
    hasToken: Boolean(payload?.token),
    providerMessage: getProviderErrorMessage(payload)
  });

  if (!response.ok) {
    const providerMessage = getProviderErrorMessage(payload);
    throw new Error(
      `ElevenLabs token request failed with ${response.status}${
        providerMessage ? `: ${providerMessage}` : ""
      }`
    );
  }

  if (!payload || typeof payload.token !== "string" || payload.token.length === 0) {
    throw new Error("ElevenLabs token request returned no token");
  }

  return {
    token: payload.token
  };
}

export async function startElevenLabsOutboundCall(input: {
  toNumber: string;
  leadName?: string;
  interest?: string;
}) {
  assertElevenLabsConfig();

  const dynamicVariables: Record<string, string> = {};

  if (input.leadName) {
    dynamicVariables.lead_name = input.leadName;
  }

  if (input.interest) {
    dynamicVariables.interest = input.interest;
  }

  console.info("[elevenlabs:outbound] Starting call", {
    agentId: ELEVENLABS_AGENT_ID,
    agentPhoneNumberId: ELEVENLABS_AGENT_PHONE_NUMBER_ID,
    fromNumber: ELEVENLABS_AGENT_PHONE_NUMBER,
    toNumber: maskPhoneNumber(input.toNumber),
    hasLeadName: Boolean(input.leadName),
    hasInterest: Boolean(input.interest)
  });

  const requestStartedAt = Date.now();
  const response = await fetch(ELEVENLABS_OUTBOUND_CALL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": process.env.ELEVENLABS_API_KEY ?? ""
    },
    body: JSON.stringify({
      agent_id: ELEVENLABS_AGENT_ID,
      agent_phone_number_id: ELEVENLABS_AGENT_PHONE_NUMBER_ID,
      to_number: input.toNumber,
      conversation_initiation_client_data:
        Object.keys(dynamicVariables).length > 0
          ? {
              dynamic_variables: dynamicVariables
            }
          : undefined
    })
  });

  const payload = (await response.json().catch(() => null)) as unknown;
  const durationMs = Date.now() - requestStartedAt;

  console.info("[elevenlabs:outbound] Provider response", {
    status: response.status,
    ok: response.ok,
    durationMs,
    providerMessage: getProviderErrorMessage(payload)
  });

  if (!response.ok) {
    const providerMessage = getProviderErrorMessage(payload);
    throw new Error(
      `ElevenLabs outbound call failed with ${response.status}${
        providerMessage ? `: ${providerMessage}` : ""
      }`
    );
  }

  return payload;
}
