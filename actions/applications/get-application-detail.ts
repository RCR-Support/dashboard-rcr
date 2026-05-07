'use server';

import { db } from '@/lib/db';
import { auth } from '@/auth';
import { hasActionPermission } from '@/config/action-permissions';
import { RoleEnum } from '@prisma/client';

export async function getApplicationDetail(id: string) {
  try {
    const session = await auth();
    if (!session?.user) return { ok: false, error: 'No autenticado' };

    const userRoles = session.user.roles as RoleEnum[];
    const canViewAll = hasActionPermission('applications:view:all', userRoles);
    const canViewAssigned = hasActionPermission('applications:view:assigned', userRoles);
    const canViewOwn = hasActionPermission('applications:view:own', userRoles);

    if (!canViewAll && !canViewAssigned && !canViewOwn) {
      return { ok: false, error: 'No tienes permiso para ver solicitudes' };
    }
    const application = await db.application.findUnique({
      where: { id },
      include: {
        company: true,
        contract: true,
        userAc: true,
        userSheq: true,
        documentationFiles: true,
        audits: {
          orderBy: { changedAt: 'desc' }
        }
      }
    });

    if (!application) {
      return { ok: false, error: 'Solicitud no encontrada' };
    }

    // ✅ VALIDACIÓN: Ownership/assignment check
    if (!canViewAll) {
      const isAssigned = application.userAcId === session.user.id || application.userSheqId === session.user.id;
      const isOwner = application.companyId === session.user.companyId;

      if (canViewAssigned && !isAssigned) {
        return { ok: false, error: 'No tienes acceso a esta solicitud' };
      }
      if (canViewOwn && !isAssigned && !isOwner) {
        return { ok: false, error: 'No tienes acceso a esta solicitud' };
      }
    }

    return { ok: true, application };
  } catch {
    return { ok: false, error: 'Error al obtener detalle' };
  }
}
