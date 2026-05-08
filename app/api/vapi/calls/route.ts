import { apiFailure, apiSuccess } from "@/server/api/response";
import { CommandError } from "@/server/commands/errors";
import { startVapiCallCommand } from "@/server/vapi/commands";
import { getCurrentBusinessId } from "@/server/auth/session";

export async function POST(request: Request) {
  try {
    const businessId = await getCurrentBusinessId();
    if (!businessId) {
      throw new CommandError("UNAUTHORIZED", "יש להתחבר כדי לבצע שיחה.", 401);
    }

    const body = await request.json().catch(() => ({}));
    const result = await startVapiCallCommand({ ...body, businessId });
    return apiSuccess(result);
  } catch (error) {
    return apiFailure(error);
  }
}
