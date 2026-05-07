import { db } from '@/lib/db';
import { uploadActivityImage } from './cloudinary';
import { auth } from '@/auth';
import { hasActionPermission } from '@/config/action-permissions';

// Crear una nueva actividad con imagen referencial
export async function createActivity(
  name: string,
  imageFile?: File,
  requiredDriverLicense?: string
) {
  const session = await auth();
  if (!session?.user) throw new Error('No autenticado');
  if (!hasActionPermission('activities:create', session.user.roles)) {
    throw new Error('No tienes permiso para crear actividades');
  }

  // Primero crea la actividad sin imagen para obtener el id
  const activity = await db.activity.create({
    data: {
      name,
      requiredDriverLicense,
    },
  });

  // Si hay imagen, subirla a Cloudinary y actualizar el registro
  if (imageFile) {
    const imageUrl = await uploadActivityImage(imageFile, activity.id);
    if (imageUrl) {
      await db.activity.update({
        where: { id: activity.id },
        data: { imageUrl },
      });
      activity.imageUrl = imageUrl;
    }
  }

  return activity;
}
