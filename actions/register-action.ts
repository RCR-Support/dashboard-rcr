"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/zod";
import { z } from "zod";
import { RoleEnum, Prisma } from "@prisma/client";
import { EditActionInput, RegisterActionInput } from "@/interfaces/action.interface";
import { v2 as cloudinary } from 'cloudinary';

// Configurar Cloudinary con las credenciales del .env
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const registerAction = async (inputData: RegisterActionInput, formData: FormData) => {
  try {
    const values = inputData;

    // Validación del schema
    const parsed = registerSchema.safeParse(values);
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

    // Verificar si el email o run ya existe
    const userExists = await db.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          { run: data.run }
        ]
      }
    });

    if (userExists) {
      return {
        error: "El correo o RUN ya está registrado",
        field: userExists.email === data.email ? "email" : "run"
      };
    }

    // Preparar datos de creación
    const createData: Prisma.UserCreateInput = {
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
      roles: {
        create: data.roles.map(role => ({
          role: {
            connect: { name: role as RoleEnum }
          }
        }))
      }
    };

    // Procesar la imagen si existe
    const imageFile = formData.get('image') as File;
    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64Image = `data:${imageFile.type};base64,${buffer.toString('base64')}`;

      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
          base64Image,
          {
            folder: 'user-profiles',
            public_id: `user-${Date.now()}`,
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

      createData.image = (uploadResult as any).secure_url;
    }

    // Crear usuario
    const newUser = await db.user.create({
      data: createData,
      include: {
        company: true,
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    return {
      success: true,
      userId: newUser.id,
      user: {
        email: newUser.email,
        name: newUser.name,
        image: newUser.image,
        roles: newUser.roles.map(r => r.role.name)
      }
    };

  } catch (error) {
    console.error("Error en registerAction:", error);
    return {
      error: "Error interno del servidor",
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    };
  }
};
