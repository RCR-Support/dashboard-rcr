import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { NextResponse } from "next/server";
import { permissions } from "@/config/permissions";

const { auth: middleware } = NextAuth(authConfig);

const publicRoutes = ['/', '/login', '/register'];

export default middleware((req) => {
    const { nextUrl, auth } = req;
    const isLoggedIn = !!auth?.user;
    const path = nextUrl.pathname;

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
    const routePermission = permissions[path];
    if (routePermission && !routePermission.roles.some(role => auth.user.roles.includes(role))) {
        return NextResponse.redirect(new URL('/unauthorized', nextUrl));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)", "/"]
};
