'use server';

import { db } from '@/lib/db';
import { Prisma, RoleEnum } from '@prisma/client';
import { sendPreRegistrationEmails } from '@/lib/email/postmark';
import { revalidatePath } from 'next/cache';
import { preRegisterSchema } from '@/lib/validation-pre-registration';
import { hashSubcontractInviteToken } from '@/lib/subcontracts/invite-token';

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

async function notifyMandanteSubcontractRequest(contractId: string, displayName: string, companyName: string) {
  try {
    const contract = await db.contract.findUnique({
      where: { id: contractId },
      select: {
        contractName: true,
        contractNumber: true,
        companyId: true,
        useracId: true,
      },
    });

    if (!contract) return;

    const mandanteUsers = await db.user.findMany({
      where: {
        companyId: contract.companyId,
        isActive: true,
        deletedLogic: false,
        roles: {
          some: {
            role: {
              name: { in: [RoleEnum.user, RoleEnum.adminContractor] },
            },
          },
        },
      },
      select: { id: true },
    });

    const recipientIds = Array.from(new Set([
      contract.useracId,
      ...mandanteUsers.map(user => user.id),
    ]));

    if (recipientIds.length === 0) return;

    await db.notification.createMany({
      data: recipientIds.map(userId => ({
        userId,
        type: 'SUBCONTRACT_REQUEST',
        title: 'Nueva subcontratista pendiente',
        message: `${displayName} de ${companyName} solicitó vincularse al contrato ${contract.contractNumber} - ${contract.contractName}.`,
        actionUrl: '/dashboard/contracts',
      })),
    });
  } catch (err) {
    console.error('[pre-register] Error notificando solicitud de subcontrato:', err);
  }
}

type InvitedSubcontract = Prisma.SubcontractGetPayload<{
  include: {
    subCompany: true;
    contract: true;
  };
}>;

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
    const hasSubcontractInvite = Boolean(data.subcontractId && data.subcontractToken);
    let invitedSubcontract: InvitedSubcontract | null = null;

    if (hasSubcontractInvite && data.subcontractId && data.subcontractToken) {
      invitedSubcontract = await db.subcontract.findFirst({
        where: {
          id: data.subcontractId,
          inviteToken: hashSubcontractInviteToken(data.subcontractToken),
          status: 'pendiente',
          isActive: false,
          OR: [
            { inviteExpiresAt: null },
            { inviteExpiresAt: { gt: new Date() } },
          ],
        },
        include: {
          subCompany: true,
          contract: true,
        },
      });

      if (!invitedSubcontract) {
        return { error: 'La invitación de subcontratista es inválida o expiró.' };
      }

      if (invitedSubcontract.userId) {
        return { error: 'Esta invitación ya fue utilizada por otro usuario.' };
      }
    }

    const isEmpresaExistente = invitedSubcontract
      ? true
      : !!data.companyId && data.companyId !== '';
    const isSubcontract = !!data.isSubcontract;
    const subcontractContractId = !invitedSubcontract && isSubcontract
      ? data.subcontractContractId
      : undefined;

    const subcontractContract = subcontractContractId
      ? await db.contract.findFirst({
          where: { id: subcontractContractId, deletedAt: null },
          select: {
            id: true,
            contractName: true,
            contractNumber: true,
            companyId: true,
          },
        })
      : null;

    if (isSubcontract && !invitedSubcontract && !subcontractContract) {
      return { error: 'Debe seleccionar un contrato mandante válido.' };
    }

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
    const userExists = await db.user.findFirst({
      where: {
        OR: [
          { email: data.userEmail },
          { run: data.userRun },
        ],
      },
      select: { email: true, run: true },
    });
    if (userExists) {
      if (userExists.email === data.userEmail)
        return { error: 'El email ya está registrado en el sistema.' };
      if (userExists.run === data.userRun)
        return { error: 'El RUN ya está registrado en el sistema.' };
    }
    // Generar userName único usando RUN como sufijo
    const runDigits = data.userRun.replace(/[^0-9]/g, '').slice(-4);
    const generatedUserName = `${data.userName.charAt(0).toLowerCase()}${data.userLastName.toLowerCase()}${runDigits}`;
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
      if (!data.companyId && !invitedSubcontract) {
        return { error: 'Debe seleccionar una empresa válida' };
      }
      const companyId = invitedSubcontract?.subCompanyId ?? data.companyId!;
      const company = invitedSubcontract?.subCompany ?? await db.company.findUnique({
        where: { id: companyId },
      });
      if (!company) {
        return { error: 'La empresa seleccionada no existe' };
      }
      if (subcontractContract && subcontractContract.companyId === companyId) {
        return { error: 'La empresa subcontratista no puede ser la misma empresa mandante del contrato.' };
      }
      if (subcontractContract) {
        const existingSubcontract = await db.subcontract.findUnique({
          where: {
            contractId_subCompanyId: {
              contractId: subcontractContract.id,
              subCompanyId: companyId,
            },
          },
          select: { status: true },
        });

        if (existingSubcontract) {
          return { error: 'Esta empresa ya tiene una solicitud o vínculo registrado para el contrato seleccionado.' };
        }
      }
      // Crear usuario y contrato en transacción para evitar datos huérfanos
      const existingCompany = { name: company.name };
      await db.$transaction(async (prisma) => {
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

        if (invitedSubcontract) {
          await prisma.subcontract.update({
            where: { id: invitedSubcontract.id },
            data: {
              userId: newUser.id,
              representativeEmail: data.userEmail.trim().toLowerCase(),
              inviteAcceptedAt: new Date(),
            },
          });
        }

        if (!invitedSubcontract && isSubcontract && subcontractContract) {
          await prisma.subcontract.create({
            data: {
              contractId: subcontractContract.id,
              subCompanyId: companyId,
              userId: newUser.id,
              representativeEmail: data.userEmail.trim().toLowerCase(),
              inviteAcceptedAt: new Date(),
              status: 'pendiente',
              isActive: false,
            },
          });
        }

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
          contractNumber: subcontractContract?.contractNumber ?? data.contractNumber ?? '',
          contractName: subcontractContract?.contractName ?? data.contractName ?? '',
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
      if (subcontractContract) {
        await notifyMandanteSubcontractRequest(subcontractContract.id, displayName, existingCompany?.name ?? companyId);
      }
      revalidatePath('/dashboard/users');
      revalidatePath('/dashboard/admin/subcontracts');
      revalidatePath('/dashboard/contracts');
      revalidatePath('/dashboard/companies');
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
      if (isSubcontract && subcontractContract) {
        const existingCompanyForSubcontract = await db.company.findUnique({
          where: { rut: data.companyRut },
          select: { id: true },
        });

        if (existingCompanyForSubcontract) {
          const existingSubcontract = await db.subcontract.findUnique({
            where: {
              contractId_subCompanyId: {
                contractId: subcontractContract.id,
                subCompanyId: existingCompanyForSubcontract.id,
              },
            },
            select: { status: true },
          });

          if (existingSubcontract) {
            return { error: 'Esta empresa ya tiene una solicitud o vínculo registrado para el contrato seleccionado.' };
          }
        }
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

        if (isSubcontract && subcontractContract) {
          if (subcontractContract.companyId === newCompany.id) {
            throw new Error('La empresa subcontratista no puede ser la misma empresa mandante del contrato.');
          }

          await prisma.subcontract.create({
            data: {
              contractId: subcontractContract.id,
              subCompanyId: newCompany.id,
              userId: newUser.id,
              representativeEmail: data.userEmail.trim().toLowerCase(),
              inviteAcceptedAt: new Date(),
              status: 'pendiente',
              isActive: false,
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
          contractNumber: subcontractContract?.contractNumber ?? data.contractNumber ?? '',
          contractName: subcontractContract?.contractName ?? data.contractName ?? '',
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
      if (subcontractContract) {
        await notifyMandanteSubcontractRequest(subcontractContract.id, displayName2, data.companyName ?? '');
      }
      revalidatePath('/dashboard/users');
      revalidatePath('/dashboard/admin/subcontracts');
      revalidatePath('/dashboard/contracts');
      revalidatePath('/dashboard/companies');
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
