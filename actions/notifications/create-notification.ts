'use server';

import { db } from '@/lib/db';
import { auth } from '@/auth';

// ─── Helpers internos ────────────────────────────────────────────────────────

async function getAppBasic(applicationId: string) {
  return db.application.findUnique({
    where: { id: applicationId },
    select: { displayWorkerName: true, workerRun: true, userId: true, userAcId: true },
  });
}

// ─── Notificaciones de flujo de solicitudes ──────────────────────────────────

/**
 * Notifica al AC asignado cuando se crea una nueva solicitud.
 */
export async function notifyAcOnNewApplication(applicationId: string) {
  try {
    const app = await getAppBasic(applicationId);
    if (!app?.userAcId) return { ok: true, skipped: 'Sin AC asignado' };

    await db.notification.create({
      data: {
        userId: app.userAcId,
        type: 'NEW_APPLICATION',
        title: 'Nueva solicitud pendiente de revisión',
        message: `Se creó una nueva solicitud para ${app.displayWorkerName} (RUN: ${app.workerRun}) en tu contrato.`,
        applicationId,
        actionUrl: `/dashboard/applications/${applicationId}`,
      },
    });
    return { ok: true };
  } catch {
    return { ok: false, error: 'Error al notificar al AC' };
  }
}

/**
 * Notifica al usuario dueño de la solicitud cuando es aprobada (por AC o SHEQ).
 */
export async function notifyUserOnApproval(applicationId: string, stage: 'ac' | 'sheq') {
  try {
    const app = await getAppBasic(applicationId);
    if (!app?.userId) return { ok: true, skipped: 'Sin usuario dueño' };

    const stageLabel = stage === 'ac' ? 'Admin Contractor' : 'SHEQ';

    await db.notification.create({
      data: {
        userId: app.userId,
        type: 'REQUEST_APPROVED',
        title: 'Solicitud aprobada',
        message: `Tu solicitud para ${app.displayWorkerName} (RUN: ${app.workerRun}) fue aprobada por ${stageLabel}.`,
        applicationId,
        actionUrl: `/dashboard/applications/${applicationId}`,
      },
    });
    return { ok: true };
  } catch {
    return { ok: false, error: 'Error al notificar aprobación al usuario' };
  }
}

/**
 * Notifica al usuario dueño de la solicitud cuando es rechazada (por AC o SHEQ).
 */
export async function notifyUserOnRejection(
  applicationId: string,
  observations: string,
  stage: 'ac' | 'sheq'
) {
  try {
    const app = await getAppBasic(applicationId);
    if (!app?.userId) return { ok: true, skipped: 'Sin usuario dueño' };

    const stageLabel = stage === 'ac' ? 'Admin Contractor' : 'SHEQ';

    await db.notification.create({
      data: {
        userId: app.userId,
        type: 'REQUEST_REJECTED',
        title: 'Solicitud rechazada',
        message: `Tu solicitud para ${app.displayWorkerName} (RUN: ${app.workerRun}) fue rechazada por ${stageLabel}. Motivo: ${observations}`,
        applicationId,
        actionUrl: `/dashboard/applications/${applicationId}`,
      },
    });
    return { ok: true };
  } catch {
    return { ok: false, error: 'Error al notificar rechazo al usuario' };
  }
}

/**
 * Notifica al SHEQ asignado cuando el AC aprueba la solicitud y la pasa a revisión SHEQ.
 */
export async function notifySheqOnAcApproval(applicationId: string, sheqUserId: string) {
  try {
    const app = await getAppBasic(applicationId);
    if (!app) return { ok: true, skipped: 'Solicitud no encontrada' };

    await db.notification.create({
      data: {
        userId: sheqUserId,
        type: 'PENDING_DOCUMENTS',
        title: 'Nueva solicitud para revisar',
        message: `La solicitud de ${app.displayWorkerName} (RUN: ${app.workerRun}) fue aprobada por el AC y está lista para tu revisión.`,
        applicationId,
        actionUrl: `/dashboard/applications/${applicationId}`,
      },
    });
    return { ok: true };
  } catch {
    return { ok: false, error: 'Error al notificar al SHEQ' };
  }
}

// ─── Notificaciones existentes ───────────────────────────────────────────────

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
