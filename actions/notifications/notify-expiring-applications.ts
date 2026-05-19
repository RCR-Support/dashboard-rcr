'use server';

import { db } from '@/lib/db';

/**
 * Busca solicitudes con documentos o licencia próximos a vencer
 * y genera notificaciones para los ACs y SHEQs asignados.
 *
 * Umbrales:
 *  🔴 <= 0 días → "Vencido"
 *  🟡 1–30 días → "Por vencer"
 *
 * Evita duplicados: no crea una segunda notificación si ya existe
 * una no leída del mismo tipo para la misma solicitud en las últimas 24h.
 */
export async function notifyExpiringApplications() {
  const now = new Date();
  const in30Days = new Date(now);
  in30Days.setDate(in30Days.getDate() + 30);

  // Solicitudes con licencia o documentos que vencen en ≤ 30 días
  const applications = await db.application.findMany({
    where: {
      OR: [
        // Por licenseExpiration
        {
          licenseExpiration: {
            lte: in30Days,
          },
        },
        // Por documentos vencidos/próximos a vencer
        {
          documentationFiles: {
            some: {
              documentationId: { not: null },
              expiresAt: {
                lte: in30Days,
              },
            },
          },
        },
      ],
    },
    select: {
      id: true,
      displayWorkerName: true,
      workerRun: true,
      licenseExpiration: true,
      userAcId: true,
      userSheqId: true,
      documentationFiles: {
        where: {
          documentationId: { not: null },
          expiresAt: { not: null },
        },
        select: { expiresAt: true },
      },
    },
  });

  let created = 0;
  let skipped = 0;

  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  for (const app of applications) {
    // Calcular la fecha más próxima
    const dates: Date[] = [];
    if (app.licenseExpiration) dates.push(new Date(app.licenseExpiration));
    for (const f of app.documentationFiles) {
      if (f.expiresAt) dates.push(new Date(f.expiresAt));
    }
    if (dates.length === 0) continue;

    const nearest = dates.reduce((min, d) => (d < min ? d : min));
    const daysLeft = Math.ceil((nearest.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    const isExpired = daysLeft <= 0;
    const isWarning = daysLeft > 0 && daysLeft <= 30;

    if (!isExpired && !isWarning) continue;

    const title = isExpired ? 'Documento vencido' : 'Documento por vencer';
    const message = isExpired
      ? `La solicitud de ${app.displayWorkerName} (RUN: ${app.workerRun}) tiene documentos vencidos.`
      : `La solicitud de ${app.displayWorkerName} (RUN: ${app.workerRun}) vence en ${daysLeft} día${daysLeft === 1 ? '' : 's'}.`;

    const recipientIds = [app.userAcId, app.userSheqId].filter(Boolean) as string[];

    for (const userId of recipientIds) {
      // Evitar duplicado en las últimas 24h
      const existing = await db.notification.findFirst({
        where: {
          userId,
          applicationId: app.id,
          type: 'CONTRACT_EXPIRING',
          read: false,
          createdAt: { gte: oneDayAgo },
        },
        select: { id: true },
      });

      if (existing) {
        skipped++;
        continue;
      }

      await db.notification.create({
        data: {
          userId,
          type: 'CONTRACT_EXPIRING',
          title,
          message,
          applicationId: app.id,
          actionUrl: `/dashboard/applications/${app.id}`,
        },
      });
      created++;
    }
  }

  return { ok: true, processed: applications.length, created, skipped };
}
