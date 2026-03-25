import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/appointments",
  "/chat",
  "/consultation",
];

const ROLE_ROUTES: Record<string, string[]> = {
  doctor: ["/dashboard/doctor"],
  patient: ["/dashboard/patient"],
  admin: ["/dashboard/admin"],
};

const AUTH_ROUTES = ["/auth/login", "/auth/register"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("mc_access_token")?.value;
  const roleRaw = request.cookies.get("mc_user_role")?.value;
  const role = roleRaw ?? null;

  const isProtected = PROTECTED_PREFIXES.some(p => pathname.startsWith(p));
  const isAuthRoute = AUTH_ROUTES.some(p => pathname.startsWith(p));

  if (isProtected && !token) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/auth/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token && isAuthRoute) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/";
    homeUrl.searchParams.delete("next");
    return NextResponse.redirect(homeUrl);
  }

  if (token && role) {
    for (const [allowedRole, routes] of Object.entries(ROLE_ROUTES)) {
      for (const route of routes) {
        if (pathname.startsWith(route) && role !== allowedRole) {
          const dashUrl = request.nextUrl.clone();
          dashUrl.pathname =
            role === "doctor" ? "/dashboard/doctor"
            : role === "admin" ? "/dashboard/admin"
            : "/dashboard/patient";
          return NextResponse.redirect(dashUrl);
        }
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/appointments/:path*",
    "/chat/:path*",
    "/consultation/:path*",
    "/auth/:path*",
  ],
};
