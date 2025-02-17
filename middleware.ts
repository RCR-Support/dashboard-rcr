import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { NextResponse } from "next/server";

const { auth: middleware } = NextAuth(authConfig);

const publicRoutes = ['/', '/login', '/register'];

export default middleware((req) => {
  console.log('Middleware ejecutado');

  const { nextUrl, auth } = req;
  const isLoggedIn = !!auth?.user;

  console.log('Ruta solicitada:', nextUrl.pathname);
  console.log('Estado de autenticación:', isLoggedIn);

  // Protected routes: /dashboard and /admin
  if (!publicRoutes.includes(nextUrl.pathname) && !isLoggedIn) {
    console.log('Redirigiendo a /login');
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  console.log('Acceso permitido');
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
