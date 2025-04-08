"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/zod";
import { z } from "zod";
import { RoleEnum, Prisma } from "@prisma/client";
import { EditActionInput, RegisterActionInput } from "@/interfaces/action.interface";

export const registerAction = async (values: RegisterActionInput | EditActionInput) => {
  try {
    // 1. Validación del schema
    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) {
      const errors = parsed.error.errors.map(error => ({
        path: error.path.join('.'),
        message: error.message
      }));
      // console.log('Errores de validación:', errors);
      return {
        error: "Datos inválidos",
        validationErrors: parsed.error.errors.map(error => ({
          path: error.path.join('.'),
          message: error.message,
          received: error.code === "invalid_type" ? error.received : undefined
        }))
      };
    }

    const data = parsed.data;

    // 2. Verificación de duplicados
    const userExists = await db.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          { run: data.run }
        ]
      },
      include: { accounts: true },
    });

    if (userExists) {
      if (userExists.email === data.email) {
        const hasOAuth = userExists.accounts.some((account) => account.type === "oauth");
        return {
          error: hasOAuth ? "El correo ya está en uso con una cuenta OAuth" : "El correo ya está registrado",
          field: "email"
        };
      }
      return {
        error: "El RUN ya está registrado en el sistema",
        field: "run"
      };
    }

    // 3. Hashear contraseña
    const passwordHash = await bcrypt.hash(data.password, 10);

    // 4. Obtener y validar roles
    const roles = await db.role.findMany({
      where: {
        name: {
          in: data.roles as RoleEnum[]
        }
      },
    });

    if (roles.length === 0) {
      return {
        error: "Los roles seleccionados no son válidos",
        field: "roles"
      };
    }

    // 5. Preparar datos del usuario
    const userData: Prisma.UserCreateInput = {
      email: data.email,
      name: data.name,
      middleName: data.middleName,
      lastName: data.lastName,
      secondLastName: data.secondLastName,
      userName: data.userName,
      displayName: `${data.name} ${data.lastName}`,
      password: passwordHash,
      run: data.run,
      phoneNumber: data.phoneNumber,
      category: data.category,
      isActive: true,
      // Manejo de compañía
      company: data.companyId ? {
        connect: {
          id: Array.isArray(data.companyId) ? data.companyId[0] : data.companyId
        }
      } : undefined,
      // Manejo de roles
      roles: {
        create: roles.map((role) => ({
          role: {
            connect: { id: role.id }
          }
        }))
      },
      // Manejo de adminContractor
      ...(data.roles.includes('user') && data.adminContractorId ? {
        adminContractor: {
          connect: { id: data.adminContractorId }
        }
      } : {})
    };

    // 6. Crear usuario con include actualizado
    const newUser = await db.user.create({
      data: userData,
      include: {
        company: true,
        roles: {
          include: {
            role: true
          }
        },
        adminContractor: true // Incluimos la relación con el admin
      }
    });
    // Debug log
    console.log('Usuario creado:', {
      id: newUser.id,
      roles: newUser.roles.map(r => r.role.name),
      adminContractorId: newUser.adminContractorId
    });

    // 7. Retornar éxito
    return { 
      success: true,
      userId: newUser.id,
      user: {
        email: newUser.email,
        name: newUser.name,
        roles: newUser.roles.map(r => r.role.name),
        adminContractorId: newUser.adminContractorId // Agregamos esto para confirmar
      }
    };

  } catch (error) {
    // console.error("Error en registro:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return { 
          error: "Ya existe un usuario con ese correo o RUN",
          field: error.meta?.target as string
        };
      }
    }
    return { 
      error: "Error interno del servidor",
      details: process.env.NODE_ENV === 'development' ? error : undefined
    };
  }
};
