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
            // console.log("Credentials received:", credentials);
            const { data, success } = loginSchema.safeParse(credentials);

            if (!success) {
            // console.log("Invalid credentials schema");
            throw new Error("Invalid credentials");
            }

            // Verificar si el usuario existe en la base de datos
            const user = await db.user.findUnique({
            where: {
                email: data.email,
            },
            });

            if (!user || !user.password) {
            // console.log("User not found or password not set");
            throw new Error("User not found - Invalid credentials");
            }

            // Verificar si la contraseña es correcta
            const isValid = await bcryptjs.compare(data.password, user.password);
            if (!isValid) {
            // console.log("Invalid password");
            throw new Error("Invalid credentials");
            }

            // console.log("User authenticated:", user);
            return user;
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
            token.role = user.role;
        }
        return token;
        },
        async session({ session, token }) {
        if (session.user) {
            session.user.role = token.role;
        }
        return session;
        },
    },
} satisfies NextAuthConfig;
