import NextAuth from 'next-auth';
import authConfig from '@/auth.config';
import { NextResponse } from 'next/server';
import { permissions } from '@/config/permissions';
import { matchDynamicRoute } from '@/lib/permissions-helpers';

const { auth: middleware } = NextAuth(authConfig);

const publicRoutes = ['/', '/login', '/register', '/pre-register'];
const publicPrefixes = ['/applications/status/'];

export default middleware(req => {
  const { nextUrl, auth } = req;
  const isLoggedIn = !!auth?.user;
  const path = nextUrl.pathname;

  // Verificar si auth.user.roles existe y es un array
  const userRoles = auth?.user?.roles || [];

  // Rutas públicas por prefijo (ej: /applications/status/[token])
  if (publicPrefixes.some(prefix => path.startsWith(prefix))) {
    return NextResponse.next();
  }

  // Manejo de rutas públicas
  if (publicRoutes.includes(path)) {
    if (isLoggedIn && path !== '/') {
      return NextResponse.redirect(new URL('/dashboard', nextUrl));
    }
    return NextResponse.next();
  }

  // Verificar autenticación
  if (!isLoggedIn) {
    const loginUrl = new URL('/login', nextUrl);
    loginUrl.searchParams.set('callbackUrl', path);
    return NextResponse.redirect(loginUrl);
  }

  // Verificar permisos de ruta
  let routePermission = permissions[path];

  // ✅ Manejar rutas dinámicas usando helper centralizado
  if (!routePermission) {
    const matchedKey = matchDynamicRoute(path);
    if (matchedKey) {
      routePermission = permissions[matchedKey];
    }
  }

  // Utilizar userRoles para verificar los permisos
  if (
    routePermission &&
    !routePermission.roles.some(role => userRoles.includes(role))
  ) {
    return NextResponse.redirect(new URL('/unauthorized', nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images).*)', '/'],
};
