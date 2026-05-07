'use server';

import { db } from '@/lib/db';
import { auth } from '@/auth';
import { hasActionPermission } from '@/config/action-permissions';

export async function getApplicationTimeline(applicationId: string) {
  try {
    const session = await auth();
    if (!session?.user) return { ok: false, error: 'No autenticado' };
    if (!hasActionPermission('audit:view', session.user.roles)) {
      return { ok: false, error: 'No tienes permiso para ver el historial' };
    }
    const audits = await db.applicationAudit.findMany({
      where: { applicationId },
      include: { changedBy: { select: { id: true, displayName: true } } },
      orderBy: { changedAt: 'desc' },
    });

    return { ok: true, audits };
  } catch {
    return { ok: false, error: 'Error al obtener timeline' };
  }
}
