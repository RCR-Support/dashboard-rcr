'use server';

import { db } from '@/lib/db';
import { auth } from '@/auth';

export async function listRelatedActivities(documentationId: string) {
  try {
    const session = await auth();
    if (!session?.user) return [];

    const { hasActionPermission } = await import('@/config/action-permissions');
    if (!hasActionPermission('activities:view', session.user.roles)) return [];

    const activitiesWithDocumentation = await db.activity.findMany({
      where: {
        requiredDocumentations: {
          some: {
            documentationId: documentationId,
          },
        },
      },
      select: {
        id: true,
        name: true,
        requiredDocumentations: {
          where: {
            documentationId: documentationId,
          },
          select: {
            isSpecific: true,
            notes: true,
            quantity: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return activitiesWithDocumentation;
  } catch (error) {
    throw new Error('Error al listar las actividades relacionadas');
  }
}
