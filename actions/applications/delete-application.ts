'use server';

import { db } from '@/lib/db';
import { auth } from '@/auth';
import { hasActionPermission } from '@/config/action-permissions';

export async function deleteApplication(applicationId: string) {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: 'No autenticado' };
    if (!hasActionPermission('applications:delete', session.user.roles)) {
      return { success: false, error: 'No tienes permiso para eliminar solicitudes' };
    }
    // Eliminar en orden: primero las tablas dependientes, luego la aplicación
    await db.$transaction(async (tx) => {
      // 1. Eliminar auditoría
      await tx.applicationAudit.deleteMany({
        where: { applicationId },
      });

      // 2. Eliminar QR si existe
      await tx.applicationQR.deleteMany({
        where: { applicationId },
      });

      // 3. Eliminar archivos de documentación
      await tx.documentationFile.deleteMany({
        where: { applicationId },
      });

      // 4. Desconectar relaciones many-to-many (actividades y zonas)
      await tx.application.update({
        where: { id: applicationId },
        data: {
          activities: { set: [] },
          zones: { set: [] },
        },
      });

      // 5. Eliminar la solicitud
      await tx.application.delete({
        where: { id: applicationId },
      });
    });

    return { success: true, message: 'Solicitud eliminada exitosamente' };
  } catch {
    return { success: false, error: 'Error al eliminar la solicitud' };
  }
}
