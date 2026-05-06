import "server-only";

import type { ApiErrorCode } from "@/lib/api";

export class CommandError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;

  constructor(code: ApiErrorCode, message: string, status: number) {
    super(message);
    this.name = "CommandError";
    this.code = code;
    this.status = status;
  }
}

export function mapCommandError(error: unknown) {
  if (error instanceof CommandError) {
    return error;
  }

  const message = error instanceof Error ? error.message : "Unknown server error.";

  if (message.startsWith("Missing ")) {
    return new CommandError("CONFIGURATION_ERROR", message, 500);
  }

  return new CommandError("UNKNOWN_ERROR", message, 500);
}
