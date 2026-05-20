'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { notifyCredentialOnApproval } from '@/actions/notifications/create-notification';
import { auth } from '@/auth';
import { hasActionPermission } from '@/config/action-permissions';
import { RoleEnum } from '@prisma/client';
import {
  sendApplicationApprovedBySHEQEmail,
  sendApplicationRejectedBySHEQEmail,
} from '@/lib/email/postmark';

export async function approveApplicationSHEQ(
  applicationId: string,
  _userSheqId?: string // deprecated: se usa session.user.id
) {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, message: 'No autenticado' };
    if (!hasActionPermission('documents:approve', session.user.roles)) {
      return { success: false, message: 'No tienes permiso para aprobar solicitudes' };
    }
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

    await db.$transaction(async (tx) => {
      // Actualizar estado de la aplicación
      await tx.application.update({
        where: { id: applicationId },
        data: {
          stateSheq: 'aprobado',
          processStatus: 'aprobado',
        },
      });

      // Registrar en auditoría
      const userRoles = session.user.roles as RoleEnum[];
      const isAdminActing = userRoles.includes(RoleEnum.admin) && !userRoles.includes(RoleEnum.sheq);
      await tx.applicationAudit.create({
        data: {
          applicationId,
          action: 'APROBACION',
          changedById: session.user.id,
          details: isAdminActing
            ? 'Aprobado por Admin (en representación de SHEQ) - Todos los documentos aprobados'
            : 'Aprobado por SHEQ - Todos los documentos aprobados',
        },
      });
    });

    // Notificar a usuarios credential que hay una nueva credencial lista para imprimir
    await notifyCredentialOnApproval(applicationId);

    // Enviar email al usuario (no bloquea el flujo)
    try {
      await sendApplicationApprovedBySHEQEmail(applicationId, session.user.email ?? undefined);
    } catch (err) {
      console.error('[EMAIL ERROR] approve-reject-sheq aprobación:', err);
    }

    revalidatePath('/dashboard/applications');
    return { success: true, message: 'Solicitud aprobada correctamente' };
  } catch {
    return { success: false, message: 'Error al aprobar la solicitud' };
  }
}

export async function rejectApplicationSHEQ(
  applicationId: string,
  _userSheqId: string, // deprecated: se usa session.user.id
  observations: string
) {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, message: 'No autenticado' };
    if (!hasActionPermission('documents:reject', session.user.roles)) {
      return { success: false, message: 'No tienes permiso para rechazar solicitudes' };
    }
    await db.$transaction(async (tx) => {
      // Actualizar estado de la aplicación - reiniciar ciclo
      await tx.application.update({
        where: { id: applicationId },
        data: {
          stateSheq: 'rechazado',
          stateAc: 'adjuntar', // Reinicia el ciclo
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
      const userRoles = session.user.roles as RoleEnum[];
      const isAdminActing = userRoles.includes(RoleEnum.admin) && !userRoles.includes(RoleEnum.sheq);
      await tx.applicationAudit.create({
        data: {
          applicationId,
          action: 'RECHAZO',
          changedById: session.user.id,
          details: isAdminActing
            ? `Rechazado por Admin (en representación de SHEQ): ${observations}`
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

    // Enviar email al usuario (no bloquea el flujo)
    try {
      await sendApplicationRejectedBySHEQEmail(applicationId, observations, rejectedDocNames, session.user.email ?? undefined);
    } catch (err) {
      console.error('[EMAIL ERROR] approve-reject-sheq rechazo:', err);
    }

    revalidatePath('/dashboard/applications');
    return { success: true, message: 'Solicitud rechazada correctamente' };
  } catch {
    return { success: false, message: 'Error al rechazar la solicitud' };
  }
}