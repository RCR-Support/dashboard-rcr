'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadAvatarToCloudinary = async (file: File, userId: string): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;

  const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
    cloudinary.uploader.upload(
      base64Image,
      {
        folder: 'user-avatars',
        public_id: `avatar-${userId}-${Date.now()}`,
        overwrite: true,
        transformation: [
          { width: 200, height: 200, crop: 'fill', gravity: 'face', quality: 'auto:best', fetch_format: 'auto' },
        ],
      },
      (error, res) => {
        if (error) reject(error);
        else resolve(res as { secure_url: string });
      }
    );
  });

  return result.secure_url;
};

export interface UpdateProfileResult {
  ok: boolean;
  message?: string;
  imageUrl?: string;
}

export async function updateProfile(
  formData: FormData
): Promise<UpdateProfileResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { ok: false, message: 'No autenticado' };

    const userId = session.user.id;
    const phone = formData.get('phone') as string | null;
    const imageFile = formData.get('image') as File | null;

    // Validar teléfono si viene
    if (phone !== null && phone !== '') {
      if (!/^\d{9}$/.test(phone)) {
        return { ok: false, message: 'El teléfono debe tener 9 dígitos' };
      }
    }

    // Validar tipo de imagen si viene
    if (imageFile && imageFile.size > 0) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
      if (!allowedTypes.includes(imageFile.type)) {
        return { ok: false, message: 'Solo se aceptan imágenes JPG, PNG, WEBP o SVG' };
      }
    }

    const updateData: Record<string, string> = {};

    if (phone !== null && phone !== '') {
      updateData.phoneNumber = phone;
    }

    let imageUrl: string | undefined;
    if (imageFile && imageFile.size > 0) {
      imageUrl = await uploadAvatarToCloudinary(imageFile, userId);
      updateData.image = imageUrl;
    }

    if (Object.keys(updateData).length === 0) {
      return { ok: false, message: 'No hay cambios para guardar' };
    }

    await db.user.update({
      where: { id: userId },
      data: updateData,
    });

    return { ok: true, imageUrl };
  } catch {
    return { ok: false, message: 'Error interno del servidor' };
  }
}
