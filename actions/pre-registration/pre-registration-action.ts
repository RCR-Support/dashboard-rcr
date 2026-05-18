'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import { Prisma, RoleEnum } from '@prisma/client';
import { sendPreRegistrationEmails } from '@/lib/email/postmark';
import { revalidatePath } from 'next/cache';

async function notifyAdminsNewPreRegister(displayName: string, companyName: string) {
  try {
    const adminRoles = await db.userRole.findMany({
      where: { role: { name: 'admin' } },
      select: { userId: true },
    });
    if (adminRoles.length === 0) return;
    await db.notification.createMany({
      data: adminRoles.map(({ userId }) => ({
        userId,
        type: 'NEW_USER',
        title: 'Nuevo pre-registro pendiente',
        message: `${displayName} de ${companyName} solicitó pre-registro y está esperando aprobación.`,
        actionUrl: '/dashboard/users',
      })),
    });
  } catch (err) {
    console.error('[pre-register] Error creando notificaciones:', err);
  }
}

// 1. Esquema de validación para el pre-registro
const preRegisterSchema = z
  .object({
    companyId: z.string().optional(),
    // Datos de la Empresa (solo requeridos si NO hay companyId)
    companyName: z
      .string()
      .min(3, 'El nombre de la empresa es requerido')
      .optional()
      .or(z.literal('')),
    companyRut: z
      .string()
      .min(8, 'El RUT de la empresa es requerido')
      .optional()
      .or(z.literal('')),
    companyPhone: z.string().optional().or(z.literal('')),
    companyCity: z.string().optional().or(z.literal('')),
    companyUrl: z.string().url('URL inválida').optional().or(z.literal('')),

    // Datos del Usuario
    userEmail: z.string().email('Email inválido'),
    userRun: z.string().min(8, 'El RUN debe tener al menos 10 caracteres'),
    userName: z.string().min(1, 'El nombre es requerido'),
    userLastName: z.string().min(1, 'El apellido paterno es requerido'),
    userMiddleName: z.string().optional(),
    userSecondLastName: z.string().optional(),
    userPhoneNumber: z.string().min(9, 'El teléfono es requerido'),
    displayName: z.string().optional(),

    // Datos del Contrato (opcionales cuando isSubcontract = true)
    isSubcontract: z.boolean().optional(),
    contractNumber: z.string().optional().or(z.literal('')),
    contractName: z.string().optional().or(z.literal('')),
    initialDate: z.coerce.date().optional(),
    finalDate: z.coerce.date().optional(),
    adminContractorId: z.string().optional().or(z.literal('')),
  })
  .superRefine((data, ctx) => {
    // Solo validar datos de empresa si NO hay companyId
    if (!data.companyId) {
      if (!data.companyName || data.companyName.trim().length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['companyName'],
          message: 'El nombre de la empresa es requerido',
        });
      }
      if (!data.companyRut || data.companyRut.trim().length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['companyRut'],
          message: 'El RUT de la empresa debe tener al menos 8 caracteres',
        });
      }
      // Solo validar URL si está presente
      if (
        data.companyUrl &&
        data.companyUrl !== '' &&
        !/^https?:\/\//.test(data.companyUrl)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['companyUrl'],
          message: 'URL inválida',
        });
      }
    }
    // Si NO es sub-contratista, los datos de contrato son obligatorios
    if (!data.isSubcontract) {
      if (!data.contractNumber || data.contractNumber.trim().length < 1) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['contractNumber'], message: 'El número de contrato es requerido' });
      }
      if (!data.contractName || data.contractName.trim().length < 3) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['contractName'], message: 'El nombre del contrato es requerido' });
      }
      if (!data.initialDate) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['initialDate'], message: 'La fecha de inicio es requerida' });
      }
      if (!data.finalDate) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['finalDate'], message: 'La fecha de término es requerida' });
      }
      if (!data.adminContractorId || data.adminContractorId.trim().length < 1) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['adminContractorId'], message: 'Debe seleccionar un administrador de contrato' });
      }
    }
  });

export const preRegisterAction = async (values: unknown) => {
  try {
    // 1. Parseo general para obtener companyId
    const parsedGeneral = preRegisterSchema.safeParse(values);
    if (!parsedGeneral.success) {
      return {
        error: 'Datos inválidos',
        validationErrors: parsedGeneral.error.errors.map(error => ({
          path: error.path.join('.'),
          message: error.message,
        })),
      };
    }
    const data = parsedGeneral.data;
    const isEmpresaExistente = !!data.companyId && data.companyId !== '';
    const isSubcontract = !!data.isSubcontract;

    // Validación condicional de campos de empresa
    if (!isEmpresaExistente) {
      // Si NO hay companyId, validar que los campos de empresa estén presentes
      if (!data.companyName || !data.companyRut) {
        return { error: 'Debe completar los datos de la empresa' };
      }
    }

    // Validaciones de unicidad
    if (!isEmpresaExistente) {
      // Si se va a crear empresa nueva, validar que no exista ese RUT
      const companyExists = await db.company.findFirst({
        where: { rut: data.companyRut },
      });
      if (companyExists) {
        return { error: 'El RUT de la empresa ya está registrado' };
      }
    }
    // Validar usuario único (siempre)
    const generatedUserName = `${data.userName.charAt(0).toLowerCase()}${data.userLastName.toLowerCase()}`;
    const userExists = await db.user.findFirst({
      where: {
        OR: [
          { email: data.userEmail },
          { run: data.userRun },
          { userName: generatedUserName },
        ],
      },
      select: { email: true, run: true, userName: true },
    });
    if (userExists) {
      if (userExists.email === data.userEmail)
        return { error: 'El email ya está registrado en el sistema.' };
      if (userExists.run === data.userRun)
        return { error: 'El RUN ya está registrado en el sistema.' };
      return {
        error:
          'Ya existe un usuario con un nombre de usuario similar. Por favor contacte al administrador.',
      };
    }
    // Validar contrato único (solo si NO es sub-contratista)
    if (!isSubcontract) {
      const contractExists = await db.contract.findFirst({
        where: { contractNumber: data.contractNumber },
      });
      if (contractExists) {
        return { error: 'El número de contrato ya existe' };
      }
    }

    // 2. Lógica principal según si es empresa existente o nueva
    if (isEmpresaExistente) {
      // --- FLUJO: Asociar a empresa existente ---
      if (!data.companyId) {
        return { error: 'Debe seleccionar una empresa válida' };
      }
      const company = await db.company.findUnique({
        where: { id: data.companyId },
      });
      if (!company) {
        return { error: 'La empresa seleccionada no existe' };
      }
      // Crear usuario y contrato en transacción para evitar datos huérfanos
      const companyId = data.companyId!;
      const existingCompany = await db.company.findUnique({ where: { id: companyId }, select: { name: true } });
      await db.$transaction(async (prisma) => {
        await prisma.user.create({
          data: {
            email: data.userEmail,
            run: data.userRun,
            name: data.userName,
            lastName: data.userLastName,
            middleName: data.userMiddleName,
            secondLastName: data.userSecondLastName,
            displayName:
              data.displayName && data.displayName.trim() !== ''
                ? data.displayName
                : `${data.userName} ${data.userLastName}`.trim(),
            userName: `${data.userName.charAt(0).toLowerCase()}${data.userLastName.toLowerCase()}`,
            phoneNumber: data.userPhoneNumber,
            category: 'default',
            isActive: false,
            companyId: companyId,
            roles: {
              create: [
                {
                  role: {
                    connect: { name: RoleEnum.user },
                  },
                },
              ],
            },
          },
        });
        // Solo crear contrato si NO es sub-contratista
        if (!isSubcontract && data.contractNumber && data.contractName && data.initialDate && data.finalDate && data.adminContractorId) {
          await prisma.contract.create({
            data: {
              contractNumber: data.contractNumber,
              contractName: data.contractName,
              initialDate: data.initialDate,
              finalDate: data.finalDate,
              companyId: companyId,
              useracId: data.adminContractorId,
            },
          });
        }
      });
      // Enviar correos (sin bloquear respuesta si fallan)
      try {
        await sendPreRegistrationEmails({
          userEmail: data.userEmail,
          userName: data.userName,
          userLastName: data.userLastName,
          userRun: data.userRun,
          companyName: existingCompany?.name ?? companyId,
          contractNumber: data.contractNumber ?? '',
          contractName: data.contractName ?? '',
          initialDate: data.initialDate ?? new Date(),
          finalDate: data.finalDate ?? new Date(),
          adminContractorId: data.adminContractorId ?? '',
          isSubcontract,
        });
      } catch (emailError) {
        console.error('[pre-register] Error enviando correos:', emailError);
      }
      const displayName = `${data.userName} ${data.userLastName}`.trim();
      await notifyAdminsNewPreRegister(displayName, existingCompany?.name ?? companyId);
      revalidatePath('/dashboard/users');
      return {
        success: true,
        message:
          'Solicitud de pre-registro enviada correctamente. Un administrador la revisará.',
      };
    } else {
      // --- FLUJO: Crear nueva empresa ---
      if (!data.companyRut || !data.companyName) {
        return { error: 'Debe completar los datos de la empresa' };
      }
      const result = await db.$transaction(async prisma => {
        // Crear Empresa pendiente de aprobación
        const newCompany = await prisma.company.create({
          data: {
            name: data.companyName,
            rut: data.companyRut || '',
            phone: data.companyPhone || '',
            city: data.companyCity,
            url: data.companyUrl,
            status: false, // <-- Marcada como pendiente
          },
        });
        // Crear Usuario (rol user) inactivo
        const newUser = await prisma.user.create({
          data: {
            email: data.userEmail,
            run: data.userRun,
            name: data.userName,
            lastName: data.userLastName,
            middleName: data.userMiddleName,
            secondLastName: data.userSecondLastName,
            displayName:
              data.displayName && data.displayName.trim() !== ''
                ? data.displayName
                : `${data.userName} ${data.userLastName}`.trim(),
            userName: `${data.userName.charAt(0).toLowerCase()}${data.userLastName.toLowerCase()}`,
            phoneNumber: data.userPhoneNumber,
            category: 'default',
            isActive: false, // <-- Inactivo hasta aprobación
            companyId: newCompany.id,
            roles: {
              create: [
                {
                  role: {
                    connect: { name: RoleEnum.user },
                  },
                },
              ],
            },
          },
        });
        // Crear Contrato con el adminContractorId seleccionado (solo si NO es sub-contratista)
        if (!isSubcontract && data.contractNumber && data.contractName && data.initialDate && data.finalDate && data.adminContractorId) {
          await prisma.contract.create({
            data: {
              contractNumber: data.contractNumber,
              contractName: data.contractName,
              initialDate: data.initialDate,
              finalDate: data.finalDate,
              companyId: newCompany.id,
              useracId: data.adminContractorId,
            },
          });
        }
        return { newCompany, newUser };
      });
      // Enviar correos (sin bloquear respuesta si fallan)
      try {
        await sendPreRegistrationEmails({
          userEmail: data.userEmail,
          userName: data.userName,
          userLastName: data.userLastName,
          userRun: data.userRun,
          companyName: data.companyName ?? '',
          contractNumber: data.contractNumber ?? '',
          contractName: data.contractName ?? '',
          initialDate: data.initialDate ?? new Date(),
          finalDate: data.finalDate ?? new Date(),
          adminContractorId: data.adminContractorId ?? '',
          isSubcontract,
        });
      } catch (emailError) {
        console.error('[pre-register] Error enviando correos:', emailError);
      }
      const displayName2 = `${data.userName} ${data.userLastName}`.trim();
      await notifyAdminsNewPreRegister(displayName2, data.companyName ?? '');
      revalidatePath('/dashboard/users');
      return {
        success: true,
        message:
          'Solicitud de pre-registro enviada correctamente. Un administrador la revisará.',
      };
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const target = (error.meta?.target as string[]) || [];
        if (target.includes('rut'))
          return { error: 'El RUT de la empresa ya existe.' };
        if (target.includes('email'))
          return { error: 'El email ya está registrado.' };
        if (target.includes('run'))
          return { error: 'El RUN ya está registrado.' };
        if (target.includes('userName'))
          return {
            error:
              'Ya existe un usuario con un nombre de usuario similar. Por favor contacte al administrador.',
          };
        if (target.includes('contractNumber'))
          return { error: 'El número de contrato ya existe.' };
      }
    }
    return {
      error: 'Error interno del servidor al procesar la solicitud.',
      details:
        process.env.NODE_ENV === 'development'
          ? (error as Error).message
          : undefined,
    };
  }
};
