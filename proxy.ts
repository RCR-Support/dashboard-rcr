import NextAuth from 'next-auth';
import authConfig from '@/auth.config';
import { NextResponse } from 'next/server';
import { permissions } from '@/config/permissions';
import { matchDynamicRoute } from '@/lib/permissions-helpers';

const { auth: proxy } = NextAuth(authConfig);

const publicRoutes = ['/', '/login', '/register', '/pre-register', '/set-password'];
const publicPrefixes = ['/applications/status/'];

export default proxy(req => {
  const { nextUrl, auth } = req;
  const isLoggedIn = !!auth?.user;
  const path = nextUrl.pathname;

  const userRoles = auth?.user?.roles || [];

  if (publicPrefixes.some(prefix => path.startsWith(prefix))) {
    return NextResponse.next();
  }

  if (publicRoutes.includes(path)) {
    if (isLoggedIn && path !== '/') {
      return NextResponse.redirect(new URL('/dashboard', nextUrl));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    const loginUrl = new URL('/login', nextUrl);
    loginUrl.searchParams.set('callbackUrl', path);
    return NextResponse.redirect(loginUrl);
  }

  let routePermission = permissions[path];
  if (!routePermission) {
    const matchedKey = matchDynamicRoute(path);
    if (matchedKey) {
      routePermission = permissions[matchedKey];
    }
  }

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