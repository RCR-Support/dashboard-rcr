'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { hasActionPermission } from '@/config/action-permissions';
import { RoleEnum } from '@prisma/client';

export async function listApprovedApplications() {
  try {
    const session = await auth();
    if (!session?.user) {
      return { ok: false, error: 'No autenticado' };
    }

    const userRoles = session.user.roles as RoleEnum[];
    const canView = hasActionPermission('credentials:view:approved', userRoles);

    if (!canView) {
      return { ok: false, error: 'No tienes permiso para ver credenciales' };
    }

    const applications = await db.application.findMany({
      where: {
        stateAc: 'aprobado',
        stateSheq: 'aprobado',
      },
      select: {
        id: true,
        workerName: true,
        workerPaternal: true,
        workerMaternal: true,
        workerRun: true,
        displayWorkerName: true,
        status: true,
        license: true,
        licenseExpiration: true,
        createdAt: true,
        updatedAt: true,
        company: {
          select: {
            name: true,
            rut: true,
          },
        },
        contract: {
          select: {
            contractNumber: true,
            contractName: true,
            initialDate: true,
            finalDate: true,
          },
        },
        activities: {
          select: {
            name: true,
          },
        },
        zones: {
          select: {
            name: true,
          },
        },
        documentationFiles: {
          select: {
            url: true,
            type: true,
            documentationId: true,
          },
        },
        qr: {
          select: {
            token: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return { ok: true, applications };
  } catch {
    return { ok: false, error: 'Error al listar solicitudes aprobadas' };
  }
}
