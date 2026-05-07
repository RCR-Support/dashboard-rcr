'use server';

import { db } from '@/lib/db';
import { auth } from '@/auth';
import { hasActionPermission } from '@/config/action-permissions';

export async function getApplicationForEdit(applicationId: string) {
  try {
    const session = await auth();
    if (!session?.user) return { error: 'No autenticado' };
    if (!hasActionPermission('applications:edit:any', session.user.roles) &&
        !hasActionPermission('applications:edit:own', session.user.roles)) {
      return { error: 'No tienes permiso para editar solicitudes' };
    }
    const application = await db.application.findUnique({
      where: { id: applicationId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            rut: true,
          },
        },
        contract: {
          select: {
            id: true,
            contractNumber: true,
            contractName: true,
          },
        },
        activities: {
          select: {
            id: true,
            name: true,
          },
        },
        zones: {
          select: {
            id: true,
            name: true,
          },
        },
        documentationFiles: {
          select: {
            id: true,
            applicationId: true,
            activityId: true,
            documentationId: true,
            url: true,
            type: true,
            expiresAt: true,
            approvalStatus: true,
            rejectionReason: true,
            reviewedBy: true,
            reviewedAt: true,
            documentation: {
              select: {
                id: true,
                name: true,
              },
            },
            activity: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        audits: {
          where: {
            action: 'RECHAZO',
          },
          orderBy: {
            changedAt: 'desc',
          },
          take: 1,
          include: {
            changedBy: {
              select: {
                displayName: true,
              },
            },
          },
        },
      },
    });

    if (!application) {
      return { success: false, message: 'Solicitud no encontrada' };
    }

    // ✅ VALIDACIÓN: Ownership check para edit:own
    if (!hasActionPermission('applications:edit:any', session.user.roles) &&
        hasActionPermission('applications:edit:own', session.user.roles)) {
      if (application.company?.id !== session.user.companyId) {
        return { success: false, message: 'No tienes permiso para editar esta solicitud' };
      }
    }

    return { success: true, data: application };
  } catch {
    return {
      success: false,
      message: 'Error al cargar los datos de la solicitud',
    };
  }
}
