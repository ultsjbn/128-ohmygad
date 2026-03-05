import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import {
  PROTECTED_PREFIXES,
  ROLE_HOME,
  ROLE_ALLOWED_PREFIXES,
  isValidRole,
} from '@/lib/auth/roles';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtectedRoute = PROTECTED_PREFIXES.some((p) =>
    pathname.startsWith(p)
  );

  if (!isProtectedRoute) return NextResponse.next();

  let response = NextResponse.next({
    request: { headers: request.headers },
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
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = user.app_metadata?.role;

  if (!isValidRole(role)) {
    return NextResponse.redirect(new URL('/auth/setup', request.url));
  }

  // Check if user is allowed to access this path
  const allowed = ROLE_ALLOWED_PREFIXES[role];
  const hasAccess = allowed.some((prefix) => pathname.startsWith(prefix));
  if (!hasAccess) {
    return NextResponse.redirect(new URL(ROLE_HOME[role], request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|auth|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};