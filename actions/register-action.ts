'use server';
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { signIn} from "next-auth/react";
import { registerSchema } from "@/lib/zod";
import { z } from "zod";

export const registerAction = async (values: z.infer<typeof registerSchema>) => {
  try {
    const { data, success } = registerSchema.safeParse(values);
    if (!success) {
      return {
        error: "Invalid data",
      };
    }

    // Verificar si el usuario ya existe
    const user = await db.user.findUnique({
      where: {
        email: data.email,
      },
      include: {
        accounts: true, // Incluir las cuentas asociadas
      },
    });

    if (user) {
      // Verificar si tiene cuentas OAuth vinculadas
      const oauthAccounts = user.accounts.filter((account) => account.type === "oauth");
      if (oauthAccounts.length > 0) {
        return {
          error: "To confirm your identity, sign in with the same account you used originally.",
        };
      }
      return {
        error: "User already exists",
      };
    }

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Crear el usuario
    await db.user.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        secondLastName: data.secondLastName,
        userName: data.userName,
        displayName: `${data.firstName} ${data.lastName}`,
        password: passwordHash,
        role: data.role,
      },
    });

    await signIn("credentials", {
      email: data.email,
      password: data.password,
      callbackUrl: "/",
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    console.error("Error during registration:", error);

    // Manejo de errores específicos
    if (error instanceof AuthError) {
      return { error: error.cause?.err?.message };
    }


    // Manejo de errores desconocidos
    if (error instanceof Error) {
      return { error: `Internal Server Error: ${error.message}` };
    }

    // Manejo de errores desconocidos
    return { error: "Internal Server Error: Unknown error occurred" };
  }
};
