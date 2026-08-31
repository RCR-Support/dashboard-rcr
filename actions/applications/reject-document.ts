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
    // ✅ VALIDACIÓN 4: Verificar que el documento pertenece a una etapa revisable
    const document = await db.documentationFile.findUnique({
      where: { id: documentId },
      select: {
        approvalStatus: true,
        application: {
          select: {
            stateAc: true,
            stateSheq: true,
            userAcId: true,
            userSheqId: true,
          },
        },
      },
    });

    if (!document?.application) {
      return { success: false, error: 'Documento no encontrado.' };
    }

    if (document.approvalStatus !== null && document.approvalStatus !== 'pending') {
      return { success: false, error: 'El documento ya fue revisado.' };
    }

    const userRoles = session.user.roles as RoleEnum[];
    const isAdmin = userRoles.includes(RoleEnum.admin);
    const isAcStage = document.application.stateAc === 'pendiente';
    const isSheqStage = document.application.stateAc === 'aprobado' && document.application.stateSheq === 'pendiente';

    if (!isAcStage && !isSheqStage) {
      return { success: false, error: 'La solicitud no está en una etapa revisable.' };
    }

    if (!isAdmin) {
      const assignedAc = isAcStage && userRoles.includes(RoleEnum.adminContractor) && document.application.userAcId === session.user.id;
      const assignedSheq = isSheqStage && userRoles.includes(RoleEnum.sheq) && document.application.userSheqId === session.user.id;
      if (!assignedAc && !assignedSheq) {
        return { success: false, error: 'No tienes asignado este documento para revisión.' };
      }
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
