'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { hasActionPermission } from '@/config/action-permissions';

export interface ActivityZoneDocumentationInput {
  zoneId: string;
  documentationId: string;
  notes?: string;
}

export async function updateActivityZoneDocumentations(
  activityId: string,
  requirements: ActivityZoneDocumentationInput[]
) {
  const session = await auth();
  if (!session?.user) throw new Error('No autenticado');
  if (!hasActionPermission('activities:edit', session.user.roles)) {
    throw new Error('No tienes permiso para editar actividades');
  }

  const uniqueKeys = new Set(requirements.map(item => `${item.zoneId}:${item.documentationId}`));
  if (uniqueKeys.size !== requirements.length) {
    throw new Error('Hay requisitos de documento duplicados para la misma zona.');
  }

  const [activity, zoneCount, documentationCount] = await Promise.all([
    db.activity.findUnique({ where: { id: activityId }, select: { id: true } }),
    db.zone.count({ where: { id: { in: requirements.map(item => item.zoneId) } } }),
    db.documentation.count({ where: { id: { in: requirements.map(item => item.documentationId) } } }),
  ]);

  if (!activity) throw new Error('Actividad no encontrada');
  if (zoneCount !== new Set(requirements.map(item => item.zoneId)).size) {
    throw new Error('Una o más zonas seleccionadas no existen.');
  }
  if (documentationCount !== new Set(requirements.map(item => item.documentationId)).size) {
    throw new Error('Uno o más documentos seleccionados no existen.');
  }

  await db.$transaction(async tx => {
    await tx.activityZoneDocumentation.deleteMany({ where: { activityId } });
    if (requirements.length > 0) {
      await tx.activityZoneDocumentation.createMany({
        data: requirements.map(item => ({
          activityId,
          zoneId: item.zoneId,
          documentationId: item.documentationId,
          notes: item.notes?.trim() || null,
          quantity: 1,
        })),
      });
    }
  });

  return { success: true };
}
