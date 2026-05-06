export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "CONFIGURATION_ERROR"
  | "PROVIDER_ERROR"
  | "UNKNOWN_ERROR";

export type ApiError = {
  code: ApiErrorCode;
  message: string;
};

export type ApiResponse<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: ApiError;
    };

export class ApiClientError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;

  constructor(error: ApiError, status: number) {
    super(error.message);
    this.name = "ApiClientError";
    this.code = error.code;
    this.status = status;
  }
}

export async function apiRequest<T>(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, init);
  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!payload || typeof payload !== "object" || !("ok" in payload)) {
    throw new ApiClientError(
      {
        code: "UNKNOWN_ERROR",
        message: "Unexpected API response."
      },
      response.status
    );
  }

  if (!payload.ok) {
    throw new ApiClientError(payload.error, response.status);
  }

  return payload.data;
}
