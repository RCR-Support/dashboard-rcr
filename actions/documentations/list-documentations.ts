'use server';

import { db } from '@/lib/db';
import { auth } from '@/auth';

export async function listDocumentations() {
  try {
    const session = await auth();
    if (!session?.user) return [];

    const { hasActionPermission } = await import('@/config/action-permissions');
    if (!hasActionPermission('activities:view', session.user.roles)) return [];

    const documentations = await db.documentation.findMany({
      include: {
        activities: {
          select: {
            isSpecific: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return documentations;
  } catch (error) {
    throw new Error('Error al listar las documentaciones');
  }
}
