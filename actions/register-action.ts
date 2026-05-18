'use server';

import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { registerSchema } from '@/lib/zod';
import { z } from 'zod';
import { RoleEnum, Prisma } from '@prisma/client';
import {
  EditActionInput,
  RegisterActionInput,
} from '@/interfaces/action.interface';
import { v2 as cloudinary } from 'cloudinary';
import { sendWelcomeEmail } from '@/lib/email/postmark';

// Configurar Cloudinary con las credenciales del .env
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const registerAction = async (
  inputData: RegisterActionInput,
  formData: FormData
) => {
  try {
    const values = inputData;

    // Validación del schema
    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) {
      return {
        error: 'Datos inválidos',
        validationErrors: parsed.error.errors.map(error => ({
          path: error.path.join('.'),
          message: error.message,
        })),
      };
    }

    const data = parsed.data;

    // Forzar que `admin` no tenga company ni adminContractor
    if (Array.isArray(data.roles) && data.roles.includes('admin')) {
      data.companyId = undefined;
      // Algunos formularios pueden enviar adminContractorId en edición; evitarlo en registro
      (data as any).adminContractorId = undefined;
    }

    // Verificar si el email o run ya existe
    const userExists = await db.user.findFirst({
      where: {
        OR: [{ email: data.email }, { run: data.run }],
      },
    });

    if (userExists) {
      return {
        error: 'El correo o RUN ya está registrado',
        field: userExists.email === data.email ? 'email' : 'run',
      };
    }

    // Asegurar que los roles existan (evita P2025 si la BD fue reseteada sin seed de roles)
    const requestedRoles = data.roles as RoleEnum[];
    const existingRoles = await db.role.findMany({
      where: { name: { in: requestedRoles } },
      select: { name: true },
    });

    const existingRoleNames = new Set(existingRoles.map(r => r.name));
    const missingRoles = requestedRoles.filter(role => !existingRoleNames.has(role));

    if (missingRoles.length > 0) {
      await db.role.createMany({
        data: missingRoles.map(role => ({ name: role })),
        skipDuplicates: true,
      });
    }

    // Hashear contraseña si existe
    let hashedPassword: string | undefined;
    if (data.password) {
      hashedPassword = await bcrypt.hash(data.password, 10);
    }

    // Preparar datos de creación
    const createData: Prisma.UserCreateInput = {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      middleName: data.middleName,
      lastName: data.lastName,
      secondLastName: data.secondLastName,
      userName: data.userName,
      displayName: `${data.name} ${data.lastName}`,
      run: data.run,
      phoneNumber: data.phoneNumber,
      category: data.category,
      company:
        Array.isArray(data.roles) && data.roles.includes('admin')
          ? undefined
          : data.companyId
          ? {
              connect: {
                id: Array.isArray(data.companyId)
                  ? data.companyId[0]
                  : data.companyId,
              },
            }
          : undefined,
      roles: {
        create: requestedRoles.map(role => ({
          role: {
            connect: { name: role },
          },
        })),
      },
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
              { width: 400, height: 400, gravity: 'face', crop: 'fill' },
            ],
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
            role: true,
          },
        },
      },
    });

    // Enviar correo de bienvenida con credenciales (sin bloquear si falla)
    try {
      await sendWelcomeEmail({
        toEmail: newUser.email!,
        displayName: newUser.displayName || `${newUser.name} ${newUser.lastName}`,
        userName: newUser.userName!,
        password: data.password, // texto plano antes de hashear
        isTemporaryPassword: false,
      });
    } catch (emailError) {
      console.error('[registerAction] Error enviando correo de bienvenida:', emailError);
    }

    return {
      success: true,
      userId: newUser.id,
      user: {
        email: newUser.email,
        name: newUser.name,
        image: newUser.image,
        roles: newUser.roles.map(r => r.role.name),
      },
    };
  } catch (error) {
    console.error('Error en registerAction:', error);
    return {
      error: 'Error interno del servidor',
      details:
        process.env.NODE_ENV === 'development'
          ? (error as Error).message
          : undefined,
    };
  }
};
