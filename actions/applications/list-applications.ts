'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { hasActionPermission } from '@/config/action-permissions';
import { RoleEnum } from '@prisma/client';

export async function listApplications(contractId?: string) {
  try {
    // ✅ VALIDACIÓN 1: Autenticación
    const session = await auth();
    if (!session?.user) {
      return {
        ok: false,
        error: 'No autenticado',
      };
    }

    const user = session.user;
    const userRoles = user.roles as RoleEnum[];

    // Filtro opcional por contrato
    const contractFilter = contractId ? { contractId } : {};

    // ✅ VALIDACIÓN 2: Determinar qué puede ver
    const canViewAll = hasActionPermission('applications:view:all', userRoles);
    const canViewAssigned = hasActionPermission('applications:view:assigned', userRoles);
    const canViewOwn = hasActionPermission('applications:view:own', userRoles);

    if (!canViewAll && !canViewAssigned && !canViewOwn) {
      return {
        ok: false,
        error: 'No tienes permiso para ver solicitudes',
      };
    }

    let applications;

    // Estructura base de la query
    const selectQuery = {
      id: true,
      workerName: true,
      workerPaternal: true,
      workerMaternal: true,
      workerRun: true,
      displayWorkerName: true,
      status: true,
      stateAc: true,
      stateSheq: true,
      licenseExpiration: true,
      processStatus: true,
      createdAt: true,
      company: {
        select: {
          name: true,
        },
      },
      contract: {
        select: {
          contractNumber: true,
          contractName: true,
        },
      },
      userAc: {
        select: {
          displayName: true,
          email: true,
        },
      },
      userSheq: {
        select: {
          displayName: true,
          email: true,
        },
      },
      activities: {
        select: {
          name: true,
        },
      },
      documentationFiles: {
        select: {
          url: true,
          type: true,
          documentationId: true,
          expiresAt: true,
        },
      },
    };

    // ✅ FILTRAR SEGÚN PERMISOS
    if (canViewAll) {
      // Admin: ve todas las solicitudes
      applications = await db.application.findMany({
        where: contractFilter,
        select: selectQuery,
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else if (canViewAssigned) {
      // SHEQ y AdminContractor: solo ven solicitudes asignadas a ellos
      applications = await db.application.findMany({
        where: {
          ...contractFilter,
          OR: [
            { userAcId: user.id }, // Asignadas como AdminContractor (AC)
            { userSheqId: user.id }, // Asignadas como SHEQ
          ],
        },
        select: selectQuery,
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else if (canViewOwn) {
      // User (empresas contratistas): ve solicitudes según su rol en el contrato
      if (!user.companyId) {
        return {
          ok: false,
          error: 'Usuario no tiene empresa asignada',
        };
      }

      // 1. Sub-empresas activas donde el usuario es el representante designado
      const repSubcontracts = await db.subcontract.findMany({
        where: {
          userId: user.id,
          isActive: true,
          status: 'activo',
          ...(contractId ? { contractId } : {}),
        },
        select: { contractId: true },
      });
      const repContractIds = repSubcontracts.map(s => s.contractId);

      // 2. Sub-empresas activas vinculadas a contratos de su empresa (como mandante)
      const mandanteSubcontracts = await db.subcontract.findMany({
        where: {
          isActive: true,
          status: 'activo',
          contract: { companyId: user.companyId },
          ...(contractId ? { contractId } : {}),
        },
        select: { subCompanyId: true },
      });
      const subCompanyIds = mandanteSubcontracts.map(s => s.subCompanyId);

      applications = await db.application.findMany({
        where: {
          ...(contractId ? { contractId } : {}),
          OR: [
            // Solicitudes propias de contratos donde la empresa es mandante
            {
              companyId: user.companyId,
              contract: { companyId: user.companyId },
            },
            // Solicitudes de sub-contratos donde el usuario es representante designado
            {
              companyId: user.companyId,
              contractId: { in: repContractIds },
            },
            // Solicitudes de sub-empresas (vista mandante)
            ...(subCompanyIds.length > 0 ? [{
              companyId: { in: subCompanyIds },
              contract: { companyId: user.companyId },
            }] : []),
          ],
        },
        select: selectQuery,
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    return {
      ok: true,
      applications,
    };
  } catch (error) {
    console.error('listApplications failed', error);

    return {
      ok: false,
      error: 'Error al listar solicitudes',
    };
  }
}
