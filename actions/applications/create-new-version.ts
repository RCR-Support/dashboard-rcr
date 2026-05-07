'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { hasActionPermission } from '@/config/action-permissions';
import { RoleEnum, StateAc, StateSheq, ProcessStatus, License } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

interface CreateNewVersionInput {
  originalApplicationId: string;
  contractId: string;
  workerName: string;
  workerPaternal: string;
  workerMaternal: string;
  workerRun: string;
  workerPhoto: string;
  license: string | null;
  activities: string[];
  zones: string[];
  documents: Array<{
    documentationId: string;
    activityId: string | null;
    url: string;
    type: 'IMG' | 'PDF';
    expiresAt: Date | null;
  }>;
}

export async function createNewVersion(input: CreateNewVersionInput) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: 'No autenticado' };
    }

    const userRoles = session.user.roles as RoleEnum[];
    const canEditAny = hasActionPermission('applications:edit:any', userRoles);
    const canEditOwn = hasActionPermission('applications:edit:own', userRoles);

    if (!canEditAny && !canEditOwn) {
      return { success: false, error: 'No tienes permiso para editar solicitudes' };
    }

    // Obtener la solicitud original
    const original = await db.application.findUnique({
      where: { id: input.originalApplicationId },
      include: {
        company: { select: { id: true } },
      },
    });

    if (!original) {
      return { success: false, error: 'Solicitud original no encontrada' };
    }

    // Verificar ownership si no es admin
    if (!canEditAny) {
      const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { companyId: true },
      });
      if (original.company?.id !== user?.companyId) {
        return { success: false, error: 'No puedes editar solicitudes de otra empresa' };
      }
    }

    // Determinar el parentId raíz (siempre apunta a la primera versión)
    // parentId/version/isActive/statusToken pertenecen a la migración de versioning pendiente.
    // Se usan casts para que TypeScript no rechace el build hasta que la migración se aplique.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db_ = db as any;
    const originalAny = original as unknown as Record<string, unknown>;
    const rootParentId = (originalAny.parentId as string | null) || original.id;

    // Obtener la versión más alta existente
    const maxVersion = await db_.application.aggregate({
      where: {
        OR: [
          { id: rootParentId },
          { parentId: rootParentId },
        ],
      },
      _max: { version: true },
    });

    const newVersion = (maxVersion._max.version || 1) + 1;

    // Obtener el contrato para asignar el AdminContractor
    const contract = await db.contract.findUnique({
      where: { id: input.contractId },
      select: { useracId: true, finalDate: true },
    });

    if (!contract) {
      return { success: false, error: 'Contrato no encontrado' };
    }

    // Calcular licenseExpiration
    const dates: Date[] = [];
    if (contract.finalDate) dates.push(new Date(contract.finalDate));
    input.documents.forEach((doc) => {
      if (doc.expiresAt) dates.push(new Date(doc.expiresAt));
    });
    const licenseExpiration = dates.length > 0
      ? new Date(Math.min(...dates.map((d) => d.getTime())))
      : null;

    const displayWorkerName = `${input.workerName} ${input.workerPaternal} ${input.workerMaternal}`.trim();

    // Crear nueva versión en una transacción
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newApplication = await db.$transaction(async (tx: any) => {
      // Verificar que no haya ya una versión en revisión
      const pendingVersion = await tx.application.findFirst({
        where: {
          parentId: rootParentId,
          isActive: false,
          processStatus: { in: ['pendiente', 'enRevision'] },
        },
      });

      if (pendingVersion) {
        throw new Error('Ya existe una versión en revisión. Espera a que sea procesada antes de crear otra.');
      }

      // Crear la nueva solicitud (versión)
      const app = await tx.application.create({
        data: {
          status: 'renovacion',
          processStatus: ProcessStatus.pendiente,
          stateAc: StateAc.pendiente,
          stateSheq: StateSheq.pendiente,
          statusToken: uuidv4(),
          workerName: input.workerName,
          workerPaternal: input.workerPaternal,
          workerMaternal: input.workerMaternal,
          workerRun: input.workerRun,
          displayWorkerName,
          license: input.license ? (input.license as License) : null,
          licenseExpiration,
          companyId: original.companyId,
          contractId: input.contractId,
          userId: session.user.id,
          userAcId: contract.useracId,
          parentId: rootParentId,
          version: newVersion,
          isActive: false, // No activa hasta que sea aprobada
          activities: {
            connect: input.activities.map((id) => ({ id })),
          },
          zones: {
            connect: input.zones.map((id) => ({ id })),
          },
        },
      });

      // Foto del trabajador
      if (input.workerPhoto) {
        await tx.documentationFile.create({
          data: {
            applicationId: app.id,
            url: input.workerPhoto,
            type: 'IMG',
          },
        });
      }

      // Documentos
      const validDocuments = input.documents.filter((doc) => doc.documentationId);
      if (validDocuments.length > 0) {
        await tx.documentationFile.createMany({
          data: validDocuments.map((doc) => ({
            applicationId: app.id,
            documentationId: doc.documentationId,
            activityId: doc.activityId || null,
            url: doc.url,
            type: doc.type,
            expiresAt: doc.expiresAt,
            approvalStatus: 'pending',
          })),
        });
      }

      // Auditoría
      await tx.applicationAudit.create({
        data: {
          applicationId: app.id,
          action: 'CREACION',
          changedById: session.user.id,
          details: `Nueva versión (v${newVersion}) creada a partir de solicitud ${original.id}`,
        },
      });

      return app;
    });

    revalidatePath('/dashboard/applications');
    return {
      success: true,
      applicationId: newApplication.id,
      message: `Nueva versión (v${newVersion}) creada. La credencial actual sigue vigente mientras se revisa.`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al crear nueva versión',
    };
  }
}
