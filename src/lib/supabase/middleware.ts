import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAdminUser } from "@/lib/auth/require-admin";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (err) {
    // Auth check failed — log (we want visibility) and continue without user
    console.warn("[middleware] supabase.auth.getUser failed:", err);
  }

  // Защита админ-роутов
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const admin = isAdminUser(user);

    // Страница логина: если уже залогинен И админ — уводим в админку,
    // если залогинен, но не админ — пускаем на логин (чтобы мог перелогиниться)
    if (request.nextUrl.pathname === "/admin/login") {
      if (user && admin) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return supabaseResponse;
    }

    // Для всех остальных /admin/* — требуем именно админа.
    // Просто залогиненный не-админ (например, мобильный юзер) должен
    // получить редирект на логин, а не попасть в админку.
    if (!user || !admin) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return supabaseResponse;
}
