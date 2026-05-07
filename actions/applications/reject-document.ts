'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { hasActionPermission } from '@/config/action-permissions';
import { RoleEnum } from '@prisma/client';

export async function rejectDocument(
  documentId: string,
  rejectionReason: string
) {
  // ✅ VALIDACIÓN 1: Autenticación
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'No autorizado. Por favor inicia sesión.' };
  }

  // ✅ VALIDACIÓN 2: Permisos de acción
  if (!hasActionPermission('documents:reject', session.user.roles as RoleEnum[])) {
    return { 
      success: false, 
      error: 'No tienes permiso para rechazar documentos.' 
    };
  }

  // ✅ VALIDACIÓN 3: Razón de rechazo obligatoria
  if (!rejectionReason.trim()) {
    return {
      success: false,
      error: 'Debe proporcionar una razón para el rechazo',
    };
  }

  try {
    // ✅ VALIDACIÓN 4: Verificar que el documento existe y está en estado apropiado
    const document = await db.documentationFile.findUnique({
      where: { id: documentId },
      select: { approvalStatus: true },
    });

    if (!document) {
      return { success: false, error: 'Documento no encontrado.' };
    }

    if (document.approvalStatus === 'rejected') {
      return { success: false, error: 'El documento ya está rechazado.' };
    }

    // ✅ Proceder con el rechazo
    await db.documentationFile.update({
      where: { id: documentId },
      data: {
        approvalStatus: 'rejected',
        rejectionReason: rejectionReason,
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
      },
    });

    return { success: true };
  } catch {
    return { success: false, error: 'Error al rechazar documento' };
  }
}
