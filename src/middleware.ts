import { NextResponse, type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Обработка admin роутов через Supabase middleware (без локализации)
  if (pathname.startsWith("/admin")) {
    return updateSession(request);
  }

  // Для остальных роутов используем intl middleware
  return intlMiddleware(request);
}

export const config = {
  // Исключаем api, _next, статические файлы
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
