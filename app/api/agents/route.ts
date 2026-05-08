import { apiFailure, apiSuccess } from "@/server/api/response";
import { CommandError } from "@/server/commands/errors";
import { createAgentCommand } from "@/server/commands/agents";
import { listAgents } from "@/server/agents/store";
import { getCurrentBusinessId } from "@/server/auth/session";

export async function GET() {
  try {
    const businessId = await getCurrentBusinessId();
    if (!businessId) {
      throw new CommandError("UNAUTHORIZED", "יש להתחבר כדי לצפות בסוכנים.", 401);
    }
    const agents = await listAgents(businessId);
    return apiSuccess({ agents });
  } catch (error) {
    return apiFailure(error);
  }
}

export async function POST(request: Request) {
  try {
    const businessId = await getCurrentBusinessId();
    if (!businessId) {
      throw new CommandError("UNAUTHORIZED", "יש להתחבר כדי ליצור סוכן.", 401);
    }
    const body = await request.json().catch(() => ({}));
    const result = await createAgentCommand({ ...body, businessId });
    return apiSuccess(result);
  } catch (error) {
    return apiFailure(error);
  }
}
