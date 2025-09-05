import { PrismaClient } from '@prisma/client';
import { uploadActivityImage } from './cloudinary';
const prisma = new PrismaClient();

// Editar una actividad existente, incluyendo imagen y licencia
export async function editActivity(
  id: string,
  name: string,
  imageFile?: File,
  requiredDriverLicense?: string
) {
  let data: any = { name };
  if (requiredDriverLicense !== undefined)
    data.requiredDriverLicense = requiredDriverLicense;

  // Si hay imagen, subirla a Cloudinary
  if (imageFile) {
    const imageUrl = await uploadActivityImage(imageFile, id);
    if (imageUrl) data.imageUrl = imageUrl;
  }

  return await prisma.activity.update({ where: { id }, data });
}
