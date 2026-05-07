import { db } from '@/lib/db';
import { auth } from '@/auth';
import { hasActionPermission } from '@/config/action-permissions';

// Eliminar una actividad
export async function deleteActivity(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error('No autenticado');
  if (!hasActionPermission('activities:delete', session.user.roles)) {
    throw new Error('No tienes permiso para eliminar actividades');
  }
  return await db.activity.delete({ where: { id } });
}
