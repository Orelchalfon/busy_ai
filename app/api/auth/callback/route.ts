import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureBusinessForUser } from "@/server/auth/provision";
import { listAgents } from "@/server/agents/store";
import { routing } from "@/i18n/routing";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const requestedNext = url.searchParams.get("next");

  if (!code) {
    return NextResponse.redirect(
      new URL(`/${routing.defaultLocale}/login?error=missing_code`, url.origin)
    );
  }

  const supabase = await createSupabaseServerClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return NextResponse.redirect(
      new URL(
        `/${routing.defaultLocale}/login?error=${encodeURIComponent(exchangeError.message)}`,
        url.origin
      )
    );
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      new URL(`/${routing.defaultLocale}/login?error=no_user`, url.origin)
    );
  }

  let businessId: string;
  try {
    businessId = await ensureBusinessForUser(user);
  } catch (error) {
    const message = error instanceof Error ? error.message : "provisioning_failed";
    return NextResponse.redirect(
      new URL(
        `/${routing.defaultLocale}/login?error=${encodeURIComponent(message)}`,
        url.origin
      )
    );
  }

  const agents = await listAgents(businessId);
  const fallback =
    agents.length === 0
      ? `/${routing.defaultLocale}/dashboard/agents/new`
      : `/${routing.defaultLocale}/dashboard/agents`;

  const safeNext =
    requestedNext && requestedNext.startsWith("/") ? requestedNext : fallback;
  return NextResponse.redirect(new URL(safeNext, url.origin));
}
