export type StartSalesCallInput = {
  leadName: string;
  phone: string;
  interest: string;
  agentId?: string;
};

export type StartSalesCallResult = {
  providerCallId: string;
  raw: unknown;
};

export type VapiStatus = "scheduled" | "queued" | "ringing" | "in-progress" | "ended";

export type VapiToolCall = {
  id: string;
  type?: string;
  function?: {
    name?: string;
    arguments?: unknown;
  };
};

export type VapiCallMetadata = {
  localCallId?: string;
  businessId?: string;
  agentId?: string;
  leadName?: string;
  phone?: string;
  interest?: string;
};

export type VapiWebhookMessage =
  | {
      type: "status-update";
      status?: VapiStatus;
      call?: {
        id?: string;
        metadata?: VapiCallMetadata;
      };
    }
  | {
      type: "end-of-call-report";
      endedReason?: string;
      call?: {
        id?: string;
        metadata?: VapiCallMetadata;
      };
      artifact?: {
        transcript?: string;
        recording?: {
          stereoUrl?: string;
          mono?: {
            combinedUrl?: string;
          };
        };
        messages?: Array<{
          role?: string;
          message?: string;
        }>;
      };
      summary?: string;
    }
  | {
      type: "tool-calls";
      toolCallList?: VapiToolCall[];
      toolCalls?: VapiToolCall[];
      call?: {
        id?: string;
        metadata?: VapiCallMetadata;
      };
    };

export type VapiWebhookPayload = {
  message?: VapiWebhookMessage;
};
