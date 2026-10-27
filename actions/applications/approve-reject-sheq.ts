'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { notifyCredentialOnApproval } from '@/actions/notifications/create-notification';
import { notifyUserOnApproval, notifyUserOnRejection } from '@/actions/notifications/create-notification';
import { auth } from '@/auth';
import { hasActionPermission } from '@/config/action-permissions';
import { RoleEnum } from '@prisma/client';
import {
  sendApplicationApprovedBySHEQEmail,
  sendApplicationRejectedBySHEQEmail,
} from '@/lib/email/postmark';
import { getReviewAccessError } from '@/lib/applications/review-access';
import { getApplicationApprovalError } from '@/lib/applications/document-review';

export async function approveApplicationSHEQ(
  applicationId: string,
  _userSheqId?: string, // deprecated: se usa session.user.id
  crossReviewReason = ''
) {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, message: 'No autenticado' };
    if (!hasActionPermission('documents:approve', session.user.roles)) {
      return { success: false, message: 'No tienes permiso para aprobar solicitudes' };
    }
    const userRoles = session.user.roles as RoleEnum[];
    // Verificar que TODOS los documentos estén aprobados
    const application = await db.application.findUnique({
      where: { id: applicationId },
      include: {
        documentationFiles: {
          where: {
            documentationId: { not: null } // Solo documentos reales, no foto
          }
        }
      }
    });

    if (!application) {
      return { success: false, message: 'Solicitud no encontrada' };
    }

    const accessError = getReviewAccessError({
      application,
      roles: userRoles,
      userId: session.user.id,
      stage: 'sheq',
    });
    if (accessError) {
      return { success: false, message: accessError };
    }

    const isCrossReview = userRoles.includes(RoleEnum.sheq) && application.userSheqId !== session.user.id;
    if (isCrossReview && !crossReviewReason.trim()) {
      return { success: false, message: 'Debes indicar el motivo de la revisión cruzada.' };
    }

    const approvalError = getApplicationApprovalError(application.documentationFiles);
    if (approvalError) {
      return { success: false, message: approvalError };
    }

    await db.$transaction(async (tx) => {
      // Actualizar estado de la aplicación
      const updateResult = await tx.application.updateMany({
        where: { id: applicationId, stateAc: 'aprobado', stateSheq: 'pendiente' },
        data: {
          stateSheq: 'aprobado',
          processStatus: 'aprobado',
        },
      });
      if (updateResult.count !== 1) {
        throw new Error('La solicitud ya fue procesada por otro revisor. Actualiza la página e inténtalo nuevamente.');
      }

      // Registrar en auditoría
      const isAdminActing = userRoles.includes(RoleEnum.admin) && !userRoles.includes(RoleEnum.sheq);
      await tx.applicationAudit.create({
        data: {
          applicationId,
          action: 'APROBACION',
          changedById: session.user.id,
          assignedSheqId: application.userSheqId,
          details: isAdminActing
            ? 'Aprobado por Admin (en representación de SHEQ) - Todos los documentos aprobados'
            : isCrossReview
              ? `Aprobado por SHEQ en revisión cruzada. Motivo: ${crossReviewReason.trim()}`
              : 'Aprobado por SHEQ asignado - Todos los documentos aprobados',
        },
      });
    });

    // Notificar a usuarios credential que hay una nueva credencial lista para imprimir
    await notifyCredentialOnApproval(applicationId);

    // Notificar al usuario dueño que su solicitud fue aprobada
    notifyUserOnApproval(applicationId, 'sheq').catch(err =>
      console.error('[NOTIFY ERROR] approveSHEQ notifyUser:', err)
    );

    // Enviar email al usuario (no bloquea el flujo)
    try {
      await sendApplicationApprovedBySHEQEmail(applicationId, session.user.email ?? undefined);
    } catch (err) {
      console.error('[EMAIL ERROR] approve-reject-sheq aprobación:', err);
    }

    revalidatePath('/dashboard/applications');
    return { success: true, message: 'Solicitud aprobada correctamente' };
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('La solicitud ya fue procesada')) {
      return { success: false, message: error.message };
    }
    return { success: false, message: 'Error al aprobar la solicitud' };
  }
}

export async function rejectApplicationSHEQ(
  applicationId: string,
  _userSheqId: string, // deprecated: se usa session.user.id
  observations: string,
  crossReviewReason = ''
) {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, message: 'No autenticado' };
    if (!hasActionPermission('documents:reject', session.user.roles)) {
      return { success: false, message: 'No tienes permiso para rechazar solicitudes' };
    }
    const userRoles = session.user.roles as RoleEnum[];

    const application = await db.application.findUnique({
      where: { id: applicationId },
      select: { stateAc: true, stateSheq: true, userAcId: true, userSheqId: true },
    });

    if (!application) {
      return { success: false, message: 'Solicitud no encontrada' };
    }

    const accessError = getReviewAccessError({
      application,
      roles: userRoles,
      userId: session.user.id,
      stage: 'sheq',
    });
    if (accessError) {
      return { success: false, message: accessError };
    }

    const isCrossReview = userRoles.includes(RoleEnum.sheq) && application.userSheqId !== session.user.id;
    if (isCrossReview && !crossReviewReason.trim()) {
      return { success: false, message: 'Debes indicar el motivo de la revisión cruzada.' };
    }

    await db.$transaction(async (tx) => {
      // Actualizar estado de la aplicación - reiniciar ciclo
      const updateResult = await tx.application.updateMany({
        where: { id: applicationId, stateAc: 'aprobado', stateSheq: 'pendiente' },
        data: {
          stateSheq: 'rechazado',
          stateAc: 'adjuntar', // Reinicia el ciclo
          processStatus: 'rechazado',
        },
      });
      if (updateResult.count !== 1) {
        throw new Error('La solicitud ya fue procesada por otro revisor. Actualiza la página e inténtalo nuevamente.');
      }

      // NO resetear documentos - mantener estados individuales para modo edición
      // Los documentos aprobados quedan bloqueados (verde)
      // Los documentos rechazados quedan editables (naranja) con su motivo
      // await tx.documentationFile.updateMany({
      //   where: { 
      //     applicationId,
      //     documentationId: { not: null }
      //   },
      //   data: {
      //     approvalStatus: 'pending',
      //     rejectionReason: null,
      //     reviewedBy: null,
      //     reviewedAt: null,
      //   },
      // });

      // Registrar en auditoría
      const isAdminActing = userRoles.includes(RoleEnum.admin) && !userRoles.includes(RoleEnum.sheq);
      await tx.applicationAudit.create({
        data: {
          applicationId,
          action: 'RECHAZO',
          changedById: session.user.id,
          assignedSheqId: application.userSheqId,
          details: isAdminActing
            ? `Rechazado por Admin (en representación de SHEQ): ${observations}`
            : isCrossReview
              ? `Rechazado por SHEQ en revisión cruzada. Motivo: ${crossReviewReason.trim()}. Observaciones: ${observations}`
              : `Rechazado por SHEQ asignado: ${observations}`,
        },
      });
    });

    // Obtener documentos rechazados para el email
    const appForEmail = await db.application.findUnique({
      where: { id: applicationId },
      select: {
        documentationFiles: {
          where: { approvalStatus: 'rejected', documentationId: { not: null } },
          select: { documentation: { select: { name: true } } },
        },
      },
    });
    const rejectedDocNames = appForEmail?.documentationFiles.map(
      d => d.documentation?.name || 'Documento sin nombre'
    ) ?? [];

    // Enviar email al usuario (no bloquea el flujo)
    try {
      await sendApplicationRejectedBySHEQEmail(applicationId, observations, rejectedDocNames, session.user.email ?? undefined);
    } catch (err) {
      console.error('[EMAIL ERROR] approve-reject-sheq rechazo:', err);
    }

    // Notificar al usuario dueño que su solicitud fue rechazada
    notifyUserOnRejection(applicationId, observations, 'sheq').catch(err =>
      console.error('[NOTIFY ERROR] rejectSHEQ notifyUser:', err)
    );

    revalidatePath('/dashboard/applications');
    return { success: true, message: 'Solicitud rechazada correctamente' };
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('La solicitud ya fue procesada')) {
      return { success: false, message: error.message };
    }
    return { success: false, message: 'Error al rechazar la solicitud' };
  }
}