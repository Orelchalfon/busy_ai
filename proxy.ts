import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { refreshSupabaseSession } from "@/lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

const PUBLIC_PATH_PATTERNS = [/^\/[a-z]{2}\/login$/, /^\/[a-z]{2}\/?$/];

function isProtectedPath(pathname: string) {
  return /^\/[a-z]{2}\/dashboard(\/.*)?$/.test(pathname);
}

function isPublicPath(pathname: string) {
  return PUBLIC_PATH_PATTERNS.some((pattern) => pattern.test(pathname));
}

function getLocaleFromPath(pathname: string): string {
  const segment = pathname.split("/")[1];
  if (segment && routing.locales.includes(segment as (typeof routing.locales)[number])) {
    return segment;
  }
  return routing.defaultLocale;
}

export default async function proxy(request: NextRequest) {
  const intlResponse = intlMiddleware(request);
  const redirectLocation = intlResponse.headers.get("location");
  if (redirectLocation) {
    return intlResponse;
  }

  const response = intlResponse;
  const { user } = await refreshSupabaseSession(request, response);
  const { pathname } = request.nextUrl;

  if (isProtectedPath(pathname) && !user) {
    const locale = getLocaleFromPath(pathname);
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = `/${locale}/login`;
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && isPublicPath(pathname) && pathname.endsWith("/login")) {
    const locale = getLocaleFromPath(pathname);
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = `/${locale}/dashboard`;
    dashboardUrl.search = "";
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"]
};
