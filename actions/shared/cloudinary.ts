'use server';

import { v2 as cloudinary } from 'cloudinary';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

/**
 * Sube un archivo a Cloudinary
 * @param fileBuffer Buffer del archivo
 * @param folder Carpeta en Cloudinary
 * @param resourceType Tipo de recurso (image, raw para PDFs)
 */
export async function uploadToCloudinary(
  fileBase64: string,
  folder: string = 'applications',
  resourceType: 'image' | 'raw' = 'image'
): Promise<CloudinaryUploadResult> {
  try {
    const uploadResult = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      cloudinary.uploader.upload(
        fileBase64,
        {
          folder,
          resource_type: resourceType,
          // Optimizaciones para imágenes
          ...(resourceType === 'image' && {
            quality: 'auto:good',
            fetch_format: 'auto',
          }),
        },
        (error, result) => {
          if (error) reject(error);
          else if (result) resolve(result);
          else reject(new Error('No result from Cloudinary'));
        }
      );
    });

    return {
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al subir el archivo',
    };
  }
}
