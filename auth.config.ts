import { db } from "@/lib/db";
import { loginSchema } from "@/lib/zod";
import bcryptjs from "bcryptjs";
import { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export default {
    providers: [
        Credentials({
        name: "Credentials",
        credentials: {
            email: { label: "Email", type: "text" },
            password: { label: "Password", type: "password" },
        },
        authorize: async (credentials) => {
            console.log("Credentials received:", credentials);

            // Validar el esquema de credenciales con Zod
            const { data, success } = loginSchema.safeParse(credentials);

            if (!success) {
            console.log("Invalid credentials schema");
            throw new Error("Invalid credentials");
            }

            // Verificar si el usuario existe en la base de datos
            const user = await db.user.findUnique({
                where: {
                    email: data.email.toLowerCase(),
                },
                include: {
                    roles: {
                        include: {
                            role: true,
                        },
                    },
                },
            });

            if (!user || !user.password) {
            console.log("User not found or password not set");
            throw new Error("User not found - Invalid credentials");
            }

            // Verificar si la contraseña es correcta
            const isValid = await bcryptjs.compare(data.password, user.password);
            if (!isValid) {
            // console.log("Invalid password");
            throw new Error("Invalid credentials");
            }

            // Devolver el usuario autenticado con los roles
            console.log("User authenticated:", user);
            return {
                ...user,
                roles: user.roles.map((userRole) => userRole.role.name),
            };
        },
        }),
    ],
    pages: {
        signIn: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async jwt({ token, user }) {
        if (user) {
            token.roles = user.roles;
        }
        return token;
        },
        async session({ session, token }) {
        if (session.user) {
            session.user.roles = token.roles;
        }
        return session;
        },
    },
} satisfies NextAuthConfig;
