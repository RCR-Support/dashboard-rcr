'use server';

import { signIn } from "@/auth";
import { db } from "@/lib/db";
import { loginSchema , registerSchema } from "@/lib/zod";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { z } from "zod";


export const loginAction = async (values: z.infer<typeof loginSchema>) => {
        try {
        await signIn("credentials", {
            email: values.email.toLowerCase(),
            password: values.password,
            redirect: false,
        });
        return { success: true };
        } catch (error) {
        if (error instanceof AuthError) {
            return { error: error.cause?.err?.message };
        }
        return { error: "error 500" };
        }
    };
