'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { hasActionPermission } from '@/config/action-permissions';
import { RoleEnum } from '@prisma/client';

export async function listContracts() {
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

    // ✅ VALIDACIÓN 2: Determinar qué puede ver
    const canViewAll = hasActionPermission('contracts:view:all', userRoles);
    const canViewAssigned = hasActionPermission('contracts:view:assigned', userRoles);

    if (!canViewAll && !canViewAssigned) {
      return {
        ok: false,
        error: 'No tienes permiso para ver contratos',
      };
    }

    // Estructura base de la query
    const selectQuery = {
      id: true,
      contractNumber: true,
      contractName: true,
      initialDate: true,
      finalDate: true,
      createdAt: true,
      deletedAt: true,
      Company: {
        select: {
          id: true,
          name: true,
          rut: true,
        },
      },
      userAc: {
        select: {
          id: true,
          displayName: true,
          email: true,
        },
      },
      _count: {
        select: {
          application: true,
        },
      },
    };

    // Tipo para los contratos retornados por la query
    type ContractQueryResult = {
      id: string;
      contractNumber: string;
      contractName: string;
      initialDate: Date;
      finalDate: Date;
      createdAt: Date;
      deletedAt: Date | null;
      Company: {
        id: string;
        name: string | null;
        rut: string;
      };
      userAc: {
        id: string;
        displayName: string;
        email: string;
      };
      _count: {
        application: number;
      };
    };

    let contracts: ContractQueryResult[] = [];

    // ✅ FILTRAR SEGÚN PERMISOS
    if (canViewAll) {
      // Admin: ve todos los contratos
      contracts = await db.contract.findMany({
        select: selectQuery,
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else if (canViewAssigned) {
      // AdminContractor: solo ve contratos donde él es el userAc
      contracts = await db.contract.findMany({
        where: {
          useracId: user.id,
        },
        select: selectQuery,
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    // Mapear Company -> company para compatibilidad con la interfaz
    const mappedContracts = contracts.map((contract) => ({
      ...contract,
      company: contract.Company,
    }));

    return {
      ok: true,
      contracts: mappedContracts,
    };
  } catch {
    return {
      ok: false,
      error: 'Error al listar contratos',
    };
  }
}