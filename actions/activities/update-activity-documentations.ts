'use server';
import { db } from '@/lib/db';
import { auth } from '@/auth';
import { hasActionPermission } from '@/config/action-permissions';

interface DocumentationRequirement {
  documentationId: string;
  isSpecific: boolean;
  notes?: string;
}

export async function updateActivityDocumentations(
  activityId: string,
  documentations: DocumentationRequirement[]
) {
  const session = await auth();
  if (!session?.user) throw new Error('No autenticado');
  if (!hasActionPermission('activities:edit', session.user.roles)) {
    throw new Error('No tienes permiso para editar actividades');
  }

  await db.activityDocumentation.deleteMany({
    where: { activityId },
  });

  const createPromises = documentations.map(doc =>
    db.activityDocumentation.create({
      data: {
        activityId,
        documentationId: doc.documentationId,
        isSpecific: doc.isSpecific,
        notes: doc.notes,
        quantity: 1,
      },
    })
  );

  await Promise.all(createPromises);

  return { success: true };
}
