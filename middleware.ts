import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { NextResponse } from "next/server";

const { auth: middleware } = NextAuth(authConfig);

const publicRoutes = ['/', '/login', '/register'];

export default middleware((req) => {
  const { nextUrl, auth } = req;
  const isLoggedIn = !!auth?.user;

  // Si es una ruta pública y el usuario está autenticado, redirigir al dashboard
  if (publicRoutes.includes(nextUrl.pathname) && isLoggedIn && nextUrl.pathname !== '/') {
    console.log('Usuario autenticado intentando acceder a ruta pública, redirigiendo a dashboard');
    return NextResponse.redirect(new URL('/dashboard', nextUrl));
  }

  // Si es una ruta protegida y el usuario no está autenticado
  if (!publicRoutes.includes(nextUrl.pathname) && !isLoggedIn) {
    console.log('Usuario no autenticado intentando acceder a ruta protegida');
    const loginUrl = new URL('/login', nextUrl);
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
    "/",
    "/(api|trpc)(.*)"
  ],
};
