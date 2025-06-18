"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { editSchema } from "@/lib/zod";
import { Prisma, RoleEnum } from "@prisma/client";
import { revalidatePath } from "next/cache";
// Reemplazar las importaciones de sistema de archivos
// import { writeFile } from 'fs/promises';
// import path from 'path';
// Importar el SDK de Cloudinary
import { v2 as cloudinary } from 'cloudinary';

// Configurar Cloudinary con las credenciales del .env
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET
});

export const editAction = async (userId: string, formData: FormData) => {
  try {
    // Extraer y procesar los campos del FormData
    const values: Record<string, any> = {};
    // Convertir FormData a un objeto para validación
    formData.forEach((value, key) => {
      if (key === 'roles') {
        // Los roles vienen como un string de un array en FormData, necesitamos convertirlos
        values[key] = typeof value === 'string' ? [value] : value;
      } else if (key === 'adminContractorId' || key === 'companyId') {
        // Manejar IDs que son opcionales
        values[key] = value === 'undefined' ? undefined : value;
      } else {
        values[key] = value;
      }
    });

    // 1. Validación del schema (excluyendo la imagen por ahora)
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

    // Depuración: Verificar datos enviados
    console.log("Datos enviados:", data);

    // Depuración: Verificar userId y datos enviados
    console.log("userId recibido:", userId);
    console.log("Datos enviados para validación:", data);

    // 2. Verificar si el email o run ya existe (excluyendo el usuario actual)
    const userExists = await db.user.findFirst({
      where: {
        AND: [
          { NOT: { id: userId } }, // Excluir al usuario actual
          {
            OR: [
              { email: data.email },
              { run: data.run }
            ]
          }
        ]
      }
    });

    // Depuración: Verificar resultado de la consulta
    console.log("Resultado de la consulta de duplicados:", userExists);

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

    // 5. Procesar la imagen si existe
    const imageFile = formData.get('image') as File;
    if (imageFile && imageFile.size > 0) {
      try {
        // Eliminar la imagen activa en Cloudinary si existe
        const currentImageUrl = await db.user.findUnique({
          where: { id: userId },
          select: { image: true }
        });

        if (currentImageUrl?.image) {
          const publicId = currentImageUrl.image.split('/').pop()?.split('.')[0];
          if (publicId) {
            await cloudinary.uploader.destroy(`user-profiles/${publicId}`);
          }
        }

        // Convertir la imagen a un formato que Cloudinary pueda procesar
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = `data:${imageFile.type};base64,${buffer.toString('base64')}`;

        // Subir la nueva imagen a Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload(
            base64Image,
            {
              folder: 'user-profiles',
              public_id: `user-${userId}-${Date.now()}`,
              overwrite: true,
              transformation: [
                { width: 400, height: 400, gravity: "face", crop: "fill" }
              ]
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
        });

        // Guardar la URL en el objeto de actualización
        updateData.image = (uploadResult as any).secure_url;
      } catch (uploadError) {
        console.error("Error al subir imagen a Cloudinary:", uploadError);
        return {
          error: "No se pudo subir la imagen. Intente con una imagen más pequeña o en otro formato.",
          details: process.env.NODE_ENV === 'development' ? uploadError : undefined
        };
      }
    }

    // 6. Actualizar roles si han cambiado
    const rolesArray = JSON.parse(formData.get('roles') as string);
    if (rolesArray && Array.isArray(rolesArray)) {
      const roles = await db.role.findMany({
        where: {
          name: {
            in: rolesArray as RoleEnum[]
          }
        }
      });

      if (roles.length === 0) {
        return {
          error: "Los roles seleccionados no son válidos",
          field: "roles"
        };
      }

      // Eliminar roles actuales
      await db.userRole.deleteMany({
        where: { userId }
      });

      // Crear nuevos roles
      const userRoles = roles.map((role) => ({
        userId,
        roleId: role.id
      }));

      await db.userRole.createMany({
        data: userRoles
      });
    }

    // 7. Actualizar usuario
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
        adminContractor: true
      }
    });

    // 8. Retornar éxito con datos actualizados
    revalidatePath('/dashboard/users');
    return {
      success: true,
      userId: updatedUser.id,
      user: {
        email: updatedUser.email,
        name: updatedUser.name,
        image: updatedUser.image,
        roles: updatedUser.roles.map(r => r.role.name),
        adminContractorId: updatedUser.adminContractorId
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
    console.error("Error en editAction:", error);
    return {
      error: "Error interno del servidor",
      details: process.env.NODE_ENV === 'development' ? error : undefined
    };
  }
};
