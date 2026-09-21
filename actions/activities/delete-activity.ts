import { db } from '@/lib/db';
import { auth } from '@/auth';
import { hasActionPermission } from '@/config/action-permissions';
import { deleteActivityImage } from './cloudinary';

// Eliminar una actividad
export async function deleteActivity(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error('No autenticado');
  if (!hasActionPermission('activities:delete', session.user.roles)) {
    throw new Error('No tienes permiso para eliminar actividades');
  }

  // Eliminar la imagen asociada en Cloudinary si existe
  await deleteActivityImage(id);

  return await db.activity.delete({ where: { id } });
}
