/**
 * Utilidades para procesar imágenes en el navegador
 */

export interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Crea una imagen recortada a partir de las coordenadas especificadas
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No se pudo crear el contexto del canvas');
  }

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  // Configurar canvas para rotación
  canvas.width = safeArea;
  canvas.height = safeArea;

  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-safeArea / 2, -safeArea / 2);

  // Dibujar imagen rotada
  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5
  );

  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  // Crear canvas del tamaño final
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
  );

  // Convertir a blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (!blob) {
          reject(new Error('Error al crear la imagen'));
          return;
        }
        resolve(blob);
      },
      'image/jpeg',
      0.95
    );
  });
}

/**
 * Redimensiona y comprime una imagen
 */
export async function resizeAndCompressImage(
  blob: Blob,
  maxWidth: number,
  maxHeight: number,
  quality = 0.9
): Promise<Blob> {
  const image = await createImage(URL.createObjectURL(blob));
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No se pudo crear el contexto del canvas');
  }

  // Calcular dimensiones manteniendo aspecto
  let { width, height } = image;

  if (width > height) {
    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }
  } else {
    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }
  }

  canvas.width = width;
  canvas.height = height;

  // Dibujar imagen redimensionada
  ctx.drawImage(image, 0, 0, width, height);

  // Convertir a blob con compresión
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (!blob) {
          reject(new Error('Error al comprimir la imagen'));
          return;
        }
        resolve(blob);
      },
      'image/jpeg',
      quality
    );
  });
}

/**
 * Crea un elemento Image desde una URL
 */
function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', error => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });
}

/**
 * Convierte un Blob a File
 */
export function blobToFile(blob: Blob, fileName: string): File {
  return new File([blob], fileName, {
    type: blob.type,
    lastModified: Date.now(),
  });
}

export { formatFileSize } from './file-utils';
