'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { hasActionPermission } from '@/config/action-permissions';
import { RoleEnum } from '@prisma/client';

export async function approveDocument(documentId: string) {
  // ✅ VALIDACIÓN 1: Autenticación
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'No autorizado. Por favor inicia sesión.' };
  }

  // ✅ VALIDACIÓN 2: Permisos de acción
  if (!hasActionPermission('documents:approve', session.user.roles as RoleEnum[])) {
    return { 
      success: false, 
      error: 'No tienes permiso para aprobar documentos.' 
    };
  }

  try {
    // ✅ VALIDACIÓN 3: Verificar que el documento existe y está en estado pendiente
    const document = await db.documentationFile.findUnique({
      where: { id: documentId },
      select: { approvalStatus: true },
    });

    if (!document) {
      return { success: false, error: 'Documento no encontrado.' };
    }

    if (document.approvalStatus === 'approved') {
      return { success: false, error: 'El documento ya está aprobado.' };
    }

    // ✅ Proceder con la aprobación
    await db.documentationFile.update({
      where: { id: documentId },
      data: {
        approvalStatus: 'approved',
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
        rejectionReason: null, // Limpiar razón de rechazo si existía
      },
    });

    return { success: true };
  } catch {
    return { success: false, error: 'Error al aprobar documento' };
  }
}
