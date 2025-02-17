import { db } from "@/lib/db";
import { loginSchema } from "@/lib/zod";
import bcryptjs from "bcryptjs";
import { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";


export default {
    providers: [
        Credentials({
            authorize: async (credentials) => {
                const { data, success } = loginSchema.safeParse(credentials);

                if (!success) {
                    throw new Error("Invalid credentials");
                }
                //verificar si el usuario existe en la base de datos
                const user = await db.user.findUnique({
                    where: {
                        email: data.email,
                    },
                });
                if (!user || !user.password) {
                    throw new Error("User not found - Invalid credentials");
                }
                //verificar si la contraseña es correcta
                const isValid = await bcryptjs.compare(data.password, user.password);
                if (!isValid) {
                    throw new Error("Invalid credentials");
                }
                return user;
            }
        }),
    ],
} satisfies NextAuthConfig
