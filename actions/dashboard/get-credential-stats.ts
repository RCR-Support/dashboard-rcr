'use server';

import { auth } from '@/auth';
import { db, withRetry } from '@/lib/db';
import { hasActionPermission } from '@/config/action-permissions';
import { RoleEnum } from '@prisma/client';

export async function getCredentialStats() {
  try {
    const session = await auth();
    if (!session?.user) {
      return { ok: false, error: 'No autenticado' };
    }

    const userRoles = session.user.roles as RoleEnum[];
    const canView = hasActionPermission('credentials:view:approved', userRoles);

    if (!canView) {
      return { ok: false, error: 'No tienes permiso' };
    }

    const now = new Date();

    const [totalApproved, withQR, expiredCount, recentApproved] = await withRetry(() => Promise.all([
      db.application.count({
        where: { stateAc: 'aprobado', stateSheq: 'aprobado' },
      }),
      db.application.count({
        where: { stateAc: 'aprobado', stateSheq: 'aprobado', qr: { isNot: null } },
      }),
      db.application.count({
        where: {
          stateAc: 'aprobado',
          stateSheq: 'aprobado',
          licenseExpiration: { lt: now },
        },
      }),
      db.application.count({
        where: {
          stateAc: 'aprobado',
          stateSheq: 'aprobado',
          updatedAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
    ]));

    return {
      ok: true,
      stats: {
        totalApproved,
        withQR,
        pendingPrint: totalApproved - withQR,
        expired: expiredCount,
        recentApproved,
      },
    };
  } catch {
    return { ok: false, error: 'Error al obtener estadísticas' };
  }
}
