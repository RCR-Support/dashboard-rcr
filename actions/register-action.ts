"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/zod";
import { z } from "zod";
import { RoleEnum } from "@prisma/client";

export const registerAction = async (values: z.infer<typeof registerSchema>) => {
  try {
    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) {
      return { error: "Invalid data" };
    }

    const data = parsed.data;

    // Verificar si el usuario ya existe
    const userExists = await db.user.findUnique({
      where: { email: data.email },
      include: { accounts: true },
    });

    if (userExists) {
      const hasOAuth = userExists.accounts.some((account) => account.type === "oauth");
      return { error: hasOAuth ? "El correo ya esta en uso." : "El usuario ya existe" };
    }

    // Hashear la contraseña
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Obtener los roles de la base de datos
    const roles = await db.role.findMany({
      where: { name: { in: data.roles as RoleEnum[] } },
    });

    if (roles.length === 0) {
      return { error: "Roles inválidos" };
    }
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
        roles: {
          create: roles.map((role) => ({
            roleId: role.id, // Aquí conectamos con el ID del rol
          })),
        },
        run: data.run, // Agregar si es obligatorio
        phoneNumber: data.phoneNumber, // Agregar si es obligatorio
        category: data.category, // Agregar si es obligatorio
      },
    });

    return { success: true }; // Ya no llamamos signIn aquí
  } catch (error) {
    return { error: "Internal Server Error" };
  }
};
