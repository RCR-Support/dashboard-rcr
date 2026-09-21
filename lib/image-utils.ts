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
 * Calcula las dimensiones tras rotar una imagen
 */
function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = (rotation * Math.PI) / 180;
  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
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

  const rotRad = (rotation * Math.PI) / 180;

  // Calcular las dimensiones del bounding box tras la rotación
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  );

  // Configurar el canvas para soportar la rotación sin recortar bordes
  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);

  // Dibujar la imagen rotada
  ctx.drawImage(image, 0, 0);

  // Crear canvas final con las dimensiones exactas del área seleccionada
  const croppedCanvas = document.createElement('canvas');
  const croppedCtx = croppedCanvas.getContext('2d');

  if (!croppedCtx) {
    throw new Error('No se pudo crear el contexto del canvas de recorte');
  }

  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;

  // Extraer el rectángulo exacto seleccionado en el cropper
  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Convertir a blob
  return new Promise((resolve, reject) => {
    croppedCanvas.toBlob(
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
