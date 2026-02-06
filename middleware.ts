import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/infrastructure/database/supabase/middleware';

const PROTECTED_ROUTES = ['/dashboard', '/send', '/transactions', '/buy', '/sell', '/settings'];
const AUTH_ROUTES = ['/login', '/signup'];

export async function middleware(request: NextRequest) {
  // Actualizar sesión de Supabase
  const response = await updateSession(request);

  const { pathname } = request.nextUrl;

  // TODO: Verificar autenticación real con Supabase
  // Por ahora, permitir acceso a todas las rutas para desarrollo
  // const isAuthenticated = await checkAuth(request);

  // Redirigir usuarios autenticados fuera de rutas de auth
  // if (AUTH_ROUTES.some(route => pathname.startsWith(route)) && isAuthenticated) {
  //   return NextResponse.redirect(new URL('/dashboard', request.url));
  // }

  // Redirigir usuarios no autenticados a login
  // if (PROTECTED_ROUTES.some(route => pathname.startsWith(route)) && !isAuthenticated) {
  //   return NextResponse.redirect(new URL('/login', request.url));
  // }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
