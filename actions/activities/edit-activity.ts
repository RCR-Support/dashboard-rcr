import { db } from '@/lib/db';
import { uploadActivityImage } from './cloudinary';
import { auth } from '@/auth';
import { hasActionPermission } from '@/config/action-permissions';

// Editar una actividad existente, incluyendo imagen y licencia
export async function editActivity(
  id: string,
  name: string,
  imageFile?: File,
  requiredDriverLicense?: string
) {
  const session = await auth();
  if (!session?.user) throw new Error('No autenticado');
  if (!hasActionPermission('activities:edit', session.user.roles)) {
    throw new Error('No tienes permiso para editar actividades');
  }
  const data: { name: string; requiredDriverLicense?: string; imageUrl?: string } = { name };
  if (requiredDriverLicense !== undefined)
    data.requiredDriverLicense = requiredDriverLicense;

  // Si hay imagen, subirla a Cloudinary
  if (imageFile) {
    const imageUrl = await uploadActivityImage(imageFile, id);
    if (imageUrl) data.imageUrl = imageUrl;
  }

  return await db.activity.update({ where: { id }, data });
}
