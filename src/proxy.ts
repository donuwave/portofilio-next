import { NextResponse, type NextRequest } from "next/server";
import { indexingAllowed, NOINDEX_HEADER } from "@/lib/indexing";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";
import { DEFAULT_LOCALE, LOCALE_HEADER, LOCALES } from "@/shared/i18n/config";

const PUBLIC_ADMIN_PATHS = ["/admin/login"];
// /api/public/ is the only unauthenticated write surface (the contact form).
const PUBLIC_API_PREFIXES = ["/api/auth/", "/api/public/"];

const PROTECTED_PREFIXES = ["/api", "/admin", "/uploads"];

// Public pages: `/en/...` is served by the same routes as `/...`, with the
// locale handed to server code through a header. Russian has no prefix.
function routeLocale(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const headers = new Headers(request.headers);

  for (const locale of LOCALES) {
    if (pathname !== `/${locale}` && !pathname.startsWith(`/${locale}/`)) continue;
    const stripped = pathname.slice(locale.length + 1) || "/";

    // A locale prefix is only for public pages. Rewriting `/en/api/...` would hand
    // a protected route to the router without the auth check below ever seeing it.
    if (PROTECTED_PREFIXES.some((prefix) => stripped === prefix || stripped.startsWith(`${prefix}/`))) {
      return new NextResponse(null, { status: 404 });
    }

    // The default locale has one canonical URL: the unprefixed one.
    if (locale === DEFAULT_LOCALE) {
      const url = request.nextUrl.clone();
      url.pathname = stripped;
      return NextResponse.redirect(url, 308);
    }

    headers.set(LOCALE_HEADER, locale);
    const url = request.nextUrl.clone();
    url.pathname = stripped;
    return NextResponse.rewrite(url, { request: { headers } });
  }

  // Always overwrite: a client must not be able to pick the locale with its own header.
  headers.set(LOCALE_HEADER, DEFAULT_LOCALE);
  return NextResponse.next({ request: { headers } });
}

export async function proxy(request: NextRequest) {
  const response = await handle(request);
  if (!indexingAllowed()) response.headers.set("X-Robots-Tag", NOINDEX_HEADER);
  return response;
}

async function handle(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isApiRoute = pathname.startsWith("/api/");
  const isPublicApi = PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isAdminRoute = pathname.startsWith("/admin");
  const isPublicAdminPath = PUBLIC_ADMIN_PATHS.includes(pathname);

  const needsAuth = (isApiRoute && !isPublicApi) || (isAdminRoute && !isPublicAdminPath);
  if (!needsAuth) {
    return isApiRoute || isAdminRoute ? NextResponse.next() : routeLocale(request);
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (session) return NextResponse.next();

  if (isApiRoute) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/admin/login", request.nextUrl.origin);
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Everything except Next internals, uploaded files and static files (anything with a dot).
  matcher: ["/((?!_next/|uploads/|.*\\..*).*)"],
};
