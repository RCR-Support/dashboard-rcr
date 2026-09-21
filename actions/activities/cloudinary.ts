import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadActivityImage(
  imageFile: File,
  activityId: string
): Promise<string | null> {
  if (!imageFile || imageFile.size === 0) return null;
  const arrayBuffer = await imageFile.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64Image = `data:${imageFile.type};base64,${buffer.toString('base64')}`;
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      base64Image,
      {
        folder: 'activities',
        public_id: `activity-${activityId}`,
        overwrite: true,
        invalidate: true,
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result?.secure_url ?? null);
      }
    );
  });
}

export async function deleteActivityImage(activityId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(`activities/activity-${activityId}`, {
      invalidate: true,
    });
  } catch (error) {
    console.error('Error al eliminar imagen de Cloudinary:', error);
  }
}
