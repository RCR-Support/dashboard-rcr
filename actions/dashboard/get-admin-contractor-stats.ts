'use server';

import { auth } from '@/auth';
import { db, withRetry } from '@/lib/db';
import { startOfMonth, endOfMonth } from 'date-fns';

export async function getAdminContractorStats() {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return { error: 'No autenticado' };
    }

    const user = session.user;

    const userRoles = user.roles || [];
    if (!userRoles.includes('adminContractor')) {
      return { error: 'No tienes permiso para ver estas estadísticas' };
    }

    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    // Queries para AdminContractor (solo contratos asignados)
    const [
      myContracts,
      applicationsInMyContracts,
      pendingDocuments,
      rejectedApplications,
      approvedThisMonth,
      recentApplications,
    ] = await withRetry(() => Promise.all([
      // Contratos que administro
      db.contract.count({
        where: {
          useracId: user.id,
          deletedAt: null,
        }
      }),
      
      // Total de solicitudes en mis contratos
      db.application.count({
        where: {
          contract: {
            useracId: user.id,
          }
        }
      }),
      
      // Documentos pendientes de aprobar
      db.documentationFile.count({
        where: {
          application: {
            userAcId: user.id,
          },
          approvalStatus: 'pending'
        }
      }),
      
      // Solicitudes rechazadas (requieren atención)
      db.application.count({
        where: {
          userAcId: user.id,
          processStatus: 'rechazado'
        }
      }),
      
      // Aprobadas este mes
      db.application.count({
        where: {
          userAcId: user.id,
          processStatus: 'aprobado',
          updatedAt: {
            gte: monthStart,
            lte: monthEnd,
          }
        }
      }),
      
      // Últimas solicitudes
      db.application.findMany({
        where: { userAcId: user.id },
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
        myContracts,
        applicationsInMyContracts,
        pendingDocuments,
        rejectedApplications,
        approvedThisMonth,
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
