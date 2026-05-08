import { apiFailure, apiSuccess } from "@/server/api/response";
import { CommandError } from "@/server/commands/errors";
import { updateAgentCommand } from "@/server/commands/agents";
import { deleteAgent, getAgent } from "@/server/agents/store";
import { getCurrentBusinessId } from "@/server/auth/session";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  try {
    const businessId = await getCurrentBusinessId();
    if (!businessId) {
      throw new CommandError("UNAUTHORIZED", "יש להתחבר.", 401);
    }
    const { id } = await params;
    const agent = await getAgent(id, businessId);
    if (!agent) {
      throw new CommandError("VALIDATION_ERROR", "הסוכן לא נמצא.", 404);
    }
    return apiSuccess({ agent });
  } catch (error) {
    return apiFailure(error);
  }
}

export async function PATCH(request: Request, { params }: Context) {
  try {
    const businessId = await getCurrentBusinessId();
    if (!businessId) {
      throw new CommandError("UNAUTHORIZED", "יש להתחבר.", 401);
    }
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const result = await updateAgentCommand({ ...body, id, businessId });
    return apiSuccess(result);
  } catch (error) {
    return apiFailure(error);
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  try {
    const businessId = await getCurrentBusinessId();
    if (!businessId) {
      throw new CommandError("UNAUTHORIZED", "יש להתחבר.", 401);
    }
    const { id } = await params;
    await deleteAgent(id, businessId);
    return apiSuccess({ deleted: true });
  } catch (error) {
    return apiFailure(error);
  }
}
