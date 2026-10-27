'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { hasActionPermission } from '@/config/action-permissions';

export async function getActivityZoneDocumentations(activityId: string) {
  const session = await auth();
  if (!session?.user) throw new Error('No autenticado');
  if (!hasActionPermission('activities:view', session.user.roles)) {
    throw new Error('No tienes permiso para ver actividades');
  }

  return db.activityZoneDocumentation.findMany({
    where: { activityId },
    include: {
      zone: { select: { id: true, name: true } },
      documentation: { select: { id: true, name: true } },
    },
    orderBy: [{ zone: { name: 'asc' } }, { documentation: { name: 'asc' } }],
  });
}
