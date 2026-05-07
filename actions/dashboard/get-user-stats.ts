'use server';

import { db, withRetry } from '@/lib/db';
import { startOfMonth, endOfMonth, addDays } from 'date-fns';

export async function getUserStats(userId: string, companyId: string) {
  try {
    const user = { id: userId, companyId };

    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const upcomingDeadline = addDays(now, 30);

    // Ejecutar queries en paralelo
    const [
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      companyInfo,
      contractsCount,
      contractsExpiringSoon,
      documentsPending,
      recentApplications,
    ] = await withRetry(() => Promise.all([
      // Total de solicitudes de su empresa
      db.application.count({ where: { companyId: user.companyId } }),

      // Pendientes
      db.application.count({ where: { companyId: user.companyId, processStatus: 'pendiente' } }),

      // Aprobadas
      db.application.count({ where: { companyId: user.companyId, processStatus: 'aprobado' } }),

      // Rechazadas (requieren atención)
      db.application.count({ where: { companyId: user.companyId, processStatus: 'rechazado' } }),

      // Información de la empresa
      db.company.findUnique({
        where: { id: user.companyId },
        select: { id: true, name: true, rut: true, phone: true, status: true },
      }),

      // Total de contratos de la empresa
      db.contract.count({ where: { companyId: user.companyId, deletedAt: null } }),

      // Contratos que expiran en los próximos 30 días
      db.contract.count({ where: { companyId: user.companyId, finalDate: { lte: upcomingDeadline }, deletedAt: null } }),

      // Documentos pendientes de revisión para aplicaciones de esta empresa
      db.documentationFile.count({ where: { application: { companyId: user.companyId }, approvalStatus: 'pending' } }),

      // Últimas solicitudes
      db.application.findMany({
        where: { companyId: user.companyId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, workerName: true, workerPaternal: true, processStatus: true, createdAt: true },
      }),
    ]));

    return {
      ok: true,
      stats: {
        totalApplications,
        pendingApplications,
        approvedApplications,
        rejectedApplications,
        company: companyInfo,
        contractsCount,
        contractsExpiringSoon,
        documentsPending,
        recentApplications: recentApplications.map(app => ({
          id: app.id,
          workerName: `${app.workerName} ${app.workerPaternal}`,
          status: app.processStatus,
          createdAt: app.createdAt,
        })),
      },
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Error al obtener estadísticas'
    };
  }
}
