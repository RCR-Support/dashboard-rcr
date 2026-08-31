'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { hasActionPermission } from '@/config/action-permissions';
import { RoleEnum } from '@prisma/client';
import {
  sendApplicationApprovedByACEmail,
  sendApplicationRejectedByACEmail,
} from '@/lib/email/postmark';
import {
  notifyUserOnApproval,
  notifyUserOnRejection,
  notifySheqOnAcApproval,
} from '@/actions/notifications/create-notification';
import { getReviewAccessError } from '@/lib/applications/review-access';

export async function approveApplicationAC(
  applicationId: string,
  _userAcId: string, // deprecated: se usa session.user.id
  sheqUserId: string
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
        },
        contract: {
          select: { useracId: true }
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
      stage: 'ac',
    });
    if (accessError) {
      return { success: false, message: accessError };
    }

    // Contar documentos por estado
    const pendingDocs = application.documentationFiles.filter(doc => 
      !doc.approvalStatus || doc.approvalStatus === 'pending'
    );
    const rejectedDocs = application.documentationFiles.filter(doc => 
      doc.approvalStatus === 'rejected'
    );

    if (pendingDocs.length > 0) {
      return { 
        success: false, 
        message: `Aún hay ${pendingDocs.length} documento(s) sin revisar. Debes aprobar o rechazar todos los documentos antes de aprobar la solicitud.` 
      };
    }

    if (rejectedDocs.length > 0) {
      return { 
        success: false, 
        message: `Hay ${rejectedDocs.length} documento(s) rechazado(s). No puedes aprobar una solicitud con documentos rechazados.` 
      };
    }

    const isAdminActing = userRoles.includes(RoleEnum.admin) && !userRoles.includes(RoleEnum.adminContractor);

    await db.$transaction(async (tx) => {
      // Actualizar estado de la aplicación
      await tx.application.update({
        where: { id: applicationId },
        data: {
          stateAc: 'aprobado',
          userSheqId: sheqUserId,
          ...(isAdminActing && application.contract?.useracId
            ? { userAcId: application.contract.useracId }
            : {}),
        },
      });

      // Resetear estados de documentos para que SHEQ los revise desde cero
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
      await tx.applicationAudit.create({
        data: {
          applicationId,
          action: 'APROBACION',
          changedById: session.user.id,
          details: isAdminActing
            ? 'Aprobado por Admin (en representación de Admin Contractor) - Todos los documentos aprobados'
            : 'Aprobado por Admin Contractor - Todos los documentos aprobados',
        },
      });
    });

    // Enviar email al usuario (fuera de la transacción, no bloquea)
    try {
      await sendApplicationApprovedByACEmail(applicationId, session.user.email ?? undefined);
    } catch (err) {
      console.error('[EMAIL ERROR] approve-reject-ac aprobación:', err);
    }

    // Notificar al usuario dueño y al SHEQ asignado
    notifyUserOnApproval(applicationId, 'ac').catch(err =>
      console.error('[NOTIFY ERROR] approveAC notifyUser:', err)
    );
    notifySheqOnAcApproval(applicationId, sheqUserId).catch(err =>
      console.error('[NOTIFY ERROR] approveAC notifySheq:', err)
    );

    revalidatePath('/dashboard/applications');
    return { success: true, message: 'Solicitud aprobada correctamente' };
  } catch {
    return { success: false, message: 'Error al aprobar la solicitud' };
  }
}

export async function rejectApplicationAC(
  applicationId: string,
  _userAcId: string, // deprecated: se usa session.user.id
  observations: string
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
      select: { stateAc: true, userAcId: true },
    });

    if (!application) {
      return { success: false, message: 'Solicitud no encontrada' };
    }

    const accessError = getReviewAccessError({
      application: { ...application, stateSheq: 'pendiente', userSheqId: null },
      roles: userRoles,
      userId: session.user.id,
      stage: 'ac',
    });
    if (accessError) {
      return { success: false, message: accessError };
    }

    await db.$transaction(async (tx) => {
      // Actualizar estado de la aplicación
      await tx.application.update({
        where: { id: applicationId },
        data: {
          stateAc: 'adjuntar',
          processStatus: 'rechazado',
        },
      });

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
      const isAdminActing = userRoles.includes(RoleEnum.admin) && !userRoles.includes(RoleEnum.adminContractor);
      await tx.applicationAudit.create({
        data: {
          applicationId,
          action: 'RECHAZO',
          changedById: session.user.id,
          details: isAdminActing
            ? `Rechazado por Admin (en representación de Admin Contractor): ${observations}`
            : observations,
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

    // Enviar email al usuario (fuera de la transacción, no bloquea)
    try {
      await sendApplicationRejectedByACEmail(applicationId, observations, rejectedDocNames, session.user.email ?? undefined);
    } catch (err) {
      console.error('[EMAIL ERROR] approve-reject-ac rechazo:', err);
    }

    // Notificar al usuario dueño
    notifyUserOnRejection(applicationId, observations, 'ac').catch(err =>
      console.error('[NOTIFY ERROR] rejectAC notifyUser:', err)
    );

    revalidatePath('/dashboard/applications');
    return { success: true, message: 'Solicitud rechazada correctamente' };
  } catch {
    return { success: false, message: 'Error al rechazar la solicitud' };
  }
}