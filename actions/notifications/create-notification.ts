'use server';

import { db } from '@/lib/db';
import { auth } from '@/auth';

/**
 * Notifica a todos los usuarios con rol 'credential' cuando SHEQ aprueba una solicitud
 */
export async function notifyCredentialOnApproval(applicationId: string) {
  try {
    const session = await auth();
    if (!session?.user) return { ok: false, error: 'No autenticado' };

    // Obtener la aplicación con sus datos
    const application = await db.application.findUnique({
      where: { id: applicationId },
      select: {
        id: true,
        displayWorkerName: true,
        workerRun: true,
      },
    });

    if (!application) {
      return { ok: false, error: 'Solicitud no encontrada' };
    }

    // Obtener todos los usuarios con rol 'credential'
    const credentialUsers = await db.userRole.findMany({
      where: {
        role: {
          name: 'credential',
        },
      },
      select: {
        userId: true,
      },
    });

    if (credentialUsers.length === 0) {
      return { ok: true, message: 'No hay usuarios con rol credential' };
    }

    // Crear notificación para cada usuario credential
    const notifications = await Promise.all(
      credentialUsers.map((ur) =>
        db.notification.create({
          data: {
            userId: ur.userId,
            type: 'CREDENTIAL_READY',
            title: 'Nueva credencial lista para imprimir',
            message: `La solicitud de ${application.displayWorkerName} (RUN: ${application.workerRun}) ha sido aprobada y está lista para generar la credencial.`,
            applicationId: application.id,
            actionUrl: `/dashboard/applications/${application.id}`,
          },
        })
      )
    );

    return { ok: true, notifications };
  } catch (error) {
    return { ok: false, error: 'Error al notificar a credenciales' };
  }
}
