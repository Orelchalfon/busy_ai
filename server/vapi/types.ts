export type StartSalesCallInput = {
  leadName: string;
  phone: string;
  interest: string;
};

export type StartSalesCallResult = {
  providerCallId: string;
  raw: unknown;
};

export type VapiStatus = "scheduled" | "queued" | "ringing" | "in-progress" | "ended";

export type VapiWebhookMessage =
  | {
      type: "status-update";
      status?: VapiStatus;
      call?: {
        id?: string;
        metadata?: Record<string, unknown>;
      };
    }
  | {
      type: "end-of-call-report";
      endedReason?: string;
      call?: {
        id?: string;
        metadata?: Record<string, unknown>;
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
    };

export type VapiWebhookPayload = {
  message?: VapiWebhookMessage;
};
