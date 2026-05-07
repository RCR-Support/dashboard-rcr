'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { hasActionPermission } from '@/config/action-permissions';
import { RoleEnum } from '@prisma/client';

export async function getApprovedApplication(applicationId: string) {
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

    const isUserRole = userRoles.includes(RoleEnum.user);

    const application = await db.application.findFirst({
      where: {
        id: applicationId,
        stateAc: 'aprobado',
        stateSheq: 'aprobado',
        // Si es rol user, solo puede ver solicitudes de su empresa
        ...(isUserRole && session.user.companyId
          ? { companyId: session.user.companyId }
          : {}),
      },
      include: {
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
            imageUrl: true,
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
    });

    if (!application) {
      return { ok: false, error: 'Solicitud no encontrada o no está aprobada' };
    }

    // Si no tiene QR, crear uno
    if (!application.qr) {
      const qr = await db.applicationQR.create({
        data: {
          applicationId: application.id,
        },
      });
      return {
        ok: true,
        application: {
          ...application,
          qr: { token: qr.token, isActive: qr.isActive },
        },
      };
    }

    return { ok: true, application };
  } catch {
    return { ok: false, error: 'Error al obtener la solicitud' };
  }
}
