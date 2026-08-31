'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { RoleEnum } from '@prisma/client';

/**
 * Permite al administrador reiniciar el estado de una solicitud a PENDIENTE,
 * como si nunca hubiera sido revisada por el AC o el SHEQ.
 *
 * - stage 'ac'   → Reinicia stateAc a 'pendiente', resetea TODOS los documentos
 * - stage 'sheq' → Mantiene stateAc='aprobado', reinicia stateSheq a 'pendiente', resetea TODOS los documentos
 */
export async function resetApplicationStatus(
  applicationId: string,
  stage: 'ac' | 'sheq'
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, message: 'No autenticado' };
    }

    const userRoles = session.user.roles as RoleEnum[];
    if (!userRoles.includes(RoleEnum.admin)) {
      return { success: false, message: 'Solo el administrador puede reiniciar el estado de una solicitud' };
    }

    const application = await db.application.findUnique({
      where: { id: applicationId },
      select: { id: true, stateAc: true, stateSheq: true, processStatus: true },
    });

    if (!application) {
      return { success: false, message: 'Solicitud no encontrada' };
    }

    // Validaciones de contexto
    if (stage === 'sheq' && application.stateAc !== 'aprobado') {
      return {
        success: false,
        message: 'No se puede reiniciar SHEQ si el AC todavía no ha aprobado la solicitud',
      };
    }

    await db.$transaction(async (tx) => {
      // Actualizar estado de la solicitud según la etapa
      if (stage === 'ac') {
        await tx.application.update({
          where: { id: applicationId },
          data: {
            stateAc: 'pendiente',
            stateSheq: 'pendiente',
            processStatus: 'pendiente',
          },
        });
      } else {
        await tx.application.update({
          where: { id: applicationId },
          data: {
            stateSheq: 'pendiente',
            processStatus: 'pendiente',
          },
        });
      }

      // Reiniciar todos los documentos a 'pending'
      await tx.documentationFile.updateMany({
        where: { applicationId, documentationId: { not: null } },
        data: {
          approvalStatus: 'pending',
          rejectionReason: null,
          reviewedBy: null,
          reviewedAt: null,
        },
      });

      // Registrar en auditoría
      const stageLabel = stage === 'ac' ? 'Admin Contractor' : 'SHEQ';
      await tx.applicationAudit.create({
        data: {
          applicationId,
          action: 'EDICION',
          changedById: session.user.id,
          details: `Estado reiniciado por Admin: etapa ${stageLabel} vuelve a PENDIENTE. Todos los documentos reiniciados para nueva revisión.`,
        },
      });
    });

    revalidatePath(`/dashboard/applications/${applicationId}`);
    const stageLabel = stage === 'ac' ? 'Admin Contractor' : 'SHEQ';
    return {
      success: true,
      message: `Estado de ${stageLabel} reiniciado correctamente. Los documentos quedaron pendientes de revisión.`,
    };
  } catch {
    return { success: false, message: 'Error al reiniciar el estado de la solicitud' };
  }
}
