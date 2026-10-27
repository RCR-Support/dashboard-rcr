'use server';

import { db } from '@/lib/db';
import { auth } from '@/auth';
import { hasActionPermission } from '@/config/action-permissions';

type ActivitiesResult =
  | { ok: true; activities: Awaited<ReturnType<typeof queryActivities>> }
  | { ok: false; error: string };

async function queryActivities() {
  return db.activity.findMany({
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
      zoneDocumentations: {
        select: {
          id: true,
          notes: true,
          quantity: true,
          zone: { select: { id: true, name: true } },
          documentation: { select: { id: true, name: true, acceptedFileType: true } },
        },
      },
    },
  });
}

export async function listActivitiesWithStatus(): Promise<ActivitiesResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: 'Tu sesión no está disponible. Vuelve a iniciar sesión.' };
  if (!hasActionPermission('activities:view', session.user.roles)) {
    console.warn('[activities] Denegada listActivities: usuario sin activities:view', {
      userId: session.user.id,
      roles: session.user.roles,
    });
    return { ok: false, error: 'Tu cuenta no tiene permiso para ver el catálogo de actividades.' };
  }
  try {
    return { ok: true, activities: await queryActivities() };
  } catch (error) {
    console.error('[activities] Error consultando el catálogo', error);
    return { ok: false, error: 'No se pudo cargar el catálogo de actividades. Revisa el log del servidor.' };
  }
}

// Compatibilidad para formularios que consumen solo el arreglo.
export async function listActivities() {
  const result = await listActivitiesWithStatus();
  if (!result.ok) {
    return [];
  }
  return result.activities;
}
