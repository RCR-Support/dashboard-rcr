import NextAuth from 'next-auth';
import authConfig from '@/auth.config';
import { NextResponse } from 'next/server';
import { permissions } from '@/config/permissions';

const { auth: middleware } = NextAuth(authConfig);

const publicRoutes = ['/', '/login', '/register', '/pre-register'];

export default middleware(req => {
  const { nextUrl, auth } = req;
  const isLoggedIn = !!auth?.user;
  const path = nextUrl.pathname;

  // Verificar si auth.user.roles existe y es un array
  const userRoles = auth?.user?.roles || [];

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
  } // Verificar permisos de ruta
  let routePermission = permissions[path];

  // Manejar rutas dinámicas como /dashboard/activities/edit/[id]
  if (!routePermission) {
    // Comprobar rutas dinámicas de actividades
    if (path.startsWith('/dashboard/activities/edit/')) {
      routePermission = permissions['/dashboard/activities/edit'];
    }
    // Agregar otras rutas dinámicas aquí si es necesario
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
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)', '/'],
};
