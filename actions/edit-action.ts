"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { editSchema } from "@/lib/zod";
import { Prisma, RoleEnum } from "@prisma/client";
import { EditActionInput } from "@/interfaces/action.interface";
import { revalidatePath } from "next/cache";

export const editAction = async (userId: string, values: EditActionInput) => {
  try {
    // 1. Validación del schema
    const parsed = editSchema.safeParse(values);
    if (!parsed.success) {
      return {
        error: "Datos inválidos",
        validationErrors: parsed.error.errors.map(error => ({
          path: error.path.join('.'),
          message: error.message
        }))
      };
    }

    const data = parsed.data;

    // 2. Verificar si el email o run ya existe (excluyendo el usuario actual)
    const userExists = await db.user.findFirst({
      where: {
        AND: [
          { NOT: { id: userId } },
          {
            OR: [
              { email: data.email },
              { run: data.run }
            ]
          }
        ]
      }
    });

    if (userExists) {
      if (userExists.email === data.email) {
        return {
          error: "El correo ya está registrado por otro usuario",
          field: "email"
        };
      }
      return {
        error: "El RUN ya está registrado por otro usuario",
        field: "run"
      };
    }

    // 3. Preparar datos de actualización
    const updateData: Prisma.UserUpdateInput = {
      email: data.email,
      name: data.name,
      middleName: data.middleName,
      lastName: data.lastName,
      secondLastName: data.secondLastName,
      userName: data.userName,
      displayName: `${data.name} ${data.lastName}`,
      run: data.run,
      phoneNumber: data.phoneNumber,
      category: data.category,
      company: data.companyId ? {
        connect: {
          id: Array.isArray(data.companyId) ? data.companyId[0] : data.companyId
        }
      } : undefined,
      // Manejo de adminContractor
      ...(data.roles.includes('user') ? {
        adminContractor: data.adminContractorId ? {
          connect: { id: data.adminContractorId }
        } : {
          disconnect: true
        }
      } : {
        adminContractor: {
          disconnect: true
        }
      })
    };

    // 4. Si hay contraseña nueva, hashearla
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    // 5. Actualizar roles si han cambiado
    if (data.roles && data.roles.length > 0) {
      // Obtener roles válidos
      const roles = await db.role.findMany({
        where: {
          name: {
            in: data.roles as RoleEnum[]
          }
        }
      });

      if (roles.length === 0) {
        return {
          error: "Los roles seleccionados no son válidos",
          field: "roles"
        };
      }

      // Eliminar roles actuales y crear nuevos
      await db.userRole.deleteMany({
        where: { userId }
      });

      updateData.roles = {
        create: roles.map((role) => ({
          role: {
            connect: { id: role.id }
          }
        }))
      };
    }

    // 6. Actualizar usuario
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        company: true,
        roles: {
          include: {
            role: true
          }
        },
        adminContractor: true // Incluir la relación adminContractor
      }
    });

    // 7. Retornar éxito con datos actualizados
    revalidatePath('/dashboard/users');
    return {
      success: true,
      userId: updatedUser.id,
      user: {
        email: updatedUser.email,
        name: updatedUser.name,
        roles: updatedUser.roles.map(r => r.role.name),
        adminContractorId: updatedUser.adminContractorId // Agregamos esto
      }
    };

  } catch (error) {
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
