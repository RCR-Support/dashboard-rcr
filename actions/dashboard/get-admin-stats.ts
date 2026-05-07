'use server';

import { auth } from '@/auth';
import { db, withRetry } from '@/lib/db';
import { startOfMonth, endOfMonth } from 'date-fns';

export async function getAdminStats() {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return { error: 'No autenticado' };
    }

    const userRoles = session.user.roles || [];
    
    // Verificar que sea admin
    if (!userRoles.includes('admin')) {
      return { error: 'No tienes permiso para ver estas estadísticas' };
    }

    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    // Ejecutar todas las queries en paralelo para mejor performance (con retry por cold start de Supabase)
    const [
      totalApplications,
      pendingApplications,
      approvedThisMonth,
      rejectedApplications,
      totalCompanies,
      activeContracts,
      totalUsers,
      usersByRole,
      recentApplications,
    ] = await withRetry(() => Promise.all([
      // Total de solicitudes
      db.application.count(),
      
      // Solicitudes pendientes
      db.application.count({
        where: { processStatus: 'pendiente' }
      }),
      
      // Aprobadas este mes
      db.application.count({
        where: {
          processStatus: 'aprobado',
          updatedAt: {
            gte: monthStart,
            lte: monthEnd,
          }
        }
      }),
      
      // Solicitudes rechazadas
      db.application.count({
        where: { processStatus: 'rechazado' }
      }),
      
      // Total de empresas activas
      db.company.count({
        where: { status: true }
      }),
      
      // Contratos activos
      db.contract.count({
        where: { deletedAt: null }
      }),
      
      // Total de usuarios
      db.user.count(),
      
      // Usuarios por rol
      db.user.findMany({
        select: {
          roles: {
            select: {
              role: {
                select: { name: true }
              }
            }
          }
        }
      }),
      
      // Últimas 5 solicitudes
      db.application.findMany({
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

    // Contar usuarios por rol
    const roleCount = usersByRole.reduce((acc, user) => {
      user.roles.forEach(ur => {
        const roleName = ur.role?.name as string | undefined;
        if (roleName) {
          acc[roleName] = (acc[roleName] || 0) + 1;
        }
      });
      return acc;
    }, {} as Record<string, number>);

    return {
      ok: true,
      stats: {
        totalApplications,
        pendingApplications,
        approvedThisMonth,
        rejectedApplications,
        totalCompanies,
        activeContracts,
        totalUsers,
        roleCount,
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
