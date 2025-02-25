"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/zod";
import { z } from "zod";

export const registerAction = async (values: z.infer<typeof registerSchema>) => {
  try {
    const { data, success } = registerSchema.safeParse(values);
    if (!success) {
      return { error: "Invalid data" };
    }

    // Verificar si el usuario ya existe
    const userExists = await db.user.findUnique({
      where: { email: data.email },
      include: { accounts: true },
    });

    if (userExists) {
      const hasOAuth = userExists.accounts.some((account) => account.type === "oauth");
      return { error: hasOAuth ? "Sign in with your existing OAuth account." : "User already exists" };
    }

    // Hashear la contraseña
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Crear el usuario en la base de datos
    await db.user.create({
      data: {
        email: data.email,
        name: data.name,
        middleName: data.middleName,
        lastName: data.lastName,
        secondLastName: data.secondLastName,
        userName: data.userName,
        displayName: `${data.name} ${data.lastName}`,
        password: passwordHash,
        role: data.role,
      },
    });

    return { success: true }; // Ya no llamamos signIn aquí
  } catch (error) {
    return { error: "Internal Server Error" };
  }
};
