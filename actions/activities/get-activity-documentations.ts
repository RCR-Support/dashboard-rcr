'use server';
import { db } from '@/lib/db';
import { auth } from '@/auth';
import { hasActionPermission } from '@/config/action-permissions';

export async function getActivityDocumentations(activityId: string) {
  const session = await auth();
  if (!session?.user) throw new Error('No autenticado');
  if (!hasActionPermission('activities:view', session.user.roles)) {
    throw new Error('No tienes permiso para ver actividades');
  }

  return await db.activityDocumentation.findMany({
    where: { activityId },
    include: { documentation: true },
  });
}
