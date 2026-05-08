import "server-only";

import { CommandError } from "@/server/commands/errors";
import {
  createAgent,
  updateAgent,
  type AgentRecord
} from "@/server/agents/store";

type CreateAgentInput = {
  businessId: string;
  name?: unknown;
  persona?: unknown;
  servicesText?: unknown;
};

type UpdateAgentInput = {
  id: string;
  businessId: string;
  name?: unknown;
  persona?: unknown;
  servicesText?: unknown;
  isActive?: unknown;
};

function parseString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function validateName(name: string) {
  if (name.length < 2) {
    throw new CommandError("VALIDATION_ERROR", "שם הסוכן חייב להכיל לפחות 2 תווים.", 400);
  }
}

function validatePersona(persona: string) {
  if (persona.length < 20) {
    throw new CommandError(
      "VALIDATION_ERROR",
      "תיאור האופי של הסוכן חייב להכיל לפחות 20 תווים.",
      400
    );
  }
}

function validateServicesText(servicesText: string) {
  if (servicesText.length < 10) {
    throw new CommandError(
      "VALIDATION_ERROR",
      "תיאור השירותים חייב להכיל לפחות 10 תווים.",
      400
    );
  }
}

export async function createAgentCommand(input: CreateAgentInput): Promise<{ agent: AgentRecord }> {
  const name = parseString(input.name);
  const persona = parseString(input.persona);
  const servicesText = parseString(input.servicesText);

  validateName(name);
  validatePersona(persona);
  validateServicesText(servicesText);

  const agent = await createAgent({
    businessId: input.businessId,
    name,
    persona,
    servicesText
  });

  return { agent };
}

export async function updateAgentCommand(input: UpdateAgentInput): Promise<{ agent: AgentRecord }> {
  const patch: Partial<{
    name: string;
    persona: string;
    servicesText: string;
    isActive: boolean;
  }> = {};

  if (input.name !== undefined) {
    patch.name = parseString(input.name);
    validateName(patch.name);
  }
  if (input.persona !== undefined) {
    patch.persona = parseString(input.persona);
    validatePersona(patch.persona);
  }
  if (input.servicesText !== undefined) {
    patch.servicesText = parseString(input.servicesText);
    validateServicesText(patch.servicesText);
  }
  if (typeof input.isActive === "boolean") patch.isActive = input.isActive;

  const agent = await updateAgent(input.id, input.businessId, patch);
  if (!agent) {
    throw new CommandError("VALIDATION_ERROR", "הסוכן לא נמצא.", 404);
  }

  return { agent };
}
