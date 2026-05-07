'use server';

import { db } from '@/lib/db';
import { auth } from '@/auth';
import { hasActionPermission } from '@/config/action-permissions';
import { Activity } from '@/app/dashboard/activities/interfaces';

export type ListActivitiesResponse = {
  ok: boolean;
  activities?: Activity[];
  error?: string;
};

export async function listActivities() {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, error: 'No autenticado' };
  }
  if (!hasActionPermission('activities:view', session.user.roles)) {
    return { ok: false, error: 'Sin permiso' };
  }

  try {
    const activities = await db.activity.findMany({
      include: {
        requiredDocumentations: {
          include: {
            documentation: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return {
      ok: true,
      activities,
    };
  } catch {
    return {
      ok: false,
      error: 'Error al cargar las actividades',
    };
  }
}
