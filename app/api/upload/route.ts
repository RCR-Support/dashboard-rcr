import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/actions/shared/cloudinary';
import { auth } from '@/auth';
import { hasActionPermission } from '@/config/action-permissions';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const ALLOWED_FOLDERS = [
  'applications',
  'documents',
  'credentials',
  'applications/documents',
  'applications/credentials',
];

export async function POST(request: NextRequest) {
  try {
    // VALIDACIÓN 1: Autenticación
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // VALIDACIÓN 2: Permiso de subida
    if (!hasActionPermission('files:upload', session.user.roles)) {
      return NextResponse.json({ error: 'No tienes permiso para subir archivos' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'applications';
    
    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      );
    }

    // ✅ VALIDACIÓN 2: Tipo de archivo
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de archivo no permitido. Solo se aceptan: JPG, PNG, WEBP, PDF' },
        { status: 400 }
      );
    }

    // ✅ VALIDACIÓN 3: Tamaño de archivo
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'El archivo excede el tamaño máximo permitido (10MB)' },
        { status: 400 }
      );
    }

    // ✅ VALIDACIÓN 4: Folder permitido
    if (!ALLOWED_FOLDERS.includes(folder)) {
      return NextResponse.json(
        { error: 'Carpeta de destino no permitida' },
        { status: 400 }
      );
    }

    // Convertir archivo a base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Determinar tipo de recurso
    const isPDF = file.type === 'application/pdf';
    const resourceType = isPDF ? 'raw' : 'image';

    // Subir a Cloudinary
    const result = await uploadToCloudinary(base64, folder, resourceType);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Error al subir el archivo' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      publicId: result.publicId,
    });
  } catch {
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
