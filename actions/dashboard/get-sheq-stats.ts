'use server';

import { db, withRetry } from '@/lib/db';
import { startOfWeek, endOfWeek } from 'date-fns';

export async function getSheqStats(userId: string) {
  try {
    const user = { id: userId };

    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    // Queries para SHEQ (solo solicitudes asignadas)
    const [
      assignedApplications,
      pendingDocuments,
      approvedThisWeek,
      rejectedTotal,
      recentApplications,
    ] = await withRetry(() => Promise.all([
      // Total asignadas a este SHEQ
      db.application.count({
        where: { userSheqId: user.id }
      }),
      
      // Documentos pendientes de aprobación final
      db.documentationFile.count({
        where: {
          application: {
            userSheqId: user.id,
          },
          approvalStatus: 'pending'
        }
      }),
      
      // Aprobadas esta semana
      db.application.count({
        where: {
          userSheqId: user.id,
          processStatus: 'aprobado',
          updatedAt: {
            gte: weekStart,
            lte: weekEnd,
          }
        }
      }),
      
      // Total rechazadas (estadística)
      db.application.count({
        where: {
          userSheqId: user.id,
          processStatus: 'rechazado'
        }
      }),
      
      // Últimas solicitudes asignadas
      db.application.findMany({
        where: { userSheqId: user.id },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          workerName: true,
          workerPaternal: true,
          processStatus: true,
          createdAt: true,
          company: {
            select: {
              name: true,
            }
          }
        }
      }),
    ]));

    return {
      ok: true,
      stats: {
        assignedApplications,
        pendingDocuments,
        approvedThisWeek,
        rejectedTotal,
        recentApplications: recentApplications.map(app => ({
          id: app.id,
          workerName: `${app.workerName} ${app.workerPaternal}`,
          company: app.company?.name || 'Sin empresa',
          status: app.processStatus,
          createdAt: app.createdAt,
        })),
      }
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Error al obtener estadísticas'
    };
  }
}
