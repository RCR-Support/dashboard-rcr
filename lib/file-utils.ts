/**
 * Utilidades para validar y procesar archivos antes de subirlos
 */

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  processedFile?: File;
}

/**
 * Valida el tamaño de un archivo
 */
export function validateFileSize(file: File, maxSizeMB: number): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * Valida el número de páginas de un PDF (aproximado por tamaño)
 */
export async function validatePDFPages(file: File): Promise<boolean> {
  // Leer el contenido del PDF como texto
  const text = await file.text();
  // Contar las páginas buscando el patrón /Type /Page
  const pageMatches = text.match(/\/Type[\s]*\/Page[^s]/g);
  const pageCount = pageMatches ? pageMatches.length : 0;
  
  return pageCount <= 2;
}

/**
 * Comprime una imagen manteniendo calidad aceptable
 */
export async function compressImage(
  file: File,
  maxSizeKB: number = 500,
  maxWidth: number = 1200
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Redimensionar si es muy grande
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo obtener el contexto del canvas'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Intentar diferentes calidades hasta alcanzar el tamaño objetivo
        let quality = 0.9;
        const attemptCompress = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Error al comprimir la imagen'));
                return;
              }
              
              const targetSizeBytes = maxSizeKB * 1024;
              
              // Si el tamaño es aceptable o la calidad ya es muy baja, terminar
              if (blob.size <= targetSizeBytes || quality <= 0.5) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                // Reducir calidad y reintentar
                quality -= 0.1;
                attemptCompress();
              }
            },
            'image/jpeg',
            quality
          );
        };
        
        attemptCompress();
      };
      
      img.onerror = () => reject(new Error('Error al cargar la imagen'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsDataURL(file);
  });
}

/**
 * Valida y procesa un archivo según su tipo
 */
export async function validateAndProcessFile(
  file: File,
  acceptedType: 'PDF' | 'IMAGE' | 'DOCUMENT' | 'ANY'
): Promise<FileValidationResult> {
  // Validar tipo de archivo
  const fileType = file.type.toLowerCase();
  const isPDF = fileType === 'application/pdf';
  const isImage = fileType.startsWith('image/');
  
  // Validar según tipo aceptado
  switch (acceptedType) {
    case 'PDF':
      if (!isPDF) {
        return { valid: false, error: 'Solo se aceptan archivos PDF' };
      }
      break;
    case 'IMAGE':
      if (!isImage) {
        return { valid: false, error: 'Solo se aceptan imágenes' };
      }
      break;
    case 'DOCUMENT':
      if (!isPDF && !isImage) {
        return { valid: false, error: 'Solo se aceptan PDFs o imágenes' };
      }
      break;
  }
  
  // Validar y procesar según tipo
  if (isPDF) {
    // Validar tamaño
    if (!validateFileSize(file, 2)) {
      return {
        valid: false,
        error: 'El PDF debe pesar menos de 2MB. Por favor comprímalo.',
      };
    }
    
    // Validar número de páginas
    const validPages = await validatePDFPages(file);
    if (!validPages) {
      return {
        valid: false,
        error: 'El PDF debe tener máximo 2 páginas',
      };
    }
    
    return { valid: true, processedFile: file };
  } else if (isImage) {
    // Comprimir imagen si es necesario
    if (file.size > 500 * 1024) {
      try {
        const compressedFile = await compressImage(file, 500);
        return { valid: true, processedFile: compressedFile };
      } catch (error) {
        return {
          valid: false,
          error: 'Error al comprimir la imagen',
        };
      }
    }
    
    return { valid: true, processedFile: file };
  }
  
  return { valid: true, processedFile: file };
}

/**
 * Formatea el tamaño de archivo en formato legible
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
