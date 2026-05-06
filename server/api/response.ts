import "server-only";

import { NextResponse } from "next/server";
import type { ApiError, ApiResponse } from "@/lib/api";
import { mapCommandError } from "@/server/commands/errors";

export function apiSuccess<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<ApiResponse<T>>({ ok: true, data }, init);
}

export function apiFailure(error: unknown) {
  const commandError = mapCommandError(error);
  const payload: ApiResponse<never> = {
    ok: false,
    error: {
      code: commandError.code,
      message: commandError.message
    } satisfies ApiError
  };

  return NextResponse.json(payload, { status: commandError.status });
}
