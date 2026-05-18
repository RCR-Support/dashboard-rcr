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
    const canViewCompany = hasActionPermission('contracts:view:company', userRoles);

    if (!canViewAll && !canViewAssigned && !canViewCompany) {
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
      // Sub-empresas vinculadas a este contrato
      subcontracts: {
        where: { isActive: true },
        select: {
          id: true,
          status: true,
          subCompany: {
            select: { id: true, name: true, rut: true },
          },
          user: {
            select: { displayName: true },
          },
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
      subcontracts?: Array<{
        id: string;
        status: string;
        subCompany: { id: string; name: string | null; rut: string };
        user: { displayName: string } | null;
      }>;
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
    } else if (canViewCompany) {
      // User (trabajador): ve los contratos de su empresa (propios + como sub-empresa)
      if (user.companyId) {
        // Contratos propios (mandante)
        const ownContracts = await db.contract.findMany({
          where: { companyId: user.companyId, deletedAt: null },
          select: selectQuery,
          orderBy: { createdAt: 'desc' },
        });

        // Contratos donde su empresa es sub-empresa y el usuario es el representante designado
        const subLinks = await db.subcontract.findMany({
          where: {
            subCompanyId: user.companyId,
            userId: user.id,
            isActive: true,
            contract: { deletedAt: null },
          },
          select: {
            status: true,
            contract: {
              select: {
                ...selectQuery,
                Company: { select: { id: true, name: true, rut: true } },
              },
            },
          },
        });

        const subContracts = subLinks.map(link => ({
          ...link.contract,
          isSubcontract: true as const,
          mandanteName: link.contract.Company?.name ?? null,
        }));

        contracts = [...ownContracts, ...subContracts] as typeof contracts;
      }
    }

    // Mapear Company -> company para compatibilidad con la interfaz
    const mappedContracts = contracts.map((contract) => ({
      ...contract,
      company: contract.Company,
      subcontracts: contract.subcontracts?.map(s => ({
        id: s.id,
        status: s.status,
        subCompany: s.subCompany,
        representativeName: s.user?.displayName ?? null,
      })),
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