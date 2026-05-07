'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { hasActionPermission } from '@/config/action-permissions';
import { RoleEnum, License } from '@prisma/client';

interface UpdateApplicationInput {
  applicationId: string;
  userId: string; // ID del usuario que edita
  contractId: string;
  workerName: string;
  workerPaternal: string;
  workerMaternal: string;
  workerRun: string;
  workerPhoto: string;
  license: string | null;
  licenseExpiration?: string | null;
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

export async function updateApplication(input: UpdateApplicationInput) {
  try {
    // ✅ VALIDACIÓN 1: Autenticación
    const session = await auth();
    
    if (!session?.user) {
      return { 
        success: false, 
        error: 'No autenticado. Por favor inicia sesión.' 
      };
    }

    // ✅ VALIDACIÓN 2: Permisos de acción
    const canEditAny = hasActionPermission('applications:edit:any', session.user.roles as RoleEnum[]);
    const canEditOwn = hasActionPermission('applications:edit:own', session.user.roles as RoleEnum[]);

    if (!canEditAny && !canEditOwn) {
      return { 
        success: false, 
        error: 'No tienes permiso para editar solicitudes.' 
      };
    }

    // ✅ VALIDACIÓN 3: Obtener solicitud y verificar ownership
    const application = await db.application.findUnique({
      where: { id: input.applicationId },
      include: { 
        company: { select: { id: true } },
      },
    });

    if (!application) {
      return { 
        success: false, 
        error: 'Solicitud no encontrada.' 
      };
    }

    // ✅ VALIDACIÓN 4: Ownership (si no es admin)
    if (!canEditAny) {
      const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { companyId: true },
      });

      const isOwner = application.company?.id === user?.companyId;
      
      if (!isOwner) {
        return { 
          success: false, 
          error: 'No puedes editar solicitudes de otra empresa.' 
        };
      }

      // ✅ VALIDACIÓN 5: Estado (solo puede editar si está rechazada)
      if (application.processStatus !== 'rechazado') {
        return { 
          success: false, 
          error: 'Solo puedes editar solicitudes que han sido rechazadas.' 
        };
      }
    }

    // ✅ Todas las validaciones pasadas - proceder con la actualización
    await db.$transaction(async (tx) => {
      // Obtener el contrato para calcular licenseExpiration
      const contract = await tx.contract.findUnique({
        where: { id: input.contractId },
        select: { useracId: true, finalDate: true },
      });

      if (!contract) {
        throw new Error('Contrato no encontrado');
      }

      // Calcular licenseExpiration
      const dates: Date[] = [];
      if (contract.finalDate) {
        dates.push(new Date(contract.finalDate));
      }

      input.documents.forEach((doc) => {
        if (doc.expiresAt) {
          dates.push(new Date(doc.expiresAt));
        }
      });

      const licenseExpiration =
        dates.length > 0
          ? new Date(Math.min(...dates.map((d) => d.getTime())))
          : null;

      // Eliminar documentos anteriores
      await tx.documentationFile.deleteMany({
        where: { applicationId: input.applicationId },
      });

      // Actualizar aplicación
      await tx.application.update({
        where: { id: input.applicationId },
        data: {
          contractId: input.contractId,
          workerName: input.workerName,
          workerPaternal: input.workerPaternal,
          workerMaternal: input.workerMaternal,
          workerRun: input.workerRun,
          displayWorkerName: `${input.workerName} ${input.workerPaternal} ${input.workerMaternal}`,
          license: input.license ? input.license as License : null,
          licenseExpiration,
          stateAc: 'pendiente', // Reiniciar estado para nueva revisión
          stateSheq: 'pendiente',
          userAcId: contract.useracId,
          activities: {
            set: input.activities.map((id) => ({ id })),
          },
          zones: {
            set: input.zones.map((id) => ({ id })),
          },
        },
      });

      // Crear nuevos documentos
      const documentsToCreate = [
        // Foto del trabajador (solo si existe)
        ...(input.workerPhoto ? [{
          applicationId: input.applicationId,
          url: input.workerPhoto,
          type: 'IMG' as const,
          activityId: null,
          documentationId: null,
          expiresAt: null,
          approvalStatus: 'pending',
        }] : []),
        // Documentos válidos (deben tener documentationId)
        ...input.documents
          .filter(doc => doc.documentationId) // Solo documentos con ID válido
          .map((doc) => ({
            applicationId: input.applicationId,
            activityId: doc.activityId || null,
            documentationId: doc.documentationId!,
            url: doc.url,
            type: doc.type,
            expiresAt: doc.expiresAt,
            approvalStatus: 'pending', // Reiniciar estado para nueva revisión
          })),
      ];

      if (documentsToCreate.length > 0) {
        await tx.documentationFile.createMany({
          data: documentsToCreate,
        });
      }

      // Registrar en auditoría
      await tx.applicationAudit.create({
        data: {
          applicationId: input.applicationId,
          action: 'EDICION',
          changedById: session.user.id,
          details: 'Solicitud editada por el usuario',
        },
      });
    });

    revalidatePath('/dashboard/applications');
    return { success: true, message: 'Solicitud actualizada correctamente' };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error al actualizar la solicitud',
    };
  }
}
