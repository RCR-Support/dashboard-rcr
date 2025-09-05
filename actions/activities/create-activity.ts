import { PrismaClient } from '@prisma/client';
import { uploadActivityImage } from './cloudinary';
const prisma = new PrismaClient();

// Crear una nueva actividad con imagen referencial
export async function createActivity(
  name: string,
  imageFile?: File,
  requiredDriverLicense?: string
) {
  // Primero crea la actividad sin imagen para obtener el id
  const activity = await prisma.activity.create({
    data: {
      name,
      requiredDriverLicense,
    },
  });

  // Si hay imagen, subirla a Cloudinary y actualizar el registro
  if (imageFile) {
    const imageUrl = await uploadActivityImage(imageFile, activity.id);
    if (imageUrl) {
      await prisma.activity.update({
        where: { id: activity.id },
        data: { imageUrl },
      });
      activity.imageUrl = imageUrl;
    }
  }

  return activity;
}
