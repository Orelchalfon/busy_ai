import { apiFailure, apiSuccess } from "@/server/api/response";
import { startVapiCallCommand } from "@/server/vapi/commands";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const result = await startVapiCallCommand(body);
    return apiSuccess(result);
  } catch (error) {
    return apiFailure(error);
  }
}
