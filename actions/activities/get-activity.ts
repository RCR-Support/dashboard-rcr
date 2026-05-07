import { db } from '@/lib/db';
import { auth } from '@/auth';
import { hasActionPermission } from '@/config/action-permissions';

// Obtener una actividad por ID
export async function getActivityById(id: string) {
  if (!id) throw new Error('ID es obligatorio');
  const session = await auth();
  if (!session?.user) throw new Error('No autenticado');
  if (!hasActionPermission('activities:view', session.user.roles)) {
    throw new Error('No tienes permiso para ver actividades');
  }

  return await db.activity.findUnique({
    where: { id },
    include: {
      requiredDocumentations: {
        include: {
          documentation: true,
        },
      },
    },
  });
}
