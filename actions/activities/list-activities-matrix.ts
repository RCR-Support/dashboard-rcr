'use server';

import { db } from '@/lib/db';
import { auth } from '@/auth';
import { hasActionPermission } from '@/config/action-permissions';

export async function listActivitiesForMatrix() {
  const session = await auth();
  if (!session?.user) return { error: 'No autenticado' };
  if (!hasActionPermission('activities:view', session.user.roles)) {
    return { error: 'Sin permiso' };
  }

  const activities = await db.activity.findMany({
    select: {
      id: true,
      name: true,
      requiredDocumentations: {
        select: {
          id: true,
          documentationId: true,
          isSpecific: true,
          quantity: true,
          notes: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  return activities;
}
