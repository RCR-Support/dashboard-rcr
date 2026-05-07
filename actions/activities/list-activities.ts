'use server';

import { db } from '@/lib/db';
import { auth } from '@/auth';
import { hasActionPermission } from '@/config/action-permissions';

// Listar todas las actividades
export async function listActivities() {
  const session = await auth();
  if (!session?.user) return [];
  if (!hasActionPermission('activities:view', session.user.roles)) {
    return [];
  }
  try {
    return await db.activity.findMany({
      include: {
        requiredDocumentations: {
          select: {
            id: true,
            isSpecific: true,
            notes: true,
            quantity: true,
            documentation: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  } catch {
    return [];
  }
}
