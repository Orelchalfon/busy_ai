import { NextResponse } from "next/server";
import {
  createElevenLabsConversationToken,
  getElevenLabsConfigStatus
} from "@/server/elevenlabs/client";

export const dynamic = "force-dynamic";

export async function GET() {
  console.info("[api/elevenlabs/conversation-token] Request received");

  try {
    const token = await createElevenLabsConversationToken();

    console.info("[api/elevenlabs/conversation-token] Token issued", {
      hasToken: Boolean(token.token)
    });

    return NextResponse.json(token);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown ElevenLabs token error";

    console.error("[api/elevenlabs/conversation-token] Token request failed", {
      message,
      config: getElevenLabsConfigStatus()
    });

    return NextResponse.json(
      {
        error: message,
        config: getElevenLabsConfigStatus()
      },
      { status: 502 }
    );
  }
}
